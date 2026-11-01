import { redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

/** Keep old dashboard edit URLs working. */
export default async function GuestGuideDashboardEditRedirect({ params }: Props) {
  const { id } = await params;
  redirect(`/guest-guide/${id}/edit`);
}
