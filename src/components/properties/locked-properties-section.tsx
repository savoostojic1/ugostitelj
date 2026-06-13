"use client";

import Link from "next/link";
import { Lock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Property } from "@/types/database";

interface LockedPropertiesSectionProps {
  properties: Property[];
}

export function LockedPropertiesSection({
  properties,
}: LockedPropertiesSectionProps) {
  if (!properties.length) return null;

  return (
    <div className="hostvia-panel border-amber-500/15 p-5 sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <Lock className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
        <div>
          <h2 className="text-sm font-semibold text-amber-100">
            Locked listings
          </h2>
          <p className="mt-1 text-sm text-amber-200/75">
            These units are outside your Free plan limit. They are hidden from
            calendars and operations until you upgrade or delete them.
          </p>
        </div>
      </div>
      <div className="space-y-2">
        {properties.map((property) => (
          <div
            key={property.id}
            className="flex flex-col gap-3 rounded-xl border border-amber-500/15 bg-amber-500/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="font-medium text-zinc-200">{property.name}</p>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="hostvia-dashboard-btn gap-1.5 border-amber-500/20 text-amber-100 hover:bg-amber-500/10"
            >
              <Link href={`/dashboard/properties/${property.id}`}>
                <Trash2 className="h-3.5 w-3.5" />
                Manage or delete
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
