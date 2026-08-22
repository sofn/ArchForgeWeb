import { API_BASE, api, unwrap } from "@/lib/http/client";
import type {
  FileUploadResponse,
  PageResult,
  WebArticleCreateRequest,
  WebArticleDetail,
  WebArticleSummary,
  WebCategory,
} from "./types";

export async function getCategories(): Promise<WebCategory[]> {
  return unwrap<WebCategory[]>(api.GET("/web/categories"));
}

export async function getArticles(
  categoryId?: number,
  currentPage = 1,
  pageSize = 10,
  keyword?: string
): Promise<PageResult<WebArticleSummary>> {
  return unwrap<PageResult<WebArticleSummary>>(
    api.GET("/web/articles", {
      params: { query: { categoryId, currentPage, pageSize, keyword } },
    })
  );
}

export async function getMyArticles(
  currentPage = 1,
  pageSize = 10
): Promise<PageResult<WebArticleSummary>> {
  return unwrap<PageResult<WebArticleSummary>>(
    api.GET("/web/user/articles", { params: { query: { currentPage, pageSize } } })
  );
}

export async function getArticle(slug: string): Promise<WebArticleDetail> {
  return unwrap<WebArticleDetail>(
    api.GET("/web/articles/{slug}", { params: { path: { slug } } })
  );
}

export async function createArticle(data: WebArticleCreateRequest): Promise<number> {
  return unwrap<number>(api.POST("/web/articles", { body: data }));
}

export async function uploadImage(file: File): Promise<FileUploadResponse> {
  const form = new FormData();
  form.append("file", file);
  // Schema types binary fields as strings; at runtime openapi-fetch passes FormData straight to fetch.
  return unwrap<FileUploadResponse>(
    api.POST("/web/file/upload", { body: form as unknown as { file: string } })
  );
}

export function getFileUrl(fileId?: number | null): string {
  return fileId ? `${API_BASE}/web/file/${fileId}` : "";
}
