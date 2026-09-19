import { Router } from 'express';

const router = Router();
router.get('/', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', service: 'site-scolaire-backend' } });
});
export default router;
