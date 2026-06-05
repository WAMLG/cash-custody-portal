"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/Modal";
import { StateBlock } from "@/components/StateBlock";
import { ApiError, apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { CollectionResponse, Supplier } from "@/types";

export function AdminSuppliersClient() {
  const { token } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [form, setForm] = useState({ name: "", contact_person: "", phone: "", email: "", address: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!token) return;
    const response = await apiRequest<CollectionResponse<Supplier>>("/admin/suppliers?per_page=50", { token });
    setSuppliers(response.data);
  }

  useEffect(() => {
    async function run() {
      await Promise.resolve();
      await load().catch(() => setError("Could not load suppliers.")).finally(() => setIsLoading(false));
    }
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function openSupplier(supplier: Supplier) {
    setSelectedSupplier(supplier);
    setForm({
      name: supplier.name,
      contact_person: supplier.contact_person ?? "",
      phone: supplier.phone ?? "",
      email: supplier.email ?? "",
      address: supplier.address ?? "",
    });
    setMessage(null);
    setError(null);
  }

  async function action(path: string, method: "PATCH" | "POST", success: string, body?: Record<string, unknown>) {
    if (!token) return;
    try {
      const response = await apiRequest<{ data: Supplier }>(path, { method, token, body: body ? JSON.stringify(body) : undefined });
      setMessage(success);
      setSuppliers((current) => current.map((supplier) => supplier.id === response.data.id ? response.data : supplier));
      setSelectedSupplier(response.data);
      setForm({
        name: response.data.name,
        contact_person: response.data.contact_person ?? "",
        phone: response.data.phone ?? "",
        email: response.data.email ?? "",
        address: response.data.address ?? "",
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Supplier action failed.");
    }
  }

  if (isLoading) return <StateBlock title="Loading" message="Fetching suppliers." />;

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-md border border-[#d8dde5] bg-white p-4 text-sm text-[#5f6877] shadow-sm">
        Create new suppliers from Admin Users by choosing the Supplier role. Select a supplier below to view, edit, block, or unblock.
      </section>
      {message ? <p className="rounded-md border border-[#a8d5c0] bg-[#edf8f3] px-3 py-2 text-sm text-[#146245]">{message}</p> : null}
      {error ? <p className="rounded-md border border-[#f0c4bd] bg-[#fff5f3] px-3 py-2 text-sm text-[#9d2f1f]">{error}</p> : null}

      <section className="grid gap-3">
        {suppliers.length === 0 ? <StateBlock title="No Suppliers" message="No supplier records found." /> : null}
        {suppliers.map((supplier) => (
          <button key={supplier.id} className="rounded-md border border-[#d8dde5] bg-white p-4 text-left shadow-sm transition hover:border-[#b8c4d2] hover:bg-[#fafbfc]" type="button" onClick={() => openSupplier(supplier)}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-[#15181d]">{supplier.name}</p>
                <p className="mt-1 text-sm text-[#687080]">{supplier.supplier_code}</p>
                <p className="mt-1 text-sm text-[#687080]">{supplier.contact_person ?? "No contact person"}</p>
              </div>
              <span className={`rounded-md border px-2 py-1 text-xs font-semibold capitalize ${supplier.status === "active" ? "border-[#a8d5c0] bg-[#edf8f3] text-[#146245]" : "border-[#efb4ad] bg-[#fff1ef] text-[#9d2f1f]"}`}>{supplier.status}</span>
            </div>
            <p className="mt-3 text-sm text-[#687080]">{supplier.phone ?? "-"} · {supplier.email ?? "-"}</p>
          </button>
        ))}
      </section>

      {selectedSupplier ? (
        <Modal title={`Supplier: ${selectedSupplier.name}`} onClose={() => setSelectedSupplier(null)}>
          <div className="grid gap-3">
            <Input label="Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
            <Input label="Contact person" value={form.contact_person} onChange={(value) => setForm({ ...form, contact_person: value })} />
            <Input label="Phone" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
            <Input label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
            <Input label="Address" value={form.address} onChange={(value) => setForm({ ...form, address: value })} />
            <div className="rounded-md bg-[#fafbfc] px-3 py-2 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.04em] text-[#687080]">Code</p>
              <p className="mt-1 text-[#15181d]">{selectedSupplier.supplier_code}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button className="min-h-11 rounded-md bg-[#1f7a5c] px-4 py-2 text-sm font-semibold text-white" type="button" onClick={() => void action(`/admin/suppliers/${selectedSupplier.id}`, "PATCH", "Supplier updated.", { ...form, contact_person: form.contact_person || null, phone: form.phone || null, email: form.email || null, address: form.address || null })}>Save Supplier</button>
            {selectedSupplier.status === "active" ? (
              <button className="min-h-11 rounded-md border border-[#efb4ad] px-4 py-2 text-sm font-semibold text-[#9d2f1f]" type="button" onClick={() => window.confirm(`Block supplier ${selectedSupplier.name}?`) && void action(`/admin/suppliers/${selectedSupplier.id}/block`, "POST", "Supplier blocked.")}>Block Supplier</button>
            ) : (
              <button className="min-h-11 rounded-md border border-[#a8d5c0] px-4 py-2 text-sm font-semibold text-[#146245]" type="button" onClick={() => void action(`/admin/suppliers/${selectedSupplier.id}/unblock`, "POST", "Supplier unblocked.")}>Unblock Supplier</button>
            )}
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[#384150]">{label}</span>
      <input className="mt-2 h-12 w-full rounded-md border border-[#cfd6df] px-3 outline-none focus:border-[#1f7a5c] sm:h-11" type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
