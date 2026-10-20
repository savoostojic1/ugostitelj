"use client";

import { useEffect } from "react";
import {
  clearInternalTraffic,
  markInternalTraffic,
} from "@/lib/analytics/track";

/** Sets a browser flag from ?hv_internal=1 or clears it with ?hv_internal=0. No personal data is stored. */
export function InternalTrafficMarker() {
  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("hv_internal");
    if (value === "1") markInternalTraffic();
    if (value === "0") clearInternalTraffic();
  }, []);

  return null;
}
