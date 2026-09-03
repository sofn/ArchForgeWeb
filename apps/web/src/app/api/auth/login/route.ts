import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/http/shared";
import { setAuthCookies } from "@/lib/http/auth-cookies";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/http/rate-limit";

/**
 * Login endpoint of the BFF (backend-for-frontend) auth flow.
 *
 * Why this exists: the backend returns credentials in the response body
 * (sa-token style). The old client stored them in localStorage + plain
 * cookies — any XSS read them permanently. This route keeps the tokens
 * server-side: it exchanges them for HttpOnly cookies and returns only the
 * non-sensitive user profile to the browser.
 */

const RATE_LIMIT = 10; // attempts
const RATE_WINDOW_MS = 60_000;

export async function POST(request: NextRequest) {
  if (!rateLimit(`login:${clientIp(request)}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return tooManyRequests(60);
  }

  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: 400, message: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.username || !body.password) {
    return NextResponse.json({ code: 400, message: "username and password are required" }, { status: 400 });
  }

  let backendStatus = 500;
  try {
    const res = await fetch(`${API_BASE}/web/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: body.username, password: body.password }),
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
        { code: json?.code ?? 500, message: json?.message ?? "Login failed" },
        { status: res.ok ? 401 : backendStatus }
      );
    }

    const { accessToken, tokenName, refreshToken, userId, username, nickname, avatar } = json.data;
    const response = NextResponse.json({
      code: 0,
      message: "ok",
      // Sanitized: NO accessToken / refreshToken / tokenName in the body.
      data: { userId, username, nickname, avatar },
    });
    setAuthCookies(response, { accessToken, tokenName, refreshToken });
    return response;
  } catch {
    return NextResponse.json(
      { code: 502, message: "Backend unreachable" },
      { status: 502 }
    );
  }
}
