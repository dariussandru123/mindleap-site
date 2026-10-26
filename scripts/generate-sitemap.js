#!/usr/bin/env node

import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { getSitemapPages, rootDir } from './sitemap-pages.js';

const outputPath = join(rootDir, 'public', 'sitemap.xml');

const CANONICAL_ORIGIN = 'https://mindleap.ro';
const generatedAt = new Date();

// Load env for Supabase fetch
const envPath = join(rootDir, '.env');
const envContent = readFileSync(envPath, 'utf-8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
}
const SUPABASE_URL = envVars.PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = envVars.PUBLIC_SUPABASE_ANON_KEY;

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildUrl(path) {
  return path === '/' ? `${CANONICAL_ORIGIN}/` : `${CANONICAL_ORIGIN}${path}`;
}

async function fetchBlogPostsFromDb() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/blog_posts?published=eq.true&select=slug,date_published,title&order=date_published.desc`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function main() {
  const PAGES = getSitemapPages();

  // Fetch published blog posts from DB
  const dbPosts = await fetchBlogPostsFromDb();

  // Collect slugs already in static pages
  const existingSlugs = new Set(
    PAGES.filter((p) => p.path.startsWith('/resurse/blog/')).map((p) => p.path)
  );

  // Add DB posts not already present (avoids duplicates with hardcoded static pages)
  const dbEntries = dbPosts
    .filter((post) => !existingSlugs.has(`/resurse/blog/${post.slug}`))
    .map((post) => ({
      path: `/resurse/blog/${post.slug}`,
      label: post.title || post.slug,
      section: 'Blog',
      changefreq: 'monthly',
      priority: 0.65,
      lastmod: post.date_published || generatedAt.toISOString().split('T')[0],
    }));

  const allPages = [...PAGES.filter((p) => p.path !== '/resurse/blog/[slug]'), ...dbEntries];

  const urlEntries = allPages.map((page) => {
    const loc = buildUrl(page.path);
    return [
      `  <!-- ${page.label} | ${page.section} -->`,
      '  <url>',
      `    <loc>${escapeXml(loc)}</loc>`,
      `    <lastmod>${page.lastmod}</lastmod>`,
      `    <changefreq>${page.changefreq}</changefreq>`,
      `    <priority>${page.priority.toFixed ? page.priority.toFixed(2) : page.priority}</priority>`,
      '  </url>',
    ].join('\n');
  }).join('\n\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<!--
  Mindleap XML Sitemap
  Canonical origin: ${CANONICAL_ORIGIN}
  Generated: ${generatedAt.toISOString()}
  URLs: ${allPages.length}
  Human view: open /sitemap.xml in browser (styled via sitemap.xsl)
-->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
                            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

${urlEntries}

</urlset>
`;

  writeFileSync(outputPath, xml, 'utf-8');
  console.log(`\u2713 sitemap.xml generated (${allPages.length} URLs, styled) -> public/sitemap.xml`);
}

main();
