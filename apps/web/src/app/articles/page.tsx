export const dynamic = "force-dynamic";

import { getCategories, getArticles } from "@/lib/api";
import { ArticleCard } from "@/components/ArticleCard";
import Link from "next/link";

export default async function ArticlesPage({
  searchParams
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const categories = await getCategories();
  const categoryId = category ? categories.find((c) => c.slug === category)?.id : undefined;
  const articlePage = await getArticles(categoryId, 1, 24);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">全部文章</h1>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/articles"
          className={`rounded-full px-4 py-2 text-sm font-medium border ${
            !category ? "bg-primary text-primary-foreground border-primary" : "bg-white hover:border-primary"
          }`}
        >
          全部
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/articles?category=${encodeURIComponent(c.slug)}`}
            className={`rounded-full px-4 py-2 text-sm font-medium border ${
              category === c.slug ? "bg-primary text-primary-foreground border-primary" : "bg-white hover:border-primary"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {articlePage.list.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
