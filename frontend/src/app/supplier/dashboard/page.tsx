import { AppShell } from "@/components/AppShell";
import { supplierNavItems } from "@/lib/navigation";
import { SupplierDashboardClient } from "@/app/supplier/dashboard/SupplierDashboardClient";

export default function SupplierDashboardPage() {
  return (
    <AppShell title="Dashboard" section="Supplier" navItems={supplierNavItems}>
      <SupplierDashboardClient />
    </AppShell>
  );
}
