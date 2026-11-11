"use client";

import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/* Builder interface primitives. Dark, quiet surfaces so the website stays the focus. */

export function Label({ children, hint, htmlFor }: { children: ReactNode; hint?: ReactNode; htmlFor?: string }) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-3">
      <label htmlFor={htmlFor} className="text-[12.5px] font-medium text-zinc-300">
        {children}
      </label>
      {hint ? <span className="text-[11px] text-zinc-500">{hint}</span> : null}
    </div>
  );
}

const fieldBase =
  "w-full rounded-xl border border-white/[0.09] bg-white/[0.035] px-3.5 text-[14px] text-zinc-100 placeholder:text-zinc-600 outline-none transition focus:border-violet-400/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-violet-500/10";

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function TextInput(
  { className, ...props },
  ref
) {
  return <input ref={ref} className={cn(fieldBase, "h-11", className)} {...props} />;
});

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function TextArea(
  { className, ...props },
  ref
) {
  return <textarea ref={ref} className={cn(fieldBase, "min-h-[96px] resize-y py-3 leading-relaxed", className)} {...props} />;
});

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(fieldBase, "h-11 appearance-none bg-[#121118] pr-9", className)} {...props}>
      {children}
    </select>
  );
}

export function Field({
  label,
  hint,
  value,
  onChange,
  placeholder,
  maxLength,
  multiline,
  rows,
  type,
  inputMode,
  id,
}: {
  label: string;
  hint?: ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  rows?: number;
  type?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  id?: string;
}) {
  const fieldId = id ?? `f-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const counter = maxLength && value.length > maxLength * 0.7 ? `${value.length}/${maxLength}` : hint;
  return (
    <div>
      <Label htmlFor={fieldId} hint={counter}>
        {label}
      </Label>
      {multiline ? (
        <TextArea id={fieldId} value={value} rows={rows ?? 4} maxLength={maxLength} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <TextInput id={fieldId} value={value} type={type} inputMode={inputMode} maxLength={maxLength} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      )}
    </div>
  );
}

/** A text field that keeps what is typed locally and commits on blur or Enter (slugs, links). */
export function CommitField({
  label,
  hint,
  value,
  onCommit,
  placeholder,
  id,
}: {
  label: string;
  hint?: ReactNode;
  value: string;
  onCommit: (value: string) => void;
  placeholder?: string;
  id?: string;
}) {
  const fieldId = id ?? `c-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div>
      <Label htmlFor={fieldId} hint={hint}>
        {label}
      </Label>
      <TextInput
        key={value}
        id={fieldId}
        defaultValue={value}
        placeholder={placeholder}
        onBlur={(event) => {
          if (event.target.value !== value) onCommit(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") (event.target as HTMLInputElement).blur();
        }}
      />
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  size = "md",
  label,
}: {
  value: T;
  options: { value: T; label: ReactNode; title?: string }[];
  onChange: (value: T) => void;
  size?: "sm" | "md";
  label?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex w-full rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          title={option.title}
          onClick={() => onChange(option.value)}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg font-medium transition",
            size === "sm" ? "h-7 px-2 text-[12px]" : "h-9 px-3 text-[13px]",
            value === option.value ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-400 hover:text-zinc-100"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (value: boolean) => void; label: ReactNode; description?: ReactNode }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-start justify-between gap-4 rounded-xl px-1 py-2 text-left"
    >
      <span>
        <span className="block text-[13.5px] text-zinc-200">{label}</span>
        {description ? <span className="mt-0.5 block text-[12px] leading-relaxed text-zinc-500">{description}</span> : null}
      </span>
      <span className={cn("relative mt-0.5 h-[22px] w-[38px] shrink-0 rounded-full transition", checked ? "bg-violet-500" : "bg-white/15")}>
        <span className={cn("absolute top-[3px] h-4 w-4 rounded-full bg-white shadow transition-all", checked ? "left-[19px]" : "left-[3px]")} />
      </span>
    </button>
  );
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: "sm" | "md" | "lg" }>(
  function Button({ className, variant = "secondary", size = "md", ...props }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl font-semibold transition disabled:pointer-events-none disabled:opacity-40",
          size === "sm" && "h-8 px-3 text-[12.5px]",
          size === "md" && "h-10 px-4 text-[13.5px]",
          size === "lg" && "h-12 px-6 text-[14.5px]",
          variant === "primary" &&
            "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-[0_10px_30px_-10px_rgba(168,85,247,0.7)] hover:brightness-110",
          variant === "secondary" && "border border-white/10 bg-white/[0.05] text-zinc-100 hover:border-white/20 hover:bg-white/[0.09]",
          variant === "ghost" && "text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100",
          variant === "danger" && "text-rose-300 hover:bg-rose-500/10",
          className
        )}
        {...props}
      />
    );
  }
);

export function SectionTitle({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: ReactNode }) {
  return (
    <div className="mb-6">
      {eyebrow ? <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-300/80">{eyebrow}</p> : null}
      <h2 className="text-[26px] font-semibold leading-[1.15] tracking-[-0.02em] text-white">{title}</h2>
      {description ? <p className="mt-2 text-[14px] leading-relaxed text-zinc-400">{description}</p> : null}
    </div>
  );
}

export function PanelHeading({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-2 mt-1 flex items-center justify-between gap-2 px-1">
      <h3 className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-zinc-500">{children}</h3>
      {action}
    </div>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">{children}</kbd>;
}
