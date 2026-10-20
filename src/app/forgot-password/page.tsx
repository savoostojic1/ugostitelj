import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { privatePageMetadata } from "@/lib/seo/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = privatePageMetadata(
  "Reset password",
  "Request a password reset link for your Hostvia account."
);

export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      <AuthForm mode="forgot" />
    </AuthShell>
  );
}
