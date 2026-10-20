"use client";

import { useEffect } from "react";
import { trackOncePerSession } from "@/lib/analytics/track";

export function TrackPricingView() {
  useEffect(() => {
    trackOncePerSession("view_pricing", { page: "pricing" });
  }, []);

  return null;
}
