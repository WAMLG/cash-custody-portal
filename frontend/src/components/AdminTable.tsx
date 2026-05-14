import type { ReactNode } from "react";

export function AdminTable({
  headers,
  children,
  empty,
}: {
  headers: string[];
  children: ReactNode;
  empty?: boolean;
}) {
  return (
    <section className="rounded-md border border-[#d8dde5] bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="bg-[#fafbfc] text-[#687080]">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-5 py-3 font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e3e7ee]">
            {empty ? (
              <tr>
                <td className="px-5 py-8 text-center text-[#687080]" colSpan={headers.length}>
                  No records found.
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function AdminActionButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className="rounded-md border border-[#cfd6df] px-3 py-2 text-xs font-semibold text-[#384150] hover:bg-[#eef2f6]"
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
