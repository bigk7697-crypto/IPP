import { z } from 'zod';

export const eventSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().max(5000).optional(),
  image_path: z.string().trim().max(500).optional(),
  location: z.string().trim().max(200).optional(),
  start_at: z.string().datetime({ offset: true }),
  end_at: z.string().datetime({ offset: true }).optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
});
export const eventPatchSchema = eventSchema.partial();
