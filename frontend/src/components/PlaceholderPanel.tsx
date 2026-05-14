type PlaceholderPanelProps = {
  title: string;
  items: string[];
};

export function PlaceholderPanel({ title, items }: PlaceholderPanelProps) {
  return (
    <section className="rounded-md border border-[#d8dde5] bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-[#15181d]">{title}</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-md border border-[#e3e7ee] bg-[#fafbfc] px-4 py-3 text-sm text-[#384150]"
          >
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
