#!/usr/bin/env node

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

process.chdir(rootDir);

console.log('Running build verification checks...\n');

const checks = [
  { name: 'Sitemap Validation', script: 'verify-sitemap.js' },
  { name: 'SEO Verification', script: 'verify-seo.js' },
  { name: 'Performance Check', script: 'verify-performance.js' },
  { name: 'Best Practices', script: 'verify-best-practices.js' },
];

let allPassed = true;

for (const check of checks) {
  try {
    console.log(`Running ${check.name}...`);
    execSync(`node scripts/${check.script}`, { stdio: 'inherit' });
    console.log(`✓ ${check.name} passed\n`);
  } catch (error) {
    console.error(`✗ ${check.name} failed\n`);
    allPassed = false;
  }
}

if (!allPassed) {
  console.error('Some checks failed. Please fix the issues above.');
  process.exit(1);
}

console.log('✓ All build checks passed!');

