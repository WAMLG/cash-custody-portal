import { AppShell } from "@/components/AppShell";
import { supplierNavItems } from "@/lib/navigation";
import { SupplierPaymentsClient } from "@/app/supplier/payments/SupplierPaymentsClient";

export default function SupplierPaymentsPage() {
  return (
    <AppShell title="Payments" section="Supplier" navItems={supplierNavItems}>
      <SupplierPaymentsClient />
    </AppShell>
  );
}
