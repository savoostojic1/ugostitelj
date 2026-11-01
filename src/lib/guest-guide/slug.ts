const SLUG_MAX = 80;

export function slugifyGuideTitle(input: string): string {
  const base = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX);

  return base || "guest-guide";
}

export function isValidGuideSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length >= 2 && slug.length <= SLUG_MAX;
}

export function withSlugSuffix(base: string, attempt: number): string {
  if (attempt <= 1) return base.slice(0, SLUG_MAX);
  const suffix = `-${attempt}`;
  return `${base.slice(0, SLUG_MAX - suffix.length)}${suffix}`;
}

export async function allocateUniqueGuideSlug(
  title: string,
  isTaken: (slug: string) => Promise<boolean>
): Promise<string> {
  const base = slugifyGuideTitle(title);
  for (let attempt = 1; attempt <= 100; attempt++) {
    const candidate = withSlugSuffix(base, attempt);
    if (!(await isTaken(candidate))) return candidate;
  }
  return withSlugSuffix(base, Date.now());
}
