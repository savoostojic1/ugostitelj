import assert from "node:assert/strict";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { FREE_TOOLS, FREE_TOOLS_PATH } from "@/lib/tools/free-tools";
import { SITE_URL } from "@/lib/seo/site";
import {
  buildSitemapEntries,
  getSitemapPaths,
  isExcludedFromSitemap,
} from "@/lib/seo/sitemap-entries";
import { LEGACY_MARKETING_REDIRECTS } from "@/lib/seo/routes";

const MARKETING_APP_DIR = join(
  process.cwd(),
  "src/app/(marketing)"
);

/** Collect URL paths from marketing `page.tsx` files. */
function collectMarketingPagePaths(dir: string, basePath = ""): string[] {
  const entries = readdirSync(dir);
  const paths: string[] = [];

  for (const entry of entries) {
    if (entry === "layout.tsx" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    const st = statSync(full);

    if (st.isDirectory()) {
      paths.push(...collectMarketingPagePaths(full, `${basePath}/${entry}`));
      continue;
    }

    if (entry === "page.tsx") {
      paths.push(basePath === "" ? "/" : basePath);
    }
  }

  return paths;
}

test("sitemap lists every marketing page exactly once with absolute hostvia.me URLs", () => {
  const paths = getSitemapPaths();
  const entries = buildSitemapEntries();
  const marketingPages = collectMarketingPagePaths(MARKETING_APP_DIR).sort();

  assert.deepEqual([...paths].sort(), marketingPages);
  assert.equal(paths.length, new Set(paths).size);
  assert.equal(entries.length, paths.length);

  for (const entry of entries) {
    assert.match(entry.url, /^https:\/\/hostvia\.me(\/|$)/);
    assert.doesNotMatch(entry.url, /localhost|vercel\.app|staging|preview/i);
    assert.equal(entry.url.startsWith(SITE_URL), true);
    assert.equal("lastModified" in entry, false);
    assert.equal("changeFrequency" in entry, false);
    assert.equal("priority" in entry, false);
  }
});

test("sitemap includes free tools from the published registry", () => {
  const paths = getSitemapPaths();
  assert.equal(paths.includes(FREE_TOOLS_PATH), true);
  for (const tool of FREE_TOOLS) {
    assert.equal(paths.includes(tool.href), true);
  }
});

test("sitemap excludes private, auth, API, host, and legacy redirect paths", () => {
  const paths = getSitemapPaths();

  for (const path of paths) {
    assert.equal(isExcludedFromSitemap(path), false);
  }

  const banned = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/dashboard",
    "/dashboard/properties",
    "/admin",
    "/api/billing/webhook",
    "/auth/callback",
    "/host/example",
    ...Object.keys(LEGACY_MARKETING_REDIRECTS),
  ];

  for (const path of banned) {
    assert.equal(paths.includes(path), false);
    assert.equal(isExcludedFromSitemap(path), true);
  }
});
