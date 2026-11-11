"use client";

import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import { formatPropertyPrice } from "@/lib/currency/format";
import { useBooking } from "@/components/website-public/booking/booking-context";
import type { PublicStay, WebsiteSection } from "@/lib/website-builder/types";

/* ------------------------------------------------------------------------ */
/* Editing context: present only inside the builder.                         */
/* ------------------------------------------------------------------------ */

export type SectionAction = "up" | "down" | "duplicate" | "hide" | "delete" | "add-below";

export interface WebsiteEditApi {
  selectedSectionId: string | null;
  selectSection: (id: string) => void;
  /** path is a settings key ("title") or an item path ("items.2.body"). */
  editText: (sectionId: string, path: string, value: string) => void;
  requestImage: (sectionId: string) => void;
  sectionAction: (sectionId: string, action: SectionAction) => void;
  labelFor: (section: WebsiteSection) => string;
}

export const WebsiteEditContext = createContext<WebsiteEditApi | null>(null);

export function useEditApi() {
  return useContext(WebsiteEditContext);
}

const SectionIdContext = createContext<string | null>(null);
export const SectionIdProvider = SectionIdContext.Provider;

/**
 * Text a host can click and edit in the builder preview. On the published site it
 * is plain, crawlable text. Optionally splits into words for staggered reveals.
 */
export function EText({
  as,
  path,
  value,
  placeholder,
  className,
  split,
  multiline,
  style,
}: {
  as?: ElementType;
  path: string;
  value: string;
  placeholder?: string;
  className?: string;
  split?: boolean;
  multiline?: boolean;
  style?: CSSProperties;
}) {
  const Tag = (as ?? "span") as ElementType;
  const api = useEditApi();
  const sectionId = useContext(SectionIdContext);
  const ref = useRef<HTMLElement>(null);
  const editing = Boolean(api && sectionId);

  // The editable element is not managed by React: the browser owns its text while the
  // host types, and external changes (inspector, undo) are written in only when it is
  // not focused. Letting React reconcile a contentEditable node loses later updates.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!editing || !el || el === globalThis.document?.activeElement) return;
    if (readEditable(el) !== value) el.textContent = value;
    el.dataset.empty = value ? "0" : "1";
  }, [editing, value]);

  if (editing) {
    return (
      <Tag
        ref={ref}
        className={`${className ?? ""} wb-editable`}
        style={style}
        contentEditable="plaintext-only"
        suppressContentEditableWarning
        spellCheck
        data-placeholder={placeholder || "Write something"}
        onClick={(event: React.MouseEvent) => event.stopPropagation()}
        onFocus={() => api!.selectSection(sectionId!)}
        onKeyDown={(event: React.KeyboardEvent<HTMLElement>) => {
          if (event.key === "Enter" && !multiline) {
            event.preventDefault();
            event.currentTarget.blur();
          }
          if (event.key === "Escape") {
            event.currentTarget.textContent = value;
            event.currentTarget.blur();
          }
        }}
        onInput={(event: React.FormEvent<HTMLElement>) => {
          event.currentTarget.dataset.empty = event.currentTarget.textContent ? "0" : "1";
        }}
        onBlur={(event: React.FocusEvent<HTMLElement>) => {
          const next = readEditable(event.currentTarget);
          if (next !== value) api!.editText(sectionId!, path, multiline ? next : next.replace(/\s*\n\s*/g, " "));
        }}
      />
    );
  }

  if (!value) return null;
  if (split) {
    return (
      <Tag className={className} style={style} aria-label={value}>
        <SplitWords text={value} />
      </Tag>
    );
  }
  return (
    <Tag className={className} style={style}>
      {value}
    </Tag>
  );
}

/** Reads what the host typed. textContent ignores CSS text-transform, unlike innerText. */
function readEditable(el: HTMLElement): string {
  const copy = el.cloneNode(true) as HTMLElement;
  copy.querySelectorAll("br").forEach((node) => node.replaceWith("\n"));
  copy.querySelectorAll("div, p").forEach((node) => node.prepend("\n"));
  return (copy.textContent ?? "").replace(/\u00a0/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

/** Wraps each word in a mask for line-by-line reveal. Screen readers use the parent label. */
export function SplitWords({ text, offset = 0 }: { text: string; offset?: number }) {
  const words = text.split(/(\s+)/);
  let index = offset;
  return (
    <>
      {words.map((word, key) => {
        if (/^\s+$/.test(word)) return word;
        const i = index++;
        return (
          <span key={key} className="wb-w" aria-hidden>
            <span style={{ "--i": i } as CSSProperties}>{word}</span>
          </span>
        );
      })}
    </>
  );
}

/* ------------------------------------------------------------------------ */
/* Media                                                                     */
/* ------------------------------------------------------------------------ */

export function Photo({
  src,
  alt,
  className,
  priority,
  sizes,
  style,
}: {
  src?: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  style?: CSSProperties;
}) {
  if (!src) return <span className={`wb-photo wb-photo-empty ${className ?? ""}`} aria-hidden />;
  const srcSet = unsplashSrcSet(src);
  return (
    // Host and property photos live on storage domains outside the image optimizer.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={`wb-photo ${className ?? ""}`}
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? sizes ?? "100vw" : undefined}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding={priority ? "auto" : "async"}
      style={style}
    />
  );
}

function unsplashSrcSet(src: string): string | undefined {
  if (!src.startsWith("https://images.unsplash.com/") || !/[?&]w=\d+/.test(src)) return undefined;
  return [640, 1080, 1600, 2200]
    .map((width) => `${src.replace(/([?&])w=\d+/, `$1w=${width}`)} ${width}w`)
    .join(", ");
}

/**
 * A photograph inside a clipping frame. The image moves at its own speed (parallax)
 * and can be swapped by clicking it in the builder.
 */
export function Frame({
  src,
  alt,
  className,
  parallax,
  reveal,
  priority,
  sizes,
  editable = true,
  children,
}: {
  src?: string;
  alt: string;
  className?: string;
  parallax?: number;
  reveal?: string;
  priority?: boolean;
  sizes?: string;
  editable?: boolean;
  children?: ReactNode;
}) {
  const api = useEditApi();
  const sectionId = useContext(SectionIdContext);
  const canPick = Boolean(api && sectionId && editable);
  return (
    <figure
      className={`wb-frame ${className ?? ""}`}
      data-reveal={reveal}
      data-pickable={canPick ? "1" : undefined}
      onDoubleClick={canPick ? () => api!.requestImage(sectionId!) : undefined}
    >
      <span className="wb-frame-inner" data-parallax={parallax ? String(parallax) : undefined}>
        <Photo src={src} alt={alt} priority={priority} sizes={sizes} />
      </span>
      {canPick ? (
        <button
          type="button"
          className="wb-pick"
          onClick={(event) => {
            event.stopPropagation();
            api!.requestImage(sectionId!);
          }}
        >
          Replace photo
        </button>
      ) : null}
      {children}
    </figure>
  );
}

/* ------------------------------------------------------------------------ */
/* Links and prices                                                          */
/* ------------------------------------------------------------------------ */

export function SiteLink({
  href,
  className,
  children,
  preview,
  ariaLabel,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  preview: boolean;
  ariaLabel?: string;
}) {
  const booking = useBooking();
  const editing = Boolean(useEditApi());
  return (
    <a
      className={className}
      href={href}
      aria-label={ariaLabel}
      onClick={(event) => {
        if (editing) {
          event.preventDefault();
          return;
        }
        if (href === "#booking") {
          const target = (event.currentTarget.closest(".wb") as HTMLElement | null)?.querySelector("#booking");
          if (target) {
            event.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
          } else if (booking?.stays.length) {
            event.preventDefault();
            booking.open();
          }
          return;
        }
        if (preview) event.preventDefault();
      }}
    >
      {children}
    </a>
  );
}

export function priceLabel(stay: Pick<PublicStay, "pricePerNight" | "currencyCode">): string | null {
  if (!stay.pricePerNight) return null;
  return formatPropertyPrice(stay.pricePerNight, stay.currencyCode);
}

export function Price({ stay, prefix = "From" }: { stay: PublicStay; prefix?: string }) {
  const label = priceLabel(stay);
  if (!label) return <span className="wb-price">Price on request</span>;
  return (
    <span className="wb-price">
      {prefix ? <span className="wb-price-pre">{prefix} </span> : null}
      <strong>{label}</strong>
      <span className="wb-price-unit"> / night</span>
    </span>
  );
}

export function lowestPrice(stays: PublicStay[]): string | null {
  const priced = stays.filter((stay) => stay.pricePerNight && stay.pricePerNight > 0);
  if (!priced.length) return null;
  const low = priced.reduce((min, stay) => (stay.pricePerNight! < min.pricePerNight! ? stay : min));
  return priceLabel(low);
}

export function roman(n: number): string {
  const map: [number, string][] = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let out = "";
  let rest = n;
  for (const [value, symbol] of map) {
    while (rest >= value) {
      out += symbol;
      rest -= value;
    }
  }
  return out;
}

export const pad = (n: number) => String(n).padStart(2, "0");
