import { Router } from 'express';
import { getServiceClient } from '../config/supabase.js';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { requireMfa } from '../middleware/requireMfa.js';
import { paginationMeta, paginationParams } from '../utils/errors.js';
import { adminLimiter } from '../middleware/rateLimit.js';
import { eventPatchSchema, eventSchema } from '../validators/events.js';
import { pushOnPublish } from '../services/push.js';

const router = Router();
router.use(auth, adminLimiter, requireAdmin, requireMfa);

const schema = eventSchema;

router.get('/', async (req, res, next) => {
  try {
    const { page, limit, from, to } = paginationParams(req.query);
    const svc = getServiceClient();
    const { data, error, count } = await svc
      .from('events')
      .select('*', { count: 'exact' })
      .order('start_at', { ascending: false })
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
        error: { code: 'VALIDATION_ERROR', message: 'Données événement invalides.', details: parsed.error.flatten() },
      });
      return;
    }
    if (parsed.data.end_at && parsed.data.end_at < parsed.data.start_at) {
      res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'end_at doit être après start_at.' },
      });
      return;
    }
    const svc = getServiceClient();
    const { data, error } = await svc
      .from('events')
      .insert({ ...parsed.data, created_by: req.user!.id })
      .select()
      .single();
    if (error) throw error;
    if (data.status === 'published') {
      pushOnPublish('events_enabled', {
        title: `IPP — ${data.title}`,
        body: 'Nouvel événement publié',
        url: `/IPP/evenements/${data.id}`,
        tag: `event-${data.id}`,
      });
    }
    res.status(201).json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const parsed = eventPatchSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Données invalides.' },
      });
      return;
    }
    const svc = getServiceClient();
    const { data: current } = await svc.from('events').select('status').eq('id', req.params.id).single();
    const { data, error } = await svc
      .from('events')
      .update(parsed.data)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    if (parsed.data.status === 'published' && current?.status !== 'published') {
      pushOnPublish('events_enabled', {
        title: `IPP — ${data.title}`,
        body: 'Nouvel événement publié',
        url: `/IPP/evenements/${data.id}`,
        tag: `event-${data.id}`,
      });
    }
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const svc = getServiceClient();
    const { error } = await svc.from('events').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, data: { id: req.params.id } });
  } catch (e) {
    next(e);
  }
});

export default router;
