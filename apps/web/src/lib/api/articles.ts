import { API_BASE, httpClient } from "@/lib/http/client";
import type {
  FileUploadResponse,
  PageResult,
  WebArticleCreateRequest,
  WebArticleDetail,
  WebArticleSummary,
  WebCategory,
} from "./types";

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
