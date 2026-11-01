"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs leading-relaxed text-zinc-500">{children}</p>;
}

export function FieldArea({
  id,
  label,
  hint,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-zinc-200">
        {label}
      </Label>
      {hint ? <FieldHint>{hint}</FieldHint> : null}
      <textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "flex w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60"
        )}
      />
    </div>
  );
}

export function FieldInput({
  id,
  label,
  hint,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-zinc-200">
        {label}
      </Label>
      {hint ? <FieldHint>{hint}</FieldHint> : null}
      <Input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-xl border-white/10 bg-white/[0.03] text-zinc-100"
      />
    </div>
  );
}

export function OptionalToggle({
  open,
  onToggle,
  label = "Show optional fields",
}: {
  open: boolean;
  onToggle: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="text-xs font-semibold tracking-wide text-violet-300 hover:text-violet-200"
    >
      {open ? "Hide optional fields" : label}
    </button>
  );
}
