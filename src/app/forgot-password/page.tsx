import Link from "next/link";
import { Sparkles } from "lucide-react";
import { AuthForm } from "@/components/auth/auth-form";

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return (
    <div className="hostvia-mesh-bg flex min-h-screen flex-col items-center justify-center px-4">
      <Link href="/" className="mb-8 flex items-center gap-2.5 font-semibold text-white">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        hostvia<span className="text-violet-400">.me</span>
      </Link>
      <div className="hostvia-glow-card w-full max-w-sm p-8">
        <AuthForm mode="forgot" />
      </div>
    </div>
  );
}
