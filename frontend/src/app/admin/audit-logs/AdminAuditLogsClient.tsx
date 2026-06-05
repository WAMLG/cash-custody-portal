"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/Modal";
import { StateBlock } from "@/components/StateBlock";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { AuditLog, CollectionResponse } from "@/types";

export function AdminAuditLogsClient() {
  const { token } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
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
    <div className="flex flex-col gap-4">
      <section className="grid gap-3">
        {logs.length === 0 ? <StateBlock title="No Audit Logs" message="No audit events were found." /> : null}
        {logs.map((log) => (
          <button key={log.id} className="rounded-md border border-[#d8dde5] bg-white p-4 text-left shadow-sm transition hover:border-[#b8c4d2] hover:bg-[#fafbfc]" type="button" onClick={() => setSelectedLog(log)}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold capitalize text-[#15181d]">{log.action}</p>
                <p className="mt-1 text-sm text-[#687080]">{log.user?.name ?? "System"} · {log.module}</p>
              </div>
              <span className="rounded-md bg-[#eef2f6] px-2 py-1 text-xs font-semibold text-[#384150]">#{log.id}</span>
            </div>
            <p className="mt-3 text-sm text-[#687080]">{log.created_at}</p>
          </button>
        ))}
      </section>

      {selectedLog ? (
        <Modal title={`Audit log #${selectedLog.id}`} onClose={() => setSelectedLog(null)}>
          <div className="grid gap-3 text-sm">
            <Detail label="Time" value={selectedLog.created_at} />
            <Detail label="User" value={selectedLog.user?.name ?? "System"} />
            <Detail label="Action" value={selectedLog.action} />
            <Detail label="Module" value={selectedLog.module} />
            <Detail label="Record" value={selectedLog.record_id ?? "-"} />
            <Detail label="IP address" value={selectedLog.ip_address ?? "-"} />
            <Detail label="User agent" value={selectedLog.user_agent ?? "-"} />
            <JsonBlock label="Old values" value={selectedLog.old_values} />
            <JsonBlock label="New values" value={selectedLog.new_values} />
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-md bg-[#fafbfc] px-3 py-2"><p className="text-xs font-semibold uppercase tracking-[0.04em] text-[#687080]">{label}</p><p className="mt-1 break-words text-[#15181d]">{value}</p></div>;
}

function JsonBlock({ label, value }: { label: string; value: Record<string, unknown> | null }) {
  return (
    <div className="rounded-md bg-[#fafbfc] px-3 py-2">
      <p className="text-xs font-semibold uppercase tracking-[0.04em] text-[#687080]">{label}</p>
      <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-md bg-white p-3 text-xs text-[#384150]">{value ? JSON.stringify(value, null, 2) : "-"}</pre>
    </div>
  );
}
