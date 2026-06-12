export function getVapidPublicKey(): string | null {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() || null;
}

export function hasWebPushConfigured(): boolean {
  return Boolean(
    getVapidPublicKey() &&
      process.env.VAPID_PRIVATE_KEY?.trim() &&
      process.env.VAPID_PUBLIC_KEY?.trim()
  );
}
