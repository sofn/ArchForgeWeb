import { LOCALES } from "@/lib/routes";

/**
 * Canonical site origin — single source of truth for metadata, sitemap and RSS.
 * Prefer setting NEXT_PUBLIC_SITE_URL in the target environment; the localhost
 * fallback must never leak into production output unnoticed (CI sets the var
 * during build when a real deployment URL exists).
 */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

/**
 * hreflang alternates for every supported locale, derived from LOCALES —
 * adding a locale in routes.ts propagates everywhere (metadata, sitemap, RSS)
 * with zero manual edits. `path` is locale-stripped, e.g. "/articles/foo".
 */
export function localeAlternates(path = ""): Record<string, string> {
  const site = getSiteUrl();
  return Object.fromEntries(LOCALES.map((l) => [l, `${site}/${l}${path}`]));
}
