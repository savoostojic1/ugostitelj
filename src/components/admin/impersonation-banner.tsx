"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ImpersonationBanner({
  email,
  username,
}: {
  email: string;
  username: string | null;
}) {
  const router = useRouter();
  const [exiting, setExiting] = useState(false);
  const label = username ? `@${username}` : email;

  async function handleExit() {
    setExiting(true);
    try {
      const res = await fetch("/api/admin/impersonate/exit", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? "Could not exit impersonation");
      }
      window.location.href = data.redirectTo ?? "/admin/dashboard";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not exit");
      setExiting(false);
      router.refresh();
    }
  }

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between gap-3 border-b border-amber-500/30 bg-amber-500/15 px-4 py-2 text-sm text-amber-50">
      <div className="flex min-w-0 items-center gap-2">
        <ShieldAlert className="h-4 w-4 shrink-0 text-amber-300" />
        <p className="truncate">
          Viewing as <span className="font-medium text-white">{label}</span>
          {username ? (
            <span className="text-amber-100/70"> ({email})</span>
          ) : null}
        </p>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="shrink-0 border-amber-400/40 bg-amber-500/10 text-amber-50 hover:bg-amber-500/20"
        disabled={exiting}
        onClick={() => void handleExit()}
      >
        {exiting ? <Loader2 className="animate-spin" /> : null}
        Exit to admin
      </Button>
    </div>
  );
}
