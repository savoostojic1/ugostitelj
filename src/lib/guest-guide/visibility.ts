import type {
  GuestGuideContent,
  GuestGuideSectionId,
  SectionVisibility,
} from "@/lib/guest-guide/types";

function hasText(...values: Array<string | undefined | null>): boolean {
  return values.some((value) => Boolean(value && value.trim()));
}

export function sectionHasContent(
  sectionId: GuestGuideSectionId,
  content: GuestGuideContent
): boolean {
  switch (sectionId) {
    case "welcome":
      return hasText(
        content.welcome.propertyName,
        content.welcome.message,
        content.welcome.subtitle,
        content.welcome.hostName,
        content.welcome.coverPhotoUrl
      );
    case "checkin":
      return hasText(
        content.checkin.checkInTime,
        content.checkin.address,
        content.checkin.arrivalInstructions,
        content.checkin.parkingInstructions,
        content.checkin.keyCollection,
        content.checkin.entryInstructions,
        content.checkin.mapLink
      ) || content.checkin.photos.length > 0;
    case "wifi":
      return hasText(
        content.wifi.networkName,
        content.wifi.password,
        content.wifi.instructions
      );
    case "property":
      return content.property.some((item) =>
        hasText(item.title, item.description, item.imageUrl)
      );
    case "rules":
      return content.rules.some((item) =>
        hasText(item.title, item.description)
      );
    case "checkout":
      return hasText(
        content.checkout.checkOutTime,
        content.checkout.departureInstructions,
        content.checkout.keyReturn,
        content.checkout.cleaningExpectations,
        content.checkout.wasteDisposal,
        content.checkout.otherInfo
      );
    case "local":
      return content.local.some((item) =>
        hasText(item.name, item.description, item.photoUrl, item.address)
      );
    case "emergency":
      return (
        content.emergency.numbers.some((item) =>
          hasText(item.label, item.value)
        ) ||
        hasText(
          content.emergency.nearestHospital,
          content.emergency.nearestPharmacy,
          content.emergency.localContacts,
          content.emergency.instructions
        )
      );
    case "contact":
      return hasText(
        content.contact.hostName,
        content.contact.phone,
        content.contact.whatsapp,
        content.contact.email,
        content.contact.website
      );
    default:
      return false;
  }
}

export function visibleSections(
  order: GuestGuideSectionId[],
  visibility: SectionVisibility,
  content: GuestGuideContent
): GuestGuideSectionId[] {
  return order.filter(
    (id) => visibility[id] !== false && sectionHasContent(id, content)
  );
}
