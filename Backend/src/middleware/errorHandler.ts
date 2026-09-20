import type { NextFunction, Request, Response } from 'express';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error('[backend:error]', err instanceof Error ? err.message : err);
  // Body JSON malformé (body-parser) → 400 propre au lieu de 500
  if (err instanceof SyntaxError && 'body' in (err as any)) {
    res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'Corps JSON invalide.' },
    });
    return;
  }
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Erreur serveur. Réessayez plus tard.' },
  });
}
