#!/usr/bin/env node

import { existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

let errors = [];
let warnings = [];

// Check required files
const requiredFiles = [
  'package.json',
  'tsconfig.json',
  'astro.config.mjs',
  'tailwind.config.mjs',
  '.htaccess',
];

requiredFiles.forEach(file => {
  const filePath = join(rootDir, file);
  if (!existsSync(filePath)) {
    errors.push(`Required file missing: ${file}`);
  } else {
    console.log(`✓ ${file} found`);
  }
});

if (errors.length > 0) {
  console.error('Errors:');
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
}

console.log('✓ Best practices verification passed');

