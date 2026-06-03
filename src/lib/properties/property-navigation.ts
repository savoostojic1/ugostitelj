import type { Property } from "@/types/database";

export function getPropertyNeighbors(
  properties: Property[],
  currentId: string
) {
  const index = properties.findIndex((p) => p.id === currentId);

  if (index === -1) {
    return {
      prev: null,
      next: null,
      index: -1,
      total: properties.length,
    };
  }

  return {
    prev: index > 0 ? properties[index - 1] : null,
    next: index < properties.length - 1 ? properties[index + 1] : null,
    index,
    total: properties.length,
  };
}
