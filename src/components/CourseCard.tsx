import { useDraggable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Course } from '../types';
import { CATEGORY_COLORS } from '../data/courses';

interface CourseCardProps {
  course: Course;
  draggableId: string;
  grade?: number;
  cpOverride?: number;
  onRemove?: () => void;
  onClick?: () => void;
  onGradeChange?: (grade: number | undefined) => void;
  onCpChange?: (cp: number | undefined) => void;
  compact?: boolean;
  isDragOverlay?: boolean;
}

export function CourseCard({
  course,
  draggableId,
  grade,
  cpOverride,
  onRemove,
  onClick,
  onGradeChange,
  onCpChange,
  compact = false,
  isDragOverlay = false,
}: CourseCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: draggableId,
    data: { type: 'course', courseId: course.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const colors = CATEGORY_COLORS[course.category] ?? CATEGORY_COLORS['other'];

  const displayCP = cpOverride ?? course.cp;

  if (isDragOverlay) {
    return (
      <div className={`rounded-lg border-2 p-2 shadow-lg ${colors} cursor-grabbing`}>
        <div className="flex items-start justify-between gap-1">
          <span className="text-sm font-medium leading-tight">{course.name}</span>
          <span className="shrink-0 rounded bg-white/50 px-1.5 py-0.5 text-xs font-bold">
            {displayCP} CP
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group rounded-lg border-2 ${colors} ${
        compact ? 'p-1.5' : 'p-2'
      } transition-shadow hover:shadow-md ${
        isDragging ? 'shadow-lg ring-2 ring-blue-400' : ''
      }`}
    >
      <div className="flex items-start gap-1" {...attributes} {...listeners}>
        <div className="flex-1 cursor-grab active:cursor-grabbing" onClick={onClick}>
          <div className="flex items-start justify-between gap-1">
            <span className={`font-medium leading-tight ${compact ? 'text-xs' : 'text-sm'}`}>
              {course.name}
            </span>
            {course.cpOptions && onCpChange ? (
              <CpToggle
                options={course.cpOptions}
                value={displayCP}
                onChange={onCpChange}
              />
            ) : (
              <span className="shrink-0 rounded bg-white/50 px-1.5 py-0.5 text-xs font-bold">
                {displayCP} CP
              </span>
            )}
          </div>
          {!compact && course.instructor && (
            <div className="mt-0.5 text-xs opacity-70">{course.instructor}</div>
          )}
        </div>
      </div>
      <div className="mt-1 flex items-center gap-1">
        {onGradeChange && course.graded && (
          <input
            type="number"
            min="1.0"
            max="4.0"
            step="0.1"
            value={grade ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              onGradeChange(v ? parseFloat(v) : undefined);
            }}
            placeholder="Grade"
            className="w-16 rounded border bg-white/70 px-1 py-0.5 text-xs"
            onClick={(e) => e.stopPropagation()}
          />
        )}
        {!course.graded && (
          <span className="rounded bg-white/40 px-1 py-0.5 text-xs italic">ungraded</span>
        )}
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="ml-auto rounded px-1 py-0.5 text-xs text-red-400 transition-opacity hover:bg-red-200 hover:text-red-600 opacity-0 group-hover:opacity-100"
            title="Remove from semester"
          >
            &times;
          </button>
        )}
      </div>
    </div>
  );
}

/** Toggle between CP options (e.g. 4/7 for seminars) */
function CpToggle({
  options,
  value,
  onChange,
}: {
  options: number[];
  value: number;
  onChange: (cp: number | undefined) => void;
}) {
  return (
    <div
      className="flex shrink-0 items-center rounded bg-white/60 text-xs font-bold"
      onClick={(e) => e.stopPropagation()}
    >
      {options.map((opt) => (
        <button
          key={opt}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onChange(opt);
          }}
          className={`px-1.5 py-0.5 transition-colors first:rounded-l last:rounded-r ${
            value === opt
              ? 'bg-white/90 text-gray-900 shadow-sm'
              : 'text-gray-400 hover:text-gray-600'
          }`}
          title={opt === 4 ? 'Referat only (4 CP)' : 'Referat + Hausarbeit (7 CP)'}
        >
          {opt}
        </button>
      ))}
      <span className="px-0.5 text-gray-400">CP</span>
    </div>
  );
}

/** Draggable card for the catalog sidebar */
export function CatalogCourseCard({
  course,
  isPlaced,
  onClick,
}: {
  course: Course;
  isPlaced: boolean;
  onClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `catalog::${course.id}`,
    data: { type: 'course', courseId: course.id },
    disabled: isPlaced,
  });

  const colors = CATEGORY_COLORS[course.category] ?? CATEGORY_COLORS['other'];

  const style = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`w-full rounded-lg border-2 p-2 text-left transition-all ${colors} ${
        isPlaced ? 'opacity-40' : 'cursor-grab active:cursor-grabbing hover:shadow-md hover:-translate-y-0.5'
      }`}
    >
      <div className="flex items-start justify-between gap-1">
        <span className="text-sm font-medium leading-tight">{course.name}</span>
        <span className="shrink-0 rounded bg-white/50 px-1.5 py-0.5 text-xs font-bold">
          {course.cpOptions ? `${course.cpOptions.join('/')}` : course.cp} CP
        </span>
      </div>
      {course.instructor && (
        <div className="mt-0.5 text-xs opacity-70">{course.instructor}</div>
      )}
      {course.schedule && course.schedule.length > 0 && (
        <div className="mt-0.5 space-y-0.5">
          {course.schedule.map((slot, i) => (
            <div key={i} className="text-xs opacity-60">
              {slot.day} {slot.start}–{slot.end}{slot.room ? ` · ${slot.room}` : ''}
            </div>
          ))}
        </div>
      )}
      <div className="mt-1 flex gap-1">
        {course.offeredIn.map(s => (
          <span key={s} className="rounded bg-white/40 px-1 py-0.5 text-xs">{s}</span>
        ))}
        {isPlaced && <span className="text-xs italic">placed</span>}
      </div>
    </div>
  );
}
