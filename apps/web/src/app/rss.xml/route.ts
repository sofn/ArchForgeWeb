import { getServerArticles } from "@/lib/api/server";
import { getSiteUrl } from "@/lib/site";
import { LOCALES } from "@/lib/routes";

/**
 * RSS 2.0 feed of the latest articles.
 *
 * - Locale: `?lang=zh` (or zh only) selects the feed language; without a query
 *   we fall back to Accept-Language negotiation, then "en". Links point at the
 *   locale-prefixed pages so subscribers land in their language.
 * - XML safety: CDATA contents are escaped (`]]>` splits the section), URLs and
 *   attribute values are entity-escaped. Feed readers must never receive a
 *   500 — API failures degrade to an empty-but-valid channel.
 */

const FEED_ITEM_COUNT = 30;

const escapeCdata = (s: string) => (s ?? "").replace(/]]>/g, "]]]]><![CDATA[>");

const XML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};
const escapeXml = (s: string) => (s ?? "").replace(/[&<>"']/g, (c) => XML_ENTITIES[c]);

function feedUrl(site: string, locale: string): string {
  return `${site}/rss.xml${locale === "en" ? "" : `?lang=${locale}`}`;
}

function atomLink(rel: string, href: string, hreflang?: string): string {
  return `    <atom:link rel="${rel}" href="${escapeXml(href)}"${
    hreflang ? ` hreflang="${hreflang}"` : ""
  }/>`;
}

function negotiateLocale(request: Request): string {
  const requested = new URL(request.url).searchParams.get("lang");
  if (requested && (LOCALES as readonly string[]).includes(requested)) {
    return requested;
  }
  const acceptLanguage = request.headers.get("accept-language") || "";
  return /^zh\b/i.test(acceptLanguage.trim()) ? "zh" : "en";
}

export async function GET(request: Request) {
  const locale = negotiateLocale(request);
  const site = getSiteUrl();

  let items: string[] = [];
  try {
    const articles = await getServerArticles(undefined, 1, FEED_ITEM_COUNT);
    items = (articles.list ?? []).map((article) => {
      const link = `${site}/${locale}/articles/${encodeURIComponent(article.slug)}`;
      return `    <item>
      <title><![CDATA[${escapeCdata(article.title)}]]></title>
      <link>${escapeXml(link)}</link>
      <guid>${escapeXml(link)}</guid>
      <pubDate>${new Date(article.publishTime).toUTCString()}</pubDate>
      <description><![CDATA[${escapeCdata(article.summary || "")}]]></description>
    </item>`;
    });
  } catch {
    // API down → empty, still-valid feed. Subscribers keep their reader; the
    // next successful revalidation restores items.
  }

  const channelTitle = locale === "zh" ? "ArchForgeWeb 最新文章" : "ArchForgeWeb — Latest articles";
  const channelDescription =
    locale === "zh" ? "ArchForgeWeb 最新发布的文章。" : "Latest articles published on ArchForgeWeb.";

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(channelTitle)}</title>
    <link>${escapeXml(site)}</link>
    <description>${escapeXml(channelDescription)}</description>
    <language>${escapeXml(locale)}</language>
${atomLink("self", feedUrl(site, locale))}
${LOCALES.map((l) => atomLink("alternate", feedUrl(site, l), l)).join("\n")}
${items.join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=600, stale-while-revalidate=3600",
    },
  });
}
