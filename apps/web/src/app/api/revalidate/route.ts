import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * On-demand cache invalidation webhook for the Next Data Cache.
 *
 * Wire this into the publishing flow (ArchForge backend emits a webhook on
 * article create/update/delete):
 *
 *   POST /api/revalidate?secret=<REVALIDATE_SECRET>
 *   { "tags": ["articles", "categories"] }
 *
 * Security: requires REVALIDATE_SECRET to be configured AND to match. With
 * the variable unset the endpoint is inert (401) — no accidental open
 * invalidation endpoint in environments that never opted in.
 * `tags` must match the tags used by lib/api/server.ts (default: "articles").
 */
export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected || !secret || secret !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { tags?: unknown };
  const tags = Array.isArray(body.tags)
    ? body.tags.filter((t): t is string => typeof t === "string")
    : [];
  if (tags.length === 0) {
    return NextResponse.json({ error: "`tags` (string[]) is required" }, { status: 400 });
  }

  for (const tag of tags) {
    // "max" = drop from every cache profile (stale-while-revalidate included);
    // the next request refetches from server-web.
    revalidateTag(tag, "max");
  }
  return NextResponse.json({ revalidated: true, tags, now: Date.now() });
}
