import { api, unwrap } from "@/lib/http/client";
import type {
  WebChangePasswordRequest,
  WebLoginResponse,
  WebRegisterRequest,
  WebResetPasswordRequest,
  WebSendVerificationCodeRequest,
  WebUserProfileResponse,
} from "./types";

export async function login(username: string, password: string): Promise<WebLoginResponse> {
  return unwrap<WebLoginResponse>(api.POST("/web/login", { body: { username, password } }));
}

export async function logout(refreshToken?: string | null): Promise<boolean> {
  return unwrap<boolean>(
    api.POST("/web/logout", { body: refreshToken ? { refreshToken } : {} })
  );
}

export async function getProfile(): Promise<WebUserProfileResponse> {
  return unwrap<WebUserProfileResponse>(api.GET("/web/user/profile"));
}

export async function changePassword(data: WebChangePasswordRequest): Promise<boolean> {
  return unwrap<boolean>(api.POST("/web/user/change-password", { body: data }));
}

export async function sendVerificationCode(
  data: WebSendVerificationCodeRequest
): Promise<boolean> {
  return unwrap<boolean>(api.POST("/web/verification-code/send", { body: data }));
}

export async function register(data: WebRegisterRequest): Promise<WebLoginResponse> {
  return unwrap<WebLoginResponse>(api.POST("/web/register", { body: data }));
}

export async function forgotPassword(email: string): Promise<boolean> {
  return unwrap<boolean>(
    api.POST("/web/forgot-password", { body: { email, purpose: "RESET_PASSWORD" } })
  );
}

export async function resetPassword(data: WebResetPasswordRequest): Promise<boolean> {
  return unwrap<boolean>(api.POST("/web/reset-password", { body: data }));
}
