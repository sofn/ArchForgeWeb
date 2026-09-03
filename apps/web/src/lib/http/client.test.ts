import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, setAuthExpiredHandler } from "./client";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const PROFILE_PATH = "/web/user/profile" as const;
const TEST_BASE = "http://api.test";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  setAuthExpiredHandler(null);
});

describe("browser http client (BFF proxy architecture)", () => {
  const onAuthExpired = vi.fn();

  it("passes successes through", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ code: 0, data: { userId: 1 } }));

    const result = await api.GET(PROFILE_PATH, { baseUrl: TEST_BASE });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.response.status).toBe(200);
  });

  it("surfaces 401 to the auth-expired handler without retrying", async () => {
    // The proxy already attempted one single-flight refresh before returning
    // 401 — a client-side retry loop would only hammer a dead session.
    setAuthExpiredHandler(onAuthExpired);
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ code: 401, message: "session expired" }, 401));

    await expect(api.GET(PROFILE_PATH, { baseUrl: TEST_BASE })).rejects.toMatchObject({
      status: 401,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(onAuthExpired).toHaveBeenCalledTimes(1);
  });

  it("normalizes non-2xx envelope responses into ApiError", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ code: 500, message: "boom" }, 500));

    await expect(api.GET(PROFILE_PATH, { baseUrl: TEST_BASE })).rejects.toMatchObject({
      status: 500,
      message: "boom",
    });
    expect(vi.fn()).not.toHaveBeenCalled();
  });

  it("forwards request bodies (e.g. article creation)", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ code: 0, data: 42 }));

    await api.POST("/web/articles", { baseUrl: TEST_BASE, body: { title: "t" } as never });
    // openapi-fetch builds a Request object; body/headers live on it, not in init.
    const [url] = fetchMock.mock.calls[0];
    expect(url).toBeInstanceOf(Request);
    const request = url as Request;
    expect(request.url).toContain("/web/articles");
    expect(JSON.parse(await request.clone().text())).toEqual({ title: "t" });
    expect(request.headers.get("Content-Type")).toBe("application/json");
  });
});
