import { z } from 'zod';

export const topicSchema = z.object({
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug invalide (a-z, 0-9, tirets)'),
  category: z.enum(['filieres', 'infos']).default('infos'),
  title: z.string().trim().min(3).max(200),
  content: z.string().trim().min(10).max(20000),
  keywords: z.string().trim().max(1000).default(''),
  is_published: z.boolean().default(true),
  sort_order: z.number().int().min(0).max(1000).default(0),
});
export const topicPatchSchema = topicSchema.partial();

export const unansweredSchema = z.object({
  question: z.string().trim().min(3).max(500),
  source: z.enum(['assistant', 'quiz']).default('assistant'),
});

export const handledPatchSchema = z.object({
  handled: z.boolean(),
});
