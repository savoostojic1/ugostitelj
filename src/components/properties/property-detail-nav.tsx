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
      icon: Settings2,
      active: pathname === base,
    },
    {
      href: calendarHref,
      label: "Calendar & reservations",
      icon: CalendarDays,
      active: pathname.startsWith(calendarHref),
    },
  ];

  return (
    <nav className="flex flex-wrap gap-2 border-b border-border pb-1">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            tab.active
              ? "bg-accent text-foreground"
              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
          )}
        >
          <tab.icon className="h-4 w-4" />
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
