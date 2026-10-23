const PRODUCTION_API_BASE_URL = "https://api.creem.io";
const TEST_API_BASE_URL = "https://test-api.creem.io";

const ALLOWED_API_BASE_URLS = new Set([
  PRODUCTION_API_BASE_URL,
  TEST_API_BASE_URL,
]);

export type CreemConfig = {
  apiKey: string;
  webhookSecret: string;
  productId: string;
  apiBaseUrl: string;
};

export function resolveCreemApiBaseUrl(raw: string | undefined): string {
  const trimmed = raw?.trim().replace(/\/$/, "");
  if (!trimmed) return PRODUCTION_API_BASE_URL;
  if (!ALLOWED_API_BASE_URLS.has(trimmed)) {
    throw new Error(
      "CREEM_API_BASE_URL must be https://api.creem.io or https://test-api.creem.io."
    );
  }
  return trimmed;
}

export function readCreemConfig(
  env: NodeJS.ProcessEnv = process.env
): CreemConfig {
  return {
    apiKey: env.CREEM_API_KEY?.trim() ?? "",
    webhookSecret: env.CREEM_WEBHOOK_SECRET?.trim() ?? "",
    productId: env.CREEM_PRODUCT_ID?.trim() ?? "",
    apiBaseUrl: resolveCreemApiBaseUrl(env.CREEM_API_BASE_URL),
  };
}

export function hasCreemCheckoutConfig(config: CreemConfig): boolean {
  return Boolean(config.apiKey && config.productId);
}
