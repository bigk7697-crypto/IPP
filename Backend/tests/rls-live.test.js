// tests/rls-live.test.js — tests de SÉCURITÉ RLS contre le vrai projet (clé ANON).
// Lancement : npm run test:live (nécessite Backend/.env avec SUPABASE_URL + SUPABASE_ANON_KEY).
// Principe spec/08 : visiteur → résultats refusés, drafts invisibles, écritures refusées.
import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';

function loadEnv(path) {
  const env = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)=(.*)\s*$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

const env = loadEnv(new URL('../.env', import.meta.url));
const BASE = `${env.SUPABASE_URL}/rest/v1`;
const HEADERS = { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}` };

async function get(path) {
  const res = await fetch(`${BASE}${path}`, { headers: HEADERS });
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}

test('setup .env présent', () => {
  assert.ok(env.SUPABASE_URL?.startsWith('https://'), 'SUPABASE_URL manquante');
  assert.ok(env.SUPABASE_ANON_KEY?.startsWith('eyJ'), 'SUPABASE_ANON_KEY manquante');
});

test('visiteur lit les news published, jamais les drafts', async () => {
  const { status, body } = await get('/news?select=id,status');
  assert.equal(status, 200);
  assert.ok(Array.isArray(body) && body.length > 0);
  assert.ok(body.every((n) => n.status === 'published'), 'un draft fuite !');
});

test('visiteur ne voit AUCUN résultat (table privée)', async () => {
  const { status, body } = await get('/results?select=id');
  assert.equal(status, 200);
  assert.deepEqual(body, []);
});

test('visiteur ne voit aucune notification (privé par user)', async () => {
  const { status, body } = await get('/notifications?select=id');
  assert.equal(status, 200);
  assert.deepEqual(body, []);
});

test('visiteur lit classes + settings (public)', async () => {
  const classes = await get('/classes?select=id');
  assert.equal(classes.status, 200);
  assert.ok(classes.body.length >= 3);
  const settings = await get('/school_settings?select=id');
  assert.equal(settings.status, 200);
});

test('visiteur ne peut RIEN écrire (insert refusé)', async () => {
  for (const table of ['news', 'events', 'results', 'classes']) {
    const res = await fetch(`${BASE}/${table}`, {
      method: 'POST',
      headers: { ...HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'hack' }),
    });
    // 400/401/403/404 = refusé dans tous les cas (RLS ou validation), rien n'est écrit.
    assert.ok([400, 401, 403, 404].includes(res.status), `${table}: insert visiteur = ${res.status}`);
  }
});
