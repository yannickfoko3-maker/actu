import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd());
const from = path.join(root, 'src', 'data', 'media-manifest.json');
const to = path.join(root, 'dist', 'data', 'media-manifest.json');
fs.mkdirSync(path.dirname(to), { recursive: true });
fs.copyFileSync(from, to);
console.log('[build] media-manifest.json copié dans dist/data');
