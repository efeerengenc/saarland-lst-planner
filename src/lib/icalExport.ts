import type { ScheduleEntry } from '../components/SchedulePlanner';
import type { Weekday } from '../types';

/**
 * Generate .ics (iCalendar) files and Google Calendar URLs from schedule entries.
 *
 * Supports:
 * - Apple Calendar: open .ics directly (triggers Calendar.app)
 * - Google Calendar: direct URL with pre-filled recurring events
 * - Generic .ics download for Outlook, etc.
 */

const WEEKDAY_TO_RRULE: Record<Weekday, string> = {
  Mon: 'MO',
  Tue: 'TU',
  Wed: 'WE',
  Thu: 'TH',
  Fri: 'FR',
};

// German university semesters:
//   WS: mid-October to mid-February  (lectures ~ Oct 14 – Feb 7)
//   SS: mid-April to mid-July        (lectures ~ Apr 14 – Jul 18)

function getNextSemesterDates(): { start: Date; end: Date } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  if (month >= 7) {
    return {
      start: new Date(year, 9, 14),
      end: new Date(year + 1, 1, 7),
    };
  } else if (month <= 1) {
    return {
      start: new Date(year - 1, 9, 14),
      end: new Date(year, 1, 7),
    };
  } else {
    return {
      start: new Date(year, 3, 14),
      end: new Date(year, 6, 18),
    };
  }
}

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

function formatICSDate(date: Date): string {
  return `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}`;
}

function formatICSDateTime(date: Date, time: string): string {
  const [h, m] = time.split(':').map(Number);
  return `${formatICSDate(date)}T${pad2(h)}${pad2(m)}00`;
}

/**
 * Find the first occurrence of a given weekday on or after `start`.
 */
function firstWeekdayOnOrAfter(start: Date, weekday: Weekday): Date {
  const dayMap: Record<Weekday, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5 };
  const target = dayMap[weekday];
  const d = new Date(start);
  const current = d.getDay(); // 0=Sun
  const diff = (target - current + 7) % 7;
  d.setDate(d.getDate() + diff);
  return d;
}

function escapeICS(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}@study-planner`;
}

/** Deduplicate entries by course+slot identity */
function dedupeEntries(entries: ScheduleEntry[]): ScheduleEntry[] {
  const seen = new Set<string>();
  const unique: ScheduleEntry[] = [];
  for (const entry of entries) {
    const key = `${entry.course.id}|${entry.slot.day}|${entry.slot.start}|${entry.slot.end}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(entry);
    }
  }
  return unique;
}

export interface CalendarExportOptions {
  semesterStart?: Date;
  semesterEnd?: Date;
}

// ─── .ics generation ───────────────────────────────────────────

export function generateICS(
  entries: ScheduleEntry[],
  semesterLabel: string,
  options?: CalendarExportOptions
): string {
  const defaults = getNextSemesterDates();
  const semStart = options?.semesterStart ?? defaults.start;
  const semEnd = options?.semesterEnd ?? defaults.end;

  const unique = dedupeEntries(entries);

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Study Planner//Schedule Export//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeICS(semesterLabel)} Schedule`,
  ];

  const now = new Date();
  const stamp = `${formatICSDate(now)}T${pad2(now.getHours())}${pad2(now.getMinutes())}${pad2(now.getSeconds())}`;

  for (const entry of unique) {
    const firstDay = firstWeekdayOnOrAfter(semStart, entry.slot.day);
    const rruleDay = WEEKDAY_TO_RRULE[entry.slot.day];
    const untilDate = formatICSDate(semEnd);

    const description: string[] = [];
    if (entry.course.instructor) description.push(`Instructor: ${entry.course.instructor}`);
    if (entry.slot.type) description.push(`Type: ${entry.slot.type}`);
    if (entry.course.category) description.push(`Category: ${entry.course.category}`);

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid()}`);
    lines.push(`DTSTAMP:${stamp}`);
    lines.push(`DTSTART:${formatICSDateTime(firstDay, entry.slot.start)}`);
    lines.push(`DTEND:${formatICSDateTime(firstDay, entry.slot.end)}`);
    lines.push(`RRULE:FREQ=WEEKLY;BYDAY=${rruleDay};UNTIL=${untilDate}T235959`);
    lines.push(`SUMMARY:${escapeICS(entry.course.name)}`);
    if (entry.slot.room) {
      lines.push(`LOCATION:${escapeICS(entry.slot.room)}`);
    }
    if (description.length > 0) {
      lines.push(`DESCRIPTION:${escapeICS(description.join('\\n'))}`);
    }
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

// ─── Apple Calendar — open .ics directly ───────────────────────

/**
 * Opens the .ics content directly in the browser.
 * On macOS / iOS this triggers Calendar.app to open with an "Add events" prompt.
 * No manual file import needed.
 */
export function openInAppleCalendar(entries: ScheduleEntry[], semesterLabel: string, options?: CalendarExportOptions): void {
  const ics = generateICS(entries, semesterLabel, options);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  // Navigate to the blob URL — macOS/iOS intercepts text/calendar and opens Calendar.app
  window.open(url, '_blank');
  // Clean up after a short delay (the OS will have grabbed the content by then)
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// ─── Google Calendar — direct URL API ──────────────────────────

/**
 * Generate a Google Calendar event creation URL for a single schedule entry.
 * Opens Google Calendar with a pre-filled event — user just clicks "Save".
 *
 * Google Calendar URL supports:
 * - text: event title
 * - dates: start/end in YYYYMMDDTHHmmss format
 * - recur: RRULE for recurring events
 * - location: room
 * - details: description
 */
function buildGoogleCalendarURL(entry: ScheduleEntry, semStart: Date, semEnd: Date): string {
  const firstDay = firstWeekdayOnOrAfter(semStart, entry.slot.day);
  const rruleDay = WEEKDAY_TO_RRULE[entry.slot.day];

  const dtStart = formatICSDateTime(firstDay, entry.slot.start);
  const dtEnd = formatICSDateTime(firstDay, entry.slot.end);
  const until = formatICSDate(semEnd);

  const params = new URLSearchParams();
  params.set('action', 'TEMPLATE');
  params.set('text', entry.course.name);
  params.set('dates', `${dtStart}/${dtEnd}`);
  params.set('recur', `RRULE:FREQ=WEEKLY;BYDAY=${rruleDay};UNTIL=${until}T235959`);

  if (entry.slot.room) {
    params.set('location', entry.slot.room);
  }

  const details: string[] = [];
  if (entry.course.instructor) details.push(`Instructor: ${entry.course.instructor}`);
  if (entry.slot.type) details.push(`Type: ${entry.slot.type}`);
  if (details.length > 0) {
    params.set('details', details.join('\n'));
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Open all schedule entries directly in Google Calendar.
 * Each unique course+slot opens in a new tab with a pre-filled recurring event.
 * User just clicks "Save" on each tab.
 *
 * Returns the number of events opened.
 */
export function openInGoogleCalendar(entries: ScheduleEntry[], options?: CalendarExportOptions): number {
  const defaults = getNextSemesterDates();
  const semStart = options?.semesterStart ?? defaults.start;
  const semEnd = options?.semesterEnd ?? defaults.end;

  const unique = dedupeEntries(entries);

  for (const entry of unique) {
    const url = buildGoogleCalendarURL(entry, semStart, semEnd);
    window.open(url, '_blank');
  }

  return unique.length;
}

// ─── Generic .ics download ─────────────────────────────────────

export function downloadICS(entries: ScheduleEntry[], semesterLabel: string, options?: CalendarExportOptions): void {
  const ics = generateICS(entries, semesterLabel, options);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `schedule-${semesterLabel.replace(/\s+/g, '-').toLowerCase()}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
