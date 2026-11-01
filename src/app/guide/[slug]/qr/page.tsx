import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicGuestGuide } from "@/lib/guest-guide/public";
import {
  GUEST_GUIDE_PUBLIC_PREFIX,
} from "@/lib/guest-guide/content";
import { absoluteUrl, privatePageMetadata } from "@/lib/seo/site";
import { GuideQrPrint } from "@/components/guest-guide/qr/guide-qr-print";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return privatePageMetadata(
    `QR · ${slug}`,
    "Printable QR code for a Hostvia guest guide."
  );
}

export default async function GuideQrPage({ params }: Props) {
  const { slug } = await params;
  const guide = await getPublicGuestGuide(slug);
  if (!guide) notFound();

  const url = absoluteUrl(`${GUEST_GUIDE_PUBLIC_PREFIX}/${guide.slug}`);

  return (
    <GuideQrPrint
      title={guide.title}
      url={url}
      qrImageSrc={`/api/public/guest-guides/${encodeURIComponent(guide.slug)}/qr`}
    />
  );
}
