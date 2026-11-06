#!/usr/bin/env node
/**
 * Contrôle de cohérence entre le schéma Prisma et database/installation.sql.
 *
 *   npm run db:sql
 *
 * Vérifie que chaque modèle Prisma possède une table correspondante dans le
 * script SQL d'installation manuelle (noms de tables générés par Prisma).
 * Sort en erreur si une table manque ou si une table SQL est orpheline.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const schemaPath = path.join(root, 'backend', 'prisma', 'schema.prisma');
const sqlPath = path.join(root, 'database', 'installation.sql');

const schema = fs.readFileSync(schemaPath, 'utf8');
const sql = fs.readFileSync(sqlPath, 'utf8');

const models = [...schema.matchAll(/^model\s+(\w+)\s*\{/gm)].map((match) => match[1]);
const tables = [...sql.matchAll(/CREATE TABLE IF NOT EXISTS `(\w+)`/g)].map((match) => match[1]);

const missing = models.filter((model) => !tables.includes(model));
const extra = tables.filter((table) => !models.includes(table));

console.log(`[db:sql] modèles Prisma : ${models.length} · tables SQL : ${tables.length}`);

if (missing.length || extra.length) {
  if (missing.length) console.error('[db:sql] tables manquantes dans installation.sql :', missing.join(', '));
  if (extra.length) console.error('[db:sql] tables SQL sans modèle Prisma :', extra.join(', '));
  process.exit(1);
}

// Vérifie la présence des colonnes clés de quelques modèles critiques.
const critical = {
  Service: ['slug', 'title', 'description', 'benefits', 'isPublished', 'coverImage'],
  QuoteRequest: ['name', 'email', 'serviceTitle', 'projectDescription', 'status'],
  SiteSetting: ['key', 'value', 'group', 'type'],
  AdminUser: ['email', 'passwordHash', 'roleId', 'isActive'],
};

const problems = [];
for (const [table, columns] of Object.entries(critical)) {
  const block = sql.split(`CREATE TABLE IF NOT EXISTS \`${table}\``)[1]?.split('ENGINE=')[0] ?? '';
  for (const column of columns) {
    if (!new RegExp(`\`${column}\``).test(block)) problems.push(`${table}.${column}`);
  }
}

if (problems.length) {
  console.error('[db:sql] colonnes manquantes :', problems.join(', '));
  process.exit(1);
}

console.log('[db:sql] ✔ schéma Prisma et script SQL cohérents.');
