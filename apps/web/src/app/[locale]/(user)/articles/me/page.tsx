import { getTranslations } from "next-intl/server";
import { ArticleCard } from "@/components/shared/ArticleCard";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/shared/Pagination";
import { getServerMyArticles } from "@/lib/api/server";
import { Link } from "../../../../../../i18n/navigation";

/**
 * Server component (was "use client" with react-query): pagination moves from
 * useState to the URL (searchParams), data is fetched server-side with the
 * auth cookie, and the shared link-based Pagination client component keeps
 * navigation instant. loading.tsx streams the shell while RSC fetches.
 */

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function MyArticlesPage({ searchParams }: Props) {
  const { page: pageRaw } = await searchParams;
  const page = Math.max(1, Number(pageRaw) || 1);
  const pageSize = 12;

  const data = await getServerMyArticles(page, pageSize);
  const articles = data?.list ?? [];
  const total = data?.total ?? 0;

  const t = await getTranslations("articles.myArticles");
  const hrefFor = (nextPage: number) => `/articles/me?page=${nextPage}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Link href="/write" className={buttonVariants()}>
          {t("write")}
        </Link>
      </div>
      {articles.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-12 text-center">{t("empty")}</CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
      <Pagination page={page} pageSize={pageSize} total={total} hrefFor={hrefFor} />
    </div>
  );
}
