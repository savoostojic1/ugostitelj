import "server-only";

import { createServiceClient } from "@/lib/supabase/service";
import { normalizeTestHostIds } from "@/lib/stripe/app-identity";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseTestHostIdsInput(raw: string): string[] {
  return raw
    .split(/[,\n\r]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export async function resolveTestHostIdsInput(raw: string): Promise<{
  ids: string[];
  errors: string[];
}> {
  const parts = parseTestHostIdsInput(raw);
  if (!parts.length) {
    return { ids: [], errors: [] };
  }

  const admin = createServiceClient();
  const ids: string[] = [];
  const errors: string[] = [];
  const emailsToResolve: string[] = [];

  for (const part of parts) {
    if (UUID_RE.test(part)) {
      ids.push(part);
      continue;
    }

    if (part.includes("@")) {
      emailsToResolve.push(part.toLowerCase());
      continue;
    }

    errors.push(`Invalid test user value: ${part}`);
  }

  if (emailsToResolve.length) {
    const emailToId = new Map<string, string>();
    let page = 1;

    while (true) {
      const { data, error } = await admin.auth.admin.listUsers({
        page,
        perPage: 200,
      });

      if (error) {
        throw new Error(error.message);
      }

      for (const user of data.users) {
        if (user.email) {
          emailToId.set(user.email.toLowerCase(), user.id);
        }
      }

      if (data.users.length < 200) break;
      page += 1;
    }

    for (const email of emailsToResolve) {
      const userId = emailToId.get(email);
      if (!userId) {
        errors.push(`No user found for email: ${email}`);
        continue;
      }
      ids.push(userId);
    }
  }

  return {
    ids: normalizeTestHostIds(ids),
    errors,
  };
}
