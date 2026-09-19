import { Router } from 'express';
import { getServiceClient } from '../config/supabase.js';
import { auth } from '../middleware/auth.js';
import { paginationMeta, paginationParams } from '../utils/errors.js';

const router = Router();
router.use(auth);

// GET /api/notifications — uniquement les siennes (user_id = auth.uid)
router.get('/', async (req, res, next) => {
  try {
    const { page, limit, from, to } = paginationParams(req.query);
    const svc = getServiceClient();
    const { data, error, count } = await svc
      .from('notifications')
      .select('id,type,title,message,target_type,target_id,is_read,created_at', { count: 'exact' })
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) throw error;
    res.json({ success: true, data, pagination: paginationMeta(page, limit, count ?? 0) });
  } catch (e) {
    next(e);
  }
});

// PATCH /api/notifications/read-all — AVANT /:id/read (ordre Express)
router.patch('/read-all', async (req, res, next) => {
  try {
    const svc = getServiceClient();
    const { error } = await svc
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', req.user!.id)
      .eq('is_read', false);
    if (error) throw error;
    res.json({ success: true, data: { ok: true } });
  } catch (e) {
    next(e);
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', async (req, res, next) => {
  try {
    const svc = getServiceClient();
    const { error } = await svc
      .from('notifications')
      .update({ is_read: true })
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id);
    if (error) throw error;
    res.json({ success: true, data: { id: req.params.id, is_read: true } });
  } catch (e) {
    next(e);
  }
});

export default router;
