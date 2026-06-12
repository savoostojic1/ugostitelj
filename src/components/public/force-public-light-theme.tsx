"use client";

import { useLayoutEffect } from "react";
import { useTheme } from "next-themes";

export function ForcePublicLightTheme() {
  const { setTheme } = useTheme();

  useLayoutEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
    setTheme("light");

    return () => {
      document.documentElement.style.colorScheme = "";
      setTheme("dark");
    };
  }, [setTheme]);

  return null;
}
