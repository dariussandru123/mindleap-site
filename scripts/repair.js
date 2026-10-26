#!/usr/bin/env node

import { execSync } from 'child_process';
import { rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');

console.log('\n🔧 Reinstalare completă...\n');

for (const dir of ['node_modules', '.astro', 'dist']) {
  rmSync(join(rootDir, dir), { recursive: true, force: true });
}

execSync('npm cache clean --force', { cwd: rootDir, stdio: 'inherit' });
execSync('npm install', { cwd: rootDir, stdio: 'inherit' });
execSync('node scripts/ensure-deps.js', { cwd: rootDir, stdio: 'inherit' });

console.log('\n✅ Reinstalare completă.\n');
