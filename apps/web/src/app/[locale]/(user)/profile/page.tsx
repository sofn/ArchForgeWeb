"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { uploadImage } from "@/lib/api";
import { Lock, FileText, LogOut } from "lucide-react";
import { Link } from "../../../../../i18n/navigation";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const t = useTranslations("profile");
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(user?.avatar || "");
  const [note, setNote] = useState("");

  const displayName = user?.nickname || user?.username || t("title");
  const initial = displayName.charAt(0).toUpperCase();

  const handleUpload = async (file: File) => {
    const res = await uploadImage(file);
    setPreview(res.url);
    setNote(t("avatarDemo"));
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center gap-4 border-b border-slate-100 bg-slate-50/50 pb-6 dark:border-slate-800 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-600 text-2xl font-bold text-white shadow-md"
            aria-label={t("uploadAvatar")}
          >
            {preview ? (
              <Image src={preview} alt={displayName} fill sizes="64px" className="object-cover" />
            ) : (
              initial
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleUpload(file);
            }}
          />
          <div>
            <h2 className="text-lg font-semibold">{displayName}</h2>
            <p className="text-muted-foreground text-sm">{user?.username}</p>
            {note ? <p className="mt-1 text-xs text-amber-600">{note}</p> : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-6">
          <Link
            href="/change-password"
            className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition-colors hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-800"
          >
            <Lock className="h-5 w-5 text-indigo-600" /> {t("changePassword")}
          </Link>
          <Link
            href="/articles/me"
            className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition-colors hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-800"
          >
            <FileText className="h-5 w-5 text-indigo-600" /> {t("myArticles")}
          </Link>
          <Button
            variant="outline"
            onClick={logout}
            className="w-full justify-start gap-3 rounded-xl border-slate-200 hover:border-red-300 hover:bg-red-50 dark:border-slate-800"
          >
            <LogOut className="h-5 w-5 text-red-600" /> {t("logout")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
