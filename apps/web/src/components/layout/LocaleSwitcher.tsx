"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "../../../i18n/navigation";
import { cn } from "@/lib/utils";

interface LocaleSwitcherProps {
  className?: string;
}

export function LocaleSwitcher({ className }: LocaleSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("locale");

  const switchLocale = () => {
    const next = locale === "en" ? "zh" : "en";
    router.replace(pathname, { locale: next });
  };

  return (
    <button
      type="button"
      onClick={switchLocale}
      className={cn("text-sm font-medium transition-colors", className)}
      aria-label={t("switch")}
    >
      {locale === "en" ? "中文" : "English"}
    </button>
  );
}
