import { Router } from 'express';
import { getServiceClient } from '../config/supabase.js';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { requireMfa } from '../middleware/requireMfa.js';
import { paginationMeta, paginationParams } from '../utils/errors.js';
import { adminLimiter } from '../middleware/rateLimit.js';
import { newsPatchSchema, newsSchema } from '../validators/news.js';
import { pushOnPublish } from '../services/push.js';

const router = Router();
router.use(auth, adminLimiter, requireAdmin, requireMfa);

// POST /api/admin/news — publier → trigger DB crée les notifs auto
router.post('/', async (req, res, next) => {
  try {
    const parsed = newsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Données invalides.',
          details: parsed.error.flatten(),
        },
      });
      return;
    }
    const svc = getServiceClient();
    const payload = {
      ...parsed.data,
      published_at: parsed.data.status === 'published' ? new Date().toISOString() : null,
      created_by: req.user!.id,
    };
    const { data, error } = await svc.from('news').insert(payload).select().single();
    if (error) throw error;
    if (data.status === 'published') {
      pushOnPublish('news_enabled', {
        title: `IPP — ${data.title}`,
        body: 'Nouvelle actualité publiée',
        url: `/IPP/actualites/${data.id}`,
        tag: `news-${data.id}`,
      });
    }
    res.status(201).json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

// GET /api/admin/news — liste complète y compris drafts (admin)
router.get('/', async (req, res, next) => {
  try {
    const { page, limit, from, to } = paginationParams(req.query);
    const svc = getServiceClient();
    const { data, error, count } = await svc
      .from('news')
      .select('id,title,slug,status,published_at,created_at,updated_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) throw error;
    res.json({ success: true, data, pagination: paginationMeta(page, limit, count ?? 0) });
  } catch (e) {
    next(e);
  }
});

const patchSchema = newsPatchSchema;

// PUT /api/admin/news/:id
router.put('/:id', async (req, res, next) => {
  try {
    const parsed = patchSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Données invalides.' },
      });
      return;
    }
    const svc = getServiceClient();
    const { data: current } = await svc.from('news').select('status').eq('id', req.params.id).single();
    const payload: Record<string, unknown> = { ...parsed.data };
    // published_at : positionné au premier passage à published
    if (parsed.data.status === 'published' && current?.status !== 'published') {
      payload.published_at = new Date().toISOString();
    }
    if (parsed.data.status === 'draft') payload.published_at = null;
    const { data, error } = await svc
      .from('news')
      .update(payload)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    if (parsed.data.status === 'published' && current?.status !== 'published') {
      pushOnPublish('news_enabled', {
        title: `IPP — ${data.title}`,
        body: 'Nouvelle actualité publiée',
        url: `/IPP/actualites/${data.id}`,
        tag: `news-${data.id}`,
      });
    }
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

// DELETE /api/admin/news/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const svc = getServiceClient();
    const { error } = await svc.from('news').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, data: { id: req.params.id } });
  } catch (e) {
    next(e);
  }
});

export default router;
