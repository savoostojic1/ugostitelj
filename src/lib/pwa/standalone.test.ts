import assert from "node:assert/strict";
import test from "node:test";
import { isPwaAllowedPath } from "@/lib/pwa/standalone";

test("installed app opens host tools linked from the dashboard", () => {
  for (const path of [
    "/website-builder",
    "/website-builder/demo/luxe",
    "/website-builder/preview",
    "/guest-guide/create",
    "/guest-guide/demo",
    "/guest-guide/3f2a/edit",
    "/guide/villa-olea",
    "/guide/villa-olea/qr",
  ]) {
    assert.equal(isPwaAllowedPath(path, "hostvia.me"), true, path);
  }
});

test("installed app still keeps unknown paths inside the dashboard", () => {
  assert.equal(isPwaAllowedPath("/website-builderx", "hostvia.me"), false);
  assert.equal(isPwaAllowedPath("/guides-secret", "hostvia.me"), false);
  assert.equal(isPwaAllowedPath("/dashboard/website", "hostvia.me"), true);
});
