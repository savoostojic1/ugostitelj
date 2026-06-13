import { redirect } from "next/navigation";
import { adminSetupRequired } from "@/lib/admin/credentials";
import { getAdminSession } from "@/lib/admin/session";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (await adminSetupRequired()) {
    redirect("/admin/login");
  }

  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return children;
}
