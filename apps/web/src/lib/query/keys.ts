export const queryKeys = {
  profile: ["profile"] as const,
  metrics: ["metrics"] as const,
  notices: ["notices"] as const,
  logs: ["operation-logs"] as const,
  categories: ["categories"] as const,
  articles: (params: { categoryId?: number; page: number; keyword?: string }) =>
    ["articles", params] as const,
  myArticles: (page: number) => ["my-articles", page] as const,
  article: (slug: string) => ["article", slug] as const,
};
