import type { CalendarPlatform } from "@/types/database";

export const PLATFORM_LABELS: Record<CalendarPlatform, string> = {
  airbnb: "Airbnb",
  booking: "Booking.com",
  custom: "Custom",
};

export const PLATFORM_COLORS: Record<
  CalendarPlatform,
  { bg: string; border: string; text: string }
> = {
  airbnb: {
    bg: "bg-[#ff5a5f]/15",
    border: "border-[#ff5a5f]/40",
    text: "text-[#ff5a5f]",
  },
  booking: {
    bg: "bg-[#003580]/15",
    border: "border-[#003580]/40",
    text: "text-[#4a9eff]",
  },
  custom: {
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/40",
    text: "text-emerald-400",
  },
};
