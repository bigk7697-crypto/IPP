import { test } from 'node:test';
import assert from 'node:assert';
import { assertFileSignature } from '../dist/utils/files.js';
import { rateLimit } from '../dist/middleware/rateLimit.js';

function mockRes() {
  let status = 0;
  let body = null;
  const res = {
    status: (c) => { status = c; return res; },
    json: (b) => { body = b; return res; },
    setHeader: () => res,
    getStatus: () => status,
    getBody: () => body,
  };
  return res;
}

// --- Magic bytes ---
test('signature: vrai PDF accepté', () => {
  assertFileSignature(Buffer.from('%PDF-1.7 fake content'), 'application/pdf');
});
test('signature: faux PDF (texte) rejeté', () => {
  assert.throws(() => assertFileSignature(Buffer.from('Hello world, ceci est du texte'), 'application/pdf'));
});
test('signature: vrai PNG accepté', () => {
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
  assertFileSignature(png, 'image/png');
});
test('signature: JPEG déguisé en PNG rejeté', () => {
  const jpg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
  assert.throws(() => assertFileSignature(jpg, 'image/png'));
});
test('signature: vrai JPEG accepté', () => {
  const jpg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
  assertFileSignature(jpg, 'image/jpeg');
});
test('signature: vrai ZIP (xlsx) accepté', () => {
  const zip = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]);
  assertFileSignature(zip, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
});
test('signature: HTML déguisé en xlsx rejeté (anti polyglotte)', () => {
  assert.throws(() =>
    assertFileSignature(
      Buffer.from('<html><script>alert(1)</script></html>'),
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
  );
});
test('signature: type inconnu rejeté', () => {
  assert.throws(() => assertFileSignature(Buffer.from('%PDF-1.4'), 'application/x-shockwave-flash'));
});

// --- Rate limit ---
test('rate-limit: 101e requête même IP -> 429 RATE_LIMITED', () => {
  const mw = rateLimit('test-suite', 100, 15 * 60 * 1000);
  const req = { headers: {}, socket: { remoteAddress: '10.9.9.9' }, path: '/x' };
  let last = null;
  for (let i = 0; i < 101; i++) {
    const res = mockRes();
    let nexted = false;
    mw(req, res, () => { nexted = true; });
    last = { nexted, status: res.getStatus(), body: res.getBody() };
  }
  assert.equal(last.nexted, false);
  assert.equal(last.status, 429);
  assert.equal(last.body.error.code, 'RATE_LIMITED');
});
