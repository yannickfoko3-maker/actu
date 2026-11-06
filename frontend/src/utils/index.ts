import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value?: string | Date | null, options?: Intl.DateTimeFormatOptions): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('fr-FR', options ?? { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatShortDate(value?: string | Date | null): string {
  return formatDate(value, { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(value?: string | Date | null): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return `${date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })} à ${date.toLocaleTimeString(
    'fr-FR',
    { hour: '2-digit', minute: '2-digit' }
  )}`;
}

const decimalFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });

export function formatFileSize(bytes?: number | null): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${decimalFormat.format(bytes)} o`;
  if (bytes < 1024 * 1024) return `${decimalFormat.format(Math.round(bytes / 1024))} Ko`;
  return `${decimalFormat.format(bytes / (1024 * 1024))} Mo`;
}

/** Lien WhatsApp « click to chat » avec message prérempli. */
export function whatsappUrl(number: string, message?: string): string {
  const clean = (number || '').replace(/[^0-9]/g, '');
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${clean}${text}`;
}

export function telUrl(phone: string): string {
  return `tel:${(phone || '').replace(/[^+0-9]/g, '')}`;
}

export function mailUrl(email: string, subject?: string): string {
  return `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
}

export function shortExcerpt(html: string, length = 160): string {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > length ? `${text.slice(0, length).trimEnd()}…` : text;
}

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export const QUOTE_STATUS: Record<string, { label: string; className: string }> = {
  NEW: { label: 'Nouveau', className: 'bg-aces-blue/10 text-aces-blue border-aces-blue/20' },
  IN_PROGRESS: { label: 'En cours', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  DONE: { label: 'Traité', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  ARCHIVED: { label: 'Archivé', className: 'bg-slate-100 text-slate-600 border-slate-200' },
};

export const MESSAGE_STATUS: Record<string, { label: string; className: string }> = {
  NEW: { label: 'Non lu', className: 'bg-aces-blue/10 text-aces-blue border-aces-blue/20' },
  READ: { label: 'Lu', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  ARCHIVED: { label: 'Archivé', className: 'bg-slate-100 text-slate-600 border-slate-200' },
};

export const ARTICLE_STATUS: Record<string, { label: string; className: string }> = {
  PUBLISHED: { label: 'Publié', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  DRAFT: { label: 'Brouillon', className: 'bg-slate-100 text-slate-600 border-slate-200' },
  SCHEDULED: { label: 'Programmé', className: 'bg-amber-100 text-amber-700 border-amber-200' },
};

export const ACTION_LABELS: Record<string, string> = {
  login: 'Connexion',
  logout: 'Déconnexion',
  create: 'Création',
  update: 'Modification',
  delete: 'Suppression',
  publish: 'Publication',
  unpublish: 'Dépublication',
  upload: 'Téléversement',
  reorder: 'Réorganisation',
};

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
