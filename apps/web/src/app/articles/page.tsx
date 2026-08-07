export const dynamic = "force-dynamic";

import { getTranslations } from "next-intl/server";
import { getCategories, getArticles } from "@/lib/api";
import { ArticleCard } from "@/components/ArticleCard";
import { getLocale } from "@/lib/getLocale";
import Link from "next/link";

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const categories = await getCategories();
  const categoryId = category ? categories.find((c) => c.slug === category)?.id : undefined;
  const articlePage = await getArticles(categoryId, 1, 24);
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "articles" });

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 px-6 py-12 text-white md:px-12">
        <h1 className="text-3xl font-bold md:text-4xl">{t("title")}</h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          Explore the latest articles and insights from the community.
        </p>
      </section>

      <div className="sticky top-20 z-30 -mx-4 bg-[var(--background)]/90 px-4 py-3 backdrop-blur">
        <div className="flex flex-wrap gap-3">
          <Link
            href="/articles"
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              !category
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-slate-200 bg-white hover:border-indigo-300 hover:text-indigo-600"
            }`}
          >
            {t("all")}
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/articles?category=${encodeURIComponent(c.slug)}`}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                category === c.slug
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-200 bg-white hover:border-indigo-300 hover:text-indigo-600"
              }`}
            >
              {c.name}
            </Link>
          ))}
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
    </div>
  );
}
