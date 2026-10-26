#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const outputPath = join(rootDir, 'public', 'og-image.jpg');
const logoPath = join(rootDir, 'public', 'mindleap-logo-banner.svg');

const WIDTH = 1200;
const HEIGHT = 630;

const backgroundSvg = `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#16332B"/>
      <stop offset="100%" stop-color="#0A0E1A"/>
    </linearGradient>
    <radialGradient id="glow" cx="28%" cy="22%" r="55%">
      <stop offset="0%" stop-color="#40ffaa" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#40ffaa" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect width="100%" height="100%" fill="url(#glow)"/>
  <text x="600" y="500" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="600" fill="rgba(255,255,255,0.75)">
    Agentie de marketing digital · Sibiu, Romania
  </text>
</svg>
`;

async function generate() {
  if (!existsSync(logoPath)) {
    console.warn('⚠ mindleap-logo-banner.svg not found — skipping og-image.jpg');
    return;
  }

  const logoBuffer = await sharp(logoPath).resize(520, null, { fit: 'inside' }).png().toBuffer();
  const logoMeta = await sharp(logoBuffer).metadata();
  const logoWidth = logoMeta.width ?? 520;
  const logoHeight = logoMeta.height ?? 110;
  const left = Math.round((WIDTH - logoWidth) / 2);
  const top = Math.round((HEIGHT - logoHeight) / 2) - 40;

  await sharp(Buffer.from(backgroundSvg))
    .composite([{ input: logoBuffer, top, left }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(outputPath);

  console.log(`✓ og-image.jpg generated (${WIDTH}x${HEIGHT}) -> public/og-image.jpg`);
}

generate().catch((error) => {
  console.error('✗ Failed to generate og-image.jpg:', error.message);
  process.exit(1);
});
