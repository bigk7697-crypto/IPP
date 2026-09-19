import { Router } from 'express';
import { getServiceClient } from '../config/supabase.js';
import { auth } from '../middleware/auth.js';
import { preferencesPatchSchema } from '../validators/preferences.js';

const router = Router();
router.use(auth);

const patchSchema = preferencesPatchSchema;

// GET /api/notification-preferences
router.get('/', async (req, res, next) => {
  try {
    const svc = getServiceClient();
    const { data } = await svc
      .from('notification_preferences')
      .select('*')
      .eq('user_id', req.user!.id)
      .single();
    res.json({
      success: true,
      data: data ?? {
        user_id: req.user!.id,
        news_enabled: true,
        events_enabled: true,
        results_enabled: true,
        documents_enabled: true,
        calendar_enabled: true,
        system_enabled: true,
      },
    });
  } catch (e) {
    next(e);
  }
});

// PATCH /api/notification-preferences
router.patch('/', async (req, res, next) => {
  try {
    const parsed = patchSchema.safeParse(req.body);
    if (!parsed.success || Object.keys(parsed.data).length === 0) {
      res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Au moins une préférence requise.' },
      });
      return;
    }
    const svc = getServiceClient();
    const { data, error } = await svc
      .from('notification_preferences')
      .upsert({ user_id: req.user!.id, ...parsed.data }, { onConflict: 'user_id' })
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

export default router;
