import bcrypt from 'bcryptjs';
import { services } from './services';
import { heroSlides, pages, siteSettings } from './site';
import { articles, categories, projects, testimonials } from './editorial';
import { PERMISSIONS, ROLE_DEFINITIONS } from '../auth/permissions';
import manifest from './media-manifest.json';
import { env } from '../config/env';

/**
 * Construit le jeu de données initial du site.
 *
 * - Contenus éditoriaux : identiques en mémoire et dans MySQL.
 * - Demandes de démonstration : uniquement pour l'adaptateur `memory`
 *   (environnement de démonstration / tests). La base de production
 *   MySQL ne contient jamais de fausses demandes client.
 */

const now = () => new Date().toISOString();
const daysAgo = (days: number) => new Date(Date.now() - days * 86400000).toISOString();

interface SeedOptions {
  withDemoRequests?: boolean;
}

export function buildSeed(options: SeedOptions = {}): Record<string, any[]> {
  const createdAt = now();
  const passwordHash = bcrypt.hashSync(env.seedAdmin.password, 10);

  const roles = ROLE_DEFINITIONS.map((role) => ({
    id: `role-${role.name}`,
    name: role.name,
    label: role.label,
    description: role.description,
    permissions: [...role.permissions],
    isSystem: role.isSystem,
    createdAt,
    updatedAt: createdAt,
  }));

  const permissions = PERMISSIONS.map((permission) => ({
    id: `perm-${permission.code}`,
    code: permission.code,
    label: permission.label,
    group: permission.group,
    createdAt,
  }));

  const adminUsers = [
    {
      id: 'usr-super-admin',
      name: env.seedAdmin.name,
      email: env.seedAdmin.email.toLowerCase(),
      passwordHash,
      roleId: 'role-super-admin',
      isActive: true,
      lastLoginAt: null,
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: 'usr-editor',
      name: 'Rédaction ACES',
      email: 'editeur@aces-globalservices.com',
      passwordHash: bcrypt.hashSync('AcesEditor2025!', 10),
      roleId: 'role-editor',
      isActive: true,
      lastLoginAt: null,
      createdAt,
      updatedAt: createdAt,
    },
  ];

  const serviceRows = services.map((service) => ({
    id: service.id,
    slug: service.slug,
    title: service.title,
    tagline: service.tagline,
    shortDescription: service.shortDescription,
    description: service.description.trim(),
    icon: service.icon,
    heroImage: service.heroImage,
    coverImage: service.coverImage,
    benefits: service.benefits,
    features: service.features,
    applications: service.applications,
    process: service.process,
    equipment: service.equipment,
    faqs: service.faqs,
    seoTitle: service.seoTitle,
    seoDescription: service.seoDescription,
    order: service.order,
    isPublished: service.isPublished,
    createdAt,
    updatedAt: createdAt,
  }));

  const serviceImages = services.flatMap((service) =>
    service.images.map((image, index) => ({
      id: `${service.id}-img-${index + 1}`,
      serviceId: service.id,
      url: image.url,
      alt: image.alt,
      order: index,
    }))
  );

  const projectRows = projects.map((project) => ({
    id: project.id,
    slug: project.slug,
    title: project.title,
    category: project.category,
    client: project.client,
    location: project.location,
    year: project.year,
    summary: project.summary,
    description: project.description.trim(),
    coverImage: project.coverImage,
    isPublished: project.isPublished,
    featured: project.featured,
    order: project.order,
    createdAt: daysAgo(120 - project.order * 7),
    updatedAt: daysAgo(120 - project.order * 7),
  }));

  const projectImages = projects.flatMap((project) =>
    project.images.map((image, index) => ({
      id: `${project.id}-img-${index + 1}`,
      projectId: project.id,
      url: image.url,
      alt: image.alt,
      order: index,
    }))
  );

  const categoryRows = categories.map((category) => ({
    id: category.id,
    slug: category.slug,
    name: category.name,
    description: category.description,
    kind: category.kind,
    createdAt,
    updatedAt: createdAt,
  }));

  const articleRows = articles.map((article) => ({
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    content: article.content.trim(),
    coverImage: article.coverImage,
    categoryId: article.categoryId,
    tags: article.tags,
    author: article.author,
    status: article.status,
    publishedAt: article.publishedAt,
    readingTime: article.readingTime,
    views: 0,
    seoTitle: article.seoTitle,
    seoDescription: article.seoDescription,
    createdAt: article.publishedAt,
    updatedAt: article.publishedAt,
  }));

  const media = (manifest as { url: string; size: number; mimeType: string; width: number; height: number }[]).map(
    (item, index) => ({
      id: `med-seed-${index + 1}`,
      filename: item.url.split('/').pop() ?? item.url,
      originalName: item.url.split('/').pop() ?? item.url,
      url: item.url,
      thumbnailUrl: null,
      mimeType: item.mimeType,
      size: item.size,
      width: item.width,
      height: item.height,
      alt: altFromUrl(item.url),
      caption: '',
      createdAt: daysAgo(index),
    })
  );

  const settings = siteSettings.map((setting) => ({
    id: `set-${setting.key.replace(/\./g, '-')}`,
    key: setting.key,
    value: setting.value,
    group: setting.group,
    label: setting.label,
    type: setting.type,
    updatedAt: createdAt,
  }));

  const demo = options.withDemoRequests === true;

  const demoQuotes = demo
    ? [
        {
          id: 'quo-demo-1',
          name: 'Serge M.',
          company: 'Résidence Les Palmiers',
          email: 'serge.m@example.com',
          phone: '+236 72 00 11 22',
          city: 'Bangui',
          serviceSlug: 'cloture-electrique',
          serviceTitle: 'Clôture électrique',
          projectDescription:
            'Clôture électrique pour un périmètre de 150 mètres, avec sirène extérieure et raccordement au portail automatique existant.',
          budget: '1 000 000 – 2 500 000 FCFA',
          preferredContact: 'phone',
          consent: true,
          status: 'NEW',
          internalNotes: null,
          createdAt: daysAgo(2),
          updatedAt: daysAgo(2),
        },
        {
          id: 'quo-demo-2',
          name: 'Clarisse N.',
          company: 'Cabinet médical Espoir',
          email: 'contact@cabinet-espoir.example',
          phone: '+236 75 44 55 66',
          city: 'Bangui',
          serviceSlug: 'videosurveillance',
          serviceTitle: 'Vidéosurveillance',
          projectDescription:
            'Six caméras pour couvrir l’accueil, la salle d’attente et le parking, avec consultation depuis un téléphone.',
          budget: '500 000 – 1 000 000 FCFA',
          preferredContact: 'whatsapp',
          consent: true,
          status: 'IN_PROGRESS',
          internalNotes: 'Visite technique prévue vendredi, prévoir devis avec onduleur.',
          createdAt: daysAgo(9),
          updatedAt: daysAgo(5),
        },
        {
          id: 'quo-demo-3',
          name: 'Patrice K.',
          company: 'Transports Oubangui',
          email: 'p.k@transports-oubangui.example',
          phone: '+236 70 12 34 56',
          city: 'Bimbo',
          serviceSlug: 'geolocalisation-gps',
          serviceTitle: 'Géolocalisation GPS',
          projectDescription:
            'Équipement GPS de 12 camions avec alertes de sortie de zone et rapport mensuel.',
          budget: 'À définir ensemble',
          preferredContact: 'email',
          consent: true,
          status: 'DONE',
          internalNotes: 'Contrat signé, installation planifiée.',
          createdAt: daysAgo(38),
          updatedAt: daysAgo(30),
        },
        {
          id: 'quo-demo-4',
          name: 'Nadège B.',
          company: '',
          email: 'nadege.b@example.com',
          phone: '+236 77 88 99 00',
          city: 'Bangui',
          serviceSlug: 'panneaux-solaires',
          serviceTitle: 'Panneaux solaires',
          projectDescription:
            'Installation solaire pour une maison : éclairage, réfrigérateur et ventilateurs, autonomie souhaitée la nuit.',
          budget: '',
          preferredContact: 'phone',
          consent: true,
          status: 'NEW',
          internalNotes: null,
          createdAt: daysAgo(64),
          updatedAt: daysAgo(64),
        },
        {
          id: 'quo-demo-5',
          name: 'Bureau d’études Ouaka',
          company: 'BET Ouaka',
          email: 'direction@bet-ouaka.example',
          phone: '+236 71 23 45 67',
          city: 'Bangui',
          serviceSlug: 'controle-acces',
          serviceTitle: 'Contrôle d’accès',
          projectDescription:
            'Contrôle d’accès par badge sur quatre portes, avec gestion des horaires et export des présences.',
          budget: '1 000 000 – 2 500 000 FCFA',
          preferredContact: 'phone',
          consent: true,
          status: 'NEW',
          internalNotes: null,
          createdAt: daysAgo(96),
          updatedAt: daysAgo(96),
        },
      ]
    : [];

  const demoMessages = demo
    ? [
        {
          id: 'msg-demo-1',
          name: 'Yannick D.',
          email: 'yannick.d@example.com',
          phone: '+236 72 33 44 55',
          subject: 'Demande d’information sur l’interphonie',
          message:
            'Bonjour, je souhaite équiper un immeuble de six appartements. Pouvez-vous me conseiller sur un système de vidéophone ?',
          status: 'NEW',
          ip: '127.0.0.1',
          createdAt: daysAgo(1),
        },
        {
          id: 'msg-demo-2',
          name: 'Esther G.',
          email: 'esther.g@example.com',
          phone: '+236 75 66 77 88',
          subject: 'Maintenance clôture électrique',
          message:
            'Notre clôture déclenche des alarmes sans raison depuis une semaine. Est-il possible d’avoir une intervention rapide ?',
          status: 'READ',
          ip: '127.0.0.1',
          createdAt: daysAgo(6),
        },
        {
          id: 'msg-demo-3',
          name: 'Hôtel Kanda',
          email: 'reception@hotel-kanda.example',
          phone: '+236 70 99 88 77',
          subject: 'Projet alarme incendie',
          message:
            'Nous rénovons un hôtel de 32 chambres et souhaitons un devis pour la détection incendie des étages.',
          status: 'NEW',
          ip: '127.0.0.1',
          createdAt: daysAgo(21),
        },
      ]
    : [];

  const activityLogs = demo
    ? [
        {
          id: 'log-demo-1',
          userId: 'usr-super-admin',
          userName: env.seedAdmin.name,
          action: 'login',
          entity: 'session',
          entityId: null,
          description: 'Connexion à l’espace d’administration',
          ip: '127.0.0.1',
          createdAt: daysAgo(0),
        },
        {
          id: 'log-demo-2',
          userId: 'usr-super-admin',
          userName: env.seedAdmin.name,
          action: 'update',
          entity: 'service',
          entityId: 'svc-videosurveillance',
          description: 'Mise à jour de la prestation « Vidéosurveillance »',
          ip: '127.0.0.1',
          createdAt: daysAgo(3),
        },
      ]
    : [];

  return {
    roles,
    permissions,
    adminUsers,
    activityLogs,
    services: serviceRows,
    serviceImages,
    pages: pages.map((page) => ({
      ...page,
      sections: [],
      createdAt,
      updatedAt: createdAt,
    })),
    heroSlides: heroSlides.map((slide) => ({ ...slide, createdAt, updatedAt: createdAt })),
    projects: projectRows,
    projectImages,
    categories: categoryRows,
    articles: articleRows,
    media,
    testimonials: testimonials.map((testimonial) => ({
      ...testimonial,
      createdAt,
      updatedAt: createdAt,
    })),
    contactMessages: demoMessages,
    quoteRequests: demoQuotes,
    siteSettings: settings,
  };
}

function altFromUrl(url: string): string {
  const file = (url.split('/').pop() ?? '').replace(/\.(jpe?g|png|webp)$/i, '').replace(/-/g, ' ');
  const folder = url.split('/').slice(-2)[0] ?? '';
  return `${file} (${folder})`;
}
