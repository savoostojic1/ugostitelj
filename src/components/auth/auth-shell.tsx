import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="auth-page hostvia-mesh-bg dark">
      <div className="auth-layout">
        <div className="auth-form-wrap">
          <div className="mb-8 flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 font-semibold tracking-tight text-white"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 shadow-lg shadow-violet-500/25">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              hostvia<span className="text-violet-400">.me</span>
            </Link>
          </div>

          <div className={cn("auth-form-card mx-auto")}>{children}</div>

          <p className="mt-6 text-center text-xs text-zinc-500">
            By continuing you agree to our{" "}
            <Link href="/uslovi" className="text-zinc-400 hover:text-white">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privatnost" className="text-zinc-400 hover:text-white">
              Privacy policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
