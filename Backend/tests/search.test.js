import { test } from 'node:test';
import assert from 'node:assert';
import { escapeIlike, normalizeQuery } from '../dist/utils/search.js';
import { paginationMeta, paginationParams } from '../dist/utils/errors.js';

test('escapeIlike escapes % _ \\', () => {
  assert.equal(escapeIlike('a%b_c\\d'), 'a\\%b\\_c\\\\d');
});
test('normalizeQuery trims and limits to 100', () => {
  assert.equal(normalizeQuery('  hello  '), 'hello');
  assert.equal(normalizeQuery('a'.repeat(150)).length, 100);
  assert.equal(normalizeQuery(null), '');
});
test('paginationMeta calculates pages', () => {
  assert.deepEqual(paginationMeta(1, 10, 25), { page: 1, limit: 10, total: 25, pages: 3 });
  assert.deepEqual(paginationMeta(1, 10, 0), { page: 1, limit: 10, total: 0, pages: 1 });
});
test('paginationParams with q', () => {
  const p = paginationParams({ page: '2', limit: '5' });
  assert.equal(p.page, 2);
  assert.equal(p.limit, 5);
  assert.equal(p.from, 5);
  assert.equal(p.to, 9);
});
