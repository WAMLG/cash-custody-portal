"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth";
import type { UserRole } from "@/types";

type NavItem = {
  href: string;
  label: string;
};

type AppShellProps = {
  title: string;
  section: "Admin" | "Finance" | "Supplier";
  navItems: NavItem[];
  children: ReactNode;
};

export function AppShell({ title, section, navItems, children }: AppShellProps) {
  const { logout, user } = useAuth();
  const pathname = usePathname();
  const allowedRole: UserRole =
    section === "Admin" ? "admin" : section === "Supplier" ? "supplier" : "finance";

  return (
    <ProtectedRoute allowedRole={allowedRole}>
      <main className="min-h-screen bg-[#f6f7f9] text-[#171717]">
        <div className="grid min-h-screen xl:grid-cols-[260px_1fr]">
          <aside className="sticky top-0 z-20 border-b border-[#d8dde5] bg-white/95 backdrop-blur xl:border-b-0 xl:border-r">
            <div className="flex h-full flex-col gap-4 px-4 py-4 sm:px-5 xl:gap-8 xl:py-5">
              <div className="flex items-center justify-between gap-3 xl:block">
                <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#687080]">
                  Cash Custody Portal
                </p>
                <h1 className="mt-1 text-lg font-semibold text-[#15181d] xl:mt-2 xl:text-xl">
                  {section}
                </h1>
                {user ? (
                  <p className="mt-1 max-w-[170px] truncate text-sm text-[#687080] xl:mt-2">{user.name}</p>
                ) : null}
                </div>
                <button
                  className="min-h-10 shrink-0 rounded-md border border-[#cfd6df] px-3 py-2 text-sm font-medium text-[#384150] hover:bg-[#eef2f6] xl:hidden"
                  type="button"
                  onClick={() => void logout()}
                >
                  Logout
                </button>
              </div>
              <nav className="hidden gap-2 overflow-x-auto pb-1 sm:flex xl:flex-col xl:overflow-visible xl:pb-0">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`min-h-10 shrink-0 rounded-md px-3 py-2 text-sm font-medium hover:bg-[#eef2f6] hover:text-[#15181d] ${
                      pathname === item.href
                        ? "bg-[#edf8f3] text-[#146245]"
                        : "text-[#384150]"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <button
                className="mt-auto hidden rounded-md border border-[#cfd6df] px-3 py-2 text-left text-sm font-medium text-[#384150] hover:bg-[#eef2f6] xl:block"
                type="button"
                onClick={() => void logout()}
              >
                Logout
              </button>
            </div>
          </aside>
          <section className="px-3 pb-28 pt-4 sm:px-6 sm:py-6 xl:px-8">
            <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:gap-6">
              <header className="flex flex-col gap-1 border-b border-[#d8dde5] pb-4 sm:gap-2 sm:pb-5">
                <p className="text-sm font-medium text-[#687080]">{section}</p>
                <h2 className="text-xl font-semibold text-[#15181d] sm:text-2xl">
                  {title}
                </h2>
              </header>
              {children}
            </div>
          </section>
        </div>
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[#d8dde5] bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),0.6rem)] pt-2 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur sm:hidden">
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-1 py-1 text-center text-[10px] font-semibold leading-tight ${
                  pathname === item.href
                    ? "bg-[#1f7a5c] text-white"
                    : "bg-[#eef2f6] text-[#384150]"
                }`}
              >
                <MobileNavIcon label={item.label} />
                <span>{mobileLabel(item.label)}</span>
              </Link>
            ))}
          </div>
        </nav>
      </main>
    </ProtectedRoute>
  );
}

function mobileLabel(label: string): string {
  const labels: Record<string, string> = {
    Dashboard: "Home",
    "Cash Handovers": "Cash",
    "Supplier Payments": "Pay",
    Suppliers: "Supp",
    Users: "Users",
    "Audit Logs": "Audit",
    "New Handover": "New",
    "My Records": "Records",
    Payments: "Pay",
  };

  return labels[label] ?? label;
}

function MobileNavIcon({ label }: { label: string }) {
  if (label === "Dashboard") {
    return (
      <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
        <path d="M4 11.5 12 5l8 6.5V20h-5v-5H9v5H4v-8.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    );
  }

  if (label === "Cash Handovers" || label === "New Handover") {
    return (
      <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
        <path d="M4 7h16v10H4V7Z" stroke="currentColor" strokeWidth="2" />
        <path d="M8 12h.01M16 12h.01M12 9v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (label === "Supplier Payments" || label === "Payments") {
    return (
      <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
        <path d="M5 8h14v10H5V8Z" stroke="currentColor" strokeWidth="2" />
        <path d="M7 6h10M8 13h4M15 13h1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (label === "Suppliers") {
    return (
      <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
        <path d="M4 20V8l8-4 8 4v12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M9 20v-6h6v6M8 10h.01M16 10h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (label === "Users") {
    return (
      <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
        <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.5 20a5.5 5.5 0 0 1 11 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M17 11a2.5 2.5 0 0 0 0-5M16 15a4.5 4.5 0 0 1 4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (label === "Audit Logs" || label === "My Records") {
    return (
      <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
        <path d="M7 4h10v16H7V4Z" stroke="currentColor" strokeWidth="2" />
        <path d="M10 8h4M10 12h4M10 16h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
