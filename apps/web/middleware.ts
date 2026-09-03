import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./src/i18n/routing";
import { DEFAULT_LOCALE, isPublicPath, localeFromPath } from "./src/lib/routes";
import { AI_TRAINING_BOT_PATTERN } from "./src/lib/bots";

const intlMiddleware = createMiddleware(routing);

/**
 * Per-request Content-Security-Policy with a nonce:
 * - script-src drops 'unsafe-inline'/'unsafe-eval' (prod) — Next applies the
 *   nonce to its own inline (flight/bootstrap) scripts when it parses this
 *   header off the REQUEST; next-themes receives the nonce via the
 *   x-nonce request header → ThemeProvider nonce prop.
 * - 'strict-dynamic' lets trusted runtime scripts (next/script, lazy chunks)
 *   load without listing hosts.
 * - style-src keeps 'unsafe-inline': React style attributes everywhere (CSS
 *   injection is not script execution; the cost of hardening is a rewrite).
 * - connect-src 'self' is now enforceable: the browser talks only to the
 *   same-origin /api/proxy, never to the backend origin.
 * - pages become dynamic (headers() for the nonce) — accepted trade-off.
 */
function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV === "development";
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: http: https:",
    "connect-src 'self'",
    "font-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

export default function middleware(request: NextRequest) {
  // 1. Hard-block AI training crawlers at the edge (robots.txt is advisory;
  //    this is the fence). AI search bots stay allowed — they link back.
  const userAgent = request.headers.get("user-agent") ?? "";
  if (AI_TRAINING_BOT_PATTERN.test(userAgent)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // 2. CSP: mutate the REQUEST headers (Next reads the nonce from them and
  //    auto-applies it to its inline scripts), then stamp the header on the
  //    RESPONSE the intl middleware produces.
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce);
  request.headers.set("x-nonce", nonce);
  request.headers.set("content-security-policy", csp);

  // 3. Locale negotiation + auth existence guard (token validity is checked
  //    by the (user) layout against the backend — middleware stays cheap).
  const intlResponse = intlMiddleware(request);
  const pathname = request.nextUrl.pathname;
  intlResponse.headers.set("content-security-policy", csp);
  if (isPublicPath(pathname)) {
    return intlResponse;
  }
  const token = request.cookies.get("token")?.value;
  if (!token) {
    const locale = localeFromPath(pathname) || DEFAULT_LOCALE;
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `/${locale}/login`;
    loginUrl.searchParams.set("from", pathname);
    const redirect = NextResponse.redirect(loginUrl);
    redirect.headers.set("content-security-policy", csp);
    return redirect;
  }
  return intlResponse;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|rss.xml|.*\\..*).*)"],
};
