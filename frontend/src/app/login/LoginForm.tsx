"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api";
import { dashboardPathForRole, useAuth } from "@/lib/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, login } = useAuth();
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(dashboardPathForRole(user.role));
    }
  }, [isLoading, router, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const loggedInUser = await login(loginValue, password);
      const next = searchParams.get("next");
      const fallback = dashboardPathForRole(loggedInUser.role);
      const target =
        next?.startsWith(`/${loggedInUser.role === "admin" ? "admin" : "finance"}/`)
          ? next
          : fallback;

      router.replace(target);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not connect to the backend API.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block">
        <span className="text-sm font-medium text-[#384150]">
          Email or username
        </span>
        <input
          className="mt-2 h-11 w-full rounded-md border border-[#cfd6df] px-3 outline-none focus:border-[#1f7a5c]"
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
          className="mt-2 h-11 w-full rounded-md border border-[#cfd6df] px-3 outline-none focus:border-[#1f7a5c]"
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
      <button
        className="h-11 w-full rounded-md bg-[#1f7a5c] px-4 text-sm font-semibold text-white hover:bg-[#19664d] disabled:cursor-not-allowed disabled:bg-[#8bb7a7]"
        type="submit"
        disabled={isSubmitting || isLoading}
      >
        {isSubmitting ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
