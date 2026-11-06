import { z } from 'zod';

const phoneRegex = /^[+0-9()\s.-]{6,25}$/;
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const loginSchema = z.object({
  email: z.string().email('Adresse e-mail invalide.'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères.'),
  remember: z.boolean().optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Mot de passe actuel requis.'),
    newPassword: z
      .string()
      .min(10, 'Le nouveau mot de passe doit contenir au moins 10 caractères.')
      .regex(/[A-Za-z]/, 'Ajoutez au moins une lettre.')
      .regex(/[0-9]/, 'Ajoutez au moins un chiffre.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les deux mots de passe ne correspondent pas.',
    path: ['confirmPassword'],
  });

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Indiquez votre nom.').max(120),
  email: z.string().trim().email('Adresse e-mail invalide.').max(180),
  phone: z.string().trim().regex(phoneRegex, 'Numéro de téléphone invalide.').max(25),
  subject: z.string().trim().min(3, 'Précisez le sujet.').max(160),
  message: z.string().trim().min(10, 'Votre message doit contenir au moins 10 caractères.').max(4000),
  consent: z.boolean().optional(),
  honeypot: z.string().max(0, 'Soumission invalide.').optional(),
});

export const quoteSchema = z.object({
  name: z.string().trim().min(2, 'Indiquez votre nom.').max(120),
  company: z.string().trim().max(160).optional().or(z.literal('')),
  email: z.string().trim().email('Adresse e-mail invalide.').max(180),
  phone: z.string().trim().regex(phoneRegex, 'Numéro de téléphone invalide.').max(25),
  city: z.string().trim().min(2, 'Indiquez votre ville.').max(120),
  serviceSlug: z.string().trim().max(120).optional().or(z.literal('')),
  serviceTitle: z.string().trim().min(2, 'Sélectionnez une prestation.').max(160),
  projectDescription: z
    .string()
    .trim()
    .min(20, 'Décrivez votre projet en quelques mots (20 caractères minimum).')
    .max(4000),
  budget: z.string().trim().max(120).optional().or(z.literal('')),
  preferredContact: z.enum(['phone', 'email', 'whatsapp']).default('phone'),
  consent: z.literal(true, { errorMap: () => ({ message: 'Votre consentement est nécessaire.' }) }),
  honeypot: z.string().max(0, 'Soumission invalide.').optional(),
});

export const serviceSchema = z.object({
  slug: z.string().trim().regex(slugRegex, 'Le slug ne doit contenir que des minuscules, chiffres et tirets.').max(80).optional(),
  title: z.string().trim().min(2, 'Titre requis.').max(160),
  tagline: z.string().trim().min(2, 'Accroche requise.').max(220),
  shortDescription: z.string().trim().min(10, 'Description courte requise.').max(600),
  description: z.string().trim().min(20, 'Contenu détaillé requis.'),
  icon: z.string().trim().max(60).default('shield'),
  heroImage: z.string().trim().min(1, 'Image de bannière requise.'),
  coverImage: z.string().trim().min(1, 'Image de couverture requise.'),
  benefits: z.array(z.string().trim().min(1)).default([]),
  features: z.array(z.object({ title: z.string().trim().min(1), description: z.string().trim().min(1) })).default([]),
  applications: z.array(z.string().trim().min(1)).default([]),
  process: z.array(z.object({ title: z.string().trim().min(1), description: z.string().trim().min(1) })).default([]),
  equipment: z.array(z.string().trim().min(1)).default([]),
  faqs: z.array(z.object({ question: z.string().trim().min(1), answer: z.string().trim().min(1) })).default([]),
  seoTitle: z.string().trim().max(200).optional().or(z.literal('')),
  seoDescription: z.string().trim().max(400).optional().or(z.literal('')),
  order: z.number().int().min(0).max(999).default(0),
  isPublished: z.boolean().default(true),
  images: z.array(z.object({ url: z.string().trim().min(1), alt: z.string().trim().default('') })).default([]),
});

export const heroSlideSchema = z.object({
  title: z.string().trim().min(3, 'Titre requis.').max(160),
  subtitle: z.string().trim().min(10, 'Sous-titre requis.').max(400),
  eyebrow: z.string().trim().max(120).optional().or(z.literal('')),
  image: z.string().trim().min(1, 'Image requise.'),
  primaryLabel: z.string().trim().max(60).default('Demander un devis'),
  primaryUrl: z.string().trim().max(200).default('/devis'),
  secondaryLabel: z.string().trim().max(60).default('Découvrir nos solutions'),
  secondaryUrl: z.string().trim().max(200).default('/nos-activites'),
  order: z.number().int().min(0).max(99).default(0),
  isActive: z.boolean().default(true),
});

export const pageSchema = z.object({
  slug: z.string().trim().regex(slugRegex, 'Slug invalide.').optional(),
  title: z.string().trim().min(2, 'Titre requis.').max(200),
  subtitle: z.string().trim().max(400).optional().or(z.literal('')),
  heroImage: z.string().trim().max(400).optional().or(z.literal('')),
  content: z.string().trim().min(10, 'Contenu requis.'),
  seoTitle: z.string().trim().max(200).optional().or(z.literal('')),
  seoDescription: z.string().trim().max(400).optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('PUBLISHED'),
});

export const projectSchema = z.object({
  slug: z.string().trim().regex(slugRegex, 'Slug invalide.').optional(),
  title: z.string().trim().min(2, 'Titre requis.').max(200),
  category: z.string().trim().min(2, 'Sélectionnez une prestation.').max(80),
  client: z.string().trim().max(160).optional().or(z.literal('')),
  location: z.string().trim().min(2, 'Lieu requis.').max(120),
  year: z.number().int().min(1990).max(2100).nullable().optional(),
  summary: z.string().trim().min(10, 'Résumé requis.').max(600),
  description: z.string().trim().min(20, 'Description requise.'),
  coverImage: z.string().trim().min(1, 'Image principale requise.'),
  isPublished: z.boolean().default(true),
  featured: z.boolean().default(false),
  order: z.number().int().min(0).max(999).default(0),
  images: z.array(z.object({ url: z.string().trim().min(1), alt: z.string().trim().default('') })).default([]),
});

export const articleSchema = z.object({
  slug: z.string().trim().regex(slugRegex, 'Slug invalide.').optional(),
  title: z.string().trim().min(3, 'Titre requis.').max(220),
  excerpt: z.string().trim().min(10, 'Chapeau requis.').max(600),
  content: z.string().trim().min(20, 'Contenu requis.'),
  coverImage: z.string().trim().min(1, 'Image principale requise.'),
  categoryId: z.string().trim().nullable().optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
  author: z.string().trim().max(120).default('ACES Global Services'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED']).default('DRAFT'),
  publishedAt: z.string().datetime().nullable().optional(),
  readingTime: z.number().int().min(1).max(60).default(4),
  seoTitle: z.string().trim().max(200).optional().or(z.literal('')),
  seoDescription: z.string().trim().max(400).optional().or(z.literal('')),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, 'Nom requis.').max(120),
  slug: z.string().trim().regex(slugRegex, 'Slug invalide.').optional(),
  description: z.string().trim().max(400).optional().or(z.literal('')),
  kind: z.enum(['article', 'project']).default('article'),
});

export const testimonialSchema = z.object({
  authorName: z.string().trim().min(2, 'Nom requis.').max(120),
  authorRole: z.string().trim().max(120).optional().or(z.literal('')),
  company: z.string().trim().max(160).optional().or(z.literal('')),
  content: z.string().trim().min(20, 'Témoignage trop court.').max(1200),
  rating: z.number().int().min(1).max(5).default(5),
  photo: z.string().trim().max(400).optional().or(z.literal('')),
  isPublished: z.boolean().default(false),
  order: z.number().int().min(0).max(999).default(0),
});

export const mediaUpdateSchema = z.object({
  alt: z.string().trim().max(300).optional(),
  caption: z.string().trim().max(300).optional(),
  filename: z.string().trim().max(200).optional(),
});

export const settingsSchema = z.record(z.string().max(200), z.union([z.string(), z.number(), z.boolean()]));

export const userCreateSchema = z.object({
  name: z.string().trim().min(2, 'Nom requis.').max(120),
  email: z.string().trim().email('Adresse e-mail invalide.').max(180),
  password: z
    .string()
    .min(10, 'Le mot de passe doit contenir au moins 10 caractères.')
    .regex(/[A-Za-z]/, 'Ajoutez au moins une lettre.')
    .regex(/[0-9]/, 'Ajoutez au moins un chiffre.'),
  roleId: z.string().trim().min(1, 'Rôle requis.'),
  isActive: z.boolean().default(true),
});

export const userUpdateSchema = userCreateSchema.partial().omit({ password: true }).extend({
  password: z
    .string()
    .min(10, 'Le mot de passe doit contenir au moins 10 caractères.')
    .optional()
    .or(z.literal('')),
});

export const quoteUpdateSchema = z.object({
  status: z.enum(['NEW', 'IN_PROGRESS', 'DONE', 'ARCHIVED']).optional(),
  internalNotes: z.string().max(4000).optional(),
});

export const messageUpdateSchema = z.object({
  status: z.enum(['NEW', 'READ', 'ARCHIVED']).optional(),
});

export const replySchema = z.object({
  subject: z.string().trim().min(3, 'Objet requis.').max(200),
  message: z.string().trim().min(10, 'Message trop court.').max(4000),
});

export const reorderSchema = z.object({
  items: z.array(z.object({ id: z.string().min(1), order: z.number().int().min(0) })).min(1),
});
