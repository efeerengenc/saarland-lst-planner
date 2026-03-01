import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Course, Semester } from '../types';
import { useProgram } from '../context/ProgramContext';
import { CourseCard } from './CourseCard';

interface SemesterColumnProps {
  semester: Semester;
  customCourses: Course[];
  onRemoveCourse: (courseId: string) => void;
  onCourseClick: (course: Course) => void;
  onGradeChange: (courseId: string, grade: number | undefined) => void;
  onCpChange: (courseId: string, cp: number | undefined) => void;
  onRemoveSemester?: () => void;
}

export function SemesterColumn({
  semester,
  customCourses,
  onRemoveCourse,
  onCourseClick,
  onGradeChange,
  onCpChange,
  onRemoveSemester,
}: SemesterColumnProps) {
  const program = useProgram();
  const { setNodeRef, isOver } = useDroppable({
    id: semester.id,
    data: { type: 'semester', semesterId: semester.id },
  });

  const coursesWithData = semester.courses.map(pc => ({
    placed: pc,
    course: program.courses.find(c => c.id === pc.courseId) ?? customCourses.find(c => c.id === pc.courseId),
  }));

  const totalCP = coursesWithData.reduce((sum, { placed, course }) => sum + (placed.cpOverride ?? course?.cp ?? 0), 0);

  // Check for semester type mismatches
  const mismatches = coursesWithData.filter(
    ({ course }) => course && !course.offeredIn.includes(semester.type)
  );

  const sortableIds = semester.courses.map(
    (pc, i) => `${semester.id}::${pc.courseId}::${i}`
  );

  return (
    <div
      ref={setNodeRef}
      className={`flex w-full md:w-64 shrink-0 flex-col rounded-xl border-2 bg-white transition-colors ${
        isOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">{semester.label}</h3>
          <span className="text-xs text-gray-400">{semester.type}</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-bold ${
              totalCP >= 28 && totalCP <= 32
                ? 'bg-green-100 text-green-700'
                : totalCP > 0
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-gray-100 text-gray-500'
            }`}
          >
            {totalCP} CP
          </span>
          {onRemoveSemester && (
            <button
              onClick={onRemoveSemester}
              className="text-xs text-gray-300 hover:text-red-500"
              title="Remove semester"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Semester mismatch warning */}
      {mismatches.length > 0 && (
        <div className="mx-2 mt-2 rounded bg-amber-50 px-2 py-1 text-xs text-amber-700">
          {mismatches.map(({ course }) => course!.name).join(', ')} typically not offered in {semester.type}
        </div>
      )}

      {/* Course list */}
      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2" style={{ minHeight: 120 }}>
          {semester.courses.length === 0 && (
            <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-xs text-gray-400">
              Drop courses here
            </div>
          )}
          {coursesWithData.map(({ placed: pc, course }, i) => {
            if (!course) return null;
            const mismatch = !course.offeredIn.includes(semester.type);
            return (
              <div key={`${pc.courseId}-${i}`} className={mismatch ? 'ring-2 ring-amber-300 rounded-lg' : ''}>
                <CourseCard
                  course={course}
                  draggableId={`${semester.id}::${pc.courseId}::${i}`}
                  grade={pc.grade}
                  cpOverride={pc.cpOverride}
                  onRemove={() => onRemoveCourse(pc.courseId)}
                  onClick={() => onCourseClick(course)}
                  onGradeChange={(g) => onGradeChange(pc.courseId, g)}
                  onCpChange={(cp) => onCpChange(pc.courseId, cp)}
                  compact
                />
              </div>
            );
          })}
        </div>
      </SortableContext>
    </div>
  );
}
