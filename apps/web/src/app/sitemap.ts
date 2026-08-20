import type { MetadataRoute } from "next";
import { getArticles } from "@/lib/api";
import { LOCALES } from "@/lib/routes";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const staticPaths = ["", "/articles"];
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of LOCALES) {
    for (const path of staticPaths) {
      entries.push({
        url: `${site}/${locale}${path}`,
        changeFrequency: "daily",
        priority: path === "" ? 1 : 0.8,
      });
    }
  }
  try {
    const articles = await getArticles(undefined, 1, 100);
    for (const article of articles.list) {
      for (const locale of LOCALES) {
        entries.push({
          url: `${site}/${locale}/articles/${encodeURIComponent(article.slug)}`,
          lastModified: article.publishTime,
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }
    }
  } catch {
    // sitemap still lists static routes when API is down
  }
  return entries;
}
