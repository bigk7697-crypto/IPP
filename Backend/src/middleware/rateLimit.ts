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

// 2e couche : 300 req / 15 min par utilisateur authentifié (résiste au
// brute-force distribué qui change d'IP : le user id ne change pas).
export function userLimiter(req: Request, res: Response, next: NextFunction) {
  const uid = req.user?.id;
  if (!uid) return next();
  const key = `user:${uid}`;
  const now = Date.now();
  let b = buckets.get(key);
  if (!b || now >= b.resetAt) {
    b = { count: 0, resetAt: now + 15 * 60 * 1000 };
    buckets.set(key, b);
  }
  b.count += 1;
  if (b.count > 300) {
    res.status(429).json({
      success: false,
      error: { code: 'RATE_LIMITED', message: 'Trop de requêtes. Réessayez dans quelques minutes.' },
    });
    return;
  }
  next();
}

// Journalisation anti brute-force : compte les échecs d'auth par IP et
// alerte (console.warn exploitable par Render/Datadog) aux seuils.
const failures = new Map<string, { count: number; resetAt: number }>();
export function noteSuspicious(req: Request, reason: 'bad_token' | 'mfa_failed' | 'forbidden_admin') {
  const ip =
    (req.headers?.['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown';
  const now = Date.now();
  const key = `${reason}:${ip}`;
  let f = failures.get(key);
  if (!f || now >= f.resetAt) {
    f = { count: 0, resetAt: now + 15 * 60 * 1000 };
    failures.set(key, f);
  }
  f.count += 1;
  if (f.count === 10 || f.count === 50 || f.count % 100 === 0) {
    console.warn(`[security] ${f.count} échecs "${reason}" depuis ${ip} en 15 min (path: ${req.path})`);
  }
}
