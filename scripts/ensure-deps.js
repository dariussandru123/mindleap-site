#!/usr/bin/env node

import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const nodeModules = join(rootDir, 'node_modules');

const requiredPaths = [
  'astro/dist/cli/index.js',
  'astro/dist/core/errors/dev/index.js',
  'astro/dist/core/dev/index.js',
  'astro/dist/vite-plugin-astro/index.js',
  'astro/astro.js',
  'html-escaper/esm/index.js',
  'semver/package.json',
  'vite/package.json',
  '@tabler/icons-webfont/tabler-icons.min.css',
  'sharp',
  'terser',
];

const missing = requiredPaths.filter((rel) => !existsSync(join(nodeModules, rel)));

if (missing.length > 0) {
  console.error('\n❌ Dependențe incomplete:\n');
  for (const rel of missing) console.error(`   • ${rel}`);
  console.error('\nRulează: npm run repair\n');
  process.exit(1);
}

console.log('✅ Dependențe critice OK');
