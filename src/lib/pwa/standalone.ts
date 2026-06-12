import { parseBookingSubdomain } from "@/lib/public/booking-site-url";

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

export function isPwaAllowedPath(path: string, host?: string | null): boolean {
  if (
    path === "/login" ||
    path === "/register" ||
    path === "/forgot-password" ||
    path.startsWith("/dashboard") ||
    path.startsWith("/host/")
  ) {
    return true;
  }

  const hostname = host?.split(":")[0] ?? null;
  if (hostname && parseBookingSubdomain(hostname) && (path === "/" || path === "")) {
    return true;
  }

  return false;
}

export function isPwaBlockedPath(path: string, host?: string | null): boolean {
  if (isPwaAllowedPath(path, host)) return false;
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

/** Open an external URL in the system browser (not inside the installed PWA). */
export function openInSystemBrowser(url: string): void {
  if (typeof window === "undefined") return;

  const absolute = new URL(url, window.location.origin).href;
  const anchor = document.createElement("a");
  anchor.href = absolute;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer external";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  window.setTimeout(() => {
    window.open(absolute, "_blank", "noopener,noreferrer");
  }, 0);
}
