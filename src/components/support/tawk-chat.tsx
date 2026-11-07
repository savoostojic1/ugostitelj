"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";
import {
  decodeGoogleTranslateProxyHost,
  isGoogleTranslateProxyHost,
} from "@/lib/public/browser-origin";
import { isBookingSubdomainHost } from "@/lib/public/booking-site-url";

const TAWK_EMBED_SRC =
  "https://embed.tawk.to/6aef4076387e843c391f3eb5/1k6r97jti";

declare global {
  interface Window {
    Tawk_API?: {
      hideWidget?: () => void;
      showWidget?: () => void;
      onLoad?: () => void;
    };
    Tawk_LoadStart?: Date;
    __hostviaTawkBooted?: boolean;
    __hostviaTawkHidden?: boolean;
  }
}

function hostForTawk(hostname: string): string {
  if (!isGoogleTranslateProxyHost(hostname)) return hostname;
  return decodeGoogleTranslateProxyHost(hostname) ?? hostname;
}

/** Guest booking sites, published guest guides, and admin do not get the support widget. */
export function shouldHideTawkChat(pathname: string, hostname = ""): boolean {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return true;
  if (pathname === "/host" || pathname.startsWith("/host/")) return true;
  if (pathname === "/guide" || pathname.startsWith("/guide/")) return true;
  if (hostname && isBookingSubdomainHost(hostForTawk(hostname))) return true;
  return false;
}

function applyTawkVisibility(hidden: boolean) {
  window.__hostviaTawkHidden = hidden;
  const api = window.Tawk_API;
  if (!api) return;

  const run = () => {
    if (window.__hostviaTawkHidden) api.hideWidget?.();
    else api.showWidget?.();
  };

  if (typeof api.hideWidget === "function") {
    run();
    return;
  }

  const previous = api.onLoad;
  api.onLoad = () => {
    previous?.();
    run();
  };
}

export function TawkChat() {
  const pathname = usePathname() || "/";
  const [hostname, setHostname] = useState<string | null>(null);

  useEffect(() => {
    setHostname(window.location.hostname);
  }, []);

  const pathHidden = shouldHideTawkChat(pathname);
  const hidden =
    pathHidden ||
    (hostname !== null && shouldHideTawkChat(pathname, hostname));
  const canDecide = pathHidden || hostname !== null;

  useEffect(() => {
    if (!canDecide) return;
    applyTawkVisibility(hidden);
  }, [canDecide, hidden]);

  if (!canDecide || hidden) return null;

  return (
    <Script id="tawk-to" strategy="afterInteractive">
      {`
        var Tawk_API = window.Tawk_API = window.Tawk_API || {};
        window.Tawk_LoadStart = window.Tawk_LoadStart || new Date();
        if (!window.__hostviaTawkBooted) {
          window.__hostviaTawkBooted = true;
          var previousOnLoad = Tawk_API.onLoad;
          Tawk_API.onLoad = function() {
            if (typeof previousOnLoad === "function") previousOnLoad();
            if (window.__hostviaTawkHidden && typeof Tawk_API.hideWidget === "function") {
              Tawk_API.hideWidget();
            }
          };
          (function(){
            var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            s1.src='${TAWK_EMBED_SRC}';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
          })();
        }
      `}
    </Script>
  );
}
