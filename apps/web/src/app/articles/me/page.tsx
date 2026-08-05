"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import { getMyArticles, WebArticleSummary } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function MyArticlesPage() {
  const [page, setPage] = useState(1);
  const [articles, setArticles] = useState<WebArticleSummary[]>([]);
  const [total, setTotal] = useState(0);
  const pageSize = 12;
  const router = useRouter();
  const t = useTranslations("articles.myArticles");

  useEffect(() => {
    getMyArticles(page, pageSize).then((r) => {
      setArticles(r.list);
      setTotal(r.total);
    });
  }, [page]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Button onClick={() => router.push("/write")}>{t("write")}</Button>
      </div>
      {articles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t("empty")}
          </CardContent>
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
