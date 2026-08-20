import { describe, expect, it } from "vitest";
import { loginSchema, passwordSchema, registerSchema } from "./auth";

describe("passwordSchema", () => {
  it("rejects short or weak passwords", () => {
    expect(passwordSchema.safeParse("abc").success).toBe(false);
    expect(passwordSchema.safeParse("abcdefgh").success).toBe(false);
    expect(passwordSchema.safeParse("Abcdefgh").success).toBe(false);
  });

  it("accepts mixed-case passwords with a digit", () => {
    expect(passwordSchema.safeParse("Abcdefg1").success).toBe(true);
  });
});

describe("loginSchema", () => {
  it("requires username and password", () => {
    expect(loginSchema.safeParse({ username: "", password: "x" }).success).toBe(false);
    expect(loginSchema.safeParse({ username: "admin", password: "x" }).success).toBe(true);
  });
});

describe("registerSchema", () => {
  it("requires matching strong passwords and a code", () => {
    const base = {
      email: "user@example.com",
      password: "Abcdefg1",
      confirmPassword: "Abcdefg1",
      code: "123456",
    };
    expect(registerSchema.safeParse(base).success).toBe(true);
    expect(registerSchema.safeParse({ ...base, email: "bad" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, confirmPassword: "Other1aa" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, code: "" }).success).toBe(false);
  });
});
