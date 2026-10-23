import type { Metadata } from "next";
import { AuthCallback } from "@/components/auth/auth-callback";
import { AuthShell } from "@/components/auth/auth-shell";
import { privatePageMetadata } from "@/lib/seo/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = privatePageMetadata(
  "Signing in",
  "Finishing Google sign-in for your Hostvia account."
);

export default function AuthCallbackPage() {
  return (
    <AuthShell>
      <AuthCallback />
    </AuthShell>
  );
}
