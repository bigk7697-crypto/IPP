import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  q: z.string().max(100).optional(),
});

export const uuidParam = z.object({ id: z.string().uuid() });
export const classIdParam = z.object({ classId: z.string().uuid() });
