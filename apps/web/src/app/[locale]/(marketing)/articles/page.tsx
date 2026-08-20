import { getTranslations } from "next-intl/server";
import { getCategories, getArticles } from "@/lib/api";
import { ArticleCard } from "@/components/shared/ArticleCard";
import { Pagination } from "@/components/shared/Pagination";
import { ArticlesSearchForm } from "./ArticlesSearchForm";
import { Link } from "../../../../../i18n/navigation";

export const revalidate = 60;

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
}) {
  const { category, q, page: pageRaw } = await searchParams;
  const page = Math.max(1, Number(pageRaw) || 1);
  const pageSize = 12;
  const categories = await getCategories();
  const categoryId = category ? categories.find((c) => c.slug === category)?.id : undefined;
  const articlePage = await getArticles(categoryId, page, pageSize, q);
  const t = await getTranslations("articles");

  const hrefFor = (nextPage: number) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (q) params.set("q", q);
    if (nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    return qs ? `/articles?${qs}` : "/articles";
  };

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 px-6 py-12 text-white md:px-12">
        <h1 className="text-3xl font-bold md:text-4xl">{t("title")}</h1>
        <p className="mt-3 max-w-2xl text-slate-300">{t("hero")}</p>
        <ArticlesSearchForm category={category} q={q} />
      </section>

      <div className="sticky top-20 z-30 -mx-4 bg-[var(--background)]/90 px-4 py-3 backdrop-blur">
        <div className="flex flex-wrap gap-3">
          <Link
            href={q ? `/articles?q=${encodeURIComponent(q)}` : "/articles"}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              !category
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-slate-200 bg-white hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900"
            }`}
          >
            {t("all")}
          </Link>
          {categories.map((c) => {
            const params = new URLSearchParams({ category: c.slug });
            if (q) params.set("q", q);
            return (
              <Link
                key={c.id}
                href={`/articles?${params.toString()}`}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  category === c.slug
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-slate-200 bg-white hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900"
                }`}
              >
                {c.name}
              </Link>
            );
          })}
        </div>
      </div>

      {articlePage.list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 py-20 text-center">
          <p className="text-muted-foreground">{t("myArticles.empty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {articlePage.list.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}

      <Pagination page={page} pageSize={pageSize} total={articlePage.total} hrefFor={hrefFor} />
    </div>
  );
}
