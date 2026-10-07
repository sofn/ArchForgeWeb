import { describe, expect, it, vi } from "vitest";

// only the exported matcher is under test — keep the Next / next-intl runtime out of a node test
vi.mock("next-intl/middleware", () => ({ default: () => () => new Response() }));
vi.mock("next/server", () => ({ NextResponse: Response }));
vi.mock("@/i18n/routing", () => ({ routing: {} }));

import { config } from "../middleware";

// Next compiles the matcher as a path regex; anchored, the same source tells which requests the middleware sees.
const runsMiddleware = (path: string) => new RegExp(`^${config.matcher[0]}$`).test(path);

describe("middleware matcher", () => {
  it("runs for every page, including paths that contain a dot", () => {
    // the middleware stamps the nonce CSP: a page it skips is served with no CSP at all
    for (const path of ["/", "/en", "/zh/articles", "/en/articles/v1.2-release", "/en/user/a.b"]) {
      expect(runsMiddleware(path), path).toBe(true);
    }
  });

  it("skips API routes, Next internals and static files", () => {
    for (const path of [
      "/api/og",
      "/api/proxy/web/articles",
      "/_next/static/chunks/app.js",
      "/_next/image",
      "/favicon.ico",
      "/robots.txt",
      "/sitemap.xml",
      "/rss.xml",
      "/manifest.webmanifest",
      "/icons/icon-192.png",
    ]) {
      expect(runsMiddleware(path), path).toBe(false);
    }
  });
});
