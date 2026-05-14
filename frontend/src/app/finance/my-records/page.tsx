import { AppShell } from "@/components/AppShell";
import { MyRecordsClient } from "@/app/finance/my-records/MyRecordsClient";
import { financeNavItems } from "@/lib/navigation";

export default function FinanceMyRecordsPage() {
  return (
    <AppShell title="My Records" section="Finance" navItems={financeNavItems}>
      <MyRecordsClient />
    </AppShell>
  );
}
