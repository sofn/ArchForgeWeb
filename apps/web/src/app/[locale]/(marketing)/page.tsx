import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Bell, FileText, PenLine, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/date";
import { readServerAuth } from "@/lib/http/server";
import {
  getServerMetrics,
  getServerNotices,
  getServerOperationLogs,
  getServerProfile,
} from "@/lib/api/server";
import { getSiteUrl, localeAlternates } from "@/lib/site";
import type {
  WebDashboardMetricsResponse,
  WebNoticeResponse,
  WebOperationLogResponse,
} from "@/lib/api/types";
import { Link } from "@/i18n/navigation";
import { Greeting } from "./Greeting";
import { RefreshButton } from "./RefreshButton";

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 * Homepage SEO metadata (the page is a server component since the RSC fix, so
 * this is finally reachable): custom title/description, canonical, hreflang
 * alternates and an OG card rendered by /api/og.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const site = getSiteUrl();
  const title = t("homeTitle");
  const description = t("homeDescription");
  const url = `${site}/${locale}`;
  const ogImage = `${site}/api/og?title=${encodeURIComponent(title)}`;
  return {
    // absolute — the layout's `%s · site` template would duplicate the brand
    // segment that homeTitle already carries.
    title: { absolute: title },
    description,
    alternates: {
      canonical: url,
      languages: localeAlternates(),
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "ArchForgeWeb",
      locale,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

/**
 * Server component (was "use client"): the homepage renders fully on the
 * server. Auth state comes from request cookies via the server http client,
 * so dashboard data (metrics/notices/logs) is fetched with the sa-token
 * header during SSR instead of after hydration. SEO/first-paint win for the
 * public hero; interactive bits (greeting clock, refresh) stay client islands.
 */

function MetricCard({ title, value }: { title: string; value?: number }) {
  return (
    <Card className="border-none bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-slate-900">
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value ?? 0}</div>
      </CardContent>
    </Card>
  );
}

export default async function HomePage() {
  const t = await getTranslations("home");
  const auth = await readServerAuth();
  const user = auth.token ? await getServerProfile() : null;

  // Dashboard data is fetched server-side (with the auth cookie). Any failure
  // degrades gracefully: the sections render empty states + one error line,
  // instead of taking the whole public homepage down.
  let metrics: WebDashboardMetricsResponse | null = null;
  let notices: WebNoticeResponse[] = [];
  let logs: WebOperationLogResponse[] = [];
  let errorMessage: string | null = null;
  if (auth.token) {
    const [metricsRes, noticesRes, logsRes] = await Promise.allSettled([
      getServerMetrics(),
      getServerNotices(),
      getServerOperationLogs(),
    ]);
    const firstReason =
      metricsRes.status === "rejected"
        ? metricsRes.reason
        : noticesRes.status === "rejected"
          ? noticesRes.reason
          : logsRes.status === "rejected"
            ? logsRes.reason
            : null;
    if (firstReason instanceof Error) {
      errorMessage = firstReason.message;
    } else if (firstReason) {
      errorMessage = t("error");
    }
    if (metricsRes.status === "fulfilled") metrics = metricsRes.value;
    if (noticesRes.status === "fulfilled") notices = noticesRes.value;
    if (logsRes.status === "fulfilled") logs = logsRes.value;
  }

  const quickLinks = auth.token
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
        <Greeting name={user?.nickname || user?.username} />
        <p className="mt-3 max-w-xl text-lg text-white/90">{t("welcome")}</p>
      </section>

      {auth.token && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t("metrics_title")}</h2>
            <RefreshButton />
          </div>
          {errorMessage && (
            <p className="mb-4 text-sm text-red-600">{errorMessage}</p>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard title={t("userTotal")} value={metrics?.userTotal} />
            <MetricCard title={t("onlineNow")} value={metrics?.onlineNow} />
            <MetricCard title={t("todayLogin")} value={metrics?.todayLogin} />
            <MetricCard title={t("todayOperation")} value={metrics?.todayOperation} />
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

      {auth.token && (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="border-none bg-white shadow-sm dark:bg-slate-900">
            <CardHeader>
              <CardTitle>{t("latestNotices")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {notices.slice(0, 5).map((n) => (
                <div key={n.id} className="border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                  <div className="font-medium">{n.title}</div>
                  <div className="text-muted-foreground text-xs">{formatDateTime(n.createTime)}</div>
                </div>
              ))}
              {notices.length === 0 && (
                <p className="text-muted-foreground text-sm">{t("noNotices")}</p>
              )}
            </CardContent>
          </Card>
          <Card className="border-none bg-white shadow-sm dark:bg-slate-900">
            <CardHeader>
              <CardTitle>{t("latestLogs")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {logs.slice(0, 5).map((l) => (
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
              {logs.length === 0 && (
                <p className="text-muted-foreground text-sm">{t("noLogs")}</p>
              )}
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
