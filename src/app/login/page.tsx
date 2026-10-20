import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

import { privatePageMetadata } from "@/lib/seo/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = privatePageMetadata(
  "Sign in",
  "Sign in to your Hostvia dashboard to manage calendars, properties, and guest inquiries."
);

export default function LoginPage() {
  return (
    <AuthShell>
      <AuthForm mode="login" />
    </AuthShell>
  );
}
