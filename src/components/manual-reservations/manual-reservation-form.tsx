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
import {
  useAllowedProperties,
  useAllowedReservations,
} from "@/hooks/use-allowed-properties";
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
    useAllowedProperties();
  const { data: propertyReservations = [], isLoading: reservationsLoading } =
    useAllowedReservations(propertyId, { enabled: !!propertyId });
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
      toast.error("Select a property");
      return;
    }
    if (!trimmedName) {
      toast.error("Enter guest name");
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
      toast.error("Enter where the booking came from");
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      toast.error("Enter a valid price");
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
            toast.success("Reservation saved");
            if (onSuccess) {
              onSuccess();
            } else {
              router.push("/dashboard/manual-reservations");
            }
          },
          onError: (err) => {
            toast.error(
              err instanceof Error ? err.message : "Failed to save"
            );
          },
        }
      );
      return;
    }

    createReservation.mutate(payload, {
      onSuccess: () => {
        toast.success("Manual reservation added");
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/dashboard/manual-reservations");
        }
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to add");
      },
    });
  }

  if (propertiesLoading || (isEdit && reservationLoading)) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (isEdit && !reservation) {
    return <p className="text-sm text-muted-foreground">Reservation not found.</p>;
  }

  if (properties.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Add a property first from the Properties menu.
      </p>
    );
  }

  const isPending = createReservation.isPending || updateReservation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="property">Property</Label>
        <Select value={propertyId} onValueChange={setPropertyId} required>
          <SelectTrigger id="property">
            <SelectValue placeholder="Select property" />
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
        <Label htmlFor="guestName">Guest name</Label>
        <Input
          id="guestName"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          placeholder="e.g. John Smith"
          required
          autoFocus={!isEdit}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="guestPhone">Phone number</Label>
        <Input
          id="guestPhone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={guestPhone}
          onChange={(e) => setGuestPhone(e.target.value)}
          placeholder="e.g. +1 555 123 4567"
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
          Select a property first to see occupied dates.
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="source">Booking source</Label>
        <Input
          id="source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="e.g. Direct, Instagram, referral"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Price (€)</Label>
        <Input
          id="price"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="e.g. 120"
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
            ? "Saving…"
            : isEdit
              ? "Save changes"
              : "Add reservation"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="sm:flex-1"
          onClick={() => router.push(cancelHref)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
