import { api, unwrap } from "@/lib/http/client";
import type {
  WebDashboardMetricsResponse,
  WebNoticeResponse,
  WebOperationLogResponse,
} from "./types";

export async function getMetrics(): Promise<WebDashboardMetricsResponse> {
  return unwrap<WebDashboardMetricsResponse>(api.GET("/web/dashboard/metrics"));
}

export async function getNotices(): Promise<WebNoticeResponse[]> {
  return unwrap<WebNoticeResponse[]>(api.GET("/web/notices"));
}

export async function getOperationLogs(): Promise<WebOperationLogResponse[]> {
  return unwrap<WebOperationLogResponse[]>(api.GET("/web/operation-logs"));
}
