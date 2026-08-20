import { describe, expect, it } from "vitest";
import { isAllowedImageUrl } from "./image";

describe("isAllowedImageUrl", () => {
  it("rejects empty, non-http, and foreign hosts", () => {
    expect(isAllowedImageUrl("")).toBe(false);
    expect(isAllowedImageUrl("javascript:alert(1)")).toBe(false);
    expect(isAllowedImageUrl("https://evil.example/x.png")).toBe(false);
  });

  it("allows the configured API origin", () => {
    expect(isAllowedImageUrl("http://localhost:8081/web/file/1")).toBe(true);
  });
});
