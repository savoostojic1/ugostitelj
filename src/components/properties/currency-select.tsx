"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  currencySymbol,
  filterCurrencies,
  getCurrency,
} from "@/lib/currency/currencies";
import { cn } from "@/lib/utils";

interface CurrencySelectProps {
  id?: string;
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
}

export function CurrencySelect({
  id,
  value,
  onChange,
  disabled,
}: CurrencySelectProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const selected = getCurrency(value);
  const options = useMemo(() => filterCurrencies(query), [query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  function choose(code: string) {
    onChange(code);
    setQuery("");
    setOpen(false);
  }

  const selectedLabel = selected
    ? `${selected.name} (${selected.code}) ${currencySymbol(selected.code)}`
    : value;

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        disabled={disabled}
        className="flex h-9 w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 text-left text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </button>

      {open ? (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-md">
          <div className="p-2">
            <Input
              autoFocus
              value={query}
              placeholder="Search by name, code, or symbol"
              aria-label="Search currencies"
              aria-controls={listId}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setActiveIndex((index) =>
                    Math.min(index + 1, Math.max(options.length - 1, 0))
                  );
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setActiveIndex((index) => Math.max(index - 1, 0));
                } else if (event.key === "Enter") {
                  event.preventDefault();
                  const option = options[activeIndex];
                  if (option) choose(option.code);
                } else if (event.key === "Escape") {
                  event.preventDefault();
                  setOpen(false);
                }
              }}
            />
          </div>
          <ul
            id={listId}
            role="listbox"
            aria-label="Currencies"
            className="max-h-64 overflow-y-auto p-1"
          >
            {options.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">
                No matching currency
              </li>
            ) : (
              options.map((currency, index) => {
                const symbol = currencySymbol(currency.code);
                const isSelected = currency.code === selected?.code;
                return (
                  <li key={currency.code} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm",
                        index === activeIndex && "bg-accent text-accent-foreground",
                        isSelected && index !== activeIndex && "bg-muted"
                      )}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => choose(currency.code)}
                    >
                      <span className="min-w-0">
                        <span className="font-medium">{currency.name}</span>
                        <span className="ml-2 text-muted-foreground">
                          {currency.code}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span translate="no">{symbol}</span>
                        {isSelected ? <Check className="h-4 w-4" /> : null}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
