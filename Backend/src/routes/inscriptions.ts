import { Router } from 'express';
import { getServiceClient } from '../config/supabase.js';
import { auth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { uploadInscription } from '../middleware/upload.js';
import { removeFile, uploadBuffer } from '../services/storage.js';
import {
  assertFileSignature,
  buildInscriptionPath,
  INSCRIPTION_MAX_FILES,
  INSCRIPTION_MIME,
} from '../utils/files.js';
import { inscriptionSubmitSchema } from '../validators/inscription.js';

const router = Router();

function makeReference(): string {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += abc[Math.floor(Math.random() * abc.length)];
  return `IPP-${new Date().getFullYear()}-${s}`;
}

// POST /api/inscriptions/submit — dépôt d'un dossier (compte requis, 1..6 pièces)
router.post('/submit', authLimiter, auth, uploadInscription.array('pieces', INSCRIPTION_MAX_FILES), async (req, res, next) => {
  const uploaded: string[] = [];
  try {
    const parsed = inscriptionSubmitSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Dossier invalide.', details: parsed.error.flatten() },
      });
      return;
    }
    const files = (req.files as Express.Multer.File[]) || [];
    if (files.length < 1 || files.length > INSCRIPTION_MAX_FILES) {
      res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: `Joignez entre 1 et ${INSCRIPTION_MAX_FILES} pièces (PDF ou images).` },
      });
      return;
    }
    for (const f of files) {
      if (!INSCRIPTION_MIME.includes(f.mimetype)) {
        res.status(422).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: `Type refusé : ${f.originalname} (PDF, JPG, PNG, WebP uniquement).` },
        });
        return;
      }
      try {
        assertFileSignature(f.buffer, f.mimetype);
      } catch (e: any) {
        res.status(422).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: `${f.originalname} : ${e.message}` },
        });
        return;
      }
    }

    const svc = getServiceClient();

    // Référence unique type IPP-2026-A8K2QD
    let reference = '';
    for (let i = 0; i < 5; i++) {
      reference = makeReference();
      const { data } = await svc.from('inscription_applications').select('id').eq('reference', reference).maybeSingle();
      if (!data) break;
      reference = '';
    }
    if (!reference) throw new Error('Référence indisponible, réessayez.');

    const typePiece = (name: string, i: number) => {
      const n = name.toLowerCase();
      if (/acte|naissance/.test(n)) return 'acte-naissance';
      if (/bulletin|relev|note/.test(n)) return 'bulletins';
      if (/photo|identit/.test(n)) return 'photo';
      if (/attestation|scolarit/.test(n)) return 'attestation';
      return i === 0 ? 'acte-naissance' : 'autre';
    };

    const { data: app, error: appErr } = await svc
      .from('inscription_applications')
      .insert({
        reference,
        user_id: req.user!.id,
        first_name: parsed.data.first_name,
        last_name: parsed.data.last_name,
        birth_date: parsed.data.birth_date || null,
        email: parsed.data.email,
        phone: parsed.data.phone,
        parent_name: parsed.data.parent_name,
        niveau: parsed.data.niveau,
        filiere_slug: parsed.data.filiere_slug || null,
        message: parsed.data.message || '',
      })
      .select('id,reference')
      .single();
    if (appErr || !app) throw appErr || new Error('Création du dossier impossible.');

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const fullPath = buildInscriptionPath(reference, f.originalname);
      await uploadBuffer(fullPath, f.buffer, f.mimetype);
      uploaded.push(fullPath);
      const { error: docErr } = await svc.from('inscription_documents').insert({
        application_id: app.id,
        type_piece: (req.body[`type_${i}`] as string) || typePiece(f.originalname, i),
        file_name: f.originalname.slice(0, 200),
        file_path: fullPath,
        mime: f.mimetype,
        size_bytes: f.size,
      });
      if (docErr) throw docErr;
    }

    res.status(201).json({ success: true, data: { id: app.id, reference } });
  } catch (e) {
    for (const p of uploaded) {
      await removeFile(p).catch(() => {});
    }
    next(e);
  }
});

// GET /api/inscriptions/mine — mes dossiers (compte requis)
router.get('/mine', auth, async (req, res, next) => {
  try {
    const svc = getServiceClient();
    const { data, error } = await svc
      .from('inscription_applications')
      .select('id,reference,first_name,niveau,filiere_slug,status,rendez_vous_at,rendez_vous_message,motif_refus,updated_at')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

// GET /api/inscriptions/track/:reference — suivi de MES dossiers (sans données sensibles)
router.get('/track/:reference', auth, async (req, res, next) => {
  try {
    const ref = String(req.params.reference || '').trim().toUpperCase().slice(0, 32);
    if (!/^IPP-\d{4}-[A-Z0-9]{6}$/.test(ref)) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Référence introuvable.' } });
      return;
    }
    const svc = getServiceClient();
    const { data, error } = await svc
      .from('inscription_applications')
      .select('reference,first_name,niveau,filiere_slug,status,rendez_vous_at,rendez_vous_message,motif_refus,updated_at')
      .eq('reference', ref)
      .eq('user_id', req.user!.id)
      .single();
    if (error || !data) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Référence introuvable.' } });
      return;
    }
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

export default router;
