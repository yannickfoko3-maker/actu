#!/usr/bin/env node
/**
 * Création de l'archive de livraison.
 *
 *   npm run zip
 *
 * Produit ACES_GLOBAL_SERVICES_CONGO.zip à la racine du projet, contenant un
 * dossier unique ACES_GLOBAL_SERVICES_CONGO/ avec le code source complet.
 *
 * Exclus de l'archive : node_modules, dist, .git, fichiers .env réels,
 * données locales (.data), uploads utilisateurs, archives et fichiers temporaires.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const folderName = 'ACES_GLOBAL_SERVICES_CONGO';
const zipPath = path.join(root, `${folderName}.zip`);
const staging = path.join(root, '.zip-staging', folderName);

const EXCLUDED_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  '.git',
  '.data',
  '.zip-staging',
  'coverage',
  '.vite',
  'uploads',
  '.turbo',
]);

const EXCLUDED_FILES = new Set([
  '.env',
  '.env.local',
  '.env.production',
  '.DS_Store',
  'Thumbs.db',
  'npm-debug.log',
  'aces-global-services-database.json',
]);

const EXCLUDED_EXTENSIONS = ['.log', '.zip', '.tsbuildinfo', '.tmp', '.swp'];

function copyTree(source, target) {
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (entry.name.startsWith('.git')) continue;
    const from = path.join(source, entry.name);
    const to = path.join(target, entry.name);

    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) continue;
      // Conserve les dossiers vides utiles (uploads) via un fichier .gitkeep.
      fs.mkdirSync(to, { recursive: true });
      copyTree(from, to);
      continue;
    }

    if (EXCLUDED_FILES.has(entry.name)) continue;
    if (EXCLUDED_EXTENSIONS.some((extension) => entry.name.endsWith(extension))) continue;

    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
  }
}

const REQUIRED = [
  'README.md',
  'package.json',
  '.env.example',
  'documentation/INSTALLATION.md',
  'documentation/ADMINISTRATION.md',
  'documentation/API.md',
  'database/installation.sql',
  'backend/prisma/schema.prisma',
  'backend/prisma/seed.ts',
  'backend/src/server.ts',
  'frontend/src/main.tsx',
  'frontend/src/admin/AdminApp.tsx',
  'frontend/public/assets/brand/aces-logo.jpg',
];

console.log('[zip] préparation de l’archive…');

if (fs.existsSync(zipPath)) fs.rmSync(zipPath);
fs.rmSync(path.join(root, '.zip-staging'), { recursive: true, force: true });
fs.mkdirSync(staging, { recursive: true });

copyTree(root, staging);

// Vérifications avant compression
const missing = REQUIRED.filter((relative) => !fs.existsSync(path.join(staging, relative)));
if (missing.length) {
  console.error('[zip] fichiers obligatoires manquants :');
  missing.forEach((file) => console.error(`       - ${file}`));
  process.exit(1);
}

const leakedEnv = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name === '.env') leakedEnv.push(path.relative(staging, full));
  }
};
walk(staging);
if (leakedEnv.length) {
  console.error('[zip] refus : des fichiers .env réels seraient inclus :', leakedEnv.join(', '));
  process.exit(1);
}

execFileSync('zip', ['-r', '-q', zipPath, folderName], { cwd: path.join(root, '.zip-staging') });
fs.rmSync(path.join(root, '.zip-staging'), { recursive: true, force: true });

const stats = fs.statSync(zipPath);
const list = execFileSync('unzip', ['-Z1', zipPath], { encoding: 'utf8' }).split('\n').filter(Boolean);
const fileCount = list.filter((entry) => !entry.endsWith('/')).length;

console.log(`[zip] ✔ ${path.basename(zipPath)} — ${fileCount} fichiers, ${(stats.size / 1024 / 1024).toFixed(2)} Mo`);
console.log('[zip] contenu : code source frontend/backend, base de données, documentation, scripts.');
console.log('[zip] exclus  : node_modules, dist, .git, .env, données locales, uploads.');
