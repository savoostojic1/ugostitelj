"use client";

import { useEffect } from "react";
import { parseRecoveryHash } from "@/lib/auth/password-recovery";

/** Mail links sometimes land on the site root with the session in the hash. */
export function RecoveryHashRedirect() {
  useEffect(() => {
    if (window.location.pathname === "/reset-password") return;
    if (!parseRecoveryHash(window.location.hash)) return;
    window.location.replace(`/reset-password${window.location.hash}`);
  }, []);

  return null;
}
