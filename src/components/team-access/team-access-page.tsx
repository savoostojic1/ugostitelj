"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Loader2, Shield, Trash2, UserPlus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useHostProfile } from "@/hooks/use-host-profile";
import {
  TEAM_LIST_KEY,
  useTeamAccessUsers,
} from "@/hooks/use-team-access";
import {
  TEAM_PERMISSION_KEYS,
  TEAM_PERMISSION_LABELS,
  buildTeamUsername,
  isValidTeamUsername,
  type TeamPermission,
} from "@/lib/team-access/permissions";

function PermissionChecklist({
  value,
  onChange,
}: {
  value: TeamPermission[];
  onChange: (next: TeamPermission[]) => void;
}) {
  function toggle(permission: TeamPermission) {
    onChange(
      value.includes(permission)
        ? value.filter((item) => item !== permission)
        : [...value, permission]
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {TEAM_PERMISSION_KEYS.map((permission) => (
        <label
          key={permission}
          className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5 text-sm text-zinc-200"
        >
          <input
            type="checkbox"
            checked={value.includes(permission)}
            onChange={() => toggle(permission)}
            className="h-4 w-4 rounded border-white/20 bg-transparent accent-violet-500"
          />
          {TEAM_PERMISSION_LABELS[permission]}
        </label>
      ))}
    </div>
  );
}

export function TeamAccessPage() {
  const queryClient = useQueryClient();
  const { data: hostProfile } = useHostProfile();
  const { data: teamList, isLoading } = useTeamAccessUsers();
  const users = teamList?.users ?? [];
  const canCreateUsers = teamList?.canCreateUsers ?? false;

  const [accessName, setAccessName] = useState("pregled");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [permissions, setPermissions] = useState<TeamPermission[]>([
    "cleanings",
    "arrivals",
  ]);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const hostUsername = hostProfile?.username ?? "your-host";
  const suggestedUsername = useMemo(
    () => buildTeamUsername(accessName, hostUsername),
    [accessName, hostUsername]
  );

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const username = suggestedUsername;

    if (!isValidTeamUsername(username)) {
      toast.error("Choose a valid access name (letters and numbers).");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (!permissions.length) {
      toast.error("Select at least one section.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/team-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          displayName: displayName.trim() || undefined,
          permissions,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Could not create user");

      toast.success(`Access user ${username} created`);
      setDisplayName("");
      await queryClient.invalidateQueries({ queryKey: TEAM_LIST_KEY });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create user");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, username: string) {
    if (!window.confirm(`Remove access for ${username}?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/team-access/${id}`, { method: "DELETE" });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Could not delete user");
      toast.success("Access removed");
      await queryClient.invalidateQueries({ queryKey: TEAM_LIST_KEY });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete user");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        eyebrow="Team"
        title="Give access"
        description="Create usernames for staff or cleaners. They sign in with username and password and only see the sections you allow."
      />

      {!canCreateUsers && !isLoading ? (
        <div className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <div className="space-y-1">
            <p className="font-medium text-amber-50">Server setup required</p>
            <p className="text-amber-100/90">
              Add{" "}
              <code className="rounded bg-black/20 px-1 py-0.5 text-xs">
                SUPABASE_SERVICE_ROLE_KEY
              </code>{" "}
              to{" "}
              <code className="rounded bg-black/20 px-1 py-0.5 text-xs">
                .env.local
              </code>{" "}
              (local) and Vercel environment variables (production). In Supabase:
              Project Settings → API →{" "}
              <strong className="font-medium">service_role</strong> secret (not
              anon). Restart{" "}
              <code className="rounded bg-black/20 px-1 py-0.5 text-xs">
                npm run dev
              </code>{" "}
              after saving.
            </p>
          </div>
        </div>
      ) : null}

      <DashboardPanel
        title="New access user"
        description="Username is combined with your booking site name, e.g. pregled.your-host"
      >
        <form onSubmit={handleCreate} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="access-name">Access name</Label>
              <Input
                id="access-name"
                value={accessName}
                onChange={(e) => setAccessName(e.target.value)}
                placeholder="pregled"
                className="hostvia-input"
                required
              />
              <p className="text-xs text-zinc-500">
                Login username:{" "}
                <span className="font-medium text-zinc-300">
                  {suggestedUsername}
                </span>
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="display-name">Display name (optional)</Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Cleaning team"
                className="hostvia-input"
              />
            </div>
          </div>

          <div className="space-y-2 sm:max-w-sm">
            <Label htmlFor="team-password">Password</Label>
            <Input
              id="team-password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              autoComplete="off"
              spellCheck={false}
              className="hostvia-input font-mono"
              required
            />
          </div>

          <div className="space-y-3">
            <Label>Can view</Label>
            <PermissionChecklist
              value={permissions}
              onChange={setPermissions}
            />
          </div>

          <Button
            type="submit"
            disabled={saving || !canCreateUsers}
            className="hostvia-btn-gradient gap-2"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            Create access user
          </Button>
        </form>
      </DashboardPanel>

      <DashboardPanel
        title="Active access users"
        description="Share the username and password securely. Users sign in on the same login page."
      >
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : users.length === 0 ? (
          <p className="text-sm text-zinc-500">No access users yet.</p>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex flex-col gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 shrink-0 text-violet-400" />
                    <p className="font-medium text-white">{user.username}</p>
                  </div>
                  {user.display_name ? (
                    <p className="text-sm text-zinc-400">{user.display_name}</p>
                  ) : null}
                  <p className="font-mono text-sm text-zinc-300">
                    Password:{" "}
                    <span className="text-white">
                      {user.password_plain ?? "—"}
                    </span>
                  </p>
                  <p className="text-xs text-zinc-500">
                    Access:{" "}
                    {user.permissions
                      .map((p) => TEAM_PERMISSION_LABELS[p])
                      .join(", ")}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-red-300 hover:bg-red-500/10 hover:text-red-200"
                  disabled={deletingId === user.id}
                  onClick={() => handleDelete(user.id, user.username)}
                >
                  {deletingId === user.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </DashboardPanel>
    </div>
  );
}
