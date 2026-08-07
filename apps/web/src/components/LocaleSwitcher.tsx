"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface LocaleSwitcherProps {
  className?: string;
}

export function LocaleSwitcher({ className }: LocaleSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("locale");

  const switchLocale = () => {
    const next = locale === "en" ? "zh" : "en";
    document.cookie = `NEXT_LOCALE=${next}; path=/; SameSite=Lax`;
    router.refresh();
  };

  return (
    <button
      onClick={switchLocale}
      className={cn("text-sm font-medium transition-colors", className)}
      aria-label={t("switch")}
    >
      {locale === "en" ? "中文" : "English"}
    </button>
  );
}
