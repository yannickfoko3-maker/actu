import type { Request, Response } from 'express';
import { db } from '../db';
import { asyncHandler, ok } from '../utils/http';
import { getPublicSettings } from '../utils/settings';

const serviceCard = (service: any) => ({
  id: service.id,
  slug: service.slug,
  title: service.title,
  tagline: service.tagline,
  shortDescription: service.shortDescription,
  icon: service.icon,
  coverImage: service.coverImage,
  heroImage: service.heroImage,
  order: service.order,
});

function articleCard(article: any, category?: any) {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    coverImage: article.coverImage,
    publishedAt: article.publishedAt,
    readingTime: article.readingTime,
    author: article.author,
    tags: Array.isArray(article.tags) ? article.tags : [],
    category: category ? { slug: category.slug, name: category.name } : null,
  };
}

/** GET /api/public/site — amorçage du site public (paramètres + navigation + carrousel). */
export const getSiteBootstrap = asyncHandler(async (_req: Request, res: Response) => {
  const [settings, slides, services] = await Promise.all([
    getPublicSettings(),
    db.heroSlides.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
    db.services.findMany({ where: { isPublished: true }, orderBy: { order: 'asc' } }),
  ]);

  return ok(res, {
    settings,
    slides,
    navigation: services.map(serviceCard),
  });
});

/** GET /api/public/home — contenus de la page d'accueil. */
export const getHomeContent = asyncHandler(async (_req: Request, res: Response) => {
  const [slides, services, projects, articles, testimonials, categories, settings] = await Promise.all([
    db.heroSlides.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
    db.services.findMany({ where: { isPublished: true }, orderBy: { order: 'asc' } }),
    db.projects.findMany({ where: { isPublished: true, featured: true }, orderBy: { order: 'asc' }, take: 6 }),
    db.articles.findMany({ where: { status: 'PUBLISHED' }, orderBy: { publishedAt: 'desc' }, take: 3 }),
    db.testimonials.findMany({ where: { isPublished: true }, orderBy: { order: 'asc' } }),
    db.categories.findMany(),
    getPublicSettings(),
  ]);

  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const projectCovers = await db.projectImages.findMany({ orderBy: { order: 'asc' } });

  return ok(res, {
    settings,
    slides,
    services: services.map(serviceCard),
    projects: projects.map((project) => ({
      id: project.id,
      slug: project.slug,
      title: project.title,
      category: project.category,
      location: project.location,
      year: project.year,
      summary: project.summary,
      coverImage: project.coverImage,
      images: projectCovers.filter((image) => image.projectId === project.id).map((image) => image.url),
    })),
    articles: articles.map((article) => articleCard(article, categoryById.get(article.categoryId))),
    testimonials: testimonials.map((testimonial) => ({
      id: testimonial.id,
      authorName: testimonial.authorName,
      authorRole: testimonial.authorRole,
      company: testimonial.company,
      content: testimonial.content,
      rating: testimonial.rating,
      photo: testimonial.photo,
    })),
    stats: {
      services: services.length,
      projects: await db.projects.count({ isPublished: true }),
      articles: await db.articles.count({ status: 'PUBLISHED' }),
    },
  });
});

/** GET /api/public/sitemap-data — slugs publiés pour le sitemap et le pré-rendu. */
export const getSitemapData = asyncHandler(async (_req: Request, res: Response) => {
  const [services, projects, articles, pages] = await Promise.all([
    db.services.findMany({ where: { isPublished: true }, orderBy: { order: 'asc' } }),
    db.projects.findMany({ where: { isPublished: true }, orderBy: { order: 'asc' } }),
    db.articles.findMany({ where: { status: 'PUBLISHED' }, orderBy: { publishedAt: 'desc' } }),
    db.pages.findMany({ where: { status: 'PUBLISHED' } }),
  ]);

  return ok(res, {
    services: services.map((s) => ({ slug: s.slug, updatedAt: s.updatedAt })),
    projects: projects.map((p) => ({ slug: p.slug, updatedAt: p.updatedAt })),
    articles: articles.map((a) => ({ slug: a.slug, updatedAt: a.updatedAt, publishedAt: a.publishedAt })),
    pages: pages.map((p) => ({ slug: p.slug, updatedAt: p.updatedAt })),
  });
});
