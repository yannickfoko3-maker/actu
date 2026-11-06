import type { Request, Response } from 'express';
import { db } from '../db';
import { ApiError, asyncHandler, created, getPagination, ok, paginate, parseBody } from '../utils/http';
import { mediaUpdateSchema } from '../validators';
import { processImage, removeUploadedFile } from '../middlewares/upload';
import { logActivity } from '../utils/activity';

/** GET /api/admin/media */
export const adminListMedia = asyncHandler(async (req: Request, res: Response) => {
  const pagination = getPagination(req, 24, 96);
  const search = String(req.query.search ?? '').trim();
  const type = String(req.query.type ?? '').trim();
  const where: any = {};
  if (search) where.filename = { contains: search };
  if (type && type !== 'all') where.mimeType = { contains: type };

  const total = await db.media.count(where);
  const items = await db.media.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: pagination.limit,
    skip: pagination.skip,
  });
  return ok(res, paginate(items, total, pagination));
});

/** GET /api/admin/media/stats */
export const adminMediaStats = asyncHandler(async (_req: Request, res: Response) => {
  const all = await db.media.findMany();
  const totalSize = all.reduce((sum, item) => sum + (item.size ?? 0), 0);
  return ok(res, { count: all.length, totalSize });
});

/** POST /api/admin/media — téléversement d'une ou plusieurs images. */
export const adminUploadMedia = asyncHandler(async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[] | undefined) ?? (req.file ? [req.file] : []);
  if (!files.length) throw ApiError.badRequest('Aucun fichier reçu.');

  const items: any[] = [];
  for (const file of files) {
    const processed = await processImage(file);
    const media = await db.media.create({
      filename: processed.filename,
      originalName: file.originalname,
      url: processed.url,
      thumbnailUrl: processed.thumbnailUrl,
      mimeType: processed.mimeType,
      size: processed.size,
      width: processed.width,
      height: processed.height,
      alt: '',
      caption: '',
    });
    items.push(media);
    await logActivity({
      req,
      action: 'upload',
      entity: 'media',
      entityId: media.id,
      description: `Téléversement de « ${file.originalname} »`,
    });
  }
  return created(res, items);
});

/** PATCH /api/admin/media/:id */
export const adminUpdateMedia = asyncHandler(async (req: Request, res: Response) => {
  const body = parseBody(mediaUpdateSchema, req.body);
  const existing = await db.media.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Média introuvable.');
  const media = await db.media.update(existing.id, body);
  return ok(res, media);
});

/** DELETE /api/admin/media/:id */
export const adminDeleteMedia = asyncHandler(async (req: Request, res: Response) => {
  const existing = await db.media.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Média introuvable.');
  if (existing.url.startsWith('/uploads/')) removeUploadedFile(existing.url);
  await db.media.remove(existing.id);
  await logActivity({ req, action: 'delete', entity: 'media', entityId: existing.id, description: `Suppression du média « ${existing.filename} »` });
  return ok(res, { message: 'Média supprimé.' });
});
