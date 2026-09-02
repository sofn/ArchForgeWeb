import { readServerAuth, serverApi } from "@/lib/http/server";
import { unwrap } from "@/lib/http/shared";
import type {
  PageResult,
  WebArticleSummary,
  WebDashboardMetricsResponse,
  WebNoticeResponse,
  WebOperationLogResponse,
  WebUserProfileResponse,
} from "./types";

/**
 * Server-side data layer for React Server Components.
 *
 * Thin authenticated wrappers around the schema-typed API. Mirrors the shape of
 * `lib/api/{user,articles}.ts` but routes through the request-scoped server
 * client (cookie credentials), so RSC pages fetch with the sa-token header.
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
