/** Canonical production origin — always non-www, HTTPS. */
export const CANONICAL_ORIGIN = 'https://mindleap.ro';

/**
 * Builds a canonical URL for the given pathname.
 * Strips trailing slashes (except homepage) and never uses www.
 */
export function getCanonicalUrl(pathname: string): string {
  if (!pathname || pathname === '/') {
    return `${CANONICAL_ORIGIN}/`;
  }

  const path = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return `${CANONICAL_ORIGIN}${path}`;
}

/** Normalizes an arbitrary site URL env value to the canonical origin. */
export function normalizeSiteOrigin(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.protocol = 'https:';
    parsed.hostname = parsed.hostname.replace(/^www\./i, '');
    return parsed.origin;
  } catch {
    return CANONICAL_ORIGIN;
  }
}
