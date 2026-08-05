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

function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") || "";
}

function getTokenName(): string {
  if (typeof window === "undefined") return "Authorization";
  return localStorage.getItem("tokenName") || "Authorization";
}

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const tokenName = getTokenName();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers[tokenName] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...options?.headers }
  });
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
    body: JSON.stringify({ username, password })
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
    body: JSON.stringify(data)
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

export async function getMyArticles(currentPage = 1, pageSize = 10): Promise<PageResult<WebArticleSummary>> {
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
    body: JSON.stringify(data)
  });
}

export async function uploadImage(file: File): Promise<FileUploadResponse> {
  const token = getToken();
  const tokenName = getTokenName();
  const form = new FormData();
  form.append("file", file);
  const headers: Record<string, string> = {};
  if (token) headers[tokenName] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/web/file/upload`, {
    method: "POST",
    headers,
    body: form
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
    minute: "2-digit"
  });
}
