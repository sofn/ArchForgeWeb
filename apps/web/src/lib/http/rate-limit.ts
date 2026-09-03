/**
 * In-memory sliding-window rate limiter.
 *
 * Scope: per server instance — good enough for a single-container deployment
 * and for blunt abuse (credential stuffing, proxy hammering). For multi-replica
 * deployments swap the Map for Redis (same interface) — the call sites should
 * not care.
 */

const buckets = new Map<string, number[]>();
const MAX_TRACKED_KEYS = 5000;

/**
 * @returns true when the request is within budget; false when it exceeds it.
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (hits.length >= limit) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);

  if (buckets.size > MAX_TRACKED_KEYS) {
    // Cheap pruning: drop expired buckets entirely.
    for (const [k, v] of buckets) {
      if (v.every((t) => now - t >= windowMs)) buckets.delete(k);
    }
  }
  return true;
}

/** Best-effort client IP for rate-limit keys (reverse-proxy aware). */
export function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "local";
}

export function tooManyRequests(retryAfterSeconds: number): Response {
  return new Response(JSON.stringify({ code: 429, message: "Too many requests" }), {
    status: 429,
    headers: {
      "Content-Type": "application/json",
      "Retry-After": String(retryAfterSeconds),
    },
  });
}
