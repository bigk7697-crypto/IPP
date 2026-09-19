import { z } from 'zod';

export const settingsSchema = z.object({
  school_name: z.string().trim().min(2).max(150).optional(),
  school_description: z.string().trim().max(2000).optional(),
  address: z.string().trim().max(300).optional(),
  phone: z.string().trim().max(50).optional(),
  email: z.string().trim().email().optional(),
  logo_path: z.string().trim().max(500).optional(),
  website: z.string().trim().url().or(z.string().max(0)).optional(),
  social_links: z.record(z.string().trim().max(300)).optional(),
});
