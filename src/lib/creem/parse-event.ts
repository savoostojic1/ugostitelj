const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const CREEM_SUBSCRIPTION_EVENT_TYPES = [
  "checkout.completed",
  "subscription.active",
  "subscription.paid",
  "subscription.trialing",
  "subscription.update",
  "subscription.scheduled_cancel",
  "subscription.past_due",
  "subscription.unpaid",
  "subscription.canceled",
  "subscription.expired",
  "subscription.paused",
] as const;

export type CreemSubscriptionEventType =
  (typeof CREEM_SUBSCRIPTION_EVENT_TYPES)[number];

export type ParsedCreemEvent = {
  id: string;
  eventType: string;
  productId: string | null;
  productConflict: boolean;
  customerId: string | null;
  subscriptionId: string | null;
  subscriptionStatus: string | null;
  subscriptionUpdatedAt: string | null;
  currentPeriodEnd: string | null;
  metadataHostId: string | null;
  metadataAppId: string | null;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function readString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

export function readCreemId(value: unknown): string | null {
  const direct = readString(value);
  if (direct) return direct;
  return readString(asRecord(value)?.id);
}

function readHostId(metadata: unknown): string | null {
  const userId = readString(asRecord(metadata)?.userId);
  if (!userId || !UUID_RE.test(userId)) return null;
  return userId;
}

function readAppId(metadata: unknown): string | null {
  return readString(asRecord(metadata)?.appId);
}

export function parseCreemWebhook(payload: unknown): ParsedCreemEvent | null {
  const event = asRecord(payload);
  if (!event) return null;

  const id = readString(event.id);
  const eventType = readString(event.eventType);
  if (!id || !eventType) return null;

  const object = asRecord(event.object);
  if (!object) {
    return {
      id,
      eventType,
      productId: null,
      productConflict: false,
      customerId: null,
      subscriptionId: null,
      subscriptionStatus: null,
      subscriptionUpdatedAt: null,
      currentPeriodEnd: null,
      metadataHostId: readHostId(event.metadata),
      metadataAppId: readAppId(event.metadata),
    };
  }

  if (eventType === "checkout.completed") {
    const subscription = asRecord(object.subscription);
    const checkoutProductId = readCreemId(object.product);
    const subscriptionProductId = subscription
      ? readCreemId(subscription.product)
      : null;
    const productConflict = Boolean(
      checkoutProductId &&
        subscriptionProductId &&
        checkoutProductId !== subscriptionProductId
    );

    return {
      id,
      eventType,
      productId: productConflict
        ? null
        : (subscriptionProductId ?? checkoutProductId),
      productConflict,
      customerId:
        readCreemId(subscription?.customer) ?? readCreemId(object.customer),
      subscriptionId: readCreemId(object.subscription),
      subscriptionStatus: readString(subscription?.status),
      subscriptionUpdatedAt: readString(subscription?.updated_at),
      currentPeriodEnd: readString(subscription?.current_period_end_date),
      metadataHostId:
        readHostId(object.metadata) ?? readHostId(subscription?.metadata),
      metadataAppId:
        readAppId(object.metadata) ?? readAppId(subscription?.metadata),
    };
  }

  return {
    id,
    eventType,
    productId: readCreemId(object.product),
    productConflict: false,
    customerId: readCreemId(object.customer),
    subscriptionId: readString(object.id),
    subscriptionStatus: readString(object.status),
    subscriptionUpdatedAt: readString(object.updated_at),
    currentPeriodEnd: readString(object.current_period_end_date),
    metadataHostId: readHostId(object.metadata),
    metadataAppId: readAppId(object.metadata),
  };
}

export function isCreemSubscriptionEvent(
  eventType: string
): eventType is CreemSubscriptionEventType {
  return (CREEM_SUBSCRIPTION_EVENT_TYPES as readonly string[]).includes(
    eventType
  );
}
