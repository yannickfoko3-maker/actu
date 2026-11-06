import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { ApiError } from '../utils/http';

export const CSRF_COOKIE = 'aces_csrf';

/**
 * Protection CSRF par double soumission de jeton.
 *
 * - À la connexion, un jeton aléatoire est déposé dans un cookie lisible.
 * - Le client le renvoie dans l'en-tête `X-CSRF-Token`.
 * - Les requêtes mutantes authentifiées par cookie sont refusées si les deux
 *   valeurs diffèrent.
 *
 * Les appels authentifiés par en-tête `Authorization: Bearer` ne sont pas
 * concernés (un en-tête personnalisé n'est pas forgeable par un formulaire tiers).
 */
export function issueCsrfToken(res: Response): string {
  const token = crypto.randomBytes(24).toString('hex');
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,
    sameSite: 'lax',
    secure: env.cookieSecure,
    path: '/',
  });
  return token;
}

export function clearCsrfToken(res: Response): void {
  res.clearCookie(CSRF_COOKIE, { path: '/' });
}

export function requireCsrf(req: Request, _res: Response, next: NextFunction) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();

  const authCookie = (req.cookies as Record<string, string> | undefined)?.[env.cookieName];
  if (!authCookie) return next(); // pas de session cookie : rien à protéger ici

  const headerToken = req.headers['x-csrf-token'];
  const cookieToken = (req.cookies as Record<string, string> | undefined)?.[CSRF_COOKIE];

  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return next(ApiError.forbidden('Jeton CSRF invalide ou absent. Rechargez la page et réessayez.'));
  }
  next();
}
