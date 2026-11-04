const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export function mapBookingRequestRpcError(message: string): {
  status: number;
  error: string;
} {
  if (message.includes("no longer available")) {
    return {
      status: 409,
      error:
        "These dates are no longer available. Reject the inquiry or contact the guest.",
    };
  }

  if (
    message.includes("Not authenticated") ||
    message.includes("Not authorized")
  ) {
    return {
      status: 403,
      error: "You do not have permission to update this reservation.",
    };
  }

  if (message.includes("not found") || message.includes("already processed")) {
    return { status: 409, error: "This inquiry was already handled." };
  }

  if (message.includes("Only manual reservations")) {
    return {
      status: 409,
      error: "Imported calendar reservations are updated by calendar sync.",
    };
  }

  return { status: 400, error: "Could not update this reservation." };
}

export function isMissingRpc(message: string, name: string): boolean {
  return (
    message.includes(name) &&
    (message.includes("Could not find") ||
      message.includes("does not exist") ||
      message.includes("schema cache"))
  );
}
