"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/date";
import { useNotices, useOperationLogs } from "@/lib/query/hooks";

export default function NotificationsPage() {
  const noticesQuery = useNotices();
  const logsQuery = useOperationLogs();
  const t = useTranslations("notifications");
  const notices = noticesQuery.data ?? [];
  const logs = logsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("systemNotices")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {notices.map((n) => (
              <div key={n.id} className="border-b pb-3 last:border-0 last:pb-0">
                <div className="font-medium">{n.title}</div>
                <div className="text-muted-foreground mt-1 text-sm">{n.content}</div>
                <div className="text-muted-foreground mt-1 text-xs">{formatDateTime(n.createTime)}</div>
              </div>
            ))}
            {notices.length === 0 && <p className="text-muted-foreground text-sm">{t("noNotices")}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("operationLogs")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {logs.map((l) => (
              <div key={l.id} className="border-b pb-3 last:border-0 last:pb-0">
                <div className="font-medium">{l.module}</div>
                <div className="text-muted-foreground text-sm">{l.summary}</div>
                <div className="text-muted-foreground text-xs">
                  {l.username} · {formatDateTime(l.operatingTime)}
                </div>
              </div>
            ))}
            {logs.length === 0 && <p className="text-muted-foreground text-sm">{t("noLogs")}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
