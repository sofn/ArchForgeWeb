export const dynamic = "force-dynamic";

import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getArticle } from "@/lib/api";
import { Markdown } from "@/components/Markdown";
import { getLocale } from "@/lib/getLocale";
import Link from "next/link";
import { formatDateTime } from "@/lib/date";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, FolderOpen } from "lucide-react";

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
    <article className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/articles"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to articles
      </Link>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <Link
            href={`/articles?category=${encodeURIComponent(article.categorySlug)}`}
            className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 font-medium text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300"
          >
            <FolderOpen className="h-3.5 w-3.5" />
            {article.categoryName}
          </Link>
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {t("publishTime")}：{formatDateTime(article.publishTime)}
          </span>
        </div>

        <h1 className="text-3xl font-bold leading-tight md:text-5xl">{article.title}</h1>
      </div>

      {article.coverImageUrl ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-3xl shadow-lg">
          <Image
            src={article.coverImageUrl}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover"
            priority
          />
        </div>
      ) : null}

      {article.summary ? (
        <p className="rounded-2xl border-l-4 border-indigo-500 bg-white p-5 text-lg italic text-slate-700 shadow-sm dark:bg-slate-900">
          {article.summary}
        </p>
      ) : null}

      <div className="rounded-3xl bg-white p-6 shadow-sm md:p-10 dark:bg-slate-900">
        <Markdown content={article.content} />
      </div>
    </article>
  );
}
