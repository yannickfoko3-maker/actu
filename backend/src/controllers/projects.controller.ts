import type { Request, Response } from 'express';
import { db } from '../db';
import { ApiError, asyncHandler, created, getPagination, ok, paginate, parseBody, sanitizeHtml, slugify } from '../utils/http';
import { projectSchema } from '../validators';
import { logActivity } from '../utils/activity';

async function hydrateProject(project: any) {
  const [images, services] = await Promise.all([
    db.projectImages.findMany({ where: { projectId: project.id }, orderBy: { order: 'asc' } }),
    db.services.findMany(),
  ]);
  const service = services.find((item) => item.slug === project.category);
  return {
    ...project,
    images: images.map((image) => ({ id: image.id, url: image.url, alt: image.alt })),
    service: service ? { slug: service.slug, title: service.title, icon: service.icon } : null,
  };
}

/** GET /api/public/projects */
export const listPublicProjects = asyncHandler(async (req: Request, res: Response) => {
  const pagination = getPagination(req, 24);
  const where: any = { isPublished: true };
  if (req.query.category) where.category = String(req.query.category);
  if (req.query.featured === 'true') where.featured = true;

  const total = await db.projects.count(where);
  const projects = await db.projects.findMany({
    where,
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    take: pagination.limit,
    skip: pagination.skip,
  });
  const items = await Promise.all(projects.map(hydrateProject));
  return ok(res, paginate(items, total, pagination));
});

/** GET /api/public/projects/:slug */
export const getPublicProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await db.projects.findOneBy('slug', req.params.slug);
  if (!project || !project.isPublished) throw ApiError.notFound('Réalisation introuvable.');
  const hydrated = await hydrateProject(project);
  const others = await db.projects.findMany({
    where: { isPublished: true, id: { notIn: [project.id] } },
    orderBy: { order: 'asc' },
    take: 3,
  });
  return ok(res, {
    ...hydrated,
    related: others.map((item) => ({
      slug: item.slug,
      title: item.title,
      coverImage: item.coverImage,
      category: item.category,
      location: item.location,
    })),
  });
});

/** GET /api/admin/projects */
export const adminListProjects = asyncHandler(async (req: Request, res: Response) => {
  const pagination = getPagination(req, 20);
  const search = String(req.query.search ?? '').trim();
  const category = String(req.query.category ?? '').trim();
  const where: any = {};
  if (search) where.title = { contains: search };
  if (category) where.category = category;

  const total = await db.projects.count(where);
  const projects = await db.projects.findMany({
    where,
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    take: pagination.limit,
    skip: pagination.skip,
  });
  const items = await Promise.all(projects.map(hydrateProject));
  return ok(res, paginate(items, total, pagination));
});

/** GET /api/admin/projects/:id */
export const adminGetProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await db.projects.findById(req.params.id);
  if (!project) throw ApiError.notFound('Réalisation introuvable.');
  return ok(res, await hydrateProject(project));
});

async function syncProjectImages(projectId: string, images: { url: string; alt: string }[] = []) {
  await db.projectImages.removeMany({ projectId });
  for (const [index, image] of images.entries()) {
    await db.projectImages.create({ projectId, url: image.url, alt: image.alt, order: index });
  }
}

function payload(body: any) {
  return {
    title: body.title,
    category: body.category,
    client: body.client || null,
    location: body.location,
    year: body.year ?? null,
    summary: body.summary,
    description: sanitizeHtml(body.description),
    coverImage: body.coverImage,
    isPublished: body.isPublished,
    featured: body.featured,
    order: body.order,
  };
}

/** POST /api/admin/projects */
export const adminCreateProject = asyncHandler(async (req: Request, res: Response) => {
  const body = parseBody(projectSchema, req.body);
  const slug = body.slug || slugify(body.title);
  if (await db.projects.findOneBy('slug', slug)) throw ApiError.conflict('Ce slug est déjà utilisé.');
  const project = await db.projects.create({ ...payload(body), slug });
  await syncProjectImages(project.id, body.images);
  await logActivity({ req, action: 'create', entity: 'project', entityId: project.id, description: `Création de la réalisation « ${project.title} »` });
  return created(res, await hydrateProject(project));
});

/** PUT /api/admin/projects/:id */
export const adminUpdateProject = asyncHandler(async (req: Request, res: Response) => {
  const body = parseBody(projectSchema, req.body);
  const existing = await db.projects.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Réalisation introuvable.');
  const slug = body.slug || existing.slug;
  const project = await db.projects.update(existing.id, { ...payload(body), slug });
  await syncProjectImages(project.id, body.images);
  await logActivity({ req, action: 'update', entity: 'project', entityId: project.id, description: `Mise à jour de la réalisation « ${project.title} »` });
  return ok(res, await hydrateProject(project));
});

/** PATCH /api/admin/projects/:id/publish */
export const adminToggleProject = asyncHandler(async (req: Request, res: Response) => {
  const existing = await db.projects.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Réalisation introuvable.');
  const project = await db.projects.update(existing.id, { isPublished: !existing.isPublished });
  await logActivity({
    req,
    action: project.isPublished ? 'publish' : 'unpublish',
    entity: 'project',
    entityId: project.id,
    description: `Réalisation « ${project.title} » ${project.isPublished ? 'publiée' : 'dépubliée'}`,
  });
  return ok(res, project);
});

/** DELETE /api/admin/projects/:id */
export const adminDeleteProject = asyncHandler(async (req: Request, res: Response) => {
  const existing = await db.projects.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Réalisation introuvable.');
  await db.projectImages.removeMany({ projectId: existing.id });
  await db.projects.remove(existing.id);
  await logActivity({ req, action: 'delete', entity: 'project', entityId: existing.id, description: `Suppression de la réalisation « ${existing.title} »` });
  return ok(res, { message: 'Réalisation supprimée.' });
});
