import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

import { privatePageMetadata } from "@/lib/seo/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = privatePageMetadata(
  "Create account",
  "Create a free Hostvia account for up to two properties. No card is required."
);

export default function RegisterPage() {
  return (
    <AuthShell>
      <AuthForm mode="register" />
    </AuthShell>
  );
}
