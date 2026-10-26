#!/usr/bin/env node

import { execSync, spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { killDevPort } from './kill-dev-port.js';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const HOST = '127.0.0.1';
const PORT = 4321;
const URL = `http://${HOST}:${PORT}`;

const routes = ['/', '/contact', '/servicii', '/favicon.ico'];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function probe(timeoutSec = 5) {
  const results = [];
  for (const route of routes) {
    try {
      const code = execSync(
        `curl -s -o /dev/null -w "%{http_code}" --max-time ${timeoutSec} ${URL}${route}`,
        { encoding: 'utf-8' },
      ).trim();
      results.push({ route, code, ok: code === '200' || code === '304' });
    } catch (error) {
      const code = String(error.stdout ?? '000').trim();
      results.push({ route, code: code || '000', ok: false });
    }
  }
  return results;
}

async function waitForReady(child, maxMs = 120000) {
  const start = Date.now();
  let sawReady = false;

  return new Promise((resolve, reject) => {
    const onData = (chunk) => {
      const text = chunk.toString();
      if (text.includes('ready in')) sawReady = true;
    };
    child.stdout.on('data', onData);
    child.stderr.on('data', onData);

    const interval = setInterval(() => {
      if (child.exitCode !== null) {
        clearInterval(interval);
        reject(new Error(`Server oprit prematur (exit ${child.exitCode})`));
        return;
      }
      if (!sawReady) return;
      if (Date.now() - start < 3000) return;

      try {
        const code = execSync(`curl -s -o /dev/null -w "%{http_code}" --max-time 5 ${URL}/`, {
          encoding: 'utf-8',
        }).trim();
        if (code === '200' || code === '304') {
          clearInterval(interval);
          resolve(true);
        }
      } catch {
        // not ready yet
      }

      if (Date.now() - start > maxMs) {
        clearInterval(interval);
        reject(new Error('Timeout: serverul nu răspunde după 120s'));
      }
    }, 2000);
  });
}

async function main() {
  console.log('\n🔍 Validare mediu dev...\n');
  execSync('node scripts/ensure-deps.js', { cwd: rootDir, stdio: 'inherit' });

  killDevPort(PORT);
  await sleep(1500);

  const astroBin = join(rootDir, 'node_modules/astro/astro.js');
  const child = spawn(
    process.execPath,
    [astroBin, 'dev', '--host', HOST, '--port', String(PORT), '--strictPort'],
    {
      cwd: rootDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
    },
  );

  let logs = '';
  child.stdout.on('data', (d) => {
    logs += d.toString();
    process.stdout.write(d);
  });
  child.stderr.on('data', (d) => {
    logs += d.toString();
    process.stderr.write(d);
  });

  try {
    await waitForReady(child);
    console.log('\n--- Teste HTTP ---\n');
    const results = probe(15);
    let failed = false;
    for (const r of results) {
      const status = r.ok ? '✅' : '❌';
      console.log(`${status} ${r.route} → HTTP ${r.code}`);
      if (!r.ok) failed = true;
    }

    child.kill('SIGTERM');
    await sleep(1000);
    if (child.exitCode === null) child.kill('SIGKILL');

    if (failed) {
      console.error('\n❌ Validare eșuată.\n');
      process.exit(1);
    }

    console.log('\n✅ Validare reușită. Rulează: npm run dev\n');
  } catch (error) {
    child.kill('SIGKILL');
    console.error('\n❌', error.message);
    if (logs.includes('circular dependency')) {
      console.error('   Cauză probabilă: restart Vite / dependențe circulare în SSR.');
    }
    process.exit(1);
  }
}

main();
