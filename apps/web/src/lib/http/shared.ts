import { ApiError } from "./errors";

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081";

export const DEFAULT_TIMEOUT = 10000;

/** Builds the sa-token auth header value: `Bearer <token>` for the default header name. */
export function buildAuthHeader(token: string, tokenName: string): string {
  if (tokenName.toLowerCase() === "authorization") {
    return `Bearer ${token}`;
  }
  return token;
}

/** Parses a non-2xx response (envelope or RFC 9457 ProblemDetail) into an ApiError. */
export async function parseErrorResponse(res: Response): Promise<ApiError> {
  try {
    const err = (await res.json()) as { message?: string; detail?: string; code?: number };
    return new ApiError(err.message || err.detail || `Request failed: ${res.status}`, res.status, err.code);
  } catch {
    return new ApiError(`Request failed: ${res.status}`, res.status);
  }
}

/** fetch with a default timeout, preserving any caller-provided AbortSignal. */
export function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  const userSignal = init.signal;
  const onAbort = () => controller.abort();
  if (userSignal) {
    if (userSignal.aborted) {
      controller.abort();
    } else {
      userSignal.addEventListener("abort", onAbort, { once: true });
    }
  }

  return fetch(input, { ...init, signal: controller.signal }).finally(() => {
    clearTimeout(timeoutId);
    if (userSignal) {
      userSignal.removeEventListener("abort", onAbort);
    }
  });
}

/** Unwraps the `{code,message,data}` envelope returned by every success response. */
export async function unwrap<T>(
  call: Promise<{ data?: unknown; error?: unknown; response: Response }>
): Promise<T> {
  const { data, error, response } = await call;
  if (error) {
    throw error instanceof ApiError ? error : new ApiError(String(error), response.status);
  }
  const envelope = data as { code: number; message?: string; data?: T } | undefined;
  if (!envelope || envelope.code !== 0) {
    throw new ApiError(envelope?.message || "Request failed", response.status, envelope?.code);
  }
  return envelope.data as T;
}
