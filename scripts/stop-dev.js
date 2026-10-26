#!/usr/bin/env node

import { execSync } from 'child_process';
import { killDevPort } from './kill-dev-port.js';

const PORT = 4321;

killDevPort(PORT);

try {
  execSync('sleep 0.5');
} catch {
  // ignore
}

const remaining = (() => {
  try {
    return execSync(`lsof -ti:${PORT}`, { encoding: 'utf-8' }).trim();
  } catch {
    return '';
  }
})();

if (remaining) {
  console.error(`\n⚠️  Portul ${PORT} încă ocupat. Rulează manual:\n   lsof -ti:${PORT} | xargs kill -9\n`);
  process.exit(1);
}

console.log(`\n✅ Portul ${PORT} eliberat.\n`);
