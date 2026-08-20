export interface ApiResponse<T> {
  code: number;
  message?: string;
  data: T;
}

export interface WebLoginResponse {
  userId: number;
  username: string;
  nickname?: string;
  avatar?: string;
  accessToken: string;
  tokenName?: string;
  refreshToken?: string;
  expires: string;
}
