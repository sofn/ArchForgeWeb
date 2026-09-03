import { cookies } from "next/headers";
import createClient from "openapi-fetch";
import type { paths } from "@/types/schema";
import { API_BASE, buildAuthHeader, parseErrorResponse } from "./shared";

/**
 * Server-side counterpart of the browser http client.
 *
 * The browser client (./client.ts) reads credentials from localStorage — which
 * is why RSC requests historically went out without an Authorization header.
 * In React Server Components the credentials live in the request cookies
 * (set by the login flow + middleware), and Next.js only exposes them through
 * the async `next/headers` API. This module is the RSC-safe way to obtain an
 * authenticated API client.
 *
 * Import it only from server contexts (server components / route handlers);
 * importing it from a client component fails at build time, which is exactly
 * the guardrail we want.
 */

export interface ServerAuth {
  token: string;
  tokenName: string;
  refreshToken: string | null;
}

/** Reads the sa-token credentials from the current request's cookies. */
export async function readServerAuth(): Promise<ServerAuth> {
  const store = await cookies();
  const token = store.get("token")?.value ?? "";
  const tokenName = store.get("tokenName")?.value || "Authorization";
  const refreshToken = store.get("refreshToken")?.value ?? null;
  return { token, tokenName, refreshToken };
}

/**
 * openapi-fetch constructs `new Request(baseUrl + path)` before invoking the
 * custom fetch; with an empty baseUrl that Request carries a relative URL,
 * which browsers resolve against the page origin but Node's fetch rejects.
 * The server client therefore pins baseUrl to API_BASE up front; toAbsoluteUrl
 * remains a belt-and-braces fallback for relative string/URL inputs.
 */
function toAbsoluteUrl(input: RequestInfo | URL): RequestInfo | URL {
  if (typeof input === "string") {
    return /^https?:\/\//.test(input) ? input : `${API_BASE}${input}`;
  }
  return input; // Request/URL instances — absolute by construction (baseUrl above)
}

/**
 * Creates a request-scoped openapi-fetch client that injects the sa-token
 * header from the given credentials.
 *
 * Token refresh is intentionally NOT performed here: an RSC render cannot
 * persist rotated tokens back to the browser (localStorage/cookies), so a
 * refresh would silently repeat on every render. Expired tokens surface as
 * ApiError(401); the client AuthProvider handles cleanup + redirect.
 */
export function createServerApi(auth: ServerAuth): ReturnType<typeof createClient<paths>> {
  const serverFetch: typeof fetch = async (input, init) => {
    const headers = new Headers(init?.headers);
    if (auth.token) {
      headers.set(auth.tokenName, buildAuthHeader(auth.token, auth.tokenName));
    }
    // NO AbortSignal here on purpose: Next.js excludes signal-carrying fetches
    // from the Data Cache, which would silently disable `revalidate`/ISR for
    // every page built on this client (they would refetch the backend on each
    // render). Cache lifetimes arrive per-call via `init.next` (Next extends
    // RequestInit with it); openapi-fetch copies unknown FetchOptions onto the
    // Request instance, so lift it back into init for the patched fetch.
    // The browser client keeps fetchWithTimeout — browser requests are
    // uncached anyway, so its signal costs nothing.
    const requestNext =
      (init as RequestInit & { next?: { revalidate?: number | false; tags?: string[] } })?.next ??
      (input instanceof Request ? (input as Request & { next?: object }).next : undefined);
    const res = await fetch(toAbsoluteUrl(input), {
      ...init,
      next: requestNext as RequestInit["next"],
      headers,
    });
    if (!res.ok) {
      throw await parseErrorResponse(res);
    }
    return res;
  };
  return createClient<paths>({ fetch: serverFetch, baseUrl: API_BASE });
}

/** Convenience: authenticated client for the current request. */
export async function serverApi(): Promise<ReturnType<typeof createClient<paths>>> {
  return createServerApi(await readServerAuth());
}
