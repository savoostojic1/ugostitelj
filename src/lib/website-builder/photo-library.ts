import type { WebsiteImage, WebsiteThemeId } from "@/lib/website-builder/types";

/**
 * Curated starter photography. Hosts can begin with these while they gather their
 * own photographs; every image is replaced the moment they upload. All are from
 * Unsplash (free to use under the Unsplash license).
 */
function u(id: string, alt: string, width = 2000): WebsiteImage {
  return {
    url: `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=78`,
    alt,
  };
}

export const THEME_PHOTOS: Record<WebsiteThemeId, WebsiteImage[]> = {
  luxe: [
    u("1613490493576-7fde63acd811", "Contemporary villa reflected in the pool"),
    u("1613977257363-707ba9348227", "White villa with a pool and terrace"),
    u("1631049307264-da0ec9d70304", "Calm bedroom in soft daylight"),
    u("1600596542815-ffad4c1539a9", "Modern villa and pool at dusk"),
    u("1611892440504-42a792e24d32", "Warmly lit suite with a wide bed"),
    u("1571003123894-1f0594d2b5d9", "Pool pavilions at dusk"),
    u("1414235077428-338989a2e8c0", "Dinner served on the terrace"),
    u("1600210492486-724fe5c67fb0", "Living room with soft daylight"),
  ],
  coastal: [
    u("1570077188670-e3a8d69ac5ff", "White houses above the Aegean"),
    u("1533104816931-20fa691ff6ca", "Whitewashed steps framed by bougainvillea"),
    u("1504512485720-7d83a16ee930", "Harbour town on the Mediterranean"),
    u("1505691938895-1758d7feb511", "Bright living room with sea-blue accents"),
    u("1615874959474-d609969a20ed", "Airy bedroom with linen and plants"),
    u("1507525428034-b723cf961d3e", "Quiet beach in morning light"),
    u("1519046904884-53103b34b206", "Palm tree and parasol on white sand"),
    u("1520608421741-68228b76b6df", "White apartment building with balconies"),
  ],
  nature: [
    u("1470770841072-f978cf4d019e", "Lake house beneath alpine peaks"),
    u("1510798831971-661eb04b3739", "Timber cabin in the snow at dusk"),
    u("1587061949409-02df41d5e562", "Wooden cabin among tall pines"),
    u("1441974231531-c6227db76b6e", "Sunlit forest of tall trees"),
    u("1501785888041-af3ef285b470", "Turquoise mountain lake with a rowing boat"),
    u("1506905925346-21bda4d32df4", "Mountain ridge above the clouds"),
    u("1449158743715-0a90ebb6d2d8", "Cabin in a clearing in the woods"),
    u("1519681393784-d120267933ba", "Night sky above snowy peaks"),
  ],
  minimal: [
    u("1493809842364-78817add7ffb", "Minimal living room with white walls"),
    u("1586023492125-27b2c045efd7", "Yellow armchair against a pale wall"),
    u("1487958449943-2429e8be8625", "White architectural facade against the sky"),
    u("1484154218962-a197022b5858", "Clean white kitchen"),
    u("1600607687939-ce8a6c25118c", "Open-plan living space with timber details"),
    u("1486718448742-163732cd1544", "Curved terracotta facade"),
    u("1600566753190-17f0baa2a6c3", "Timber-clad modern house"),
    u("1522708323590-d24dbb6b0267", "Open living area with a sofa"),
  ],
  escape: [
    u("1520250497591-112f2f40a3f4", "Tropical retreat with a pool and palms"),
    u("1537996194471-e657df975ab4", "Temple on the water in Bali"),
    u("1506126613408-eca07ce68773", "Meditation at sunrise"),
    u("1600334089648-b0d9d3028eb2", "Warm stones and flowers for a massage"),
    u("1545205597-3d9d02c29597", "Yoga on the beach at dawn"),
    u("1535827841776-24afc1e255ac", "Courtyard pool framed by palms"),
    u("1540555700478-4be289fbecef", "Spa towels and orchids"),
    u("1534008897995-27a23e859048", "Turquoise lagoon between cliffs"),
  ],
};

export function starterPhotos(theme: WebsiteThemeId): WebsiteImage[] {
  return THEME_PHOTOS[theme] ?? THEME_PHOTOS.luxe;
}

/** All library photographs, deduplicated, for the photo picker. */
export function libraryPhotos(): { theme: WebsiteThemeId; image: WebsiteImage }[] {
  const seen = new Set<string>();
  const out: { theme: WebsiteThemeId; image: WebsiteImage }[] = [];
  for (const [theme, images] of Object.entries(THEME_PHOTOS) as [WebsiteThemeId, WebsiteImage[]][]) {
    for (const image of images) {
      if (seen.has(image.url)) continue;
      seen.add(image.url);
      out.push({ theme, image });
    }
  }
  return out;
}

/** A smaller rendition for thumbnails in the builder. */
export function thumbUrl(url: string, width = 480): string {
  if (!url.startsWith("https://images.unsplash.com/")) return url;
  return url.replace(/([?&])w=\d+/, `$1w=${width}`);
}
