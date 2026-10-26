#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { hasCriticalFailures, printAuditSection, summarizeFindings } from './lib/audit-report.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');
const srcDir = join(rootDir, 'src');

/** Google CWV thresholds (field data, ms except CLS) */
const THRESHOLDS = {
  lcp: { good: 2500, ni: 4000 },
  inp: { good: 200, ni: 500 },
  cls: { good: 0.1, ni: 0.25 },
};

/** @type {import('./lib/audit-report.js').AuditFinding[]} */
const findings = [];

function add(finding) {
  findings.push(finding);
}

function listFiles(dir, extension, files = []) {
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) listFiles(fullPath, extension, files);
    else if (entry.name.endsWith(extension)) files.push(fullPath);
  }
  return files;
}

function readText(path) {
  return existsSync(path) ? readFileSync(path, 'utf-8') : '';
}

function bytesToKb(bytes) {
  return Math.round(bytes / 1024);
}

function estimateRating(metric, value) {
  const t = THRESHOLDS[metric];
  if (value <= t.good) return 'good';
  if (value <= t.ni) return 'needs_improvement';
  return 'poor';
}

function statusFromRating(rating) {
  if (rating === 'good') return 'pass';
  return 'warn';
}

if (!existsSync(distDir)) {
  console.error('✗ dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

const htmlFiles = listFiles(distDir, '.html');
const jsFiles = listFiles(join(distDir, '_astro'), '.js');
const totalJsBytes = jsFiles.reduce((sum, file) => sum + statSync(file).size, 0);

const homepagePath = join(distDir, 'index.html');
const homepageHtml = readText(homepagePath);
const homepageScripts = [...homepageHtml.matchAll(/<script[^>]+src="([^"]+_astro\/[^"]+)"/g)].map((m) => m[1]);
const homepageJsBytes = homepageScripts.reduce((sum, src) => {
  const filePath = join(distDir, src.replace(/^\//, ''));
  return existsSync(filePath) ? sum + statSync(filePath).size : sum;
}, 0);

// --- LCP (simulated from lab heuristics) ---
let lcpPenalty = 0;
const globalCss = readText(join(srcDir, 'styles', 'global.css'));
if (globalCss.includes("@import url('https://fonts.googleapis.com")) {
  lcpPenalty += 900;
  add({
    id: 'lcp-font-import',
    category: 'LCP',
    title: 'Google Fonts loaded via CSS @import',
    status: 'warn',
    detail: 'Render-blocking font CSS increases Largest Contentful Paint risk.',
    recommendation: 'Self-host Inter or use <link rel="preload"> + non-blocking font loading.',
    reference: 'https://web.dev/articles/optimize-lcp',
  });
}

if (homepageHtml.includes('LightRays') || homepageScripts.some((s) => s.includes('LightRays'))) {
  lcpPenalty += 700;
  add({
    id: 'lcp-hero-js',
    category: 'LCP',
    title: 'Hero uses heavy client-side WebGL (LightRays)',
    status: 'warn',
    detail: 'Large interactive hero delays text paint and main-thread availability.',
    recommendation: 'Defer hero effect below fold or use CSS-only fallback on first paint.',
    reference: 'https://web.dev/articles/lcp',
  });
}

if (!homepageHtml.includes('fetchpriority="high"')) {
  lcpPenalty += 250;
}

const estimatedLcp = 1200 + lcpPenalty;
const lcpRating = estimateRating('lcp', estimatedLcp);
add({
  id: 'lcp-estimate',
  category: 'LCP',
  title: 'Largest Contentful Paint (estimated)',
  status: statusFromRating(lcpRating),
  rating: lcpRating,
  detail: `Heuristic lab estimate ~${estimatedLcp}ms (threshold good ≤${THRESHOLDS.lcp.good}ms).`,
  recommendation: lcpRating === 'good'
    ? 'Keep monitoring in PageSpeed Insights field data after deploy.'
    : 'Reduce render-blocking resources and defer non-critical JS/CSS above the fold.',
  reference: 'https://web.dev/articles/vitals#lcp',
});

// --- INP (simulated from JS weight + hydration) ---
const clientLoadCount = (readText(join(srcDir, 'layouts', 'BaseLayout.astro')).match(/client:load/g) || []).length;
let inpPenalty = Math.round(homepageJsBytes / 1024) * 2;
inpPenalty += clientLoadCount * 35;

const debugTelemetry = listFiles(srcDir, '.tsx').some((file) => readText(file).includes('127.0.0.1:7243/ingest'));
if (debugTelemetry) {
  add({
    id: 'inp-debug-fetch',
    category: 'INP',
    title: 'Debug telemetry fetch in production components',
    status: 'fail',
    detail: 'Found localhost ingest calls in source. Adds main-thread/network noise.',
    recommendation: 'Remove debug fetch calls before production builds.',
    reference: 'https://web.dev/articles/optimize-inp',
  });
}

const estimatedInp = 80 + inpPenalty;
const inpRating = estimateRating('inp', estimatedInp);
add({
  id: 'inp-estimate',
  category: 'INP',
  title: 'Interaction to Next Paint (estimated)',
  status: statusFromRating(inpRating),
  rating: inpRating,
  detail: `Heuristic estimate ~${estimatedInp}ms from ${bytesToKb(homepageJsBytes)}KB homepage JS and ${clientLoadCount} client:load islands (good ≤${THRESHOLDS.inp.good}ms).`,
  recommendation: inpRating === 'good'
    ? 'Hydration budget looks acceptable; validate with real-user monitoring.'
    : 'Reduce client:load usage sitewide and split heavy bundles (Three.js, GSAP).',
  reference: 'https://web.dev/articles/vitals#inp',
});

// --- CLS (simulated) ---
let clsPenalty = 0;
let imagesMissingDimensions = 0;
let imagesMissingAlt = 0;

for (const htmlFile of htmlFiles) {
  const html = readText(htmlFile);
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)];
  for (const [tag] of imgs) {
    if (!/\bwidth=/.test(tag) || !/\bheight=/.test(tag)) imagesMissingDimensions += 1;
    if (!/\balt=/.test(tag)) imagesMissingAlt += 1;
  }
}

if (imagesMissingDimensions > 0) clsPenalty += Math.min(0.12, imagesMissingDimensions * 0.01);
if (imagesMissingAlt > 0) {
  add({
    id: 'a11y-img-alt',
    category: 'CLS/A11y',
    title: 'Images without alt text in built HTML',
    status: 'warn',
    detail: `${imagesMissingAlt} <img> tags missing alt attribute across ${htmlFiles.length} pages.`,
    recommendation: 'Add descriptive alt text for SEO and accessibility.',
  });
}

const estimatedCls = Number((0.02 + clsPenalty).toFixed(3));
const clsRating = estimateRating('cls', estimatedCls);
add({
  id: 'cls-estimate',
  category: 'CLS',
  title: 'Cumulative Layout Shift (estimated)',
  status: statusFromRating(clsRating),
  rating: clsRating,
  detail: `Heuristic estimate ~${estimatedCls} (good ≤${THRESHOLDS.cls.good}). ${imagesMissingDimensions} images without explicit width/height.`,
  recommendation: clsRating === 'good'
    ? 'Reserve space for dynamic content to keep CLS stable.'
    : 'Set width/height on images and avoid injecting UI above existing content.',
  reference: 'https://web.dev/articles/vitals#cls',
});

// --- Supporting performance signals ---
if (totalJsBytes > 450 * 1024) {
  add({
    id: 'js-total-budget',
    category: 'Performance',
    title: 'Total JS bundle budget',
    status: 'warn',
    detail: `All _astro chunks sum to ${bytesToKb(totalJsBytes)}KB uncompressed.`,
    recommendation: 'Target < 300KB critical path JS for marketing landing pages.',
  });
} else {
  add({
    id: 'js-total-budget',
    category: 'Performance',
    title: 'Total JS bundle budget',
    status: 'pass',
    detail: `All _astro chunks sum to ${bytesToKb(totalJsBytes)}KB uncompressed.`,
  });
}

const largestChunks = jsFiles
  .map((file) => ({ file, size: statSync(file).size }))
  .sort((a, b) => b.size - a.size)
  .slice(0, 3);

add({
  id: 'js-largest-chunks',
  category: 'Performance',
  title: 'Largest JavaScript chunks',
  status: largestChunks[0]?.size > 120 * 1024 ? 'warn' : 'pass',
  detail: largestChunks.map((c) => `${bytesToKb(c.size)}KB ${c.file.split('/').pop()}`).join(', '),
  recommendation: 'Lazy-load Stepper/Three.js only on pages that need them.',
});

if (homepageHtml.includes('googletagmanager.com')) {
  add({
    id: 'third-party-gtm',
    category: 'Performance',
    title: 'Third-party tag manager detected',
    status: 'warn',
    detail: 'GTM can impact INP/LCP depending on tags fired.',
    recommendation: 'Load GTM after consent and keep tag count minimal.',
  });
}

// --- Output ---
console.log('Core Web Vitals audit (simulated lab heuristics)');
printAuditSection('Metrics', findings.filter((f) => f.rating));
printAuditSection('Signals', findings.filter((f) => !f.rating));

const summary = summarizeFindings(findings);
console.log(`\nSummary: ${summary.pass} pass, ${summary.warn} warn, ${summary.fail} fail`);

if (hasCriticalFailures(findings)) {
  console.error('\n✗ Core Web Vitals audit found critical issues.');
  process.exit(1);
}

console.log('\n✓ Core Web Vitals audit completed (no critical failures).');
