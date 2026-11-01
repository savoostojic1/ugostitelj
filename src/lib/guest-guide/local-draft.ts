import { LOCAL_DRAFT_KEY } from "@/lib/guest-guide/content";
import { createEmptyGuideDocument } from "@/lib/guest-guide/defaults";
import {
  GUEST_GUIDE_SECTION_IDS,
  isGuestGuideSectionId,
  isGuestGuideTheme,
  type GuestGuideDocument,
  type GuestGuideSectionId,
  type SectionVisibility,
} from "@/lib/guest-guide/types";

export interface LocalDraftPayload {
  version: 1;
  updatedAt: string;
  document: GuestGuideDocument;
  serverDraftId?: string;
}

function sanitizeDocument(raw: unknown): GuestGuideDocument {
  const fallback = createEmptyGuideDocument();
  if (!raw || typeof raw !== "object") return fallback;
  const value = raw as Partial<GuestGuideDocument>;

  const theme =
    typeof value.theme === "string" && isGuestGuideTheme(value.theme)
      ? value.theme
      : fallback.theme;

  const sectionOrder = Array.isArray(value.sectionOrder)
    ? value.sectionOrder.filter(isGuestGuideSectionId)
    : fallback.sectionOrder;

  const order =
    sectionOrder.length > 0
      ? [
          ...sectionOrder,
          ...GUEST_GUIDE_SECTION_IDS.filter((id) => !sectionOrder.includes(id)),
        ]
      : fallback.sectionOrder;

  const visibility: SectionVisibility = { ...fallback.sectionVisibility };
  if (value.sectionVisibility && typeof value.sectionVisibility === "object") {
    for (const id of GUEST_GUIDE_SECTION_IDS) {
      const flag = (value.sectionVisibility as Record<string, unknown>)[id];
      if (typeof flag === "boolean") visibility[id] = flag;
    }
  }

  return {
    theme,
    sectionOrder: order as GuestGuideSectionId[],
    sectionVisibility: visibility,
    content: {
      ...fallback.content,
      ...(value.content && typeof value.content === "object" ? value.content : {}),
      welcome: {
        ...fallback.content.welcome,
        ...(value.content &&
        typeof value.content === "object" &&
        value.content.welcome &&
        typeof value.content.welcome === "object"
          ? value.content.welcome
          : {}),
      },
      checkin: {
        ...fallback.content.checkin,
        ...(value.content &&
        typeof value.content === "object" &&
        value.content.checkin &&
        typeof value.content.checkin === "object"
          ? value.content.checkin
          : {}),
        photos: Array.isArray(
          value.content &&
            typeof value.content === "object" &&
            value.content.checkin &&
            typeof value.content.checkin === "object"
            ? value.content.checkin.photos
            : null
        )
          ? value.content!.checkin!.photos!
          : [],
      },
      checkout: {
        ...fallback.content.checkout,
        ...(value.content &&
        typeof value.content === "object" &&
        value.content.checkout &&
        typeof value.content.checkout === "object"
          ? value.content.checkout
          : {}),
      },
      wifi: {
        ...fallback.content.wifi,
        ...(value.content &&
        typeof value.content === "object" &&
        value.content.wifi &&
        typeof value.content.wifi === "object"
          ? value.content.wifi
          : {}),
      },
      property: Array.isArray(
        value.content && typeof value.content === "object"
          ? value.content.property
          : null
      )
        ? value.content!.property!
        : [],
      rules: Array.isArray(
        value.content && typeof value.content === "object"
          ? value.content.rules
          : null
      )
        ? value.content!.rules!
        : [],
      local: Array.isArray(
        value.content && typeof value.content === "object"
          ? value.content.local
          : null
      )
        ? value.content!.local!
        : [],
      emergency: {
        ...fallback.content.emergency,
        ...(value.content &&
        typeof value.content === "object" &&
        value.content.emergency &&
        typeof value.content.emergency === "object"
          ? value.content.emergency
          : {}),
        numbers: Array.isArray(
          value.content &&
            typeof value.content === "object" &&
            value.content.emergency &&
            typeof value.content.emergency === "object"
            ? value.content.emergency.numbers
            : null
        )
          ? value.content!.emergency!.numbers!
          : [],
      },
      contact: {
        ...fallback.content.contact,
        ...(value.content &&
        typeof value.content === "object" &&
        value.content.contact &&
        typeof value.content.contact === "object"
          ? value.content.contact
          : {}),
      },
    },
  };
}

export function readLocalDraft(): LocalDraftPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LOCAL_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LocalDraftPayload>;
    if (!parsed || parsed.version !== 1) return null;
    return {
      version: 1,
      updatedAt:
        typeof parsed.updatedAt === "string"
          ? parsed.updatedAt
          : new Date().toISOString(),
      document: sanitizeDocument(parsed.document),
      serverDraftId:
        typeof parsed.serverDraftId === "string"
          ? parsed.serverDraftId
          : undefined,
    };
  } catch {
    return null;
  }
}

export function writeLocalDraft(
  document: GuestGuideDocument,
  serverDraftId?: string
): void {
  if (typeof window === "undefined") return;
  const payload: LocalDraftPayload = {
    version: 1,
    updatedAt: new Date().toISOString(),
    document,
    serverDraftId,
  };
  try {
    window.localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(payload));
  } catch {
    // Quota or privacy mode — server draft remains the backup.
  }
}

export function clearLocalDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LOCAL_DRAFT_KEY);
  } catch {
    // Ignore.
  }
}
