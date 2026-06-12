export const TEAM_PERMISSION_KEYS = [
  "dashboard",
  "cleanings",
  "arrivals",
  "calendars",
  "properties",
  "manual_reservations",
  "public_site",
  "booking_requests",
  "messages",
] as const;

export type TeamPermission = (typeof TEAM_PERMISSION_KEYS)[number];

export const TEAM_PERMISSION_LABELS: Record<TeamPermission, string> = {
  dashboard: "Dashboard",
  cleanings: "Cleanings",
  arrivals: "Arrivals",
  calendars: "Calendars",
  properties: "Properties",
  manual_reservations: "Manual bookings",
  public_site: "Booking site",
  booking_requests: "Inquiries",
  messages: "Messages",
};

export const TEAM_PERMISSION_ROUTES: Record<TeamPermission, string> = {
  dashboard: "/dashboard",
  cleanings: "/dashboard/cleanings",
  arrivals: "/dashboard/arrivals",
  calendars: "/dashboard/calendars",
  properties: "/dashboard/properties",
  manual_reservations: "/dashboard/manual-reservations",
  public_site: "/dashboard/public-site",
  booking_requests: "/dashboard/booking-requests",
  messages: "/dashboard/porouka",
};

const ROUTE_PERMISSION_MAP = new Map<string, TeamPermission>();

for (const key of TEAM_PERMISSION_KEYS) {
  ROUTE_PERMISSION_MAP.set(TEAM_PERMISSION_ROUTES[key], key);
}

export const ALL_TEAM_PERMISSIONS: TeamPermission[] = [...TEAM_PERMISSION_KEYS];

export function isTeamPermission(value: string): value is TeamPermission {
  return (TEAM_PERMISSION_KEYS as readonly string[]).includes(value);
}

export function normalizeTeamPermissions(
  permissions: string[] | null | undefined
): TeamPermission[] {
  if (!permissions?.length) return [];
  return permissions.filter(isTeamPermission);
}

export function permissionForDashboardPath(pathname: string): TeamPermission | null {
  if (pathname === "/dashboard/team-access") return null;

  if (pathname === "/dashboard" || pathname === "/dashboard/install-app") {
    return "dashboard";
  }

  const sortedRoutes = [...ROUTE_PERMISSION_MAP.entries()].sort(
    (a, b) => b[0].length - a[0].length
  );

  for (const [route, permission] of sortedRoutes) {
    if (route === "/dashboard") continue;
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      return permission;
    }
  }

  if (pathname.startsWith("/dashboard")) {
    return "dashboard";
  }

  return null;
}

export function canAccessDashboardPath(
  pathname: string,
  permissions: TeamPermission[]
): boolean {
  const required = permissionForDashboardPath(pathname);
  if (!required) return true;
  return permissions.includes(required);
}

export function defaultTeamLandingPath(
  permissions: TeamPermission[]
): string {
  for (const key of TEAM_PERMISSION_KEYS) {
    if (permissions.includes(key)) {
      return TEAM_PERMISSION_ROUTES[key];
    }
  }
  return "/dashboard";
}

const TEAM_USERNAME_PATTERN = /^[a-z0-9]+(?:\.[a-z0-9-]+)+$/;

export function isValidTeamUsername(username: string): boolean {
  return (
    TEAM_USERNAME_PATTERN.test(username) &&
    username.length >= 5 &&
    username.length <= 60
  );
}

export function buildTeamUsername(
  accessName: string,
  hostUsername: string
): string {
  const slug = accessName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24);
  const host = hostUsername.trim().toLowerCase();
  return `${slug || "pregled"}.${host}`;
}

export function teamAccessLoginEmail(username: string): string {
  return `${username.trim().toLowerCase()}@access.hostvia.me`;
}
