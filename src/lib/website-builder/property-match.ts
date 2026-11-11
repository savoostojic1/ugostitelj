export interface PropertyMatchCandidate {
  id: string;
  name: string;
}

export function normalizePropertyName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export function findEquivalentProperties(
  localName: string,
  properties: PropertyMatchCandidate[]
): PropertyMatchCandidate[] {
  const target = normalizePropertyName(localName);
  if (!target) return [];
  return properties.filter((property) => normalizePropertyName(property.name) === target);
}

export type ImportDecision =
  | { accommodationId: string; action: "link"; propertyId: string }
  | { accommodationId: string; action: "create"; acknowledgeDuplicate: boolean }
  | { accommodationId: string; action: "skip" };

export function validateImportDecisions(input: {
  decisions: ImportDecision[];
  accommodations: { id: string; name: string; propertyId: string | null }[];
  properties: PropertyMatchCandidate[];
}): { ok: true } | { ok: false; error: string } {
  const stays = new Map(input.accommodations.map((stay) => [stay.id, stay]));
  const owned = new Set(input.properties.map((property) => property.id));
  const seen = new Set<string>();

  for (const decision of input.decisions) {
    const stay = stays.get(decision.accommodationId);
    if (!stay) return { ok: false, error: "Unknown accommodation" };
    if (seen.has(stay.id)) return { ok: false, error: "Duplicate accommodation decision" };
    seen.add(stay.id);
    if (decision.action === "link") {
      if (!owned.has(decision.propertyId)) {
        return { ok: false, error: "That property is not in this account" };
      }
    }
    if (decision.action === "create") {
      const matches = findEquivalentProperties(stay.name, input.properties);
      if (matches.length > 0 && !decision.acknowledgeDuplicate) {
        return {
          ok: false,
          error: `“${stay.name}” matches an existing property. Choose it or confirm a new one.`,
        };
      }
    }
  }

  return { ok: true };
}
