import assert from "node:assert/strict";
import test from "node:test";
import {
  parseRecoveryHash,
  parseRecoveryTokens,
} from "./password-recovery";

test("parseRecoveryHash reads a recovery session from the URL hash", () => {
  const tokens = parseRecoveryHash(
    "#access_token=access&refresh_token=refresh&type=recovery"
  );
  assert.deepEqual(tokens, {
    accessToken: "access",
    refreshToken: "refresh",
  });
});

test("parseRecoveryHash ignores other auth callbacks", () => {
  assert.equal(
    parseRecoveryHash("#access_token=access&refresh_token=refresh&type=signup"),
    null
  );
  assert.equal(parseRecoveryHash(""), null);
  assert.equal(parseRecoveryHash("#type=recovery"), null);
});

test("parseRecoveryTokens reads tokens from a query string", () => {
  const tokens = parseRecoveryTokens(
    new URLSearchParams("access_token=access&refresh_token=refresh&type=recovery")
  );
  assert.deepEqual(tokens, {
    accessToken: "access",
    refreshToken: "refresh",
  });
});
