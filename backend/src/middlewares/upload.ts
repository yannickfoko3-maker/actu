import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import multer from 'multer';
import sharp from 'sharp';
import { env } from '../config/env';
import { ApiError } from '../utils/http';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

/** Stockage mémoire : le fichier est vérifié puis retraité par sharp avant écriture. */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.uploadMaxSizeMb * 1024 * 1024,
    files: 10,
  },
  fileFilter: (_req, file, callback) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_MIME.has(file.mimetype) || !ALLOWED_EXT.has(ext)) {
      callback(ApiError.badRequest('Format non autorisé. Utilisez JPG, PNG, WEBP ou AVIF.'));
      return;
    }
    callback(null, true);
  },
});

export interface ProcessedImage {
  filename: string;
  url: string;
  thumbnailUrl: string;
  size: number;
  width: number;
  height: number;
  mimeType: string;
}

/**
 * Optimise une image : redimensionnement maximal, conversion JPEG progressive,
 * génération d'une miniature. Le nom d'origine n'est jamais utilisé sur le
 * serveur (protection contre les traversées de répertoire et les collisions).
 */
export async function processImage(file: Express.Multer.File): Promise<ProcessedImage> {
  const now = new Date();
  const subDir = path.join(`${now.getFullYear()}`, `${String(now.getMonth() + 1).padStart(2, '0')}`);
  const targetDir = path.join(env.uploadDir, subDir);
  fs.mkdirSync(targetDir, { recursive: true });

  const uuid = crypto.randomUUID();
  const filename = `${uuid}.jpg`;
  const thumbName = `${uuid}-thumb.jpg`;
  const absolute = path.join(targetDir, filename);
  const thumbAbsolute = path.join(targetDir, thumbName);

  const pipeline = sharp(file.buffer, { failOn: 'none' }).rotate();
  const metadata = await pipeline.metadata();
  if (!metadata.width || !metadata.height) {
    throw ApiError.badRequest("Le fichier image n'a pas pu être lu.");
  }

  const main = await pipeline
    .clone()
    .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 84, mozjpeg: true, progressive: true })
    .toFile(absolute);

  await pipeline
    .clone()
    .resize({ width: 480, height: 480, fit: 'cover' })
    .jpeg({ quality: 78, mozjpeg: true })
    .toFile(thumbAbsolute);

  const urlBase = `${env.publicUploadPath}/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;

  return {
    filename,
    url: `${urlBase}/${filename}`,
    thumbnailUrl: `${urlBase}/${thumbName}`,
    size: main.size,
    width: main.width,
    height: main.height,
    mimeType: 'image/jpeg',
  };
}

/** Supprime un fichier téléversé à partir de son URL publique. */
export function removeUploadedFile(url: string): void {
  if (!url.startsWith(env.publicUploadPath)) return;
  const relative = url.replace(env.publicUploadPath, '').replace(/^\//, '');
  const absolute = path.join(env.uploadDir, relative);
  if (!absolute.startsWith(env.uploadDir)) return;
  try {
    if (fs.existsSync(absolute)) fs.unlinkSync(absolute);
    const thumb = absolute.replace(/\.jpg$/, '-thumb.jpg');
    if (fs.existsSync(thumb)) fs.unlinkSync(thumb);
  } catch (error) {
    console.warn('[upload] suppression impossible :', (error as Error).message);
  }
}
