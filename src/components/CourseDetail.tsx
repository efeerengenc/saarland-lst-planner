import { useState } from 'react';
import type { Course, TimeSlot, Weekday } from '../types';
import { useProgram } from '../context/ProgramContext';

const WEEKDAYS: Weekday[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

interface CourseDetailProps {
  course: Course;
  onClose: () => void;
  onAddToSemester: (semesterId: string) => void;
  onRemoveFromPlan?: () => void;
  placedInSemester?: string;  // label of the semester the course is in
  semesters: { id: string; label: string }[];
  isPlaced: boolean;
  schedule?: TimeSlot[];
  onScheduleChange?: (courseId: string, slots: TimeSlot[]) => void;
  onScheduleReset?: (courseId: string) => void;
  hasScheduleOverride?: boolean;
}

export function CourseDetail({
  course,
  onClose,
  onAddToSemester,
  onRemoveFromPlan,
  placedInSemester,
  semesters,
  isPlaced,
  schedule,
  onScheduleChange,
  onScheduleReset,
  hasScheduleOverride,
}: CourseDetailProps) {
  const program = useProgram();
  const colors = program.categoryColors[course.category] ?? program.categoryColors['other'] ?? 'bg-slate-100 border-slate-300 text-slate-800';
  const [editingSchedule, setEditingSchedule] = useState(false);
  const effectiveSchedule = schedule ?? course.schedule ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg mx-3 max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`rounded-t-xl border-b-2 p-4 ${colors}`}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold">{course.name}</h2>
              {course.nameDE && (
                <p className="text-sm opacity-70">{course.nameDE}</p>
              )}
            </div>
            <button onClick={onClose} className="rounded p-1 hover:bg-black/10 text-lg leading-none">
              &times;
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded bg-white/50 px-2 py-0.5 text-sm font-bold">
              {course.cp} CP
            </span>
            {course.sws && course.sws > 0 && (
              <span className="rounded bg-white/50 px-2 py-0.5 text-sm">
                {course.sws} SWS
              </span>
            )}
            <span className="rounded bg-white/50 px-2 py-0.5 text-sm">
              {program.categoryLabels[course.category] ?? course.category}
            </span>
            {course.offeredIn.map(s => (
              <span key={s} className="rounded bg-white/40 px-2 py-0.5 text-sm">{s}</span>
            ))}
            {!course.graded && (
              <span className="rounded bg-white/40 px-2 py-0.5 text-sm italic">ungraded</span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {course.description && (
            <div>
              <h3 className="mb-1 text-xs font-bold uppercase text-gray-400">Description</h3>
              <p className="text-sm text-gray-700">{course.description}</p>
            </div>
          )}

          {course.instructor && (
            <div>
              <h3 className="mb-1 text-xs font-bold uppercase text-gray-400">Instructor</h3>
              <p className="text-sm text-gray-700">{course.instructor}</p>
            </div>
          )}

          {course.assessmentType && (
            <div>
              <h3 className="mb-1 text-xs font-bold uppercase text-gray-400">Assessment</h3>
              <p className="text-sm text-gray-700">{course.assessmentType}</p>
            </div>
          )}

          {/* Schedule */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-bold uppercase text-gray-400">Schedule</h3>
              <div className="flex items-center gap-1">
                {hasScheduleOverride && onScheduleReset && (
                  <button
                    onClick={() => {
                      onScheduleReset(course.id);
                      setEditingSchedule(false);
                    }}
                    className="text-xs text-gray-400 hover:text-red-500"
                  >
                    Reset
                  </button>
                )}
                {onScheduleChange && (
                  <button
                    onClick={() => setEditingSchedule(!editingSchedule)}
                    className="text-xs text-indigo-500 hover:text-indigo-700"
                  >
                    {editingSchedule ? 'Done' : 'Edit'}
                  </button>
                )}
              </div>
            </div>
            {effectiveSchedule.length > 0 ? (
              <div className="space-y-1">
                {effectiveSchedule.map((slot, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-8 font-medium">{slot.day}</span>
                    <span>{slot.start}–{slot.end}</span>
                    {slot.room && <span className="text-xs text-gray-400">({slot.room})</span>}
                    {slot.type && <span className="rounded bg-gray-100 px-1 py-0.5 text-xs text-gray-500">{slot.type}</span>}
                    {editingSchedule && (
                      <button
                        onClick={() => {
                          const newSlots = effectiveSchedule.filter((_, j) => j !== i);
                          onScheduleChange?.(course.id, newSlots);
                        }}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No schedule data</p>
            )}
            {editingSchedule && onScheduleChange && (
              <AddSlotForm
                onAdd={(slot) => {
                  onScheduleChange(course.id, [...effectiveSchedule, slot]);
                }}
              />
            )}
          </div>

          {/* External links */}
          <div className="flex gap-2">
            {course.cmsUrl && (
              <a
                href={course.cmsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
              >
                View on CMS
              </a>
            )}
            {course.lsfUrl && (
              <a
                href={course.lsfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                View on LSF
              </a>
            )}
          </div>

          {/* Add to semester */}
          {!isPlaced && (
            <div>
              <h3 className="mb-1 text-xs font-bold uppercase text-gray-400">Add to Semester</h3>
              <div className="flex flex-wrap gap-2">
                {semesters.map(sem => (
                  <button
                    key={sem.id}
                    onClick={() => {
                      onAddToSemester(sem.id);
                      onClose();
                    }}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:border-blue-400 hover:bg-blue-50"
                  >
                    {sem.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {isPlaced && onRemoveFromPlan && (
            <button
              onClick={() => {
                onRemoveFromPlan();
                onClose();
              }}
              className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
            >
              Remove from {placedInSemester ?? 'plan'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function AddSlotForm({ onAdd }: { onAdd: (slot: TimeSlot) => void }) {
  const [day, setDay] = useState<Weekday>('Mon');
  const [start, setStart] = useState('10:15');
  const [end, setEnd] = useState('11:45');
  const [room, setRoom] = useState('');
  const [type, setType] = useState<'lecture' | 'tutorial' | 'seminar'>('lecture');

  const handleAdd = () => {
    onAdd({
      day,
      start,
      end,
      room: room || undefined,
      type,
    });
    setRoom('');
  };

  return (
    <div className="mt-2 rounded border border-gray-200 bg-gray-50 p-2">
      <div className="flex flex-wrap gap-2">
        <select
          value={day}
          onChange={(e) => setDay(e.target.value as Weekday)}
          className="rounded border px-1.5 py-1 text-xs"
        >
          {WEEKDAYS.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <input
          type="time"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="rounded border px-1.5 py-1 text-xs"
        />
        <span className="text-xs text-gray-400 self-center">–</span>
        <input
          type="time"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="rounded border px-1.5 py-1 text-xs"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as 'lecture' | 'tutorial' | 'seminar')}
          className="rounded border px-1.5 py-1 text-xs"
        >
          <option value="lecture">Lecture</option>
          <option value="tutorial">Tutorial</option>
          <option value="seminar">Seminar</option>
        </select>
      </div>
      <div className="mt-1 flex gap-2">
        <input
          type="text"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="Room (optional)"
          className="flex-1 rounded border px-1.5 py-1 text-xs"
        />
        <button
          onClick={handleAdd}
          className="rounded bg-indigo-500 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-600"
        >
          Add
        </button>
      </div>
    </div>
  );
}
