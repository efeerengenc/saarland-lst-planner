import { useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import type { Course } from './types';
import { useStudyPlan } from './hooks/useStudyPlan';
import { useGraduationProgress } from './hooks/useGraduationProgress';
import { useScheduleOverrides } from './hooks/useScheduleOverrides';
import { getCourseById } from './data/courses';
import { CourseCatalog } from './components/CourseCatalog';
import { SemesterColumn } from './components/SemesterColumn';
import { ProgressTracker } from './components/ProgressTracker';
import { CourseDetail } from './components/CourseDetail';
import { CourseCard } from './components/CourseCard';
import { SchedulePlanner } from './components/SchedulePlanner';
import { createExportData, downloadJSON, parseImportFile, remapPlanIds } from './lib/exportImport';

type ViewMode = 'planner' | 'schedule';

export default function App() {
  const {
    plans,
    activePlan,
    activePlanId,
    setActivePlanId,
    placedCourseIds,
    addCourseToSemester,
    removeCourseFromSemester,
    moveCourse,
    updateCourseGrade,
    updateCourseCp,
    addCustomCourse,
    addSemester,
    removeSemester,
    createNewPlan,
    deletePlan,
    renamePlan,
    replacePlans,
    mergePlans,
  } = useStudyPlan();

  const progress = useGraduationProgress(activePlan.semesters, activePlan.customCourses);
  const { overrides, getSchedule, setSchedule, clearSchedule, replaceAll, mergeAll } = useScheduleOverrides();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importPending, setImportPending] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeDragCourse, setActiveDragCourse] = useState<Course | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('planner');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scheduleSemId, setScheduleSemId] = useState(activePlan.semesters[0]?.id ?? '__browse__');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragStart(event: DragStartEvent) {
    const courseId = event.active.data.current?.courseId;
    if (courseId) {
      const course = getCourseById(courseId) ?? activePlan.customCourses.find(c => c.id === courseId);
      setActiveDragCourse(course ?? null);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragCourse(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeParts = activeId.split('::');

    // Determine target semester
    let toSemId: string;
    if (over.data.current?.type === 'semester') {
      toSemId = over.data.current.semesterId;
    } else {
      const overParts = overId.split('::');
      if (overParts.length !== 3) return;
      toSemId = overParts[0];
    }

    // Drag from catalog → add to semester
    if (activeParts[0] === 'catalog' && activeParts.length >= 2) {
      const courseId = activeParts[1];
      if (!placedCourseIds.has(courseId)) {
        addCourseToSemester(toSemId, courseId);
      }
      return;
    }

    // Drag between semesters
    if (activeParts.length !== 3) return;
    const [fromSemId, courseId] = activeParts;
    if (fromSemId === toSemId) return;
    moveCourse(fromSemId, toSemId, courseId);
  }

  function handleExport() {
    const data = createExportData(plans, overrides);
    downloadJSON(data, 'lst-study-plans.json');
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        parseImportFile(text); // validate first
        setImportPending(text);
        setImportError(null);
      } catch (err) {
        setImportError(err instanceof Error ? err.message : 'Failed to read file');
        setImportPending(null);
      }
    };
    reader.readAsText(file);
    // Reset input so re-selecting same file triggers change
    e.target.value = '';
  }

  function handleImportConfirm(mode: 'replace' | 'merge') {
    if (!importPending) return;
    try {
      const data = parseImportFile(importPending);
      if (mode === 'replace') {
        replacePlans(data.plans);
        replaceAll(data.scheduleOverrides);
      } else {
        mergePlans(remapPlanIds(data.plans));
        mergeAll(data.scheduleOverrides);
      }
      setImportPending(null);
      setImportError(null);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed');
    }
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Top bar */}
      <header className="flex shrink-0 items-center justify-between border-b bg-white px-2 py-2 sm:px-4 shadow-sm gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden rounded p-1 text-gray-500 hover:bg-gray-100"
            title="Open course catalog"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-base sm:text-lg font-bold text-gray-800 truncate">LST Study Planner</h1>
          <span className="hidden sm:inline rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
            Saarland University
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
          <select
            value={activePlanId}
            onChange={(e) => setActivePlanId(e.target.value)}
            className="rounded border px-2 py-1 text-sm max-w-[140px] sm:max-w-none"
          >
            {plans.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button
            onClick={() => createNewPlan(`Plan ${plans.length + 1}`)}
            className="rounded bg-blue-500 px-2 sm:px-3 py-1 text-sm font-medium text-white hover:bg-blue-600"
          >
            <span className="sm:hidden">+</span>
            <span className="hidden sm:inline">+ New Plan</span>
          </button>
          {plans.length > 1 && (
            <button
              onClick={() => deletePlan(activePlanId)}
              className="rounded border border-red-200 px-2 py-1 text-sm text-red-500 hover:bg-red-50"
            >
              Delete
            </button>
          )}
          <div className="hidden sm:block ml-1 h-4 w-px bg-gray-300" />
          <button
            onClick={handleExport}
            className="rounded border border-gray-300 px-2 py-1 text-sm text-gray-600 hover:bg-gray-50"
            title="Export all plans as JSON"
          >
            ↓<span className="hidden sm:inline"> Export</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded border border-gray-300 px-2 py-1 text-sm text-gray-600 hover:bg-gray-50"
            title="Import plans from JSON file"
          >
            ↑<span className="hidden sm:inline"> Import</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>
      </header>

      {/* Plan name + view tabs */}
      <div className="flex shrink-0 items-center justify-between border-b bg-white px-4 py-1.5">
        <div className="flex items-center gap-2">
          {isEditingName ? (
            <input
              type="text"
              defaultValue={activePlan.name}
              autoFocus
              onBlur={(e) => {
                renamePlan(e.target.value || 'Untitled Plan');
                setIsEditingName(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  renamePlan((e.target as HTMLInputElement).value || 'Untitled Plan');
                  setIsEditingName(false);
                }
              }}
              className="rounded border px-2 py-0.5 text-sm"
            />
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              className="text-sm text-gray-500 hover:text-gray-700"
              title="Click to rename"
            >
              {activePlan.name} &#9998;
            </button>
          )}
        </div>

        <div className="flex rounded-lg border bg-gray-100 p-0.5">
          <button
            onClick={() => setViewMode('planner')}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              viewMode === 'planner'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Study Plan
          </button>
          <button
            onClick={() => setViewMode('schedule')}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              viewMode === 'schedule'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Weekly Schedule
          </button>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-3 py-2">
              <span className="text-sm font-bold text-gray-700">Course Catalog</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="h-[calc(100%-41px)] overflow-hidden">
              <CourseCatalog
                placedCourseIds={placedCourseIds}
                customCourses={activePlan.customCourses}
                onCourseClick={(course) => { setSelectedCourse(course); setSidebarOpen(false); }}
                onAddCustomCourse={addCustomCourse}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar — desktop only */}
          <div className="hidden md:block w-72 shrink-0 overflow-hidden border-r bg-white">
            <CourseCatalog
              placedCourseIds={placedCourseIds}
              customCourses={activePlan.customCourses}
              onCourseClick={setSelectedCourse}
              onAddCustomCourse={addCustomCourse}
            />
          </div>

          {/* Center content */}
          {viewMode === 'planner' ? (
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex flex-1 flex-col md:flex-row gap-3 overflow-x-auto p-3 sm:p-4">
                {activePlan.semesters.map((sem) => (
                  <SemesterColumn
                    key={sem.id}
                    semester={sem}
                    customCourses={activePlan.customCourses}
                    onRemoveCourse={(courseId) => removeCourseFromSemester(sem.id, courseId)}
                    onCourseClick={setSelectedCourse}
                    onGradeChange={(courseId, grade) => updateCourseGrade(sem.id, courseId, grade)}
                    onCpChange={(courseId, cp) => updateCourseCp(sem.id, courseId, cp)}
                    onRemoveSemester={
                      activePlan.semesters.length > 1 && sem.courses.length === 0
                        ? () => removeSemester(sem.id)
                        : undefined
                    }
                  />
                ))}

                <button
                  onClick={addSemester}
                  className="flex w-24 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-sm text-gray-400 hover:border-gray-400 hover:text-gray-500"
                >
                  + Semester
                </button>
              </div>

              <div className="shrink-0 border-t p-4 max-h-64 overflow-y-auto">
                <ProgressTracker progress={progress} />
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden">
              <SchedulePlanner
                semesters={activePlan.semesters}
                customCourses={activePlan.customCourses}
                onCourseClick={setSelectedCourse}
                scheduleOverrides={overrides}
                selectedSemId={scheduleSemId}
                onSelectedSemIdChange={setScheduleSemId}
              />
            </div>
          )}
        </div>

        <DragOverlay>
          {activeDragCourse && (
            <div className="w-56">
              <CourseCard
                course={activeDragCourse}
                draggableId="overlay"
                isDragOverlay
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Course detail modal */}
      {selectedCourse && (
        <CourseDetail
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onAddToSemester={(semId) => addCourseToSemester(semId, selectedCourse.id)}
          semesters={activePlan.semesters.map(s => ({ id: s.id, label: s.label }))}
          isPlaced={placedCourseIds.has(selectedCourse.id)}
          schedule={getSchedule(selectedCourse.id, selectedCourse.schedule)}
          onScheduleChange={setSchedule}
          onScheduleReset={clearSchedule}
          hasScheduleOverride={selectedCourse.id in overrides}
        />
      )}

      {/* Import confirmation dialog */}
      {importPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-96 mx-4 rounded-xl bg-white p-4 sm:p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-800">Import Plans</h3>
            <p className="mt-2 text-sm text-gray-600">
              How would you like to import? <strong>Replace</strong> will overwrite all existing plans.{' '}
              <strong>Merge</strong> will add the imported plans alongside your current ones.
            </p>
            {importError && (
              <p className="mt-2 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{importError}</p>
            )}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleImportConfirm('replace')}
                className="flex-1 rounded bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600"
              >
                Replace All
              </button>
              <button
                onClick={() => handleImportConfirm('merge')}
                className="flex-1 rounded bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600"
              >
                Merge
              </button>
              <button
                onClick={() => { setImportPending(null); setImportError(null); }}
                className="rounded border px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import error (no pending data) */}
      {importError && !importPending && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-red-500 px-4 py-3 text-sm text-white shadow-lg">
          <div className="flex items-center gap-2">
            <span>Import error: {importError}</span>
            <button onClick={() => setImportError(null)} className="ml-2 font-bold hover:opacity-80">×</button>
          </div>
        </div>
      )}
    </div>
  );
}
