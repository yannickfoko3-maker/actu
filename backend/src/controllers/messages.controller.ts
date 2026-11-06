import type { Request, Response } from 'express';
import { db } from '../db';
import { ApiError, asyncHandler, created, escapeHtml, getPagination, ok, paginate, parseBody } from '../utils/http';
import { contactSchema, messageUpdateSchema, replySchema } from '../validators';
import { logActivity } from '../utils/activity';
import { getSetting } from '../utils/settings';
import { isMailConfigured, mailLayout, sendMail } from '../utils/mailer';

/** POST /api/public/messages — formulaire de contact. */
export const submitMessage = asyncHandler(async (req: Request, res: Response) => {
  const body = parseBody(contactSchema, req.body);
  if (body.honeypot) throw ApiError.badRequest('Soumission invalide.');

  const message = await db.contactMessages.create({
    name: body.name,
    email: body.email.toLowerCase(),
    phone: body.phone,
    subject: body.subject,
    message: body.message,
    status: 'NEW',
    ip: req.ip ?? null,
  });

  await sendMail({
    subject: `Nouveau message — ${body.subject}`,
    replyTo: body.email,
    html: mailLayout('Nouveau message depuis le site', [
      { label: 'Nom', value: escapeHtml(body.name) },
      { label: 'E-mail', value: escapeHtml(body.email) },
      { label: 'Téléphone', value: escapeHtml(body.phone) },
      { label: 'Sujet', value: escapeHtml(body.subject) },
      { label: 'Message', value: escapeHtml(body.message).replace(/\n/g, '<br />') },
    ]),
  });

  const successMessage = await getSetting(
    'forms.successMessage',
    'Merci, votre message a bien été enregistré. Notre équipe vous répond rapidement.'
  );

  return created(res, { id: message.id, message: successMessage, emailSent: isMailConfigured() });
});

/** GET /api/admin/messages */
export const adminListMessages = asyncHandler(async (req: Request, res: Response) => {
  const pagination = getPagination(req, 15);
  const status = String(req.query.status ?? '').trim();
  const search = String(req.query.search ?? '').trim();
  const where: any = {};
  if (status) where.status = status;
  if (search) where.name = { contains: search };

  const total = await db.contactMessages.count(where);
  const messages = await db.contactMessages.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: pagination.limit,
    skip: pagination.skip,
  });
  return ok(res, paginate(messages, total, pagination));
});

/** GET /api/admin/messages/:id */
export const adminGetMessage = asyncHandler(async (req: Request, res: Response) => {
  const message = await db.contactMessages.findById(req.params.id);
  if (!message) throw ApiError.notFound('Message introuvable.');
  if (message.status === 'NEW') {
    await db.contactMessages.update(message.id, { status: 'READ' });
    message.status = 'READ';
  }
  return ok(res, message);
});

/** PATCH /api/admin/messages/:id */
export const adminUpdateMessage = asyncHandler(async (req: Request, res: Response) => {
  const body = parseBody(messageUpdateSchema, req.body);
  const existing = await db.contactMessages.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Message introuvable.');
  const message = await db.contactMessages.update(existing.id, body);
  return ok(res, message);
});

/** POST /api/admin/messages/:id/reply — réponse par e-mail (si SMTP configuré). */
export const adminReplyMessage = asyncHandler(async (req: Request, res: Response) => {
  const body = parseBody(replySchema, req.body);
  const message = await db.contactMessages.findById(req.params.id);
  if (!message) throw ApiError.notFound('Message introuvable.');

  const sent = await sendMail({
    to: message.email,
    subject: body.subject,
    html: mailLayout(`Réponse à votre message « ${escapeHtml(message.subject)} »`, [
      { label: 'Message', value: body.message.replace(/\n/g, '<br />') },
    ], 'ACES Global Services — Votre sécurité, notre priorité !'),
  });

  await db.contactMessages.update(message.id, { status: 'READ' });
  await logActivity({
    req,
    action: 'update',
    entity: 'contactMessage',
    entityId: message.id,
    description: `Réponse envoyée à ${message.name}${sent ? '' : ' (SMTP non configuré — enregistré dans le journal)'}`,
  });

  return ok(res, {
    sent,
    message: sent
      ? 'Réponse envoyée par e-mail.'
      : "SMTP non configuré : la réponse n'a pas été envoyée. Configurez les variables SMTP_* pour activer l'envoi.",
  });
});

/** DELETE /api/admin/messages/:id */
export const adminDeleteMessage = asyncHandler(async (req: Request, res: Response) => {
  const existing = await db.contactMessages.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Message introuvable.');
  await db.contactMessages.remove(existing.id);
  await logActivity({ req, action: 'delete', entity: 'contactMessage', entityId: existing.id, description: `Suppression du message de ${existing.name}` });
  return ok(res, { message: 'Message supprimé.' });
});
