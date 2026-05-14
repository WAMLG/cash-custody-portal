import { AppShell } from "@/components/AppShell";
import { AdminUsersClient } from "@/app/admin/users/AdminUsersClient";
import { adminNavItems } from "@/lib/navigation";

export default function AdminUsersPage() {
  return (
    <AppShell title="Users" section="Admin" navItems={adminNavItems}>
      <AdminUsersClient />
    </AppShell>
  );
}
