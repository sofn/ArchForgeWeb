import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/routes";

const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const privatePaths = ["/profile", "/write", "/notifications", "/change-password", "/articles/me"];
const disallow = LOCALES.flatMap((l) => privatePaths.map((p) => `/${l}${p}`));

/** 允许正常搜索收录，但拒绝用于 AI 训练 */
const AI_TRAINING_BOTS = [
  "GPTBot", "ClaudeBot", "anthropic-ai", "CCBot", "Bytespider",
  "meta-externalagent", "Google-Extended", "Applebot-Extended",
  "Amazonbot", "Cohere-AI", "Diffbot", "Omgili", "Omgilibot",
];

/** 允许 AI 的"检索/引用"类爬虫 —— 它们会带来流量而非只是取走数据 */
const AI_SEARCH_BOTS = ["OAI-SearchBot", "ChatGPT-User", "Claude-User", "Claude-SearchBot", "PerplexityBot"];

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
