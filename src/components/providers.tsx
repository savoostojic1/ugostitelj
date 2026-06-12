"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { Toaster } from "sonner";
import { PushNavigationHandler } from "@/components/pwa/push-navigation-handler";
import { PwaAppGuard } from "@/components/pwa/pwa-app-guard";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <PwaAppGuard>
          <PushNavigationHandler />
          {children}
        </PwaAppGuard>
        <Toaster
          richColors
          position="top-right"
          className="hostvia-toaster"
          offset="calc(env(safe-area-inset-top, 0px) + 3.25rem)"
          mobileOffset="calc(env(safe-area-inset-top, 0px) + 3.5rem)"
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
