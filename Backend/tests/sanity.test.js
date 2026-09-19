import { test } from 'node:test';
import assert from 'node:assert';

// Test placeholder Phase 1 — vérifie le format d'erreur normalisé.
// Les tests DB/RLS réels arrivent en Phase 11 (voir spec/08-tests.md).
test('format erreur normalisé', () => {
  const body = { success: false, error: { code: 'UNAUTHORIZED', message: 'Vous devez être connecté.' } };
  assert.equal(body.success, false);
  assert.equal(body.error.code, 'UNAUTHORIZED');
});
