import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getServerArticle } from "@/lib/api/server";
import { getSiteUrl, localeAlternates } from "@/lib/site";
import { Markdown } from "@/components/shared/Markdown";
import { ShareButtons } from "@/components/shared/ShareButtons";
import { formatDateTime } from "@/lib/date";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, FolderOpen } from "lucide-react";
import { Link } from "@/i18n/navigation";

export const revalidate = 60;

interface ArticlePageProps {
  params: Promise<{ slug: string; locale: string }>;
}

async function loadArticle(slug: string) {
  try {
    return await getServerArticle(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const article = await loadArticle(slug);
  if (!article) return {};
  const site = getSiteUrl();
  const path = `/${locale}/articles/${encodeURIComponent(slug)}`;
  const description = article.summary || article.title;
  const images = article.coverImageUrl
    ? [article.coverImageUrl]
    : [`${site}/api/og?title=${encodeURIComponent(article.title)}`];
  return {
    title: article.title,
    description,
    alternates: {
      canonical: `${site}${path}`,
      languages: localeAlternates(`/articles/${encodeURIComponent(slug)}`),
    },
    openGraph: {
      title: article.title,
      description,
      type: "article",
      publishedTime: article.publishTime,
      images,
    },
    // X/Twitter, Discord, Slack and WeChat card previews — OG alone only
    // renders on a subset of them.
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const t = await getTranslations("articles");
  const article = await loadArticle(slug);
  if (!article) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    datePublished: article.publishTime,
    dateCreated: article.createTime,
    image: article.coverImageUrl || undefined,
  };

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Link
        href="/articles"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600"
      >
        <ArrowLeft className="h-4 w-4" /> {t("back")}
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
            {t("publishTime")}
            {t("colon")}
            {formatDateTime(article.publishTime)}
          </span>
          <ShareButtons title={article.title} />
        </div>

        <h1 className="text-3xl leading-tight font-bold md:text-5xl">{article.title}</h1>
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
        <p className="rounded-2xl border-l-4 border-indigo-500 bg-white p-5 text-lg text-slate-700 italic shadow-sm dark:bg-slate-900">
          {article.summary}
        </p>
      ) : null}

      <div className="rounded-3xl bg-white p-6 shadow-sm md:p-10 dark:bg-slate-900">
        <Markdown content={article.content} />
      </div>
    </article>
  );
}
