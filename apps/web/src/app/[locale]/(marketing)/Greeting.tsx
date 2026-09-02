"use client";

import { useTranslations } from "next-intl";

/**
 * Client island: time-based greeting must use the visitor's local clock.
 * Rendering it on the server would greet users in the server's timezone.
 */
export function Greeting({ name }: { name?: string | null }) {
  const t = useTranslations("home");
  const hour = new Date().getHours();
  const greet = hour < 12 ? t("greeting_morning") : hour < 18 ? t("greeting_afternoon") : t("greeting_evening");

  return (
    <h1 className="text-3xl font-bold md:text-5xl">
      {greet}
      {t("colon")}
      {name || t("guest")}
    </h1>
  );
}
