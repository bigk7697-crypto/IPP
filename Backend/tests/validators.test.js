import { test } from 'node:test';
import assert from 'node:assert';

// Validators - import built files
import { newsSchema, newsPatchSchema } from '../dist/validators/news.js';
import { eventSchema } from '../dist/validators/events.js';
import { classSchema } from '../dist/validators/classes.js';
import { documentMetaSchema } from '../dist/validators/documents.js';
import { resultMetaSchema } from '../dist/validators/results.js';
import { albumSchema } from '../dist/validators/gallery.js';
import { settingsSchema } from '../dist/validators/settings.js';
import { profilePatchSchema } from '../dist/validators/profile.js';
import { preferencesPatchSchema } from '../dist/validators/preferences.js';
import { paginationSchema, uuidParam } from '../dist/validators/common.js';

test('newsSchema valid', () => {
  const r = newsSchema.safeParse({ title: 'Hello world', slug: 'hello-world', content: 'Content long enough for validation', status: 'published' });
  assert.equal(r.success, true);
});
test('newsSchema slug invalid', () => {
  const r = newsSchema.safeParse({ title: 'Hello', slug: 'Bad Slug!', content: 'Content long enough', status: 'draft' });
  assert.equal(r.success, false);
});
test('newsSchema title too short', () => {
  const r = newsSchema.safeParse({ title: 'Hi', slug: 'hi', content: 'Content long enough' });
  assert.equal(r.success, false);
});
test('newsPatchSchema partial', () => {
  const r = newsPatchSchema.safeParse({ title: 'New title' });
  assert.equal(r.success, true);
});

test('eventSchema valid', () => {
  const r = eventSchema.safeParse({ title: 'Journée culturelle', start_at: new Date().toISOString(), status: 'published' });
  assert.equal(r.success, true);
});
test('eventSchema end_at invalid', () => {
  const r = eventSchema.safeParse({ title: 'Test', start_at: 'not-a-date', status: 'draft' });
  assert.equal(r.success, false);
});

test('classSchema valid', () => {
  const r = classSchema.safeParse({ name: 'Terminale D', level: 'Terminale', academic_year: '2025-2026' });
  assert.equal(r.success, true);
});
test('classSchema year invalid', () => {
  const r = classSchema.safeParse({ name: 'A', level: 'B', academic_year: '2025/2026' });
  assert.equal(r.success, false);
});

test('documentMetaSchema valid', () => {
  const r = documentMetaSchema.safeParse({ title: 'Règlement', visibility: 'private', status: 'published' });
  assert.equal(r.success, true);
});
test('documentMetaSchema visibility invalid', () => {
  const r = documentMetaSchema.safeParse({ title: 'Doc', visibility: 'secret' });
  assert.equal(r.success, false);
});

test('resultMetaSchema valid', () => {
  const r = resultMetaSchema.safeParse({ class_id: '11111111-1111-1111-1111-111111111111', academic_year: '2025-2026', result_type: 'Trimestre 1' });
  assert.equal(r.success, true);
});
test('resultMetaSchema uuid invalid', () => {
  const r = resultMetaSchema.safeParse({ class_id: 'not-uuid', academic_year: '2025-2026', result_type: 'T1' });
  assert.equal(r.success, false);
});

test('albumSchema valid', () => {
  const r = albumSchema.safeParse({ title: 'Album 1' });
  assert.equal(r.success, true);
});
test('albumSchema title too short', () => {
  const r = albumSchema.safeParse({ title: 'A' });
  assert.equal(r.success, false);
});

test('settingsSchema valid', () => {
  const r = settingsSchema.safeParse({ school_name: 'IPP', email: 'contact@ecole.tg' });
  assert.equal(r.success, true);
});
test('settingsSchema email invalid', () => {
  const r = settingsSchema.safeParse({ email: 'not-email' });
  assert.equal(r.success, false);
});

test('profilePatchSchema valid', () => {
  const r = profilePatchSchema.safeParse({ first_name: 'Jean' });
  assert.equal(r.success, true);
});
test('profilePatchSchema too short', () => {
  const r = profilePatchSchema.safeParse({ first_name: 'A' });
  assert.equal(r.success, false);
});

test('preferencesPatchSchema valid', () => {
  const r = preferencesPatchSchema.safeParse({ news_enabled: true });
  assert.equal(r.success, true);
});

test('paginationSchema valid', () => {
  const r = paginationSchema.safeParse({ page: '2', limit: '10', q: 'hello' });
  assert.equal(r.success, true);
  assert.equal(r.data.page, 2);
});
test('paginationSchema limit too high', () => {
  const r = paginationSchema.safeParse({ limit: 200 });
  assert.equal(r.success, false);
});

test('uuidParam valid', () => {
  const r = uuidParam.safeParse({ id: '11111111-1111-1111-1111-111111111111' });
  assert.equal(r.success, true);
});
test('uuidParam invalid', () => {
  const r = uuidParam.safeParse({ id: 'not-uuid' });
  assert.equal(r.success, false);
});
