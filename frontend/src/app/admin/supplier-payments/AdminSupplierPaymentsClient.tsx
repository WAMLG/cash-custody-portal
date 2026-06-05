"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Modal } from "@/components/Modal";
import { StateBlock } from "@/components/StateBlock";
import { StatusBadge } from "@/components/StatusBadge";
import { ApiError, apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { currentDateInputValue, currentTimeInputValue, formatDate, formatMoney, formatTime } from "@/lib/format";
import type { CollectionResponse, Supplier, SupplierPayment } from "@/types";

export function AdminSupplierPaymentsClient() {
  const { token } = useAuth();
  const [payments, setPayments] = useState<SupplierPayment[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [form, setForm] = useState({ supplier_id: "", amount: "", purpose: "", payment_date: currentDateInputValue(), payment_time: currentTimeInputValue() });
  const [selectedPayment, setSelectedPayment] = useState<SupplierPayment | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  function openPayment(payment: SupplierPayment) {
    setSelectedPayment(payment);
    setAdminNote(payment.admin_note ?? "");
    setMessage(null);
    setError(null);
  }

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
      setSelectedPayment(response.data);
      setAdminNote(response.data.admin_note ?? "");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Payment action failed.");
    }
  }

  if (isLoading) return <StateBlock title="Loading" message="Fetching supplier payments." />;

  return (
    <div className="flex flex-col gap-4">
      <section className="grid gap-3 rounded-md border border-[#d8dde5] bg-white p-4 shadow-sm md:grid-cols-5">
        <Field label="Supplier"><select className="mt-2 h-12 w-full rounded-md border border-[#cfd6df] px-3 sm:h-11" value={form.supplier_id} onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select></Field>
        <Field label="Amount"><input className="mt-2 h-12 w-full rounded-md border border-[#cfd6df] px-3 sm:h-11" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Field>
        <Field label="Purpose"><input className="mt-2 h-12 w-full rounded-md border border-[#cfd6df] px-3 sm:h-11" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} /></Field>
        <Field label="Date"><input className="mt-2 h-12 w-full rounded-md border border-[#cfd6df] px-3 sm:h-11" type="date" value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} /></Field>
        <button className="mt-0 h-12 rounded-md bg-[#1f7a5c] px-5 text-sm font-semibold text-white md:mt-7 md:h-11" type="button" onClick={() => void createPayment()}>Create Payment</button>
      </section>
      {message ? <p className="rounded-md border border-[#a8d5c0] bg-[#edf8f3] px-3 py-2 text-sm text-[#146245]">{message}</p> : null}
      {error ? <p className="rounded-md border border-[#f0c4bd] bg-[#fff5f3] px-3 py-2 text-sm text-[#9d2f1f]">{error}</p> : null}

      <section className="grid gap-3">
        {payments.length === 0 ? <StateBlock title="No Payments" message="No supplier payments found." /> : null}
        {payments.map((payment) => (
          <button key={payment.id} className="rounded-md border border-[#d8dde5] bg-white p-4 text-left shadow-sm transition hover:border-[#b8c4d2] hover:bg-[#fafbfc]" type="button" onClick={() => openPayment(payment)}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-[#15181d]">{payment.payment_code}</p>
                <p className="mt-1 text-sm text-[#687080]">{payment.supplier?.name ?? "-"}</p>
                <p className="mt-1 text-sm text-[#687080]">{formatDate(payment.payment_date)} at {formatTime(payment.payment_time)}</p>
              </div>
              <StatusBadge status={payment.status} />
            </div>
            <p className="mt-3 text-lg font-semibold text-[#15181d]">{formatMoney(payment.amount)}</p>
            <p className="mt-1 text-sm text-[#687080]">{payment.purpose}</p>
          </button>
        ))}
      </section>

      {selectedPayment ? (
        <Modal title={`Payment ${selectedPayment.payment_code}`} onClose={() => setSelectedPayment(null)}>
          <div className="grid gap-3 text-sm">
            <Detail label="Supplier" value={selectedPayment.supplier?.name ?? "-"} />
            <Detail label="Amount" value={formatMoney(selectedPayment.amount)} />
            <Detail label="Date" value={`${formatDate(selectedPayment.payment_date)} ${formatTime(selectedPayment.payment_time)}`} />
            <Detail label="Purpose" value={selectedPayment.purpose} />
            <Detail label="Supplier note" value={selectedPayment.supplier_note ?? "-"} />
            <Detail label="Accepted at" value={selectedPayment.accepted_at ?? "-"} />
            <Detail label="Status" value={<StatusBadge status={selectedPayment.status} />} />
            <label className="block">
              <span className="text-sm font-medium text-[#384150]">Admin note</span>
              <textarea className="mt-2 min-h-32 w-full rounded-md border border-[#cfd6df] px-3 py-2 outline-none focus:border-[#1f7a5c]" value={adminNote} onChange={(event) => setAdminNote(event.target.value)} />
            </label>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button className="min-h-11 rounded-md bg-[#1f7a5c] px-4 py-2 text-sm font-semibold text-white" type="button" onClick={() => void action(`/admin/supplier-payments/${selectedPayment.id}`, "PATCH", "Payment updated.", { admin_note: adminNote })}>Save Note</button>
            {selectedPayment.status !== "voided" ? <button className="min-h-11 rounded-md border border-[#efb4ad] px-4 py-2 text-sm font-semibold text-[#9d2f1f]" type="button" onClick={() => window.confirm(`Void payment ${selectedPayment.payment_code}?`) && void action(`/admin/supplier-payments/${selectedPayment.id}/void`, "POST", "Payment voided.")}>Void</button> : null}
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="text-sm font-medium text-[#384150]">{label}</span>{children}</label>;
}

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return <div className="rounded-md bg-[#fafbfc] px-3 py-2"><p className="text-xs font-semibold uppercase tracking-[0.04em] text-[#687080]">{label}</p><div className="mt-1 text-[#15181d]">{value}</div></div>;
}
