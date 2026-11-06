import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { requireAuth, requirePermission } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

import * as auth from '../controllers/auth.controller';
import * as content from '../controllers/content.controller';
import * as services from '../controllers/services.controller';
import * as pages from '../controllers/pages.controller';
import * as hero from '../controllers/hero.controller';
import * as projects from '../controllers/projects.controller';
import * as articles from '../controllers/articles.controller';
import * as testimonials from '../controllers/testimonials.controller';
import * as messages from '../controllers/messages.controller';
import * as quotes from '../controllers/quotes.controller';
import * as media from '../controllers/media.controller';
import * as settings from '../controllers/settings.controller';
import * as users from '../controllers/users.controller';
import * as stats from '../controllers/stats.controller';

const router = Router();

/** Limiteur dédié aux formulaires publics (anti-spam). */
const formLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.formMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Trop de demandes envoyées depuis cette adresse. Merci de réessayer dans quelques minutes.',
      code: 'RATE_LIMITED',
    },
  },
});

/** Limiteur strict sur la connexion administrateur. */
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    error: { message: 'Trop de tentatives de connexion. Réessayez dans quelques minutes.', code: 'RATE_LIMITED' },
  },
});

router.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: { status: 'ok', adapter: env.dataAdapter, uptime: process.uptime(), timestamp: new Date().toISOString() },
  });
});

// ---------------------------------------------------------------------------
// Authentification
// ---------------------------------------------------------------------------
router.post('/auth/login', loginLimiter, auth.login);
router.post('/auth/logout', auth.logout);
router.get('/auth/me', requireAuth, auth.me);
router.get('/auth/can/:permission', requireAuth, auth.can);
router.post('/auth/password', requireAuth, auth.changePassword);

// ---------------------------------------------------------------------------
// Site public
// ---------------------------------------------------------------------------
const publicRouter = Router();
publicRouter.get('/site', content.getSiteBootstrap);
publicRouter.get('/home', content.getHomeContent);
publicRouter.get('/sitemap-data', content.getSitemapData);
publicRouter.get('/settings', settings.getPublicSettingsHandler);

publicRouter.get('/services', services.listPublicServices);
publicRouter.get('/services/:slug', services.getPublicService);

publicRouter.get('/pages', pages.listPublicPages);
publicRouter.get('/pages/:slug', pages.getPublicPage);

publicRouter.get('/hero', hero.listPublicSlides);

publicRouter.get('/projects', projects.listPublicProjects);
publicRouter.get('/projects/:slug', projects.getPublicProject);

publicRouter.get('/articles', articles.listPublicArticles);
publicRouter.get('/articles/:slug', articles.getPublicArticle);
publicRouter.get('/categories', articles.listCategories);

publicRouter.get('/testimonials', testimonials.listPublicTestimonials);

publicRouter.post('/messages', formLimiter, messages.submitMessage);
publicRouter.post('/quotes', formLimiter, quotes.submitQuote);

router.use('/public', publicRouter);

// ---------------------------------------------------------------------------
// Administration
// ---------------------------------------------------------------------------
const admin = Router();
admin.use(requireAuth);

admin.get('/stats', requirePermission('dashboard.read'), stats.adminStats);
admin.get('/activity-logs', requirePermission('logs.read'), stats.adminListActivity);

admin.get('/services', requirePermission('services.read'), services.adminListServices);
admin.get('/services/:id', requirePermission('services.read'), services.adminGetService);
admin.post('/services', requirePermission('services.write'), services.adminCreateService);
admin.put('/services/:id', requirePermission('services.write'), services.adminUpdateService);
admin.patch('/services/:id/publish', requirePermission('services.write'), services.adminToggleService);
admin.patch('/services/reorder', requirePermission('services.write'), services.adminReorderServices);
admin.delete('/services/:id', requirePermission('services.delete'), services.adminDeleteService);

admin.get('/hero', requirePermission('hero.write'), hero.adminListSlides);
admin.post('/hero', requirePermission('hero.write'), hero.adminCreateSlide);
admin.put('/hero/:id', requirePermission('hero.write'), hero.adminUpdateSlide);
admin.patch('/hero/:id/toggle', requirePermission('hero.write'), hero.adminToggleSlide);
admin.patch('/hero/reorder', requirePermission('hero.write'), hero.adminReorderSlides);
admin.delete('/hero/:id', requirePermission('hero.write'), hero.adminDeleteSlide);

admin.get('/pages', requirePermission('pages.read'), pages.adminListPages);
admin.get('/pages/:id', requirePermission('pages.read'), pages.adminGetPage);
admin.post('/pages', requirePermission('pages.write'), pages.adminCreatePage);
admin.put('/pages/:id', requirePermission('pages.write'), pages.adminUpdatePage);
admin.delete('/pages/:id', requirePermission('pages.write'), pages.adminDeletePage);

admin.get('/projects', requirePermission('projects.write'), projects.adminListProjects);
admin.get('/projects/:id', requirePermission('projects.write'), projects.adminGetProject);
admin.post('/projects', requirePermission('projects.write'), projects.adminCreateProject);
admin.put('/projects/:id', requirePermission('projects.write'), projects.adminUpdateProject);
admin.patch('/projects/:id/publish', requirePermission('projects.write'), projects.adminToggleProject);
admin.delete('/projects/:id', requirePermission('projects.write'), projects.adminDeleteProject);

admin.get('/articles', requirePermission('articles.write'), articles.adminListArticles);
admin.get('/articles/:id', requirePermission('articles.write'), articles.adminGetArticle);
admin.post('/articles', requirePermission('articles.write'), articles.adminCreateArticle);
admin.put('/articles/:id', requirePermission('articles.write'), articles.adminUpdateArticle);
admin.patch('/articles/:id/status', requirePermission('articles.write'), articles.adminSetArticleStatus);
admin.delete('/articles/:id', requirePermission('articles.write'), articles.adminDeleteArticle);

admin.post('/categories', requirePermission('articles.write'), articles.adminCreateCategory);
admin.put('/categories/:id', requirePermission('articles.write'), articles.adminUpdateCategory);
admin.delete('/categories/:id', requirePermission('articles.write'), articles.adminDeleteCategory);

admin.get('/media', requirePermission('media.write'), media.adminListMedia);
admin.get('/media/stats', requirePermission('media.write'), media.adminMediaStats);
admin.post('/media', requirePermission('media.write'), upload.array('files', 10), media.adminUploadMedia);
admin.patch('/media/:id', requirePermission('media.write'), media.adminUpdateMedia);
admin.delete('/media/:id', requirePermission('media.write'), media.adminDeleteMedia);

admin.get('/testimonials', requirePermission('testimonials.write'), testimonials.adminListTestimonials);
admin.post('/testimonials', requirePermission('testimonials.write'), testimonials.adminCreateTestimonial);
admin.put('/testimonials/:id', requirePermission('testimonials.write'), testimonials.adminUpdateTestimonial);
admin.patch('/testimonials/:id/publish', requirePermission('testimonials.write'), testimonials.adminToggleTestimonial);
admin.delete('/testimonials/:id', requirePermission('testimonials.write'), testimonials.adminDeleteTestimonial);

admin.get('/messages', requirePermission('messages.read'), messages.adminListMessages);
admin.get('/messages/:id', requirePermission('messages.read'), messages.adminGetMessage);
admin.patch('/messages/:id', requirePermission('messages.write'), messages.adminUpdateMessage);
admin.post('/messages/:id/reply', requirePermission('messages.write'), messages.adminReplyMessage);
admin.delete('/messages/:id', requirePermission('messages.write'), messages.adminDeleteMessage);

admin.get('/quotes/export', requirePermission('quotes.read'), quotes.adminExportQuotes);
admin.get('/quotes', requirePermission('quotes.read'), quotes.adminListQuotes);
admin.get('/quotes/:id', requirePermission('quotes.read'), quotes.adminGetQuote);
admin.patch('/quotes/:id', requirePermission('quotes.write'), quotes.adminUpdateQuote);
admin.delete('/quotes/:id', requirePermission('quotes.write'), quotes.adminDeleteQuote);

admin.get('/settings', requirePermission('settings.write'), settings.adminGetSettings);
admin.put('/settings', requirePermission('settings.write'), settings.adminUpdateSettings);

admin.get('/users', requirePermission('users.write'), users.adminListUsers);
admin.post('/users', requirePermission('users.write'), users.adminCreateUser);
admin.put('/users/:id', requirePermission('users.write'), users.adminUpdateUser);
admin.delete('/users/:id', requirePermission('users.write'), users.adminDeleteUser);
admin.post('/roles', requirePermission('users.write'), users.adminCreateRole);

router.use('/admin', admin);

export default router;
