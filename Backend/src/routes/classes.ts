import { Router } from 'express';
import { getAnonClient } from '../config/supabase.js';
import { paginationMeta, paginationParams } from '../utils/errors.js';
import { escapeIlike, normalizeQuery } from '../utils/search.js';

const router = Router();

// GET /api/classes — publiques et actives
router.get('/', async (req, res, next) => {
  try {
    const { page, limit, from, to } = paginationParams(req.query);
    const q = normalizeQuery(req.query.q);
    const db = getAnonClient();
    let query = db
      .from('classes')
      .select('id,name,level,series,academic_year,is_active', { count: 'exact' })
      .eq('is_active', true)
      .order('name')
      .range(from, to);
    if (q) {
      const e = escapeIlike(q);
      query = query.or(`name.ilike.%${e}%,level.ilike.%${e}%,series.ilike.%${e}%`);
    }
    const { data, error, count } = await query;
    if (error) throw error;
    res.json({ success: true, data, pagination: paginationMeta(page, limit, count ?? 0) });
  } catch (e) {
    next(e);
  }
});

// GET /api/classes/:id — détail
router.get('/:id', async (req, res, next) => {
  try {
    const db = getAnonClient();
    const { data, error } = await db
      .from('classes')
      .select('id,name,level,series,academic_year,is_active,created_at')
      .eq('id', req.params.id)
      .single();
    if (error) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Classe introuvable.' } });
      return;
    }
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

export default router;
