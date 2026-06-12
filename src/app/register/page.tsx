import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create account — Hostvia",
  description:
    "Create your free Hostvia account — booking website, calendar sync and reservation dashboard for property owners.",
};

export default function RegisterPage() {
  return (
    <AuthShell>
      <AuthForm mode="register" />
    </AuthShell>
  );
}
