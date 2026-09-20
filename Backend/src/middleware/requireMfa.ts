import type { NextFunction, Request, Response } from 'express';

// Vérifie que le JWT Supabase a un niveau d'assurance aal2 (MFA TOTP vérifié).
// À placer APRÈS auth + requireAdmin sur les routes /api/admin/*.
// Le JWT est déjà validé par le middleware auth (anon.auth.getUser) ; ici on
// ne fait que lire le claim `aal` (décodage base64url, pas de crypto).
export function requireMfa(req: Request, res: Response, next: NextFunction) {
  const token = req.accessToken;
  if (!token) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Vous devez être connecté.' },
    });
    return;
  }
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('bad jwt');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    const aal: string | undefined = payload.aal;
    const amr: Array<{ method?: string }> | undefined = payload.amr;
    const hasMfa = aal === 'aal2' || (Array.isArray(amr) && amr.some((m) => m?.method && m.method !== 'password'));
    if (!hasMfa) {
      res.status(403).json({
        success: false,
        error: {
          code: 'MFA_REQUIRED',
          message: 'Vérification à deux facteurs requise pour l’administration.',
        },
      });
      return;
    }
    next();
  } catch {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Session invalide ou expirée.' },
    });
  }
}
