import { createEmptyGuideDocument } from "@/lib/guest-guide/defaults";
import {
  GUEST_GUIDE_SECTION_IDS,
  isGuestGuideSectionId,
  isGuestGuideTheme,
  type GuestGuideContent,
  type GuestGuideDocument,
  type GuestGuideSectionId,
  type GuestGuideStatus,
  type SectionVisibility,
} from "@/lib/guest-guide/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function mergeSectionOrder(
  raw: unknown,
  fallback: GuestGuideSectionId[]
): GuestGuideSectionId[] {
  if (!Array.isArray(raw)) return fallback;
  const filtered = raw.filter(
    (id): id is GuestGuideSectionId =>
      typeof id === "string" && isGuestGuideSectionId(id)
  );
  if (filtered.length === 0) return fallback;
  return [
    ...filtered,
    ...GUEST_GUIDE_SECTION_IDS.filter((id) => !filtered.includes(id)),
  ];
}

function mergeSectionVisibility(
  raw: unknown,
  fallback: SectionVisibility
): SectionVisibility {
  const visibility: SectionVisibility = { ...fallback };
  if (!isRecord(raw)) return visibility;
  for (const id of GUEST_GUIDE_SECTION_IDS) {
    const flag = raw[id];
    if (typeof flag === "boolean") visibility[id] = flag;
  }
  return visibility;
}

function mergeWelcome(
  raw: unknown,
  fallback: GuestGuideContent["welcome"]
): GuestGuideContent["welcome"] {
  if (!isRecord(raw)) return fallback;
  return {
    propertyName: asString(raw.propertyName, fallback.propertyName),
    location: asString(raw.location, fallback.location),
    subtitle: asString(raw.subtitle, fallback.subtitle),
    message: asString(raw.message, fallback.message),
    hostName: asString(raw.hostName, fallback.hostName),
    hostPhotoUrl: asString(raw.hostPhotoUrl, fallback.hostPhotoUrl),
    coverPhotoUrl: asString(raw.coverPhotoUrl, fallback.coverPhotoUrl),
    contactNote: asString(raw.contactNote, fallback.contactNote),
  };
}

function mergeCheckIn(
  raw: unknown,
  fallback: GuestGuideContent["checkin"]
): GuestGuideContent["checkin"] {
  if (!isRecord(raw)) return fallback;
  return {
    checkInTime: asString(raw.checkInTime, fallback.checkInTime),
    address: asString(raw.address, fallback.address),
    arrivalInstructions: asString(
      raw.arrivalInstructions,
      fallback.arrivalInstructions
    ),
    parkingInstructions: asString(
      raw.parkingInstructions,
      fallback.parkingInstructions
    ),
    keyCollection: asString(raw.keyCollection, fallback.keyCollection),
    entryInstructions: asString(
      raw.entryInstructions,
      fallback.entryInstructions
    ),
    mapLink: asString(raw.mapLink, fallback.mapLink),
    photos: Array.isArray(raw.photos) ? (raw.photos as typeof fallback.photos) : [],
  };
}

function mergeCheckOut(
  raw: unknown,
  fallback: GuestGuideContent["checkout"]
): GuestGuideContent["checkout"] {
  if (!isRecord(raw)) return fallback;
  return {
    checkOutTime: asString(raw.checkOutTime, fallback.checkOutTime),
    departureInstructions: asString(
      raw.departureInstructions,
      fallback.departureInstructions
    ),
    keyReturn: asString(raw.keyReturn, fallback.keyReturn),
    cleaningExpectations: asString(
      raw.cleaningExpectations,
      fallback.cleaningExpectations
    ),
    wasteDisposal: asString(raw.wasteDisposal, fallback.wasteDisposal),
    otherInfo: asString(raw.otherInfo, fallback.otherInfo),
  };
}

function mergeWifi(
  raw: unknown,
  fallback: GuestGuideContent["wifi"]
): GuestGuideContent["wifi"] {
  if (!isRecord(raw)) return fallback;
  return {
    networkName: asString(raw.networkName, fallback.networkName),
    password: asString(raw.password, fallback.password),
    instructions: asString(raw.instructions, fallback.instructions),
  };
}

function mergeEmergency(
  raw: unknown,
  fallback: GuestGuideContent["emergency"]
): GuestGuideContent["emergency"] {
  if (!isRecord(raw)) return fallback;
  return {
    numbers: Array.isArray(raw.numbers)
      ? (raw.numbers as typeof fallback.numbers)
      : [],
    nearestHospital: asString(raw.nearestHospital, fallback.nearestHospital),
    nearestPharmacy: asString(raw.nearestPharmacy, fallback.nearestPharmacy),
    localContacts: asString(raw.localContacts, fallback.localContacts),
    instructions: asString(raw.instructions, fallback.instructions),
  };
}

function mergeContact(
  raw: unknown,
  fallback: GuestGuideContent["contact"]
): GuestGuideContent["contact"] {
  if (!isRecord(raw)) return fallback;
  return {
    hostName: asString(raw.hostName, fallback.hostName),
    phone: asString(raw.phone, fallback.phone),
    whatsapp: asString(raw.whatsapp, fallback.whatsapp),
    email: asString(raw.email, fallback.email),
    website: asString(raw.website, fallback.website),
  };
}

function mergeContent(
  raw: unknown,
  fallback: GuestGuideContent
): GuestGuideContent {
  if (!isRecord(raw)) return fallback;
  return {
    welcome: mergeWelcome(raw.welcome, fallback.welcome),
    checkin: mergeCheckIn(raw.checkin, fallback.checkin),
    checkout: mergeCheckOut(raw.checkout, fallback.checkout),
    wifi: mergeWifi(raw.wifi, fallback.wifi),
    property: Array.isArray(raw.property)
      ? (raw.property as GuestGuideContent["property"])
      : [],
    rules: Array.isArray(raw.rules)
      ? (raw.rules as GuestGuideContent["rules"])
      : [],
    local: Array.isArray(raw.local)
      ? (raw.local as GuestGuideContent["local"])
      : [],
    emergency: mergeEmergency(raw.emergency, fallback.emergency),
    contact: mergeContact(raw.contact, fallback.contact),
  };
}

/** Normalize arbitrary JSON into a safe GuestGuideDocument. */
export function parseGuestGuideDocument(raw: unknown): GuestGuideDocument {
  const fallback = createEmptyGuideDocument();
  if (!isRecord(raw)) return fallback;

  const theme =
    typeof raw.theme === "string" && isGuestGuideTheme(raw.theme)
      ? raw.theme
      : fallback.theme;

  return {
    theme,
    sectionOrder: mergeSectionOrder(raw.sectionOrder, fallback.sectionOrder),
    sectionVisibility: mergeSectionVisibility(
      raw.sectionVisibility,
      fallback.sectionVisibility
    ),
    content: mergeContent(raw.content, fallback.content),
  };
}

/** Parse a guide document from flat API body fields. */
export function parseGuideBody(body: unknown): GuestGuideDocument {
  if (!isRecord(body)) return createEmptyGuideDocument();
  return parseGuestGuideDocument({
    theme: body.theme,
    content: body.content,
    sectionOrder: body.sectionOrder ?? body.section_order,
    sectionVisibility: body.sectionVisibility ?? body.section_visibility,
  });
}

export function documentFromDbFields(fields: {
  theme?: unknown;
  content?: unknown;
  section_order?: unknown;
  section_visibility?: unknown;
}): GuestGuideDocument {
  return parseGuestGuideDocument({
    theme: fields.theme,
    content: fields.content,
    sectionOrder: fields.section_order,
    sectionVisibility: fields.section_visibility,
  });
}

export function guideTitleFromDocument(document: GuestGuideDocument): string {
  const name = document.content.welcome.propertyName.trim();
  return name || "Guest Guide";
}

export function coverUrlFromDocument(document: GuestGuideDocument): string | null {
  const url = document.content.welcome.coverPhotoUrl.trim();
  return url || null;
}

export function isGuestGuideStatus(value: unknown): value is GuestGuideStatus {
  return (
    value === "draft" || value === "published" || value === "unpublished"
  );
}

export function documentToDbColumns(document: GuestGuideDocument) {
  return {
    theme: document.theme,
    content: document.content,
    section_order: document.sectionOrder,
    section_visibility: document.sectionVisibility,
    title: guideTitleFromDocument(document),
    cover_image_url: coverUrlFromDocument(document),
  };
}
