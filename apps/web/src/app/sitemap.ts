import type { MetadataRoute } from "next";
import { getServerArticles } from "@/lib/api/server";
import { getSiteUrl } from "@/lib/site";
import { LOCALES } from "@/lib/routes";

/**
 * Sitemap: static paths + ALL published articles (paginated traversal, not a
 * single 100-row page), every URL carrying hreflang alternates for en/zh.
 *
 * Fault tolerance is per page: a single flaky page is skipped and the walk
 * continues; two consecutive failures mean the API is down and we ship what we
 * already collected (static paths + earlier pages) instead of nothing.
 */

const ARTICLES_PAGE_SIZE = 100;
/** Safety valve — 50 pages × 100/page = 5k articles before manual review. */
const MAX_ARTICLE_PAGES = 50;
/** Google's hard limit is 50k URLs per file; stay clear of it. */
const MAX_ENTRIES = 45000;
/** Give a flaky API one retry page before declaring it down. */
const MAX_CONSECUTIVE_PAGE_FAILURES = 2;

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getSiteUrl();
  const entries: MetadataRoute.Sitemap = [];

  const addPath = (
    path: string,
    opts: Omit<MetadataRoute.Sitemap[number], "url" | "alternates">
  ) => {
    const languages: Record<string, string> = {};
    for (const locale of LOCALES) {
      languages[locale] = `${site}/${locale}${path}`;
    }
    // One entry per locale, each listing every language variant (including
    // itself) — the xhtml:link hreflang shape crawlers expect.
    for (const locale of LOCALES) {
      entries.push({ url: languages[locale], alternates: { languages }, ...opts });
    }
  };

  addPath("", { changeFrequency: "daily", priority: 1 });
  addPath("/articles", { changeFrequency: "daily", priority: 0.8 });

  let page = 1;
  let consecutiveFailures = 0;
  while (page <= MAX_ARTICLE_PAGES && entries.length < MAX_ENTRIES) {
    try {
      const result = await getServerArticles(undefined, page, ARTICLES_PAGE_SIZE, undefined, {
        revalidate: 3600,
        tags: ["articles"],
      });
      consecutiveFailures = 0;
      const total = result.total ?? 0;
      for (const article of result.list ?? []) {
        addPath(`/articles/${encodeURIComponent(article.slug)}`, {
          lastModified: article.publishTime ? new Date(article.publishTime) : undefined,
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }
      if (page * ARTICLES_PAGE_SIZE >= total) break;
    } catch {
      consecutiveFailures += 1;
      if (consecutiveFailures >= MAX_CONSECUTIVE_PAGE_FAILURES) break;
      // single page failure → skip it, try the next one
    }
    page += 1;
  }

  return entries;
}
