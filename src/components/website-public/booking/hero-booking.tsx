"use client";

import { formatDay, useBooking } from "@/components/website-public/booking/booking-context";
import { GuestStepper } from "@/components/website-public/booking/inquiry-flow";
import { useEditApi } from "@/components/website-public/primitives";

/**
 * Dates-and-guests bar in the hero. Choosing dates or pressing the button opens the
 * inquiry panel with everything prefilled, so a guest is one step from asking.
 */
export function HeroBooking({ label = "Check availability" }: { label?: string }) {
  const booking = useBooking();
  const editing = Boolean(useEditApi());
  if (!booking || !booking.stays.length) return null;
  const { stay } = booking;
  const open = () => {
    if (!editing) booking.open();
  };
  return (
    <form
      className="wb-quick"
      data-inert={editing ? "1" : undefined}
      onSubmit={(event) => {
        event.preventDefault();
        open();
      }}
      aria-label="Check availability"
    >
      {booking.stays.length > 1 ? (
        <label className="wb-quick-field wb-quick-stay">
          <span>Stay</span>
          <select value={booking.stayId} onChange={(event) => booking.setStay(event.target.value)} disabled={editing}>
            {booking.stays.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <button type="button" className="wb-quick-field" onClick={open}>
        <span>Arrive</span>
        <strong>{booking.checkIn ? formatDay(booking.checkIn, booking.language) : "Add date"}</strong>
      </button>
      <button type="button" className="wb-quick-field" onClick={open}>
        <span>Depart</span>
        <strong>{booking.checkOut ? formatDay(booking.checkOut, booking.language) : "Add date"}</strong>
      </button>
      <div className="wb-quick-field wb-quick-guests">
        <span>Guests</span>
        <GuestStepper value={booking.guests} max={stay?.capacity ?? 30} onChange={booking.setGuests} />
      </div>
      <button type="submit" className="wb-quick-go">
        <span>{label}</span>
        <span className="wb-btn-arrow" aria-hidden />
      </button>
    </form>
  );
}
