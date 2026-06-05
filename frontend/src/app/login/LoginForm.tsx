"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { API_BASE_URL, ApiError } from "@/lib/api";
import { dashboardPathForRole, useAuth } from "@/lib/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, login } = useAuth();
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(dashboardPathForRole(user.role));
    }
  }, [isLoading, router, user]);

  async function submitLogin() {
    if (isSubmitting) {
      return;
    }

    setError(null);
    setStatus("Contacting backend...");
    setIsSubmitting(true);

    try {
      const loggedInUser = await login(loginValue, password);
      setStatus("Login accepted. Opening dashboard...");
      const next = searchParams.get("next");
      const fallback = dashboardPathForRole(loggedInUser.role);
      const rolePrefix =
        loggedInUser.role === "admin"
          ? "admin"
          : loggedInUser.role === "supplier"
            ? "supplier"
            : "finance";
      const target =
        next?.startsWith(`/${rolePrefix}/`)
          ? next
          : fallback;

      window.location.assign(target);
    } catch (err) {
      setStatus(null);
      setError(
        err instanceof ApiError
          ? err.message
          : `Could not connect to the backend API at ${API_BASE_URL}. For phone tunnel testing, leave NEXT_PUBLIC_API_BASE_URL empty or set it to /api and restart the frontend.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitLogin();
  }

  return (
    <form className="space-y-4" action="/login/submit" method="post" onSubmit={handleSubmit}>
      <label className="block">
        <span className="text-sm font-medium text-[#384150]">
          Email or username
        </span>
        <input
          className="mt-2 h-12 w-full rounded-md border border-[#cfd6df] px-3 outline-none focus:border-[#1f7a5c] sm:h-11"
          name="login"
          type="text"
          value={loginValue}
          onChange={(event) => setLoginValue(event.target.value)}
          autoComplete="username"
          required
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-[#384150]">Password</span>
        <input
          className="mt-2 h-12 w-full rounded-md border border-[#cfd6df] px-3 outline-none focus:border-[#1f7a5c] sm:h-11"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
      </label>
      {error ? (
        <p className="rounded-md border border-[#f0c4bd] bg-[#fff5f3] px-3 py-2 text-sm text-[#9d2f1f]">
          {error}
        </p>
      ) : null}
      {status ? (
        <p className="rounded-md border border-[#bdd7ff] bg-[#eff6ff] px-3 py-2 text-sm text-[#1d4f91]">
          {status}
        </p>
      ) : null}
      <button
        className="h-12 w-full rounded-md bg-[#1f7a5c] px-4 text-sm font-semibold text-white hover:bg-[#19664d] disabled:cursor-not-allowed disabled:bg-[#8bb7a7] sm:h-11"
        type="submit"
        onClick={(event) => {
          event.preventDefault();
          void submitLogin();
        }}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
