import "server-only";

import { hashClientIp } from "@/lib/security/rate-limit";
import { createServiceClient, hasServiceRoleKey } from "@/lib/supabase/service";

export async function consumePublicRateLimit(
  action: string,
  ip: string,
  limit: number,
  windowSeconds: number
): Promise<"allow" | "deny" | "unavailable"> {
  if (!hasServiceRoleKey()) return "unavailable";

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase.rpc("consume_public_rate_limit", {
      p_action: action,
      p_ip_hash: hashClientIp(ip),
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });

    if (error) {
      console.error("[rate-limit]", error.message);
      return "unavailable";
    }

    return data === true ? "allow" : "deny";
  } catch (error) {
    console.error("[rate-limit] unavailable");
    void error;
    return "unavailable";
  }
}
