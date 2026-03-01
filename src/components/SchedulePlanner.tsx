import { useState, useRef, useEffect } from 'react';
import type { Course, Semester, TimeSlot, Weekday } from '../types';
import { useProgram } from '../context/ProgramContext';
import { exportSchedulePDF } from '../lib/pdfExport';
import { openInAppleCalendar, openInGoogleCalendar, downloadICS } from '../lib/icalExport';

interface SchedulePlannerProps {
  semesters: Semester[];
  customCourses: Course[];
  onCourseClick: (course: Course) => void;
  scheduleOverrides: Record<string, TimeSlot[]>;
  selectedSemId: string;
  onSelectedSemIdChange: (id: string) => void;
}

const WEEKDAYS: Weekday[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const START_HOUR = 8;
const END_HOUR = 20;
const SLOT_HEIGHT = 28;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToY(minutes: number): number {
  return ((minutes - START_HOUR * 60) / 30) * SLOT_HEIGHT;
}

export interface ScheduleEntry {
  course: Course;
  slot: TimeSlot;
  isExtra: boolean;
}

const BROWSE_MODE_ID = '__browse__';

export function SchedulePlanner({ semesters, customCourses, onCourseClick, scheduleOverrides, selectedSemId, onSelectedSemIdChange: setSelectedSemId }: SchedulePlannerProps) {
  const program = useProgram();
  const [extraCourseIds, setExtraCourseIds] = useState<Set<string>>(new Set());
  const [showCoursePicker, setShowCoursePicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close export menu on outside click
  useEffect(() => {
    if (!showExportMenu) return;
    const handler = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showExportMenu]);

  const isBrowseMode = selectedSemId === BROWSE_MODE_ID;
  const semester = isBrowseMode ? null : semesters.find(s => s.id === selectedSemId);

  // Reset to first semester if selected one was deleted
  if (!isBrowseMode && !semester && semesters.length > 0) {
    setSelectedSemId(semesters[0].id);
    return null;
  }

  // Helper to resolve schedule (overrides take priority)
  function resolveSchedule(course: Course): TimeSlot[] {
    if (course.id in scheduleOverrides) return scheduleOverrides[course.id];
    return course.schedule ?? [];
  }

  // Courses from the study plan semester (empty in browse mode)
  const semesterCourseIds = new Set(
    semester ? semester.courses.map(pc => pc.courseId) : []
  );
  const entries: ScheduleEntry[] = [];

  if (semester) {
    for (const pc of semester.courses) {
      const course = program.courses.find(c => c.id === pc.courseId) ?? customCourses.find(c => c.id === pc.courseId);
      if (course) {
        for (const slot of resolveSchedule(course)) {
          entries.push({ course, slot, isExtra: false });
        }
      }
    }
  }

  // Extra / browsed courses
  for (const courseId of extraCourseIds) {
    if (semesterCourseIds.has(courseId)) continue;
    const course = program.courses.find(c => c.id === courseId) ?? customCourses.find(c => c.id === courseId);
    if (course) {
      for (const slot of resolveSchedule(course)) {
        entries.push({ course, slot, isExtra: !isBrowseMode });
      }
    }
  }

  // Group by day
  const byDay: Record<string, ScheduleEntry[]> = {};
  for (const day of WEEKDAYS) {
    byDay[day] = entries.filter(e => e.slot.day === day);
  }

  const gridHeight = (END_HOUR - START_HOUR) * 2 * SLOT_HEIGHT;

  const timeLabels: string[] = [];
  for (let h = START_HOUR; h < END_HOUR; h++) {
    timeLabels.push(`${h.toString().padStart(2, '0')}:00`);
  }

  // All courses with schedule data (for the picker)
  const allScheduled = [...program.courses, ...customCourses].filter(c => resolveSchedule(c).length > 0);
  const filteredForPicker = pickerSearch
    ? allScheduled.filter(c =>
        c.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
        c.instructor?.toLowerCase().includes(pickerSearch.toLowerCase())
      )
    : allScheduled;

  const toggleExtra = (courseId: string) => {
    setExtraCourseIds(prev => {
      const next = new Set(prev);
      if (next.has(courseId)) next.delete(courseId);
      else next.add(courseId);
      return next;
    });
  };

  // Check for time conflicts and compute layout columns
  function overlaps(a: ScheduleEntry, b: ScheduleEntry): boolean {
    if (a.slot.day !== b.slot.day) return false;
    if (a.course.id === b.course.id) return false;
    const aStart = timeToMinutes(a.slot.start);
    const aEnd = timeToMinutes(a.slot.end);
    const bStart = timeToMinutes(b.slot.start);
    const bEnd = timeToMinutes(b.slot.end);
    return aStart < bEnd && bStart < aEnd;
  }

  const conflicts = new Set<string>();
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      if (overlaps(entries[i], entries[j])) {
        conflicts.add(entries[i].course.id);
        conflicts.add(entries[j].course.id);
      }
    }
  }

  // Compute column layout for overlapping entries per day
  type LayoutInfo = { col: number; totalCols: number };
  const layoutMap = new Map<string, LayoutInfo>(); // key: "courseId-index"

  for (const day of WEEKDAYS) {
    const dayEntries = byDay[day];
    if (dayEntries.length === 0) continue;

    // Find overlap groups using a sweep
    const groups: number[][] = [];
    const visited = new Set<number>();

    for (let i = 0; i < dayEntries.length; i++) {
      if (visited.has(i)) continue;
      const group = [i];
      visited.add(i);
      // Find all entries that transitively overlap with this one
      let changed = true;
      while (changed) {
        changed = false;
        for (let j = 0; j < dayEntries.length; j++) {
          if (visited.has(j)) continue;
          for (const gi of group) {
            if (overlaps(dayEntries[gi], dayEntries[j])) {
              group.push(j);
              visited.add(j);
              changed = true;
              break;
            }
          }
        }
      }
      groups.push(group);
    }

    // Assign columns within each group
    for (const group of groups) {
      if (group.length === 1) {
        const idx = group[0];
        const entry = dayEntries[idx];
        const key = `${entry.course.id}-${entries.indexOf(entry)}`;
        layoutMap.set(key, { col: 0, totalCols: 1 });
        continue;
      }
      // Sort by start time, then by end time descending
      group.sort((a, b) => {
        const aStart = timeToMinutes(dayEntries[a].slot.start);
        const bStart = timeToMinutes(dayEntries[b].slot.start);
        if (aStart !== bStart) return aStart - bStart;
        return timeToMinutes(dayEntries[b].slot.end) - timeToMinutes(dayEntries[a].slot.end);
      });
      const cols: number[] = new Array(group.length).fill(-1);
      for (let gi = 0; gi < group.length; gi++) {
        const usedCols = new Set<number>();
        for (let gj = 0; gj < gi; gj++) {
          if (overlaps(dayEntries[group[gi]], dayEntries[group[gj]])) {
            usedCols.add(cols[gj]);
          }
        }
        let col = 0;
        while (usedCols.has(col)) col++;
        cols[gi] = col;
      }
      const totalCols = Math.max(...cols) + 1;
      for (let gi = 0; gi < group.length; gi++) {
        const idx = group[gi];
        const entry = dayEntries[idx];
        const key = `${entry.course.id}-${entries.indexOf(entry)}`;
        layoutMap.set(key, { col: cols[gi], totalCols });
      }
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 border-b bg-white px-3 sm:px-4 py-2">
        <h2 className="text-sm font-bold text-gray-700">Weekly Schedule</h2>
        <select
          value={selectedSemId}
          onChange={(e) => {
            setSelectedSemId(e.target.value);
            if (e.target.value === BROWSE_MODE_ID) setShowCoursePicker(true);
          }}
          className="rounded border px-2 py-1 text-sm"
        >
          {semesters.map(s => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
          <option value={BROWSE_MODE_ID}>Browse courses</option>
        </select>
        <button
          onClick={() => setShowCoursePicker(!showCoursePicker)}
          className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
            showCoursePicker
              ? 'bg-indigo-100 text-indigo-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {showCoursePicker ? 'Hide' : '+ Add'} Courses
        </button>
        {conflicts.size > 0 && (
          <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
            Time conflict detected
          </span>
        )}
        {extraCourseIds.size > 0 && (
          <span className="text-xs text-gray-400">
            {extraCourseIds.size} {isBrowseMode ? '' : 'extra '}course{extraCourseIds.size > 1 ? 's' : ''} {isBrowseMode ? 'selected' : 'shown'}
          </span>
        )}
        <div className="ml-auto relative" ref={exportMenuRef}>
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={entries.length === 0}
            className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            📤 Export ▾
          </button>
          {showExportMenu && entries.length > 0 && (
            <div className="absolute right-0 top-full mt-1 z-20 w-56 rounded-lg border border-gray-200 bg-white shadow-lg py-1">
              {/* Direct calendar add */}
              <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Add to Calendar
              </div>
              <button
                onClick={() => {
                  const count = openInGoogleCalendar(entries);
                  setShowExportMenu(false);
                  if (count > 1) {
                    // Small toast-like feedback (alert for now)
                    setTimeout(() => alert(`Opened ${count} events in Google Calendar. Click "Save" on each tab to add them.`), 300);
                  }
                }}
                className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-2"
              >
                <span className="text-base">🗓️</span>
                <div>
                  <div className="font-medium text-gray-700">Google Calendar</div>
                  <div className="text-gray-400">Opens pre-filled events — just save</div>
                </div>
              </button>
              <button
                onClick={() => {
                  const label = semester?.label ?? 'Browse';
                  openInAppleCalendar(entries, label);
                  setShowExportMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-2"
              >
                <span className="text-base">📅</span>
                <div>
                  <div className="font-medium text-gray-700">Apple Calendar</div>
                  <div className="text-gray-400">Opens Calendar.app directly</div>
                </div>
              </button>
              <div className="border-t border-gray-100 my-1" />
              {/* Export options */}
              <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Export
              </div>
              <button
                onClick={() => {
                  const label = semester?.label ?? 'Browse';
                  exportSchedulePDF(entries, label, program);
                  setShowExportMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-2"
              >
                <span className="text-base">📄</span>
                <div>
                  <div className="font-medium text-gray-700">PDF</div>
                  <div className="text-gray-400">Printable weekly overview</div>
                </div>
              </button>
              <button
                onClick={() => {
                  const label = semester?.label ?? 'Browse';
                  downloadICS(entries, label);
                  setShowExportMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-2"
              >
                <span className="text-base">📥</span>
                <div>
                  <div className="font-medium text-gray-700">Download .ics</div>
                  <div className="text-gray-400">For Outlook or manual import</div>
                </div>
              </button>
              <div className="border-t border-gray-100 my-1" />
              <div className="px-3 py-1.5 text-xs text-gray-400">
                Events repeat weekly for the semester
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Course picker sidebar */}
        {showCoursePicker && (
          <div className="w-full md:w-60 shrink-0 overflow-y-auto border-b md:border-b-0 md:border-r bg-gray-50 p-2 max-h-48 md:max-h-none">
            <input
              type="text"
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              placeholder="Search courses..."
              className="mb-2 w-full rounded border px-2 py-1 text-xs"
            />
            <p className="mb-2 text-xs text-gray-400">
              Toggle courses to preview on the calendar
            </p>
            <div className="space-y-1">
              {filteredForPicker.map(course => {
                const inSemester = semesterCourseIds.has(course.id);
                const isExtra = extraCourseIds.has(course.id);
                const active = inSemester || isExtra;

                return (
                  <button
                    key={course.id}
                    onClick={() => {
                      if (!inSemester) toggleExtra(course.id);
                    }}
                    disabled={inSemester}
                    className={`w-full rounded border px-2 py-1.5 text-left text-xs transition-all ${
                      inSemester
                        ? 'border-green-300 bg-green-50 text-green-700'
                        : isExtra
                          ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span className={`inline-block h-2 w-2 rounded-full ${
                        active ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      <span className="font-medium truncate">{course.name}</span>
                    </div>
                    {resolveSchedule(course).map((s, i) => (
                      <div key={i} className="ml-3 text-xs opacity-60">
                        {s.day} {s.start}–{s.end}
                      </div>
                    ))}
                    {inSemester && (
                      <div className="ml-3 text-xs italic opacity-50">in study plan</div>
                    )}
                  </button>
                );
              })}
              {filteredForPicker.length === 0 && (
                <p className="text-center text-xs text-gray-400 py-4">
                  No courses with schedule data
                </p>
              )}
            </div>
          </div>
        )}

        {/* Calendar grid */}
        <div className="flex-1 overflow-auto p-4">
          <div className="flex min-w-[700px]">
            {/* Time column */}
            <div className="w-14 shrink-0 pt-8">
              {timeLabels.map(label => (
                <div
                  key={label}
                  className="text-right text-xs text-gray-400 pr-2"
                  style={{ height: SLOT_HEIGHT * 2 }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {WEEKDAYS.map(day => (
              <div key={day} className="flex-1 min-w-[120px]">
                <div className="mb-1 text-center text-xs font-bold text-gray-600 h-7 flex items-center justify-center">
                  {day}
                </div>

                <div
                  className="relative rounded-lg border border-gray-100 bg-white"
                  style={{ height: gridHeight }}
                >
                  {timeLabels.map((label, i) => (
                    <div
                      key={label}
                      className="absolute left-0 right-0 border-t border-dashed border-gray-200/60"
                      style={{ top: i * SLOT_HEIGHT * 2 }}
                    />
                  ))}
                  {timeLabels.map((label, i) => (
                    <div
                      key={`${label}-half`}
                      className="absolute left-0 right-0 border-t border-dotted border-gray-100/50"
                      style={{ top: i * SLOT_HEIGHT * 2 + SLOT_HEIGHT }}
                    />
                  ))}

                  {byDay[day].map((entry) => {
                    const startMin = timeToMinutes(entry.slot.start);
                    const endMin = timeToMinutes(entry.slot.end);
                    const top = minutesToY(startMin);
                    const height = minutesToY(endMin) - top;
                    const colors = program.categoryColors[entry.course.category] ?? program.categoryColors['other'] ?? 'bg-slate-100 border-slate-300 text-slate-800';
                    const isConflict = conflicts.has(entry.course.id);
                    const entryKey = `${entry.course.id}-${entries.indexOf(entry)}`;
                    const layout = layoutMap.get(entryKey) ?? { col: 0, totalCols: 1 };
                    const widthPct = 100 / layout.totalCols;
                    const leftPct = layout.col * widthPct;

                    return (
                      <button
                        key={entryKey}
                        className={`absolute rounded border-2 px-1 py-0.5 text-left transition-shadow hover:shadow-md overflow-hidden ${colors} ${
                          entry.isExtra ? 'opacity-70 border-dashed' : ''
                        } ${isConflict ? 'ring-2 ring-red-400' : ''}`}
                        style={{
                          top,
                          height,
                          left: `calc(${leftPct}% + 2px)`,
                          width: `calc(${widthPct}% - 4px)`,
                        }}
                        onClick={() => onCourseClick(entry.course)}
                        title={`${entry.course.name}\n${entry.slot.start}–${entry.slot.end}${entry.slot.room ? `\n${entry.slot.room}` : ''}${entry.isExtra ? '\n(preview)' : ''}`}
                      >
                        <div className="text-xs font-medium leading-tight truncate">
                          {entry.course.name}
                        </div>
                        {height > 30 && (
                          <div className="text-xs opacity-70 truncate">
                            {entry.slot.start}–{entry.slot.end}
                          </div>
                        )}
                        {height > 48 && entry.slot.room && (
                          <div className="text-xs opacity-60 truncate">
                            {entry.slot.room}
                          </div>
                        )}
                        {height > 48 && entry.course.instructor && (
                          <div className="text-xs opacity-60 truncate">
                            {entry.course.instructor}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
