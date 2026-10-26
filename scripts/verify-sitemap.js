#!/usr/bin/env node

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { discoverAstroRoutes, getSitemapPages, rootDir } from './sitemap-pages.js';

const CANONICAL_ORIGIN = 'https://mindleap.ro';
const vercelSitemapPath = join(rootDir, '.vercel', 'output', 'static', 'sitemap.xml');
const distSitemapPath = join(rootDir, 'dist', 'sitemap.xml');
const publicSitemapPath = join(rootDir, 'public', 'sitemap.xml');
const sitemapPath = existsSync(vercelSitemapPath) ? vercelSitemapPath : existsSync(distSitemapPath) ? distSitemapPath : publicSitemapPath;

// Load env for Supabase fetch (same approach as generate-sitemap.js)
const envPath = join(rootDir, '.env');
const envContent = readFileSync(envPath, 'utf-8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
}
const SUPABASE_URL = envVars.PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = envVars.PUBLIC_SUPABASE_ANON_KEY;

async function fetchDbBlogSlugs() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/blog_posts?published=eq.true&select=slug`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    if (!res.ok) return [];
    const posts = await res.json();
    return posts.map((p) => `/resurse/blog/${p.slug}`);
  } catch {
    return [];
  }
}

async function main() {

const staticPages = getSitemapPages();
const staticPaths = staticPages.map((page) => page.path);
const discoveredPaths = discoverAstroRoutes(join(rootDir, 'src', 'pages')).sort();

// Merge DB blog posts into expected paths (same dedup logic as generate-sitemap.js)
const dbBlogPaths = await fetchDbBlogSlugs();
const staticPathSet = new Set(staticPaths);
const dbOnlyPaths = dbBlogPaths.filter((p) => !staticPathSet.has(p));
const expectedPaths = [...staticPaths, ...dbOnlyPaths];
const expectedPages = [...staticPages];

/** @type {string[]} */
const errors = [];
/** @type {string[]} */
const warnings = [];

try {
  const sitemapContent = readFileSync(sitemapPath, 'utf-8');

  if (!sitemapContent.includes('<?xml')) {
    errors.push('Sitemap missing XML declaration');
  }

  if (!sitemapContent.includes('<urlset')) {
    errors.push('Sitemap missing urlset element');
  }

  if (!sitemapContent.includes('<?xml-stylesheet')) {
    warnings.push('Sitemap missing xml-stylesheet (human-readable view)');
  }

  if (!sitemapContent.includes('Mindleap XML Sitemap')) {
    warnings.push('Sitemap missing generator header comment');
  }

  const urlMatches = sitemapContent.matchAll(/<url>[\s\S]*?<\/url>/g);
  const urls = Array.from(urlMatches);

  if (urls.length === 0) {
    errors.push('Sitemap contains no URLs');
  }

  const locMatches = [...sitemapContent.matchAll(/<loc>(.*?)<\/loc>/g)];
  const locations = locMatches.map((match) => match[1]);
  const uniqueLocations = new Set(locations);

  if (locations.length !== uniqueLocations.size) {
    errors.push('Sitemap contains duplicate URLs');
  }

  locations.forEach((loc, index) => {
    if (loc.includes('www.')) {
      errors.push(`URL ${index + 1} uses www: ${loc}`);
    }
    if (!loc.startsWith(CANONICAL_ORIGIN)) {
      errors.push(`URL ${index + 1} not on canonical origin: ${loc}`);
    }
    if (loc.includes('/404')) {
      errors.push(`404 page must not be in sitemap: ${loc}`);
    }
    if (loc.endsWith('/') && loc !== `${CANONICAL_ORIGIN}/`) {
      warnings.push(`URL ${index + 1} has trailing slash: ${loc}`);
    }
  });

  urls.forEach((urlMatch, index) => {
    const urlContent = urlMatch[0];
    if (!urlContent.includes('<loc>')) {
      errors.push(`URL block ${index + 1} missing <loc>`);
    }
    if (!urlContent.includes('<lastmod>')) {
      warnings.push(`URL block ${index + 1} missing <lastmod>`);
    }
    if (!urlContent.includes('<priority>')) {
      warnings.push(`URL block ${index + 1} missing <priority>`);
    }
    if (!urlContent.includes('<changefreq>')) {
      warnings.push(`URL block ${index + 1} missing <changefreq>`);
    }
  });

  const pathsInSitemap = locations
    .map((loc) => {
      try {
        return new URL(loc).pathname;
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  expectedPaths.forEach((path) => {
    const expected = path === '/' ? `${CANONICAL_ORIGIN}/` : `${CANONICAL_ORIGIN}${path}`;
    if (!locations.includes(expected)) {
      errors.push(`Missing expected URL in sitemap: ${expected}`);
    }
  });

  pathsInSitemap.forEach((path) => {
    if (!expectedPaths.includes(path)) {
      errors.push(`Unexpected URL in sitemap (no matching page): ${path}`);
    }
  });

  if (pathsInSitemap.length !== expectedPaths.length) {
    errors.push(`Sitemap URL count mismatch: expected ${expectedPaths.length}, found ${pathsInSitemap.length}`);
  }

  discoveredPaths.forEach((path) => {
    if (!expectedPaths.includes(path)) {
      errors.push(`Discovered Astro page missing from sitemap config: ${path}`);
    }
  });

  expectedPages
    .filter((page) => page.path.startsWith('/resurse/blog/'))
    .forEach((page) => {
      const lastmodMatch = sitemapContent.match(
        new RegExp(`<loc>https://mindleap\\.ro${page.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>\\s*<lastmod>(.*?)</lastmod>`)
      );
      if (!lastmodMatch) return;
      if (lastmodMatch[1] !== page.lastmod) {
        warnings.push(`Blog post ${page.path} lastmod is ${lastmodMatch[1]}, expected ${page.lastmod}`);
      }
    });

  const homepage = locations.find((loc) => loc === `${CANONICAL_ORIGIN}/` || loc === CANONICAL_ORIGIN);
  if (!homepage) {
    errors.push('Homepage missing from sitemap');
  }

  console.log(`✓ Sitemap validation: ${urls.length} URLs found (${sitemapPath.includes('/dist/') ? 'dist' : 'public'})`);

  if (warnings.length > 0) {
    console.warn('Warnings:');
    warnings.forEach((warning) => console.warn(`  - ${warning}`));
  }

  if (errors.length > 0) {
    console.error('Errors:');
    errors.forEach((error) => console.error(`  - ${error}`));
    process.exit(1);
  }

  console.log('✓ Sitemap validation passed');
} catch (error) {
  if (/** @type {NodeJS.ErrnoException} */ (error).code === 'ENOENT') {
    console.warn('⚠ Sitemap not found. Run: npm run prebuild');
    process.exit(1);
  }

  console.error('Error validating sitemap:', /** @type {Error} */ (error).message);
  process.exit(1);
}

}

main();
