"use client";

import { useEffect, useState } from "react";
import { AdminActionButton, AdminTable } from "@/components/AdminTable";
import { Modal } from "@/components/Modal";
import { StateBlock } from "@/components/StateBlock";
import { ApiError, apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { currentDateInputValue, currentTimeInputValue, formatDate, formatMoney, formatTime } from "@/lib/format";
import type { CollectionResponse, Supplier, SupplierPayment } from "@/types";

export function AdminSupplierPaymentsClient() {
  const { token } = useAuth();
  const [payments, setPayments] = useState<SupplierPayment[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [form, setForm] = useState({ supplier_id: "", amount: "", purpose: "", payment_date: currentDateInputValue(), payment_time: currentTimeInputValue() });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingPayment, setEditingPayment] = useState<SupplierPayment | null>(null);
  const [adminNote, setAdminNote] = useState("");

  async function load() {
    if (!token) return;
    const [paymentResponse, supplierResponse] = await Promise.all([
      apiRequest<CollectionResponse<SupplierPayment>>("/admin/supplier-payments?per_page=50", { token }),
      apiRequest<CollectionResponse<Supplier>>("/admin/suppliers?status=active&per_page=100", { token }),
    ]);
    setPayments(paymentResponse.data);
    setSuppliers(supplierResponse.data);
    setForm((current) => ({ ...current, supplier_id: current.supplier_id || String(supplierResponse.data[0]?.id ?? "") }));
  }

  useEffect(() => {
    async function run() {
      await Promise.resolve();
      await load().catch(() => setError("Could not load supplier payments.")).finally(() => setIsLoading(false));
    }
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function createPayment() {
    if (!token) return;
    try {
      const response = await apiRequest<{ data: SupplierPayment }>("/admin/supplier-payments", { method: "POST", token, body: JSON.stringify({ ...form, supplier_id: Number(form.supplier_id) }) });
      setMessage("Supplier payment created.");
      setForm((current) => ({ ...current, amount: "", purpose: "" }));
      setPayments((current) => [response.data, ...current]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Payment action failed.");
    }
  }

  async function action(path: string, method: "PATCH" | "POST", success: string, body?: Record<string, unknown>) {
    if (!token) return;
    try {
      const response = await apiRequest<{ data: SupplierPayment }>(path, { method, token, body: body ? JSON.stringify(body) : undefined });
      setMessage(success);
      setPayments((current) => current.map((payment) => payment.id === response.data.id ? response.data : payment));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Payment action failed.");
    }
  }

  if (isLoading) return <StateBlock title="Loading" message="Fetching supplier payments." />;

  return (
    <div className="flex flex-col gap-4">
      <section className="grid gap-3 rounded-md border border-[#d8dde5] bg-white p-4 shadow-sm md:grid-cols-5">
        <select className="h-11 rounded-md border border-[#cfd6df] px-3" value={form.supplier_id} onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}>
          {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
        </select>
        <input className="h-11 rounded-md border border-[#cfd6df] px-3" type="number" step="0.01" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        <input className="h-11 rounded-md border border-[#cfd6df] px-3" placeholder="Purpose" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} />
        <input className="h-11 rounded-md border border-[#cfd6df] px-3" type="date" value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} />
        <button className="h-11 rounded-md bg-[#1f7a5c] px-5 text-sm font-semibold text-white" type="button" onClick={() => void createPayment()}>Create Payment</button>
      </section>
      {message ? <p className="text-sm text-[#146245]">{message}</p> : null}
      {error ? <p className="text-sm text-[#9d2f1f]">{error}</p> : null}
      <AdminTable headers={["Code", "Date", "Time", "Supplier", "Amount", "Purpose", "Status", "Actions"]} empty={payments.length === 0}>
        {payments.map((payment) => (
          <tr key={payment.id}>
            <td className="px-5 py-3 font-medium">{payment.payment_code}</td>
            <td className="px-5 py-3">{formatDate(payment.payment_date)}</td>
            <td className="px-5 py-3">{formatTime(payment.payment_time)}</td>
            <td className="px-5 py-3">{payment.supplier?.name ?? "-"}</td>
            <td className="px-5 py-3">{formatMoney(payment.amount)}</td>
            <td className="max-w-[240px] px-5 py-3">{payment.purpose}</td>
            <td className="px-5 py-3 capitalize">{payment.status}</td>
            <td className="px-5 py-3"><div className="flex gap-2">
              <AdminActionButton onClick={() => {
                setEditingPayment(payment);
                setAdminNote(payment.admin_note ?? "");
              }}>Edit Note</AdminActionButton>
              {payment.status !== "voided" ? <AdminActionButton onClick={() => window.confirm(`Void payment ${payment.payment_code}? This keeps the record but removes it from active totals.`) && void action(`/admin/supplier-payments/${payment.id}/void`, "POST", "Payment voided.")}>Void</AdminActionButton> : null}
            </div></td>
          </tr>
        ))}
      </AdminTable>
      {editingPayment ? (
        <Modal title={`Admin note for ${editingPayment.payment_code}`} onClose={() => setEditingPayment(null)}>
          <textarea className="min-h-32 w-full rounded-md border border-[#cfd6df] px-3 py-2 outline-none focus:border-[#1f7a5c]" value={adminNote} onChange={(event) => setAdminNote(event.target.value)} />
          <div className="mt-4 flex justify-end gap-2">
            <button className="rounded-md border border-[#cfd6df] px-4 py-2 text-sm font-semibold text-[#384150]" type="button" onClick={() => setEditingPayment(null)}>Cancel</button>
            <button className="rounded-md bg-[#1f7a5c] px-4 py-2 text-sm font-semibold text-white" type="button" onClick={() => void action(`/admin/supplier-payments/${editingPayment.id}`, "PATCH", "Payment updated.", { admin_note: adminNote }).then(() => setEditingPayment(null))}>Save Note</button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
