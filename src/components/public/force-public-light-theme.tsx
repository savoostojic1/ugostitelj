"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

export function ForcePublicLightTheme() {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme("light");

    return () => {
      setTheme("dark");
    };
  }, [setTheme]);

  return null;
}
