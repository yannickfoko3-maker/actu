import type { Request, Response } from 'express';
import { db } from '../db';
import { asyncHandler, getPagination, ok, paginate } from '../utils/http';
import { groupPerMonth, quotesPerMonth } from './quotes.controller';
import { env } from '../config/env';
import { isMailConfigured } from '../utils/mailer';

/** GET /api/admin/stats — toutes les statistiques proviennent réellement de la base. */
export const adminStats = asyncHandler(async (_req: Request, res: Response) => {
  const [
    services,
    publishedServices,
    projects,
    articles,
    publishedArticles,
    quotes,
    newQuotes,
    messages,
    unreadMessages,
    slides,
    activeSlides,
    media,
    testimonials,
    users,
  ] = await Promise.all([
    db.services.count(),
    db.services.count({ isPublished: true }),
    db.projects.count({ isPublished: true }),
    db.articles.count(),
    db.articles.count({ status: 'PUBLISHED' }),
    db.quoteRequests.count(),
    db.quoteRequests.count({ status: 'NEW' }),
    db.contactMessages.count(),
    db.contactMessages.count({ status: 'NEW' }),
    db.heroSlides.count(),
    db.heroSlides.count({ isActive: true }),
    db.media.count(),
    db.testimonials.count({ isPublished: true }),
    db.adminUsers.count(),
  ]);

  const [recentQuotes, recentMessages, logs, allQuotes, allArticles, allMessagesByMonth] = await Promise.all([
    db.quoteRequests.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
    db.contactMessages.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
    db.activityLogs.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
    db.quoteRequests.findMany({ orderBy: { createdAt: 'asc' } }),
    db.articles.findMany({ where: { status: 'PUBLISHED' }, orderBy: { publishedAt: 'asc' } }),
    db.contactMessages.findMany({ orderBy: { createdAt: 'asc' } }),
  ]);

  const byStatus = ['NEW', 'IN_PROGRESS', 'DONE', 'ARCHIVED'].map((status) => ({
    status,
    value: allQuotes.filter((quote) => quote.status === status).length,
  }));

  const byService = Object.entries(
    allQuotes.reduce<Record<string, number>>((acc, quote) => {
      const key = quote.serviceTitle ?? 'Non précisé';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return ok(res, {
    counts: {
      services: { total: services, published: publishedServices },
      projects: { total: projects, published: projects },
      articles: { total: articles, published: publishedArticles },
      quotes: { total: quotes, new: newQuotes },
      messages: { total: messages, new: unreadMessages },
      slides: { total: slides, active: activeSlides },
      media: { total: media },
      testimonials: { total: testimonials },
      users: { total: users },
    },
    charts: {
      quotesPerMonth: groupPerMonth(allQuotes, 6),
      messagesPerMonth: groupPerMonth(allMessagesByMonth, 6),
      articlesPerMonth: groupPerMonth(allArticles, 6, 'publishedAt'),
      quotesByStatus: byStatus,
      quotesByService: byService,
    },
    recent: { quotes: recentQuotes, messages: recentMessages },
    activity: logs,
    environment: { dataAdapter: env.dataAdapter, mailConfigured: isMailConfigured() },
  });
});

/** GET /api/admin/activity-logs */
export const adminListActivity = asyncHandler(async (req: Request, res: Response) => {
  const pagination = getPagination(req, 25);
  const search = String(req.query.search ?? '').trim();
  const entity = String(req.query.entity ?? '').trim();
  const where: any = {};
  if (search) where.description = { contains: search };
  if (entity) where.entity = entity;

  const total = await db.activityLogs.count(where);
  const logs = await db.activityLogs.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: pagination.limit,
    skip: pagination.skip,
  });
  return ok(res, paginate(logs, total, pagination));
});

export { quotesPerMonth };
