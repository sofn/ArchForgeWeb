"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "../../../../i18n/navigation";

/**
 * Client island: re-runs the server components on this page (server data is
 * fetched during RSC render, so refresh = router.refresh, not a client
 * refetch). This is what replaces the react-query refetch from the old
 * all-client homepage.
 */
export function RefreshButton() {
  const t = useTranslations("home");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [spinning, setSpinning] = useState(false);
  const loading = isPending || spinning;

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={loading}
      onClick={() => {
        setSpinning(true);
        startTransition(() => {
          router.refresh();
        });
        // Keep the icon spinning briefly even after the transition resolves —
        // server components stream in via Suspense boundaries.
        setTimeout(() => setSpinning(false), 600);
      }}
    >
      <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      {t("refresh")}
    </Button>
  );
}
