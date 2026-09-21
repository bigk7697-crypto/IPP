import { Router } from 'express';
import { getServiceClient } from '../config/supabase.js';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { requireMfa } from '../middleware/requireMfa.js';
import { adminLimiter } from '../middleware/rateLimit.js';
import { handledPatchSchema, topicPatchSchema, topicSchema } from '../validators/orientation.js';

const router = Router();
router.use(auth, adminLimiter, requireAdmin, requireMfa);

function validationError(res: any, parsed: { error: { flatten: () => unknown } }) {
  res.status(422).json({
    success: false,
    error: { code: 'VALIDATION_ERROR', message: 'Données invalides.', details: parsed.error.flatten() },
  });
}

// ---------- Topics ----------
// GET /api/admin/orientation/topics — tout, y compris non publiés
router.get('/topics', async (req, res, next) => {
  try {
    const svc = getServiceClient();
    const { data, error } = await svc
      .from('orientation_topics')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('title', { ascending: true });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

// POST /api/admin/orientation/topics
router.post('/topics', async (req, res, next) => {
  try {
    const parsed = topicSchema.safeParse(req.body);
    if (!parsed.success) {
      validationError(res, parsed);
      return;
    }
    const svc = getServiceClient();
    const { data, error } = await svc
      .from('orientation_topics')
      .insert({ ...parsed.data, updated_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

// PUT /api/admin/orientation/topics/:id
router.put('/topics/:id', async (req, res, next) => {
  try {
    const parsed = topicPatchSchema.safeParse(req.body);
    if (!parsed.success) {
      validationError(res, parsed);
      return;
    }
    const svc = getServiceClient();
    const { data, error } = await svc
      .from('orientation_topics')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

// DELETE /api/admin/orientation/topics/:id
router.delete('/topics/:id', async (req, res, next) => {
  try {
    const svc = getServiceClient();
    const { error } = await svc.from('orientation_topics').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, data: { ok: true } });
  } catch (e) {
    next(e);
  }
});

// ---------- Journal sans-réponse ----------
// GET /api/admin/orientation/unanswered (?handled=true|false)
router.get('/unanswered', async (req, res, next) => {
  try {
    const svc = getServiceClient();
    let q = svc.from('orientation_unanswered').select('*').order('created_at', { ascending: false }).limit(200);
    if (req.query.handled === 'true') q = q.eq('handled', true);
    if (req.query.handled === 'false') q = q.eq('handled', false);
    const { data, error } = await q;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

// PATCH /api/admin/orientation/unanswered/:id — marquer traitée
router.patch('/unanswered/:id', async (req, res, next) => {
  try {
    const parsed = handledPatchSchema.safeParse(req.body);
    if (!parsed.success) {
      validationError(res, parsed);
      return;
    }
    const svc = getServiceClient();
    const { data, error } = await svc
      .from('orientation_unanswered')
      .update({ handled: parsed.data.handled })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

// DELETE /api/admin/orientation/unanswered/:id
router.delete('/unanswered/:id', async (req, res, next) => {
  try {
    const svc = getServiceClient();
    const { error } = await svc.from('orientation_unanswered').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, data: { ok: true } });
  } catch (e) {
    next(e);
  }
});

export default router;
