import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

interface RemotePattern {
  protocol?: "http" | "https";
  hostname: string;
  port?: string;
  pathname?: string;
}

function getApiRemotePattern(): RemotePattern | null {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081";
  try {
    const url = new URL(baseUrl);
    return {
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      port: url.port || undefined,
    };
  } catch {
    return null;
  }
}

const apiRemotePattern = getApiRemotePattern();

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: apiRemotePattern ? [apiRemotePattern] : [],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; img-src 'self' data: blob: http: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' http: https:; font-src 'self' data:;",
          },
        ],
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
