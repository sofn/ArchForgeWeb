import { clearAuthCookies, getCookie, setAuthCookies } from "./cookies";
import { ApiError } from "./errors";
import type { ApiResponse, WebLoginResponse } from "./types";

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
const refreshSubscribers: Array<() => void> = [];
let authExpiredHandler: (() => void) | null = null;

export function setAuthExpiredHandler(handler: () => void) {
  authExpiredHandler = handler;
}

function notifyRefreshSubscribers() {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers.length = 0;
}

async function parseError(res: Response, fallback: string): Promise<ApiError> {
  try {
    const err = (await res.json()) as { message?: string; detail?: string; code?: number };
    return new ApiError(err.message || err.detail || fallback, res.status, err.code);
  } catch {
    return new ApiError(fallback, res.status);
  }
}

async function doRefresh(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new ApiError("No refresh token", 401);
  }

  const res = await fetch(`${API_BASE}/web/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    throw await parseError(res, "Refresh failed");
  }

  const json: ApiResponse<WebLoginResponse> & { detail?: string } = await res.json();
  if (json.code !== 0) {
    throw new ApiError(json.message || json.detail || "Refresh failed", res.status, json.code);
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
    await new Promise<void>((resolve) => refreshSubscribers.push(resolve));
    return;
  }

  isRefreshing = true;
  try {
    await doRefresh();
    notifyRefreshSubscribers();
  } catch (err) {
    authExpiredHandler?.();
    throw err;
  } finally {
    isRefreshing = false;
  }
}

function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

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

async function request<T>(path: string, options: RequestInit = {}, retried = false): Promise<T> {
  const call = async (): Promise<T> => {
    const token = getToken();
    const tokenName = getTokenName();
    const headers = new Headers(options.headers);
    if (token) headers.set(tokenName, buildAuthHeader(token, tokenName));
    if (!headers.has("Content-Type") && typeof options.body === "string") {
      headers.set("Content-Type", "application/json");
    }

    const res = await fetchWithTimeout(
      `${API_BASE}${path}`,
      { ...options, credentials: "same-origin", headers },
      DEFAULT_TIMEOUT
    );

    if (res.status === 401) {
      if (!token || retried) {
        throw new ApiError("请先登录", 401);
      }
      await refreshAccessToken();
      return request<T>(path, options, true);
    }

    if (!res.ok) {
      throw await parseError(res, `Request failed: ${res.status}`);
    }

    const json: ApiResponse<T> & { detail?: string } = await res.json();
    if (json.code !== 0) {
      throw new ApiError(json.message || json.detail || "Request failed", res.status, json.code);
    }
    return json.data;
  };

  return call();
}

export const httpClient = {
  request,
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: "PUT",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  upload: <T>(path: string, form: FormData) => request<T>(path, { method: "POST", body: form }),
};

export { clearAuthCookies, getCookie, setAuthCookies };
