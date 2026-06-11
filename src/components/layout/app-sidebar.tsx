"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ClipboardPen,
  Globe,
  Home,
  Inbox,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  Sparkles,
  SprayCan,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui-store";
import { useSupabase } from "@/hooks/use-supabase";
import { useRouter } from "next/navigation";

const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/cleanings", label: "Cleanings", icon: SprayCan },
      { href: "/dashboard/calendars", label: "Calendars", icon: LayoutGrid },
      { href: "/dashboard/arrivals", label: "Arrivals", icon: CalendarDays },
    ],
  },
  {
    label: "Properties",
    items: [
      { href: "/dashboard/properties", label: "All properties", icon: Home },
      {
        href: "/dashboard/manual-reservations",
        label: "Manual bookings",
        icon: ClipboardPen,
      },
    ],
  },
  {
    label: "Direct bookings",
    items: [
      { href: "/dashboard/public-site", label: "Booking site", icon: Globe },
      {
        href: "/dashboard/booking-requests",
        label: "Inquiries",
        icon: Inbox,
      },
      { href: "/dashboard/porouka", label: "Messages", icon: MessageSquare },
    ],
  },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useSupabase();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 px-5">
        <Link
          href="/dashboard"
          className="flex items-center gap-3"
          onClick={onNavigate}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 shadow-lg shadow-violet-500/25">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="font-semibold tracking-tight text-white">
              hostvia
            </span>
            <span className="text-violet-400">.me</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-2">
        {navGroups.map((group) => (
          <div key={group.label} className="hostvia-sidebar-nav-group">
            <p className="hostvia-sidebar-nav-label">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "hostvia-sidebar-link",
                      active && "hostvia-sidebar-link-active"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0 opacity-80" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-2 border-t border-white/6 p-3">
        <Link
          href="/dashboard/properties/new"
          onClick={onNavigate}
          className="hostvia-btn-gradient flex h-9 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold"
        >
          <Plus className="h-4 w-4" />
          Add property
        </Link>
        <button
          type="button"
          onClick={signOut}
          className="hostvia-sidebar-link w-full"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export function AppSidebar() {
  const { sidebarOpen, setSidebarOpen } = useUiStore();

  return (
    <>
      <aside className="hostvia-sidebar hidden w-64 shrink-0 md:block">
        <SidebarContent />
      </aside>

      <div className="hostvia-sidebar sticky top-0 z-30 pt-safe md:hidden">
        <div className="flex h-14 items-center gap-3 px-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/5"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold text-white">
            hostvia<span className="text-violet-400">.me</span>
          </span>
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="hostvia-sidebar absolute left-0 top-0 flex h-full w-72 flex-col pt-safe shadow-2xl">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-[calc(env(safe-area-inset-top,0px)+0.5rem)] text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="flex min-h-0 flex-1 flex-col">
              <SidebarContent onNavigate={() => setSidebarOpen(false)} />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
