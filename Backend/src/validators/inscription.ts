import { z } from 'zod';

export const NIVEAUX = ['6eme', '5eme', '4eme', '3eme', 'Seconde', 'Premiere', 'Terminale', 'CAP'] as const;

export const TYPE_PIECES = [
  'acte-naissance',
  'bulletins',
  'photo',
  'attestation',
  'autre',
] as const;

// Champs texte du formulaire (multipart : tout arrive en string).
export const inscriptionSubmitSchema = z.object({
  first_name: z.string().trim().min(2).max(100),
  last_name: z.string().trim().min(2).max(100),
  birth_date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide (AAAA-MM-JJ)').optional().or(z.literal('')),
  email: z.string().trim().email('Email invalide').max(200),
  phone: z.string().trim().min(8).max(20).regex(/^[+\d][\d\s.\-()]{7,19}$/, 'Téléphone invalide'),
  parent_name: z.string().trim().min(2).max(200),
  niveau: z.enum(NIVEAUX),
  filiere_slug: z.string().trim().max(120).optional().or(z.literal('')),
  message: z.string().trim().max(2000).default(''),
});

// Décision admin avec transitions autorisées.
export const decideSchema = z
  .object({
    action: z.enum(['verifier', 'convoquer', 'refuser', 'admettre']),
    rendez_vous_at: z.string().datetime({ offset: true }).optional(),
    rendez_vous_message: z.string().trim().max(2000).default(''),
    motif_refus: z.string().trim().max(2000).default(''),
  })
  .superRefine((v, ctx) => {
    if (v.action === 'convoquer' && !v.rendez_vous_at) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['rendez_vous_at'], message: 'Date de rendez-vous requise.' });
    }
    if (v.action === 'refuser' && !v.motif_refus) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['motif_refus'], message: 'Motif du refus requis.' });
    }
  });

export const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  soumis: ['verifie', 'refuse'],
  verifie: ['convoque', 'refuse', 'admis'],
  convoque: ['refuse', 'admis'],
  refuse: [],
  admis: [],
};
