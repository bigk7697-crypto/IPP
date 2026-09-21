import { Router } from 'express';

const router = Router();
router.get('/', (_req, res) => {
  // push.configured = VAPID présent (booléen uniquement, aucun secret exposé).
  // Si false → ajouter VAPID_* sur l'hébergeur puis redeployer.
  const pushConfigured = Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
  res.json({
    success: true,
    data: { status: 'ok', service: 'site-scolaire-backend', push: { configured: pushConfigured } },
  });
});
export default router;
