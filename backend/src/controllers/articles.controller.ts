import type { Request, Response } from 'express';
import { db } from '../db';
import { ApiError, asyncHandler, created, getPagination, ok, paginate, parseBody, sanitizeHtml, slugify } from '../utils/http';
import { articleSchema, categorySchema } from '../validators';
import { logActivity } from '../utils/activity';

async function withCategory(article: any) {
  const category = article.categoryId ? await db.categories.findById(article.categoryId) : null;
  return {
    ...article,
    tags: Array.isArray(article.tags) ? article.tags : [],
    category: category ? { id: category.id, slug: category.slug, name: category.name } : null,
  };
}

/** GET /api/public/articles */
export const listPublicArticles = asyncHandler(async (req: Request, res: Response) => {
  const pagination = getPagination(req, 9);
  const where: any = { status: 'PUBLISHED' };
  const search = String(req.query.search ?? '').trim();
  if (search) where.title = { contains: search };

  if (req.query.category) {
    const category = await db.categories.findOneBy('slug', String(req.query.category));
    if (!category) return ok(res, paginate([], 0, pagination));
    where.categoryId = category.id;
  }

  const total = await db.articles.count(where);
  const articles = await db.articles.findMany({
    where,
    orderBy: { publishedAt: 'desc' },
    take: pagination.limit,
    skip: pagination.skip,
  });
  const categories = await db.categories.findMany({ where: { kind: 'article' }, orderBy: { name: 'asc' } });

  return ok(res, {
    ...paginate(await Promise.all(articles.map(withCategory)), total, pagination),
    categories,
  });
});

/** GET /api/public/articles/:slug */
export const getPublicArticle = asyncHandler(async (req: Request, res: Response) => {
  const article = await db.articles.findOneBy('slug', req.params.slug);
  if (!article || article.status !== 'PUBLISHED') throw ApiError.notFound('Article introuvable.');
  await db.articles.update(article.id, { views: (article.views ?? 0) + 1 });
  const hydrated = await withCategory(article);

  const related = await db.articles.findMany({
    where: { status: 'PUBLISHED', id: { notIn: [article.id] } },
    orderBy: { publishedAt: 'desc' },
    take: 3,
  });

  return ok(res, {
    ...hydrated,
    related: await Promise.all(related.map(withCategory)),
  });
});

/** GET /api/admin/articles */
export const adminListArticles = asyncHandler(async (req: Request, res: Response) => {
  const pagination = getPagination(req, 15);
  const search = String(req.query.search ?? '').trim();
  const status = String(req.query.status ?? '').trim();
  const categoryId = String(req.query.categoryId ?? '').trim();

  const where: any = {};
  if (search) where.title = { contains: search };
  if (status) where.status = status;
  if (categoryId) where.categoryId = categoryId;

  const total = await db.articles.count(where);
  const articles = await db.articles.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: pagination.limit,
    skip: pagination.skip,
  });
  return ok(res, paginate(await Promise.all(articles.map(withCategory)), total, pagination));
});

/** GET /api/admin/articles/:id */
export const adminGetArticle = asyncHandler(async (req: Request, res: Response) => {
  const article = await db.articles.findById(req.params.id);
  if (!article) throw ApiError.notFound('Article introuvable.');
  return ok(res, await withCategory(article));
});

function payload(body: any) {
  return {
    title: body.title,
    excerpt: body.excerpt,
    content: sanitizeHtml(body.content),
    coverImage: body.coverImage,
    categoryId: body.categoryId || null,
    tags: body.tags,
    author: body.author,
    status: body.status,
    publishedAt:
      body.publishedAt ?? (body.status === 'PUBLISHED' ? new Date().toISOString() : null),
    readingTime: body.readingTime,
    seoTitle: body.seoTitle || null,
    seoDescription: body.seoDescription || null,
  };
}

/** POST /api/admin/articles */
export const adminCreateArticle = asyncHandler(async (req: Request, res: Response) => {
  const body = parseBody(articleSchema, req.body);
  const slug = body.slug || slugify(body.title);
  if (await db.articles.findOneBy('slug', slug)) throw ApiError.conflict('Ce slug est déjà utilisé.');
  const article = await db.articles.create({ ...payload(body), slug, views: 0 });
  await logActivity({ req, action: 'create', entity: 'article', entityId: article.id, description: `Création de l’article « ${article.title} »` });
  return created(res, await withCategory(article));
});

/** PUT /api/admin/articles/:id */
export const adminUpdateArticle = asyncHandler(async (req: Request, res: Response) => {
  const body = parseBody(articleSchema, req.body);
  const existing = await db.articles.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Article introuvable.');
  const slug = body.slug || existing.slug;
  const article = await db.articles.update(existing.id, { ...payload(body), slug });
  await logActivity({ req, action: 'update', entity: 'article', entityId: article.id, description: `Mise à jour de l’article « ${article.title} »` });
  return ok(res, await withCategory(article));
});

/** PATCH /api/admin/articles/:id/status */
export const adminSetArticleStatus = asyncHandler(async (req: Request, res: Response) => {
  const status = String(req.body?.status ?? '');
  if (!['DRAFT', 'PUBLISHED', 'SCHEDULED'].includes(status)) throw ApiError.badRequest('Statut invalide.');
  const existing = await db.articles.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Article introuvable.');
  const article = await db.articles.update(existing.id, {
    status,
    publishedAt: status === 'PUBLISHED' ? existing.publishedAt ?? new Date().toISOString() : existing.publishedAt,
  });
  await logActivity({
    req,
    action: status === 'PUBLISHED' ? 'publish' : 'unpublish',
    entity: 'article',
    entityId: article.id,
    description: `Article « ${article.title} » : statut ${status}`,
  });
  return ok(res, await withCategory(article));
});

/** DELETE /api/admin/articles/:id */
export const adminDeleteArticle = asyncHandler(async (req: Request, res: Response) => {
  const existing = await db.articles.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Article introuvable.');
  await db.articles.remove(existing.id);
  await logActivity({ req, action: 'delete', entity: 'article', entityId: existing.id, description: `Suppression de l’article « ${existing.title} »` });
  return ok(res, { message: 'Article supprimé.' });
});

// ---------------------------------------------------------------------------
// Catégories
// ---------------------------------------------------------------------------

/** GET /api/public/categories */
export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await db.categories.findMany({ where: { kind: 'article' }, orderBy: { name: 'asc' } });
  return ok(res, categories);
});

/** POST /api/admin/categories */
export const adminCreateCategory = asyncHandler(async (req: Request, res: Response) => {
  const body = parseBody(categorySchema, req.body);
  const slug = body.slug || slugify(body.name);
  if (await db.categories.findOneBy('slug', slug)) throw ApiError.conflict('Cette catégorie existe déjà.');
  const category = await db.categories.create({ ...body, slug, description: body.description || null });
  await logActivity({ req, action: 'create', entity: 'category', entityId: category.id, description: `Création de la catégorie « ${category.name} »` });
  return created(res, category);
});

/** PUT /api/admin/categories/:id */
export const adminUpdateCategory = asyncHandler(async (req: Request, res: Response) => {
  const body = parseBody(categorySchema, req.body);
  const existing = await db.categories.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Catégorie introuvable.');
  const category = await db.categories.update(existing.id, {
    ...body,
    slug: body.slug || existing.slug,
    description: body.description || null,
  });
  return ok(res, category);
});

/** DELETE /api/admin/categories/:id */
export const adminDeleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const existing = await db.categories.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Catégorie introuvable.');
  const used = await db.articles.count({ categoryId: existing.id });
  if (used > 0) throw ApiError.badRequest('Cette catégorie est utilisée par des articles.');
  await db.categories.remove(existing.id);
  return ok(res, { message: 'Catégorie supprimée.' });
});
