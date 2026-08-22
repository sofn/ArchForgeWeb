import type { components } from "@/types/schema";

export type ApiResponse<T> = {
  code: number;
  message?: string;
  data: T;
};

export type WebLoginResponse = components["schemas"]["WebLoginResponse"];
export type WebUserProfileResponse = components["schemas"]["WebUserProfileResponse"];
export type WebChangePasswordRequest = components["schemas"]["WebChangePasswordRequest"];
export type WebSendVerificationCodeRequest = components["schemas"]["WebSendVerificationCodeRequest"];
export type WebRegisterRequest = components["schemas"]["WebRegisterRequest"];
export type WebResetPasswordRequest = components["schemas"]["WebResetPasswordRequest"];
export type WebDashboardMetricsResponse = components["schemas"]["WebDashboardMetricsResponse"];
export type WebNoticeResponse = components["schemas"]["WebNoticeResponse"];
export type WebOperationLogResponse = components["schemas"]["WebOperationLogResponse"];
export type WebCategory = components["schemas"]["WebCategoryResponse"];
export type WebArticleSummary = components["schemas"]["WebArticleSummaryResponse"];
export type WebArticleDetail = components["schemas"]["WebArticleDetailResponse"];
export type WebArticleCreateRequest = components["schemas"]["WebArticleCreateRequest"];
export type FileUploadResponse = components["schemas"]["WebFileUploadResponse"];
export type PageResult<T> = { list: T[]; total: number; pageSize: number; currentPage: number };
