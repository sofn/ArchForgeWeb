import createClient from "openapi-fetch";
import type { paths } from "@/types/schema";
import { clearAuthCookies, getCookie, setAuthCookies } from "./cookies";
import { ApiError } from "./errors";

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081";

const DEFAULT_TIMEOUT = 10000;

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

function buildAuthHeader(token: string, tokenName: string): string {
  if (tokenName.toLowerCase() === "authorization") {
    return `Bearer ${token}`;
  }
  return token;
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

async function parseErrorResponse(res: Response): Promise<ApiError> {
  try {
    const err = (await res.json()) as { message?: string; detail?: string; code?: number };
    return new ApiError(err.message || err.detail || `Request failed: ${res.status}`, res.status, err.code);
  } catch {
    return new ApiError(`Request failed: ${res.status}`, res.status);
  }
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

function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  const userSignal = init.signal;
  const onAbort = () => controller.abort();
  if (userSignal) {
    if (userSignal.aborted) {
      controller.abort();
    } else {
      userSignal.addEventListener("abort", onAbort, { once: true });
    }
  }

  return fetch(input, { ...init, signal: controller.signal }).finally(() => {
    clearTimeout(timeoutId);
    if (userSignal) {
      userSignal.removeEventListener("abort", onAbort);
    }
  });
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
 * payloads are checked against `src/types/schema.d.ts`, which is generated
 * from ArchForgeSpec/api/openapi.yaml via `pnpm gen:api`.
 */
export const api = createClient<paths>({ fetch: authFetch });

/** Unwraps the `{code,message,data}` envelope returned by every success response. */
export async function unwrap<T>(call: Promise<{ data?: unknown; error?: unknown; response: Response }>): Promise<T> {
  const { data, error, response } = await call;
  if (error) {
    throw error instanceof ApiError ? error : new ApiError(String(error), response.status);
  }
  const envelope = data as { code: number; message?: string; data?: T } | undefined;
  if (!envelope || envelope.code !== 0) {
    throw new ApiError(envelope?.message || "Request failed", response.status, envelope?.code);
  }
  return envelope.data as T;
}

export { clearAuthCookies, getCookie, setAuthCookies };
