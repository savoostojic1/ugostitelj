import { GoogleAnalytics } from "@next/third-parties/google";
import { GA_MEASUREMENT_ID } from "@/lib/analytics/ga-measurement-id";

export function HostviaGoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null;

  return <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />;
}
