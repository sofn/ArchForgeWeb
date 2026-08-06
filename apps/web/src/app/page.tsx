"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getMetrics,
  getNotices,
  getOperationLogs,
  WebDashboardMetricsResponse,
  WebNoticeResponse,
  WebOperationLogResponse,
} from "@/lib/api";
import { formatDateTime } from "@/lib/date";
import { RefreshCw, Bell, FileText, PenLine, User } from "lucide-react";
import Link from "next/link";

function MetricCard({
  title,
  value,
  isLoading,
}: {
  title: string;
  value?: number;
  isLoading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{isLoading ? "-" : (value ?? 0)}</div>
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<WebDashboardMetricsResponse | null>(null);
  const [notices, setNotices] = useState<WebNoticeResponse[]>([]);
  const [logs, setLogs] = useState<WebOperationLogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("home");

  const fetchData = async () => {
    try {
      const [m, n, l] = await Promise.all([getMetrics(), getNotices(), getOperationLogs()]);
      setMetrics(m);
      setNotices(n);
      setLogs(l);
    } finally {
      setLoading(false);
    }
  };

  const load = () => {
    setLoading(true);
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("greeting_morning");
    if (hour < 18) return t("greeting_afternoon");
    return t("greeting_evening");
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-10 text-white md:px-12">
        <h1 className="text-3xl font-bold md:text-4xl">
          {greeting()}，{user?.nickname || user?.username || t("guest")}
        </h1>
        <p className="mt-2 text-white/90">{t("welcome")}</p>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t("metrics_title")}</h2>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {t("refresh")}
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard title={t("userTotal")} value={metrics?.userTotal} isLoading={loading} />
          <MetricCard title={t("onlineNow")} value={metrics?.onlineNow} isLoading={loading} />
          <MetricCard title={t("todayLogin")} value={metrics?.todayLogin} isLoading={loading} />
          <MetricCard
            title={t("todayOperation")}
            value={metrics?.todayOperation}
            isLoading={loading}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">{t("quickLinks_title")}</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Link
            href="/notifications"
            className="border-border hover:border-primary hover:text-primary flex items-center gap-3 rounded-xl border bg-white p-4"
          >
            <Bell className="h-5 w-5" /> <span>{t("notifications")}</span>
          </Link>
          <Link
            href="/articles"
            className="border-border hover:border-primary hover:text-primary flex items-center gap-3 rounded-xl border bg-white p-4"
          >
            <FileText className="h-5 w-5" /> <span>{t("allArticles")}</span>
          </Link>
          <Link
            href="/write"
            className="border-border hover:border-primary hover:text-primary flex items-center gap-3 rounded-xl border bg-white p-4"
          >
            <PenLine className="h-5 w-5" /> <span>{t("write")}</span>
          </Link>
          <Link
            href="/profile"
            className="border-border hover:border-primary hover:text-primary flex items-center gap-3 rounded-xl border bg-white p-4"
          >
            <User className="h-5 w-5" /> <span>{t("profile")}</span>
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("latestNotices")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notices.slice(0, 5).map((n) => (
              <div key={n.id} className="border-b pb-2 last:border-0 last:pb-0">
                <div className="font-medium">{n.title}</div>
                <div className="text-muted-foreground text-xs">{formatDateTime(n.createTime)}</div>
              </div>
            ))}
            {notices.length === 0 && (
              <p className="text-muted-foreground text-sm">{t("noNotices")}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("latestLogs")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {logs.slice(0, 5).map((l) => (
              <div key={l.id} className="border-b pb-2 last:border-0 last:pb-0">
                <div className="font-medium">
                  {l.module}：{l.summary}
                </div>
                <div className="text-muted-foreground text-xs">
                  {l.username} · {formatDateTime(l.operatingTime)}
                </div>
              </div>
            ))}
            {logs.length === 0 && <p className="text-muted-foreground text-sm">{t("noLogs")}</p>}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
