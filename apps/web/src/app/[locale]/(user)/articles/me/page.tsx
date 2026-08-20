"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArticleCard } from "@/components/shared/ArticleCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMyArticles } from "@/lib/query/hooks";
import { useRouter } from "../../../../../../i18n/navigation";

export default function MyArticlesPage() {
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const query = useMyArticles(page, pageSize);
  const router = useRouter();
  const t = useTranslations("articles.myArticles");
  const articles = query.data?.list ?? [];
  const total = query.data?.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Button onClick={() => router.push("/write")}>{t("write")}</Button>
      </div>
      {query.isLoading ? (
        <p className="text-muted-foreground">{t("loading")}</p>
      ) : articles.length === 0 ? (
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
      <div className="flex justify-center gap-2">
        <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          {t("previous")}
        </Button>
        <Button variant="outline" disabled={page * pageSize >= total} onClick={() => setPage((p) => p + 1)}>
          {t("next")}
        </Button>
      </div>
    </div>
  );
}
