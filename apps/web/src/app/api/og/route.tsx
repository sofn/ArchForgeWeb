import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "ArchForgeWeb";
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
        }}
      >
        <div style={{ fontSize: 24, opacity: 0.85, marginBottom: 16 }}>ArchForgeWeb</div>
        <div>{title}</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
