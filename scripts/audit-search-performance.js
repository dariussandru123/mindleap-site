#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { hasCriticalFailures, printAuditSection, summarizeFindings } from './lib/audit-report.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');
const publicDir = join(rootDir, 'public');

const CANONICAL_ORIGIN = 'https://mindleap.ro';

/** @type {import('./lib/audit-report.js').AuditFinding[]} */
const findings = [];

function add(finding) {
  findings.push(finding);
}

function readText(path) {
  return existsSync(path) ? readFileSync(path, 'utf-8') : '';
}

function listHtmlFiles(dir, files = []) {
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) listHtmlFiles(fullPath, files);
    else if (entry.name.endsWith('.html')) files.push(fullPath);
  }
  return files;
}

if (!existsSync(distDir)) {
  console.error('✗ dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

const htmlFiles = listHtmlFiles(distDir);
const indexableHtml = htmlFiles.filter((f) => !f.endsWith('/404.html'));
const robots = readText(join(publicDir, 'robots.txt'));
const sitemap = readText(join(publicDir, 'sitemap.xml'));
const redirects = readText(join(publicDir, '_redirects'));
const htaccess = readText(join(publicDir, '.htaccess'));
const llms = readText(join(publicDir, 'llms.txt'));

// --- Google Search Console: Indexing ---
if (!robots.includes('Sitemap:')) {
  add({ id: 'idx-robots-sitemap', category: 'Indexing', title: 'robots.txt sitemap reference', status: 'fail', detail: 'Missing Sitemap directive.' });
} else if (!robots.includes(`${CANONICAL_ORIGIN}/sitemap.xml`)) {
  add({ id: 'idx-robots-sitemap', category: 'Indexing', title: 'robots.txt sitemap reference', status: 'warn', detail: 'Sitemap URL may not match canonical origin.' });
} else {
  add({ id: 'idx-robots-sitemap', category: 'Indexing', title: 'robots.txt sitemap reference', status: 'pass', detail: `Points to ${CANONICAL_ORIGIN}/sitemap.xml.` });
}

if (!sitemap.includes('<?xml-stylesheet')) {
  add({ id: 'idx-sitemap-style', category: 'Indexing', title: 'Sitemap human stylesheet', status: 'warn', detail: 'sitemap.xml missing xml-stylesheet processing instruction.' });
} else {
  add({ id: 'idx-sitemap-style', category: 'Indexing', title: 'Sitemap human stylesheet', status: 'pass', detail: 'sitemap.xml linked to /sitemap.xsl for browser view.' });
}

if (sitemap.includes('www.')) {
  const sitemapLocs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  if (sitemapLocs.some((loc) => loc.includes('www.'))) {
    add({ id: 'idx-sitemap-www', category: 'Indexing', title: 'Sitemap canonical host', status: 'fail', detail: 'Sitemap contains www URLs.' });
  } else {
    add({ id: 'idx-sitemap-www', category: 'Indexing', title: 'Sitemap canonical host', status: 'pass', detail: 'All sitemap <loc> URLs use non-www canonical host.' });
  }
} else {
  add({ id: 'idx-sitemap-www', category: 'Indexing', title: 'Sitemap canonical host', status: 'pass', detail: 'All sitemap URLs use non-www canonical host.' });
}

const noindexPages = indexableHtml.filter((file) => readText(file).includes('noindex'));
if (noindexPages.length > 0) {
  add({
    id: 'idx-noindex',
    category: 'Indexing',
    title: 'noindex on indexable routes',
    status: noindexPages.some((f) => f.endsWith('404.html')) ? 'pass' : 'warn',
    detail: `${noindexPages.length} built pages contain noindex.`,
  });
} else {
  add({ id: 'idx-noindex', category: 'Indexing', title: 'Indexable pages without accidental noindex', status: 'pass', detail: 'No unexpected noindex on content pages.' });
}

// --- Experience (Page experience / CWV in GSC) ---
const hasWwwRedirect = redirects.includes('www.mindleap.ro') || htaccess.includes('www.mindleap.ro');
add({
  id: 'exp-https-www',
  category: 'Experience',
  title: 'HTTPS + www consolidation',
  status: hasWwwRedirect ? 'pass' : 'fail',
  detail: hasWwwRedirect ? 'www → apex redirects configured.' : 'Missing www redirect rules.',
  recommendation: 'Ensure hosting applies _redirects or .htaccess on production.',
  reference: 'https://developers.google.com/search/docs/crawling-indexing/301-redirects',
});

let canonicalIssues = 0;
let viewportIssues = 0;
for (const file of indexableHtml) {
  const html = readText(file);
  if (!html.includes('rel="canonical"')) canonicalIssues += 1;
  if (!html.includes('name="viewport"')) viewportIssues += 1;
  if (html.includes('rel="canonical"') && !html.includes(CANONICAL_ORIGIN)) canonicalIssues += 1;
}

add({
  id: 'exp-canonical',
  category: 'Experience',
  title: 'Canonical tags on indexable pages',
  status: canonicalIssues === 0 ? 'pass' : 'fail',
  detail: canonicalIssues === 0 ? 'All indexable pages expose canonical URLs.' : `${canonicalIssues} pages with missing/non-canonical canonical.`,
});

add({
  id: 'exp-mobile-viewport',
  category: 'Experience',
  title: 'Mobile viewport meta',
  status: viewportIssues === 0 ? 'pass' : 'fail',
  detail: viewportIssues === 0 ? 'Viewport meta present on indexable pages.' : `${viewportIssues} pages missing viewport.`,
  reference: 'https://developers.google.com/search/docs/crawling-indexing/mobile',
});

// --- Enhancements (Structured data) ---
let schemaPages = 0;
for (const file of indexableHtml) {
  if (readText(file).includes('application/ld+json')) schemaPages += 1;
}

add({
  id: 'enh-structured-data',
  category: 'Enhancements',
  title: 'Structured data coverage',
  status: schemaPages >= Math.ceil(indexableHtml.length * 0.6) ? 'pass' : 'warn',
  detail: `${schemaPages}/${indexableHtml.length} indexable pages include JSON-LD.`,
  recommendation: 'Add WebPage/Service schema on key money pages for richer results.',
  reference: 'https://developers.google.com/search/docs/appearance/structured-data',
});

// --- Search appearance / content signals ---
const pagesMissingDescription = indexableHtml.filter((file) => !readText(file).includes('name="description"'));
add({
  id: 'search-meta-description',
  category: 'Search appearance',
  title: 'Meta descriptions',
  status: pagesMissingDescription.length === 0 ? 'pass' : 'warn',
  detail: pagesMissingDescription.length === 0
    ? 'Meta description present on all indexable pages.'
    : `${pagesMissingDescription.length} pages missing meta description.`,
});

const pagesMissingOg = indexableHtml.filter((file) => !readText(file).includes('property="og:title"'));
add({
  id: 'search-open-graph',
  category: 'Search appearance',
  title: 'Open Graph tags',
  status: pagesMissingOg.length === 0 ? 'pass' : 'warn',
  detail: pagesMissingOg.length === 0 ? 'OG tags present for social/search previews.' : `${pagesMissingOg.length} pages missing OG tags.`,
});

// --- Crawling budget / AI discoverability ---
add({
  id: 'crawl-llms',
  category: 'Crawling',
  title: 'LLM context file',
  status: llms.startsWith('# Mindleap') ? 'pass' : 'warn',
  detail: llms ? 'llms.txt available for AI crawlers.' : 'llms.txt missing.',
});

add({
  id: 'crawl-internal-links',
  category: 'Crawling',
  title: 'Homepage internal linking',
  status: readText(join(distDir, 'index.html')).includes('href="/servicii"') ? 'pass' : 'warn',
  detail: 'Homepage links to core commercial pages for crawl path discovery.',
});

// --- Simulated Search Console "Insights" summary ---
const categories = [...new Set(findings.map((f) => f.category))];
console.log('Search Performance Insights (simulated from build artifacts)');
console.log('Mode: static post-build audit aligned with Google Search Console sections\n');

for (const category of categories) {
  printAuditSection(category, findings.filter((f) => f.category === category));
}

const summary = summarizeFindings(findings);
console.log(`\nInsights summary: ${summary.pass} healthy, ${summary.warn} to review, ${summary.fail} critical`);
console.log('Note: Field CWV and impressions require Google Search Console + CrUX after deploy.');

if (hasCriticalFailures(findings)) {
  console.error('\n✗ Search performance audit found critical issues.');
  process.exit(1);
}

console.log('\n✓ Search performance audit completed (no critical failures).');
