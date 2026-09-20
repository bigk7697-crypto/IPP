import { Router } from 'express';
import { z } from 'zod';
import { getAnonClient, getServiceClient } from '../config/supabase.js';
import { auth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();

// GET /api/auth/me — session + profil + rôle (source vérité DB)
router.get('/me', authLimiter, auth, async (req, res, next) => {
  try {
    const svc = getServiceClient();
    const { data: profile } = await svc
      .from('profiles')
      .select('id,first_name,last_name,email,role,avatar_url,created_at')
      .eq('id', req.user!.id)
      .single();

    // Email vérifié ? lu depuis Auth (pas depuis profiles)
    const anon = getAnonClient(req.accessToken);
    const { data } = await anon.auth.getUser(req.accessToken!);

    res.json({
      success: true,
      data: {
        ...profile,
        email_verified: Boolean(data.user?.email_confirmed_at),
      },
    });
  } catch (e) {
    next(e);
  }
});

export default router;
