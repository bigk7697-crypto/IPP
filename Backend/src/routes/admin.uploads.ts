import { Router } from 'express';
import { getServiceClient } from '../config/supabase.js';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { requireMfa } from '../middleware/requireMfa.js';
import { adminLimiter } from '../middleware/rateLimit.js';
import { uploadImage } from '../middleware/upload.js';
import { assertFileSignature, buildPublicImagePath, MIME } from '../utils/files.js';
import { uploadBuffer } from '../services/storage.js';

const router = Router();
router.use(auth, adminLimiter, requireAdmin, requireMfa);

const FOLDERS = ['news', 'gallery', 'events'] as const;

// POST /api/admin/uploads/image — upload d'image via le backend.
// multipart file=image + folder=news|gallery|events.
// Vérifie MIME + signature réelle (magic bytes) avant envoi au bucket public.
router.post('/image', uploadImage.single('file'), async (req, res, next) => {
  try {
    const folder = String(req.body?.folder || '');
    if (!(FOLDERS as readonly string[]).includes(folder)) {
      res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Dossier invalide (news, gallery ou events).' },
      });
      return;
    }
    const file = req.file;
    if (!file) {
      res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Fichier image requis (champ "file").' },
      });
      return;
    }
    if (!MIME.image.includes(file.mimetype)) {
      res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Image JPEG/PNG/WebP uniquement.' },
      });
      return;
    }
    try {
      assertFileSignature(file.buffer, file.mimetype);
    } catch (e: any) {
      res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: e.message || 'Contenu image invalide.' },
      });
      return;
    }
    const fullPath = buildPublicImagePath(folder as 'news' | 'gallery' | 'events', file.originalname);
    await uploadBuffer(fullPath, file.buffer, file.mimetype);
    res.status(201).json({ success: true, data: { path: fullPath } });
  } catch (e) {
    next(e);
  }
});

export default router;
