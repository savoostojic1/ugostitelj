export function getPropertyImages(property: {
  image_url?: string | null;
  gallery_urls?: string[] | null;
}): string[] {
  const fromGallery = Array.isArray(property.gallery_urls)
    ? property.gallery_urls.filter(Boolean)
    : [];

  if (fromGallery.length > 0) {
    return fromGallery.slice(0, 10);
  }

  return property.image_url ? [property.image_url] : [];
}
