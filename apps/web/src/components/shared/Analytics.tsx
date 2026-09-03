import Script from "next/script";

/**
 * Umami analytics (privacy-friendly, cookieless — no consent banner needed).
 * next/script with lazyOnload defers it below interactivity; under the
 * strict-dynamic CSP, scripts injected by the trusted Next runtime load
 * without being listed in script-src.
 */
export function Analytics() {
  const umamiUrl = process.env.NEXT_PUBLIC_UMAMI_URL;
  const umamiId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  if (!umamiUrl || !umamiId) return null;
  return <Script src={umamiUrl} data-website-id={umamiId} strategy="lazyOnload" />;
}
