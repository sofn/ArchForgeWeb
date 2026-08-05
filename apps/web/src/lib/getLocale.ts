import { cookies, headers } from "next/headers";

const SUPPORTED_LOCALES = ["en", "zh"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

export async function getLocale(): Promise<Locale> {
  const cookieLocale = (await cookies()).get("NEXT_LOCALE")?.value;
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }

  const acceptLanguage = (await headers()).get("accept-language") || "";
  if (acceptLanguage.toLowerCase().startsWith("zh")) {
    return "zh";
  }
  return "en";
}
