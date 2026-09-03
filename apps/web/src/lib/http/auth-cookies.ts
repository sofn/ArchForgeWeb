import type { NextResponse } from "next/server";

/**
 * Server-side auth cookie management (HttpOnly BFF pattern).
 *
 * The credentials NEVER touch JavaScript-readable storage: route handlers set
 * HttpOnly cookies, RSC/middleware read them via cookies(), and browser calls
 * ride the same-origin /api/proxy which injects the Authorization header
 * server-side. A non-sensitive `hasSession` cookie is the only readable
 * signal (lets AuthProvider know a session exists without exposing tokens).
 */

export const AUTH_COOKIE_TOKEN = "token";
export const AUTH_COOKIE_TOKEN_NAME = "tokenName";
export const AUTH_COOKIE_REFRESH = "refreshToken";
export const AUTH_COOKIE_HAS_SESSION = "hasSession";

/** Values the login/register/refresh endpoints return (envelope data part). */
export interface TokenBundle {
  accessToken: string;
  tokenName?: string;
  refreshToken?: string;
}

const COOKIE_BASE = {
  path: "/",
  sameSite: "lax" as const,
  // Secure in production; plain-http dev/staging stays functional.
  secure: process.env.NODE_ENV === "production",
};

/** Marks the response with the full (HttpOnly) credential cookie set. */
export function setAuthCookies(response: NextResponse, bundle: TokenBundle): void {
  const tokenName = bundle.tokenName || "Authorization";
  response.cookies.set(AUTH_COOKIE_TOKEN, bundle.accessToken, {
    ...COOKIE_BASE,
    httpOnly: true,
  });
  response.cookies.set(AUTH_COOKIE_TOKEN_NAME, tokenName, {
    ...COOKIE_BASE,
    httpOnly: true,
  });
  if (bundle.refreshToken) {
    response.cookies.set(AUTH_COOKIE_REFRESH, bundle.refreshToken, {
      ...COOKIE_BASE,
      httpOnly: true,
    });
  }
  // Readable session indicator — no secret material.
  response.cookies.set(AUTH_COOKIE_HAS_SESSION, "1", COOKIE_BASE);
}

/** Drops every auth cookie (logout / dead session). */
export function clearAuthCookies(response: NextResponse): void {
  for (const name of [
    AUTH_COOKIE_TOKEN,
    AUTH_COOKIE_TOKEN_NAME,
    AUTH_COOKIE_REFRESH,
    AUTH_COOKIE_HAS_SESSION,
  ]) {
    response.cookies.set(name, "", { ...COOKIE_BASE, httpOnly: name !== AUTH_COOKIE_HAS_SESSION, maxAge: 0 });
  }
}
