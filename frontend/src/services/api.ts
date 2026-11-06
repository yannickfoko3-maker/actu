/**
 * Client HTTP unique de l'application.
 *
 * - Toutes les requêtes passent par `/api` (proxy Vite en développement,
 *   même origine en production).
 * - Les cookies de session sont envoyés (`credentials: 'include'`).
 * - Le jeton CSRF est lu dans le cookie `aces_csrf` et renvoyé dans
 *   l'en-tête `X-CSRF-Token` sur chaque requête mutante.
 */

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';

export class ApiRequestError extends Error {
  status: number;
  details?: { field: string; message: string }[];

  constructor(message: string, status: number, details?: { field: string; message: string }[]) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.details = details;
  }
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  raw?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase();
  const headers = new Headers(options.headers);

  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const csrf = readCookie('aces_csrf');
    if (csrf) headers.set('X-CSRF-Token', csrf);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    method,
    headers,
    credentials: 'include',
    body:
      options.body instanceof FormData
        ? options.body
        : options.body !== undefined
          ? JSON.stringify(options.body)
          : undefined,
  });

  if (options.raw) return response as unknown as T;

  const contentType = response.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok || (payload && payload.success === false)) {
    const message = payload?.error?.message ?? `Erreur ${response.status}`;
    const details = Array.isArray(payload?.error?.details) ? payload.error.details : undefined;
    throw new ApiRequestError(message, response.status, details);
  }

  return (payload?.data ?? payload) as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'DELETE' }),
  upload: <T>(path: string, formData: FormData) => request<T>(path, { method: 'POST', body: formData }),
  raw: (path: string, options?: RequestOptions) => request<Response>(path, { ...options, raw: true }),
};

/** Clés de requête TanStack Query, centralisées pour éviter les fautes de frappe. */
export const queryKeys = {
  site: ['site'] as const,
  home: ['home'] as const,
  services: ['services'] as const,
  service: (slug: string) => ['service', slug] as const,
  projects: (params?: Record<string, unknown>) => ['projects', params ?? {}] as const,
  project: (slug: string) => ['project', slug] as const,
  articles: (params?: Record<string, unknown>) => ['articles', params ?? {}] as const,
  article: (slug: string) => ['article', slug] as const,
  page: (slug: string) => ['page', slug] as const,
  testimonials: ['testimonials'] as const,
  admin: {
    stats: ['admin', 'stats'] as const,
    services: (params?: Record<string, unknown>) => ['admin', 'services', params ?? {}] as const,
    service: (id: string) => ['admin', 'service', id] as const,
    hero: ['admin', 'hero'] as const,
    pages: (params?: Record<string, unknown>) => ['admin', 'pages', params ?? {}] as const,
    page: (id: string) => ['admin', 'page', id] as const,
    projects: (params?: Record<string, unknown>) => ['admin', 'projects', params ?? {}] as const,
    project: (id: string) => ['admin', 'project', id] as const,
    articles: (params?: Record<string, unknown>) => ['admin', 'articles', params ?? {}] as const,
    article: (id: string) => ['admin', 'article', id] as const,
    media: (params?: Record<string, unknown>) => ['admin', 'media', params ?? {}] as const,
    testimonials: ['admin', 'testimonials'] as const,
    messages: (params?: Record<string, unknown>) => ['admin', 'messages', params ?? {}] as const,
    message: (id: string) => ['admin', 'message', id] as const,
    quotes: (params?: Record<string, unknown>) => ['admin', 'quotes', params ?? {}] as const,
    quote: (id: string) => ['admin', 'quote', id] as const,
    settings: ['admin', 'settings'] as const,
    users: ['admin', 'users'] as const,
    activity: (params?: Record<string, unknown>) => ['admin', 'activity', params ?? {}] as const,
    categories: ['admin', 'categories'] as const,
  },
};
