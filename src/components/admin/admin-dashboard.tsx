"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Building2,
  Crown,
  Loader2,
  LogOut,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { AdminHostRow } from "@/app/api/admin/hosts/route";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Stats = {
  totalUsers: number;
  withProfile: number;
  published: number;
  pro: number;
  complimentary: number;
  totalProperties: number;
};

function planLabel(host: AdminHostRow): string {
  if (host.pro_access_granted) return "Complimentary Pro";
  if (host.is_pro) return "Pro";
  return "Free";
}

function planBadgeVariant(host: AdminHostRow): "default" | "secondary" | "outline" {
  if (host.pro_access_granted) return "default";
  if (host.is_pro) return "default";
  return "outline";
}

export function AdminDashboard() {
  const router = useRouter();
  const [hosts, setHosts] = useState<AdminHostRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadHosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/hosts");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not load hosts");
      setHosts(data.hosts ?? []);
      setStats(data.stats ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load hosts");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadHosts();
  }, [loadHosts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return hosts;
    return hosts.filter(
      (h) =>
        h.email?.toLowerCase().includes(q) ||
        h.username?.toLowerCase().includes(q) ||
        h.business_name?.toLowerCase().includes(q) ||
        h.id.toLowerCase().includes(q)
    );
  }, [hosts, query]);

  async function togglePro(host: AdminHostRow) {
    setBusyId(host.id);
    try {
      const res = await fetch("/api/admin/pro-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostId: host.id,
          granted: !host.pro_access_granted,
          note: host.pro_access_granted ? undefined : "Admin grant",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      toast.success(data.message ?? "Updated");
      await loadHosts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">Hostvia Admin</h1>
            <p className="text-sm text-white/55">Host accounts, plans and complimentary Pro</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-white/15 bg-transparent text-white hover:bg-white/5"
            onClick={() => void loadHosts()}
            disabled={loading}
          >
            <RefreshCw className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
          <Button
            variant="outline"
            className="border-white/15 bg-transparent text-white hover:bg-white/5"
            onClick={() => void handleLogout()}
          >
            <LogOut />
            Sign out
          </Button>
        </div>
      </header>

      {stats && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Users} label="Host accounts" value={stats.totalUsers} />
          <StatCard icon={Building2} label="Properties" value={stats.totalProperties} />
          <StatCard icon={Crown} label="Pro accounts" value={stats.pro} />
          <StatCard icon={ShieldCheck} label="Complimentary" value={stats.complimentary} />
        </div>
      )}

      <div className="hostvia-admin-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-white/8 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-white/60">
            {filtered.length} host account{filtered.length === 1 ? "" : "s"}
          </p>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <input
              className="hostvia-admin-input pl-10"
              placeholder="Search email, username…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-white/60">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading hosts…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="hostvia-admin-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Username</th>
                  <th>Properties</th>
                  <th>Plan</th>
                  <th>Published</th>
                  <th>Joined</th>
                  <th>Last sign-in</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((host) => (
                  <tr key={host.id}>
                    <td className="max-w-[220px] truncate font-medium text-white">
                      {host.email ?? "—"}
                    </td>
                    <td>
                      {host.username ? (
                        <span className="text-sky-300">@{host.username}</span>
                      ) : (
                        <span className="text-white/35">No profile</span>
                      )}
                    </td>
                    <td>{host.property_count}</td>
                    <td>
                      <Badge
                        variant={planBadgeVariant(host)}
                        className={
                          host.pro_access_granted
                            ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-200"
                            : host.is_pro
                              ? "border-sky-500/30 bg-sky-500/15 text-sky-200"
                              : "border-white/15 text-white/70"
                        }
                      >
                        {planLabel(host)}
                      </Badge>
                    </td>
                    <td>{host.is_published ? "Yes" : "No"}</td>
                    <td className="whitespace-nowrap text-white/60">
                      {host.created_at
                        ? format(new Date(host.created_at), "dd MMM yyyy")
                        : "—"}
                    </td>
                    <td className="whitespace-nowrap text-white/60">
                      {host.last_sign_in_at
                        ? format(new Date(host.last_sign_in_at), "dd MMM yyyy")
                        : "—"}
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant={host.pro_access_granted ? "outline" : "default"}
                        className={
                          host.pro_access_granted
                            ? "border-white/15 bg-transparent text-white hover:bg-white/5"
                            : "bg-emerald-600 text-white hover:bg-emerald-500"
                        }
                        disabled={busyId === host.id}
                        onClick={() => void togglePro(host)}
                      >
                        {busyId === host.id ? (
                          <Loader2 className="animate-spin" />
                        ) : host.pro_access_granted ? (
                          "Revoke Pro"
                        ) : (
                          "Grant Pro"
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-white/45">
                      No host accounts match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <div className="hostvia-admin-card p-5">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-sky-300">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-2xl font-semibold text-white">{value}</p>
      <p className="text-sm text-white/55">{label}</p>
    </div>
  );
}
