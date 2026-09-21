import { Router } from 'express';
import { getServiceClient } from '../config/supabase.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { unansweredSchema } from '../validators/orientation.js';

const router = Router();

const PUBLIC_COLS = 'slug,category,title,content,keywords,updated_at';

// GET /api/orientation/topics — base de connaissances publiée (?category=filieres|infos)
router.get('/topics', async (req, res, next) => {
  try {
    const svc = getServiceClient();
    let q = svc
      .from('orientation_topics')
      .select(PUBLIC_COLS)
      .eq('is_published', true)
      .order('sort_order', { ascending: true })
      .order('title', { ascending: true });
    if (req.query.category === 'filieres' || req.query.category === 'infos') {
      q = q.eq('category', req.query.category);
    }
    const { data, error } = await q;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

// GET /api/orientation/topics/:slug — fiche publiée
router.get('/topics/:slug', async (req, res, next) => {
  try {
    const svc = getServiceClient();
    const { data, error } = await svc
      .from('orientation_topics')
      .select(PUBLIC_COLS)
      .eq('is_published', true)
      .eq('slug', req.params.slug)
      .single();
    if (error) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Fiche introuvable.' } });
      return;
    }
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

// POST /api/orientation/unanswered — journalise une question sans réponse (anti-spam)
router.post('/unanswered', authLimiter, async (req, res, next) => {
  try {
    const parsed = unansweredSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Question invalide.',
          details: parsed.error.flatten(),
        },
      });
      return;
    }
    const svc = getServiceClient();
    const { error } = await svc.from('orientation_unanswered').insert({
      question: parsed.data.question,
      source: parsed.data.source,
    });
    if (error) throw error;
    res.status(201).json({ success: true, data: { ok: true } });
  } catch (e) {
    next(e);
  }
});

export default router;
