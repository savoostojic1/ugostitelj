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
  Shield,
  Sparkles,
  SprayCan,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui-store";
import { useSupabase } from "@/hooks/use-supabase";
import { useRouter } from "next/navigation";
import { InstallAppSidebarButton } from "@/components/pwa/install-app-sidebar-button";
import { useDashboardContext } from "@/hooks/use-team-access";
import {
  TEAM_PERMISSION_ROUTES,
  type TeamPermission,
} from "@/lib/team-access/permissions";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  permission?: TeamPermission;
  ownerOnly?: boolean;
};

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [
      {
        href: TEAM_PERMISSION_ROUTES.dashboard,
        label: "Dashboard",
        icon: LayoutDashboard,
        permission: "dashboard",
      },
      {
        href: TEAM_PERMISSION_ROUTES.cleanings,
        label: "Cleanings",
        icon: SprayCan,
        permission: "cleanings",
      },
      {
        href: TEAM_PERMISSION_ROUTES.calendars,
        label: "Calendars",
        icon: LayoutGrid,
        permission: "calendars",
      },
      {
        href: TEAM_PERMISSION_ROUTES.arrivals,
        label: "Arrivals",
        icon: CalendarDays,
        permission: "arrivals",
      },
    ],
  },
  {
    label: "Properties",
    items: [
      {
        href: TEAM_PERMISSION_ROUTES.properties,
        label: "All properties",
        icon: Home,
        permission: "properties",
      },
      {
        href: TEAM_PERMISSION_ROUTES.manual_reservations,
        label: "Manual bookings",
        icon: ClipboardPen,
        permission: "manual_reservations",
      },
    ],
  },
  {
    label: "Direct bookings",
    items: [
      {
        href: TEAM_PERMISSION_ROUTES.public_site,
        label: "Booking site",
        icon: Globe,
        permission: "public_site",
      },
      {
        href: TEAM_PERMISSION_ROUTES.booking_requests,
        label: "Inquiries",
        icon: Inbox,
        permission: "booking_requests",
      },
      {
        href: TEAM_PERMISSION_ROUTES.messages,
        label: "Messages",
        icon: MessageSquare,
        permission: "messages",
      },
    ],
  },
  {
    label: "Team",
    items: [
      {
        href: "/dashboard/team-access",
        label: "Give access",
        icon: Shield,
        ownerOnly: true,
      },
    ],
  },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useSupabase();
  const { data: context } = useDashboardContext();
  const isOwner = context?.isOwner ?? true;
  const permissions = context?.permissions ?? [];

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
        {navGroups.map((group) => {
          const items = group.items.filter((item) => {
            if (item.ownerOnly) return isOwner;
            if (isOwner) return true;
            return (
              item.permission !== undefined &&
              permissions.includes(item.permission)
            );
          });
          if (!items.length) return null;

          return (
          <div key={group.label} className="hostvia-sidebar-nav-group">
            <p className="hostvia-sidebar-nav-label">{group.label}</p>
            <div className="space-y-0.5">
              {items.map((item) => {
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
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-white/6 p-3">
        {isOwner ? (
          <Link
            href="/dashboard/properties/new"
            onClick={onNavigate}
            className="hostvia-btn-gradient flex h-9 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold"
          >
            <Plus className="h-4 w-4" />
            Add property
          </Link>
        ) : null}
        <InstallAppSidebarButton onNavigate={onNavigate} />
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
