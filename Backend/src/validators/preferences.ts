import { z } from 'zod';

export const preferencesPatchSchema = z.object({
  news_enabled: z.boolean().optional(),
  events_enabled: z.boolean().optional(),
  results_enabled: z.boolean().optional(),
  documents_enabled: z.boolean().optional(),
  calendar_enabled: z.boolean().optional(),
  system_enabled: z.boolean().optional(),
});
