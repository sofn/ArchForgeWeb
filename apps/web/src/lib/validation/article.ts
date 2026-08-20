import { z } from "zod";

export const writeArticleSchema = z.object({
  title: z.string().min(1),
  categoryId: z.string().min(1),
  summary: z.string().optional(),
  content: z.string().min(1),
});

export type WriteArticleValues = z.infer<typeof writeArticleSchema>;
