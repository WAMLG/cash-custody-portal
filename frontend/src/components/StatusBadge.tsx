import type { CashHandover, SupplierPayment } from "@/types";

type StatusBadgeProps = {
  status: CashHandover["status"] | SupplierPayment["status"];
};

const styles: Record<StatusBadgeProps["status"], string> = {
  pending: "border-[#ead28c] bg-[#fff8df] text-[#735c05]",
  confirmed: "border-[#a8d5c0] bg-[#edf8f3] text-[#146245]",
  paid: "border-[#bdd7ff] bg-[#eff6ff] text-[#1d4f91]",
  accepted: "border-[#a8d5c0] bg-[#edf8f3] text-[#146245]",
  voided: "border-[#efb4ad] bg-[#fff1ef] text-[#9d2f1f]",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold capitalize ${styles[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
