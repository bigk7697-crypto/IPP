import { test } from 'node:test';
import assert from 'node:assert';

// Inscription validators - import built files
import {
  ALLOWED_TRANSITIONS,
  decideSchema,
  inscriptionSubmitSchema,
} from '../dist/validators/inscription.js';

test('inscriptionSubmitSchema valid', () => {
  const r = inscriptionSubmitSchema.safeParse({
    first_name: 'Ama',
    last_name: 'Doe',
    birth_date: '2012-05-03',
    email: 'parent@example.com',
    phone: '+228 90 11 22 33',
    parent_name: 'Papa Doe',
    niveau: 'Seconde',
    filiere_slug: 'f2',
    message: '',
  });
  assert.equal(r.success, true);
});

test('inscriptionSubmitSchema email invalid', () => {
  const r = inscriptionSubmitSchema.safeParse({
    first_name: 'Ama',
    last_name: 'Doe',
    email: 'pas-un-email',
    phone: '+22890112233',
    parent_name: 'Papa',
    niveau: 'Seconde',
  });
  assert.equal(r.success, false);
});

test('inscriptionSubmitSchema niveau invalid', () => {
  const r = inscriptionSubmitSchema.safeParse({
    first_name: 'Ama',
    last_name: 'Doe',
    email: 'a@b.cd',
    phone: '+22890112233',
    parent_name: 'Papa',
    niveau: 'Doctorat',
  });
  assert.equal(r.success, false);
});

test('decideSchema convoquer sans date refuse', () => {
  const r = decideSchema.safeParse({ action: 'convoquer' });
  assert.equal(r.success, false);
});

test('decideSchema convoquer avec date ok', () => {
  const r = decideSchema.safeParse({
    action: 'convoquer',
    rendez_vous_at: new Date(Date.now() + 86400000).toISOString(),
    rendez_vous_message: 'Venez avec le dossier complet.',
  });
  assert.equal(r.success, true);
});

test('decideSchema refuser sans motif refuse', () => {
  const r = decideSchema.safeParse({ action: 'refuser' });
  assert.equal(r.success, false);
});

test('ALLOWED_TRANSITIONS refuse terminal', () => {
  assert.deepEqual(ALLOWED_TRANSITIONS.refuse, []);
  assert.deepEqual(ALLOWED_TRANSITIONS.admis, []);
  assert.ok(ALLOWED_TRANSITIONS.soumis.includes('verifie'));
});
