import { Router } from 'express';
import { getAnonClient } from '../config/supabase.js';
import { paginationMeta, paginationParams } from '../utils/errors.js';

const router = Router();

// GET /api/gallery — alias albums (compat spec GET /api/gallery)
router.get('/', async (req, res, next) => {
  try {
    const { page, limit, from, to } = paginationParams(req.query);
    const db = getAnonClient();
    const { data, error, count } = await db
      .from('gallery_albums')
      .select('id,title,description,cover_image_path,created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) throw error;
    res.json({ success: true, data, pagination: paginationMeta(page, limit, count ?? 0) });
  } catch (e) {
    next(e);
  }
});

// GET /api/gallery/:id — alias album détail
router.get('/:id', async (req, res, next) => {
  try {
    if (req.params.id === 'albums') return next();
    const db = getAnonClient();
    const { data: album, error: aErr } = await db
      .from('gallery_albums')
      .select('id,title,description,cover_image_path,created_at')
      .eq('id', req.params.id)
      .single();
    if (aErr) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Album introuvable.' } });
      return;
    }
    const { data: images, error: iErr } = await db
      .from('gallery_images')
      .select('id,image_path,caption,sort_order')
      .eq('album_id', req.params.id)
      .order('sort_order');
    if (iErr) throw iErr;
    res.json({ success: true, data: { ...album, images } });
  } catch (e) {
    next(e);
  }
});

// GET /api/gallery/albums
router.get('/albums', async (req, res, next) => {
  try {
    const { page, limit, from, to } = paginationParams(req.query);
    const db = getAnonClient();
    const { data, error, count } = await db
      .from('gallery_albums')
      .select('id,title,description,cover_image_path,created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) throw error;
    res.json({ success: true, data, pagination: paginationMeta(page, limit, count ?? 0) });
  } catch (e) {
    next(e);
  }
});

// GET /api/gallery/albums/:id — album + photos triées
router.get('/albums/:id', async (req, res, next) => {
  try {
    const db = getAnonClient();
    const { data: album, error: aErr } = await db
      .from('gallery_albums')
      .select('id,title,description,cover_image_path,created_at')
      .eq('id', req.params.id)
      .single();
    if (aErr) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Album introuvable.' },
      });
      return;
    }
    const { data: images, error: iErr } = await db
      .from('gallery_images')
      .select('id,image_path,caption,sort_order')
      .eq('album_id', req.params.id)
      .order('sort_order');
    if (iErr) throw iErr;
    res.json({ success: true, data: { ...album, images } });
  } catch (e) {
    next(e);
  }
});

export default router;
