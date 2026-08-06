export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081";

const DEFAULT_TIMEOUT = 10000;

export interface ApiResponse<T> {
  code: number;
  message?: string;
  data: T;
}

export interface WebLoginResponse {
  userId: number;
  username: string;
  nickname?: string;
  avatar?: string;
  accessToken: string;
  tokenName?: string;
  refreshToken?: string;
  expires: string;
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const entry = document.cookie.split("; ").find((row) => row.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.split("=")[1]) : null;
}

export function setAuthCookies(token: string, tokenName: string, refreshToken?: string) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `token=${encodeURIComponent(token)}; path=/; SameSite=Lax${secure}`;
  if (tokenName) {
    document.cookie = `tokenName=${encodeURIComponent(tokenName)}; path=/; SameSite=Lax${secure}`;
  }
  if (refreshToken) {
    document.cookie = `refreshToken=${encodeURIComponent(refreshToken)}; path=/; SameSite=Lax${secure}`;
  }
}

export function clearAuthCookies() {
  if (typeof document === "undefined") return;
  const names = ["token", "tokenName", "refreshToken"];
  names.forEach((name) => {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  });
}

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

async function doRefresh(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token");
  }

  const res = await fetch(`${API_BASE}/web/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    throw new Error("Refresh failed");
  }

  const json: ApiResponse<WebLoginResponse> & { detail?: string } = await res.json();
  if (json.code !== 0) {
    throw new Error(json.message || json.detail || "Refresh failed");
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

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
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
      { ...options, credentials: "include", headers },
      DEFAULT_TIMEOUT
    );

    if (res.status === 401) {
      await refreshAccessToken();
      return call();
    }

    if (!res.ok) {
      let message = `Request failed: ${res.status}`;
      try {
        const err = await res.json();
        message = err.message || err.detail || message;
      } catch {
        // ignore
      }
      throw new Error(message);
    }

    const json: ApiResponse<T> & { detail?: string } = await res.json();
    if (json.code !== 0) {
      throw new Error(json.message || json.detail || "Request failed");
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
