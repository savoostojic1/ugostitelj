import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface DashboardRichTextareaProps {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  className?: string;
}

export function DashboardRichTextarea({
  id,
  label,
  hint,
  value,
  onChange,
  rows = 5,
  placeholder,
  className,
}: DashboardRichTextareaProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="space-y-1">
        <Label htmlFor={id} className="text-sm font-medium text-zinc-200">
          {label}
        </Label>
        {hint ? (
          <p className="text-xs leading-relaxed text-zinc-500">{hint}</p>
        ) : null}
      </div>
      <Textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[8.5rem] resize-y rounded-xl border-white/10 bg-white/[0.03] px-3.5 py-3 text-sm leading-relaxed text-zinc-100 shadow-inner shadow-black/10 placeholder:text-zinc-600 focus-visible:border-violet-500/35 focus-visible:ring-2 focus-visible:ring-violet-500/20"
      />
    </div>
  );
}
