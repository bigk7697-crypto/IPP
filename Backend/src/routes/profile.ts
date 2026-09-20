import { Router } from 'express';
import { getServiceClient } from '../config/supabase.js';
import { auth } from '../middleware/auth.js';
import { profilePatchSchema } from '../validators/profile.js';

const router = Router();
router.use(auth);

const patchSchema = profilePatchSchema;

// GET /api/profile
router.get('/', async (req, res, next) => {
  try {
    const svc = getServiceClient();
    const { data, error } = await svc
      .from('profiles')
      .select('id,first_name,last_name,email,role,avatar_url,created_at,updated_at')
      .eq('id', req.user!.id)
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

// PATCH /api/profile
router.patch('/', async (req, res, next) => {
  try {
    const parsed = patchSchema.safeParse(req.body);
    if (!parsed.success || Object.keys(parsed.data).length === 0) {
      res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'first_name ou last_name requis.' },
      });
      return;
    }
    const svc = getServiceClient();
    const { data, error } = await svc
      .from('profiles')
      .update(parsed.data)
      .eq('id', req.user!.id)
      .select('id,first_name,last_name,email,role,avatar_url,created_at,updated_at')
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

export default router;
