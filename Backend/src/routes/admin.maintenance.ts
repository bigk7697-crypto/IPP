import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { requireMfa } from '../middleware/requireMfa.js';
import { adminLimiter } from '../middleware/rateLimit.js';
import { INACTIVE_DAYS, purgeInactiveUsers } from '../services/maintenance.js';

const router = Router();
router.use(auth, adminLimiter, requireAdmin, requireMfa);

// POST /api/admin/maintenance/purge-inactive — purge manuelle des comptes
// inactifs depuis 60+ jours (hors admins). La purge auto tourne aussi
// quotidiennement au démarrage du serveur.
router.post('/purge-inactive', async (_req, res, next) => {
  try {
    const result = await purgeInactiveUsers();
    res.json({ success: true, data: { inactive_days: INACTIVE_DAYS, ...result } });
  } catch (e) {
    next(e);
  }
});

export default router;
