import { z } from 'zod';

export const classSchema = z.object({
  name: z.string().trim().min(2).max(100),
  level: z.string().trim().min(2).max(100),
  series: z.string().trim().max(10).optional(),
  academic_year: z.string().regex(/^\d{4}-\d{4}$/, 'Format attendu : 2025-2026'),
  is_active: z.boolean().default(true),
});
export const classPatchSchema = classSchema.partial();
