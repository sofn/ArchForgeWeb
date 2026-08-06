export const dynamic = "force-dynamic";

import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getArticle } from "@/lib/api";
import { Markdown } from "@/components/Markdown";
import { getLocale } from "@/lib/getLocale";
import Link from "next/link";
import { formatDateTime } from "@/lib/date";
import { notFound } from "next/navigation";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "articles" });
  let article;
  try {
    article = await getArticle(slug);
  } catch {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl">
      <Link
        href={`/articles?category=${encodeURIComponent(article.categorySlug)}`}
        className="text-primary text-sm font-medium hover:underline"
      >
        {article.categoryName}
      </Link>
      <h1 className="mt-2 text-3xl font-bold md:text-4xl">{article.title}</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        {t("publishTime")}：{formatDateTime(article.publishTime)}
      </p>
      {article.coverImageUrl ? (
        <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-xl">
          <Image
            src={article.coverImageUrl}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover"
            unoptimized
            priority
          />
        </div>
      ) : null}
      {article.summary ? (
        <p className="border-primary mt-6 rounded-lg border-l-4 bg-slate-100 p-4 text-slate-700">
          {article.summary}
        </p>
      ) : null}
      <div className="mt-8">
        <Markdown content={article.content} />
      </div>
    </article>
  );
}
