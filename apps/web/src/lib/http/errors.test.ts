import { describe, expect, it } from "vitest";
import { ApiError } from "./errors";

describe("ApiError", () => {
  it("carries HTTP status and optional business code", () => {
    const error = new ApiError("Unauthorized", 401, 401);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("Unauthorized");
    expect(error.status).toBe(401);
    expect(error.code).toBe(401);
    expect(error.name).toBe("ApiError");
  });
});
