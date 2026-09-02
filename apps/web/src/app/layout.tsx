import type { ReactNode } from "react";

/**
 * Intentionally transparent (next-intl pattern): <html>/<body> are owned by
 * [locale]/layout.tsx so they can carry the active locale (`lang`), messages
 * and theme providers.
 *
 * Root-level routes that never enter a locale segment (app/not-found.tsx,
 * app/global-error.tsx) each inline their own <html>/<body> skeleton —
 * required because this layout provides none. Keep that invariant when
 * adding new root-level routes, or the page will render without a document
 * skeleton (hydration warnings, missing globals.css).
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
