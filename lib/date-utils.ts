const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseDate(value: string | Date) {
  if (value instanceof Date) return value;

  const dateOnlyMatch = value.match(DATE_ONLY_PATTERN);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  return new Date(value);
}

function isValidDate(date: Date) {
  return !Number.isNaN(date.getTime());
}

export function formatUsDate(
  value?: string | Date | null,
  fallback = "N/A",
) {
  if (!value) return fallback;

  const date = parseDate(value);
  if (!isValidDate(date)) return fallback;

  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatUsDateTime(
  value?: string | Date | null,
  fallback = "N/A",
) {
  if (!value) return fallback;

  const date = parseDate(value);
  if (!isValidDate(date)) return fallback;

  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}
