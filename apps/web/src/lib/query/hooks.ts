"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createArticle,
  getMetrics,
  getMyArticles,
  getNotices,
  getOperationLogs,
  getProfile,
  uploadImage,
  type WebArticleCreateRequest,
} from "@/lib/api";
import { queryKeys } from "./keys";

export function useProfile(enabled = true) {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: getProfile,
    enabled,
  });
}

export function useMetrics(enabled = true) {
  return useQuery({
    queryKey: queryKeys.metrics,
    queryFn: getMetrics,
    enabled,
  });
}

export function useNotices(enabled = true) {
  return useQuery({
    queryKey: queryKeys.notices,
    queryFn: getNotices,
    enabled,
  });
}

export function useOperationLogs(enabled = true) {
  return useQuery({
    queryKey: queryKeys.logs,
    queryFn: getOperationLogs,
    enabled,
  });
}

export function useMyArticles(page: number, pageSize = 12) {
  return useQuery({
    queryKey: queryKeys.myArticles(page),
    queryFn: () => getMyArticles(page, pageSize),
  });
}

export function useCreateArticle() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: WebArticleCreateRequest) => createArticle(data),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["my-articles"] });
    },
  });
}

export function useUploadImage() {
  return useMutation({
    mutationFn: (file: File) => uploadImage(file),
  });
}
