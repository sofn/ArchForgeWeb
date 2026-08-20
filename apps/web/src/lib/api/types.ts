export interface WebUserProfileResponse {
  userId: number;
  username: string;
  nickname?: string;
  avatar?: string;
}

export interface WebChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface WebSendVerificationCodeRequest {
  email: string;
  purpose: "REGISTER" | "RESET_PASSWORD";
}

export interface WebRegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  code: string;
}

export interface WebResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

export interface WebDashboardMetricsResponse {
  userTotal: number;
  onlineNow: number;
  todayLogin: number;
  todayOperation: number;
}

export interface WebNoticeResponse {
  id: number;
  title: string;
  content?: string;
  noticeType?: number;
  createTime: string;
}

export interface WebOperationLogResponse {
  id: number;
  username: string;
  module?: string;
  summary?: string;
  operatingTime: string;
}

export interface WebCategory {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
  articleCount: number;
}

export interface WebArticleSummary {
  id: number;
  title: string;
  slug: string;
  summary: string;
  coverImageFileId: number | null;
  coverImageUrl: string;
  categoryName: string;
  publishTime: string;
}

export interface WebArticleDetail {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImageFileId: number | null;
  coverImageUrl: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  publishTime: string;
  createTime: string;
}

export interface WebArticleCreateRequest {
  categoryId: number;
  title: string;
  summary?: string;
  content: string;
  coverImageFileId?: number | null;
}

export interface FileUploadResponse {
  fileId: number;
  url: string;
  name: string;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  pageSize: number;
  currentPage: number;
}
