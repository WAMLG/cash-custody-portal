import { AppShell } from "@/components/AppShell";
import { AdminSupplierPaymentsClient } from "@/app/admin/supplier-payments/AdminSupplierPaymentsClient";
import { adminNavItems } from "@/lib/navigation";

export default function AdminSupplierPaymentsPage() {
  return (
    <AppShell title="Supplier Payments" section="Admin" navItems={adminNavItems}>
      <AdminSupplierPaymentsClient />
    </AppShell>
  );
}
