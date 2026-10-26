#!/usr/bin/env node

import { execSync, spawn } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { killDevPort } from './kill-dev-port.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const HOST = '127.0.0.1';
const PORT = 4321;

function runEnsureDeps() {
  execSync('node scripts/ensure-deps.js', { cwd: rootDir, stdio: 'inherit' });
}

function startDev() {
  const astroBin = join(rootDir, 'node_modules', 'astro', 'astro.js');
  if (!existsSync(astroBin)) {
    console.error('❌ Astro lipsește. Rulează: npm run repair');
    process.exit(1);
  }

  console.log(`\n🚀 Pornesc dev server: http://${HOST}:${PORT}/\n`);

  const child = spawn(
    process.execPath,
    [astroBin, 'dev', '--host', HOST, '--port', String(PORT), '--strictPort'],
    {
      cwd: rootDir,
      stdio: 'inherit',
      env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
    },
  );

  child.on('exit', (code, signal) => {
    if (signal === 'SIGKILL' || signal === 'SIGTERM') {
      console.error(`\n⚠️  Dev server oprit (${signal}). Repornește manual cu: npm run dev\n`);
    }
    process.exit(code ?? (signal ? 1 : 0));
  });
}

runEnsureDeps();

const killed = killDevPort(PORT);
if (killed > 0) {
  console.log(`\n🧹 Eliberat portul ${PORT} (${killed} proces(e) oprite).\n`);
  try {
    execSync('sleep 1');
  } catch {
    // ignore
  }
}

startDev();
