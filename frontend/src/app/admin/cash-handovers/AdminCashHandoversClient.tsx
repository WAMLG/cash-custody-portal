"use client";

import { useEffect, useState } from "react";
import { AdminActionButton, AdminTable } from "@/components/AdminTable";
import { Modal } from "@/components/Modal";
import { StateBlock } from "@/components/StateBlock";
import { StatusBadge } from "@/components/StatusBadge";
import { ApiError, apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDate, formatMoney, formatTime } from "@/lib/format";
import type { CashHandover, CollectionResponse } from "@/types";

export function AdminCashHandoversClient() {
  const { token } = useAuth();
  const [records, setRecords] = useState<CashHandover[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<CashHandover | null>(null);
  const [adminNote, setAdminNote] = useState("");

  async function load() {
    if (!token) return;
    const response = await apiRequest<CollectionResponse<CashHandover>>("/admin/cash-handovers?per_page=50", { token });
    setRecords(response.data);
  }

  useEffect(() => {
    async function run() {
      await Promise.resolve();
      await load().catch(() => setError("Could not load cash handovers.")).finally(() => setIsLoading(false));
    }
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function action(path: string, success: string, body?: Record<string, unknown>) {
    if (!token) return;
    try {
      const response = await apiRequest<{ data: CashHandover }>(path, { method: body ? "PATCH" : "POST", token, body: body ? JSON.stringify(body) : undefined });
      setMessage(success);
      setRecords((current) => current.map((record) => record.id === response.data.id ? response.data : record));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action failed.");
    }
  }

  if (isLoading) return <StateBlock title="Loading" message="Fetching cash handovers." />;

  return (
    <div className="flex flex-col gap-4">
      {message ? <p className="text-sm text-[#146245]">{message}</p> : null}
      {error ? <p className="text-sm text-[#9d2f1f]">{error}</p> : null}
      <AdminTable headers={["Code", "Date", "Time", "Amount", "By", "To", "Notes", "Status", "Actions"]} empty={records.length === 0}>
        {records.map((record) => (
          <tr key={record.id} className="align-top">
            <td className="px-5 py-3 font-medium">{record.handover_code}</td>
            <td className="px-5 py-3">{formatDate(record.handover_date)}</td>
            <td className="px-5 py-3">{formatTime(record.handover_time)}</td>
            <td className="px-5 py-3">{formatMoney(record.amount)}</td>
            <td className="px-5 py-3">{record.handed_by?.name ?? "-"}</td>
            <td className="px-5 py-3">{record.handed_to?.name ?? "-"}</td>
            <td className="max-w-[260px] px-5 py-3">Finance: {record.finance_note ?? "-"}<br />Admin: {record.admin_note ?? "-"}</td>
            <td className="px-5 py-3"><StatusBadge status={record.status} /></td>
            <td className="px-5 py-3">
              <div className="flex flex-wrap gap-2">
                {record.status === "pending" ? <AdminActionButton onClick={() => void action(`/admin/cash-handovers/${record.id}/confirm`, "Handover confirmed.")}>Confirm</AdminActionButton> : null}
                <AdminActionButton onClick={() => {
                  setEditingNote(record);
                  setAdminNote(record.admin_note ?? "");
                }}>Admin Note</AdminActionButton>
                {record.status !== "voided" ? <AdminActionButton onClick={() => window.confirm(`Void handover ${record.handover_code}? This keeps the record but removes it from active totals.`) && void action(`/admin/cash-handovers/${record.id}/void`, "Handover voided.")}>Void</AdminActionButton> : null}
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>
      {editingNote ? (
        <Modal title={`Admin note for ${editingNote.handover_code}`} onClose={() => setEditingNote(null)}>
          <textarea
            className="min-h-32 w-full rounded-md border border-[#cfd6df] px-3 py-2 outline-none focus:border-[#1f7a5c]"
            value={adminNote}
            onChange={(event) => setAdminNote(event.target.value)}
          />
          <div className="mt-4 flex justify-end gap-2">
            <button className="rounded-md border border-[#cfd6df] px-4 py-2 text-sm font-semibold text-[#384150]" type="button" onClick={() => setEditingNote(null)}>Cancel</button>
            <button
              className="rounded-md bg-[#1f7a5c] px-4 py-2 text-sm font-semibold text-white"
              type="button"
              onClick={() => {
                void action(`/admin/cash-handovers/${editingNote.id}`, "Handover updated.", { admin_note: adminNote }).then(() => setEditingNote(null));
              }}
            >
              Save Note
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
