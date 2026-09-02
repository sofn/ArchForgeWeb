export const LOCALES = ["en", "zh"] as const;
export type AppLocale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: AppLocale = "en";

export const PUBLIC_PATHS = ["/", "/login", "/register", "/forgot-password", "/articles"] as const;

// Derived from LOCALES so adding a locale never silently breaks the guard
// regex (a stale pattern would stop stripping the new prefix).
const LOCALE_PREFIX = new RegExp(`^/(${LOCALES.join("|")})(?=/|$)`);

export function stripLocale(pathname: string): string {
  const match = pathname.match(LOCALE_PREFIX);
  if (!match) return pathname || "/";
  const stripped = pathname.slice(match[0].length);
  return stripped.length === 0 ? "/" : stripped;
}

export function isPublicArticleDetail(pathname: string): boolean {
  return /^\/articles\/[^/]+$/.test(pathname) && pathname !== "/articles/me";
}

export function isPublicPath(pathname: string): boolean {
  const path = stripLocale(pathname);
  if ((PUBLIC_PATHS as readonly string[]).includes(path)) return true;
  if (path.startsWith("/_next/") || path === "/favicon.ico") return true;
  if (isPublicArticleDetail(path)) return true;
  if (path.startsWith("/api/")) return true;
  if (path === "/robots.txt" || path === "/sitemap.xml" || path === "/rss.xml") return true;
  return false;
}

export function localeFromPath(pathname: string): AppLocale {
  const first = pathname.split("/").filter(Boolean)[0];
  return LOCALES.includes(first as AppLocale) ? (first as AppLocale) : DEFAULT_LOCALE;
}
