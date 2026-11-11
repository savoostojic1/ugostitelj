import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WebsiteDemo } from "@/components/website-builder/website-demo";
import { SAMPLE_SPECS } from "@/lib/website-builder/sample-site";
import { themeMeta } from "@/lib/website-builder/themes";
import { WEBSITE_THEMES, type WebsiteThemeId } from "@/lib/website-builder/types";

interface DemoProps {
  params: Promise<{ theme: string }>;
  searchParams: Promise<{ page?: string }>;
}

function asTheme(value: string): WebsiteThemeId | null {
  return (WEBSITE_THEMES as readonly string[]).includes(value) ? (value as WebsiteThemeId) : null;
}

export function generateStaticParams() {
  return WEBSITE_THEMES.map((theme) => ({ theme }));
}

export async function generateMetadata({ params }: DemoProps): Promise<Metadata> {
  const theme = asTheme((await params).theme);
  if (!theme) return { title: "Demo" };
  return {
    title: `${themeMeta(theme).name} demo · ${SAMPLE_SPECS[theme].name}`,
    robots: { index: false, follow: false },
  };
}

export default async function WebsiteDemoPage({ params, searchParams }: DemoProps) {
  const theme = asTheme((await params).theme);
  if (!theme) notFound();
  const { page } = await searchParams;
  return <WebsiteDemo theme={theme} pageType={page ?? "home"} />;
}
