"use client";

export function HostviaHeroMockup() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const calendarCells = Array.from({ length: 28 }, (_, i) => {
    const occupied = [2, 3, 4, 5, 8, 9, 10, 11, 15, 16, 17, 22, 23].includes(i);
    const checkIn = [2, 8, 15, 22].includes(i);
    const checkOut = [5, 11, 17, 23].includes(i);
    return { occupied, checkIn, checkOut };
  });

  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
      <div className="hostvia-pulse-glow pointer-events-none absolute -inset-4 rounded-full bg-violet-500/20 blur-3xl sm:-inset-8" />

      <div className="hostvia-float relative lg:pb-8">
        <div className="grid gap-4 sm:gap-5 lg:block">
          {/* Dashboard card */}
          <div className="hostvia-glow-card relative overflow-hidden p-4 shadow-2xl sm:p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-violet-400">
                  Dashboard
                </p>
                <p className="text-sm font-semibold text-white">March 2026</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
                  3 arrivals
                </span>
                <span className="rounded-full bg-rose-500/20 px-2.5 py-1 text-[10px] font-bold text-rose-400">
                  2 departures
                </span>
              </div>
            </div>

            <div className="mb-2 grid grid-cols-7 gap-0.5 sm:gap-1">
              {days.map((d, i) => (
                <div
                  key={i}
                  className="text-center text-[8px] font-medium text-zinc-500 sm:text-[9px]"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
              {calendarCells.map((cell, i) => (
                <div
                  key={i}
                  className={`relative flex h-6 items-center justify-center rounded-md text-[9px] font-medium sm:h-7 sm:text-[10px] ${
                    cell.checkIn
                      ? "bg-emerald-500/30 text-emerald-300 ring-1 ring-emerald-500/50"
                      : cell.checkOut
                        ? "bg-rose-500/30 text-rose-300 ring-1 ring-rose-500/50"
                        : cell.occupied
                          ? "bg-indigo-500/25 text-indigo-300"
                          : "bg-white/5 text-zinc-500"
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-1.5 sm:gap-2">
              {[
                { label: "Occupancy", value: "78%", color: "text-violet-400" },
                { label: "Free nights", value: "6", color: "text-cyan-400" },
                { label: "Direct", value: "4", color: "text-emerald-400" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg bg-white/5 px-1.5 py-2 text-center sm:px-2"
                >
                  <p className={`text-base font-bold sm:text-lg ${s.color}`}>
                    {s.value}
                  </p>
                  <p className="text-[8px] text-zinc-500 sm:text-[9px]">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Booking website preview */}
          <div className="w-full sm:max-w-[14rem] sm:justify-self-end lg:absolute lg:bottom-0 lg:right-0 lg:w-[52%] xl:-right-6">
            <div className="hostvia-glow-card overflow-hidden shadow-2xl">
              <div className="h-12 bg-gradient-to-br from-violet-600/40 via-indigo-600/30 to-cyan-600/20 sm:h-16" />
              <div className="space-y-2 p-3">
                <p className="text-[10px] font-bold text-white">Villa Adriatic</p>
                <div className="flex gap-1">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="h-7 flex-1 rounded bg-white/10 sm:h-8"
                    />
                  ))}
                </div>
                <div className="rounded-lg bg-violet-600/40 py-1.5 text-center text-[9px] font-semibold text-white">
                  Send inquiry
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
