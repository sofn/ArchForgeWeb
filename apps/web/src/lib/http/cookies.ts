/**
 * Browser-side cookie reader.
 *
 * Auth cookies (token/tokenName/refreshToken) are HttpOnly and written only
 * by server route handlers — see lib/http/auth-cookies.ts. The ONLY readable
 * auth signal is the non-sensitive `hasSession` indicator, which is exactly
 * what this module is still used for.
 */

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const entry = document.cookie.split("; ").find((row) => row.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.split("=")[1]) : null;
}
