"use client";

import Link from "next/link";
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
  section: "Admin" | "Finance";
  navItems: NavItem[];
  children: ReactNode;
};

export function AppShell({ title, section, navItems, children }: AppShellProps) {
  const { logout, user } = useAuth();
  const allowedRole: UserRole = section === "Admin" ? "admin" : "finance";

  return (
    <ProtectedRoute allowedRole={allowedRole}>
      <main className="min-h-screen bg-[#f6f7f9] text-[#171717]">
        <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
          <aside className="border-b border-[#d8dde5] bg-white lg:border-b-0 lg:border-r">
            <div className="flex h-full flex-col gap-8 px-5 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#687080]">
                  Cash Custody Portal
                </p>
                <h1 className="mt-2 text-xl font-semibold text-[#15181d]">
                  {section}
                </h1>
                {user ? (
                  <p className="mt-2 text-sm text-[#687080]">{user.name}</p>
                ) : null}
              </div>
              <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-md px-3 py-2 text-sm font-medium text-[#384150] hover:bg-[#eef2f6] hover:text-[#15181d]"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <button
                className="mt-auto rounded-md border border-[#cfd6df] px-3 py-2 text-left text-sm font-medium text-[#384150] hover:bg-[#eef2f6]"
                type="button"
                onClick={() => void logout()}
              >
                Logout
              </button>
            </div>
          </aside>
          <section className="px-5 py-6 sm:px-8">
            <div className="mx-auto flex max-w-6xl flex-col gap-6">
              <header className="flex flex-col gap-2 border-b border-[#d8dde5] pb-5">
                <p className="text-sm font-medium text-[#687080]">{section}</p>
                <h2 className="text-2xl font-semibold text-[#15181d]">
                  {title}
                </h2>
              </header>
              {children}
            </div>
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
}
