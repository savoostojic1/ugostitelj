export const PWA_STANDALONE_COOKIE = "hostvia-standalone";

export function isStandaloneDisplayMode(): boolean {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    ("standalone" in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

export function isPwaAllowedPath(path: string): boolean {
  return (
    path === "/login" ||
    path === "/register" ||
    path === "/forgot-password" ||
    path.startsWith("/dashboard")
  );
}

export function isPwaBlockedPath(path: string): boolean {
  if (isPwaAllowedPath(path)) return false;
  if (path.startsWith("/api/")) return false;
  if (path.startsWith("/_next/")) return false;
  if (
    path === "/icon" ||
    path === "/apple-icon" ||
    path.startsWith("/manifest")
  ) {
    return false;
  }
  return true;
}

export function setStandaloneCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${PWA_STANDALONE_COOKIE}=1; path=/; max-age=31536000; samesite=lax`;
}
