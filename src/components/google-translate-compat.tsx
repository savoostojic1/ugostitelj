"use client";

import { useEffect } from "react";
import { installGoogleTranslateDomPatch } from "@/lib/google-translate/dom-patch";

/**
 * Installs a one-time DOM safety net so React updates do not crash when
 * Google Translate relocates text nodes. Interactive labels still need
 * element wrappers; this only prevents hard NotFoundError failures.
 */
export function GoogleTranslateCompat() {
  useEffect(() => {
    installGoogleTranslateDomPatch();
  }, []);

  return null;
}
