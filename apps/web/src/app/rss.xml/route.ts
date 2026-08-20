import { getArticles } from "@/lib/api";

export async function GET() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const articles = await getArticles(undefined, 1, 30);
  const items = articles.list
    .map(
      (article) => `    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${site}/en/articles/${encodeURIComponent(article.slug)}</link>
      <guid>${site}/en/articles/${encodeURIComponent(article.slug)}</guid>
      <pubDate>${new Date(article.publishTime).toUTCString()}</pubDate>
      <description><![CDATA[${article.summary || ""}]]></description>
    </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>ArchForgeWeb</title>
    <link>${site}</link>
    <description>Latest articles</description>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
