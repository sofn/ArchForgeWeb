"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Lock, FileText, LogOut } from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const t = useTranslations("profile");

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
            {(user?.nickname || user?.username || "?")[0].toUpperCase()}
          </div>
          <div>
            <CardTitle>{user?.nickname || user?.username}</CardTitle>
            <p className="text-sm text-muted-foreground">{user?.username}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link
            href="/change-password"
            className="flex items-center gap-3 rounded-lg border p-3 hover:border-primary"
          >
            <Lock className="h-5 w-5" /> {t("changePassword")}
          </Link>
          <Link
            href="/articles/me"
            className="flex items-center gap-3 rounded-lg border p-3 hover:border-primary"
          >
            <FileText className="h-5 w-5" /> {t("myArticles")}
          </Link>
          <Button variant="outline" onClick={logout} className="w-full justify-start gap-3">
            <LogOut className="h-5 w-5" /> {t("logout")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
