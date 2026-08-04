export const dynamic = "force-dynamic";

import { getArticle } from "@/lib/api";
import { Markdown } from "@/components/Markdown";
import Link from "next/link";
import { formatDateTime } from "@/lib/api";
import { notFound } from "next/navigation";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
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
        className="text-sm font-medium text-primary hover:underline"
      >
        {article.categoryName}
      </Link>
      <h1 className="mt-2 text-3xl font-bold md:text-4xl">{article.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">发布时间：{formatDateTime(article.publishTime)}</p>
      {article.coverImageUrl ? (
        <img src={article.coverImageUrl} alt={article.title} className="mt-6 w-full rounded-xl object-cover" />
      ) : null}
      {article.summary ? (
        <p className="mt-6 rounded-lg border-l-4 border-primary bg-slate-100 p-4 text-slate-700">
          {article.summary}
        </p>
      ) : null}
      <div className="mt-8">
        <Markdown content={article.content} />
      </div>
    </article>
  );
}
