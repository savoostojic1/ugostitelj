"use client";

import { useEffect, useState } from "react";
import { isStandaloneDisplayMode } from "@/lib/pwa/standalone";

export function useIsStandalonePwa(): boolean {
  const [isPwa, setIsPwa] = useState(false);

  useEffect(() => {
    setIsPwa(isStandaloneDisplayMode());
  }, []);

  return isPwa;
}
