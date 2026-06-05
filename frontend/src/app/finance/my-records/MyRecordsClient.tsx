"use client";

import { useEffect, useState, type FormEvent } from "react";
import { StateBlock } from "@/components/StateBlock";
import { StatusBadge } from "@/components/StatusBadge";
import { ApiError, apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDate, formatMoney, formatTime } from "@/lib/format";
import type { CashHandover, CollectionResponse } from "@/types";

type UpdateNoteResponse = {
  message: string;
  data: CashHandover;
};

export function MyRecordsClient() {
  const { token } = useAuth();
  const [records, setRecords] = useState<CashHandover[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!token) {
        return;
      }

      try {
        const response = await apiRequest<CollectionResponse<CashHandover>>(
          "/finance/cash-handovers?per_page=50",
          { token },
        );

        if (isMounted) {
          setRecords(response.data);
        }
      } catch {
        if (isMounted) {
          setError("Could not load your handover records.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, [token]);

  function startEditing(record: CashHandover) {
    setEditingId(record.id);
    setNoteDraft(record.finance_note ?? "");
    setMessage(null);
    setError(null);
  }

  async function saveNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || editingId === null) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const response = await apiRequest<UpdateNoteResponse>(
        `/finance/cash-handovers/${editingId}/note`,
        {
          method: "PATCH",
          token,
          body: JSON.stringify({
            finance_note: noteDraft || null,
          }),
        },
      );

      setRecords((current) =>
        current.map((record) =>
          record.id === response.data.id ? response.data : record,
        ),
      );
      setEditingId(null);
      setNoteDraft("");
      setMessage(response.message);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not update the finance note.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <StateBlock
        title="Loading Records"
        message="Fetching your submitted cash handovers."
      />
    );
  }

  if (error && records.length === 0) {
    return <StateBlock title="Records Unavailable" message={error} />;
  }

  return (
    <section className="mobile-table rounded-md border border-[#d8dde5] bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-[#e3e7ee] px-5 py-4">
        <h3 className="text-base font-semibold text-[#15181d]">
          Submitted Handovers
        </h3>
        {message ? <p className="text-sm text-[#146245]">{message}</p> : null}
        {error ? <p className="text-sm text-[#9d2f1f]">{error}</p> : null}
      </div>

      {records.length === 0 ? (
        <div className="p-5 text-sm text-[#687080]">
          You have not submitted any handovers yet.
        </div>
      ) : (
        <div className="overflow-x-auto md:overflow-visible">
          <table className="w-full min-w-[1060px] text-left text-sm md:min-w-0">
            <thead className="bg-[#fafbfc] text-[#687080]">
              <tr>
                <th className="px-5 py-3 font-semibold">Code</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Time</th>
                <th className="px-5 py-3 font-semibold">Amount</th>
                <th className="px-5 py-3 font-semibold">Handed To</th>
                <th className="px-5 py-3 font-semibold">Finance Note</th>
                <th className="px-5 py-3 font-semibold">Admin Note</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e3e7ee]">
              {records.map((record) => (
                <tr key={record.id} className="align-top">
                  <td data-label="Code" className="px-5 py-3 font-medium text-[#15181d]">
                    {record.handover_code}
                  </td>
                  <td data-label="Date" className="px-5 py-3 text-[#384150]">
                    {formatDate(record.handover_date)}
                  </td>
                  <td data-label="Time" className="px-5 py-3 text-[#384150]">
                    {formatTime(record.handover_time)}
                  </td>
                  <td data-label="Amount" className="px-5 py-3 text-[#384150]">
                    {formatMoney(record.amount)}
                  </td>
                  <td data-label="Handed To" className="px-5 py-3 text-[#384150]">
                    {record.handed_to?.name ?? "-"}
                  </td>
                  <td data-label="Finance Note" className="max-w-[260px] px-5 py-3 text-[#384150]">
                    {editingId === record.id ? (
                      <form className="space-y-2" onSubmit={saveNote}>
                        <textarea
                          className="min-h-24 w-full rounded-md border border-[#cfd6df] px-3 py-2 outline-none focus:border-[#1f7a5c]"
                          value={noteDraft}
                          onChange={(event) => setNoteDraft(event.target.value)}
                        />
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <button
                            className="min-h-10 rounded-md bg-[#1f7a5c] px-3 py-2 text-xs font-semibold text-white disabled:bg-[#8bb7a7] sm:min-h-0"
                            type="submit"
                            disabled={isSaving}
                          >
                            Save
                          </button>
                          <button
                            className="min-h-10 rounded-md border border-[#cfd6df] px-3 py-2 text-xs font-semibold text-[#384150] sm:min-h-0"
                            type="button"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      record.finance_note ?? "-"
                    )}
                  </td>
                  <td data-label="Admin Note" className="max-w-[220px] px-5 py-3 text-[#384150]">
                    {record.admin_note ?? "-"}
                  </td>
                  <td data-label="Status" className="px-5 py-3">
                    <StatusBadge status={record.status} />
                  </td>
                  <td data-label="Actions" className="px-5 py-3">
                    {editingId === record.id ? null : (
                      <button
                        className="min-h-10 rounded-md border border-[#cfd6df] px-3 py-2 text-xs font-semibold text-[#384150] hover:bg-[#eef2f6] sm:min-h-0"
                        type="button"
                        onClick={() => startEditing(record)}
                      >
                        Edit Note
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
