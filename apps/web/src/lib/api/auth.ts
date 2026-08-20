import { httpClient } from "@/lib/http/client";
import type { WebLoginResponse } from "@/lib/http/types";
import type {
  WebChangePasswordRequest,
  WebRegisterRequest,
  WebResetPasswordRequest,
  WebSendVerificationCodeRequest,
  WebUserProfileResponse,
} from "./types";

export async function login(username: string, password: string): Promise<WebLoginResponse> {
  return httpClient.post<WebLoginResponse>("/web/login", { username, password });
}

export async function logout(refreshToken?: string | null): Promise<boolean> {
  return httpClient.post<boolean>("/web/logout", refreshToken ? { refreshToken } : {});
}

export async function getProfile(): Promise<WebUserProfileResponse> {
  return httpClient.get<WebUserProfileResponse>("/web/user/profile");
}

export async function changePassword(data: WebChangePasswordRequest): Promise<boolean> {
  return httpClient.post<boolean>("/web/user/change-password", data);
}

export async function sendVerificationCode(data: WebSendVerificationCodeRequest): Promise<boolean> {
  return httpClient.post<boolean>("/web/verification-code/send", data);
}

export async function register(data: WebRegisterRequest): Promise<WebLoginResponse> {
  return httpClient.post<WebLoginResponse>("/web/register", data);
}

export async function forgotPassword(email: string): Promise<boolean> {
  return httpClient.post<boolean>("/web/forgot-password", { email, purpose: "RESET_PASSWORD" });
}

export async function resetPassword(data: WebResetPasswordRequest): Promise<boolean> {
  return httpClient.post<boolean>("/web/reset-password", data);
}
