import {
  formatLocalDate,
  formatLocalTime,
  formatUsCalendarDate,
  toDateInputValue,
  toLocalDateInputValue,
  toLocalTimeInputValue,
} from "@/lib/date-utils";

/**
 * The time fields an event carries, whichever shape the API returns.
 *
 * `startAt`/`endAt` are UTC instants and win whenever they are present: only an
 * instant pins the event to a real moment, so it can be shown in whatever
 * timezone the viewer is in. `startTime`/`endTime` are read the same way when
 * they arrive as timestamps, and as stored wall-clock times when they do not.
 */
export interface EventTimeFields {
  date?: string;
  startTime?: string;
  endTime?: string;
  startAt?: string;
  endAt?: string;
}

/**
 * The instant that fixes which day the event falls on, if the API gave one.
 *
 * `startTime` only counts when it is a timestamp on the stored day: a time kept
 * against the epoch ("1970-01-01T18:30:00Z") says nothing about the day, and
 * reading it as one would move every event to 1970.
 */
function resolveStartInstant(event: EventTimeFields) {
  if (event.startAt) return event.startAt;

  const storedDay = toDateInputValue(event.date);
  const startTimeDay = toDateInputValue(event.startTime);
  if (storedDay && startTimeDay === storedDay) return event.startTime;

  return undefined;
}

/** The event day in the viewer's timezone. */
export function formatEventDate(event: EventTimeFields, fallback = "N/A") {
  // Without an instant, `date` is a calendar day stored at midnight UTC — it is
  // shown as stored, because converting it would move the event a day.
  const startInstant = resolveStartInstant(event);
  return startInstant
    ? formatLocalDate(startInstant, fallback)
    : formatUsCalendarDate(event.date, fallback);
}

/** The start time in the viewer's timezone, e.g. "2:30 PM". */
export function formatEventStartTime(event: EventTimeFields, fallback = "N/A") {
  return formatLocalTime(event.startAt ?? event.startTime, fallback);
}

/** The end time in the viewer's timezone. */
export function formatEventEndTime(event: EventTimeFields, fallback = "N/A") {
  return formatLocalTime(event.endAt ?? event.endTime, fallback);
}

/** Both ends in the viewer's timezone, e.g. "2:30 PM – 3:30 PM". */
export function formatEventTimeRange(event: EventTimeFields, fallback = "N/A") {
  return `${formatEventStartTime(event, fallback)} – ${formatEventEndTime(event, fallback)}`;
}

/**
 * The event's stored time as the local values its form inputs hold, so an admin
 * edits the time they see and saves it back in their own timezone.
 */
export function toEventFormTime(event: EventTimeFields) {
  const startInstant = resolveStartInstant(event);

  return {
    date: startInstant
      ? toLocalDateInputValue(startInstant)
      : toDateInputValue(event.date),
    start_time: toLocalTimeInputValue(event.startAt ?? event.startTime),
    end_time: toLocalTimeInputValue(event.endAt ?? event.endTime),
  };
}
