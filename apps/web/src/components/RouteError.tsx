"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RouteError({ error, reset }: RouteErrorProps) {
  const t = useTranslations("errors");
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h2 className="text-2xl font-bold text-red-600">{t("title")}</h2>
      <p className="text-muted-foreground mt-2 max-w-md text-center">
        {error.message || t("description")}
      </p>
      <Button onClick={reset} className="mt-6" variant="outline">
        {t("retry")}
      </Button>
    </div>
  );
}
