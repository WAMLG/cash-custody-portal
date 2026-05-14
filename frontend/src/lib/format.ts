export function formatMoney(value: number | string | null | undefined): string {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-LK", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(`${value}T00:00:00`));
}

export function formatTime(value: string | null | undefined): string {
  if (!value) {
    return "-";
  }

  return value.slice(0, 5);
}

export function currentDateInputValue(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Colombo",
  });
}

export function currentTimeInputValue(): string {
  return new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Colombo",
  });
}
