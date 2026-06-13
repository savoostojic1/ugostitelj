import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { adminSetupRequired } from "@/lib/admin/credentials";
import { getAdminSession } from "@/lib/admin/session";

export default async function AdminLoginPage() {
  const setupRequired = await adminSetupRequired();

  if (!setupRequired) {
    const session = await getAdminSession();
    if (session) {
      redirect("/admin/dashboard");
    }
  }

  return <AdminLoginForm setupRequiredInitially={setupRequired} />;
}
