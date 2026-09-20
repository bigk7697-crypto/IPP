import type { NextFunction, Request, Response } from 'express';
import { getAnonClient, getServiceClient } from '../config/supabase.js';
import { noteSuspicious } from './rateLimit.js';
import type { AuthUser } from '../types/index.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      accessToken?: string;
    }
  }
}

// Vérifie le JWT Supabase transmis en Authorization: Bearer <token>.
// Remplit req.user avec id + role lu depuis profiles (source vérité DB).
export async function auth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Vous devez être connecté.' },
      });
      return;
    }
    const token = header.slice('Bearer '.length);
    req.accessToken = token;

    const anon = getAnonClient(token);
    const { data, error } = await anon.auth.getUser(token);
    if (error || !data.user) {
      noteSuspicious(req, 'bad_token');
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Session invalide ou expirée.' },
      });
      return;
    }

    const svc = getServiceClient();
    const { data: profile } = await svc
      .from('profiles')
      .select('id, role')
      .eq('id', data.user.id)
      .single();

    req.user = {
      id: data.user.id,
      email: data.user.email ?? undefined,
      role: (profile?.role as AuthUser['role']) ?? 'user',
    };
    next();
  } catch {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentification requise.' },
    });
  }
}
