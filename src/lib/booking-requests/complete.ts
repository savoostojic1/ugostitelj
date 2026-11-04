export async function completeBookingRequest(
  id: string,
  deps: {
    attach: () => Promise<{
      reference: string;
      manageUrl: string;
      token: string;
    } | null>;
    notify: (token: string | undefined) => Promise<{ emailSent: boolean }>;
  }
): Promise<{
  ok: true;
  id: string;
  reference: string | null;
  manageUrl: string | null;
  emailSent: boolean;
}> {
  let reference: string | null = null;
  let manageUrl: string | null = null;
  let emailSent = false;

  try {
    const access = await deps.attach();
    const token = access?.token;
    if (access) {
      reference = access.reference;
      manageUrl = access.manageUrl;
    }
    const notice = await deps.notify(token);
    emailSent = notice.emailSent;
  } catch (error) {
    console.error("[booking-requests] notification failed");
    void error;
  }

  return { ok: true, id, reference, manageUrl, emailSent };
}
