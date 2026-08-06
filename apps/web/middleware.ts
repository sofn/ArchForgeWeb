import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/articles"];
const STATIC_PREFIXES = ["/_next/", "/favicon.ico"];

function isPublicPath(path: string): boolean {
  if (PUBLIC_PATHS.includes(path)) return true;
  if (STATIC_PREFIXES.some((p) => path.startsWith(p))) return true;
  // Article detail like /articles/hello-world is public
  if (/^\/articles\/[^/]+$/.test(path) && path !== "/articles/me") return true;
  return false;
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token && !isPublicPath(request.nextUrl.pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"]
};
