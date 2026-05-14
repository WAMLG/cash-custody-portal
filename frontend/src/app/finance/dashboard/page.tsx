import { AppShell } from "@/components/AppShell";
import { financeNavItems } from "@/lib/navigation";
import { FinanceDashboardClient } from "@/app/finance/dashboard/FinanceDashboardClient";

export default function FinanceDashboardPage() {
  return (
    <AppShell title="Dashboard" section="Finance" navItems={financeNavItems}>
      <FinanceDashboardClient />
    </AppShell>
  );
}
