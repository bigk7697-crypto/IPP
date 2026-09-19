import { z } from 'zod';

export const documentMetaSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().max(1000).optional(),
  category: z.string().trim().max(100).optional(),
  visibility: z.enum(['public', 'private']).default('public'),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
});
export const documentPatchSchema = documentMetaSchema.partial();
