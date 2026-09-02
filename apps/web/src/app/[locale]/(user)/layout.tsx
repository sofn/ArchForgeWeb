import type { Metadata } from "next";

/**
 * Private, cookie-gated pages (profile / write / notifications / …): never
 * indexable. robots.ts already disallows crawling; this belt-and-braces
 * noindex keeps pages that leak via redirects or cached copies out of search
 * results regardless of the crawler honoring robots.txt.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return children;
}
