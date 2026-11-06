import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';

const rootDir = path.resolve(__dirname, '..', '..');
const envFiles = [path.join(rootDir, '.env'), path.join(rootDir, '..', '.env')];
for (const file of envFiles) {
  if (fs.existsSync(file)) dotenv.config({ path: file });
}

const bool = (value: string | undefined, fallback = false) =>
  value === undefined ? fallback : ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());

const int = (value: string | undefined, fallback: number) => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: int(process.env.PORT, 4000),
  appUrl: process.env.APP_URL ?? 'http://localhost:5173',
  apiUrl: process.env.API_URL ?? 'http://localhost:4000',
  /** Cors autorisés (séparés par des virgules) */
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  databaseUrl: process.env.DATABASE_URL ?? '',
  /**
   * Adaptateur de données :
   *  - "prisma" : MySQL via Prisma (mode de production, recommandé)
   *  - "memory" : magasin JSON local (démo, tests, environnement sans MySQL)
   */
  dataAdapter: (process.env.DATA_ADAPTER ?? 'prisma').toLowerCase() as 'prisma' | 'memory',
  dataFile: process.env.DATA_FILE ?? path.join(rootDir, '.data', 'db.json'),
  jwtSecret: process.env.JWT_SECRET ?? 'dev-only-insecure-secret-changez-moi',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
  cookieName: process.env.AUTH_COOKIE_NAME ?? 'aces_session',
  cookieSecure: bool(process.env.COOKIE_SECURE, process.env.NODE_ENV === 'production'),
  uploadDir: process.env.UPLOAD_DIR ?? path.join(rootDir, 'uploads'),
  uploadMaxSizeMb: int(process.env.UPLOAD_MAX_SIZE_MB, 8),
  publicUploadPath: '/uploads',
  seedAdmin: {
    name: process.env.SEED_ADMIN_NAME ?? 'Administrateur ACES',
    email: process.env.SEED_ADMIN_EMAIL ?? 'admin@aces-globalservices.com',
    password: process.env.SEED_ADMIN_PASSWORD ?? 'AcesAdmin2025!',
  },
  smtp: {
    host: process.env.SMTP_HOST ?? '',
    port: int(process.env.SMTP_PORT, 587),
    secure: bool(process.env.SMTP_SECURE, false),
    user: process.env.SMTP_USER ?? '',
    password: process.env.SMTP_PASSWORD ?? '',
    from: process.env.SMTP_FROM ?? 'ACES Global Services <no-reply@aces-globalservices.com>',
    to: process.env.CONTACT_RECEIVER ?? 'aces.globalservices@gmail.com',
  },
  rateLimit: {
    windowMs: int(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: int(process.env.RATE_LIMIT_MAX, 400),
    formMax: int(process.env.RATE_LIMIT_FORM_MAX, 12),
  },
} as const;

export const publicDirOfBackend = path.join(rootDir, 'public');
