"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AdminActionButton, AdminTable } from "@/components/AdminTable";
import { StateBlock } from "@/components/StateBlock";
import { StatusBadge } from "@/components/StatusBadge";
import { ApiError, apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDate, formatMoney, formatTime } from "@/lib/format";
import type { CollectionResponse, SupplierPayment } from "@/types";

export function SupplierPaymentsClient() {
  const { token } = useAuth();
  const [payments, setPayments] = useState<SupplierPayment[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!token) return;
      try {
        const response = await apiRequest<CollectionResponse<SupplierPayment>>("/supplier/payments?per_page=50", { token });
        if (active) setPayments(response.data);
      } catch {
        if (active) setError("Could not load supplier payments.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [token]);

  async function saveNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || editingId === null) return;

    setIsSaving(true);
    setError(null);
    try {
      const response = await apiRequest<{ message: string; data: SupplierPayment }>(`/supplier/payments/${editingId}/note`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ supplier_note: noteDraft || null }),
      });
      setPayments((current) => current.map((payment) => payment.id === response.data.id ? response.data : payment));
      setEditingId(null);
      setNoteDraft("");
      setMessage(response.message);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save supplier note.");
    } finally {
      setIsSaving(false);
    }
  }

  async function acceptPayment(payment: SupplierPayment) {
    if (!token) return;
    try {
      const response = await apiRequest<{ message: string; data: SupplierPayment }>(`/supplier/payments/${payment.id}/accept`, {
        method: "POST",
        token,
      });
      setPayments((current) => current.map((item) => item.id === response.data.id ? response.data : item));
      setMessage(response.message);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not accept payment.");
    }
  }

  if (isLoading) return <StateBlock title="Loading" message="Fetching your supplier payments." />;
  if (error && payments.length === 0) return <StateBlock title="Unavailable" message={error} />;

  return (
    <div className="flex flex-col gap-4">
      {message ? <p className="text-sm text-[#146245]">{message}</p> : null}
      {error ? <p className="text-sm text-[#9d2f1f]">{error}</p> : null}
      <AdminTable headers={["Code", "Date", "Time", "Amount", "Purpose", "Admin Note", "Supplier Note", "Status", "Actions"]} empty={payments.length === 0}>
        {payments.map((payment) => (
          <tr key={payment.id} className="align-top">
            <td className="px-5 py-3 font-medium">{payment.payment_code}</td>
            <td className="px-5 py-3">{formatDate(payment.payment_date)}</td>
            <td className="px-5 py-3">{formatTime(payment.payment_time)}</td>
            <td className="px-5 py-3">{formatMoney(payment.amount)}</td>
            <td className="max-w-[220px] px-5 py-3">{payment.purpose}</td>
            <td className="max-w-[220px] px-5 py-3">{payment.admin_note ?? "-"}</td>
            <td className="max-w-[260px] px-5 py-3">
              {editingId === payment.id ? (
                <form className="space-y-2" onSubmit={saveNote}>
                  <textarea className="min-h-24 w-full rounded-md border border-[#cfd6df] px-3 py-2 outline-none focus:border-[#1f7a5c]" value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} />
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button className="min-h-10 rounded-md bg-[#1f7a5c] px-3 py-2 text-xs font-semibold text-white disabled:bg-[#8bb7a7] sm:min-h-0" disabled={isSaving} type="submit">Save</button>
                    <button className="min-h-10 rounded-md border border-[#cfd6df] px-3 py-2 text-xs font-semibold text-[#384150] sm:min-h-0" type="button" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </form>
              ) : payment.supplier_note ?? "-"}
            </td>
            <td className="px-5 py-3"><StatusBadge status={payment.status} /></td>
            <td className="px-5 py-3">
              <div className="flex flex-wrap gap-2">
                {editingId === payment.id ? null : (
                  <AdminActionButton onClick={() => {
                    setEditingId(payment.id);
                    setNoteDraft(payment.supplier_note ?? "");
                  }}>Edit Note</AdminActionButton>
                )}
                {payment.status === "paid" ? (
                  <AdminActionButton onClick={() => window.confirm(`Accept payment ${payment.payment_code}?`) && void acceptPayment(payment)}>Accept</AdminActionButton>
                ) : null}
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
