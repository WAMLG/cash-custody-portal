import type { ReactNode } from "react";

type ModalProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export function Modal({ title, children, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 px-3 pb-3 pt-10 sm:items-center sm:px-4 sm:pb-0 sm:pt-0">
      <section className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-hidden rounded-md border border-[#d8dde5] bg-white shadow-lg">
        <header className="flex items-center justify-between gap-3 border-b border-[#e3e7ee] px-4 py-4 sm:px-5">
          <h3 className="text-base font-semibold text-[#15181d]">{title}</h3>
          <button
            className="min-h-10 shrink-0 rounded-md border border-[#cfd6df] px-3 py-2 text-sm text-[#384150] sm:min-h-0 sm:px-2 sm:py-1"
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </header>
        <div className="max-h-[calc(100vh-8rem)] overflow-y-auto p-4 sm:p-5">{children}</div>
      </section>
    </div>
  );
}
