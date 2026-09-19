import { test } from 'node:test';
import assert from 'node:assert';
import { buildResultPath, buildDocumentPath, buildPublicImagePath, splitBucketPath } from '../dist/utils/files.js';
import { paginationParams } from '../dist/utils/errors.js';

test('result path = bucket privé + uuid, jamais le nom d origine', () => {
  const p = buildResultPath('2025-2026', 'Terminale D', 'resultats secrets.xlsx');
  assert.match(p, /^private-results\/2025-2026\/terminale-d\/[0-9a-f-]+\.xlsx$/);
  assert.ok(!p.includes('secrets'));
});

test('document path privé + uuid', () => {
  const p = buildDocumentPath('Règlement intérieur', 'reglement.pdf');
  assert.match(p, /^private-documents\/reglement-interieur\/[0-9a-f-]+\.pdf$/);
});

test('image publique news/gallery', () => {
  const p = buildPublicImagePath('gallery', 'photo.JPG');
  assert.match(p, /^public-assets\/gallery\/[0-9a-f-]+\.jpg$/);
});

test('splitBucketPath sépare bucket et chemin', () => {
  assert.deepEqual(splitBucketPath('private-results/a/b.pdf'), { bucket: 'private-results', path: 'a/b.pdf' });
  assert.throws(() => splitBucketPath('nonsense'));
});

test('pagination clamp page/limit', () => {
  assert.deepEqual(paginationParams({}), { page: 1, limit: 20, from: 0, to: 19 });
  assert.deepEqual(paginationParams({ page: '999', limit: '500' }).limit, 100);
  assert.deepEqual(paginationParams({ page: '-3', limit: '0' }), { page: 1, limit: 20, from: 0, to: 19 });
});
