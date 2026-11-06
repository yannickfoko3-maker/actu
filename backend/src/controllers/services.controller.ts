import type { Request, Response } from 'express';
import { db } from '../db';
import { ApiError, asyncHandler, created, getPagination, ok, paginate, parseBody, sanitizeHtml, slugify } from '../utils/http';
import { reorderSchema, serviceSchema } from '../validators';
import { logActivity } from '../utils/activity';

/** Assemble une prestation avec ses images de galerie. */
export async function hydrateService(service: any) {
  const images = await db.serviceImages.findMany({
    where: { serviceId: service.id },
    orderBy: { order: 'asc' },
  });
  return {
    ...service,
    images: images.map((image) => ({ id: image.id, url: image.url, alt: image.alt })),
    imagesCount: images.length,
  };
}

function deriveToc(description: string) {
  const matches = [...description.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)];
  return matches.map((match, index) => ({
    id: slugify(match[1].replace(/<[^>]+>/g, '')),
    label: match[1].replace(/<[^>]+>/g, '').trim(),
    order: index,
  }));
}

/** GET /api/public/services */
export const listPublicServices = asyncHandler(async (_req: Request, res: Response) => {
  const services = await db.services.findMany({
    where: { isPublished: true },
    orderBy: { order: 'asc' },
  });
  const hydrated = await Promise.all(services.map(hydrateService));
  return ok(
    res,
    hydrated.map((service) => ({ ...service, toc: deriveToc(service.description) }))
  );
});

/** GET /api/public/services/:slug */
export const getPublicService = asyncHandler(async (req: Request, res: Response) => {
  const service = await db.services.findOneBy('slug', req.params.slug);
  if (!service || !service.isPublished) throw ApiError.notFound('Cette prestation est introuvable.');

  const hydrated = await hydrateService(service);
  const all = await db.services.findMany({ where: { isPublished: true }, orderBy: { order: 'asc' } });
  const relatedServices = all
    .filter((item) => item.id !== service.id)
    .slice(0, 3)
    .map((item) => ({
      slug: item.slug,
      title: item.title,
      tagline: item.tagline,
      coverImage: item.coverImage,
      icon: item.icon,
    }));
  const relatedProjects = await db.projects.findMany({
    where: { isPublished: true, category: service.slug },
    orderBy: { order: 'asc' },
    take: 3,
  });

  return ok(res, {
    ...hydrated,
    toc: deriveToc(service.description),
    relatedServices,
    relatedProjects: relatedProjects.map((project) => ({
      slug: project.slug,
      title: project.title,
      summary: project.summary,
      coverImage: project.coverImage,
      location: project.location,
      year: project.year,
    })),
  });
});

/** GET /api/admin/services */
export const adminListServices = asyncHandler(async (req: Request, res: Response) => {
  const pagination = getPagination(req, 20);
  const search = String(req.query.search ?? '').trim();
  const status = String(req.query.status ?? '').trim();

  const where: any = {};
  if (search) where.title = { contains: search };
  if (status === 'published') where.isPublished = true;
  if (status === 'draft') where.isPublished = false;

  const total = await db.services.count(where);
  const services = await db.services.findMany({
    where,
    orderBy: { order: 'asc' },
    take: pagination.limit,
    skip: pagination.skip,
  });
  const items = await Promise.all(services.map(hydrateService));
  return ok(res, paginate(items, total, pagination));
});

/** GET /api/admin/services/:id */
export const adminGetService = asyncHandler(async (req: Request, res: Response) => {
  const service = await db.services.findById(req.params.id);
  if (!service) throw ApiError.notFound('Prestation introuvable.');
  return ok(res, await hydrateService(service));
});

async function syncImages(serviceId: string, images: { url: string; alt: string }[] = []) {
  await db.serviceImages.removeMany({ serviceId });
  for (const [index, image] of images.entries()) {
    await db.serviceImages.create({ serviceId, url: image.url, alt: image.alt, order: index });
  }
}

function servicePayload(body: any) {
  return {
    title: body.title,
    tagline: body.tagline,
    shortDescription: body.shortDescription,
    description: sanitizeHtml(body.description),
    icon: body.icon,
    heroImage: body.heroImage,
    coverImage: body.coverImage,
    benefits: body.benefits,
    features: body.features,
    applications: body.applications,
    process: body.process,
    equipment: body.equipment,
    faqs: body.faqs,
    seoTitle: body.seoTitle || null,
    seoDescription: body.seoDescription || null,
    order: body.order,
    isPublished: body.isPublished,
  };
}

/** POST /api/admin/services */
export const adminCreateService = asyncHandler(async (req: Request, res: Response) => {
  const body = parseBody(serviceSchema, req.body);
  const slug = body.slug || slugify(body.title);
  const existing = await db.services.findOneBy('slug', slug);
  if (existing) throw ApiError.conflict('Une prestation utilise déjà ce slug.');

  const maxOrder = await db.services.findMany({ orderBy: { order: 'desc' }, take: 1 });
  const service = await db.services.create({
    ...servicePayload(body),
    slug,
    order: body.order || (maxOrder[0]?.order ?? 0) + 1,
  });
  await syncImages(service.id, body.images);
  await logActivity({
    req,
    action: 'create',
    entity: 'service',
    entityId: service.id,
    description: `Création de la prestation « ${service.title} »`,
  });
  return created(res, await hydrateService(service));
});

/** PUT /api/admin/services/:id */
export const adminUpdateService = asyncHandler(async (req: Request, res: Response) => {
  const body = parseBody(serviceSchema, req.body);
  const existing = await db.services.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Prestation introuvable.');

  const slug = body.slug || existing.slug;
  if (slug !== existing.slug) {
    const conflict = await db.services.findOneBy('slug', slug);
    if (conflict) throw ApiError.conflict('Une autre prestation utilise déjà ce slug.');
  }

  const service = await db.services.update(existing.id, { ...servicePayload(body), slug });
  await syncImages(service.id, body.images);
  await logActivity({
    req,
    action: 'update',
    entity: 'service',
    entityId: service.id,
    description: `Mise à jour de la prestation « ${service.title} »`,
  });
  return ok(res, await hydrateService(service));
});

/** PATCH /api/admin/services/:id/publish */
export const adminToggleService = asyncHandler(async (req: Request, res: Response) => {
  const existing = await db.services.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Prestation introuvable.');
  const service = await db.services.update(existing.id, { isPublished: !existing.isPublished });
  await logActivity({
    req,
    action: service.isPublished ? 'publish' : 'unpublish',
    entity: 'service',
    entityId: service.id,
    description: `${service.isPublished ? 'Publication' : 'Dépublication'} de « ${service.title} »`,
  });
  return ok(res, service);
});

/** DELETE /api/admin/services/:id */
export const adminDeleteService = asyncHandler(async (req: Request, res: Response) => {
  const existing = await db.services.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Prestation introuvable.');
  await db.serviceImages.removeMany({ serviceId: existing.id });
  await db.services.remove(existing.id);
  await logActivity({
    req,
    action: 'delete',
    entity: 'service',
    entityId: existing.id,
    description: `Suppression de la prestation « ${existing.title} »`,
  });
  return ok(res, { message: 'Prestation supprimée.' });
});

/** PATCH /api/admin/services/reorder */
export const adminReorderServices = asyncHandler(async (req: Request, res: Response) => {
  const { items } = parseBody(reorderSchema, req.body);
  for (const item of items) {
    await db.services.update(item.id, { order: item.order });
  }
  await logActivity({ req, action: 'reorder', entity: 'service', description: 'Réorganisation des prestations' });
  return ok(res, { message: 'Ordre enregistré.' });
});
