"use client";

import { useEffect, useState } from "react";
import { StateBlock } from "@/components/StateBlock";
import { StatusBadge } from "@/components/StatusBadge";
import { apiRequest } from "@/lib/api";
import { unwrapCollection } from "@/lib/api-shapes";
import { useAuth } from "@/lib/auth";
import { formatDate, formatMoney, formatTime } from "@/lib/format";
import type { CashHandover, FinanceDashboardResponse } from "@/types";

export function FinanceDashboardClient() {
  const { token } = useAuth();
  const [dashboard, setDashboard] = useState<FinanceDashboardResponse | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      if (!token) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await apiRequest<FinanceDashboardResponse>(
          "/finance/dashboard",
          { token },
        );

        if (isMounted) {
          setDashboard(response);
        }
      } catch {
        if (isMounted) {
          setError("Could not load finance dashboard.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [token]);

  if (isLoading) {
    return (
      <StateBlock
        title="Loading Dashboard"
        message="Fetching your handover summary."
      />
    );
  }

  if (error || !dashboard) {
    return (
      <StateBlock
        title="Dashboard Unavailable"
        message={error ?? "No dashboard data was returned."}
      />
    );
  }

  const recentHandovers = unwrapCollection<CashHandover>(
    dashboard.recent_handovers,
  );

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-3 md:grid-cols-4">
        <KpiCard
          label="Submitted"
          value={dashboard.summary.submitted_handovers_count}
        />
        <KpiCard label="Pending" value={dashboard.summary.pending_handovers} />
        <KpiCard
          label="Confirmed"
          value={dashboard.summary.confirmed_handovers}
        />
        <KpiCard
          label="This Month"
          value={formatMoney(dashboard.summary.current_month_submitted_amount)}
        />
      </section>

      <section className="rounded-md border border-[#d8dde5] bg-white shadow-sm">
        <div className="border-b border-[#e3e7ee] px-5 py-4">
          <h3 className="text-base font-semibold text-[#15181d]">
            Recent Handover Records
          </h3>
        </div>
        {recentHandovers.length === 0 ? (
          <div className="p-5 text-sm text-[#687080]">
            No handovers submitted yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-[#fafbfc] text-[#687080]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Code</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Time</th>
                  <th className="px-5 py-3 font-semibold">Amount</th>
                  <th className="px-5 py-3 font-semibold">Receiver</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e3e7ee]">
                {recentHandovers.map((handover) => (
                  <tr key={handover.id}>
                    <td className="px-5 py-3 font-medium text-[#15181d]">
                      {handover.handover_code}
                    </td>
                    <td className="px-5 py-3 text-[#384150]">
                      {formatDate(handover.handover_date)}
                    </td>
                    <td className="px-5 py-3 text-[#384150]">
                      {formatTime(handover.handover_time)}
                    </td>
                    <td className="px-5 py-3 text-[#384150]">
                      {formatMoney(handover.amount)}
                    </td>
                    <td className="px-5 py-3 text-[#384150]">
                      {handover.handed_to?.name ?? "-"}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={handover.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-[#d8dde5] bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-[#687080]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#15181d]">{value}</p>
    </div>
  );
}
