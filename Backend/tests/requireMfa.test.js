import { test } from 'node:test';
import assert from 'node:assert';
import { requireMfa } from '../dist/middleware/requireMfa.js';

function fakeJwt(payload) {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  return `${b64({ alg: 'none' })}.${b64(payload)}.sig`;
}

function run(token) {
  const req = { accessToken: token };
  let status = 0;
  let body = null;
  let nexted = false;
  const res = {
    status: (c) => { status = c; return res; },
    json: (b) => { body = b; return res; },
  };
  requireMfa(req, res, () => { nexted = true; });
  return { status, body, nexted };
}

test('MFA: sans token -> 401', () => {
  const r = run(undefined);
  assert.equal(r.status, 401);
  assert.equal(r.nexted, false);
});

test('MFA: token aal1 -> 403 MFA_REQUIRED', () => {
  const r = run(fakeJwt({ sub: 'u1', aal: 'aal1', amr: [{ method: 'password' }] }));
  assert.equal(r.status, 403);
  assert.equal(r.body.error.code, 'MFA_REQUIRED');
  assert.equal(r.nexted, false);
});

test('MFA: token aal2 -> next()', () => {
  const r = run(fakeJwt({ sub: 'u1', aal: 'aal2', amr: [{ method: 'totp' }, { method: 'password' }] }));
  assert.equal(r.nexted, true);
});

test('MFA: token malformé -> 401', () => {
  const r = run('not-a-jwt');
  assert.equal(r.status, 401);
  assert.equal(r.nexted, false);
});
