import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { DEFAULT_LOCALE, isPublicPath, localeFromPath } from "./src/lib/routes";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const intlResponse = intlMiddleware(request);
  const pathname = request.nextUrl.pathname;
  if (isPublicPath(pathname)) {
    return intlResponse;
  }
  const token = request.cookies.get("token")?.value;
  if (!token) {
    const locale = localeFromPath(pathname) || DEFAULT_LOCALE;
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `/${locale}/login`;
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }
  return intlResponse;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|rss.xml|.*\\..*).*)"],
};
