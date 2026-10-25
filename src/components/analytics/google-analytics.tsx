import Script from "next/script";
import {
  GA_MEASUREMENT_ID,
  GOOGLE_ADS_ID,
} from "@/lib/analytics/ga-measurement-id";

const TAG_IDS = [GA_MEASUREMENT_ID, GOOGLE_ADS_ID].filter(Boolean);

/**
 * One Google tag for GA4 and Google Ads.
 * The Ads ID is the script URL so Google Ads can see the tag it asked to install.
 * Each ID still gets its own gtag('config', ...) call.
 */
export function HostviaGoogleAnalytics() {
  if (TAG_IDS.length === 0) return null;

  const configLines = TAG_IDS.map((id) => `gtag('config', '${id}');`).join("\n");

  return (
    <>
      <Script id="hostvia-gtag-init">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          ${configLines}
        `}
      </Script>
      <Script
        id="hostvia-gtag"
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID || GA_MEASUREMENT_ID}`}
      />
    </>
  );
}
