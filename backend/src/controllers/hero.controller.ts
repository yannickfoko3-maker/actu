import type { Request, Response } from 'express';
import { db } from '../db';
import { ApiError, asyncHandler, created, ok, parseBody } from '../utils/http';
import { heroSlideSchema, reorderSchema } from '../validators';
import { logActivity } from '../utils/activity';

/** GET /api/public/hero */
export const listPublicSlides = asyncHandler(async (_req: Request, res: Response) => {
  const slides = await db.heroSlides.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } });
  return ok(res, slides);
});

/** GET /api/admin/hero */
export const adminListSlides = asyncHandler(async (_req: Request, res: Response) => {
  const slides = await db.heroSlides.findMany({ orderBy: { order: 'asc' } });
  return ok(res, slides);
});

/** POST /api/admin/hero */
export const adminCreateSlide = asyncHandler(async (req: Request, res: Response) => {
  const body = parseBody(heroSlideSchema, req.body);
  const existing = await db.heroSlides.findMany({ orderBy: { order: 'desc' }, take: 1 });
  const slide = await db.heroSlides.create({
    ...body,
    eyebrow: body.eyebrow || null,
    order: body.order || (existing[0]?.order ?? 0) + 1,
  });
  await logActivity({ req, action: 'create', entity: 'heroSlide', entityId: slide.id, description: `Ajout d’une diapositive : « ${slide.title} »` });
  return created(res, slide);
});

/** PUT /api/admin/hero/:id */
export const adminUpdateSlide = asyncHandler(async (req: Request, res: Response) => {
  const body = parseBody(heroSlideSchema, req.body);
  const existing = await db.heroSlides.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Diapositive introuvable.');
  const slide = await db.heroSlides.update(existing.id, { ...body, eyebrow: body.eyebrow || null });
  await logActivity({ req, action: 'update', entity: 'heroSlide', entityId: slide.id, description: `Mise à jour de la diapositive « ${slide.title} »` });
  return ok(res, slide);
});

/** PATCH /api/admin/hero/:id/toggle */
export const adminToggleSlide = asyncHandler(async (req: Request, res: Response) => {
  const existing = await db.heroSlides.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Diapositive introuvable.');
  const slide = await db.heroSlides.update(existing.id, { isActive: !existing.isActive });
  await logActivity({
    req,
    action: slide.isActive ? 'publish' : 'unpublish',
    entity: 'heroSlide',
    entityId: slide.id,
    description: `Diapositive « ${slide.title} » ${slide.isActive ? 'activée' : 'désactivée'}`,
  });
  return ok(res, slide);
});

/** DELETE /api/admin/hero/:id */
export const adminDeleteSlide = asyncHandler(async (req: Request, res: Response) => {
  const existing = await db.heroSlides.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Diapositive introuvable.');
  await db.heroSlides.remove(existing.id);
  await logActivity({ req, action: 'delete', entity: 'heroSlide', entityId: existing.id, description: `Suppression de la diapositive « ${existing.title} »` });
  return ok(res, { message: 'Diapositive supprimée.' });
});

/** PATCH /api/admin/hero/reorder */
export const adminReorderSlides = asyncHandler(async (req: Request, res: Response) => {
  const { items } = parseBody(reorderSchema, req.body);
  for (const item of items) {
    await db.heroSlides.update(item.id, { order: item.order });
  }
  await logActivity({ req, action: 'reorder', entity: 'heroSlide', description: 'Réorganisation du carrousel' });
  return ok(res, { message: 'Ordre enregistré.' });
});
