import { NextRequest, NextResponse } from "next/server";
import { API_BASE, buildAuthHeader } from "@/lib/http/shared";
import { AUTH_COOKIE_REFRESH, AUTH_COOKIE_TOKEN, AUTH_COOKIE_TOKEN_NAME, setAuthCookies } from "@/lib/http/auth-cookies";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/http/rate-limit";

/**
 * Same-origin API proxy (BFF). Browser code talks to `/api/proxy/web/...`
 * and NEVER touches the backend origin or the credentials directly:
 *
 *   browser → /api/proxy/* (cookies, same-origin) → Authorization header → API_BASE
 *
 * This is what makes HttpOnly cookies viable for an SPA: the browser cannot
 * read the tokens, and does not need to. It also fixes the old
 * credentials:"same-origin"-on-a-cross-origin-API mismatch: there is no
 * cross-origin request anymore, and CSP connect-src can lock down to 'self'.
 *
 * 401 handling: one single-flight refresh attempt (backend /web/refresh-token
 * with the HttpOnly refresh cookie), then a single retry with the rotated
 * token. Browser clients see plain 200/401 — no refresh queues in JS.
 *
 * Auth endpoints are blacklisted: login/register/refresh must go through
 * /api/auth/* so the tokens are exchanged for cookies and never appear in a
 * proxied response body.
 */

const RATE_LIMIT = 120;
const RATE_WINDOW_MS = 60_000;

const PROXY_BLOCKLIST = new Set([
  "web/login",
  "web/register",
  "web/refresh-token",
  "web/logout",
]);

/** Single-flight refresh across concurrent proxied requests (per instance). */
let refreshInFlight: Promise<boolean> | null = null;

async function performRefresh(request: NextRequest): Promise<boolean> {
  const refreshToken = request.cookies.get(AUTH_COOKIE_REFRESH)?.value;
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE}/web/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const json = (await res.json().catch(() => null)) as {
      code?: number;
      data?: { accessToken?: string; tokenName?: string; refreshToken?: string };
    } | null;
    if (!json || json.code !== 0 || !json.data?.accessToken) return false;
    // Persist rotated credentials for THIS response; concurrent requests pick
    // them up from the shared module state below.
    rotated = {
      accessToken: json.data.accessToken,
      tokenName: json.data.tokenName || request.cookies.get(AUTH_COOKIE_TOKEN_NAME)?.value || "Authorization",
      refreshToken: json.data.refreshToken ?? refreshToken,
    };
    return true;
  } catch {
    return false;
  }
}

let rotated: { accessToken: string; tokenName: string; refreshToken?: string } | null = null;

async function refreshOnce(request: NextRequest): Promise<boolean> {
  refreshInFlight ??= performRefresh(request).finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

async function forward(request: NextRequest, method: string): Promise<Response> {
  const pathname = decodeURIComponent(request.nextUrl.pathname.replace(/^\/api\/proxy\//, ""));
  if (PROXY_BLOCKLIST.has(pathname)) {
    return NextResponse.json({ code: 404, message: "Not found" }, { status: 404 });
  }
  if (!rateLimit(`proxy:${clientIp(request)}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return tooManyRequests(60);
  }

  const token = request.cookies.get(AUTH_COOKIE_TOKEN)?.value ?? rotated?.accessToken;
  const tokenName =
    request.cookies.get(AUTH_COOKIE_TOKEN_NAME)?.value || rotated?.tokenName || "Authorization";

  const headers: Record<string, string> = {};
  const contentType = request.headers.get("content-type");
  if (contentType) headers["Content-Type"] = contentType;
  if (token) headers[tokenName] = buildAuthHeader(token, tokenName);

  const target = `${API_BASE}/${pathname}${request.nextUrl.search}`;
  const hasBody = method !== "GET" && method !== "HEAD";
  const body = hasBody ? await request.arrayBuffer() : undefined;

  let res = await fetch(target, { method, headers, body });

  if (res.status === 401 && token) {
    const refreshed = await refreshOnce(request);
    if (refreshed && rotated) {
      headers[tokenName] = buildAuthHeader(rotated.accessToken, rotated.tokenName);
      res = await fetch(target, { method, headers, body });
    }
  }

  const responseHeaders = new Headers();
  const resContentType = res.headers.get("content-type");
  if (resContentType) responseHeaders.set("Content-Type", resContentType);
  // Backend Set-Cookie (if any) is deliberately dropped: cookies are owned here.
  const response = new NextResponse(res.body, { status: res.status, headers: responseHeaders });
  if (rotated) {
    setAuthCookies(response, rotated);
    rotated = null;
  }
  return response;
}

export async function GET(request: NextRequest) {
  return forward(request, "GET");
}
export async function POST(request: NextRequest) {
  return forward(request, "POST");
}
export async function PUT(request: NextRequest) {
  return forward(request, "PUT");
}
export async function PATCH(request: NextRequest) {
  return forward(request, "PATCH");
}
export async function DELETE(request: NextRequest) {
  return forward(request, "DELETE");
}
