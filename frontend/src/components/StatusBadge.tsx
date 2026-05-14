import type { CashHandover } from "@/types";

type StatusBadgeProps = {
  status: CashHandover["status"];
};

const styles: Record<CashHandover["status"], string> = {
  pending: "border-[#ead28c] bg-[#fff8df] text-[#735c05]",
  confirmed: "border-[#a8d5c0] bg-[#edf8f3] text-[#146245]",
  voided: "border-[#efb4ad] bg-[#fff1ef] text-[#9d2f1f]",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}
