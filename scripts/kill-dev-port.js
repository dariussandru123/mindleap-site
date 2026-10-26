#!/usr/bin/env node

import { execSync } from 'child_process';

const PORT = 4321;

function getPidsOnPort(port) {
  try {
    return execSync(`lsof -ti:${port}`, { encoding: 'utf-8' })
      .trim()
      .split('\n')
      .filter(Boolean);
  } catch {
    return [];
  }
}

export function killDevPort(port = PORT) {
  const pids = getPidsOnPort(port);
  if (pids.length === 0) return 0;

  for (const pid of pids) {
    try {
      process.kill(Number(pid), 'SIGKILL');
    } catch {
      // already gone
    }
  }

  return pids.length;
}
