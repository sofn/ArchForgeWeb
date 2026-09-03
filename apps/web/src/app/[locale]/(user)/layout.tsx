import type { Metadata } from "next";
import { redirect as localeRedirect } from "@/i18n/navigation";
// eslint-disable-next-line no-restricted-imports -- /api routes live outside the locale tree
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/http/errors";
import { readServerAuth, serverApi } from "@/lib/http/server";

/**
 * Private, cookie-gated pages (profile / write / notifications / …):
 * 1. never indexable — robots.ts disallows crawling; this noindex keeps
 *    pages that leak via redirects or cached copies out of search results
 *    regardless of the crawler honoring robots.txt.
 * 2. actually authenticated — the middleware only checks that a token
 *    cookie EXISTS (cheap). This layout is the authoritative gate: it asks
 *    the backend whether the session is still alive. Expired/revoked
 *    sessions bounce to login (via the logout route, which also clears the
 *    stale cookies) instead of rendering a page that fails on every fetch.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function UserLayout({ children, params }: Props) {
  const { locale } = await params;
  const auth = await readServerAuth();
  if (!auth.token) {
    localeRedirect({ href: "/login", locale });
  }

  // Session validity check (one profile round-trip). Network-level failures
  // fall through — the page's own error boundary handles those; only a real
  // 401 (refresh chain dead) ends the session.
  const api = await serverApi();
  try {
    await api.GET("/web/user/profile");
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      // Dead session: clear the HttpOnly cookies server-side, then re-enter
      // through the login page.
      redirect(`/api/auth/logout?redirect=/${locale}/login`);
    }
  }

  return children;
}
