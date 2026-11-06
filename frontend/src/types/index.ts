export interface Settings {
  [key: string]: string;
}

export interface HeroSlide {
  id: string;
  eyebrow?: string | null;
  title: string;
  subtitle: string;
  image: string;
  primaryLabel: string;
  primaryUrl: string;
  secondaryLabel: string;
  secondaryUrl: string;
  order: number;
  isActive: boolean;
}

export interface ServiceImage {
  id?: string;
  url: string;
  alt: string;
}

export interface ServiceFeature {
  title: string;
  description: string;
}

export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface ServiceSummary {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  shortDescription: string;
  icon: string;
  coverImage: string;
  heroImage?: string;
  order: number;
}

export interface Service extends ServiceSummary {
  description: string;
  benefits: string[];
  features: ServiceFeature[];
  applications: string[];
  process: { title: string; description: string }[];
  equipment: string[];
  faqs: ServiceFaq[];
  images: ServiceImage[];
  toc: { id: string; label: string }[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  isPublished: boolean;
  relatedServices?: Pick<ServiceSummary, 'slug' | 'title' | 'tagline' | 'coverImage' | 'icon'>[];
  relatedProjects?: {
    slug: string;
    title: string;
    summary: string;
    coverImage: string;
    location: string;
    year?: number | null;
  }[];
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  kind: 'article' | 'project';
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: string;
  client?: string | null;
  location: string;
  year?: number | null;
  summary: string;
  description: string;
  coverImage: string;
  images: ServiceImage[];
  service?: { slug: string; title: string; icon: string } | null;
  related?: { slug: string; title: string; coverImage: string; category: string; location: string }[];
  isPublished: boolean;
  featured: boolean;
  order: number;
  createdAt?: string;
}

export interface ArticleSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  publishedAt?: string | null;
  readingTime: number;
  author: string;
  tags: string[];
  category?: { slug: string; name: string } | null;
  status?: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';
}

export interface Article extends ArticleSummary {
  content: string;
  categoryId?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  views?: number;
  related?: ArticleSummary[];
}

export interface PageContent {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  heroImage?: string | null;
  content: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  status: 'DRAFT' | 'PUBLISHED';
  system: boolean;
  updatedAt?: string;
}

export interface Testimonial {
  id: string;
  authorName: string;
  authorRole?: string | null;
  company?: string | null;
  content: string;
  rating: number;
  photo?: string | null;
  isPublished: boolean;
  order: number;
}

export interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  thumbnailUrl?: string | null;
  mimeType: string;
  size: number;
  width?: number | null;
  height?: number | null;
  alt: string;
  caption: string;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'NEW' | 'READ' | 'ARCHIVED';
  createdAt: string;
}

export interface QuoteRequest {
  id: string;
  name: string;
  company?: string | null;
  email: string;
  phone: string;
  city: string;
  serviceSlug?: string | null;
  serviceTitle: string;
  projectDescription: string;
  budget?: string | null;
  preferredContact: 'phone' | 'email' | 'whatsapp';
  consent: boolean;
  status: 'NEW' | 'IN_PROGRESS' | 'DONE' | 'ARCHIVED';
  internalNotes?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  roleId: string;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
  role?: { name: string; label: string } | null;
}

export interface Role {
  id: string;
  name: string;
  label: string;
  description?: string | null;
  permissions: string[];
  isSystem: boolean;
  users?: AdminUser[];
}

export interface ActivityLog {
  id: string;
  userName: string;
  action: string;
  entity: string;
  entityId?: string | null;
  description: string;
  ip?: string | null;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  pagination: Pagination;
}

export interface DashboardStats {
  counts: {
    services: { total: number; published: number };
    projects: { total: number; published: number };
    articles: { total: number; published: number };
    quotes: { total: number; new: number };
    messages: { total: number; new: number };
    slides: { total: number; active: number };
    media: { total: number };
    testimonials: { total: number };
    users: { total: number };
  };
  charts: {
    quotesPerMonth: { month: string; key: string; value: number }[];
    messagesPerMonth: { month: string; key: string; value: number }[];
    articlesPerMonth: { month: string; key: string; value: number }[];
    quotesByStatus: { status: string; value: number }[];
    quotesByService: { name: string; value: number }[];
  };
  recent: { quotes: QuoteRequest[]; messages: ContactMessage[] };
  activity: ActivityLog[];
  environment: { dataAdapter: string; mailConfigured: boolean };
}

export interface HomeContent {
  settings: Settings;
  slides: HeroSlide[];
  services: ServiceSummary[];
  projects: (Project & { images: string[] })[];
  articles: ArticleSummary[];
  testimonials: Testimonial[];
  stats: { services: number; projects: number; articles: number };
}
