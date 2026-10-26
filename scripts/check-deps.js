#!/usr/bin/env node

import { existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const nodeModulesDir = join(rootDir, 'node_modules');

const requiredPackages = ['astro', 'motion', 'ogl', 'sharp', 'terser'];

console.log('Checking required dependencies...\n');

let allInstalled = true;

for (const pkg of requiredPackages) {
  const pkgPath = join(nodeModulesDir, pkg);
  const installed = existsSync(pkgPath);

  if (installed) {
    console.log(`✅ ${pkg} - INSTALLED`);
  } else {
    console.log(`❌ ${pkg} - NOT INSTALLED`);
    allInstalled = false;
  }
}

console.log('');

if (!allInstalled) {
  console.log('⚠️  Some packages are missing. Please run: npm install');
  process.exit(1);
}

console.log('✅ All required packages are installed!');
