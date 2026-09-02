"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { createArticle, getProfile, uploadImage, type WebArticleCreateRequest } from "@/lib/api";
import { queryKeys } from "./keys";

// Data-fetching hooks for CLIENT pages (forms, interactive islands).
// List pages (home / my-articles / notifications) now render on the server —
// see lib/api/server.ts — so their react-query hooks were removed.

export function useProfile(enabled = true) {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: getProfile,
    enabled,
  });
}

export function useCreateArticle() {
  // my-articles is now server-rendered (dynamic via request cookies), so fresh
  // data comes from the next RSC navigation — no query to invalidate.
  return useMutation({
    mutationFn: (data: WebArticleCreateRequest) => createArticle(data),
  });
}

export function useUploadImage() {
  return useMutation({
    mutationFn: (file: File) => uploadImage(file),
  });
}
