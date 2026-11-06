import type { Request } from 'express';
import { db } from '../db';

interface LogInput {
  req?: Request;
  action: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'publish' | 'unpublish' | 'upload' | 'reorder';
  entity: string;
  entityId?: string | null;
  description: string;
  userId?: string | null;
  userName?: string;
}

/** Journalise une opération d'administration (best-effort : ne bloque jamais l'action). */
export async function logActivity(input: LogInput): Promise<void> {
  try {
    const user = input.req?.user;
    await db.activityLogs.create({
      userId: input.userId ?? user?.id ?? null,
      userName: input.userName ?? user?.name ?? 'Système',
      action: input.action,
      entity: input.entity,
      entityId: input.entityId ?? null,
      description: input.description,
      ip: input.req?.ip ?? null,
    });
  } catch (error) {
    console.warn('[activity] enregistrement impossible :', (error as Error).message);
  }
}
