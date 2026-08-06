import {
  API_BASE,
  ApiResponse,
  WebLoginResponse,
  clearAuthCookies,
  getCookie,
  httpClient,
  setAuthCookies,
  setAuthExpiredHandler,
} from "./httpClient";

export type { ApiResponse, WebLoginResponse };
export { getCookie, setAuthCookies, clearAuthCookies, setAuthExpiredHandler, API_BASE };

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

export interface PageResult<T> {
  list: T[];
  total: number;
  pageSize: number;
  currentPage: number;
}

export async function login(username: string, password: string): Promise<WebLoginResponse> {
  return httpClient.post<WebLoginResponse>("/web/login", { username, password });
}

export async function logout(refreshToken?: string | null): Promise<boolean> {
  return httpClient.post<boolean>("/web/logout", refreshToken ? { refreshToken } : {});
}

export async function getProfile(): Promise<WebUserProfileResponse> {
  return httpClient.get<WebUserProfileResponse>("/web/user/profile");
}

export async function changePassword(data: WebChangePasswordRequest): Promise<boolean> {
  return httpClient.post<boolean>("/web/user/change-password", data);
}

export async function getMetrics(): Promise<WebDashboardMetricsResponse> {
  return httpClient.get<WebDashboardMetricsResponse>("/web/dashboard/metrics");
}

export async function getNotices(): Promise<WebNoticeResponse[]> {
  return httpClient.get<WebNoticeResponse[]>("/web/notices");
}

export async function getOperationLogs(): Promise<WebOperationLogResponse[]> {
  return httpClient.get<WebOperationLogResponse[]>("/web/operation-logs");
}

export async function getCategories(): Promise<WebCategory[]> {
  return httpClient.get<WebCategory[]>("/web/categories");
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
  return httpClient.get<PageResult<WebArticleSummary>>(`/web/articles?${params.toString()}`);
}

export async function getMyArticles(
  currentPage = 1,
  pageSize = 10
): Promise<PageResult<WebArticleSummary>> {
  const params = new URLSearchParams();
  params.set("currentPage", String(currentPage));
  params.set("pageSize", String(pageSize));
  return httpClient.get<PageResult<WebArticleSummary>>(`/web/user/articles?${params.toString()}`);
}

export async function getArticle(slug: string): Promise<WebArticleDetail> {
  return httpClient.get<WebArticleDetail>(`/web/articles/${encodeURIComponent(slug)}`);
}

export async function createArticle(data: WebArticleCreateRequest): Promise<number> {
  return httpClient.post<number>("/web/articles", data);
}

export async function uploadImage(file: File): Promise<FileUploadResponse> {
  const form = new FormData();
  form.append("file", file);
  return httpClient.upload<FileUploadResponse>("/web/file/upload", form);
}

export function getFileUrl(fileId?: number | null): string {
  return fileId ? `${API_BASE}/web/file/${fileId}` : "";
}
