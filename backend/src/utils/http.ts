import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodError, type ZodTypeAny, type z } from 'zod';

/** Erreur applicative avec code HTTP et détails éventuels. */
export class ApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(message = 'Requête invalide', details?: unknown) {
    return new ApiError(400, message, details);
  }
  static unauthorized(message = 'Authentification requise') {
    return new ApiError(401, message);
  }
  static forbidden(message = 'Accès refusé') {
    return new ApiError(403, message);
  }
  static notFound(message = 'Ressource introuvable') {
    return new ApiError(404, message);
  }
  static conflict(message = 'Conflit de données') {
    return new ApiError(409, message);
  }
}

/** Enveloppe une fonction async pour propager les erreurs à Express. */
export const asyncHandler =
  (handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    handler(req, res, next).catch(next);
  };

export interface Pagination {
  page: number;
  limit: number;
  skip: number;
}

export function getPagination(req: Request, defaultLimit = 20, maxLimit = 100): Pagination {
  const page = Math.max(1, Number.parseInt(String(req.query.page ?? '1'), 10) || 1);
  const rawLimit = Number.parseInt(String(req.query.limit ?? defaultLimit), 10) || defaultLimit;
  const limit = Math.min(maxLimit, Math.max(1, rawLimit));
  return { page, limit, skip: (page - 1) * limit };
}

export interface Paginated<T> {
  items: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export function paginate<T>(items: T[], total: number, { page, limit }: Pagination): Paginated<T> {
  return { items, pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } };
}

/** Réponse normalisée en succès. */
export function ok<T>(res: Response, data: T, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function created<T>(res: Response, data: T) {
  return res.status(201).json({ success: true, data });
}

/** Validation d'un corps de requête. */
export function parseBody<S extends ZodTypeAny>(schema: S, body: unknown): z.output<S> {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw ApiError.badRequest('Certains champs sont invalides.', formatZodError(result.error));
  }
  return result.data as z.output<S>;
}

export function formatZodError(error: ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.join('.') || '_',
    message: issue.message,
  }));
}

/** Nettoie une chaîne destinée à un contenu riche (protection XSS basique). */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe(?![^>]*(youtube|vimeo|openstreetmap|google\.com\/maps))[\s\S]*?<\/iframe>/gi, '')
    .replace(/ on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '');
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Transforme un texte libre en slug lisible. */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Génère un CSV exploitable dans Excel (séparateur point-virgule, BOM UTF-8). */
export function toCsv(rows: Record<string, unknown>[], columns: { key: string; label: string }[]): string {
  const escape = (value: unknown) => {
    const text = value === null || value === undefined ? '' : String(value);
    return `"${text.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
  };
  const header = columns.map((column) => escape(column.label)).join(';');
  const body = rows.map((row) => columns.map((column) => escape(row[column.key])).join(';')).join('\r\n');
  return `\uFEFF${header}\r\n${body}`;
}
