"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProperties } from "@/hooks/use-properties";
import { getPropertyNeighbors } from "@/lib/properties/property-navigation";

export function PropertyCalendarNav({ propertyId }: { propertyId: string }) {
  const { data: properties = [] } = useProperties();
  const { prev, next, index, total } = getPropertyNeighbors(
    properties,
    propertyId
  );

  if (total <= 1) return null;

  return (
    <div className="flex items-center gap-1">
      {prev ? (
        <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" asChild>
          <Link
            href={`/dashboard/properties/${prev.id}`}
            aria-label={`Prethodna nekretnina: ${prev.name}`}
            title={prev.name}
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
      ) : (
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
          disabled
          aria-label="Nema prethodne nekretnine"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      <span className="min-w-[3rem] text-center text-xs tabular-nums text-muted-foreground">
        {index + 1}/{total}
      </span>

      {next ? (
        <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" asChild>
          <Link
            href={`/dashboard/properties/${next.id}`}
            aria-label={`Sljedeća nekretnina: ${next.name}`}
            title={next.name}
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      ) : (
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
          disabled
          aria-label="Nema sljedeće nekretnine"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
