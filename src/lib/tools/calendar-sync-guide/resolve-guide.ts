import { PLATFORMS, platformLabel, type PlatformId } from "./platforms";
import {
  EXPORT_FLOWS,
  IMPORT_FLOWS,
  type ActionStep,
  type StepLink,
} from "./steps";

export type PairValidationError =
  | "missing_from"
  | "missing_to"
  | "same_platform"
  | "cannot_export"
  | "cannot_import";

export interface CalendarPair {
  from: PlatformId;
  to: PlatformId;
}

export interface ResolvedGuide {
  from: PlatformId;
  to: PlatformId;
  title: string;
  description: string;
  directionNote: string;
  reverseNote: string | null;
  warnings: string[];
  needsConfirmation: boolean;
  steps: ActionStep[];
  completionChecklist: string[];
  limitationNotes: string[];
  officialLinks: { label: string; url: string }[];
}

export function validatePair(
  from: PlatformId | null,
  to: PlatformId | null
): PairValidationError | null {
  if (!from) return "missing_from";
  if (!to) return "missing_to";
  if (from === to) return "same_platform";
  if (!PLATFORMS[from].canExport) return "cannot_export";
  if (!PLATFORMS[to].canImport) return "cannot_import";
  return null;
}

export function pairValidationMessage(error: PairValidationError): string {
  switch (error) {
    case "missing_from":
      return "Choose the calendar to export FROM.";
    case "missing_to":
      return "Choose the calendar to import TO.";
    case "same_platform":
      return "Choose two different platforms.";
    case "cannot_export":
      return "That source calendar cannot export an iCal link in this guide.";
    case "cannot_import":
      return "That destination calendar cannot import an iCal link in this guide.";
  }
}

function uniqueLinks(
  links: { label: string; url: string }[]
): { label: string; url: string }[] {
  const seen = new Set<string>();
  return links.filter((link) => {
    if (!link.url || !link.label) return false;
    if (seen.has(link.url)) return false;
    seen.add(link.url);
    return true;
  });
}

function platformOpenLink(id: PlatformId): StepLink | null {
  const platform = PLATFORMS[id];
  if (!platform.openUrl || !platform.openLabel) return null;
  return {
    label: platform.openLabel,
    url: platform.openUrl,
    kind: "open_platform",
  };
}

function helpLink(label: string, url: string): StepLink | null {
  if (!label || !url) return null;
  return { label, url, kind: "official_help" };
}

function withLinks(
  partial: Omit<ActionStep, "id" | "links"> & { id: string },
  links: Array<StepLink | null>
): ActionStep {
  return {
    ...partial,
    links: links.filter((link): link is StepLink => Boolean(link)),
  };
}

export function resolveGuide(pair: CalendarPair): ResolvedGuide {
  const from = PLATFORMS[pair.from];
  const to = PLATFORMS[pair.to];
  const exportFlow = EXPORT_FLOWS[pair.from];
  const importFlow = IMPORT_FLOWS[pair.to];

  const needsConfirmation = Boolean(
    exportFlow.needsConfirmation || importFlow.needsConfirmation
  );

  const warnings = [
    ...(exportFlow.caveats ?? []),
    ...(importFlow.caveats ?? []),
  ];

  if (needsConfirmation) {
    warnings.unshift(
      `Confirm menu names for ${platformLabel(pair.from)} → ${platformLabel(pair.to)} in each product’s official help.`
    );
  }

  const directionNote = `This connection is one-way: ${from.label} busy dates are imported into ${to.label}.`;
  const reverseNote =
    from.canImport && to.canExport
      ? `To sync the other direction, run this guide again with ${to.label} → ${from.label}. One calendar link never creates two-way sync.`
      : null;

  const exportHelp = helpLink(exportFlow.helpLabel, exportFlow.helpUrl);
  const importHelp = helpLink(importFlow.helpLabel, importFlow.helpUrl);

  const steps: ActionStep[] = [
    withLinks(
      {
        id: "open-source",
        title: exportFlow.open.title,
        body: exportFlow.open.body,
        note: exportFlow.open.note,
        why: exportFlow.open.why,
        needHelp: [exportFlow.open.needHelp, ...(exportFlow.caveats ?? [])]
          .filter(Boolean)
          .join(" "),
        needsConfirmation: exportFlow.open.needsConfirmation,
        confirmLabel: exportFlow.open.confirmLabel ?? "I’ve done this",
      },
      [platformOpenLink(pair.from), exportHelp]
    ),
    withLinks(
      {
        id: "export-link",
        title: exportFlow.connect.title,
        body: exportFlow.connect.body,
        note: exportFlow.connect.note,
        why: exportFlow.connect.why,
        needHelp: exportFlow.connect.needHelp,
        needsConfirmation: exportFlow.connect.needsConfirmation,
        confirmLabel: exportFlow.connect.confirmLabel ?? "I’ve done this",
      },
      [exportHelp]
    ),
    withLinks(
      {
        id: "import-link",
        title: `Import it into ${to.shortLabel}`,
        body: importFlow.open.body,
        note: importFlow.connect.body,
        why: importFlow.connect.why,
        needHelp: [
          importFlow.open.needHelp,
          importFlow.connect.needHelp,
          importFlow.connect.note,
          ...(importFlow.caveats ?? []),
        ]
          .filter(Boolean)
          .join(" "),
        needsConfirmation:
          importFlow.open.needsConfirmation || importFlow.connect.needsConfirmation,
        confirmLabel: importFlow.connect.confirmLabel ?? "I’ve imported the calendar",
      },
      [platformOpenLink(pair.to), importHelp]
    ),
    withLinks(
      {
        id: "verify",
        title: "Check that it works",
        body: `Confirm that ${to.label} shows the expected blocked or booked dates from ${from.label}.`,
        note: "Updates may take time. Hostvia cannot verify this connection automatically.",
        why: `${directionNote}${reverseNote ? ` ${reverseNote}` : ""} Sync reduces double-booking risk but cannot guarantee prevention.`,
        needHelp:
          "If dates are missing, wait for a refresh, use any Refresh / Import now control, and confirm you copied an iCal feed URL rather than a normal webpage.",
        confirmLabel: "Finish",
        checklist: [
          "I selected the correct property.",
          "I imported the calendar link.",
          "I checked the dates.",
        ],
      },
      [platformOpenLink(pair.to), importHelp]
    ),
  ];

  return {
    from: pair.from,
    to: pair.to,
    title: `${from.label} → ${to.label}`,
    description: `Export from ${from.label}, then import into ${to.label}.`,
    directionNote,
    reverseNote,
    warnings,
    needsConfirmation,
    steps,
    completionChecklist: [
      "Correct property selected.",
      "Calendar link imported.",
      "Dates verified.",
      "Reverse synchronization configured separately if required.",
    ],
    limitationNotes: [
      "iCal sync usually shares booked or blocked dates, not every reservation detail.",
      from.syncNote,
      to.syncNote,
      "Connecting one direction does not automatically connect the reverse direction.",
      "Calendar syncing reduces double-booking risk but cannot guarantee that double bookings will never occur.",
    ],
    officialLinks: uniqueLinks([
      { label: exportFlow.helpLabel || `${from.label} help`, url: exportFlow.helpUrl },
      { label: importFlow.helpLabel || `${to.label} help`, url: importFlow.helpUrl },
      { label: `${from.label} help`, url: from.helpUrls.primary },
      { label: `${to.label} help`, url: to.helpUrls.primary },
    ]),
  };
}
