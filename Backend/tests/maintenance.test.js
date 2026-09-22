import { test } from 'node:test';
import assert from 'node:assert';

// Maintenance - import built files
import { INACTIVE_DAYS, isInactive } from '../dist/services/maintenance.js';

const DAY = 24 * 3600 * 1000;
const NOW = new Date('2026-09-22T12:00:00Z').getTime();

test('INACTIVE_DAYS vaut 60', () => {
  assert.equal(INACTIVE_DAYS, 60);
});

test('isInactive faux si connexion recente', () => {
  const last = new Date(NOW - 10 * DAY).toISOString();
  const created = new Date(NOW - 400 * DAY).toISOString();
  assert.equal(isInactive(last, created, NOW), false);
});

test('isInactive vrai si 61 jours sans connexion', () => {
  const last = new Date(NOW - 61 * DAY).toISOString();
  const created = new Date(NOW - 400 * DAY).toISOString();
  assert.equal(isInactive(last, created, NOW), true);
});

test('isInactive limite exacte 60 jours = encore actif', () => {
  const last = new Date(NOW - 60 * DAY + 60000).toISOString();
  const created = new Date(NOW - 400 * DAY).toISOString();
  assert.equal(isInactive(last, created, NOW), false);
});

test('isInactive jamais connecte + vieux compte = inactif', () => {
  const created = new Date(NOW - 90 * DAY).toISOString();
  assert.equal(isInactive(null, created, NOW), true);
});

test('isInactive jamais connecte + compte recent = actif', () => {
  const created = new Date(NOW - 5 * DAY).toISOString();
  assert.equal(isInactive(null, created, NOW), false);
});
