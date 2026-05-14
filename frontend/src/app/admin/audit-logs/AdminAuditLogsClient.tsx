"use client";

import { useEffect, useState } from "react";
import { AdminTable } from "@/components/AdminTable";
import { StateBlock } from "@/components/StateBlock";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { AuditLog, CollectionResponse } from "@/types";

export function AdminAuditLogsClient() {
  const { token } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!token) return;
      const response = await apiRequest<CollectionResponse<AuditLog>>("/admin/audit-logs?per_page=100", { token });
      setLogs(response.data);
    }
    load().catch(() => setError("Could not load audit logs.")).finally(() => setIsLoading(false));
  }, [token]);

  if (isLoading) return <StateBlock title="Loading" message="Fetching audit logs." />;
  if (error) return <StateBlock title="Unavailable" message={error} />;

  return (
    <AdminTable headers={["Time", "User", "Action", "Module", "Record", "IP Address"]} empty={logs.length === 0}>
      {logs.map((log) => (
        <tr key={log.id}>
          <td className="px-5 py-3">{log.created_at}</td>
          <td className="px-5 py-3">{log.user?.name ?? "System"}</td>
          <td className="px-5 py-3">{log.action}</td>
          <td className="px-5 py-3">{log.module}</td>
          <td className="px-5 py-3">{log.record_id ?? "-"}</td>
          <td className="px-5 py-3">{log.ip_address ?? "-"}</td>
        </tr>
      ))}
    </AdminTable>
  );
}
