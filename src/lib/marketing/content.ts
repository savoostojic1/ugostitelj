import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  Globe,
  Layers,
  MessageSquare,
  RefreshCw,
  Upload,
  Users,
  Wallet,
} from "lucide-react";
import {
  FREE_PROPERTY_LIMIT,
  PRO_MONTHLY_PRICE_USD,
} from "@/lib/subscriptions/plans";

export const marketingNav = [
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/booking-site", label: "Booking site" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
] as const;

/** Marketing pages that must stay public when logged out. */
export const marketingPublicPaths = [
  "/",
  ...marketingNav.map((item) => item.href),
  "/about",
  "/contact",
  "/guides",
  "/terms",
  "/privacy",
  "/refund-policy",
] as const;

export function isMarketingPublicPath(path: string): boolean {
  return marketingPublicPaths.some(
    (publicPath) =>
      path === publicPath || path.startsWith(`${publicPath}/`)
  );
}

export const marketingFooter = {
  product: [
    { href: "/features", label: "Features" },
    { href: "/how-it-works", label: "How it works" },
    { href: "/booking-site", label: "Booking site" },
    { href: "/pricing", label: "Pricing" },
    { href: "/guides", label: "Guides" },
  ],
  company: [
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/faq", label: "FAQ" },
  ],
  legal: [
    { href: "/terms", label: "Terms of service" },
    { href: "/privacy", label: "Privacy policy" },
    { href: "/refund-policy", label: "Refunds and cancellation" },
  ],
  contact: {
    email: "hello@hostvia.me",
  },
} as const;

export interface MarketingFeature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const coreFeatures: MarketingFeature[] = [
  {
    icon: RefreshCw,
    title: "iCal sync",
    description:
      "Import Airbnb and Booking.com with the iCal link each listing already provides. Refresh is about hourly, not instant.",
  },
  {
    icon: Layers,
    title: "All units in one place",
    description:
      "Manage apartments, bungalows and rooms from one dashboard — with separate calendars per unit.",
  },
  {
    icon: Globe,
    title: "Your booking website",
    description:
      "Publish a guest-facing page with date search, gallery, map and direct booking inquiries.",
  },
  {
    icon: Wallet,
    title: "Date-based pricing",
    description:
      "Set a base price and special rates for seasons, holidays or weekends — guests see the exact stay total.",
  },
  {
    icon: Upload,
    title: "Manual bookings & export",
    description:
      "Block dates, add direct bookings and export your calendar back to platforms.",
  },
  {
    icon: MessageSquare,
    title: "Booking inquiries",
    description:
      "Guests send an inquiry to you. Hostvia does not charge a commission on that inquiry, and you decide whether to accept it.",
  },
];

export const howItWorksSteps = [
  {
    step: "01",
    title: "Create your account",
    description:
      "Sign up in under a minute. Add your first unit — apartment, room or bungalow.",
  },
  {
    step: "02",
    title: "Connect calendars",
    description:
      "Paste the iCal link from Airbnb or Booking.com. Reservations import on the next sync, which is about hourly while you are using Hostvia.",
  },
  {
    step: "03",
    title: "Publish your booking site",
    description:
      "Add photos, description, pricing and location. Share your link with guests and on social media.",
  },
  {
    step: "04",
    title: "Receive inquiries",
    description:
      "Guests pick dates, see availability and price, then send you an inquiry. You confirm and arrange details.",
  },
];

export const publicSiteFeatures: MarketingFeature[] = [
  {
    icon: CalendarDays,
    title: "Date search",
    description:
      "Guests choose check-in, check-out and number of guests — and only see available units with accurate stay pricing.",
  },
  {
    icon: Layers,
    title: "All units overview",
    description:
      "Per-unit availability calendar, gallery up to 10 photos and clear capacity information.",
  },
  {
    icon: Globe,
    title: "Professional look",
    description:
      "Cover photo, branded profile, location map and contact — no coding required.",
  },
  {
    icon: Users,
    title: "Direct guest relationship",
    description:
      "Inquiries come to you. Hostvia does not take a commission on them, and it does not collect the guest's payment.",
  },
];

export const pricingSectionCopy = {
  eyebrow: "Pricing",
  headline: "Start free. Pay only when you grow.",
  subheadline:
    "Everything you need for up to 2 properties — no credit card required.",
  upgradeNote: `More than 2 properties? Pro is $${PRO_MONTHLY_PRICE_USD}/month when you need it.`,
};

export const pricingPlans = [
  {
    tier: "free" as const,
    name: "Free",
    price: "$0",
    period: "month",
    description: "Everything you need to run your listings.",
    features: [
      "Up to 2 properties",
      "Direct booking website",
      "Calendar sync",
      "Reservations",
      "Dashboard",
      "Airbnb & Booking imports",
    ],
    cta: "Start free",
    href: "/register",
  },
];

export const faqItems = [
  {
    question: "What is Hostvia?",
    answer:
      "Hostvia is software for vacation rental owners and small accommodation operators. It puts Airbnb and Booking.com calendars, manual reservations, arrivals, a cleaning overview, and a public inquiry site in one account.",
  },
  {
    question: "Who is Hostvia for?",
    answer:
      "It is for owners and small operators who manage their own places, including people with one or two rentals on the Free plan and people who need more than two properties on Pro. It is not a full channel manager and it does not replace Airbnb or Booking.com.",
  },
  {
    question: "What is included in the Free plan?",
    answer: `The Free plan includes up to ${FREE_PROPERTY_LIMIT} active properties, the public inquiry site, calendar import and export, reservations, the dashboard, arrivals and departures, the cleaning overview, and saved guest messages. No card is required.`,
  },
  {
    question: "What does Pro change?",
    answer: `Pro is $${PRO_MONTHLY_PRICE_USD} per month for the whole account, billed through Stripe. It removes the limit of ${FREE_PROPERTY_LIMIT} properties. The same tools are available on Free and Pro.`,
  },
  {
    question: "Do I need the Airbnb or Booking.com API?",
    answer:
      "No. Hostvia uses the iCal links those platforms already give you. Paste the link and reservations import on the next sync. There is no API key to create.",
  },
  {
    question: "Does calendar sync stop double bookings?",
    answer:
      "It lowers the risk. It does not remove it. Hostvia refreshes calendars about once an hour while the dashboard is open, and you can sync manually. Airbnb and Booking.com update imported calendars on their own schedule, so a new stay can exist on one platform before another shows it.",
  },
  {
    question: "Why might Booking.com closed days look like reservations?",
    answer:
      "Booking.com can export closed days with the same label as real bookings. In Booking.com, choose booked dates only before you copy the export link. Airbnb dates marked unavailable or blocked are stored in Hostvia as blocks, not as guests.",
  },
  {
    question: "How do guest inquiries work?",
    answer:
      "On your public site, a guest picks dates, sees the stay total when you have entered prices, and sends an inquiry with contact details. Hostvia does not charge the guest and does not confirm the stay. You accept or decline. Accepting turns the inquiry into a reservation on your calendar.",
  },
  {
    question: "Can guests pay through Hostvia?",
    answer:
      "No. Hostvia is not a payment processor for stays. You arrange payment and the remaining details directly with the guest.",
  },
  {
    question: "Can I use Hostvia without publishing a website?",
    answer:
      "Yes. The public site is optional. You can use the dashboard for calendars, manual reservations, arrivals, departures, and the cleaning overview.",
  },
  {
    question: "Does the cleaning page assign work to cleaners?",
    answer:
      "No. The Cleanings page shows arrivals, departures, and mid-stay days for each property. The count of cleanings on a day equals the number of departures. It does not assign a cleaner, send them a job, or mark a clean as finished. Team access can let someone view the sections you choose.",
  },
  {
    question: "Can I export my calendar back to Airbnb or Booking.com?",
    answer:
      "Yes. Each property has an iCal export link. Current stays are included. Blocks export as unavailable, and manual or imported reservations export as busy. Past stays are not exported. The other platform still decides when it reads that link.",
  },
];

export const dashboardFeatures = [
  {
    title: "Calendar overview",
    description:
      "Monthly view of all reservations — check-in, check-out and stayovers at a glance, with platform badges.",
  },
  {
    title: "Per-unit calendars",
    description:
      "Compact availability view for every unit — ideal for quick free-date checks.",
  },
  {
    title: "Arrivals & departures",
    description:
      "Operational view of who is arriving and leaving today — helps plan cleaning and guest welcome.",
  },
  {
    title: "Saved messages",
    description:
      "Store reusable guest messages — faster replies and less repetitive typing.",
  },
  {
    title: "PWA app",
    description:
      "Install Hostvia on your phone — quick calendar access without opening the browser.",
  },
];

export const homepageStats = [
  { value: "2+", label: "platforms synced" },
  { value: "1", label: "dashboard for all" },
  { value: "0%", label: "commission on direct bookings" },
];
