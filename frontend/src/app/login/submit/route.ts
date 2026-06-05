import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import type { LoginResponse, UserRole } from "@/types";

const BACKEND_API_URL = "http://127.0.0.1:8000/api";
const TOKEN_KEY = "cash_custody_token";
const USER_KEY = "cash_custody_user";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const login = String(formData.get("login") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!login || !password) {
    redirect("/login?error=missing");
  }

  const response = await fetch(`${BACKEND_API_URL}/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ login, password }),
  });

  if (!response.ok) {
    redirect("/login?error=invalid");
  }

  const payload = (await response.json()) as LoginResponse;
  const next = dashboardPathForRole(payload.user.role);
  const redirectResponse = new NextResponse(null, {
    status: 303,
    headers: {
      Location: next,
    },
  });

  redirectResponse.cookies.set(TOKEN_KEY, payload.token, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirectResponse.cookies.set(USER_KEY, JSON.stringify(payload.user), {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  return redirectResponse;
}

function dashboardPathForRole(role: UserRole): string {
  if (role === "admin") {
    return "/admin/dashboard";
  }

  if (role === "supplier") {
    return "/supplier/dashboard";
  }

  return "/finance/dashboard";
}
