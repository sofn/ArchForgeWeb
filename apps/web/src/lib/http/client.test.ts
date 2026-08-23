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

describe("http client token refresh", () => {
  const onAuthExpired = vi.fn();

  beforeEach(() => {
    const storage = new Map<string, string>([
      ["token", "stale-token"],
      ["refreshToken", "refresh-token"],
    ]);
    const localStorageStub = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => void storage.set(key, value),
    };
    vi.stubGlobal("fetch", vi.fn());
    vi.stubGlobal("window", { localStorage: localStorageStub });
    vi.stubGlobal("localStorage", localStorageStub);
    setAuthExpiredHandler(onAuthExpired);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    setAuthExpiredHandler(() => undefined);
    onAuthExpired.mockClear();
  });

  it("rejects all queued requests when refresh fails and allows a later retry", async () => {
    const refreshError = new Error("refresh endpoint down");
    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockResolvedValueOnce(jsonResponse({}, 401))
      .mockResolvedValueOnce(jsonResponse({}, 401))
      .mockRejectedValueOnce(refreshError)
      .mockResolvedValueOnce(jsonResponse({}, 401))
      .mockResolvedValueOnce(jsonResponse({ code: 0, data: { accessToken: "new-token" } }))
      .mockResolvedValueOnce(jsonResponse({ code: 0, data: { id: 1 } }));

    const first = api.GET(PROFILE_PATH, { baseUrl: TEST_BASE });
    const second = api.GET(PROFILE_PATH, { baseUrl: TEST_BASE });
    const settled = await Promise.allSettled([first, second]);

    expect(settled[0]).toEqual({ status: "rejected", reason: refreshError });
    expect(settled[1]).toEqual({ status: "rejected", reason: refreshError });
    expect(onAuthExpired).toHaveBeenCalledTimes(1);

    const third = await api.GET(PROFILE_PATH, { baseUrl: TEST_BASE });
    expect(third.response.status).toBe(200);

    const refreshCalls = fetchMock.mock.calls.filter((call) =>
      String(call[0]).endsWith("/web/refresh-token"),
    );
    expect(refreshCalls).toHaveLength(2);
    expect(JSON.parse(String(refreshCalls[1][1]?.body))).toEqual({
      refreshToken: "refresh-token",
    });
  });

  it("retries queued requests once with the refreshed token", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockResolvedValueOnce(jsonResponse({}, 401))
      .mockResolvedValueOnce(jsonResponse({}, 401))
      .mockResolvedValueOnce(jsonResponse({ code: 0, data: { accessToken: "new-token" } }))
      .mockResolvedValueOnce(jsonResponse({ code: 0, data: { id: 1 } }))
      .mockResolvedValueOnce(jsonResponse({ code: 0, data: { id: 2 } }));

    const [first, second] = await Promise.all([
      api.GET(PROFILE_PATH, { baseUrl: TEST_BASE }),
      api.GET(PROFILE_PATH, { baseUrl: TEST_BASE }),
    ]);

    expect(first.response.status).toBe(200);
    expect(second.response.status).toBe(200);

    const refreshCalls = fetchMock.mock.calls.filter((call) =>
      String(call[0]).endsWith("/web/refresh-token"),
    );
    expect(refreshCalls).toHaveLength(1);
    expect(onAuthExpired).not.toHaveBeenCalled();

    const retriedInit = fetchMock.mock.calls.at(-1)?.[1];
    expect(new Headers(retriedInit?.headers).get("Authorization")).toBe("Bearer new-token");
  });
});
