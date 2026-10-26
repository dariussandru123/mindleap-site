#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');

console.log('Performance verification\n');

if (!existsSync(distDir)) {
  console.error('✗ dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

const steps = [
  { name: 'Asset budget checks', script: 'verify-assets.js' },
  { name: 'Core Web Vitals (simulated)', script: 'audit-core-web-vitals.js' },
  { name: 'Search Performance Insights (simulated)', script: 'audit-search-performance.js' },
];

for (const step of steps) {
  console.log(`\n=== ${step.name} ===`);
  execSync(`node scripts/${step.script}`, { stdio: 'inherit', cwd: rootDir });
}

console.log('\n✓ Performance verification passed');
