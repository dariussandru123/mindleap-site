#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { discoverAstroRoutes, getSitemapPages, rootDir } from './sitemap-pages.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CANONICAL_ORIGIN = 'https://mindleap.ro';
const errors = [];
const warnings = [];

function checkRobots() {
  const robotsPath = join(rootDir, 'public', 'robots.txt');
  if (!existsSync(robotsPath)) {
    errors.push('robots.txt not found');
    return;
  }

  const content = readFileSync(robotsPath, 'utf-8');
  if (!content.includes('Sitemap: https://mindleap.ro/sitemap.xml')) {
    warnings.push('robots.txt missing canonical sitemap URL');
  }
  if (!content.includes('llms.txt')) {
    warnings.push('robots.txt missing llms.txt reference');
  }
  if (!content.includes('Disallow: /api/')) {
    warnings.push('robots.txt missing Disallow: /api/');
  }
  if (!content.includes('GPTBot')) {
    warnings.push('robots.txt missing GPTBot allowance');
  }
  if (!content.includes('PerplexityBot')) {
    warnings.push('robots.txt missing PerplexityBot allowance');
  }
  console.log('✓ robots.txt found');
}

function checkRedirects() {
  const redirectsPath = join(rootDir, 'public', '_redirects');
  if (existsSync(redirectsPath)) {
    const content = readFileSync(redirectsPath, 'utf-8');
    if (!content.includes('www.mindleap.ro')) {
      warnings.push('_redirects missing www -> apex redirect');
    }
    console.log('✓ _redirects found');
  } else {
    warnings.push('_redirects not found (recommended for Netlify/Cloudflare)');
  }

  const htaccessPath = join(rootDir, 'public', '.htaccess');
  if (existsSync(htaccessPath)) {
    const content = readFileSync(htaccessPath, 'utf-8');
    if (!content.includes('www.mindleap.ro')) {
      warnings.push('.htaccess missing www -> apex redirect');
    }
    console.log('✓ .htaccess found');
  } else {
    warnings.push('.htaccess not found (recommended for Apache/cPanel)');
  }
}

function checkOgImage() {
  const jpgPath = join(rootDir, 'public', 'og-image.jpg');
  if (!existsSync(jpgPath)) {
    errors.push('og-image.jpg missing — run node scripts/generate-og-image.js');
    return;
  }
  console.log('✓ og-image.jpg found');
}

function checkManifest() {
  const manifestPath = join(rootDir, 'public', 'site.webmanifest');
  if (!existsSync(manifestPath)) {
    warnings.push('site.webmanifest not found');
    return;
  }
  const content = readFileSync(manifestPath, 'utf-8');
  if (!content.includes('"lang": "ro"')) {
    warnings.push('site.webmanifest missing lang ro');
  }
  console.log('✓ site.webmanifest found');
}

function checkLlmsAndSlugs() {
  const llmsPath = join(rootDir, 'public', 'llms.txt');
  if (!existsSync(llmsPath)) {
    warnings.push('llms.txt not found');
    return;
  }

  const content = readFileSync(llmsPath, 'utf-8');
  if (!content.startsWith('# Mindleap')) {
    warnings.push('llms.txt missing required H1 heading');
  }
  if (!content.includes('hello@mindleap.ro')) {
    warnings.push('llms.txt missing contact email');
  }
  if (!content.includes('Clienti si incredere')) {
    warnings.push('llms.txt missing clients section');
  }
  if (!content.includes('Clients and trust')) {
    warnings.push('llms.txt missing English clients section');
  }

  const pages = getSitemapPages();
  pages.forEach((page) => {
    const url = page.path === '/' ? `${CANONICAL_ORIGIN}/` : `${CANONICAL_ORIGIN}${page.path}`;
    if (!content.includes(url)) {
      warnings.push(`llms.txt missing sitemap URL: ${url}`);
    }
  });

  const navPaths = ['/', '/servicii', '/despre-noi', '/studii-de-caz', '/contact', '/resurse'];
  const discovered = discoverAstroRoutes(join(rootDir, 'src', 'pages')).sort();
  navPaths.forEach((path) => {
    if (!discovered.includes(path)) {
      errors.push(`Navigation path has no Astro page: ${path}`);
    }
  });

  if (discovered.length !== pages.length) {
    errors.push(`Slug mismatch: ${discovered.length} Astro routes vs ${pages.length} sitemap pages`);
  }

  discovered.forEach((path) => {
    if (!pages.find((page) => page.path === path)) {
      errors.push(`Astro page missing from sitemap: ${path}`);
    }
  });

  console.log(`✓ llms.txt found (${pages.length} sitemap URLs checked)`);
}

function checkAiTxt() {
  const aiPath = join(rootDir, 'public', 'ai.txt');
  if (!existsSync(aiPath)) {
    warnings.push('ai.txt not found');
    return;
  }

  const content = readFileSync(aiPath, 'utf-8');
  if (!content.includes('Business Name:')) {
    warnings.push('ai.txt missing business information');
  }
  if (!content.includes('/resurse/blog/mql-vs-sql')) {
    warnings.push('ai.txt missing blog post mql-vs-sql');
  }
  if (!content.includes('/studii-de-caz/stereographic')) {
    warnings.push('ai.txt missing stereographic case study');
  }
  console.log('✓ ai.txt found');
}

checkRobots();
checkRedirects();
checkOgImage();
checkManifest();
checkLlmsAndSlugs();
checkAiTxt();

if (warnings.length > 0) {
  console.warn('Warnings:');
  warnings.forEach((warning) => console.warn(`  - ${warning}`));
}

if (errors.length > 0) {
  console.error('Errors:');
  errors.forEach((error) => console.error(`  - ${error}`));
  process.exit(1);
}

console.log('✓ SEO verification passed');
