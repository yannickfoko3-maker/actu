import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import { db } from '../db';
import { env } from '../config/env';
import { signToken } from '../middlewares/auth';
import { ApiError, asyncHandler, ok, parseBody } from '../utils/http';
import { changePasswordSchema, loginSchema } from '../validators';
import { logActivity } from '../utils/activity';
import { hasPermission } from '../auth/permissions';

const cookieOptions = {
  httpOnly: true,
  sameSite: env.cookieSameSite,
  secure: env.cookieSecure,
  path: '/',
};

/** POST /api/auth/login */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = parseBody(loginSchema, req.body);
  const user = await db.adminUsers.findOneBy('email', email.toLowerCase().trim());

  if (!user || user.isActive === false) {
    throw ApiError.unauthorized('Identifiants incorrects.');
  }
  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    throw ApiError.unauthorized('Identifiants incorrects.');
  }

  const role = await db.roles.findById(user.roleId);
  if (!role) throw ApiError.forbidden('Aucun rôle associé à ce compte.');

  const token = signToken(user.id);
  res.cookie(env.cookieName, token, { ...cookieOptions, maxAge: 8 * 60 * 60 * 1000 });
  await db.adminUsers.update(user.id, { lastLoginAt: new Date().toISOString() });
  await logActivity({
    req,
    userId: user.id,
    userName: user.name,
    action: 'login',
    entity: 'session',
    description: `Connexion de ${user.name} (${role.label})`,
  });

  return ok(res, {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      roleId: user.roleId,
      role: { name: role.name, label: role.label, permissions: role.permissions ?? [] },
    },
  });
});

/** GET /api/auth/me */
export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized('Session expirée.');
  const user = await db.adminUsers.findById(req.user.id);
  if (!user) throw ApiError.unauthorized('Compte introuvable.');
  return ok(res, {
    id: user.id,
    name: user.name,
    email: user.email,
    roleId: user.roleId,
    lastLoginAt: user.lastLoginAt,
    role: req.user.role,
    permissions: req.user.role.permissions,
  });
});

/** POST /api/auth/logout */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie(env.cookieName, { ...cookieOptions });
  if (req.user) {
    await logActivity({
      req,
      action: 'logout',
      entity: 'session',
      description: `Déconnexion de ${req.user.name}`,
    });
  }
  return ok(res, { message: 'Déconnexion effectuée.' });
});

/** POST /api/auth/password */
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { currentPassword, newPassword } = parseBody(changePasswordSchema, req.body);
  const user = await db.adminUsers.findById(req.user.id);
  if (!user) throw ApiError.unauthorized();

  const matches = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!matches) throw ApiError.badRequest('Le mot de passe actuel est incorrect.');

  await db.adminUsers.update(user.id, { passwordHash: await bcrypt.hash(newPassword, 10) });
  await logActivity({ req, action: 'update', entity: 'adminUser', entityId: user.id, description: 'Modification du mot de passe' });
  return ok(res, { message: 'Mot de passe mis à jour.' });
});

/** GET /api/auth/can/:permission — utilitaire pour l'affichage conditionnel côté admin */
export const can = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  return ok(res, { allowed: hasPermission(req.user.role, req.params.permission) });
});
