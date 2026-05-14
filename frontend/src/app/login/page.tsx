import { Suspense } from "react";
import { DemoCredentials } from "@/app/login/DemoCredentials";
import { LoginForm } from "@/app/login/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f7f9] px-5 py-10 text-[#171717]">
      <section className="w-full max-w-md rounded-md border border-[#d8dde5] bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#687080]">
            Cash Custody Portal
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-[#15181d]">Login</h1>
          <p className="mt-2 text-sm text-[#687080]">
            Sign in with your admin or finance account.
          </p>
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
        <DemoCredentials />
      </section>
    </main>
  );
}
