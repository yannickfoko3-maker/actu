import type { Request, Response } from 'express';
import { db } from '../db';
import { ApiError, asyncHandler, created, getPagination, ok, paginate, parseBody, sanitizeHtml, slugify } from '../utils/http';
import { pageSchema } from '../validators';
import { logActivity } from '../utils/activity';

/** GET /api/public/pages/:slug */
export const getPublicPage = asyncHandler(async (req: Request, res: Response) => {
  const page = await db.pages.findOneBy('slug', req.params.slug);
  if (!page || page.status !== 'PUBLISHED') throw ApiError.notFound('Page introuvable.');
  return ok(res, page);
});

/** GET /api/public/pages */
export const listPublicPages = asyncHandler(async (_req: Request, res: Response) => {
  const pages = await db.pages.findMany({ where: { status: 'PUBLISHED' }, orderBy: { createdAt: 'asc' } });
  return ok(res, pages.map((page) => ({ slug: page.slug, title: page.title, subtitle: page.subtitle })));
});

/** GET /api/admin/pages */
export const adminListPages = asyncHandler(async (req: Request, res: Response) => {
  const pagination = getPagination(req, 50);
  const search = String(req.query.search ?? '').trim();
  const where = search ? { title: { contains: search } } : {};
  const total = await db.pages.count(where);
  const pages = await db.pages.findMany({ where, orderBy: { title: 'asc' }, take: pagination.limit, skip: pagination.skip });
  return ok(res, paginate(pages, total, pagination));
});

/** GET /api/admin/pages/:id */
export const adminGetPage = asyncHandler(async (req: Request, res: Response) => {
  const page = await db.pages.findById(req.params.id);
  if (!page) throw ApiError.notFound('Page introuvable.');
  return ok(res, page);
});

/** POST /api/admin/pages */
export const adminCreatePage = asyncHandler(async (req: Request, res: Response) => {
  const body = parseBody(pageSchema, req.body);
  const slug = body.slug || slugify(body.title);
  if (await db.pages.findOneBy('slug', slug)) throw ApiError.conflict('Ce slug est déjà utilisé.');
  const page = await db.pages.create({
    slug,
    title: body.title,
    subtitle: body.subtitle || null,
    heroImage: body.heroImage || null,
    content: sanitizeHtml(body.content),
    seoTitle: body.seoTitle || null,
    seoDescription: body.seoDescription || null,
    status: body.status,
    system: false,
  });
  await logActivity({ req, action: 'create', entity: 'page', entityId: page.id, description: `Création de la page « ${page.title} »` });
  return created(res, page);
});

/** PUT /api/admin/pages/:id */
export const adminUpdatePage = asyncHandler(async (req: Request, res: Response) => {
  const body = parseBody(pageSchema, req.body);
  const existing = await db.pages.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Page introuvable.');
  const slug = existing.slug === 'mentions-legales' || existing.system ? existing.slug : body.slug || existing.slug;

  const page = await db.pages.update(existing.id, {
    slug,
    title: body.title,
    subtitle: body.subtitle || null,
    heroImage: body.heroImage || null,
    content: sanitizeHtml(body.content),
    seoTitle: body.seoTitle || null,
    seoDescription: body.seoDescription || null,
    status: body.status,
  });
  await logActivity({ req, action: 'update', entity: 'page', entityId: page.id, description: `Mise à jour de la page « ${page.title} »` });
  return ok(res, page);
});

/** DELETE /api/admin/pages/:id */
export const adminDeletePage = asyncHandler(async (req: Request, res: Response) => {
  const page = await db.pages.findById(req.params.id);
  if (!page) throw ApiError.notFound('Page introuvable.');
  if (page.system) throw ApiError.badRequest('Cette page est essentielle au site et ne peut pas être supprimée.');
  await db.pages.remove(page.id);
  await logActivity({ req, action: 'delete', entity: 'page', entityId: page.id, description: `Suppression de la page « ${page.title} »` });
  return ok(res, { message: 'Page supprimée.' });
});
