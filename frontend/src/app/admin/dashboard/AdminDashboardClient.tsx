"use client";

import { useEffect, useState } from "react";
import { StateBlock } from "@/components/StateBlock";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDate, formatMoney } from "@/lib/format";
import type { AdminDashboardResponse } from "@/types";

export function AdminDashboardClient() {
  const { token } = useAuth();
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [period, setPeriod] = useState("today");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!token) return;
      setIsLoading(true);
      try {
        const response = await apiRequest<AdminDashboardResponse>(
          `/admin/dashboard?period=${period}`,
          { token },
        );
        if (active) setData(response);
      } catch {
        if (active) setError("Could not load admin dashboard.");
      } finally {
        if (active) setIsLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [period, token]);

  if (isLoading) return <StateBlock title="Loading" message="Fetching ledger totals." />;
  if (error || !data) return <StateBlock title="Unavailable" message={error ?? "No data returned."} />;

  const kpis = [
    ["Today's Cash In", data.kpis.today_cash_in],
    ["Today's Supplier Payments", data.kpis.today_supplier_payments],
    ["Current Cash Balance", data.kpis.current_cash_balance],
    ["Pending Handovers", data.kpis.pending_cash_handovers],
    ["Total Cash In", data.kpis.total_cash_in],
    ["Total Cash Out", data.kpis.total_cash_out],
    ["Average Daily Cash In", data.kpis.average_daily_cash_in],
    ["Average Daily Cash Out", data.kpis.average_daily_cash_out],
    ["Maximum Cash In", data.kpis.maximum_cash_in],
    ["Minimum Cash In", data.kpis.minimum_cash_in],
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2">
        {["today", "week", "month"].map((item) => (
          <button
            key={item}
            className={`rounded-md border px-3 py-2 text-sm font-semibold capitalize ${period === item ? "border-[#1f7a5c] bg-[#edf8f3] text-[#146245]" : "border-[#cfd6df] bg-white text-[#384150]"}`}
            onClick={() => setPeriod(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>
      <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
        {kpis.map(([label, value]) => (
          <div key={label} className="rounded-md border border-[#d8dde5] bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-[#687080]">{label}</p>
            <p className="mt-2 text-xl font-semibold text-[#15181d]">
              {label === "Pending Handovers" ? value : formatMoney(value)}
            </p>
          </div>
        ))}
      </section>
      <section className="grid gap-4 xl:grid-cols-3">
        <ChartList
          title="Daily Cash In vs Out"
          items={data.charts.daily_cash_in_vs_out.cash_in.map((cashIn, index) => ({
            label: formatDate(cashIn.date),
            value: `In ${formatMoney(cashIn.amount)} / Out ${formatMoney(data.charts.daily_cash_in_vs_out.cash_out[index]?.amount ?? 0)}`,
          }))}
        />
        <ChartList
          title="Finance User Handovers"
          items={data.charts.finance_user_cash_handovers.map((row) => ({
            label: row.user_name,
            value: `${row.handovers_count} records / ${formatMoney(row.total_amount)}`,
          }))}
        />
        <ChartList
          title="Supplier Payments"
          items={data.charts.supplier_payments.map((row) => ({
            label: row.supplier_name,
            value: `${row.payments_count} payments / ${formatMoney(row.total_amount)}`,
          }))}
        />
      </section>
    </div>
  );
}

function ChartList({ title, items }: { title: string; items: Array<{ label: string; value: string }> }) {
  return (
    <div className="rounded-md border border-[#d8dde5] bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-[#15181d]">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? <p className="text-sm text-[#687080]">No data for this period.</p> : null}
        {items.map((item) => (
          <div key={`${item.label}-${item.value}`} className="flex justify-between gap-3 border-b border-[#eef2f6] pb-2 text-sm">
            <span className="font-medium text-[#384150]">{item.label}</span>
            <span className="text-right text-[#687080]">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
