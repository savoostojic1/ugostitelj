export function getPublicHostCoverUrl(username: string): string {
  return `/api/public/host-cover/${encodeURIComponent(username.trim().toLowerCase())}`;
}
