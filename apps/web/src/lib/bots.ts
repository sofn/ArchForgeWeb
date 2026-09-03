/**
 * Central bot policy, shared by robots.ts (advisory) and middleware
 * (enforced). Keep this the single source of truth — robots.txt alone is a
 * gentlemen's agreement; the middleware 403 is the actual fence.
 */

/** AI training crawlers — allowed to index nothing, blocked at the edge. */
export const AI_TRAINING_BOTS = [
  "GPTBot",
  "ClaudeBot",
  "anthropic-ai",
  "CCBot",
  "Bytespider",
  "meta-externalagent",
  "Google-Extended",
  "Applebot-Extended",
  "Amazonbot",
  "Cohere-AI",
  "Diffbot",
  "Omgili",
  "Omgilibot",
] as const;

/** AI search/referral crawlers — they cite and link back, so they stay allowed. */
export const AI_SEARCH_BOTS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
] as const;

/** Substring match against the User-Agent (case-insensitive). */
export const AI_TRAINING_BOT_PATTERN = new RegExp(
  AI_TRAINING_BOTS.map((b) => b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"),
  "i"
);
