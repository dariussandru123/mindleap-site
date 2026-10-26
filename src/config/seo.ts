import type { AstroGlobal } from 'astro';
import { getCanonicalUrl } from '@/config/canonical';
import { SITE } from '@/config/site';

export function getPageTitle(title: string, siteTitle: string = 'Mindleap'): string {
  if (!title?.trim()) return siteTitle;

  const clean = title.trim().replace(/\s*[-|]\s*Mindleap\s*$/i, '').trim();
  if (!clean || clean === siteTitle) return siteTitle;
  return `${clean} | ${siteTitle}`;
}

export function getPageDescription(description?: string): string {
  return description || SITE.description;
}

export type OpenGraphOptions = {
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
};

export function getOpenGraphTags(
  Astro: AstroGlobal,
  title: string,
  description: string,
  image?: string,
  options: OpenGraphOptions = {}
) {
  const { type = 'website', publishedTime, modifiedTime } = options;
  const canonicalUrl = getCanonicalUrl(Astro.url.pathname);
  const siteUrl = new URL(canonicalUrl).origin;
  const ogImage = image || `${siteUrl}${SITE.ogImage}`;

  const tags: Record<string, string> = {
    'og:title': title,
    'og:description': description,
    'og:image': ogImage,
    'og:url': canonicalUrl,
    'og:type': type,
    'og:locale': 'ro_RO',
    'og:site_name': SITE.name,
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:image:alt': title,
  };

  if (type === 'article' && publishedTime) {
    tags['article:published_time'] = publishedTime;
  }
  if (type === 'article' && modifiedTime) {
    tags['article:modified_time'] = modifiedTime;
  }

  return tags;
}

export function getTwitterCardTags(title: string, description: string, image?: string) {
  const siteUrl = 'https://mindleap.ro';
  const twitterImage = image || `${siteUrl}${SITE.ogImage}`;

  return {
    'twitter:card': 'summary_large_image',
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': twitterImage,
    'twitter:site': '@grow.with.mindleap',
    'twitter:creator': '@codobanioan',
  };
}

export function getSameAsUrls(): string[] {
  return Object.values(SITE.social).filter(Boolean);
}
