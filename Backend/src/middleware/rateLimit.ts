import type { NextFunction, Request, Response } from 'express';

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Rate-limit en mémoire (suffisant pour 1 instance Render free).
// key = ip + ':' + name. Réponse 429 {code:'RATE_LIMITED'} + header Retry-After.
export function rateLimit(name: string, max: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown';
    const key = `${name}:${ip}`;
    const now = Date.now();
    let b = buckets.get(key);
    if (!b || now >= b.resetAt) {
      b = { count: 0, resetAt: now + windowMs };
      buckets.set(key, b);
    }
    b.count += 1;
    if (b.count > max) {
      const retryAfter = Math.ceil((b.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfter));
      res.status(429).json({
        success: false,
        error: { code: 'RATE_LIMITED', message: 'Trop de requêtes. Réessayez dans quelques minutes.' },
      });
      return;
    }
    next();
  };
}

// Nettoyage périodique des buckets expirés (toutes les 5 min)
setInterval(() => {
  const now = Date.now();
  for (const [k, b] of buckets) {
    if (now >= b.resetAt) buckets.delete(k);
  }
}, 5 * 60 * 1000).unref?.();

// 100 req / 15 min sur tout /api/admin/* (anti brute-force)
// 60 req / 15 min sur /api/auth/me (énumération)
export const adminLimiter = rateLimit('admin', 100, 15 * 60 * 1000);
export const authLimiter = rateLimit('auth', 60, 15 * 60 * 1000);
