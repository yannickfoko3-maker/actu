import type { Request, Response } from 'express';
import { db } from '../db';
import { asyncHandler, ok, parseBody } from '../utils/http';
import { settingsSchema } from '../validators';
import { getSettings, saveSettings } from '../utils/settings';
import { logActivity } from '../utils/activity';
import { isMailConfigured } from '../utils/mailer';
import { env } from '../config/env';

/** GET /api/public/settings */
export const getPublicSettingsHandler = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await getSettings();
  return ok(res, settings);
});

/** GET /api/admin/settings */
export const adminGetSettings = asyncHandler(async (_req: Request, res: Response) => {
  const rows = await db.siteSettings.findMany({ orderBy: { key: 'asc' } });
  const grouped = rows.reduce<Record<string, any[]>>((acc, row) => {
    const group = row.group ?? 'general';
    acc[group] = acc[group] ?? [];
    acc[group].push({
      id: row.id,
      key: row.key,
      value: row.value,
      label: row.label ?? row.key,
      type: row.type ?? 'text',
    });
    return acc;
  }, {});
  return ok(res, {
    groups: grouped,
    environment: {
      dataAdapter: env.dataAdapter,
      mailConfigured: isMailConfigured(),
      nodeEnv: env.nodeEnv,
    },
  });
});

/** PUT /api/admin/settings */
export const adminUpdateSettings = asyncHandler(async (req: Request, res: Response) => {
  const values = parseBody(settingsSchema, req.body);
  await saveSettings(values);
  await logActivity({
    req,
    action: 'update',
    entity: 'siteSetting',
    description: `Mise à jour des paramètres (${Object.keys(values).length} champs)`,
  });
  return ok(res, await getSettings());
});
