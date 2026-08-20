"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "../../../../../i18n/navigation";

export function ArticlesSearchForm({ category, q }: { category?: string; q?: string }) {
  const t = useTranslations("articles");
  const router = useRouter();

  return (
    <form
      className="mt-6 max-w-xl"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const keyword = String(form.get("q") ?? "").trim();
        const params = new URLSearchParams();
        if (category) params.set("category", category);
        if (keyword) params.set("q", keyword);
        const qs = params.toString();
        router.push(qs ? `/articles?${qs}` : "/articles");
      }}
    >
      <div className="flex gap-2">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder={t("searchPlaceholder")}
          className="h-11 flex-1 rounded-xl border border-white/20 bg-white/10 px-4 text-sm text-white placeholder:text-slate-300"
        />
        <button type="submit" className="rounded-xl bg-indigo-500 px-4 text-sm font-medium text-white">
          {t("search")}
        </button>
      </div>
    </form>
  );
}
