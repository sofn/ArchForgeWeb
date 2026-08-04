"use client";

import { useEffect, useState } from "react";
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
  formatDateTime
} from "@/lib/api";
import { RefreshCw, Bell, FileText, PenLine, User } from "lucide-react";
import Link from "next/link";

function MetricCard({ title, value, isLoading }: { title: string; value?: number; isLoading?: boolean }) {
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
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [m, n, l] = await Promise.all([getMetrics(), getNotices(), getOperationLogs()]);
      setMetrics(m);
      setNotices(n);
      setLogs(l);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "早上好";
    if (hour < 18) return "下午好";
    return "晚上好";
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-10 text-white md:px-12">
        <h1 className="text-3xl font-bold md:text-4xl">
          {greeting()}，{user?.nickname || user?.username || "访客"}
        </h1>
        <p className="mt-2 text-white/90">欢迎来到 ArchForgeWeb C 端仪表盘</p>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">运营指标</h2>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            刷新
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="用户总数" value={metrics?.userTotal} isLoading={loading} />
          <MetricCard title="在线人数" value={metrics?.onlineNow} isLoading={loading} />
          <MetricCard title="今日登录" value={metrics?.todayLogin} isLoading={loading} />
          <MetricCard title="今日操作" value={metrics?.todayOperation} isLoading={loading} />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">快捷入口</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Link href="/notifications" className="flex items-center gap-3 rounded-xl border border-border bg-white p-4 hover:border-primary hover:text-primary">
            <Bell className="h-5 w-5" /> <span>通知中心</span>
          </Link>
          <Link href="/articles" className="flex items-center gap-3 rounded-xl border border-border bg-white p-4 hover:border-primary hover:text-primary">
            <FileText className="h-5 w-5" /> <span>全部文章</span>
          </Link>
          <Link href="/write" className="flex items-center gap-3 rounded-xl border border-border bg-white p-4 hover:border-primary hover:text-primary">
            <PenLine className="h-5 w-5" /> <span>写文章</span>
          </Link>
          <Link href="/profile" className="flex items-center gap-3 rounded-xl border border-border bg-white p-4 hover:border-primary hover:text-primary">
            <User className="h-5 w-5" /> <span>个人中心</span>
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>最新通知</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notices.slice(0, 5).map((n) => (
              <div key={n.id} className="border-b last:border-0 pb-2 last:pb-0">
                <div className="font-medium">{n.title}</div>
                <div className="text-xs text-muted-foreground">{formatDateTime(n.createTime)}</div>
              </div>
            ))}
            {notices.length === 0 && <p className="text-sm text-muted-foreground">暂无通知</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>最近操作日志</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {logs.slice(0, 5).map((l) => (
              <div key={l.id} className="border-b last:border-0 pb-2 last:pb-0">
                <div className="font-medium">{l.module}：{l.summary}</div>
                <div className="text-xs text-muted-foreground">{l.username} · {formatDateTime(l.operatingTime)}</div>
              </div>
            ))}
            {logs.length === 0 && <p className="text-sm text-muted-foreground">暂无日志</p>}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
