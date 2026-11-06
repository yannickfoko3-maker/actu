import { env } from '../config/env';
import type { Database } from './types';
import { createMemoryDatabase } from './memory';
import { createPrismaDatabase } from './prisma';

let instance: Database | null = null;

/** Point d'accès unique au magasin de données (Prisma ou mémoire). */
export function getDb(): Database {
  if (instance) return instance;
  instance = env.dataAdapter === 'memory' ? createMemoryDatabase() : createPrismaDatabase();
  return instance;
}

export const db = new Proxy({} as Database, {
  get(_target, prop) {
    const database = getDb();
    return (database as unknown as Record<string | symbol, unknown>)[prop];
  },
});
