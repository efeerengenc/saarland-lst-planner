import type { ScheduleEntry } from '../components/SchedulePlanner';
import type { Weekday } from '../types';

/**
 * Generate an .ics (iCalendar) file from schedule entries.
 *
 * The exported events are recurring weekly events spanning the semester.
 * Compatible with Google Calendar (import), Apple Calendar (native), and Outlook.
 */

const WEEKDAY_TO_RRULE: Record<Weekday, string> = {
  Mon: 'MO',
  Tue: 'TU',
  Wed: 'WE',
  Thu: 'TH',
  Fri: 'FR',
};

// Semester date ranges — user picks start/end or we use sensible defaults
// German university semesters:
//   WS: mid-October to mid-February  (lectures ~ Oct 14 – Feb 7)
//   SS: mid-April to mid-July        (lectures ~ Apr 14 – Jul 18)

function getNextSemesterDates(): { start: Date; end: Date } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  // If we're in Aug-Dec → upcoming WS starts Oct of this year
  // If Jan-Feb → current WS ends Feb this year
  // If Mar-Jul → upcoming SS starts Apr this year
  if (month >= 7) {
    // Aug-Dec → WS this year
    return {
      start: new Date(year, 9, 14), // Oct 14
      end: new Date(year + 1, 1, 7), // Feb 7 next year
    };
  } else if (month <= 1) {
    // Jan-Feb → current WS
    return {
      start: new Date(year - 1, 9, 14), // Oct 14 last year
      end: new Date(year, 1, 7), // Feb 7 this year
    };
  } else {
    // Mar-Jul → SS this year
    return {
      start: new Date(year, 3, 14), // Apr 14
      end: new Date(year, 6, 18), // Jul 18
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

export interface CalendarExportOptions {
  semesterStart?: Date;
  semesterEnd?: Date;
}

export function generateICS(
  entries: ScheduleEntry[],
  semesterLabel: string,
  options?: CalendarExportOptions
): string {
  const defaults = getNextSemesterDates();
  const semStart = options?.semesterStart ?? defaults.start;
  const semEnd = options?.semesterEnd ?? defaults.end;

  // Deduplicate entries by course+slot (same course+day+start+end = one event)
  const seen = new Set<string>();
  const unique: ScheduleEntry[] = [];
  for (const entry of entries) {
    const key = `${entry.course.id}|${entry.slot.day}|${entry.slot.start}|${entry.slot.end}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(entry);
    }
  }

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

/**
 * Build a Google Calendar "add event" URL for a single entry.
 * Google Calendar doesn't support recurring events via URL, so we open the import flow instead.
 * For bulk import, use the .ics file.
 */
export function googleCalendarImportURL(): string {
  return 'https://calendar.google.com/calendar/r/settings/export';
}
