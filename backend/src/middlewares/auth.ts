import jwt from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { db } from '../db';
import { ApiError, asyncHandler } from '../utils/http';
import { hasPermission } from '../auth/permissions';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  roleId: string;
  role: { name: string; label: string; permissions: string[] };
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: SessionUser;
    }
  }
}

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function verifyToken(token: string): { sub: string } | null {
  try {
    return jwt.verify(token, env.jwtSecret) as { sub: string };
  } catch {
    return null;
  }
}

function extractToken(req: Request): string | null {
  const cookieToken = (req.cookies as Record<string, string> | undefined)?.[env.cookieName];
  if (cookieToken) return cookieToken;
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return null;
}

async function resolveUser(userId: string): Promise<SessionUser | null> {
  const user = await db.adminUsers.findById(userId);
  if (!user || user.isActive === false) return null;
  const role = await db.roles.findById(user.roleId);
  if (!role) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    roleId: user.roleId,
    role: {
      name: role.name,
      label: role.label,
      permissions: Array.isArray(role.permissions) ? role.permissions : [],
    },
  };
}

/** Charge l'utilisateur courant si un jeton valide est présent (sans bloquer). */
export const attachUser = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (token) {
    const payload = verifyToken(token);
    if (payload?.sub) {
      const user = await resolveUser(payload.sub);
      if (user) req.user = user;
    }
  }
  next();
});

/** Exige une session valide. */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(ApiError.unauthorized('Session expirée ou inexistante.'));
  next();
}

/** Exige une permission précise sur le rôle courant. */
export function requirePermission(permission: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized('Session expirée ou inexistante.'));
    if (!hasPermission(req.user.role, permission)) {
      return next(ApiError.forbidden("Vous n'avez pas les droits nécessaires pour cette action."));
    }
    next();
  };
}
