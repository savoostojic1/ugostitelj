import { cn } from "@/lib/utils";

type FormattedMultilineTextProps = {
  children: string;
  className?: string;
  as?: "p" | "span";
};

/** Renders textarea content with line breaks preserved. */
export function FormattedMultilineText({
  children,
  className,
  as: Tag = "p",
}: FormattedMultilineTextProps) {
  return <Tag className={cn("whitespace-pre-line", className)}>{children}</Tag>;
}
