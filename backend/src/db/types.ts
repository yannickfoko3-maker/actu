/**
 * Contrats du magasin de données.
 *
 * L'application n'accède jamais directement à Prisma : elle passe par ces
 * interfaces. Deux implémentations existent :
 *  - `prismaRepo`  → MySQL (production)
 *  - `memoryRepo`  → fichier JSON (démo / tests / poste sans MySQL)
 *
 * Les deux respectent exactement la même sémantique de requête.
 */

export type Scalar = string | number | boolean | Date | null;

export type Condition =
  | Scalar
  | {
      equals?: Scalar;
      contains?: string;
      startsWith?: string;
      endsWith?: string;
      in?: Scalar[];
      notIn?: Scalar[];
      not?: Scalar;
      gte?: Scalar;
      lte?: Scalar;
      gt?: Scalar;
      lt?: Scalar;
      isNull?: boolean;
    };

export type Where = Record<string, Condition | undefined>;

export type OrderBy = Record<string, 'asc' | 'desc'>;

export interface FindOptions {
  where?: Where;
  orderBy?: OrderBy | OrderBy[];
  take?: number;
  skip?: number;
}

export interface Repo<T extends { id: string }> {
  findMany(options?: FindOptions): Promise<T[]>;
  findFirst(options?: FindOptions): Promise<T | null>;
  findById(id: string): Promise<T | null>;
  findOneBy(field: keyof T & string, value: Scalar): Promise<T | null>;
  create(data: Record<string, unknown>): Promise<T>;
  update(id: string, data: Record<string, unknown>): Promise<T>;
  remove(id: string): Promise<void>;
  removeMany(where: Where): Promise<number>;
  updateMany(where: Where, data: Record<string, unknown>): Promise<number>;
  count(where?: Where): Promise<number>;
}

export interface Database {
  roles: Repo<any>;
  permissions: Repo<any>;
  adminUsers: Repo<any>;
  activityLogs: Repo<any>;
  services: Repo<any>;
  serviceImages: Repo<any>;
  pages: Repo<any>;
  heroSlides: Repo<any>;
  projects: Repo<any>;
  projectImages: Repo<any>;
  categories: Repo<any>;
  articles: Repo<any>;
  media: Repo<any>;
  testimonials: Repo<any>;
  contactMessages: Repo<any>;
  quoteRequests: Repo<any>;
  siteSettings: Repo<any>;
}

export const COLLECTIONS = [
  'roles',
  'permissions',
  'adminUsers',
  'activityLogs',
  'services',
  'serviceImages',
  'pages',
  'heroSlides',
  'projects',
  'projectImages',
  'categories',
  'articles',
  'media',
  'testimonials',
  'contactMessages',
  'quoteRequests',
  'siteSettings',
] as const;

export type CollectionName = (typeof COLLECTIONS)[number];

export function matchValue(value: unknown, condition: Condition | undefined): boolean {
  if (condition === undefined) return true;
  if (condition === null) return value === null || value === undefined;
  if (typeof condition !== 'object' || condition instanceof Date) {
    return normalise(value) === normalise(condition as Scalar);
  }
  const c = condition;
  if (c.equals !== undefined && normalise(value) !== normalise(c.equals)) return false;
  if (c.isNull !== undefined) {
    const isNull = value === null || value === undefined;
    if (c.isNull !== isNull) return false;
  }
  if (c.contains !== undefined) {
    if (!String(value ?? '').toLowerCase().includes(c.contains.toLowerCase())) return false;
  }
  if (c.startsWith !== undefined) {
    if (!String(value ?? '').toLowerCase().startsWith(c.startsWith.toLowerCase())) return false;
  }
  if (c.endsWith !== undefined) {
    if (!String(value ?? '').toLowerCase().endsWith(c.endsWith.toLowerCase())) return false;
  }
  if (c.in !== undefined && !c.in.some((v) => normalise(v) === normalise(value))) return false;
  if (c.notIn !== undefined && c.notIn.some((v) => normalise(v) === normalise(value))) return false;
  if (c.not !== undefined && normalise(c.not) === normalise(value)) return false;
  if (c.gte !== undefined && !(compare(value, c.gte) >= 0)) return false;
  if (c.lte !== undefined && !(compare(value, c.lte) <= 0)) return false;
  if (c.gt !== undefined && !(compare(value, c.gt) > 0)) return false;
  if (c.lt !== undefined && !(compare(value, c.lt) < 0)) return false;
  return true;
}

function normalise(value: unknown): string | number | boolean | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value;
  const asString = String(value);
  if (/^\d{4}-\d{2}-\d{2}T/.test(asString)) return new Date(asString).toISOString();
  return asString.toLowerCase();
}

function compare(a: unknown, b: Scalar): number {
  const na = normalise(a);
  const nb = normalise(b);
  if (typeof na === 'number' && typeof nb === 'number') return na - nb;
  return String(na) < String(nb) ? -1 : String(na) > String(nb) ? 1 : 0;
}

export function matches<T extends object>(doc: T, where?: Where): boolean {
  if (!where) return true;
  return Object.entries(where).every(([field, condition]) =>
    matchValue((doc as Record<string, unknown>)[field], condition)
  );
}

export function sortDocs<T extends object>(docs: T[], orderBy?: OrderBy | OrderBy[]): T[] {
  if (!orderBy) return docs;
  const clauses = Array.isArray(orderBy) ? orderBy : [orderBy];
  return [...docs].sort((a, b) => {
    for (const clause of clauses) {
      for (const [field, direction] of Object.entries(clause)) {
        const result = compare(
          (a as Record<string, unknown>)[field],
          (b as Record<string, unknown>)[field] as Scalar
        );
        if (result !== 0) return direction === 'desc' ? -result : result;
      }
    }
    return 0;
  });
}
