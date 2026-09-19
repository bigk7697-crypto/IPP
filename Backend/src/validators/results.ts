import { z } from 'zod';

export const resultMetaSchema = z.object({
  class_id: z.string().uuid(),
  academic_year: z.string().regex(/^\d{4}-\d{4}$/, 'Format : 2025-2026'),
  result_type: z.string().trim().min(2).max(100),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
});
export const resultPatchSchema = resultMetaSchema.partial();
