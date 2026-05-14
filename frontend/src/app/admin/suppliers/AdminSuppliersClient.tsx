"use client";

import { useEffect, useState } from "react";
import { AdminActionButton, AdminTable } from "@/components/AdminTable";
import { StateBlock } from "@/components/StateBlock";
import { ApiError, apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { CollectionResponse, Supplier } from "@/types";

export function AdminSuppliersClient() {
  const { token } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [name, setName] = useState("");
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

  async function submit() {
    if (!token || !name.trim()) return;
    try {
      const response = await apiRequest<{ data: Supplier }>("/admin/suppliers", { method: "POST", token, body: JSON.stringify({ name }) });
      setName("");
      setSuppliers((current) => [...current, response.data].sort((a, b) => a.name.localeCompare(b.name)));
      setMessage("Supplier created.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Supplier action failed.");
    }
  }

  async function action(path: string, method: "PATCH" | "POST", success: string, body?: Record<string, unknown>) {
    if (!token) return;
    try {
      const response = await apiRequest<{ data: Supplier }>(path, { method, token, body: body ? JSON.stringify(body) : undefined });
      setMessage(success);
      setSuppliers((current) => current.map((supplier) => supplier.id === response.data.id ? response.data : supplier));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Supplier action failed.");
    }
  }

  if (isLoading) return <StateBlock title="Loading" message="Fetching suppliers." />;

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3 rounded-md border border-[#d8dde5] bg-white p-4 shadow-sm sm:flex-row">
        <input className="h-11 flex-1 rounded-md border border-[#cfd6df] px-3" placeholder="Supplier name" value={name} onChange={(event) => setName(event.target.value)} />
        <button className="h-11 rounded-md bg-[#1f7a5c] px-5 text-sm font-semibold text-white" type="button" onClick={() => void submit()}>Create Supplier</button>
      </section>
      {message ? <p className="text-sm text-[#146245]">{message}</p> : null}
      {error ? <p className="text-sm text-[#9d2f1f]">{error}</p> : null}
      <AdminTable headers={["Code", "Name", "Contact", "Phone", "Email", "Status", "Actions"]} empty={suppliers.length === 0}>
        {suppliers.map((supplier) => (
          <tr key={supplier.id}>
            <td className="px-5 py-3 font-medium">{supplier.supplier_code}</td>
            <td className="px-5 py-3">{supplier.name}</td>
            <td className="px-5 py-3">{supplier.contact_person ?? "-"}</td>
            <td className="px-5 py-3">{supplier.phone ?? "-"}</td>
            <td className="px-5 py-3">{supplier.email ?? "-"}</td>
            <td className="px-5 py-3 capitalize">{supplier.status}</td>
            <td className="px-5 py-3">
              <div className="flex flex-wrap gap-2">
                <AdminActionButton onClick={() => {
                  const nextName = window.prompt("Supplier name", supplier.name);
                  if (nextName) void action(`/admin/suppliers/${supplier.id}`, "PATCH", "Supplier updated.", { name: nextName });
                }}>Edit</AdminActionButton>
                {supplier.status === "active" ? (
                  <AdminActionButton onClick={() => window.confirm(`Block supplier ${supplier.name}? They will not be selectable for new payments.`) && void action(`/admin/suppliers/${supplier.id}/block`, "POST", "Supplier blocked.")}>Block</AdminActionButton>
                ) : (
                  <AdminActionButton onClick={() => void action(`/admin/suppliers/${supplier.id}/unblock`, "POST", "Supplier unblocked.")}>Unblock</AdminActionButton>
                )}
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
