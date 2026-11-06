import type { Database, FindOptions, Repo, Where } from './types';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Adaptateur Prisma (MySQL 8 / MariaDB).
 *
 * Le client Prisma est chargé dynamiquement afin que l'application puisse
 * démarrer avec DATA_ADAPTER=memory même lorsque `prisma generate` n'a pas
 * encore été exécuté (CI, démonstration, poste sans MySQL).
 */

let prismaClient: any = null;

export function getPrismaClient(): any {
  if (prismaClient) return prismaClient;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaClient } = require('@prisma/client');
    prismaClient = new PrismaClient({
      log: process.env.PRISMA_LOG === 'true' ? ['query', 'warn', 'error'] : ['warn', 'error'],
    });
    return prismaClient;
  } catch (error) {
    throw new Error(
      "Le client Prisma n'est pas généré. Exécutez `npm run db:generate` " +
        'ou démarrez avec DATA_ADAPTER=memory. Détail : ' +
        (error as Error).message
    );
  }
}

function toPrismaWhere(where?: Where): Record<string, unknown> | undefined {
  if (!where) return undefined;
  const result: Record<string, any> = {};
  for (const [field, condition] of Object.entries(where)) {
    if (condition === undefined) continue;
    if (condition === null) {
      result[field] = null;
      continue;
    }
    if (typeof condition !== 'object' || condition instanceof Date) {
      result[field] = condition;
      continue;
    }
    const c = condition as Record<string, any>;
    if (c.equals !== undefined) result[field] = c.equals;
    if (c.contains !== undefined) result[field] = { ...(result[field] ?? {}), contains: c.contains };
    if (c.startsWith !== undefined) result[field] = { ...(result[field] ?? {}), startsWith: c.startsWith };
    if (c.endsWith !== undefined) result[field] = { ...(result[field] ?? {}), endsWith: c.endsWith };
    if (c.in !== undefined) result[field] = { ...(result[field] ?? {}), in: c.in };
    if (c.notIn !== undefined) result[field] = { ...(result[field] ?? {}), notIn: c.notIn };
    if (c.not !== undefined) result[field] = { ...(result[field] ?? {}), not: c.not };
    if (c.gte !== undefined) result[field] = { ...(result[field] ?? {}), gte: c.gte };
    if (c.lte !== undefined) result[field] = { ...(result[field] ?? {}), lte: c.lte };
    if (c.gt !== undefined) result[field] = { ...(result[field] ?? {}), gt: c.gt };
    if (c.lt !== undefined) result[field] = { ...(result[field] ?? {}), lt: c.lt };
    if (c.isNull !== undefined) result[field] = c.isNull ? null : { not: null };
  }
  return result;
}

function toPrismaOrderBy(orderBy?: FindOptions['orderBy']): Record<string, 'asc' | 'desc'>[] | undefined {
  if (!orderBy) return undefined;
  return Array.isArray(orderBy) ? orderBy : [orderBy];
}

function prismaRepo(delegateName: string): Repo<any> {
  const delegate = () => getPrismaClient()[delegateName];

  return {
    async findMany(options) {
      return delegate().findMany({
        where: toPrismaWhere(options?.where),
        orderBy: toPrismaOrderBy(options?.orderBy),
        take: options?.take,
        skip: options?.skip,
      });
    },
    async findFirst(options) {
      return delegate().findFirst({
        where: toPrismaWhere(options?.where),
        orderBy: toPrismaOrderBy(options?.orderBy),
        skip: options?.skip,
      });
    },
    async findById(id) {
      return delegate().findUnique({ where: { id } });
    },
    async findOneBy(field, value) {
      return delegate().findFirst({ where: { [field]: value } });
    },
    async create(data) {
      return delegate().create({ data });
    },
    async update(id, data) {
      return delegate().update({ where: { id }, data });
    },
    async remove(id) {
      await delegate().delete({ where: { id } });
    },
    async removeMany(where) {
      const result = await delegate().deleteMany({ where: toPrismaWhere(where) });
      return result.count as number;
    },
    async updateMany(where, data) {
      const result = await delegate().updateMany({ where: toPrismaWhere(where), data });
      return result.count as number;
    },
    async count(where) {
      return delegate().count({ where: toPrismaWhere(where) });
    },
  };
}

const delegates: Record<keyof Database, string> = {
  roles: 'role',
  permissions: 'permission',
  adminUsers: 'adminUser',
  activityLogs: 'activityLog',
  services: 'service',
  serviceImages: 'serviceImage',
  pages: 'page',
  heroSlides: 'heroSlide',
  projects: 'project',
  projectImages: 'projectImage',
  categories: 'category',
  articles: 'article',
  media: 'media',
  testimonials: 'testimonial',
  contactMessages: 'contactMessage',
  quoteRequests: 'quoteRequest',
  siteSettings: 'siteSetting',
};

export function createPrismaDatabase(): Database {
  const db = {} as Database;
  for (const [key, delegate] of Object.entries(delegates)) {
    (db as unknown as Record<string, Repo<any>>)[key] = prismaRepo(delegate);
  }
  return db;
}
