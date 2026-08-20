"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function ShareButtons({ title }: { title: string }) {
  const t = useTranslations("articles");

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title, url });
      return;
    }
    await navigator.clipboard.writeText(url);
  };

  return (
    <Button type="button" variant="outline" size="sm" onClick={share}>
      {t("share")}
    </Button>
  );
}
