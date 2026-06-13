import { Suspense } from "react";
import BillingSuccessClient from "./billing-success-client";

export default function BillingSuccessPage() {
  return (
    <Suspense fallback={null}>
      <BillingSuccessClient />
    </Suspense>
  );
}
