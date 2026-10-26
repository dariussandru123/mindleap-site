#!/usr/bin/env node

import { readdirSync, existsSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

let errors = [];
let warnings = [];

function checkDirectory(dir, basePath = '') {
  if (!existsSync(dir)) return;

  const entries = readdirSync(dir, { withFileTypes: true });

  entries.forEach((entry) => {
    const fullPath = join(dir, entry.name);
    const relativePath = join(basePath, entry.name);

    if (entry.isDirectory()) {
      checkDirectory(fullPath, relativePath);
      return;
    }

    const ext = extname(entry.name).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext)) {
      const stats = statSync(fullPath);
      const sizeMB = stats.size / (1024 * 1024);
      if (sizeMB > 1) {
        warnings.push(`Large image: ${relativePath} (${sizeMB.toFixed(2)}MB)`);
      }
    }
  });
}

checkDirectory(join(rootDir, 'public'), 'public');
checkDirectory(join(rootDir, 'dist'), 'dist');
console.log('✓ Image/asset size scan completed');

const distAstro = join(rootDir, 'dist', '_astro');
if (existsSync(distAstro)) {
  const jsFiles = readdirSync(distAstro).filter((f) => f.endsWith('.js'));
  const totalKb = jsFiles.reduce((sum, file) => sum + statSync(join(distAstro, file)).size, 0) / 1024;
  console.log(`✓ Built JS budget: ${Math.round(totalKb)}KB across ${jsFiles.length} chunks`);
  if (totalKb > 600) {
    warnings.push(`Total JS chunks exceed 600KB (${Math.round(totalKb)}KB)`);
  }
}

if (warnings.length > 0) {
  console.warn('Warnings:');
  warnings.forEach((w) => console.warn(`  - ${w}`));
}

if (errors.length > 0) {
  console.error('Errors:');
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}
