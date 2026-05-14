"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { dashboardPathForRole, useAuth } from "@/lib/auth";
import type { UserRole } from "@/types";

type ProtectedRouteProps = {
  allowedRole: UserRole;
  children: ReactNode;
};

export function ProtectedRoute({ allowedRole, children }: ProtectedRouteProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (user.role !== allowedRole) {
      router.replace(dashboardPathForRole(user.role));
    }
  }, [allowedRole, isLoading, pathname, router, user]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f7f9] text-sm font-medium text-[#384150]">
        Loading secure session...
      </main>
    );
  }

  if (!user || user.role !== allowedRole) {
    return null;
  }

  return children;
}
