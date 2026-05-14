import { AppShell } from "@/components/AppShell";
import { AdminSuppliersClient } from "@/app/admin/suppliers/AdminSuppliersClient";
import { adminNavItems } from "@/lib/navigation";

export default function AdminSuppliersPage() {
  return (
    <AppShell title="Suppliers" section="Admin" navItems={adminNavItems}>
      <AdminSuppliersClient />
    </AppShell>
  );
}
