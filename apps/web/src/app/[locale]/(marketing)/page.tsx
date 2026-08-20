"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/date";
import { useMetrics, useNotices, useOperationLogs } from "@/lib/query/hooks";
import { RefreshCw, Bell, FileText, PenLine, User } from "lucide-react";
import { Link } from "../../../../i18n/navigation";

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
    <Card className="border-none bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-slate-900">
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
  const { token, user } = useAuth();
  const enabled = Boolean(token);
  const metricsQuery = useMetrics(enabled);
  const noticesQuery = useNotices(enabled);
  const logsQuery = useOperationLogs(enabled);
  const t = useTranslations("home");
  const loading = metricsQuery.isFetching || noticesQuery.isFetching || logsQuery.isFetching;
  const error = metricsQuery.error || noticesQuery.error || logsQuery.error;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("greeting_morning");
    if (hour < 18) return t("greeting_afternoon");
    return t("greeting_evening");
  };

  const quickLinks = token
    ? [
        { href: "/notifications", icon: Bell, label: t("notifications") },
        { href: "/articles", icon: FileText, label: t("allArticles") },
        { href: "/write", icon: PenLine, label: t("write") },
        { href: "/profile", icon: User, label: t("profile") },
      ]
    : [
        { href: "/articles", icon: FileText, label: t("allArticles") },
        { href: "/login", icon: User, label: t("profile") },
      ];

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-12 text-white md:px-12 md:py-16">
        <h1 className="text-3xl font-bold md:text-5xl">
          {greeting()}
          {t("colon")}
          {user?.nickname || user?.username || t("guest")}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-white/90">{t("welcome")}</p>
      </section>

      {token && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t("metrics_title")}</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void metricsQuery.refetch();
                void noticesQuery.refetch();
                void logsQuery.refetch();
              }}
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {t("refresh")}
            </Button>
          </div>
          {error && (
            <p className="mb-4 text-sm text-red-600">
              {error instanceof Error ? error.message : t("error")}
            </p>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard title={t("userTotal")} value={metricsQuery.data?.userTotal} isLoading={metricsQuery.isLoading} />
            <MetricCard title={t("onlineNow")} value={metricsQuery.data?.onlineNow} isLoading={metricsQuery.isLoading} />
            <MetricCard title={t("todayLogin")} value={metricsQuery.data?.todayLogin} isLoading={metricsQuery.isLoading} />
            <MetricCard
              title={t("todayOperation")}
              value={metricsQuery.data?.todayOperation}
              isLoading={metricsQuery.isLoading}
            />
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-xl font-semibold">{t("quickLinks_title")}</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-950 dark:group-hover:bg-indigo-500">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {token && (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="border-none bg-white shadow-sm dark:bg-slate-900">
            <CardHeader>
              <CardTitle>{t("latestNotices")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(noticesQuery.data ?? []).slice(0, 5).map((n) => (
                <div key={n.id} className="border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                  <div className="font-medium">{n.title}</div>
                  <div className="text-muted-foreground text-xs">{formatDateTime(n.createTime)}</div>
                </div>
              ))}
              {(noticesQuery.data?.length ?? 0) === 0 && (
                <p className="text-muted-foreground text-sm">{t("noNotices")}</p>
              )}
            </CardContent>
          </Card>
          <Card className="border-none bg-white shadow-sm dark:bg-slate-900">
            <CardHeader>
              <CardTitle>{t("latestLogs")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(logsQuery.data ?? []).slice(0, 5).map((l) => (
                <div key={l.id} className="border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                  <div className="font-medium">
                    {l.module}
                    {t("colon")}
                    {l.summary}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {l.username} · {formatDateTime(l.operatingTime)}
                  </div>
                </div>
              ))}
              {(logsQuery.data?.length ?? 0) === 0 && (
                <p className="text-muted-foreground text-sm">{t("noLogs")}</p>
              )}
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
