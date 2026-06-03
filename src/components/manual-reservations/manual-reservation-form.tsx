"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReservationDatePicker } from "@/components/manual-reservations/reservation-date-picker";
import { useProperties, useReservations } from "@/hooks/use-properties";
import { useCreateManualReservation } from "@/hooks/use-manual-reservations";
import { validateStayRange } from "@/lib/reservations/availability";
import { toast } from "sonner";

interface ManualReservationFormProps {
  cancelHref?: string;
  onSuccess?: () => void;
}

export function ManualReservationForm({
  cancelHref = "/dashboard/manual-reservations",
  onSuccess,
}: ManualReservationFormProps) {
  const router = useRouter();
  const [propertyId, setPropertyId] = useState("");
  const [guestName, setGuestName] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [source, setSource] = useState("");
  const [price, setPrice] = useState("");

  const { data: properties = [], isLoading: propertiesLoading } =
    useProperties();
  const { data: propertyReservations = [], isLoading: reservationsLoading } =
    useReservations(propertyId, { enabled: !!propertyId });
  const createReservation = useCreateManualReservation();

  useEffect(() => {
    setCheckIn("");
    setCheckOut("");
  }, [propertyId]);

  function handleDatesChange(nextCheckIn: string, nextCheckOut: string) {
    setCheckIn(nextCheckIn);
    setCheckOut(nextCheckOut);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedName = guestName.trim();
    const trimmedSource = source.trim();
    const parsedPrice = Number(price.replace(",", "."));

    if (!propertyId) {
      toast.error("Izaberi bungalov");
      return;
    }
    if (!trimmedName) {
      toast.error("Unesi ime gosta");
      return;
    }

    const dateValidation = validateStayRange(
      propertyReservations,
      checkIn,
      checkOut
    );
    if (!dateValidation.ok) {
      toast.error(dateValidation.message);
      return;
    }

    if (!trimmedSource) {
      toast.error("Unesi odakle dolazi rezervacija");
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      toast.error("Unesi ispravnu cijenu");
      return;
    }

    createReservation.mutate(
      {
        property_id: propertyId,
        title: trimmedName,
        check_in: checkIn,
        check_out: checkOut,
        source: trimmedSource,
        price: parsedPrice,
      },
      {
        onSuccess: () => {
          toast.success("Ručna rezervacija dodata");
          if (onSuccess) {
            onSuccess();
          } else {
            router.push("/dashboard/manual-reservations");
          }
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Greška pri dodavanju");
        },
      }
    );
  }

  if (propertiesLoading) {
    return <p className="text-sm text-muted-foreground">Učitavanje…</p>;
  }

  if (properties.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Prvo dodaj nekretninu u meniju Properties.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="property">Bungalov</Label>
        <Select
          value={propertyId}
          onValueChange={setPropertyId}
          required
        >
          <SelectTrigger id="property">
            <SelectValue placeholder="Izaberi bungalov" />
          </SelectTrigger>
          <SelectContent>
            {properties.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="guestName">Ime gosta</Label>
        <Input
          id="guestName"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          placeholder="npr. Marko Petrović"
          required
          autoFocus
        />
      </div>

      {propertyId ? (
        <ReservationDatePicker
          reservations={propertyReservations}
          checkIn={checkIn}
          checkOut={checkOut}
          onChange={handleDatesChange}
          isLoading={reservationsLoading}
        />
      ) : (
        <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
          Prvo izaberi bungalov da vidiš zauzete datume.
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="source">Odakle dolazi</Label>
        <Input
          id="source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="npr. Direktno, Instagram, preporuka"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Cijena (€)</Label>
        <Input
          id="price"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="npr. 120"
          required
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="submit"
          className="sm:flex-1"
          disabled={
            createReservation.isPending ||
            !propertyId ||
            !checkIn ||
            !checkOut
          }
        >
          {createReservation.isPending ? "Dodavanje…" : "Dodaj rezervaciju"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="sm:flex-1"
          onClick={() => router.push(cancelHref)}
        >
          Otkaži
        </Button>
      </div>
    </form>
  );
}
