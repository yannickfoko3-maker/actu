import type { Request, Response } from 'express';
import { db } from '../db';
import { ApiError, asyncHandler, created, ok, parseBody, sanitizeHtml } from '../utils/http';
import { testimonialSchema } from '../validators';
import { logActivity } from '../utils/activity';

/** GET /api/public/testimonials */
export const listPublicTestimonials = asyncHandler(async (_req: Request, res: Response) => {
  const testimonials = await db.testimonials.findMany({ where: { isPublished: true }, orderBy: { order: 'asc' } });
  return ok(res, testimonials);
});

/** GET /api/admin/testimonials */
export const adminListTestimonials = asyncHandler(async (_req: Request, res: Response) => {
  const testimonials = await db.testimonials.findMany({ orderBy: { order: 'asc' } });
  return ok(res, testimonials);
});

function payload(body: any) {
  return {
    authorName: body.authorName,
    authorRole: body.authorRole || null,
    company: body.company || null,
    content: sanitizeHtml(body.content),
    rating: body.rating,
    photo: body.photo || null,
    isPublished: body.isPublished,
    order: body.order,
  };
}

/** POST /api/admin/testimonials */
export const adminCreateTestimonial = asyncHandler(async (req: Request, res: Response) => {
  const body = parseBody(testimonialSchema, req.body);
  const testimonial = await db.testimonials.create(payload(body));
  await logActivity({ req, action: 'create', entity: 'testimonial', entityId: testimonial.id, description: `Ajout d’un témoignage (${testimonial.authorName})` });
  return created(res, testimonial);
});

/** PUT /api/admin/testimonials/:id */
export const adminUpdateTestimonial = asyncHandler(async (req: Request, res: Response) => {
  const body = parseBody(testimonialSchema, req.body);
  const existing = await db.testimonials.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Témoignage introuvable.');
  const testimonial = await db.testimonials.update(existing.id, payload(body));
  await logActivity({ req, action: 'update', entity: 'testimonial', entityId: testimonial.id, description: `Mise à jour du témoignage de ${testimonial.authorName}` });
  return ok(res, testimonial);
});

/** PATCH /api/admin/testimonials/:id/publish */
export const adminToggleTestimonial = asyncHandler(async (req: Request, res: Response) => {
  const existing = await db.testimonials.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Témoignage introuvable.');
  const testimonial = await db.testimonials.update(existing.id, { isPublished: !existing.isPublished });
  return ok(res, testimonial);
});

/** DELETE /api/admin/testimonials/:id */
export const adminDeleteTestimonial = asyncHandler(async (req: Request, res: Response) => {
  const existing = await db.testimonials.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Témoignage introuvable.');
  await db.testimonials.remove(existing.id);
  await logActivity({ req, action: 'delete', entity: 'testimonial', entityId: existing.id, description: `Suppression du témoignage de ${existing.authorName}` });
  return ok(res, { message: 'Témoignage supprimé.' });
});
