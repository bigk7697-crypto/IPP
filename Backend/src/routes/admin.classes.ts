import { Router } from 'express';
import { getServiceClient } from '../config/supabase.js';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { paginationMeta, paginationParams } from '../utils/errors.js';
import { classPatchSchema, classSchema } from '../validators/classes.js';

const router = Router();
router.use(auth, requireAdmin);

const schema = classSchema;

router.get('/', async (req, res, next) => {
  try {
    const { page, limit, from, to } = paginationParams(req.query);
    const svc = getServiceClient();
    const { data, error, count } = await svc
      .from('classes')
      .select('*', { count: 'exact' })
      .order('name')
      .range(from, to);
    if (error) throw error;
    res.json({ success: true, data, pagination: paginationMeta(page, limit, count ?? 0) });
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Classe invalide.', details: parsed.error.flatten() },
      });
      return;
    }
    const svc = getServiceClient();
    const { data, error } = await svc.from('classes').insert(parsed.data).select().single();
    if (error) {
      if (error.code === '23505') {
        res.status(409).json({
          success: false,
          error: { code: 'CONFLICT', message: 'Cette classe existe déjà pour cette année.' },
        });
        return;
      }
      throw error;
    }
    res.status(201).json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const parsed = classPatchSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Données invalides.' },
      });
      return;
    }
    const svc = getServiceClient();
    const { data, error } = await svc
      .from('classes')
      .update(parsed.data)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const svc = getServiceClient();
    const { error } = await svc.from('classes').delete().eq('id', req.params.id);
    if (error) {
      // restrict si des résultats pointent encore dessus
      if (error.code === '23503') {
        res.status(409).json({
          success: false,
          error: { code: 'CONFLICT', message: 'Classe utilisée par des résultats, désactivez-la plutôt.' },
        });
        return;
      }
      throw error;
    }
    res.json({ success: true, data: { id: req.params.id } });
  } catch (e) {
    next(e);
  }
});

export default router;
