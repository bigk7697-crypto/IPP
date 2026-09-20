import { z } from 'zod';

export const profilePatchSchema = z.object({
  first_name: z.string().trim().min(2).max(80).optional(),
  last_name: z.string().trim().min(2).max(80).optional(),
  avatar_url: z.string().trim().max(500).optional().nullable(),
});
