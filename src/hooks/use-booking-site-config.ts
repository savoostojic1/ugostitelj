import { useQuery } from "@tanstack/react-query";
import type { BookingSiteUrlOptions } from "@/lib/public/booking-site-url";

export type BookingSiteConfig = {
  useSubdomain: boolean;
  bookingDomain: string;
  siteBaseUrl: string;
};

async function fetchBookingSiteConfig(): Promise<BookingSiteConfig> {
  const res = await fetch("/api/booking/config", { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to load booking site config");
  }
  return res.json();
}

export function useBookingSiteConfig() {
  return useQuery({
    queryKey: ["booking-site-config"],
    queryFn: fetchBookingSiteConfig,
    staleTime: 60 * 1000,
  });
}

export function bookingUrlOptionsFromConfig(
  config: BookingSiteConfig | undefined,
  origin?: string
): BookingSiteUrlOptions | undefined {
  if (!config) return undefined;

  return {
    baseUrl: origin ?? config.siteBaseUrl,
    useSubdomain: config.useSubdomain,
    bookingDomain: config.bookingDomain,
  };
}
