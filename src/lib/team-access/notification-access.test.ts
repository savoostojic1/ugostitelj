import assert from "node:assert/strict";
import test from "node:test";
import {
  ALL_TEAM_PERMISSIONS,
  canAccessDashboardPath,
} from "@/lib/team-access/permissions";

test("notification settings stay with the property owner", () => {
  assert.equal(
    canAccessDashboardPath("/dashboard/notifications", ALL_TEAM_PERMISSIONS),
    false
  );
  assert.equal(
    canAccessDashboardPath("/dashboard/booking-requests", ["booking_requests"]),
    true
  );
});
