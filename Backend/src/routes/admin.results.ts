import { Router } from 'express';
import { getServiceClient } from '../config/supabase.js';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { requireMfa } from '../middleware/requireMfa.js';
import { uploadResult } from '../middleware/upload.js';
import { MIME, assertFileSignature, buildResultPath } from '../utils/files.js';
import { removeFile, uploadBuffer } from '../services/storage.js';
import { paginationMeta, paginationParams } from '../utils/errors.js';
import { adminLimiter } from '../middleware/rateLimit.js';
import { resultMetaSchema, resultPatchSchema } from '../validators/results.js';

const router = Router();
router.use(auth, adminLimiter, requireAdmin, requireMfa);

const metaSchema = resultMetaSchema;

// GET /api/admin/results — liste admin (tous statuts)
router.get('/', async (req, res, next) => {
  try {
    const { page, limit, from, to } = paginationParams(req.query);
    const svc = getServiceClient();
    const { data, error, count } = await svc
      .from('results')
      .select('id,class_id,academic_year,result_type,file_path,status,published_at,created_at,classes(name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) throw error;
    res.json({ success: true, data, pagination: paginationMeta(page, limit, count ?? 0) });
  } catch (e) {
    next(e);
  }
});

// POST /api/admin/results — multipart : file (PDF/XLSX) + class_id + academic_year + result_type + status
// Cohérence : si upload échoue → pas de ligne DB → pas de notif.
router.post('/', uploadResult.single('file'), async (req, res, next) => {
  try {
    const parsed = metaSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Métadonnées résultat invalides.', details: parsed.error.flatten() },
      });
      return;
    }
    const file = req.file;
    if (!file) {
      res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Fichier requis (champ "file" : PDF/XLSX).' },
      });
      return;
    }
    if (!MIME.result.includes(file.mimetype)) {
      res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Fichier PDF ou Excel uniquement.' },
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

    const svc = getServiceClient();
    const { data: cls } = await svc.from('classes').select('name').eq('id', parsed.data.class_id).single();
    if (!cls) {
      res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Classe inexistante.' },
      });
      return;
    }

    const fullPath = buildResultPath(parsed.data.academic_year, cls.name, file.originalname);
    try {
      await uploadBuffer(fullPath, file.buffer, file.mimetype);
    } catch {
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Échec upload Storage, résultat non publié.' },
      });
      return;
    }

    const { data, error } = await svc
      .from('results')
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
    res.status(201).json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

// PUT /api/admin/results/:id — changement statut/méta (pas de fichier ici)
router.put('/:id', async (req, res, next) => {
  try {
    const parsed = resultPatchSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Données invalides.' },
      });
      return;
    }
    const svc = getServiceClient();
    const payload: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.status === 'published') {
      const { data: cur } = await svc.from('results').select('status').eq('id', req.params.id).single();
      if (cur?.status !== 'published') payload.published_at = new Date().toISOString();
    }
    if (parsed.data.status === 'draft') payload.published_at = null;
    const { data, error } = await svc
      .from('results')
      .update(payload)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

// DELETE /api/admin/results/:id — DB + Storage
router.delete('/:id', async (req, res, next) => {
  try {
    const svc = getServiceClient();
    const { data: row } = await svc.from('results').select('file_path').eq('id', req.params.id).single();
    const { error } = await svc.from('results').delete().eq('id', req.params.id);
    if (error) throw error;
    if (row?.file_path) await removeFile(row.file_path).catch(() => {});
    res.json({ success: true, data: { id: req.params.id } });
  } catch (e) {
    next(e);
  }
});

export default router;
