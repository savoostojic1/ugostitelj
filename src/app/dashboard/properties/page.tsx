"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProperties } from "@/hooks/use-properties";

export default function PropertiesPage() {
  const { data: properties = [], isLoading } = useProperties();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Nekretnine</h1>
          <p className="text-muted-foreground">
            Upravljaj objektima i kalendar feedovima
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/properties/new">
            <Plus className="h-4 w-4" />
            Nova nekretnina
          </Link>
        </Button>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Učitavanje…</p>
      )}

      {!isLoading && properties.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <p className="mb-4 text-muted-foreground">
              Još nema nekretnina. Dodaj prvu da povežeš iCal kalendare.
            </p>
            <Button asChild>
              <Link href="/dashboard/properties/new">Dodaj nekretninu</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((p) => (
          <Link key={p.id} href={`/dashboard/properties/${p.id}`}>
            <Card className="transition-colors hover:border-primary/50">
              <CardContent className="flex items-center p-5">
                <h3 className="font-semibold">{p.name}</h3>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
