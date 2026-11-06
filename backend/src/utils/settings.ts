import { db } from '../db';

export type SettingsMap = Record<string, string>;

/** Charge tous les paramètres sous forme de dictionnaire clé → valeur. */
export async function getSettings(): Promise<SettingsMap> {
  const rows = await db.siteSettings.findMany({ orderBy: { key: 'asc' } });
  return rows.reduce<SettingsMap>((acc, row) => {
    acc[row.key] = row.value ?? '';
    return acc;
  }, {});
}

export async function getSetting(key: string, fallback = ''): Promise<string> {
  const row = await db.siteSettings.findOneBy('key', key);
  return row?.value ?? fallback;
}

/** Écrit (ou met à jour) plusieurs paramètres d'un coup. */
export async function saveSettings(values: Record<string, unknown>): Promise<void> {
  for (const [key, rawValue] of Object.entries(values)) {
    if (rawValue === undefined) continue;
    const value = typeof rawValue === 'string' ? rawValue : JSON.stringify(rawValue);
    const existing = await db.siteSettings.findOneBy('key', key);
    if (existing) {
      if (existing.value !== value) await db.siteSettings.update(existing.id, { value });
    } else {
      await db.siteSettings.create({ key, value, group: 'general', label: key, type: 'text' });
    }
  }
}

/** Valeurs publiques transmises au frontend (aucune donnée sensible). */
export async function getPublicSettings(): Promise<SettingsMap> {
  const settings = await getSettings();
  return settings;
}
