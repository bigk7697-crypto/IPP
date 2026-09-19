import 'dotenv/config';
import { test } from 'node:test';
import assert from 'node:assert';
import { createApp } from '../dist/app.js';

function startApp() {
  const app = createApp();
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const addr = server.address();
      const port = typeof addr === 'object' && addr ? addr.port : 4000;
      resolve({ server, port });
    });
  });
}

test('GET /api/health', async () => {
  const { server, port } = await startApp();
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/health`);
    const json = await res.json();
    assert.equal(res.status, 200);
    assert.equal(json.success, true);
  } finally { server.close(); }
});

test('GET /api/news pagination', async () => {
  const { server, port } = await startApp();
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/news?page=1&limit=2`);
    const json = await res.json();
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(json.data));
    assert.ok(json.pagination);
    assert.equal(json.pagination.page, 1);
    assert.equal(json.pagination.limit, 2);
    assert.ok(typeof json.pagination.pages === 'number');
  } finally { server.close(); }
});

test('GET /api/events pagination + search', async () => {
  const { server, port } = await startApp();
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/events?page=1&limit=2&q=test`);
    const json = await res.json();
    assert.equal(res.status, 200);
    assert.ok(json.pagination);
  } finally { server.close(); }
});

test('GET /api/classes pagination + search', async () => {
  const { server, port } = await startApp();
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/classes?page=1&limit=10&q=Terminale`);
    const json = await res.json();
    assert.equal(res.status, 200);
    assert.ok(json.pagination);
  } finally { server.close(); }
});

test('GET /api/gallery pagination', async () => {
  const { server, port } = await startApp();
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/gallery?page=1&limit=2`);
    const json = await res.json();
    assert.equal(res.status, 200);
    assert.ok(json.pagination);
  } finally { server.close(); }
});

test('GET /api/events/:id 404', async () => {
  const { server, port } = await startApp();
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/events/00000000-0000-0000-0000-000000000000`);
    assert.equal(res.status, 404);
  } finally { server.close(); }
});

test('GET /api/classes/:id 404', async () => {
  const { server, port } = await startApp();
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/classes/00000000-0000-0000-0000-000000000000`);
    assert.equal(res.status, 404);
  } finally { server.close(); }
});

test('GET /api/documents pagination', async () => {
  const { server, port } = await startApp();
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/documents?page=1&limit=2`);
    const json = await res.json();
    assert.equal(res.status, 200);
    assert.ok(json.pagination);
  } finally { server.close(); }
});

test('404 handling', async () => {
  const { server, port } = await startApp();
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/unknown-route`);
    assert.equal(res.status, 404);
    const json = await res.json();
    assert.equal(json.error.code, 'NOT_FOUND');
  } finally { server.close(); }
});
