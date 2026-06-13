"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  Globe,
  Loader2,
} from "lucide-react";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { UpgradeModal } from "@/components/billing/upgrade-modal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const SETUP_STEPS = [
  { id: "name", label: "Name", icon: Building2 },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "publish", label: "Publish", icon: Globe },
] as const;

const NAME_SUGGESTIONS = [
  "Apartment 1",
  "Studio",
  "Room 2",
  "Villa",
  "Bungalow",
  "Penthouse",
];

export function AddPropertyForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Enter a name for this accommodation");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });

      const data = await res.json();

      if (res.status === 402 && data.upgradeRequired) {
        setUpgradeOpen(true);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error ?? "Could not add accommodation");
      }

      toast.success("Accommodation created");
      router.push(`/dashboard/properties/${data.property.id}/sync`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="space-y-8">
        <Link
          href="/dashboard/properties"
          className="hostvia-dashboard-page-inset inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to properties
        </Link>

        <DashboardPageHeader
          eyebrow="Step 1 of 3"
          title="Add accommodation"
          description="Give it a name you’ll recognize — calendar and photos come next."
        />

        <div className="hostvia-dashboard-page-inset mx-auto max-w-xl">
          <div className="mb-8 flex items-center justify-center gap-2 sm:gap-3">
            {SETUP_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === 0;

              return (
                <div key={step.id} className="flex items-center gap-2 sm:gap-3">
                  {index > 0 ? (
                    <div
                      className="hidden h-px w-6 bg-white/10 sm:block sm:w-10"
                      aria-hidden
                    />
                  ) : null}
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium sm:px-4 sm:text-sm",
                      isActive
                        ? "border-violet-500/40 bg-violet-500/15 text-violet-100"
                        : "border-white/8 bg-white/[0.02] text-zinc-500"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{step.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <form
            onSubmit={handleSubmit}
            className="hostvia-panel overflow-hidden p-6 sm:p-8"
          >
            <label htmlFor="property-name" className="block">
              <span className="text-sm font-medium text-white">
                Accommodation name
              </span>
              <span className="mt-1 block text-xs text-zinc-500">
                How you’ll see it in the dashboard and calendar
              </span>
              <input
                id="property-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Studio Old Town"
                className="hostvia-input mt-4 h-12 w-full text-base"
                required
                autoFocus
                autoComplete="off"
              />
            </label>

            <div className="mt-4">
              <p className="text-xs text-zinc-500">Quick pick</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {NAME_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setName(suggestion)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-sm transition",
                      name === suggestion
                        ? "border-violet-500/50 bg-violet-500/15 text-violet-100"
                        : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/15 hover:text-zinc-200"
                    )}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="hostvia-btn-gradient mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <p className="mt-4 text-center text-xs text-zinc-500">
              Next you’ll connect Airbnb or Booking calendar
            </p>
          </form>
        </div>
      </div>

      <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </>
  );
}
