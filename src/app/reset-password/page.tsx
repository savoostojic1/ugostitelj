import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { privatePageMetadata } from "@/lib/seo/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = privatePageMetadata(
  "New password",
  "Choose a new password for your Hostvia account."
);

export default function ResetPasswordPage() {
  return (
    <AuthShell>
      <ResetPasswordForm />
    </AuthShell>
  );
}
