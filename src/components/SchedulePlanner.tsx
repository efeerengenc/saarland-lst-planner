import { useState } from 'react';
import type { Course, Semester, TimeSlot, Weekday } from '../types';
import { getCourseById, COURSES, CATEGORY_COLORS } from '../data/courses';
import { exportSchedulePDF } from '../lib/pdfExport';

interface SchedulePlannerProps {
  semesters: Semester[];
  customCourses: Course[];
  onCourseClick: (course: Course) => void;
  scheduleOverrides: Record<string, TimeSlot[]>;
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

export function SchedulePlanner({ semesters, customCourses, onCourseClick, scheduleOverrides }: SchedulePlannerProps) {
  const [selectedSemId, setSelectedSemId] = useState(semesters[0]?.id ?? BROWSE_MODE_ID);
  const [extraCourseIds, setExtraCourseIds] = useState<Set<string>>(new Set());
  const [showCoursePicker, setShowCoursePicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

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
      const course = getCourseById(pc.courseId) ?? customCourses.find(c => c.id === pc.courseId);
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
    const course = getCourseById(courseId) ?? customCourses.find(c => c.id === courseId);
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
  const allScheduled = [...COURSES, ...customCourses].filter(c => resolveSchedule(c).length > 0);
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

  // Check for time conflicts
  function hasConflict(a: ScheduleEntry, b: ScheduleEntry): boolean {
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
      if (hasConflict(entries[i], entries[j])) {
        conflicts.add(entries[i].course.id);
        conflicts.add(entries[j].course.id);
      }
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b bg-white px-4 py-2">
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
        <div className="ml-auto">
          <button
            onClick={() => {
              const label = semester?.label ?? 'Browse';
              exportSchedulePDF(entries, label);
            }}
            disabled={entries.length === 0}
            className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Export schedule as PDF"
          >
            📄 Export PDF
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Course picker sidebar */}
        {showCoursePicker && (
          <div className="w-60 shrink-0 overflow-y-auto border-r bg-gray-50 p-2">
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
                  className="relative rounded-lg border border-gray-200 bg-white"
                  style={{ height: gridHeight }}
                >
                  {timeLabels.map((label, i) => (
                    <div
                      key={label}
                      className="absolute left-0 right-0 border-t border-gray-100"
                      style={{ top: i * SLOT_HEIGHT * 2 }}
                    />
                  ))}
                  {timeLabels.map((label, i) => (
                    <div
                      key={`${label}-half`}
                      className="absolute left-0 right-0 border-t border-gray-50"
                      style={{ top: i * SLOT_HEIGHT * 2 + SLOT_HEIGHT }}
                    />
                  ))}

                  {byDay[day].map((entry, i) => {
                    const startMin = timeToMinutes(entry.slot.start);
                    const endMin = timeToMinutes(entry.slot.end);
                    const top = minutesToY(startMin);
                    const height = minutesToY(endMin) - top;
                    const colors = CATEGORY_COLORS[entry.course.category] ?? CATEGORY_COLORS['other'];
                    const isConflict = conflicts.has(entry.course.id);

                    return (
                      <button
                        key={`${entry.course.id}-${i}`}
                        className={`absolute left-0.5 right-0.5 rounded border-2 px-1 py-0.5 text-left transition-shadow hover:shadow-md overflow-hidden ${colors} ${
                          entry.isExtra ? 'opacity-70 border-dashed' : ''
                        } ${isConflict ? 'ring-2 ring-red-400' : ''}`}
                        style={{ top, height }}
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
