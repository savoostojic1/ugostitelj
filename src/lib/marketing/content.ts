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

export const marketingNav = [
  { href: "/funkcije", label: "Features" },
  { href: "/kako-radi", label: "How it works" },
  { href: "/javni-sajt", label: "Booking site" },
  { href: "/cijene", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
] as const;

/** Marketing pages that must stay public when logged out. */
export const marketingPublicPaths = [
  "/",
  ...marketingNav.map((item) => item.href),
  "/o-nama",
  "/kontakt",
  "/privatnost",
  "/uslovi",
] as const;

export function isMarketingPublicPath(path: string): boolean {
  return marketingPublicPaths.some(
    (publicPath) =>
      path === publicPath || path.startsWith(`${publicPath}/`)
  );
}

export const marketingFooter = {
  product: [
    { href: "/funkcije", label: "Features" },
    { href: "/kako-radi", label: "How it works" },
    { href: "/javni-sajt", label: "Booking site" },
    { href: "/cijene", label: "Pricing" },
  ],
  company: [
    { href: "/o-nama", label: "About" },
    { href: "/kontakt", label: "Contact" },
    { href: "/faq", label: "FAQ" },
  ],
  legal: [
    { href: "/privatnost", label: "Privacy" },
    { href: "/uslovi", label: "Terms of service" },
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
      "Connect Airbnb and Booking.com calendars with one link. All reservations sync into a single view.",
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
      "Guests send inquiries directly to you — no platform commission. You decide whether to accept.",
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
      "Paste your iCal link from Airbnb or Booking.com. Reservations sync automatically.",
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
      "Inquiries go straight to you. No middleman, no hidden fees on direct bookings.",
  },
];

export const pricingSectionCopy = {
  eyebrow: "Pricing",
  headline: "Start free. Upgrade only when your business grows.",
  subheadline:
    "Manage up to 2 properties completely free. Upgrade only when you need more.",
};

export const pricingPlans = [
  {
    tier: "free" as const,
    name: "Free",
    price: "0€",
    period: "month",
    description: "Everything you need to run your first listings.",
    highlighted: false,
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
  {
    tier: "pro" as const,
    name: "Pro",
    price: "20€",
    regularPrice: "30€",
    period: "month",
    description: "For hosts growing beyond two properties.",
    highlighted: true,
    features: [
      "Unlimited properties",
      "Everything in Free",
      "Portfolio management",
      "Future premium features",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    href: "/register",
  },
];

export const faqItems = [
  {
    question: "What is Hostvia?",
    answer:
      "Hostvia is a platform for short-term rental hosts. It combines an Airbnb and Booking.com calendar with your own booking website for direct guest inquiries — all in one place.",
  },
  {
    question: "Do I need the Airbnb or Booking API?",
    answer:
      "No. Hostvia uses iCal (ICS) calendars that platforms already provide. Paste the link and reservations import automatically — no technical integration required.",
  },
  {
    question: "How do booking inquiries work?",
    answer:
      "On your public site, guests pick dates, see the price and send an inquiry with contact details. You get notified in the dashboard, review details and contact the guest directly.",
  },
  {
    question: "Can guests pay through Hostvia?",
    answer:
      "Not yet — Hostvia is not a payment processor. Inquiries are reservation requests; payment and confirmation are arranged directly between you and the guest.",
  },
  {
    question: "Can I use Hostvia as a calendar only?",
    answer:
      "Yes. The booking site is optional. You can use the dashboard only for calendar sync, manual bookings and arrivals/departures overview.",
  },
  {
    question: "How does sync work?",
    answer:
      "Calendars refresh automatically in the background. You can also trigger a manual sync from the dashboard anytime.",
  },
  {
    question: "Can I export my calendar back to Airbnb/Booking?",
    answer:
      "Yes. Each unit has an iCal export link you can add to Airbnb or Booking.com so platforms see your manual blocks and direct bookings.",
  },
  {
    question: "Who is Hostvia for?",
    answer:
      "Independent hosts, small apartment complexes and property owners who want simpler multi-channel operations and direct guest contact.",
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
