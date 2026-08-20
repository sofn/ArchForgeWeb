import { httpClient } from "@/lib/http/client";
import type { WebDashboardMetricsResponse, WebNoticeResponse, WebOperationLogResponse } from "./types";

export async function getMetrics(): Promise<WebDashboardMetricsResponse> {
  return httpClient.get<WebDashboardMetricsResponse>("/web/dashboard/metrics");
}

export async function getNotices(): Promise<WebNoticeResponse[]> {
  return httpClient.get<WebNoticeResponse[]>("/web/notices");
}

export async function getOperationLogs(): Promise<WebOperationLogResponse[]> {
  return httpClient.get<WebOperationLogResponse[]>("/web/operation-logs");
}
