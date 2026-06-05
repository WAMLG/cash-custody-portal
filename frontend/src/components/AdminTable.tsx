import { Children, cloneElement, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";

export function AdminTable({
  headers,
  children,
  empty,
}: {
  headers: string[];
  children: ReactNode;
  empty?: boolean;
}) {
  const mobileRows = Children.map(children, (row) => {
    if (!isValidElement(row)) return row;

    const rowElement = row as ReactElement<{ children?: ReactNode; className?: string }>;
    const cells = Children.map(rowElement.props.children, (cell, index) => {
      if (!isValidElement(cell)) return cell;

      const cellElement = cell as ReactElement<{ className?: string; "data-label"?: string }>;

      return cloneElement(cellElement, {
        "data-label": headers[index] ?? "",
        className: cellElement.props.className,
      });
    });

    return cloneElement(rowElement, {
      className: rowElement.props.className,
      children: cells,
    });
  });

  return (
    <section className="mobile-table rounded-md border border-[#d8dde5] bg-white shadow-sm">
      <div className="overflow-x-auto md:overflow-visible">
        <table className="w-full min-w-[920px] text-left text-sm md:min-w-0">
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
              mobileRows
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
      className="min-h-10 rounded-md border border-[#cfd6df] px-3 py-2 text-xs font-semibold text-[#384150] hover:bg-[#eef2f6] sm:min-h-0"
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
