import { Router } from 'express';
import { getAnonClient } from '../config/supabase.js';
import { paginationMeta, paginationParams } from '../utils/errors.js';
import { escapeIlike, normalizeQuery } from '../utils/search.js';

const router = Router();

// GET /api/events — publiés uniquement
router.get('/', async (req, res, next) => {
  try {
    const { page, limit, from, to } = paginationParams(req.query);
    const q = normalizeQuery(req.query.q);
    const token = req.headers.authorization?.replace('Bearer ', '');
    const db = getAnonClient(token);
    let query = db
      .from('events')
      .select('id,title,description,image_path,location,start_at,end_at,status', { count: 'exact' })
      .eq('status', 'published')
      .order('start_at', { ascending: true })
      .range(from, to);
    if (q) {
      const e = escapeIlike(q);
      query = query.or(`title.ilike.%${e}%,description.ilike.%${e}%`);
    }
    const { data, error, count } = await query;
    if (error) throw error;
    res.json({ success: true, data, pagination: paginationMeta(page, limit, count ?? 0) });
  } catch (e) {
    next(e);
  }
});

// GET /api/events/:id — détail publié
router.get('/:id', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const db = getAnonClient(token);
    const { data, error } = await db
      .from('events')
      .select('id,title,description,image_path,location,start_at,end_at,status,published_at,created_at')
      .eq('id', req.params.id)
      .eq('status', 'published')
      .single();
    if (error) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Événement introuvable.' } });
      return;
    }
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

export default router;
