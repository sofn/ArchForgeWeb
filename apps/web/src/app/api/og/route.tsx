import { ImageResponse } from "next/og";

export const runtime = "edge";

const MAX_TITLE_LENGTH = 120;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // Hard length cap: longer titles overflow the 1200px canvas (satori has no
  // ellipsis), and unbounded input would be a cheap DoS vector against the
  // edge renderer.
  const title = (searchParams.get("title") || "ArchForgeWeb").slice(0, MAX_TITLE_LENGTH);

  try {
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            background: "linear-gradient(135deg, #312e81 0%, #4f46e5 50%, #7c3aed 100%)",
            color: "white",
            padding: "64px",
            fontSize: 56,
            fontWeight: 700,
            overflow: "hidden",
          }}
        >
          <div style={{ fontSize: 24, opacity: 0.85, marginBottom: 16 }}>ArchForgeWeb</div>
          <div style={{ display: "flex", lineClamp: 4, overflow: "hidden" }}>{title}</div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        // Share crawlers (Twitter/Slack/Discord/WeChat) are the only audience:
        // render once per CDN node per day, serve stale during revalidation.
        headers: {
          "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
        },
      }
    );
  } catch {
    // ImageResponse failures (e.g. exotic glyphs satori cannot rasterize) must
    // not surface as HTML error pages to crawlers expecting an image.
    return new Response("OG image generation failed", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
