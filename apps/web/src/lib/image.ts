import { API_BASE } from "./httpClient";

function getAllowedImageOrigins(): Set<string> {
  const origins = new Set<string>();

  try {
    const url = new URL(API_BASE);
    origins.add(`${url.protocol}//${url.host}`);
  } catch {
    // ignore invalid API_BASE
  }

  const extra = process.env.NEXT_PUBLIC_ALLOWED_IMAGE_DOMAINS?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  extra?.forEach((domain) => {
    if (domain.startsWith("http://") || domain.startsWith("https://")) {
      try {
        const url = new URL(domain);
        origins.add(`${url.protocol}//${url.host}`);
      } catch {
        // ignore invalid domain
      }
    } else {
      origins.add(`https://${domain}`);
      origins.add(`http://${domain}`);
    }
  });

  return origins;
}

const ALLOWED_IMAGE_ORIGINS = getAllowedImageOrigins();

export function isAllowedImageUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
    return ALLOWED_IMAGE_ORIGINS.has(`${parsed.protocol}//${parsed.host}`);
  } catch {
    return false;
  }
}
