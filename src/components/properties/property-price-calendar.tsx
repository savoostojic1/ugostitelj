"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { sr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/format/price";
import { parseDateOnly } from "@/lib/dates/calendar-date";
import type { PropertyPriceRuleSpan } from "@/lib/public/stay-price";
import { resolveNightPriceFromRules } from "@/lib/public/stay-price";
import type { PropertyPriceRule } from "@/types/database";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Po", "Ut", "Sr", "Če", "Pe", "Su", "Ne"];

function nightHasCustomRule(
  night: string,
  rules: PropertyPriceRuleSpan[]
): boolean {
  return rules.some(
    (rule) => night >= rule.start_date && night <= rule.end_date
  );
}

interface PropertyPriceCalendarProps {
  rules: PropertyPriceRule[];
  defaultPrice: number | null;
  onAddPeriod: (startDate: string, endDate: string, price: number) => void;
  adding?: boolean;
}

export function PropertyPriceCalendar({
  rules,
  defaultPrice,
  onAddPeriod,
  adding,
}: PropertyPriceCalendarProps) {
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [periodPrice, setPeriodPrice] = useState("");

  useEffect(() => {
    setRangeStart("");
    setRangeEnd("");
    setPeriodPrice("");
  }, [rules]);

  const ruleSpans = useMemo(
    () =>
      rules.map((rule) => ({
        start_date: rule.start_date,
        end_date: rule.end_date,
        price_per_night: Number(rule.price_per_night),
      })),
    [rules]
  );

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const weeks = useMemo(() => {
    const rows: Date[][] = [];
    for (let i = 0; i < allDays.length; i += 7) {
      rows.push(allDays.slice(i, i + 7));
    }
    return rows;
  }, [allDays]);

  const startDate = rangeStart ? parseDateOnly(rangeStart) : null;
  const endDate = rangeEnd ? parseDateOnly(rangeEnd) : null;

  const isSingleDay =
    rangeStart && rangeEnd && rangeStart === rangeEnd;

  const selectionLabel = !rangeStart
    ? "Kliknite dan na kalendaru · drugi klik opciono proširuje period"
    : isSingleDay
      ? format(startDate!, "d. MMM yyyy", { locale: sr })
      : `${format(startDate!, "d. MMM", { locale: sr })} – ${format(endDate!, "d. MMM yyyy", { locale: sr })}`;

  function handleDayClick(day: Date) {
    const dateKey = format(day, "yyyy-MM-dd");

    if (isSingleDay && rangeStart === dateKey) {
      setRangeStart("");
      setRangeEnd("");
      return;
    }

    if (rangeStart && rangeEnd) {
      if (rangeStart === rangeEnd) {
        if (dateKey < rangeStart) {
          setRangeStart(dateKey);
          setRangeEnd(rangeStart);
        } else {
          setRangeEnd(dateKey);
        }
        return;
      }

      setRangeStart(dateKey);
      setRangeEnd(dateKey);
      return;
    }

    setRangeStart(dateKey);
    setRangeEnd(dateKey);
  }

  function handleSubmit() {
    const price = Number.parseFloat(periodPrice.replace(",", "."));
    if (!rangeStart) return;
    const end = rangeEnd || rangeStart;
    onAddPeriod(rangeStart, end, price);
  }

  function isInSelection(day: Date) {
    if (!startDate) return false;
    if (!endDate) return isSameDay(day, startDate);
    return (
      isSameDay(day, startDate) ||
      isSameDay(day, endDate) ||
      (isAfter(day, startDate) && isBefore(day, endDate))
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMonth((m) => addMonths(m, -1))}
            aria-label="Prethodni mjesec"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <p className="text-sm font-semibold capitalize">
            {format(viewMonth, "LLLL yyyy", { locale: sr })}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMonth((m) => addMonths(m, 1))}
            aria-label="Sljedeći mjesec"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-3">
          <div className="mb-1 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="space-y-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-1">
                {week.map((day) => {
                  const inMonth = day.getMonth() === viewMonth.getMonth();
                  const nightKey = format(day, "yyyy-MM-dd");
                  const price = inMonth
                    ? resolveNightPriceFromRules(
                        nightKey,
                        ruleSpans,
                        defaultPrice
                      )
                    : null;
                  const isCustom = inMonth
                    ? nightHasCustomRule(nightKey, ruleSpans)
                    : false;
                  const selected = inMonth && isInSelection(day);
                  const isStart = startDate ? isSameDay(day, startDate) : false;
                  const isEnd = endDate ? isSameDay(day, endDate) : false;
                  const isRange = Boolean(
                    rangeStart && rangeEnd && rangeStart !== rangeEnd
                  );

                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      disabled={!inMonth}
                      onClick={() => inMonth && handleDayClick(day)}
                      className={cn(
                        "flex min-h-[3.25rem] flex-col items-center justify-center rounded-lg border px-0.5 py-1 text-center transition",
                        !inMonth && "pointer-events-none border-transparent opacity-0",
                        inMonth &&
                          !selected &&
                          "border-border/60 bg-background hover:border-primary/40 hover:bg-accent/40",
                        selected &&
                          "border-primary bg-primary/10 ring-1 ring-primary/30",
                        isRange && isStart && "rounded-r-none",
                        isRange && isEnd && "rounded-l-none",
                        isRange &&
                          selected &&
                          !isStart &&
                          !isEnd &&
                          "rounded-none"
                      )}
                    >
                      <span
                        className={cn(
                          "text-sm font-semibold leading-none",
                          selected && "text-primary"
                        )}
                      >
                        {format(day, "d")}
                      </span>
                      {inMonth ? (
                        <span
                          className={cn(
                            "mt-1 max-w-full truncate text-[10px] font-medium leading-tight",
                            price === null
                              ? "text-muted-foreground/50"
                              : isCustom
                                ? "text-primary"
                                : "text-muted-foreground"
                          )}
                        >
                          {price !== null ? formatPrice(price) : "—"}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <p className="text-sm font-medium">Nova cijena</p>
        <p className="mt-1 text-xs text-muted-foreground">{selectionLabel}</p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="period-price-input">Cijena (€ / noć)</Label>
            <Input
              id="period-price-input"
              value={periodPrice}
              onChange={(e) => setPeriodPrice(e.target.value)}
              placeholder="120"
            />
          </div>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={adding || !rangeStart || !periodPrice.trim()}
          >
            <Plus className="h-4 w-4" />
            {adding ? "Dodavanje…" : "Primijeni cijenu"}
          </Button>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Plava cijena = poseban period. Sivi broj = osnovna cijena. Uži period
          ima prednost ako se preklapaju.
        </p>
      </div>
    </div>
  );
}
