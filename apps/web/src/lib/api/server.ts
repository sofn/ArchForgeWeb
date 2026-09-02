import { createServerApi, readServerAuth, serverApi } from "@/lib/http/server";
import { unwrap } from "@/lib/http/shared";
import type {
  PageResult,
  WebArticleDetail,
  WebArticleSummary,
  WebCategory,
  WebDashboardMetricsResponse,
  WebNoticeResponse,
  WebOperationLogResponse,
  WebUserProfileResponse,
} from "./types";

/**
 * Server-side data layer for React Server Components.
 *
 * Thin wrappers around the schema-typed API. Mirrors the shape of
 * `lib/api/{user,articles}.ts` but routes through the server client
 * (absolute URLs — Node fetch rejects the relative paths the browser
 * client relies on).
 *
 * Two access modes:
 * - Public endpoints (`/web/articles`, `/web/categories`) use an empty-auth
 *   client WITHOUT reading cookies, so pages/sitemap stay cacheable (ISR).
 * - Authenticated endpoints use the request-scoped client (cookie credentials),
 *   so RSC pages fetch with the sa-token header.
 *
 * Error policy:
 * - getServerProfile: returns null (page renders logged-out state) — a public
 *   homepage must not 500 when the session expired; the client AuthProvider
 *   performs cleanup/redirect on its own profile query.
 * - The list/dash endpoints rethrow: protected routes have error.tsx boundaries
 *   and middleware guarantees a token cookie exists there.
 */

export async function getServerProfile(): Promise<WebUserProfileResponse | null> {
  const auth = await readServerAuth();
  if (!auth.token) return null;
  const api = await serverApi();
  try {
    // `return await` — a bare `return unwrap(...)` would hand the rejection to
    // the caller, bypassing this catch (return exits the try block).
    return await unwrap<WebUserProfileResponse>(api.GET("/web/user/profile"));
  } catch {
    return null;
  }
}

/** Public articles listing — no credentials, no cookies() (ISR-friendly). */
export async function getServerArticles(
  categoryId?: number,
  currentPage = 1,
  pageSize = 10,
  keyword?: string
): Promise<PageResult<WebArticleSummary>> {
  const api = createServerApi({ token: "", tokenName: "Authorization", refreshToken: null });
  return unwrap<PageResult<WebArticleSummary>>(
    api.GET("/web/articles", {
      params: { query: { categoryId, currentPage, pageSize, keyword } },
    })
  );
}

/** Public article detail — no credentials, no cookies() (ISR-friendly). */
export async function getServerArticle(slug: string): Promise<WebArticleDetail> {
  const api = createServerApi({ token: "", tokenName: "Authorization", refreshToken: null });
  return unwrap<WebArticleDetail>(
    api.GET("/web/articles/{slug}", { params: { path: { slug } } })
  );
}

/** Public category list — no credentials, no cookies() (ISR-friendly). */
export async function getServerCategories(): Promise<WebCategory[]> {
  const api = createServerApi({ token: "", tokenName: "Authorization", refreshToken: null });
  return unwrap<WebCategory[]>(api.GET("/web/categories"));
}

export async function getServerMyArticles(
  currentPage = 1,
  pageSize = 10
): Promise<PageResult<WebArticleSummary>> {
  const api = await serverApi();
  return unwrap<PageResult<WebArticleSummary>>(
    api.GET("/web/user/articles", { params: { query: { currentPage, pageSize } } })
  );
}

export async function getServerNotices(): Promise<WebNoticeResponse[]> {
  const api = await serverApi();
  return unwrap<WebNoticeResponse[]>(api.GET("/web/notices"));
}

export async function getServerOperationLogs(): Promise<WebOperationLogResponse[]> {
  const api = await serverApi();
  return unwrap<WebOperationLogResponse[]>(api.GET("/web/operation-logs"));
}

export async function getServerMetrics(): Promise<WebDashboardMetricsResponse> {
  const api = await serverApi();
  return unwrap<WebDashboardMetricsResponse>(api.GET("/web/dashboard/metrics"));
}
