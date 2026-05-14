import { AppShell } from "@/components/AppShell";
import { AdminAuditLogsClient } from "@/app/admin/audit-logs/AdminAuditLogsClient";
import { adminNavItems } from "@/lib/navigation";

export default function AdminAuditLogsPage() {
  return (
    <AppShell title="Audit Logs" section="Admin" navItems={adminNavItems}>
      <AdminAuditLogsClient />
    </AppShell>
  );
}
