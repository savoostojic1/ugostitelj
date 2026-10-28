"use client";

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function fieldDomId(field: string): string {
  return `calc-${field.replace(/\./g, "-")}`;
}

const controlClass =
  "h-11 rounded-xl border-white/10 bg-white/[0.04] text-base text-zinc-100 placeholder:text-zinc-500 focus-visible:border-violet-400/60 focus-visible:ring-violet-400/40 sm:text-sm";

const invalidClass = "border-rose-400/70 focus-visible:border-rose-400 focus-visible:ring-rose-400/40";

interface FieldShellProps {
  id: string;
  label: ReactNode;
  help?: ReactNode;
  error?: string;
  optional?: boolean;
  className?: string;
  children: ReactNode;
}

export function FieldShell({ id, label, help, error, optional, className, children }: FieldShellProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <Label htmlFor={id} className="text-[0.8125rem] font-medium leading-snug text-zinc-200">
        {label}
        {optional ? <span className="ml-1.5 font-normal text-zinc-500">(optional)</span> : null}
      </Label>
      {children}
      {help ? (
        <p id={`${id}-help`} className="text-xs leading-relaxed text-zinc-500">
          {help}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-rose-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(id: string, help?: ReactNode, error?: string): string | undefined {
  const ids = [help ? `${id}-help` : null, error ? `${id}-error` : null].filter(Boolean);
  return ids.length ? ids.join(" ") : undefined;
}

interface NumberFieldProps {
  field: string;
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  help?: ReactNode;
  optional?: boolean;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number | "any";
  placeholder?: string;
  className?: string;
  /** Visually hide the label (it stays available to assistive tech). */
  srOnlyLabel?: boolean;
}

export function NumberField({
  field,
  label,
  value,
  onChange,
  error,
  help,
  optional,
  prefix,
  suffix,
  min = 0,
  max,
  step = "any",
  placeholder,
  className,
  srOnlyLabel,
}: NumberFieldProps) {
  const id = fieldDomId(field);
  const input = (
    <div className="relative">
      {prefix ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-500"
        >
          {prefix}
        </span>
      ) : null}
      <Input
        id={id}
        name={field}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onWheel={(event) => event.currentTarget.blur()}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, help, error)}
        className={cn(
          controlClass,
          prefix && (prefix.length > 1 ? "pl-12" : "pl-8"),
          suffix && "pr-12",
          error && invalidClass
        )}
      />
      {suffix ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-500"
        >
          {suffix}
        </span>
      ) : null}
    </div>
  );

  if (srOnlyLabel) {
    return (
      <div className={cn("flex min-w-0 flex-col gap-1", className)}>
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
        {input}
        {error ? (
          <p id={`${id}-error`} className="text-xs font-medium text-rose-300">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <FieldShell id={id} label={label} help={help} error={error} optional={optional} className={className}>
      {input}
    </FieldShell>
  );
}

interface SelectFieldProps {
  field: string;
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
  help?: ReactNode;
  error?: string;
  placeholder?: string;
  className?: string;
  srOnlyLabel?: boolean;
}

export function SelectField({
  field,
  label,
  value,
  onChange,
  options,
  help,
  error,
  placeholder,
  className,
  srOnlyLabel,
}: SelectFieldProps) {
  const id = fieldDomId(field);
  const select = (
    <div className="relative">
      <select
        id={id}
        name={field}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby={describedBy(id, srOnlyLabel ? undefined : help, error)}
        aria-invalid={error ? true : undefined}
        className={cn(
          "flex w-full appearance-none rounded-xl border px-3 pr-9 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2",
          controlClass,
          error && invalidClass
        )}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#12121a] text-zinc-100">
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
      />
    </div>
  );

  if (srOnlyLabel) {
    return (
      <div className={cn("min-w-0", className)}>
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
        {select}
      </div>
    );
  }

  return (
    <FieldShell id={id} label={label} help={help} error={error} className={className}>
      {select}
    </FieldShell>
  );
}

interface ToggleFieldProps {
  field: string;
  label: ReactNode;
  description?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function ToggleField({ field, label, description, checked, onChange, disabled }: ToggleFieldProps) {
  const id = fieldDomId(field);
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4",
        disabled && "opacity-60"
      )}
    >
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        aria-describedby={description ? `${id}-help` : undefined}
        className="peer sr-only"
      />
      <label
        htmlFor={id}
        aria-hidden="true"
        className={cn(
          "relative mt-0.5 inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-white/10 transition peer-focus-visible:ring-2 peer-focus-visible:ring-violet-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#06060a]",
          checked ? "bg-violet-500" : "bg-white/10"
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 rounded-full bg-white shadow transition",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </label>
      <div className="min-w-0">
        <label htmlFor={id} className="cursor-pointer text-sm font-medium text-zinc-100">
          {label}
        </label>
        {description ? (
          <p id={`${id}-help`} className="mt-1 text-xs leading-relaxed text-zinc-500">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  description?: string;
}

export function SegmentedControl<T extends string>({
  name,
  legend,
  value,
  onChange,
  options,
}: {
  name: string;
  legend: string;
  value: T;
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-[0.8125rem] font-medium text-zinc-200">{legend}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const id = `${fieldDomId(name)}-${option.value}`;
          const selected = option.value === value;
          return (
            <div key={option.value}>
              <input
                id={id}
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="peer sr-only"
              />
              <label
                htmlFor={id}
                className={cn(
                  "block h-full cursor-pointer rounded-xl border p-4 transition peer-focus-visible:ring-2 peer-focus-visible:ring-violet-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#06060a]",
                  selected
                    ? "border-violet-400/60 bg-violet-500/10"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20"
                )}
              >
                <span className="block text-sm font-semibold text-white">{option.label}</span>
                {option.description ? (
                  <span className="mt-1 block text-xs leading-relaxed text-zinc-400">
                    {option.description}
                  </span>
                ) : null}
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
