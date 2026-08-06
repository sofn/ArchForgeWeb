const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081";

interface ApiResponse<T> {
  code: number;
  message?: string;
  data: T;
}

interface PageResult<T> {
  list: T[];
  total: number;
  pageSize: number;
  currentPage: number;
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

export interface WebUserProfileResponse {
  userId: number;
  username: string;
  nickname?: string;
  avatar?: string;
}

export interface WebChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface WebDashboardMetricsResponse {
  userTotal: number;
  onlineNow: number;
  todayLogin: number;
  todayOperation: number;
}

export interface WebNoticeResponse {
  id: number;
  title: string;
  content?: string;
  noticeType?: number;
  createTime: string;
}

export interface WebOperationLogResponse {
  id: number;
  username: string;
  module?: string;
  summary?: string;
  operatingTime: string;
}

export interface WebCategory {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
  articleCount: number;
}

export interface WebArticleSummary {
  id: number;
  title: string;
  slug: string;
  summary: string;
  coverImageFileId: number | null;
  coverImageUrl: string;
  categoryName: string;
  publishTime: string;
}

export interface WebArticleDetail {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImageFileId: number | null;
  coverImageUrl: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  publishTime: string;
  createTime: string;
}

export interface WebArticleCreateRequest {
  categoryId: number;
  title: string;
  summary?: string;
  content: string;
  coverImageFileId?: number | null;
}

export interface FileUploadResponse {
  fileId: number;
  url: string;
  name: string;
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const entry = document.cookie.split("; ").find((row) => row.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.split("=")[1]) : null;
}

function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") || getCookie("token") || "";
}

function getTokenName(): string {
  if (typeof window === "undefined") return "Authorization";
  return localStorage.getItem("tokenName") || getCookie("tokenName") || "Authorization";
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

function buildAuthHeader(token: string, tokenName: string): string {
  if (tokenName.toLowerCase() === "authorization") {
    return `Bearer ${token}`;
  }
  return token;
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken") || getCookie("refreshToken");
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
  setAuthCookies(data.accessToken, tokenName);
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

async function fetchWithAuth(path: string, options?: RequestInit): Promise<Response> {
  const call = async (): Promise<Response> => {
    const token = getToken();
    const tokenName = getTokenName();
    const headers = new Headers(options?.headers);
    if (token) headers.set(tokenName, buildAuthHeader(token, tokenName));

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      credentials: "include",
      headers,
    });

    if (res.status === 401) {
      await refreshAccessToken();
      return call();
    }

    return res;
  };

  return call();
}

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);
  headers.set("Content-Type", "application/json");
  const res = await fetchWithAuth(path, { ...options, headers });
  let message = `Request failed: ${res.status}`;
  if (!res.ok) {
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
}

export async function login(username: string, password: string): Promise<WebLoginResponse> {
  return fetchApi<WebLoginResponse>("/web/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function logout(): Promise<boolean> {
  return fetchApi<boolean>("/web/logout", { method: "POST" });
}

export async function getProfile(): Promise<WebUserProfileResponse> {
  return fetchApi<WebUserProfileResponse>("/web/user/profile");
}

export async function changePassword(data: WebChangePasswordRequest): Promise<boolean> {
  return fetchApi<boolean>("/web/user/change-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMetrics(): Promise<WebDashboardMetricsResponse> {
  return fetchApi<WebDashboardMetricsResponse>("/web/dashboard/metrics");
}

export async function getNotices(): Promise<WebNoticeResponse[]> {
  return fetchApi<WebNoticeResponse[]>("/web/notices");
}

export async function getOperationLogs(): Promise<WebOperationLogResponse[]> {
  return fetchApi<WebOperationLogResponse[]>("/web/operation-logs");
}

export async function getCategories(): Promise<WebCategory[]> {
  return fetchApi<WebCategory[]>("/web/categories");
}

export async function getArticles(
  categoryId?: number,
  currentPage = 1,
  pageSize = 10,
  keyword?: string
): Promise<PageResult<WebArticleSummary>> {
  const params = new URLSearchParams();
  if (categoryId) params.set("categoryId", String(categoryId));
  params.set("currentPage", String(currentPage));
  params.set("pageSize", String(pageSize));
  if (keyword) params.set("keyword", keyword);
  return fetchApi<PageResult<WebArticleSummary>>(`/web/articles?${params.toString()}`);
}

export async function getMyArticles(
  currentPage = 1,
  pageSize = 10
): Promise<PageResult<WebArticleSummary>> {
  const params = new URLSearchParams();
  params.set("currentPage", String(currentPage));
  params.set("pageSize", String(pageSize));
  return fetchApi<PageResult<WebArticleSummary>>(`/web/user/articles?${params.toString()}`);
}

export async function getArticle(slug: string): Promise<WebArticleDetail> {
  return fetchApi<WebArticleDetail>(`/web/articles/${encodeURIComponent(slug)}`);
}

export async function createArticle(data: WebArticleCreateRequest): Promise<number> {
  return fetchApi<number>("/web/articles", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function uploadImage(file: File): Promise<FileUploadResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetchWithAuth("/web/file/upload", {
    method: "POST",
    body: form,
  });
  const json: ApiResponse<FileUploadResponse> & { detail?: string } = await res.json();
  if (!res.ok || json.code !== 0) {
    throw new Error(json.message || json.detail || "Upload failed");
  }
  return json.data;
}

export function getFileUrl(fileId?: number | null): string {
  return fileId ? `${API_BASE}/web/file/${fileId}` : "";
}

export function formatDateTime(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
