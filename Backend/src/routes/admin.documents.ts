import { Router } from 'express';
import { getServiceClient } from '../config/supabase.js';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { requireMfa } from '../middleware/requireMfa.js';
import { uploadDocument } from '../middleware/upload.js';
import { MIME, assertFileSignature, buildDocumentPath } from '../utils/files.js';
import { removeFile, uploadBuffer } from '../services/storage.js';
import { paginationMeta, paginationParams } from '../utils/errors.js';
import { adminLimiter } from '../middleware/rateLimit.js';
import { documentMetaSchema, documentPatchSchema } from '../validators/documents.js';
import { pushOnPublish } from '../services/push.js';

const router = Router();
router.use(auth, adminLimiter, requireAdmin, requireMfa);

// GET /api/admin/documents — liste admin (tous statuts, privés inclus)
router.get('/', async (req, res, next) => {
  try {
    const { page, limit, from, to } = paginationParams(req.query);
    const svc = getServiceClient();
    const { data, error, count } = await svc
      .from('documents')
      .select('id,title,category,visibility,status,published_at,created_at,file_path', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) throw error;
    res.json({ success: true, data, pagination: paginationMeta(page, limit, count ?? 0) });
  } catch (e) {
    next(e);
  }
});

const metaSchema = documentMetaSchema;

// POST /api/admin/documents — multipart : file + champs méta
router.post('/', uploadDocument.single('file'), async (req, res, next) => {
  try {
    const parsed = metaSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Métadonnées invalides.', details: parsed.error.flatten() },
      });
      return;
    }
    const file = req.file;
    if (!file) {
      res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Fichier requis (champ "file").' },
      });
      return;
    }
    if (!MIME.document.includes(file.mimetype)) {
      res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Type de fichier non autorisé.' },
      });
      return;
    }
    try {
      assertFileSignature(file.buffer, file.mimetype);
    } catch (e: any) {
      res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: e.message || 'Contenu du fichier invalide.' },
      });
      return;
    }
    const bucketPath =
      parsed.data.visibility === 'public'
        ? `public-assets/documents/${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        : buildDocumentPath(parsed.data.category ?? 'divers', file.originalname);

    let fullPath = '';
    try {
      fullPath = await uploadBuffer(bucketPath, file.buffer, file.mimetype);
    } catch (e) {
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Échec upload Storage.' },
      });
      return;
    }

    const svc = getServiceClient();
    const { data, error } = await svc
      .from('documents')
      .insert({
        ...parsed.data,
        file_path: fullPath,
        published_at: parsed.data.status === 'published' ? new Date().toISOString() : null,
        created_by: req.user!.id,
      })
      .select()
      .single();
    if (error) {
      await removeFile(fullPath).catch(() => {});
      throw error;
    }
    if (data.status === 'published') {
      pushOnPublish('documents_enabled', {
        title: `IPP — ${data.title}`,
        body: 'Nouveau document publié',
        url: '/IPP/documents',
        tag: `document-${data.id}`,
      });
    }
    res.status(201).json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

// PUT /api/admin/documents/:id — méta uniquement (remplacement de fichier : DELETE + POST)
router.put('/:id', async (req, res, next) => {
  try {
    const parsed = documentPatchSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Données invalides.' },
      });
      return;
    }
    const svc = getServiceClient();
    const payload: Record<string, unknown> = { ...parsed.data };
    const { data: cur } = await svc.from('documents').select('status').eq('id', req.params.id).single();
    if (parsed.data.status === 'published') {
      if (cur?.status !== 'published') payload.published_at = new Date().toISOString();
    }
    if (parsed.data.status === 'draft') payload.published_at = null;
    const { data, error } = await svc
      .from('documents')
      .update(payload)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    if (parsed.data.status === 'published' && cur?.status !== 'published') {
      pushOnPublish('documents_enabled', {
        title: `IPP — ${data.title}`,
        body: 'Nouveau document publié',
        url: '/IPP/documents',
        tag: `document-${data.id}`,
      });
    }
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

// DELETE /api/admin/documents/:id — DB + Storage cohérents
router.delete('/:id', async (req, res, next) => {
  try {
    const svc = getServiceClient();
    const { data: row } = await svc.from('documents').select('file_path').eq('id', req.params.id).single();
    const { error } = await svc.from('documents').delete().eq('id', req.params.id);
    if (error) throw error;
    if (row?.file_path) await removeFile(row.file_path).catch(() => {});
    res.json({ success: true, data: { id: req.params.id } });
  } catch (e) {
    next(e);
  }
});

export default router;
