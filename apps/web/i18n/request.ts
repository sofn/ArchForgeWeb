import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ locale, requestLocale }) => {
  const resolved = locale ?? (await requestLocale) ?? "en";
  const messages = (await import(`../messages/${resolved}.json`)).default;
  return { locale: resolved, messages };
});
