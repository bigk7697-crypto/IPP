import { Router } from 'express';
import { getAnonClient } from '../config/supabase.js';
import { signedUrl } from '../services/storage.js';
import { paginationMeta, paginationParams } from '../utils/errors.js';
import { escapeIlike, normalizeQuery } from '../utils/search.js';

const router = Router();

// GET /api/documents?q&category — RLS filtre public/privé selon le token.
// Visiteur : documents public+published. Connecté : + private+published.
router.get('/', async (req, res, next) => {
  try {
    const { page, limit, from, to } = paginationParams(req.query);
    const category = typeof req.query.category === 'string' ? req.query.category : '';
    const q = normalizeQuery(req.query.q);
    const token = req.headers.authorization?.replace('Bearer ', '');
    const db = getAnonClient(token);

    let query = db
      .from('documents')
      .select('id,title,description,category,file_path,visibility,published_at', { count: 'exact' })
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(from, to);
    if (category) query = query.eq('category', category);
    if (q) {
      const e = escapeIlike(q);
      query = query.or(`title.ilike.%${e}%,description.ilike.%${e}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    // On ne renvoie jamais file_path brut pour les privés : le front demandera /:id pour la signed URL.
    const safe = (data ?? []).map((d) => ({
      ...d,
      file_path: d.visibility === 'public' ? d.file_path : undefined,
      has_file: true,
    }));
    res.json({ success: true, data: safe, pagination: paginationMeta(page, limit, count ?? 0) });
  } catch (e) {
    next(e);
  }
});

// GET /api/documents/:id — renvoie métadonnées + downloadUrl (signée si privé).
router.get('/:id', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      // Visiteur : on tente en anonyme, RLS refusera les privés.
    }
    const db = getAnonClient(token);
    const { data, error } = await db
      .from('documents')
      .select('id,title,description,category,file_path,visibility,published_at')
      .eq('id', req.params.id)
      .eq('status', 'published')
      .single();
    if (error) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Document introuvable.' },
      });
      return;
    }
    if (data.visibility === 'private' && !token) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Connectez-vous pour ce document.' },
      });
      return;
    }
    const url = await signedUrl(data.file_path, 3600);
    res.json({ success: true, data: { ...data, downloadUrl: url, expiresIn: 3600 } });
  } catch (e) {
    next(e);
  }
});

export default router;
