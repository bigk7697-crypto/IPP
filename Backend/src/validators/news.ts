import { z } from 'zod';

export const newsSchema = z.object({
  title: z.string().trim().min(3).max(200),
  slug: z.string().trim().min(3).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug invalide (a-z, 0-9, tirets)'),
  content: z.string().trim().min(10).max(20000),
  image_path: z.string().trim().max(500).optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
});
export const newsPatchSchema = newsSchema.partial();
