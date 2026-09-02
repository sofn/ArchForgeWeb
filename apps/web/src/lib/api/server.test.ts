import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock next/headers: vitest has no Next request scope.
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

import { cookies } from "next/headers";
import { getServerProfile } from "./server";

function setCookieJar(jar: Record<string, string>) {
  vi.mocked(cookies).mockResolvedValue({
    get: (name: string) => (name in jar ? { value: jar[name] } : undefined),
  } as Awaited<ReturnType<typeof cookies>>);
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

describe("getServerProfile graceful degradation", () => {
  it("returns null when the backend is unreachable (network error)", async () => {
    // Regression test: `try { return unwrap(...) } catch` silently bypasses the
    // catch for async rejections — the original bug 500'd the public homepage
    // whenever the API was down. `return await` is load-bearing here.
    setCookieJar({ token: "t" });
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError("fetch failed"));

    await expect(getServerProfile()).resolves.toBeNull();
  });

  it("returns null when the session is expired (401 envelope)", async () => {
    setCookieJar({ token: "stale" });
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ code: 401, message: "session expired" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    );

    await expect(getServerProfile()).resolves.toBeNull();
  });

  it("returns null when unauthenticated (no token cookie)", async () => {
    setCookieJar({});
    await expect(getServerProfile()).resolves.toBeNull();
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });
});
