import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import { db } from '../db';
import { ApiError, asyncHandler, created, ok, parseBody, slugify } from '../utils/http';
import { userCreateSchema, userUpdateSchema } from '../validators';
import { logActivity } from '../utils/activity';
import { PERMISSIONS } from '../auth/permissions';

const withoutHash = (user: any) => {
  const { passwordHash, ...rest } = user;
  return rest;
};

/** GET /api/admin/users */
export const adminListUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await db.adminUsers.findMany({ orderBy: { createdAt: 'asc' } });
  const roles = await db.roles.findMany({ orderBy: { name: 'asc' } });
  const roleById = new Map(roles.map((role) => [role.id, role]));
  return ok(res, {
    items: users.map((user) => ({
      ...withoutHash(user),
      role: roleById.get(user.roleId)
        ? { name: roleById.get(user.roleId)!.name, label: roleById.get(user.roleId)!.label }
        : null,
    })),
    roles: roles.map((role) => ({
      id: role.id,
      name: role.name,
      label: role.label,
      description: role.description,
      permissions: role.permissions,
      isSystem: role.isSystem,
    })),
    permissions: PERMISSIONS,
  });
});

/** POST /api/admin/users */
export const adminCreateUser = asyncHandler(async (req: Request, res: Response) => {
  const body = parseBody(userCreateSchema, req.body);
  const email = body.email.toLowerCase().trim();
  if (await db.adminUsers.findOneBy('email', email)) throw ApiError.conflict('Un compte utilise déjà cette adresse e-mail.');
  const role = await db.roles.findById(body.roleId);
  if (!role) throw ApiError.badRequest('Rôle invalide.');

  const user = await db.adminUsers.create({
    name: body.name,
    email,
    passwordHash: await bcrypt.hash(body.password, 10),
    roleId: body.roleId,
    isActive: body.isActive,
    lastLoginAt: null,
  });
  await logActivity({ req, action: 'create', entity: 'adminUser', entityId: user.id, description: `Création du compte de ${user.name} (${role.label})` });
  return created(res, withoutHash(user));
});

/** PUT /api/admin/users/:id */
export const adminUpdateUser = asyncHandler(async (req: Request, res: Response) => {
  const body = parseBody(userUpdateSchema, req.body);
  const existing = await db.adminUsers.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Utilisateur introuvable.');

  if (existing.id === req.user?.id && body.isActive === false) {
    throw ApiError.badRequest('Vous ne pouvez pas désactiver votre propre compte.');
  }

  const data: any = {};
  if (body.name) data.name = body.name;
  if (body.email) data.email = body.email.toLowerCase().trim();
  if (body.roleId) data.roleId = body.roleId;
  if (body.isActive !== undefined) data.isActive = body.isActive;
  if (body.password) data.passwordHash = await bcrypt.hash(body.password, 10);

  const user = await db.adminUsers.update(existing.id, data);
  await logActivity({ req, action: 'update', entity: 'adminUser', entityId: user.id, description: `Mise à jour du compte de ${user.name}` });
  return ok(res, withoutHash(user));
});

/** DELETE /api/admin/users/:id */
export const adminDeleteUser = asyncHandler(async (req: Request, res: Response) => {
  const existing = await db.adminUsers.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Utilisateur introuvable.');
  if (existing.id === req.user?.id) throw ApiError.badRequest('Vous ne pouvez pas supprimer votre propre compte.');

  const total = await db.adminUsers.count();
  if (total <= 1) throw ApiError.badRequest('Au moins un administrateur doit rester actif.');

  await db.adminUsers.remove(existing.id);
  await logActivity({ req, action: 'delete', entity: 'adminUser', entityId: existing.id, description: `Suppression du compte de ${existing.name}` });
  return ok(res, { message: 'Utilisateur supprimé.' });
});

/** POST /api/admin/roles — création d'un rôle personnalisé */
export const adminCreateRole = asyncHandler(async (req: Request, res: Response) => {
  const name = String(req.body?.name ?? '').trim();
  const label = String(req.body?.label ?? '').trim();
  const permissions = req.body?.permissions;
  if (!name || !label) throw ApiError.badRequest('Nom et libellé requis.');
  if (!Array.isArray(permissions)) throw ApiError.badRequest('Liste de permissions invalide.');

  const code = slugify(name);
  if (await db.roles.findOneBy('name', code)) throw ApiError.conflict('Ce rôle existe déjà.');

  const role = await db.roles.create({
    name: code,
    label,
    description: String(req.body?.description ?? ''),
    permissions,
    isSystem: false,
  });
  await logActivity({ req, action: 'create', entity: 'role', entityId: role.id, description: `Création du rôle « ${label} »` });
  return created(res, role);
});
