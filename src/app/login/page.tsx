import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in — Hostvia",
  description: "Sign in to your Hostvia dashboard to manage calendars, properties and direct bookings.",
};

export default function LoginPage() {
  return (
    <AuthShell>
      <AuthForm mode="login" />
    </AuthShell>
  );
}
