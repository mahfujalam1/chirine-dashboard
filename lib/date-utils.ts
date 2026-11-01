const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_DATE_PREFIX_PATTERN = /^(\d{4}-\d{2}-\d{2})T/;
const ISO_TIME_PATTERN = /T(\d{2}):(\d{2})/;
const TIME_ONLY_PATTERN = /^(\d{1,2}):(\d{2})(?::\d{2})?\s*([AaPp])?\.?[Mm]?\.?$/;

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

/** Reads "14:30", "2:30 PM" or an ISO timestamp into 24-hour parts. */
function parseTimeParts(value: string | Date) {
  if (value instanceof Date) {
    return isValidDate(value)
      ? { hours: value.getHours(), minutes: value.getMinutes() }
      : null;
  }

  const timeMatch = value.trim().match(TIME_ONLY_PATTERN);
  if (timeMatch) {
    const [, rawHours, rawMinutes, meridiem] = timeMatch;
    let hours = Number(rawHours);
    const minutes = Number(rawMinutes);

    if (minutes > 59) return null;
    if (meridiem) {
      if (hours < 1 || hours > 12) return null;
      const isPm = meridiem.toLowerCase() === "p";
      hours = isPm ? (hours === 12 ? 12 : hours + 12) : hours === 12 ? 0 : hours;
    } else if (hours > 23) {
      return null;
    }

    return { hours, minutes };
  }

  // An ISO timestamp keeps the stored wall-clock time, with no timezone shift.
  const isoMatch = value.match(ISO_TIME_PATTERN);
  if (isoMatch) {
    const [, hours, minutes] = isoMatch;
    return { hours: Number(hours), minutes: Number(minutes) };
  }

  return null;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

/** The viewer's IANA timezone, e.g. "America/Toronto". Falls back to UTC outside the browser. */
export function getDeviceTimezone(fallback = "UTC") {
  if (typeof window === "undefined") return fallback;
  return Intl.DateTimeFormat().resolvedOptions().timeZone || fallback;
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

/**
 * Formats a calendar date (an event day, not an instant) as MM/DD/YYYY.
 * A UTC-stored day keeps its stored value instead of shifting in US timezones.
 */
export function formatUsCalendarDate(
  value?: string | Date | null,
  fallback = "N/A",
) {
  const inputValue = toDateInputValue(value);
  if (!inputValue) return fallback;

  const [year, month, day] = inputValue.split("-");
  return `${month}/${day}/${year}`;
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

export function formatUsTime(
  value?: string | Date | null,
  fallback = "N/A",
) {
  if (!value) return fallback;

  const parts = parseTimeParts(value);
  if (!parts) return fallback;

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(1970, 0, 1, parts.hours, parts.minutes));
}

/** Normalizes an API date into the `yyyy-MM-dd` value an <input type="date"> needs. */
export function toDateInputValue(value?: string | Date | null) {
  if (!value) return "";

  if (typeof value === "string") {
    if (DATE_ONLY_PATTERN.test(value)) return value;

    // Keep the stored calendar day instead of shifting it into the local zone.
    const isoMatch = value.match(ISO_DATE_PREFIX_PATTERN);
    if (isoMatch) return isoMatch[1];
  }

  const date = parseDate(value);
  if (!isValidDate(date)) return "";

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Normalizes an API time into the `HH:mm` value an <input type="time"> needs. */
export function toTimeInputValue(value?: string | Date | null) {
  if (!value) return "";

  const parts = parseTimeParts(value);
  if (!parts) return "";

  return `${pad(parts.hours)}:${pad(parts.minutes)}`;
}

// ─── Instants ─────────────────────────────────────────────────────────────────
// An instant is a real moment in time (an ISO timestamp such as
// "2026-11-05T18:30:00.000Z"). It is rendered in the viewer's own timezone, so
// the same event reads 2:30 PM in Toronto and 11:30 AM in Vancouver.
// A wall-clock value ("14:30") pins no moment, so it is shown as stored.

const ISO_DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/;

function parseInstant(value?: string | Date | null) {
  if (!value) return null;
  if (value instanceof Date) return isValidDate(value) ? value : null;
  if (!ISO_DATETIME_PATTERN.test(value.trim())) return null;

  const date = new Date(value);
  return isValidDate(date) ? date : null;
}

/** Formats a stored instant as local time, e.g. "2:30 PM". */
export function formatLocalTime(value?: string | Date | null, fallback = "N/A") {
  const instant = parseInstant(value);
  if (!instant) return formatUsTime(value, fallback);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(instant);
}

/**
 * Formats a stored instant as the local calendar date, MM/DD/YYYY.
 * Only for instants: a date-only day is handled by `formatUsCalendarDate`,
 * which must not shift across timezones.
 */
export function formatLocalDate(value?: string | Date | null, fallback = "N/A") {
  const instant = parseInstant(value);
  if (!instant) return formatUsCalendarDate(value, fallback);

  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(instant);
}

/** Formats a stored instant as local date and time, e.g. "11/05/2026, 02:30 PM". */
export function formatLocalDateTime(
  value?: string | Date | null,
  fallback = "N/A",
) {
  const instant = parseInstant(value);
  if (!instant) return formatUsDateTime(value, fallback);

  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(instant);
}

/** Local `yyyy-MM-dd` for an <input type="date"> holding a stored instant. */
export function toLocalDateInputValue(value?: string | Date | null) {
  const instant = parseInstant(value);
  if (!instant) return toDateInputValue(value);

  return `${instant.getFullYear()}-${pad(instant.getMonth() + 1)}-${pad(instant.getDate())}`;
}

/** Local `HH:mm` for an <input type="time"> holding a stored instant. */
export function toLocalTimeInputValue(value?: string | Date | null) {
  const instant = parseInstant(value);
  if (!instant) return toTimeInputValue(value);

  return `${pad(instant.getHours())}:${pad(instant.getMinutes())}`;
}
