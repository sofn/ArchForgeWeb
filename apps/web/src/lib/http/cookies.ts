export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const entry = document.cookie.split("; ").find((row) => row.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.split("=")[1]) : null;
}

export function setAuthCookies(token: string, tokenName: string, refreshToken?: string) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `token=${encodeURIComponent(token)}; path=/; SameSite=Lax${secure}`;
  if (tokenName) {
    document.cookie = `tokenName=${encodeURIComponent(tokenName)}; path=/; SameSite=Lax${secure}`;
  }
  if (refreshToken) {
    document.cookie = `refreshToken=${encodeURIComponent(refreshToken)}; path=/; SameSite=Lax${secure}`;
  }
}

export function clearAuthCookies() {
  if (typeof document === "undefined") return;
  ["token", "tokenName", "refreshToken"].forEach((name) => {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  });
}
