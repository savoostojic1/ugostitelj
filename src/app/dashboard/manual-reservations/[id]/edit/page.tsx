"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ManualReservationForm } from "@/components/manual-reservations/manual-reservation-form";

export default function EditManualReservationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

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
          <CardTitle>Uredi ručnu rezervaciju</CardTitle>
        </CardHeader>
        <CardContent>
          <ManualReservationForm reservationId={id} />
        </CardContent>
      </Card>
    </div>
  );
}
