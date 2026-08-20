import { describe, expect, it } from "vitest";
import { formatDateTime } from "./date";

describe("formatDateTime", () => {
  it("returns empty string for missing values", () => {
    expect(formatDateTime()).toBe("");
    expect(formatDateTime("")).toBe("");
  });

  it("formats an ISO timestamp for a locale", () => {
    const formatted = formatDateTime("2024-01-02T03:04:00.000Z", "en-US");
    expect(formatted).toMatch(/2024/);
    expect(formatted).toMatch(/01|1/);
  });
});
