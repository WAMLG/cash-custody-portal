"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
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
  const [selectedRecord, setSelectedRecord] = useState<CashHandover | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  function openRecord(record: CashHandover) {
    setSelectedRecord(record);
    setAdminNote(record.admin_note ?? "");
    setMessage(null);
    setError(null);
  }

  async function action(path: string, success: string, body?: Record<string, unknown>) {
    if (!token) return;
    try {
      const response = await apiRequest<{ data: CashHandover }>(path, { method: body ? "PATCH" : "POST", token, body: body ? JSON.stringify(body) : undefined });
      setMessage(success);
      setRecords((current) => current.map((record) => record.id === response.data.id ? response.data : record));
      setSelectedRecord(response.data);
      setAdminNote(response.data.admin_note ?? "");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action failed.");
    }
  }

  if (isLoading) return <StateBlock title="Loading" message="Fetching cash handovers." />;

  return (
    <div className="flex flex-col gap-4">
      {message ? <p className="rounded-md border border-[#a8d5c0] bg-[#edf8f3] px-3 py-2 text-sm text-[#146245]">{message}</p> : null}
      {error ? <p className="rounded-md border border-[#f0c4bd] bg-[#fff5f3] px-3 py-2 text-sm text-[#9d2f1f]">{error}</p> : null}

      <section className="grid gap-3">
        {records.length === 0 ? <StateBlock title="No Handovers" message="No cash handover records found." /> : null}
        {records.map((record) => (
          <button key={record.id} className="rounded-md border border-[#d8dde5] bg-white p-4 text-left shadow-sm transition hover:border-[#b8c4d2] hover:bg-[#fafbfc]" type="button" onClick={() => openRecord(record)}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-[#15181d]">{record.handover_code}</p>
                <p className="mt-1 text-sm text-[#687080]">{formatDate(record.handover_date)} at {formatTime(record.handover_time)}</p>
                <p className="mt-1 text-sm text-[#687080]">By {record.handed_by?.name ?? "-"} to {record.handed_to?.name ?? "-"}</p>
              </div>
              <StatusBadge status={record.status} />
            </div>
            <p className="mt-3 text-lg font-semibold text-[#15181d]">{formatMoney(record.amount)}</p>
          </button>
        ))}
      </section>

      {selectedRecord ? (
        <Modal title={`Cash handover ${selectedRecord.handover_code}`} onClose={() => setSelectedRecord(null)}>
          <div className="grid gap-3 text-sm">
            <Detail label="Amount" value={formatMoney(selectedRecord.amount)} />
            <Detail label="Date" value={`${formatDate(selectedRecord.handover_date)} ${formatTime(selectedRecord.handover_time)}`} />
            <Detail label="Handed by" value={selectedRecord.handed_by?.name ?? "-"} />
            <Detail label="Handed to" value={selectedRecord.handed_to?.name ?? "-"} />
            <Detail label="Finance note" value={selectedRecord.finance_note ?? "-"} />
            <Detail label="Status" value={<StatusBadge status={selectedRecord.status} />} />
            <label className="block">
              <span className="text-sm font-medium text-[#384150]">Admin note</span>
              <textarea className="mt-2 min-h-32 w-full rounded-md border border-[#cfd6df] px-3 py-2 outline-none focus:border-[#1f7a5c]" value={adminNote} onChange={(event) => setAdminNote(event.target.value)} />
            </label>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <button className="min-h-11 rounded-md bg-[#1f7a5c] px-4 py-2 text-sm font-semibold text-white" type="button" onClick={() => void action(`/admin/cash-handovers/${selectedRecord.id}`, "Handover updated.", { admin_note: adminNote })}>Save Note</button>
            {selectedRecord.status === "pending" ? <button className="min-h-11 rounded-md border border-[#a8d5c0] px-4 py-2 text-sm font-semibold text-[#146245]" type="button" onClick={() => void action(`/admin/cash-handovers/${selectedRecord.id}/confirm`, "Handover confirmed.")}>Confirm</button> : null}
            {selectedRecord.status !== "voided" ? <button className="min-h-11 rounded-md border border-[#efb4ad] px-4 py-2 text-sm font-semibold text-[#9d2f1f]" type="button" onClick={() => window.confirm(`Void handover ${selectedRecord.handover_code}?`) && void action(`/admin/cash-handovers/${selectedRecord.id}/void`, "Handover voided.")}>Void</button> : null}
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-md bg-[#fafbfc] px-3 py-2">
      <p className="text-xs font-semibold uppercase tracking-[0.04em] text-[#687080]">{label}</p>
      <div className="mt-1 text-[#15181d]">{value}</div>
    </div>
  );
}
