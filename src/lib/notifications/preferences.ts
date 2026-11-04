export type NotificationPreferences = {
  emailNewRequest: boolean;
  emailConfirmation: boolean;
  emailCancellation: boolean;
  pushNewRequest: boolean;
  pushConfirmation: boolean;
  pushCancellation: boolean;
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  emailNewRequest: true,
  emailConfirmation: true,
  emailCancellation: true,
  pushNewRequest: true,
  pushConfirmation: true,
  pushCancellation: true,
};

export type PreferenceRow = {
  email_new_request?: boolean | null;
  email_confirmation?: boolean | null;
  email_cancellation?: boolean | null;
  push_new_request?: boolean | null;
  push_confirmation?: boolean | null;
  push_cancellation?: boolean | null;
};

function flag(value: boolean | null | undefined, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function preferencesFromRow(
  row: PreferenceRow | null | undefined
): NotificationPreferences {
  if (!row) return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  return {
    emailNewRequest: flag(row.email_new_request, true),
    emailConfirmation: flag(row.email_confirmation, true),
    emailCancellation: flag(row.email_cancellation, true),
    pushNewRequest: flag(row.push_new_request, true),
    pushConfirmation: flag(row.push_confirmation, true),
    pushCancellation: flag(row.push_cancellation, true),
  };
}

export function preferencesToRow(
  prefs: NotificationPreferences
): Required<PreferenceRow> {
  return {
    email_new_request: prefs.emailNewRequest,
    email_confirmation: prefs.emailConfirmation,
    email_cancellation: prefs.emailCancellation,
    push_new_request: prefs.pushNewRequest,
    push_confirmation: prefs.pushConfirmation,
    push_cancellation: prefs.pushCancellation,
  };
}

export function parseNotificationPreferences(
  input: unknown
): NotificationPreferences | null {
  if (!input || typeof input !== "object") return null;
  const value = input as Record<string, unknown>;
  const keys: (keyof NotificationPreferences)[] = [
    "emailNewRequest",
    "emailConfirmation",
    "emailCancellation",
    "pushNewRequest",
    "pushConfirmation",
    "pushCancellation",
  ];
  const next = { ...DEFAULT_NOTIFICATION_PREFERENCES };
  for (const key of keys) {
    if (typeof value[key] !== "boolean") return null;
    next[key] = value[key];
  }
  return next;
}
