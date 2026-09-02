import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock next/headers: vitest has no Next request scope, and this module must
// never touch the real cookie store.
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

import { cookies } from "next/headers";
import { createServerApi, readServerAuth } from "./server";

const TEST_BASE = "http://api.test";
const PROFILE_PATH = "/web/user/profile" as const;

function setCookieJar(jar: Record<string, string>) {
  vi.mocked(cookies).mockResolvedValue({
    get: (name: string) => (name in jar ? { value: jar[name] } : undefined),
  } as Awaited<ReturnType<typeof cookies>>);
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

describe("readServerAuth", () => {
  it("reads sa-token credentials from request cookies", async () => {
    setCookieJar({ token: "server-token", tokenName: "Authorization", refreshToken: "rt" });
    const auth = await readServerAuth();
    expect(auth).toEqual({ token: "server-token", tokenName: "Authorization", refreshToken: "rt" });
  });

  it("defaults tokenName to Authorization and tolerates missing cookies", async () => {
    setCookieJar({});
    const auth = await readServerAuth();
    expect(auth).toEqual({ token: "", tokenName: "Authorization", refreshToken: null });
  });
});

describe("server client", () => {
  it("injects Authorization: Bearer header into requests", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ code: 0, data: { id: 1 } }));

    const api = createServerApi({ token: "server-token", tokenName: "Authorization", refreshToken: null });
    await api.GET(PROFILE_PATH, { baseUrl: TEST_BASE });

    const [url, init] = fetchMock.mock.calls[0];
    const requestUrl = url instanceof Request ? url.url : String(url);
    expect(requestUrl).toContain(PROFILE_PATH);
    // Per fetch spec, init.headers overrides the Request's own headers.
    const headerSource = init?.headers ?? (url instanceof Request ? url.headers : undefined);
    expect(new Headers(headerSource).get("Authorization")).toBe("Bearer server-token");
  });

  it("uses a custom header name with the raw token value", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ code: 0, data: true }));

    const api = createServerApi({ token: "server-token", tokenName: "satoken", refreshToken: null });
    await api.GET(PROFILE_PATH, { baseUrl: TEST_BASE });

    const [reqUrl, reqInit] = fetchMock.mock.calls[0];
    const headers = new Headers(reqInit?.headers ?? (reqUrl instanceof Request ? reqUrl.headers : undefined));
    expect(headers.get("satoken")).toBe("server-token");
    expect(headers.get("Authorization")).toBeNull();
  });

  it("does not attach a header when there is no token", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ code: 0, data: [] }));

    const api = createServerApi({ token: "", tokenName: "Authorization", refreshToken: null });
    await api.GET(PROFILE_PATH, { baseUrl: TEST_BASE });

    const [reqUrl, reqInit] = fetchMock.mock.calls[0];
    const headers = new Headers(reqInit?.headers ?? (reqUrl instanceof Request ? reqUrl.headers : undefined));
    expect(headers.get("Authorization")).toBeNull();
  });

  it("never refreshes on 401 — a single request, then an ApiError", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ code: 401, message: "session expired" }, 401));

    const api = createServerApi({ token: "stale-token", tokenName: "Authorization", refreshToken: "rt" });
    await expect(api.GET(PROFILE_PATH, { baseUrl: TEST_BASE })).rejects.toMatchObject({
      status: 401,
      message: "session expired",
    });

    // The browser client retries after a refresh; the server client MUST NOT
    // (an RSC render cannot persist rotated tokens back to the browser).
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("normalizes non-2xx envelope responses into ApiError", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ code: 500, message: "boom" }, 500));

    const api = createServerApi({ token: "server-token", tokenName: "Authorization", refreshToken: null });
    await expect(api.GET(PROFILE_PATH, { baseUrl: TEST_BASE })).rejects.toMatchObject({
      status: 500,
      message: "boom",
    });
  });
});
