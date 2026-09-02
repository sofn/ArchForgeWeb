import createClient from "openapi-fetch";
import type { paths } from "@/types/schema";
import { clearAuthCookies, getCookie, setAuthCookies } from "./cookies";
import { ApiError } from "./errors";
import {
  API_BASE,
  DEFAULT_TIMEOUT,
  buildAuthHeader,
  fetchWithTimeout,
  parseErrorResponse,
  unwrap,
} from "./shared";

/**
 * Browser http client (with token refresh).
 *
 * IMPORTANT: this module is for Client Components. Server Components must use
 * `@/lib/http/server` (or the data layer `@/lib/api/server`): credentials live
 * in request cookies there, and `next/headers` must never enter the client
 * module graph.
 *
 * History note: getToken()/getCookie() below still return ""/null outside the
 * browser — by design, since a synchronous signature cannot await the
 * async-only `next/headers` cookie API. Previously that silently stripped auth
 * headers from RSC requests and forced user-facing pages to "use client".
 * The server client now covers RSC; do not route server requests through here.
 */

function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") || getCookie("token") || "";
}

function getTokenName(): string {
  if (typeof window === "undefined") return "Authorization";
  return localStorage.getItem("tokenName") || getCookie("tokenName") || "Authorization";
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken") || getCookie("refreshToken");
}

let isRefreshing = false;
const refreshSubscribers: Array<{ resolve: () => void; reject: (err: unknown) => void }> = [];
let authExpiredHandler: (() => void) | null = null;

export function setAuthExpiredHandler(handler: () => void) {
  authExpiredHandler = handler;
}

function settleRefreshSubscribers(error?: unknown) {
  refreshSubscribers.forEach(({ resolve, reject }) => (error ? reject(error) : resolve()));
  refreshSubscribers.length = 0;
}

async function doRefresh(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new ApiError("No refresh token", 401);
  }

  const res = await fetchWithTimeout(`${API_BASE}/web/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    throw await parseErrorResponse(res);
  }

  const json = (await res.json()) as {
    code: number;
    message?: string;
    data?: {
      accessToken: string;
      tokenName?: string;
      refreshToken?: string;
    };
  };
  if (json.code !== 0 || !json.data) {
    throw new ApiError(json.message || "Refresh failed", res.status, json.code);
  }

  const data = json.data;
  const tokenName = data.tokenName || "Authorization";
  localStorage.setItem("token", data.accessToken);
  localStorage.setItem("tokenName", tokenName);
  if (data.refreshToken) {
    localStorage.setItem("refreshToken", data.refreshToken);
  }
  setAuthCookies(data.accessToken, tokenName, data.refreshToken);
}

async function refreshAccessToken(): Promise<void> {
  if (isRefreshing) {
    await new Promise<void>((resolve, reject) => refreshSubscribers.push({ resolve, reject }));
    return;
  }

  isRefreshing = true;
  try {
    await doRefresh();
    settleRefreshSubscribers();
  } catch (err) {
    authExpiredHandler?.();
    settleRefreshSubscribers(err);
    throw err;
  } finally {
    isRefreshing = false;
  }
}

/**
 * Transport for openapi-fetch: injects the sa-token header, applies a timeout,
 * transparently refreshes expired tokens once, and normalizes every non-2xx
 * response (envelope or ProblemDetail) into an {@link ApiError}.
 */
const authFetch: typeof fetch = async (input, init) => {
  const token = getToken();
  const tokenName = getTokenName();
  const headers = new Headers(init?.headers);
  if (token) headers.set(tokenName, buildAuthHeader(token, tokenName));

  let res = await fetchWithTimeout(input, { ...init, credentials: "same-origin", headers });

  if (res.status === 401 && token) {
    await refreshAccessToken();
    headers.set(tokenName, buildAuthHeader(getToken(), getTokenName()));
    res = await fetchWithTimeout(input, { ...init, credentials: "same-origin", headers });
  }

  if (!res.ok) {
    if (res.status === 401 && !getToken()) {
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
export const api = createClient<paths>({ fetch: authFetch });

export { API_BASE, DEFAULT_TIMEOUT, buildAuthHeader, parseErrorResponse, fetchWithTimeout, unwrap };
export { clearAuthCookies, getCookie, setAuthCookies };
