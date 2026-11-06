import type { Request, Response } from 'express';
import { db } from '../db';
import { ApiError, asyncHandler, created, escapeHtml, getPagination, ok, paginate, parseBody, toCsv } from '../utils/http';
import { quoteSchema, quoteUpdateSchema } from '../validators';
import { logActivity } from '../utils/activity';
import { getSetting } from '../utils/settings';
import { mailLayout, sendMail } from '../utils/mailer';

/** POST /api/public/quotes — demande de devis. */
export const submitQuote = asyncHandler(async (req: Request, res: Response) => {
  const body = parseBody(quoteSchema, req.body);
  if (body.honeypot) throw ApiError.badRequest('Soumission invalide.');

  const quote = await db.quoteRequests.create({
    name: body.name,
    company: body.company || null,
    email: body.email.toLowerCase(),
    phone: body.phone,
    city: body.city,
    serviceSlug: body.serviceSlug || null,
    serviceTitle: body.serviceTitle,
    projectDescription: body.projectDescription,
    budget: body.budget || null,
    preferredContact: body.preferredContact,
    consent: body.consent,
    status: 'NEW',
    internalNotes: null,
    ip: req.ip ?? null,
  });

  await sendMail({
    subject: `Nouvelle demande de devis — ${body.serviceTitle}`,
    replyTo: body.email,
    html: mailLayout('Nouvelle demande de devis', [
      { label: 'Nom', value: escapeHtml(body.name) },
      { label: 'Entreprise', value: escapeHtml(body.company || '—') },
      { label: 'E-mail', value: escapeHtml(body.email) },
      { label: 'Téléphone', value: escapeHtml(body.phone) },
      { label: 'Ville', value: escapeHtml(body.city) },
      { label: 'Prestation', value: escapeHtml(body.serviceTitle) },
      { label: 'Budget', value: escapeHtml(body.budget || 'Non précisé') },
      { label: 'Contact préféré', value: escapeHtml(body.preferredContact) },
      { label: 'Projet', value: escapeHtml(body.projectDescription).replace(/\n/g, '<br />') },
    ]),
  });

  const successMessage = await getSetting(
    'forms.quoteSuccessMessage',
    'Merci, votre demande de devis a bien été reçue. Un conseiller vous contacte rapidement.'
  );

  return created(res, { id: quote.id, message: successMessage });
});

/** GET /api/admin/quotes */
export const adminListQuotes = asyncHandler(async (req: Request, res: Response) => {
  const pagination = getPagination(req, 15);
  const status = String(req.query.status ?? '').trim();
  const search = String(req.query.search ?? '').trim();
  const service = String(req.query.service ?? '').trim();

  const where: any = {};
  if (status) where.status = status;
  if (search) where.name = { contains: search };
  if (service) where.serviceSlug = service;

  const total = await db.quoteRequests.count(where);
  const quotes = await db.quoteRequests.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: pagination.limit,
    skip: pagination.skip,
  });
  return ok(res, paginate(quotes, total, pagination));
});

/** GET /api/admin/quotes/:id */
export const adminGetQuote = asyncHandler(async (req: Request, res: Response) => {
  const quote = await db.quoteRequests.findById(req.params.id);
  if (!quote) throw ApiError.notFound('Demande introuvable.');
  return ok(res, quote);
});

/** PATCH /api/admin/quotes/:id */
export const adminUpdateQuote = asyncHandler(async (req: Request, res: Response) => {
  const body = parseBody(quoteUpdateSchema, req.body);
  const existing = await db.quoteRequests.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Demande introuvable.');
  const quote = await db.quoteRequests.update(existing.id, body);
  await logActivity({
    req,
    action: 'update',
    entity: 'quoteRequest',
    entityId: quote.id,
    description: `Demande de ${quote.name} : ${body.status ?? 'note mise à jour'}`,
  });
  return ok(res, quote);
});

/** DELETE /api/admin/quotes/:id */
export const adminDeleteQuote = asyncHandler(async (req: Request, res: Response) => {
  const existing = await db.quoteRequests.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Demande introuvable.');
  await db.quoteRequests.remove(existing.id);
  await logActivity({ req, action: 'delete', entity: 'quoteRequest', entityId: existing.id, description: `Suppression de la demande de ${existing.name}` });
  return ok(res, { message: 'Demande supprimée.' });
});

/** GET /api/admin/quotes/export — export CSV. */
export const adminExportQuotes = asyncHandler(async (req: Request, res: Response) => {
  const status = String(req.query.status ?? '').trim();
  const where = status ? { status } : {};
  const quotes = await db.quoteRequests.findMany({ where, orderBy: { createdAt: 'desc' } });

  const csvContent = toCsv(quotes, [
    { key: 'createdAt', label: 'Date' },
    { key: 'name', label: 'Nom' },
    { key: 'company', label: 'Entreprise' },
    { key: 'email', label: 'E-mail' },
    { key: 'phone', label: 'Téléphone' },
    { key: 'city', label: 'Ville' },
    { key: 'serviceTitle', label: 'Prestation' },
    { key: 'budget', label: 'Budget' },
    { key: 'preferredContact', label: 'Contact préféré' },
    { key: 'status', label: 'Statut' },
    { key: 'projectDescription', label: 'Description' },
    { key: 'internalNotes', label: 'Notes internes' },
  ]);

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="aces-devis-${new Date().toISOString().slice(0, 10)}.csv"`);
  return res.send(csvContent);
});

/** Utilitaire interne : sert aux statistiques du tableau de bord. */
export async function quotesPerMonth(months = 6) {
  const quotes = await db.quoteRequests.findMany({ orderBy: { createdAt: 'asc' } });
  return groupPerMonth(quotes, months);
}

export function groupPerMonth(rows: any[], months = 6, field = 'createdAt') {
  const buckets = new Map<string, number>();
  const now = new Date();
  for (let index = months - 1; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    buckets.set(key, 0);
  }
  for (const row of rows) {
    const raw = row[field];
    if (!raw) continue;
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) continue;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  const labels = new Map<string, string>();
  for (const key of buckets.keys()) {
    const [year, month] = key.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    labels.set(key, date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }));
  }
  return [...buckets.entries()].map(([key, value]) => ({
    month: labels.get(key) ?? key,
    key,
    value,
  }));
}
