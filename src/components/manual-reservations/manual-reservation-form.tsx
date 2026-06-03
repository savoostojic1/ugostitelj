"use client";

import { useEffect, useRef, useState } from "react";
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
import {
  useCreateManualReservation,
  useManualReservation,
  useUpdateManualReservation,
} from "@/hooks/use-manual-reservations";
import { validateStayRange } from "@/lib/reservations/availability";
import { toast } from "sonner";

interface ManualReservationFormProps {
  reservationId?: string;
  cancelHref?: string;
  onSuccess?: () => void;
}

export function ManualReservationForm({
  reservationId,
  cancelHref = "/dashboard/manual-reservations",
  onSuccess,
}: ManualReservationFormProps) {
  const router = useRouter();
  const isEdit = !!reservationId;
  const loadedReservationId = useRef<string | null>(null);
  const previousPropertyId = useRef<string>("");

  const [propertyId, setPropertyId] = useState("");
  const [guestName, setGuestName] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [source, setSource] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [price, setPrice] = useState("");

  const { data: reservation, isLoading: reservationLoading } =
    useManualReservation(reservationId ?? "");
  const { data: properties = [], isLoading: propertiesLoading } =
    useProperties();
  const { data: propertyReservations = [], isLoading: reservationsLoading } =
    useReservations(propertyId, { enabled: !!propertyId });
  const createReservation = useCreateManualReservation();
  const updateReservation = useUpdateManualReservation();

  useEffect(() => {
    if (!reservation || loadedReservationId.current === reservation.id) return;

    loadedReservationId.current = reservation.id;
    previousPropertyId.current = reservation.property_id;
    setPropertyId(reservation.property_id);
    setGuestName(reservation.title);
    setCheckIn(reservation.check_in);
    setCheckOut(reservation.check_out);
    setSource(reservation.source ?? "");
    setGuestPhone(reservation.guest_phone ?? "");
    setPrice(
      reservation.price != null ? String(reservation.price) : ""
    );
  }, [reservation]);

  useEffect(() => {
    if (!propertyId || isEdit) return;
    setCheckIn("");
    setCheckOut("");
  }, [propertyId, isEdit]);

  useEffect(() => {
    if (!isEdit || !propertyId) return;
    if (previousPropertyId.current === propertyId) return;
    if (previousPropertyId.current === "") {
      previousPropertyId.current = propertyId;
      return;
    }
    previousPropertyId.current = propertyId;
    setCheckIn("");
    setCheckOut("");
  }, [propertyId, isEdit]);

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
      checkOut,
      isEdit
        ? { excludeId: reservationId, allowPastCheckIn: true }
        : undefined
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

    const payload = {
      property_id: propertyId,
      title: trimmedName,
      check_in: checkIn,
      check_out: checkOut,
      source: trimmedSource,
      guest_phone: guestPhone.trim() || null,
      price: parsedPrice,
    };

    if (isEdit) {
      updateReservation.mutate(
        { id: reservationId, ...payload },
        {
          onSuccess: () => {
            toast.success("Rezervacija sačuvana");
            if (onSuccess) {
              onSuccess();
            } else {
              router.push("/dashboard/manual-reservations");
            }
          },
          onError: (err) => {
            toast.error(
              err instanceof Error ? err.message : "Greška pri čuvanju"
            );
          },
        }
      );
      return;
    }

    createReservation.mutate(payload, {
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
    });
  }

  if (propertiesLoading || (isEdit && reservationLoading)) {
    return <p className="text-sm text-muted-foreground">Učitavanje…</p>;
  }

  if (isEdit && !reservation) {
    return <p className="text-sm text-muted-foreground">Rezervacija nije pronađena.</p>;
  }

  if (properties.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Prvo dodaj nekretninu u meniju Properties.
      </p>
    );
  }

  const isPending = createReservation.isPending || updateReservation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="property">Bungalov</Label>
        <Select value={propertyId} onValueChange={setPropertyId} required>
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
          autoFocus={!isEdit}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="guestPhone">Broj telefona</Label>
        <Input
          id="guestPhone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={guestPhone}
          onChange={(e) => setGuestPhone(e.target.value)}
          placeholder="npr. +382 67 123 456"
        />
      </div>

      {propertyId ? (
        <ReservationDatePicker
          reservations={propertyReservations}
          checkIn={checkIn}
          checkOut={checkOut}
          onChange={handleDatesChange}
          isLoading={reservationsLoading}
          excludeReservationId={isEdit ? reservationId : undefined}
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
          disabled={isPending || !propertyId || !checkIn || !checkOut}
        >
          {isPending
            ? "Čuvanje…"
            : isEdit
              ? "Sačuvaj izmjene"
              : "Dodaj rezervaciju"}
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
