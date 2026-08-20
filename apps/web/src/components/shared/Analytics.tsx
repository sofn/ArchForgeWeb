export function Analytics() {
  const umamiUrl = process.env.NEXT_PUBLIC_UMAMI_URL;
  const umamiId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  if (!umamiUrl || !umamiId) return null;
  return <script defer src={umamiUrl} data-website-id={umamiId} />;
}
