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
  images: {
    remotePatterns: apiRemotePattern ? [apiRemotePattern] : [],
  },
};

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(nextConfig);
