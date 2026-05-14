import { AppShell } from "@/components/AppShell";
import { AdminDashboardClient } from "@/app/admin/dashboard/AdminDashboardClient";
import { adminNavItems } from "@/lib/navigation";

export default function AdminDashboardPage() {
  return (
    <AppShell title="Dashboard" section="Admin" navItems={adminNavItems}>
      <AdminDashboardClient />
    </AppShell>
  );
}
