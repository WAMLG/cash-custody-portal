type StateBlockProps = {
  title: string;
  message: string;
};

export function StateBlock({ title, message }: StateBlockProps) {
  return (
    <section className="rounded-md border border-[#d8dde5] bg-white p-5 text-sm shadow-sm">
      <h3 className="font-semibold text-[#15181d]">{title}</h3>
      <p className="mt-2 text-[#687080]">{message}</p>
    </section>
  );
}
