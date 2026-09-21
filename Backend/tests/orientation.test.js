import { test } from 'node:test';
import assert from 'node:assert';

// Orientation validators - import built files
import { topicSchema, topicPatchSchema, unansweredSchema } from '../dist/validators/orientation.js';

test('topicSchema valid', () => {
  const r = topicSchema.safeParse({
    slug: 'serie-f2',
    category: 'filieres',
    title: 'Série F2',
    content: 'Contenu assez long pour passer la validation du sujet',
    keywords: 'f2, electronique',
    is_published: true,
    sort_order: 30,
  });
  assert.equal(r.success, true);
});

test('topicSchema slug invalid', () => {
  const r = topicSchema.safeParse({
    slug: 'Bad Slug!',
    title: 'Titre valide ici',
    content: 'Contenu assez long pour passer',
  });
  assert.equal(r.success, false);
});

test('topicSchema category invalid', () => {
  const r = topicSchema.safeParse({
    slug: 'frais',
    category: 'nope',
    title: 'Frais de scolarité',
    content: 'Contenu assez long pour passer',
  });
  assert.equal(r.success, false);
});

test('topicPatchSchema partial', () => {
  const r = topicPatchSchema.safeParse({ is_published: false });
  assert.equal(r.success, true);
});

test('unansweredSchema valid', () => {
  const r = unansweredSchema.safeParse({ question: 'Quels sont les frais en F2 ?', source: 'assistant' });
  assert.equal(r.success, true);
});

test('unansweredSchema too short', () => {
  const r = unansweredSchema.safeParse({ question: 'hi' });
  assert.equal(r.success, false);
});
