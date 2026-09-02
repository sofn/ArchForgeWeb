export const queryKeys = {
  profile: ["profile"] as const,
  categories: ["categories"] as const,
  articles: (params: { categoryId?: number; page: number; keyword?: string }) =>
    ["articles", params] as const,
  article: (slug: string) => ["article", slug] as const,
};
