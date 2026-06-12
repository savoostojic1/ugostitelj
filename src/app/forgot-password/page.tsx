import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reset password — Hostvia",
  description: "Reset your Hostvia account password.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      <AuthForm mode="forgot" />
    </AuthShell>
  );
}
