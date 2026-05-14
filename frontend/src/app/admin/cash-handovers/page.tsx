import { AppShell } from "@/components/AppShell";
import { AdminCashHandoversClient } from "@/app/admin/cash-handovers/AdminCashHandoversClient";
import { adminNavItems } from "@/lib/navigation";

export default function AdminCashHandoversPage() {
  return (
    <AppShell title="Cash Handovers" section="Admin" navItems={adminNavItems}>
      <AdminCashHandoversClient />
    </AppShell>
  );
}
