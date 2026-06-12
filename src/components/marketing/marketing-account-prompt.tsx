"use client";

import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/hooks/use-auth-user";

export function MarketingAccountPrompt() {
  const { user, loading, displayName } = useAuthUser();

  if (loading) {
    return (
      <div className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
        <div className="mx-auto h-5 w-48 animate-pulse rounded bg-white/10" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
        <p className="font-semibold">You&apos;re signed in as {displayName}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Open your dashboard for account settings, or email us with your
          account details for faster support.
        </p>
        <Button className="mt-4" asChild>
          <Link href="/dashboard">
            <LayoutDashboard className="h-4 w-4" />
            Go to dashboard
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
      <p className="font-semibold">Already have an account?</p>
      <p className="mt-2 text-sm text-muted-foreground">
        For technical questions, include your account email and unit name in
        your message — we can help faster.
      </p>
      <Button className="mt-4" variant="outline" asChild>
        <Link href="/login">Log in to dashboard</Link>
      </Button>
    </div>
  );
}
