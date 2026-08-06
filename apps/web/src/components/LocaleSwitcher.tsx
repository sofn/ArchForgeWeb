"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export function LocaleSwitcher() {
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
      className="text-foreground hover:text-primary text-sm font-medium"
      aria-label={t("switch")}
    >
      {locale === "en" ? "中文" : "English"}
    </button>
  );
}
