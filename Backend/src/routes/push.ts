import { Router } from 'express';
import { z } from 'zod';
import { getServiceClient } from '../config/supabase.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// POST /api/push/subscribe — enregistre l'abonnement Web Push du navigateur
router.post('/subscribe', auth, async (req, res, next) => {
  try {
    const schema = z.object({
      endpoint: z.string().url(),
      keys: z.object({ p256dh: z.string().min(10), auth: z.string().min(10) }),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Abonnement invalide.' } });
      return;
    }
    const svc = getServiceClient();
    const { error } = await svc.from('push_subscriptions').upsert(
      {
        user_id: req.user!.id,
        endpoint: parsed.data.endpoint,
        p256dh: parsed.data.keys.p256dh,
        auth: parsed.data.keys.auth,
      },
      { onConflict: 'user_id,endpoint' }
    );
    if (error) throw error;
    res.json({ success: true, data: { ok: true } });
  } catch (e) {
    next(e);
  }
});

// DELETE /api/push/subscribe — désabonnement
router.delete('/subscribe', auth, async (req, res, next) => {
  try {
    const { endpoint } = req.body as { endpoint?: string };
    const svc = getServiceClient();
    const q = svc.from('push_subscriptions').delete().eq('user_id', req.user!.id);
    if (endpoint) q.eq('endpoint', endpoint);
    const { error } = await q;
    if (error) throw error;
    res.json({ success: true, data: { ok: true } });
  } catch (e) {
    next(e);
  }
});

export default router;
