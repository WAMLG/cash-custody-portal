import type { ReactNode } from "react";

type ModalProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export function Modal({ title, children, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <section className="w-full max-w-lg rounded-md border border-[#d8dde5] bg-white shadow-lg">
        <header className="flex items-center justify-between border-b border-[#e3e7ee] px-5 py-4">
          <h3 className="text-base font-semibold text-[#15181d]">{title}</h3>
          <button
            className="rounded-md border border-[#cfd6df] px-2 py-1 text-sm text-[#384150]"
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </header>
        <div className="p-5">{children}</div>
      </section>
    </div>
  );
}
