import { AppShell } from "@/components/AppShell";
import { NewHandoverClient } from "@/app/finance/new-handover/NewHandoverClient";
import { financeNavItems } from "@/lib/navigation";

export default function FinanceNewHandoverPage() {
  return (
    <AppShell title="New Handover" section="Finance" navItems={financeNavItems}>
      <NewHandoverClient />
    </AppShell>
  );
}
