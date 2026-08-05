"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getNotices,
  getOperationLogs,
  WebNoticeResponse,
  WebOperationLogResponse,
  formatDateTime
} from "@/lib/api";

export default function NotificationsPage() {
  const [notices, setNotices] = useState<WebNoticeResponse[]>([]);
  const [logs, setLogs] = useState<WebOperationLogResponse[]>([]);
  const t = useTranslations("notifications");

  useEffect(() => {
    Promise.all([getNotices(), getOperationLogs()]).then(([n, l]) => {
      setNotices(n);
      setLogs(l);
    });
  }, []);

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
              <div key={n.id} className="border-b last:border-0 pb-3 last:pb-0">
                <div className="font-medium">{n.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{n.content}</div>
                <div className="mt-1 text-xs text-muted-foreground">{formatDateTime(n.createTime)}</div>
              </div>
            ))}
            {notices.length === 0 && <p className="text-sm text-muted-foreground">{t("noNotices")}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("operationLogs")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {logs.map((l) => (
              <div key={l.id} className="border-b last:border-0 pb-3 last:pb-0">
                <div className="font-medium">{l.module}</div>
                <div className="text-sm text-muted-foreground">{l.summary}</div>
                <div className="text-xs text-muted-foreground">{l.username} · {formatDateTime(l.operatingTime)}</div>
              </div>
            ))}
            {logs.length === 0 && <p className="text-sm text-muted-foreground">{t("noLogs")}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
