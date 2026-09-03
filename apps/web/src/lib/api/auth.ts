import { api, unwrap } from "@/lib/http/client";
import { ApiError } from "@/lib/http/errors";
import type {
  WebChangePasswordRequest,
  WebLoginResponse,
  WebRegisterRequest,
  WebResetPasswordRequest,
  WebSendVerificationCodeRequest,
  WebUserProfileResponse,
} from "./types";

/**
 * Client auth calls — routed through the Next BFF (/api/auth/*), NOT the
 * backend. The routes exchange tokens for HttpOnly cookies and return only
 * the sanitized user profile, so the browser never sees credential material.
 */

/** What login/register hand back to the SPA (no tokens). */
export type LoginUser = Pick<WebLoginResponse, "userId" | "username" | "nickname" | "avatar">;

async function postAuthRoute<T>(path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: "POST",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      credentials: "same-origin",
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Network error", 0);
  }
  const json = (await res.json().catch(() => null)) as {
    code?: number;
    message?: string;
    data?: T;
  } | null;
  if (!res.ok || !json || json.code !== 0 || json.data === undefined) {
    throw new ApiError(json?.message || "Request failed", res.status, json?.code);
  }
  return json.data;
}

export async function login(username: string, password: string): Promise<LoginUser> {
  return postAuthRoute<LoginUser>("/api/auth/login", { username, password });
}

export async function register(data: WebRegisterRequest): Promise<LoginUser> {
  return postAuthRoute<LoginUser>("/api/auth/register", data);
}

/** Drops the HttpOnly cookies server-side (backend invalidation is best-effort). */
export async function logout(): Promise<boolean> {
  return postAuthRoute<boolean>("/api/auth/logout");
}

/** Typed-client passthrough (goes through the proxy with cookie auth). */
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

export async function forgotPassword(email: string): Promise<boolean> {
  return unwrap<boolean>(
    api.POST("/web/forgot-password", { body: { email, purpose: "RESET_PASSWORD" } })
  );
}

export async function resetPassword(data: WebResetPasswordRequest): Promise<boolean> {
  return unwrap<boolean>(api.POST("/web/reset-password", { body: data }));
}
