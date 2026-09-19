import { Router } from 'express';
import { getAnonClient } from '../config/supabase.js';

const router = Router();

// GET /api/settings — infos école (nom, logo, contacts...) pour le front public
router.get('/', async (_req, res, next) => {
  try {
    const db = getAnonClient();
    const { data, error } = await db.from('school_settings').select('*').eq('id', 1).single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

export default router;
