import { Router } from 'express';
import { getServiceClient } from '../config/supabase.js';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { requireMfa } from '../middleware/requireMfa.js';
import { adminLimiter } from '../middleware/rateLimit.js';
import { settingsSchema } from '../validators/settings.js';

const router = Router();
router.use(auth, adminLimiter, requireAdmin, requireMfa);

const schema = settingsSchema;

// PATCH /api/admin/settings — singleton id=1
router.patch('/', async (req, res, next) => {
  try {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success || Object.keys(parsed.data).length === 0) {
      res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Au moins un champ requis.' },
      });
      return;
    }
    const svc = getServiceClient();
    const { data, error } = await svc
      .from('school_settings')
      .update(parsed.data)
      .eq('id', 1)
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

export default router;
