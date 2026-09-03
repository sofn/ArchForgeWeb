import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/http/shared";
import { setAuthCookies } from "@/lib/http/auth-cookies";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/http/rate-limit";

/**
 * Registration via the BFF: same cookie-for-tokens exchange as login (the
 * backend hands back a login response on successful signup).
 */

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;

export async function POST(request: NextRequest) {
  if (!rateLimit(`register:${clientIp(request)}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return tooManyRequests(60);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: 400, message: "Invalid JSON body" }, { status: 400 });
  }

  let backendStatus = 500;
  try {
    const res = await fetch(`${API_BASE}/web/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    backendStatus = res.status;
    const json = (await res.json().catch(() => null)) as {
      code?: number;
      message?: string;
      data?: {
        accessToken?: string;
        tokenName?: string;
        refreshToken?: string;
        userId?: number;
        username?: string;
        nickname?: string;
        avatar?: string;
      };
    } | null;

    if (!json || json.code !== 0 || !json.data?.accessToken) {
      return NextResponse.json(
        { code: json?.code ?? 500, message: json?.message ?? "Registration failed" },
        { status: res.ok ? 400 : backendStatus }
      );
    }

    const { accessToken, tokenName, refreshToken, userId, username, nickname, avatar } = json.data;
    const response = NextResponse.json({
      code: 0,
      message: "ok",
      data: { userId, username, nickname, avatar },
    });
    setAuthCookies(response, { accessToken, tokenName, refreshToken });
    return response;
  } catch {
    return NextResponse.json({ code: 502, message: "Backend unreachable" }, { status: 502 });
  }
}
