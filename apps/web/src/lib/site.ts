/**
 * Canonical site origin — single source of truth for metadata, sitemap and RSS.
 * Prefer setting NEXT_PUBLIC_SITE_URL in the target environment; the localhost
 * fallback must never leak into production output unnoticed (CI sets the var
 * during build when a real deployment URL exists).
 */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}
