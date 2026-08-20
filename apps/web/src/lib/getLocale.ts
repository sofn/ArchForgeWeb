import { getLocale as getRequestLocale } from "next-intl/server";
import { DEFAULT_LOCALE, LOCALES, type AppLocale } from "./routes";

export async function getLocale(): Promise<AppLocale> {
  const locale = await getRequestLocale();
  return LOCALES.includes(locale as AppLocale) ? (locale as AppLocale) : DEFAULT_LOCALE;
}
