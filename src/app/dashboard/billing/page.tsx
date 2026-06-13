import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { BillingPageClient } from "@/components/billing/billing-page-client";

export const metadata: Metadata = {
  title: "Pricing plan — Hostvia",
};

export default function DashboardBillingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
        </div>
      }
    >
      <BillingPageClient />
    </Suspense>
  );
}
