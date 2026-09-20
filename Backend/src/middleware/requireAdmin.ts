import type { NextFunction, Request, Response } from 'express';
import { noteSuspicious } from './rateLimit.js';

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') {
    if (req.user) noteSuspicious(req, 'forbidden_admin');
    res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Accès réservé à l’administrateur.' },
    });
    return;
  }
  next();
}
