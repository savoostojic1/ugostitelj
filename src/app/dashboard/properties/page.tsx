import { Suspense } from "react";
import PropertiesPageClient from "./properties-page-client";

export default function PropertiesPage() {
  return (
    <Suspense fallback={null}>
      <PropertiesPageClient />
    </Suspense>
  );
}
