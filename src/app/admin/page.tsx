import { redirect } from "next/navigation";
import { adminSetupRequired } from "@/lib/admin/credentials";
import { getAdminSession } from "@/lib/admin/session";

export default async function AdminIndexPage() {
  const setupRequired = await adminSetupRequired();
  if (setupRequired) {
    redirect("/admin/login");
  }

  const session = await getAdminSession();
  redirect(session ? "/admin/dashboard" : "/admin/login");
}
