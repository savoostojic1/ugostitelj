import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuideView } from "@/components/guest-guide/guide-renderer/guide-view";
import { getPublicGuestGuide } from "@/lib/guest-guide/public";
import { GUEST_GUIDE_PUBLIC_PREFIX } from "@/lib/guest-guide/content";
import { guestGuideFontClassNames } from "@/lib/guest-guide/fonts";
import { absoluteUrl, pageMetadata } from "@/lib/seo/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getPublicGuestGuide(slug);
  if (!guide) {
    return pageMetadata({
      title: "Guest guide",
      description: "This guest guide is unavailable.",
      path: `${GUEST_GUIDE_PUBLIC_PREFIX}/${slug}`,
      index: false,
    });
  }

  const description =
    guide.document.content.welcome.subtitle ||
    guide.document.content.welcome.message ||
    `Digital guest guide for ${guide.title}`;

  return {
    ...pageMetadata({
      title: `${guide.title} · Guest Guide`,
      description: description.slice(0, 160),
      path: `${GUEST_GUIDE_PUBLIC_PREFIX}/${guide.slug}`,
      index: true,
    }),
    openGraph: {
      title: guide.title,
      description: description.slice(0, 160),
      url: absoluteUrl(`${GUEST_GUIDE_PUBLIC_PREFIX}/${guide.slug}`),
      images: guide.coverImageUrl
        ? [{ url: guide.coverImageUrl, width: 1200, height: 630, alt: guide.title }]
        : undefined,
    },
  };
}

export default async function PublicGuestGuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = await getPublicGuestGuide(slug);
  if (!guide) notFound();

  return (
    <div className={`${guestGuideFontClassNames()} min-h-screen`}>
      <GuideView document={guide.document} showBrand />
    </div>
  );
}
