"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ManualReservationForm } from "@/components/manual-reservations/manual-reservation-form";

export default function NewManualReservationPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/manual-reservations">
          <ArrowLeft className="h-4 w-4" />
          Ručne rezervacije
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Nova ručna rezervacija</CardTitle>
        </CardHeader>
        <CardContent>
          <ManualReservationForm />
        </CardContent>
      </Card>
    </div>
  );
}
