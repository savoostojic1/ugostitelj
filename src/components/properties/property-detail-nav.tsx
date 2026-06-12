"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function PropertyDetailNav({ propertyId }: { propertyId: string }) {
  const pathname = usePathname();
  const base = `/dashboard/properties/${propertyId}`;
  const calendarHref = `${base}/calendar`;

  const tabs = [
    {
      href: base,
      label: "Settings",
      shortLabel: "Settings",
      icon: Settings2,
      active: pathname === base,
    },
    {
      href: calendarHref,
      label: "Calendar & reservations",
      shortLabel: "Calendar",
      icon: CalendarDays,
      active: pathname.startsWith(calendarHref),
    },
  ];

  return (
    <nav className="hostvia-dashboard-page-inset flex gap-2 overflow-x-auto border-b border-border pb-1">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            tab.active
              ? "bg-accent text-foreground"
              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
          )}
        >
          <tab.icon className="h-4 w-4 shrink-0" />
          <span className="sm:hidden">{tab.shortLabel}</span>
          <span className="hidden sm:inline">{tab.label}</span>
        </Link>
      ))}
    </nav>
  );
}
