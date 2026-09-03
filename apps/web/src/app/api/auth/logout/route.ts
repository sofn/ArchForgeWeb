import { NextRequest, NextResponse } from "next/server";
import { API_BASE, buildAuthHeader } from "@/lib/http/shared";
import { AUTH_COOKIE_REFRESH, AUTH_COOKIE_TOKEN, AUTH_COOKIE_TOKEN_NAME, clearAuthCookies } from "@/lib/http/auth-cookies";

/**
 * Logout of the BFF auth flow.
 *
 * POST  /api/auth/logout                 — called by the SPA; best-effort
 *        backend invalidation + cookie drop.
 * GET   /api/auth/logout?redirect=/path  — used by server components to
 *        bounce dead sessions: clears cookies, then redirects. The redirect
 *        target must be a site-relative path (open-redirect guard).
 */

function safeRedirectTarget(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return null;
  return raw;
}

async function invalidateBackendSession(request: NextRequest): Promise<void> {
  const token = request.cookies.get(AUTH_COOKIE_TOKEN)?.value;
  const tokenName = request.cookies.get(AUTH_COOKIE_TOKEN_NAME)?.value || "Authorization";
  const refreshToken = request.cookies.get(AUTH_COOKIE_REFRESH)?.value;
  if (!token && !refreshToken) return;
  try {
    await fetch(`${API_BASE}/web/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { [tokenName]: buildAuthHeader(token, tokenName) } : {}),
      },
      body: JSON.stringify(refreshToken ? { refreshToken } : {}),
    });
  } catch {
    // Backend unreachable / session already dead — cookies still get dropped.
  }
}

export async function POST(request: NextRequest) {
  await invalidateBackendSession(request);
  const response = NextResponse.json({ code: 0, message: "ok", data: true });
  clearAuthCookies(response);
  return response;
}

export async function GET(request: NextRequest) {
  await invalidateBackendSession(request);
  const target = safeRedirectTarget(request.nextUrl.searchParams.get("redirect"));
  const response = target
    ? NextResponse.redirect(new URL(target, request.nextUrl.origin))
    : NextResponse.json({ code: 0, message: "ok", data: true });
  clearAuthCookies(response);
  return response;
}
