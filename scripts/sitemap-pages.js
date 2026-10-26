import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const rootDir = join(__dirname, '..');

/** @type {Record<string, { label: string; section: string; changefreq: string; priority: number }>} */
export const PAGE_META = {
  '/': { label: 'Acasa', section: 'Principal', changefreq: 'weekly', priority: 1.0 },
  '/servicii': { label: 'Servicii', section: 'Principal', changefreq: 'weekly', priority: 0.9 },
  '/contact': { label: 'Contact', section: 'Principal', changefreq: 'weekly', priority: 0.9 },
  '/despre-noi': { label: 'Despre noi', section: 'Brand', changefreq: 'monthly', priority: 0.8 },
  '/studii-de-caz': { label: 'Studii de caz', section: 'Dovada sociala', changefreq: 'weekly', priority: 0.8 },
  '/studii-de-caz/coldea-expert-construct': {
    label: 'Coldea Expert Construct',
    section: 'Studiu de caz',
    changefreq: 'monthly',
    priority: 0.75,
  },
  '/studii-de-caz/stereographic': { label: 'Stereographic', section: 'Studiu de caz', changefreq: 'monthly', priority: 0.75 },
  '/studii-de-caz/bubble-kids': { label: 'Bubble Kids', section: 'Studiu de caz', changefreq: 'monthly', priority: 0.75 },
  '/resurse': { label: 'Resurse', section: 'Continut', changefreq: 'weekly', priority: 0.7 },
  '/legal/termeni-si-conditii': { label: 'Termeni si conditii', section: 'Legal', changefreq: 'yearly', priority: 0.3 },
  '/legal/politica-confidentialitate': {
    label: 'Politica confidentialitate',
    section: 'Legal',
    changefreq: 'yearly',
    priority: 0.3,
  },
  '/legal/cookies': { label: 'Politica cookies', section: 'Legal', changefreq: 'yearly', priority: 0.3 },
  '/legal/personalizeaza-cookie-uri': {
    label: 'Personalizeaza cookie-uri',
    section: 'Legal',
    changefreq: 'yearly',
    priority: 0.25,
  },
};

const DEFAULT_META = {
  label: 'Pagina',
  section: 'Site',
  changefreq: 'monthly',
  priority: 0.5,
};

/**
 * @param {string} pagesDir
 * @param {string} [basePath]
 * @returns {string[]}
 */
export function discoverAstroRoutes(pagesDir, basePath = '') {
  /** @type {string[]} */
  const routes = [];

  for (const entry of readdirSync(pagesDir)) {
    const fullPath = join(pagesDir, entry);
    if (statSync(fullPath).isDirectory()) {
      routes.push(...discoverAstroRoutes(fullPath, `${basePath}/${entry}`));
      continue;
    }

    if (!entry.endsWith('.astro') || entry === '404.astro' || entry === 'admin.astro') continue;

    const segment = entry.replace(/\.astro$/, '');
    // Skip dynamic routes (e.g. [slug].astro) — those are populated from DB
    if (segment.startsWith('[') && segment.endsWith(']')) continue;
    routes.push(segment === 'index' ? basePath || '/' : `${basePath}/${segment}`);
  }

  return routes;
}

/**
 * @param {string} blogPostsPath
 * @returns {Record<string, string>}
 */
export function parseBlogLastmods(blogPostsPath) {
  const content = readFileSync(blogPostsPath, 'utf-8');
  /** @type {Record<string, string>} */
  const lastmods = {};

  for (const block of content.split(/\n  \{/).slice(1)) {
    if (!/published:\s*true/.test(block)) continue;

    const slug = block.match(/slug:\s*'([^']+)'/)?.[1];
    const datePublished = block.match(/datePublished:\s*'([^']*)'/)?.[1];
    if (!slug || !datePublished) continue;

    lastmods[`/resurse/blog/${slug}`] = datePublished;
  }

  return lastmods;
}

/**
 * @param {string} [baseDir]
 * @returns {Array<{ path: string; label: string; section: string; changefreq: string; priority: number; lastmod: string }>}
 */
export function getSitemapPages(baseDir = rootDir) {
  const pagesDir = join(baseDir, 'src', 'pages');
  const blogPostsPath = join(baseDir, 'src', 'data', 'blogPosts.ts');
  const defaultLastmod = new Date().toISOString().split('T')[0];
  const blogLastmods = parseBlogLastmods(blogPostsPath);

  const routes = discoverAstroRoutes(pagesDir).sort((a, b) => {
    const priorityA = PAGE_META[a]?.priority ?? DEFAULT_META.priority;
    const priorityB = PAGE_META[b]?.priority ?? DEFAULT_META.priority;
    if (priorityB !== priorityA) return priorityB - priorityA;
    return a.localeCompare(b);
  });

  return routes.map((path) => {
    const meta = PAGE_META[path] ?? { ...DEFAULT_META, label: path };
    return {
      path,
      label: meta.label,
      section: meta.section,
      changefreq: meta.changefreq,
      priority: meta.priority,
      lastmod: blogLastmods[path] ?? defaultLastmod,
    };
  });
}
