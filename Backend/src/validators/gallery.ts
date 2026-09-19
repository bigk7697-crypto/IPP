import { z } from 'zod';

export const albumSchema = z.object({
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().max(1000).optional(),
  cover_image_path: z.string().trim().max(500).optional(),
});
export const albumPatchSchema = albumSchema.partial();
export const imageMetaSchema = z.object({
  caption: z.string().trim().max(300).optional(),
  sort_order: z.coerce.number().int().min(0).max(10000).default(0),
});
