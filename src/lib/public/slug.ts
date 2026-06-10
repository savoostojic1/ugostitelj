const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug) && slug.length >= 2 && slug.length <= 50;
}

export function isValidUsername(username: string): boolean {
  return isValidSlug(username);
}

export function suggestUsernameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "host";
  let base = slugify(local) || "host";
  if (base.length < 2) base = `${base}-host`;
  return base.slice(0, 30);
}

export function suggestPropertySlug(name: string): string {
  const base = slugify(name) || "property";
  return base.slice(0, 40);
}
