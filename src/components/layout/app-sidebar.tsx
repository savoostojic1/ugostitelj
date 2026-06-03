"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ClipboardPen,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui-store";
import { useSupabase } from "@/hooks/use-supabase";
import { useRouter } from "next/navigation";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/properties", label: "Properties", icon: Home },
  {
    href: "/dashboard/manual-reservations",
    label: "Ručne rezervacije",
    icon: ClipboardPen,
  },
  { href: "/dashboard/arrivals", label: "Arrivals & Departures", icon: CalendarDays },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUiStore();
  const router = useRouter();
  const supabase = useSupabase();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
          <CalendarDays className="h-4 w-4" />
        </div>
        <span className="font-semibold tracking-tight">Ugostitelj</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {nav.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-2 border-t border-border p-3">
        <Button asChild className="w-full" size="sm">
          <Link href="/dashboard/properties/new">
            <Plus className="h-4 w-4" />
            New Property
          </Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start" size="sm" onClick={signOut}>
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-60 shrink-0 border-r border-border bg-card md:block">
        {content}
      </aside>
      <div className="sticky top-0 z-30 border-b border-border bg-card pt-safe md:hidden">
        <div className="flex h-14 items-center gap-2 px-3">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold">Ugostitelj</span>
        </div>
      </div>
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-card pt-safe shadow-xl">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-[calc(env(safe-area-inset-top,0px)+0.5rem)]"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="flex min-h-0 flex-1 flex-col">{content}</div>
          </aside>
        </div>
      )}
    </>
  );
}
