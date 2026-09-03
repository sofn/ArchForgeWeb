import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/routes";
import { getSiteUrl } from "@/lib/site";
import { AI_SEARCH_BOTS, AI_TRAINING_BOTS } from "@/lib/bots";

const site = getSiteUrl();
const privatePaths = ["/profile", "/write", "/notifications", "/change-password", "/articles/me"];
const disallow = LOCALES.flatMap((l) => privatePaths.map((p) => `/${l}${p}`));

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // 默认：搜索引擎友好
      { userAgent: "*", allow: "/", disallow },
      // AI 训练：全站拒绝
      ...AI_TRAINING_BOTS.map((ua) => ({ userAgent: ua, disallow: "/" })),
      // AI 检索/引用：允许内容页，拒绝用户区（可带来 referral 流量）
      ...AI_SEARCH_BOTS.map((ua) => ({ userAgent: ua, allow: ["/", "/articles"], disallow })),
    ],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
