import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_SC } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { headers } from "next/headers";
import { routing } from "@/i18n/routing";
import { getSiteUrl, localeAlternates } from "@/lib/site";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Analytics } from "@/components/shared/Analytics";
import "../globals.css";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

// viewport lives outside `metadata` since Next 15; themeColor follows the
// app's light/dark scheme so the browser chrome (PWA title bar, address bar
// tint) matches the active theme.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

// Self-hosted at build time (zero runtime requests to Google Fonts, no
// CLS thanks to auto-generated size-adjusted fallbacks, automatic preload).
// Latin glyphs via Inter, CJK via Noto Sans SC — both exposed as CSS variables so
// globals.css can compose the stack. Note for CN-based CI runners: next/font
// needs fonts.googleapis.com reachability at build time; if that is a
// problem, switch to next/font/local with committed woff2 files.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const notoSansSC = Noto_Sans_SC({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-noto-sc",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const site = getSiteUrl();
  return {
    metadataBase: new URL(site),
    title: {
      default: t("title"),
      template: `%s · ${t("title")}`,
    },
    description: t("description"),
    alternates: {
      languages: localeAlternates(),
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      locale,
      type: "website",
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();
  // CSP nonce (see middleware) — consumed by ThemeProvider so its no-flash
  // inline theme script passes script-src. Reading headers() makes pages
  // dynamic; accepted trade-off for a nonce-based CSP.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${notoSansSC.variable}`}
    >
      <body className="bg-background text-foreground min-h-screen antialiased">
        <ThemeProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <QueryProvider>
              <AuthProvider>
                <Header />
                <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">{children}</main>
                <BottomNav />
                <Analytics />
              </AuthProvider>
            </QueryProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
