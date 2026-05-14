export function DemoCredentials() {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="mt-5 rounded-md border border-[#d8dde5] bg-[#fafbfc] p-3 text-sm text-[#384150]">
      <p className="font-semibold text-[#15181d]">Demo credentials</p>
      <p className="mt-2">Admin: admin@example.com / Password@123</p>
      <p>Finance: finance1@example.com / Password@123</p>
    </div>
  );
}
