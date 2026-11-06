import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { ZodError } from 'zod';
import { ApiError, formatZodError } from '../utils/http';
import { env } from '../config/env';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: { message: `Route introuvable : ${req.method} ${req.originalUrl}`, code: 'NOT_FOUND' },
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction) {
  let status = 500;
  let message = 'Une erreur interne est survenue.';
  let details: unknown;

  if (error instanceof ApiError) {
    status = error.statusCode;
    message = error.message;
    details = error.details;
  } else if (error instanceof ZodError) {
    status = 400;
    message = 'Certains champs sont invalides.';
    details = formatZodError(error);
  } else if (error instanceof multer.MulterError) {
    status = 400;
    message =
      error.code === 'LIMIT_FILE_SIZE'
        ? `Fichier trop volumineux (maximum ${env.uploadMaxSizeMb} Mo).`
        : `Téléversement refusé : ${error.message}`;
  } else if (error instanceof Error) {
    if (error.message.includes('Unique constraint')) {
      status = 409;
      message = 'Cet identifiant est déjà utilisé.';
    } else if (error.message.includes('Record to update not found')) {
      status = 404;
      message = 'Ressource introuvable.';
    } else if (env.isProduction) {
      message = 'Une erreur interne est survenue.';
    } else {
      message = error.message;
      details = env.isProduction ? undefined : error.stack;
    }
  }

  if (status >= 500) {
    console.error(`[api] ${req.method} ${req.originalUrl} —`, error);
  }

  res.status(status).json({
    success: false,
    error: {
      message,
      code: status === 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR',
      details,
    },
  });
}
