"use client";

import { useEffect, useState } from "react";
import { StateBlock } from "@/components/StateBlock";
import { StatusBadge } from "@/components/StatusBadge";
import { apiRequest } from "@/lib/api";
import { unwrapCollection } from "@/lib/api-shapes";
import { useAuth } from "@/lib/auth";
import { formatDate, formatMoney, formatTime } from "@/lib/format";
import type { SupplierDashboardResponse, SupplierPayment } from "@/types";

export function SupplierDashboardClient() {
  const { token } = useAuth();
  const [data, setData] = useState<SupplierDashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!token) return;
      try {
        const response = await apiRequest<SupplierDashboardResponse>("/supplier/dashboard", { token });
        if (active) setData(response);
      } catch {
        if (active) setError("Could not load supplier dashboard.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [token]);

  if (isLoading) return <StateBlock title="Loading" message="Fetching supplier payments." />;
  if (error || !data) return <StateBlock title="Unavailable" message={error ?? "No data returned."} />;

  const recent = unwrapCollection<SupplierPayment>(data.recent_payments);

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Payments" value={data.summary.payments_count} />
        <Kpi label="Pending Acceptance" value={data.summary.pending_acceptance} />
        <Kpi label="Accepted" value={data.summary.accepted_payments} />
        <Kpi label="Total Amount" value={formatMoney(data.summary.total_amount)} />
      </section>
      <section className="mobile-table rounded-md border border-[#d8dde5] bg-white shadow-sm">
        <div className="border-b border-[#e3e7ee] px-5 py-4">
          <h3 className="text-base font-semibold text-[#15181d]">Recent Payments</h3>
        </div>
        <div className="overflow-x-auto md:overflow-visible">
          <table className="w-full min-w-[760px] text-left text-sm md:min-w-0">
            <thead className="bg-[#fafbfc] text-[#687080]">
              <tr>
                <th className="px-5 py-3 font-semibold">Code</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Time</th>
                <th className="px-5 py-3 font-semibold">Amount</th>
                <th className="px-5 py-3 font-semibold">Purpose</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e3e7ee]">
              {recent.map((payment) => (
                <tr key={payment.id}>
                  <td data-label="Code" className="px-5 py-3 font-medium">{payment.payment_code}</td>
                  <td data-label="Date" className="px-5 py-3">{formatDate(payment.payment_date)}</td>
                  <td data-label="Time" className="px-5 py-3">{formatTime(payment.payment_time)}</td>
                  <td data-label="Amount" className="px-5 py-3">{formatMoney(payment.amount)}</td>
                  <td data-label="Purpose" className="px-5 py-3">{payment.purpose}</td>
                  <td data-label="Status" className="px-5 py-3"><StatusBadge status={payment.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-[#d8dde5] bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-[#687080]">{label}</p>
      <p className="mt-2 text-xl font-semibold text-[#15181d] sm:text-2xl">{value}</p>
    </div>
  );
}
