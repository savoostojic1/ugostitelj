import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { BillingPageClient } from "@/components/billing/billing-page-client";

import { privatePageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = privatePageMetadata(
  "Pricing plan",
  "Private billing page for the signed-in Hostvia account."
);

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
