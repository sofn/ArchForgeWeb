import { describe, expect, it } from "vitest";
import { isPublicPath, stripLocale } from "./routes";

describe("stripLocale", () => {
  it("removes /en and /zh prefixes", () => {
    expect(stripLocale("/en")).toBe("/");
    expect(stripLocale("/zh/articles")).toBe("/articles");
    expect(stripLocale("/articles")).toBe("/articles");
  });
});

describe("isPublicPath", () => {
  it("allows marketing and auth routes with or without locale", () => {
    expect(isPublicPath("/")).toBe(true);
    expect(isPublicPath("/en")).toBe(true);
    expect(isPublicPath("/zh/login")).toBe(true);
    expect(isPublicPath("/articles")).toBe(true);
    expect(isPublicPath("/en/articles/hello-world")).toBe(true);
    expect(isPublicPath("/register")).toBe(true);
    expect(isPublicPath("/forgot-password")).toBe(true);
  });

  it("protects personal routes", () => {
    expect(isPublicPath("/profile")).toBe(false);
    expect(isPublicPath("/en/articles/me")).toBe(false);
    expect(isPublicPath("/zh/write")).toBe(false);
    expect(isPublicPath("/notifications")).toBe(false);
    expect(isPublicPath("/change-password")).toBe(false);
  });
});
