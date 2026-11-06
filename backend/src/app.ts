import path from 'node:path';
import fs from 'node:fs';
import express, { type Request, type Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import routes from './routes';
import { attachUser } from './middlewares/auth';
import { requireCsrf } from './middlewares/csrf';
import { errorHandler, notFoundHandler } from './middlewares/error';
import { db } from './db';
import { getSettings } from './utils/settings';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(
    helmet({
      contentSecurityPolicy: env.isProduction
        ? {
            directives: {
              defaultSrc: ["'self'"],
              imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
              styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
              fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
              scriptSrc: ["'self'"],
              connectSrc: ["'self'"],
              frameSrc: ["'self'", 'https://www.openstreetmap.org', 'https://www.google.com'],
              objectSrc: ["'none'"],
              upgradeInsecureRequests: [],
            },
          }
        : false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        const allowed = [...env.corsOrigins, env.appUrl].filter(Boolean);
        if (allowed.includes(origin) || env.nodeEnv !== 'production') return callback(null, true);
        return callback(new Error(`Origine non autorisée : ${origin}`));
      },
      credentials: true,
    })
  );

  app.use(compression());
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(cookieParser());

  // Journalisation légère des requêtes API
  app.use((req, _res, next) => {
    if (req.path.startsWith('/api')) {
      console.info(`[api] ${req.method} ${req.originalUrl}`);
    }
    next();
  });

  app.use(
    rateLimit({
      windowMs: env.rateLimit.windowMs,
      max: env.rateLimit.max,
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => req.path === '/api/health',
    })
  );

  // Fichiers téléversés (images de la médiathèque)
  fs.mkdirSync(env.uploadDir, { recursive: true });
  app.use(
    env.publicUploadPath,
    express.static(env.uploadDir, {
      maxAge: '30d',
      setHeaders(res) {
        res.setHeader('X-Content-Type-Options', 'nosniff');
      },
    })
  );

  app.use(attachUser);
  app.use(requireCsrf);

  app.use('/api', routes);

  // Sitemap et robots générés à la volée
  app.get('/sitemap.xml', async (_req: Request, res: Response) => {
    const [settings, services, projects, articles, pages] = await Promise.all([
      getSettings(),
      db.services.findMany({ where: { isPublished: true } }),
      db.projects.findMany({ where: { isPublished: true } }),
      db.articles.findMany({ where: { status: 'PUBLISHED' } }),
      db.pages.findMany({ where: { status: 'PUBLISHED' } }),
    ]);
    const base = (settings['seo.siteUrl'] || env.appUrl).replace(/\/$/, '');
    const urls: { loc: string; lastmod?: string; priority: string }[] = [
      { loc: `${base}/`, priority: '1.0' },
      { loc: `${base}/qui-sommes-nous`, priority: '0.8' },
      { loc: `${base}/nos-activites`, priority: '0.9' },
      { loc: `${base}/nos-realisations`, priority: '0.8' },
      { loc: `${base}/actualites`, priority: '0.7' },
      { loc: `${base}/contact`, priority: '0.8' },
      { loc: `${base}/devis`, priority: '0.9' },
    ];
    services.forEach((service) =>
      urls.push({ loc: `${base}/nos-activites/${service.slug}`, lastmod: toDate(service.updatedAt), priority: '0.8' })
    );
    projects.forEach((project) =>
      urls.push({ loc: `${base}/nos-realisations/${project.slug}`, lastmod: toDate(project.updatedAt), priority: '0.6' })
    );
    articles.forEach((article) =>
      urls.push({ loc: `${base}/actualites/${article.slug}`, lastmod: toDate(article.updatedAt), priority: '0.6' })
    );
    pages.forEach((page) => urls.push({ loc: `${base}/${page.slug}`, lastmod: toDate(page.updatedAt), priority: '0.4' }));

    const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url.loc}</loc>${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}<priority>${url.priority}</priority></url>`).join('\n')}
</urlset>`;
    res.type('application/xml').send(body);
  });

  app.get('/robots.txt', (_req, res) => {
    res.type('text/plain').send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api

Sitemap: ${env.appUrl.replace(/\/$/, '')}/sitemap.xml
`);
  });

  // Service du frontend compilé (déploiement mono-serveur)
  const frontendDist = path.resolve(__dirname, '..', '..', 'frontend', 'dist');
  if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist, { maxAge: '1h', index: false }));
    app.get(/^\/(?!api|uploads|sitemap\.xml|robots\.txt).*/, (_req, res) => {
      res.sendFile(path.join(frontendDist, 'index.html'));
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

function toDate(value: unknown): string | undefined {
  if (!value) return undefined;
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10);
}
