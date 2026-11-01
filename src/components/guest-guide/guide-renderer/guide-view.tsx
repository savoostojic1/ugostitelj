"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  BedDouble,
  Bike,
  Bus,
  Car,
  Check,
  ChevronDown,
  CigaretteOff,
  Clock,
  Coffee,
  Compass,
  Copy,
  Droplets,
  Flame,
  Flower2,
  Globe,
  Hospital,
  Info,
  KeyRound,
  Landmark,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Moon,
  Navigation,
  PartyPopper,
  PawPrint,
  Phone,
  Pill,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Siren,
  Snowflake,
  Sparkles,
  Sun,
  Trash2,
  Tv,
  Umbrella,
  Users,
  Utensils,
  UtensilsCrossed,
  WashingMachine,
  Waves,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import {
  LOCAL_CATEGORY_LABELS,
  SECTION_LABELS,
} from "@/lib/guest-guide/defaults";
import { visibleSections } from "@/lib/guest-guide/visibility";
import type {
  GuestGuideContent,
  GuestGuideDocument,
  GuestGuideSectionId,
  LocalCategory,
} from "@/lib/guest-guide/types";
import "./guide-theme.css";

const SECTION_ICONS: Record<GuestGuideSectionId, LucideIcon> = {
  welcome: Sparkles,
  checkin: KeyRound,
  wifi: Wifi,
  property: BedDouble,
  rules: ShieldCheck,
  checkout: LogOut,
  local: Compass,
  emergency: Siren,
  contact: MessageCircle,
};

const PROPERTY_ICONS: Record<string, LucideIcon> = {
  snowflake: Snowflake,
  flame: Flame,
  utensils: Utensils,
  "washing-machine": WashingMachine,
  droplets: Droplets,
  tv: Tv,
  waves: Waves,
  sun: Sun,
  "flower-2": Flower2,
  "trash-2": Trash2,
};

const LOCAL_ICONS: Record<LocalCategory, LucideIcon> = {
  restaurants: UtensilsCrossed,
  cafes: Coffee,
  beaches: Umbrella,
  activities: Bike,
  attractions: Landmark,
  shopping: ShoppingBag,
  supermarkets: ShoppingCart,
  pharmacies: Pill,
  transport: Bus,
  other: MapPin,
};

const RULE_ICON_PATTERNS: Array<[RegExp, LucideIcon]> = [
  [/smok/i, CigaretteOff],
  [/pet|dog|cat/i, PawPrint],
  [/part|event/i, PartyPopper],
  [/quiet|noise|night/i, Moon],
  [/occupan|guest|people/i, Users],
  [/pool|swim/i, Waves],
  [/park|car/i, Car],
  [/waste|trash|rubbish|recycl/i, Trash2],
];

function ruleIcon(title: string): LucideIcon {
  return RULE_ICON_PATTERNS.find(([pattern]) => pattern.test(title))?.[1] ?? ShieldCheck;
}

function telHref(value: string): string {
  return `tel:${value.replace(/[^\d+]/g, "")}`;
}

function waHref(value: string): string {
  return `https://wa.me/${value.replace(/[^\d]/g, "")}`;
}

function mapsSearchHref(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function delay(index: number): CSSProperties {
  return { "--d": index } as CSSProperties;
}

function collectMosaic(content: GuestGuideContent) {
  const cover = content.welcome.coverPhotoUrl;
  const candidates = [
    ...content.checkin.photos.map((photo) => ({
      url: photo.url,
      alt: photo.alt || "Arrival",
    })),
    ...content.property
      .filter((item) => item.imageUrl)
      .map((item) => ({ url: item.imageUrl as string, alt: item.title })),
    ...content.local
      .filter((place) => place.photoUrl)
      .map((place) => ({ url: place.photoUrl, alt: place.name })),
  ];
  const seen = new Set<string>(cover ? [cover] : []);
  const result: Array<{ url: string; alt: string }> = [];
  for (const item of candidates) {
    if (!item.url || seen.has(item.url)) continue;
    seen.add(item.url);
    result.push(item);
    if (result.length === 4) break;
  }
  return result;
}

function SectionHead({
  number,
  eyebrow,
  title,
  icon: Icon,
  titleId,
}: {
  number: number;
  eyebrow: string;
  title: string;
  icon: LucideIcon;
  titleId: string;
}) {
  return (
    <header className="gg-section-head gg-reveal">
      <span className="gg-section-num" aria-hidden>
        {String(number).padStart(2, "0")}
      </span>
      <div>
        <p className="gg-eyebrow">
          <Icon className="gg-eyebrow-icon" aria-hidden />
          {eyebrow}
        </p>
        <h2 id={titleId} className="gg-serif gg-section-title">
          {title}
        </h2>
      </div>
    </header>
  );
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be blocked; the value stays visible to copy manually.
    }
  }

  return (
    <div className="gg-copy-row">
      <div className="gg-copy-text">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <button
        type="button"
        className="gg-copy-btn"
        onClick={() => void copy()}
        aria-label={`Copy ${label.toLowerCase()}`}
      >
        {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
        <span>{copied ? "Copied" : "Copy"}</span>
      </button>
    </div>
  );
}

function LocalPlaces({ content }: { content: GuestGuideContent }) {
  const places = content.local.filter(
    (place) => place.name.trim() || place.description.trim() || place.photoUrl
  );
  const categories = Array.from(new Set(places.map((place) => place.category)));
  const [filter, setFilter] = useState<LocalCategory | "all">("all");
  const activeFilter =
    filter !== "all" && !categories.includes(filter) ? "all" : filter;
  const shown =
    activeFilter === "all"
      ? places
      : places.filter((place) => place.category === activeFilter);

  return (
    <>
      {categories.length > 1 ? (
        <div className="gg-filter" role="group" aria-label="Filter recommendations">
          <button
            type="button"
            aria-pressed={activeFilter === "all"}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          {categories.map((category) => {
            const Icon = LOCAL_ICONS[category];
            return (
              <button
                key={category}
                type="button"
                aria-pressed={activeFilter === category}
                onClick={() => setFilter(category)}
              >
                <Icon aria-hidden />
                {LOCAL_CATEGORY_LABELS[category]}
              </button>
            );
          })}
        </div>
      ) : null}
      <div className="gg-places">
        {shown.map((place, index) => {
          const Icon = LOCAL_ICONS[place.category];
          const directions =
            place.mapsLink || (place.address ? mapsSearchHref(`${place.name} ${place.address}`) : "");
          return (
            <article
              key={`${activeFilter}-${place.id}`}
              className="gg-place gg-card"
              style={delay(index % 6)}
            >
              <div className="gg-place-media">
                {place.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={place.photoUrl} alt={place.name} loading="lazy" />
                ) : (
                  <div className="gg-place-fallback">
                    <Icon aria-hidden />
                  </div>
                )}
                <span className="gg-place-tag">
                  <Icon aria-hidden />
                  {LOCAL_CATEGORY_LABELS[place.category]}
                </span>
              </div>
              <div className="gg-place-body">
                <h3 className="gg-serif">{place.name}</h3>
                {place.description ? <p>{place.description}</p> : null}
                {place.address ? (
                  <p className="gg-place-addr">
                    <MapPin aria-hidden />
                    {place.address}
                  </p>
                ) : null}
                {directions || place.website ? (
                  <div className="gg-place-actions">
                    {directions ? (
                      <a
                        className="gg-btn gg-btn-sm"
                        href={directions}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Navigation aria-hidden />
                        Directions
                      </a>
                    ) : null}
                    {place.website ? (
                      <a
                        className="gg-btn gg-btn-ghost gg-btn-sm"
                        href={place.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe aria-hidden />
                        Website
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

function CheckoutChecklist({ content }: { content: GuestGuideContent }) {
  const c = content.checkout;
  const tasks = [
    { key: "departure", title: "Before you leave", text: c.departureInstructions },
    { key: "keys", title: "Return the keys", text: c.keyReturn },
    { key: "cleaning", title: "Leave it tidy", text: c.cleaningExpectations },
    { key: "waste", title: "Take out the rubbish", text: c.wasteDisposal },
    { key: "other", title: "Good to know", text: c.otherInfo },
  ].filter((task) => task.text.trim());
  const [done, setDone] = useState<Record<string, boolean>>({});
  const completed = tasks.filter((task) => done[task.key]).length;

  return (
    <div className="gg-checkout">
      {c.checkOutTime ? (
        <div className="gg-time-badge gg-reveal">
          <span>Check-out by</span>
          <strong>{c.checkOutTime}</strong>
        </div>
      ) : null}
      {tasks.length ? (
        <div className="gg-reveal">
          <ul className="gg-checklist">
            {tasks.map((task) => (
              <li key={task.key}>
                <button
                  type="button"
                  className="gg-check gg-card"
                  aria-pressed={Boolean(done[task.key])}
                  onClick={() =>
                    setDone((prev) => ({ ...prev, [task.key]: !prev[task.key] }))
                  }
                >
                  <span className="gg-check-box" aria-hidden>
                    <Check />
                  </span>
                  <span>
                    <strong>{task.title}</strong>
                    <span className="gg-check-text">{task.text}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="gg-progress" aria-hidden>
            <span style={{ width: `${(completed / tasks.length) * 100}%` }} />
          </div>
          <p className="gg-progress-label">
            {completed === tasks.length
              ? "All set — safe travels!"
              : `${completed} of ${tasks.length} done`}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function GuideView({
  document,
  compact = false,
  showBrand = true,
  className = "",
}: {
  document: GuestGuideDocument;
  compact?: boolean;
  showBrand?: boolean;
  className?: string;
}) {
  const uid = useId();
  const rootRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const sectionRefs = useRef<Partial<Record<GuestGuideSectionId, HTMLElement | null>>>({});
  const { content, theme } = document;

  const mosaic = useMemo(() => collectMosaic(content), [content]);
  const sections = useMemo(() => {
    const welcome = document.content.welcome;
    const welcomeHasBody = Boolean(
      welcome.message.trim() ||
        welcome.contactNote.trim() ||
        welcome.hostName.trim() ||
        mosaic.length
    );
    return visibleSections(
      document.sectionOrder,
      document.sectionVisibility,
      document.content
    ).filter((id) => id !== "welcome" || welcomeHasBody);
  }, [document, mosaic]);
  const [active, setActive] = useState<GuestGuideSectionId | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const pending = root.querySelectorAll<HTMLElement>(".gg-reveal:not([data-visible])");
    if (!("IntersectionObserver" in window)) {
      pending.forEach((el) => (el.dataset.visible = "1"));
      return;
    }
    root.dataset.anim = "on";
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.visible = "1";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
    );
    pending.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [document, sections]);

  useEffect(() => {
    const elements = sections
      .map((id) => sectionRefs.current[id])
      .filter((el): el is HTMLElement => Boolean(el));
    if (!elements.length || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) {
          setActive(hit.target.getAttribute("data-section") as GuestGuideSectionId);
        }
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav || !active) return;
    const button = nav.querySelector<HTMLElement>(`[data-target="${active}"]`);
    if (!button) return;
    nav.scrollTo({
      left: button.offsetLeft - nav.clientWidth / 2 + button.clientWidth / 2,
      behavior: "smooth",
    });
  }, [active]);

  function scrollToSection(id: GuestGuideSectionId) {
    setActive(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const w = content.welcome;
  const propertyName = w.propertyName || "Your Guest Guide";
  const hostName = w.hostName || content.contact.hostName;

  const tiles = [
    {
      target: "checkin" as const,
      icon: LogIn,
      label: "Check-in",
      value: content.checkin.checkInTime,
    },
    {
      target: "wifi" as const,
      icon: Wifi,
      label: "Wi-Fi",
      value: content.wifi.networkName,
    },
    {
      target: "checkout" as const,
      icon: LogOut,
      label: "Check-out",
      value: content.checkout.checkOutTime,
    },
    {
      target: "contact" as const,
      icon: Phone,
      label: "Your host",
      value: content.contact.hostName || (content.contact.phone ? "Call or message" : ""),
    },
  ].filter((tile) => tile.value && sections.includes(tile.target));

  function frame(id: GuestGuideSectionId, eyebrow: string, title: string, body: ReactNode) {
    const titleId = `${uid}-${id}`;
    return (
      <section
        key={id}
        ref={(el) => {
          sectionRefs.current[id] = el;
        }}
        data-section={id}
        className={`gg-section gg-section-${id}`}
        aria-labelledby={titleId}
      >
        <SectionHead
          number={sections.indexOf(id) + 1}
          eyebrow={eyebrow}
          title={title}
          icon={SECTION_ICONS[id]}
          titleId={titleId}
        />
        {body}
      </section>
    );
  }

  function renderSection(id: GuestGuideSectionId) {
    switch (id) {
      case "welcome":
        return frame(
          id,
          "Welcome",
          "Make yourself at home",
          <div className="gg-welcome">
            <div className="gg-welcome-text gg-reveal">
              {w.message ? <p className="gg-dropcap">{w.message}</p> : null}
              {w.contactNote ? <p className="gg-note">{w.contactNote}</p> : null}
              {w.hostName ? (
                <div className="gg-signature">
                  {w.hostPhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={w.hostPhotoUrl} alt={w.hostName} loading="lazy" />
                  ) : null}
                  <span>
                    <small>With warm wishes,</small>
                    {w.hostName}
                  </span>
                </div>
              ) : null}
            </div>
            {mosaic.length ? (
              <div className={`gg-mosaic gg-mosaic-${mosaic.length}`}>
                {mosaic.map((image, index) => (
                  <figure key={image.url} className="gg-reveal" style={delay(index)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.url} alt={image.alt} loading="lazy" />
                  </figure>
                ))}
              </div>
            ) : null}
          </div>
        );

      case "checkin": {
        const c = content.checkin;
        const steps = [
          { icon: Navigation, title: "Getting here", text: c.arrivalInstructions },
          { icon: Car, title: "Parking", text: c.parkingInstructions },
          { icon: KeyRound, title: "Keys", text: c.keyCollection },
          { icon: LogIn, title: "Coming inside", text: c.entryInstructions },
        ].filter((step) => step.text.trim());
        const directions = c.mapLink || (c.address ? mapsSearchHref(c.address) : "");
        const photo = c.photos[0];
        return frame(
          id,
          "Arrival",
          "Check-in",
          <div className={`gg-checkin ${photo ? "has-photo" : ""}`}>
            <div>
              <div className="gg-checkin-top">
                {c.checkInTime ? (
                  <div className="gg-time-badge gg-reveal">
                    <span>Check-in from</span>
                    <strong>{c.checkInTime}</strong>
                  </div>
                ) : null}
                {c.address || directions ? (
                  <div className="gg-address gg-card gg-reveal" style={delay(1)}>
                    <MapPin className="gg-address-icon" aria-hidden />
                    <div>
                      {c.address ? (
                        <>
                          <span>Address</span>
                          <p>{c.address}</p>
                        </>
                      ) : null}
                      {directions ? (
                        <a
                          className="gg-btn gg-btn-sm"
                          href={directions}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Navigation aria-hidden />
                          Get directions
                        </a>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
              {steps.length ? (
                <ol className="gg-steps">
                  {steps.map((step, index) => (
                    <li key={step.title} className="gg-step gg-reveal" style={delay(index)}>
                      <span className="gg-step-icon">
                        <step.icon aria-hidden />
                      </span>
                      <div>
                        <h3 className="gg-serif">{step.title}</h3>
                        <p>{step.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : null}
            </div>
            {photo ? (
              <figure className="gg-checkin-photo gg-reveal" style={delay(1)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt={photo.alt || "Arrival"} loading="lazy" />
              </figure>
            ) : null}
          </div>
        );
      }

      case "wifi": {
        const wifi = content.wifi;
        return frame(
          id,
          "Stay connected",
          "Wi-Fi",
          <div className="gg-wifi-card gg-reveal">
            <div className="gg-wifi-glyph" aria-hidden>
              <Wifi />
            </div>
            <div className="gg-wifi-rows">
              {wifi.networkName ? <CopyRow label="Network" value={wifi.networkName} /> : null}
              {wifi.password ? <CopyRow label="Password" value={wifi.password} /> : null}
            </div>
            {wifi.instructions ? <p className="gg-wifi-note">{wifi.instructions}</p> : null}
          </div>
        );
      }

      case "property": {
        const items = content.property.filter(
          (item) => item.title.trim() || item.description.trim() || item.imageUrl
        );
        return frame(
          id,
          "During your stay",
          "Your Stay",
          <div className="gg-amenities">
            {items.map((item, index) => {
              const Icon = (item.icon && PROPERTY_ICONS[item.icon]) || Sparkles;
              return (
                <article
                  key={item.id}
                  className={`gg-amenity gg-card gg-reveal ${item.imageUrl ? "has-media" : ""}`}
                  style={delay(index % 3)}
                >
                  {item.imageUrl ? (
                    <div className="gg-amenity-media">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.imageUrl} alt={item.title} loading="lazy" />
                    </div>
                  ) : null}
                  <div className="gg-amenity-body">
                    <span className="gg-icon-badge">
                      <Icon aria-hidden />
                    </span>
                    <h3 className="gg-serif">{item.title}</h3>
                    {item.description ? <p>{item.description}</p> : null}
                  </div>
                </article>
              );
            })}
          </div>
        );
      }

      case "rules": {
        const rules = content.rules.filter(
          (rule) => rule.title.trim() || rule.description.trim()
        );
        return frame(
          id,
          "House policies",
          "House Rules",
          <ul className="gg-rules">
            {rules.map((rule, index) => {
              const Icon = ruleIcon(rule.title);
              return (
                <li key={rule.id} className="gg-rule gg-card gg-reveal" style={delay(index % 2)}>
                  <span className="gg-icon-badge">
                    <Icon aria-hidden />
                  </span>
                  <div>
                    <h3 className="gg-serif">{rule.title}</h3>
                    {rule.description ? <p>{rule.description}</p> : null}
                  </div>
                </li>
              );
            })}
          </ul>
        );
      }

      case "local":
        return frame(
          id,
          "Explore nearby",
          "Local Favourites",
          <LocalPlaces content={content} />
        );

      case "checkout":
        return frame(
          id,
          "Departure",
          "Check-out",
          <CheckoutChecklist content={content} />
        );

      case "emergency": {
        const e = content.emergency;
        const numbers = e.numbers.filter((item) => item.value.trim());
        const info = [
          { icon: Hospital, title: "Nearest hospital", text: e.nearestHospital },
          { icon: Pill, title: "Nearest pharmacy", text: e.nearestPharmacy },
          { icon: Users, title: "Local contacts", text: e.localContacts },
          { icon: Info, title: "What to do", text: e.instructions },
        ].filter((item) => item.text.trim());
        return frame(
          id,
          "Safety first",
          "Emergency Information",
          <>
            {numbers.length ? (
              <div className="gg-sos">
                {numbers.map((item, index) => (
                  <a
                    key={item.id}
                    href={telHref(item.value)}
                    className="gg-sos-tile gg-reveal"
                    style={delay(index)}
                  >
                    <Phone aria-hidden />
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </a>
                ))}
              </div>
            ) : null}
            {info.length ? (
              <div className="gg-info-grid">
                {info.map((item, index) => (
                  <div key={item.title} className="gg-info gg-card gg-reveal" style={delay(index % 2)}>
                    <span className="gg-icon-badge">
                      <item.icon aria-hidden />
                    </span>
                    <div>
                      <h3 className="gg-serif">{item.title}</h3>
                      <p>{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </>
        );
      }

      case "contact": {
        const c = content.contact;
        return frame(
          id,
          "Stay in touch",
          "Contact",
          <div className="gg-contact gg-reveal">
            {w.hostPhotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="gg-contact-avatar"
                src={w.hostPhotoUrl}
                alt={c.hostName || w.hostName || "Host"}
                loading="lazy"
              />
            ) : (
              <span className="gg-contact-avatar gg-contact-avatar-fallback" aria-hidden>
                <MessageCircle />
              </span>
            )}
            <div>
              <p className="gg-eyebrow">Your host</p>
              <h3 className="gg-serif">{c.hostName || w.hostName || "We're here to help"}</h3>
              <p>Questions during your stay? We&apos;re just a message away.</p>
              <div className="gg-contact-actions">
                {c.phone ? (
                  <a className="gg-btn" href={telHref(c.phone)}>
                    <Phone aria-hidden />
                    Call
                  </a>
                ) : null}
                {c.whatsapp ? (
                  <a
                    className="gg-btn"
                    href={waHref(c.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle aria-hidden />
                    WhatsApp
                  </a>
                ) : null}
                {c.email ? (
                  <a className="gg-btn gg-btn-ghost" href={`mailto:${c.email}`}>
                    <Mail aria-hidden />
                    Email
                  </a>
                ) : null}
                {c.website ? (
                  <a
                    className="gg-btn gg-btn-ghost"
                    href={c.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Globe aria-hidden />
                    Website
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  }

  return (
    <article
      ref={rootRef}
      className={`gg-guide ${compact ? "gg-compact" : ""} ${className}`.trim()}
      data-theme={theme}
    >
      <header className="gg-cover">
        <div className="gg-cover-media">
          {w.coverPhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={w.coverPhotoUrl}
              alt={w.propertyName ? `${w.propertyName} cover` : "Property cover"}
              fetchPriority="high"
            />
          ) : (
            <div className="gg-cover-fallback" />
          )}
          <div className="gg-cover-scrim" />
        </div>
        <div className="gg-cover-frame" aria-hidden />
        <div className="gg-cover-content">
          <p className="gg-eyebrow gg-rise" style={delay(0)}>
            Welcome to
          </p>
          <h1 className="gg-serif gg-cover-title gg-rise" style={delay(1)}>
            {propertyName}
          </h1>
          {w.subtitle ? (
            <p className="gg-cover-sub gg-rise" style={delay(2)}>
              {w.subtitle}
            </p>
          ) : null}
          {w.location || content.checkin.checkInTime ? (
            <div className="gg-cover-chips gg-rise" style={delay(3)}>
              {w.location ? (
                <span className="gg-glass-chip">
                  <MapPin aria-hidden />
                  {w.location}
                </span>
              ) : null}
              {content.checkin.checkInTime ? (
                <span className="gg-glass-chip">
                  <Clock aria-hidden />
                  Check-in {content.checkin.checkInTime}
                </span>
              ) : null}
            </div>
          ) : null}
          {hostName ? (
            <div className="gg-cover-host gg-rise" style={delay(4)}>
              {w.hostPhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={w.hostPhotoUrl} alt="" />
              ) : null}
              <span>
                Hosted by <strong>{hostName}</strong>
              </span>
            </div>
          ) : null}
        </div>
        {sections.length ? (
          <button
            type="button"
            className="gg-scroll-cue"
            onClick={() => scrollToSection(sections[0])}
            aria-label="Scroll to guide"
          >
            <ChevronDown aria-hidden />
          </button>
        ) : null}
      </header>

      {tiles.length ? (
        <div className="gg-tiles">
          {tiles.map((tile, index) => (
            <button
              key={tile.target}
              type="button"
              className="gg-tile gg-rise"
              style={delay(index + 4)}
              onClick={() => scrollToSection(tile.target)}
            >
              <span className="gg-tile-icon">
                <tile.icon aria-hidden />
              </span>
              <span className="gg-tile-text">
                <small>{tile.label}</small>
                <strong>{tile.value}</strong>
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {sections.length > 1 ? (
        <div className="gg-nav-wrap">
          <nav ref={navRef} className="gg-nav" aria-label="Guide sections">
            {sections.map((id) => {
              const Icon = SECTION_ICONS[id];
              return (
                <button
                  key={id}
                  type="button"
                  data-target={id}
                  aria-current={active === id ? "true" : undefined}
                  onClick={() => scrollToSection(id)}
                >
                  <Icon aria-hidden />
                  {SECTION_LABELS[id]}
                </button>
              );
            })}
          </nav>
        </div>
      ) : null}

      <div className="gg-shell">
        {sections.length ? (
          sections.map((id) => renderSection(id))
        ) : (
          <p className="gg-empty">
            Your guide will appear here as you add details.
          </p>
        )}

        {showBrand ? (
          <p className="gg-footer-brand">
            <span className="gg-footer-ornament" aria-hidden>
              ✦
            </span>
            Enjoy your stay · Powered by{" "}
            <a href="https://hostvia.me" target="_blank" rel="noopener noreferrer">
              Hostvia
            </a>
          </p>
        ) : null}
      </div>
    </article>
  );
}
