import createClient from "openapi-fetch";
import type { paths } from "@/types/schema";
import { getCookie } from "./cookies";
import { ApiError } from "./errors";
import { API_BASE, fetchWithTimeout, parseErrorResponse, unwrap } from "./shared";

/**
 * Browser http client.
 *
 * All requests go through the same-origin /api/proxy BFF route — the browser
 * never sees the backend origin and never handles credentials. Auth cookies
 * are HttpOnly (set by /api/auth/*); the proxy injects the Authorization
 * header and performs token refresh server-side, so this client has no token
 * storage, no refresh queue, no localStorage — nothing for XSS to steal.
 *
 * IMPORTANT: the relative baseUrl makes this module browser-only by design.
 * Server Components must use `@/lib/http/server` (absolute API_BASE) — a
 * relative Request throws in Node, which is the guardrail.
 */

export const API_PROXY_BASE = "/api/proxy";

let authExpiredHandler: (() => void) | null = null;

export function setAuthExpiredHandler(handler: (() => void) | null) {
  authExpiredHandler = handler;
}

/** Session indicator for client state (tokens themselves are HttpOnly). */
export function hasSessionCookie(): boolean {
  if (typeof document === "undefined") return false;
  return getCookie("hasSession") === "1";
}

/**
 * Transport: timeout + same-origin cookies. 401 means the proxy already tried
 * one refresh — the session is dead; surface it to the app (AuthProvider
 * clears state and redirects) instead of retrying here.
 */
const authFetch: typeof fetch = async (input, init) => {
  const res = await fetchWithTimeout(input, { ...init, credentials: "same-origin" });
  if (!res.ok) {
    if (res.status === 401) {
      authExpiredHandler?.();
      throw new ApiError("请先登录", 401);
    }
    throw await parseErrorResponse(res);
  }
  return res;
};

/**
 * Schema-typed API client. All endpoint calls go through this — paths and
 * response shapes are checked against `src/types/schema.d.ts`, which is generated
 * from ArchForgeSpec/api/openapi.yaml via `pnpm gen:api`.
 */
export const api = createClient<paths>({ fetch: authFetch, baseUrl: API_PROXY_BASE });

export { API_BASE, fetchWithTimeout, parseErrorResponse, unwrap, getCookie };
