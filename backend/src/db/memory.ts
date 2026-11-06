import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { env } from '../config/env';
import type { Database, FindOptions, Repo, Where } from './types';
import { COLLECTIONS, matches, sortDocs } from './types';
import { buildSeed } from '../data/seed';

/**
 * Magasin JSON — utilisé quand DATA_ADAPTER=memory.
 *
 * Il permet de faire tourner l'application complète (site + back-office)
 * sans serveur MySQL : pratique pour la démonstration, les tests automatisés
 * et les postes de développement. Les données sont écrites dans
 * `backend/.data/db.json`.
 */

type Row = Record<string, any> & { id: string };
type Store = Record<string, Row[]>;

let cache: Store | null = null;
let writeScheduled = false;

function emptyStore(): Store {
  return Object.fromEntries(COLLECTIONS.map((c) => [c, [] as Row[]])) as Store;
}

function seedStore(): Store {
  const seed = buildSeed({ withDemoRequests: process.env.DEMO_REQUESTS !== 'false' });
  const store = emptyStore();
  for (const [key, value] of Object.entries(seed)) {
    if (key in store && Array.isArray(value)) store[key] = value as Row[];
  }
  return store;
}

function load(): Store {
  if (cache) return cache;
  try {
    if (fs.existsSync(env.dataFile)) {
      const raw = JSON.parse(fs.readFileSync(env.dataFile, 'utf8')) as Store;
      const store = emptyStore();
      for (const key of COLLECTIONS) {
        if (Array.isArray(raw[key])) store[key] = raw[key] as Row[];
      }
      cache = store;
      return cache;
    }
  } catch (error) {
    console.warn('[memory] lecture du magasin impossible, réinitialisation :', (error as Error).message);
  }
  cache = seedStore();
  persist(true);
  return cache;
}

function persist(immediate = false): void {
  if (!cache) return;
  if (!immediate) {
    if (writeScheduled) return;
    writeScheduled = true;
    setImmediate(() => {
      writeScheduled = false;
      persist(true);
    });
    return;
  }
  try {
    const dir = path.dirname(env.dataFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(env.dataFile, JSON.stringify(cache, null, 2), 'utf8');
  } catch (error) {
    console.warn('[memory] écriture impossible :', (error as Error).message);
  }
}

const clone = <T>(value: T): T =>
  typeof structuredClone === 'function'
    ? structuredClone(value)
    : (JSON.parse(JSON.stringify(value)) as T);

function applyOptions(rows: Row[], options?: FindOptions): Row[] {
  let result = rows.filter((row) => matches(row, options?.where));
  result = sortDocs(result, options?.orderBy);
  if (options?.skip) result = result.slice(options.skip);
  if (options?.take !== undefined) result = result.slice(0, options.take);
  return result;
}

const now = () => new Date().toISOString();

function memoryRepo<T extends Row>(collection: string, idPrefix: string): Repo<T> {
  const rows = () => load()[collection] as T[];

  return {
    async findMany(options) {
      return clone(applyOptions(rows() as Row[], options) as T[]);
    },
    async findFirst(options) {
      const [first] = applyOptions(rows() as Row[], options);
      return first ? clone(first as T) : null;
    },
    async findById(id) {
      const found = (rows() as Row[]).find((r) => r.id === id);
      return found ? clone(found as T) : null;
    },
    async findOneBy(field, value) {
      const found = applyOptions(rows() as Row[], { where: { [field]: value } as Where })[0];
      return found ? clone(found as T) : null;
    },
    async create(data) {
      const row = {
        id: (data.id as string) ?? `${idPrefix}-${crypto.randomUUID()}`,
        createdAt: data.createdAt ?? now(),
        updatedAt: data.updatedAt ?? now(),
        ...data,
      } as unknown as T;
      rows().push(row);
      persist();
      return clone(row);
    },
    async update(id, data) {
      const list = rows() as Row[];
      const index = list.findIndex((r) => r.id === id);
      if (index === -1) throw Object.assign(new Error('Ressource introuvable'), { statusCode: 404 });
      const updated = { ...list[index], ...data, id, updatedAt: now() } as unknown as T;
      list[index] = updated as unknown as Row;
      persist();
      return clone(updated);
    },
    async remove(id) {
      const list = rows() as Row[];
      const index = list.findIndex((r) => r.id === id);
      if (index === -1) return;
      list.splice(index, 1);
      persist();
    },
    async removeMany(where) {
      const list = rows() as Row[];
      const remaining = list.filter((r) => !matches(r, where));
      const removed = list.length - remaining.length;
      (load()[collection] as Row[]) = remaining;
      persist();
      return removed;
    },
    async updateMany(where, data) {
      const list = rows() as Row[];
      let count = 0;
      list.forEach((row, index) => {
        if (matches(row, where)) {
          list[index] = { ...row, ...data, id: row.id, updatedAt: now() };
          count += 1;
        }
      });
      persist();
      return count;
    },
    async count(where) {
      return (rows() as Row[]).filter((r) => matches(r, where)).length;
    },
  };
}

const prefixes: Record<string, string> = {
  roles: 'role',
  permissions: 'perm',
  adminUsers: 'usr',
  activityLogs: 'log',
  services: 'svc',
  serviceImages: 'simg',
  pages: 'page',
  heroSlides: 'hero',
  projects: 'prj',
  projectImages: 'pimg',
  categories: 'cat',
  articles: 'art',
  media: 'med',
  testimonials: 'tst',
  contactMessages: 'msg',
  quoteRequests: 'quo',
  siteSettings: 'set',
};

export function createMemoryDatabase(): Database {
  const db = {} as Database;
  for (const collection of COLLECTIONS) {
    (db as unknown as Record<string, Repo<any>>)[collection] = memoryRepo(collection, prefixes[collection] ?? 'row');
  }
  return db;
}

export function resetMemoryDatabase(): void {
  cache = seedStore();
  persist(true);
}
