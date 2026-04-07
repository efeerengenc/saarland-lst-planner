import { useState } from 'react';
import type { Course, CourseCategory } from '../types';
import { useProgram } from '../context/ProgramContext';
import { CatalogCourseCard } from './CourseCard';

interface CourseCatalogProps {
  placedCourseIds: Set<string>;
  customCourses: Course[];
  onCourseClick: (course: Course) => void;
  onAddCustomCourse: (course: Course) => void;
}

export function CourseCatalog({
  placedCourseIds,
  customCourses,
  onCourseClick,
  onAddCustomCourse,
}: CourseCatalogProps) {
  const program = useProgram();
  const [search, setSearch] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(program.catalogGroups.map(g => g.label))
  );
  const [showAddForm, setShowAddForm] = useState(false);

  const allCourses = [...program.courses, ...customCourses];
  const filtered = search
    ? allCourses.filter(
        c =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.nameDE?.toLowerCase().includes(search.toLowerCase()) ||
          c.category.toLowerCase().includes(search.toLowerCase())
      )
    : allCourses;

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-3">
        <h2 className="mb-2 text-sm font-bold text-gray-700">Course Catalog</h2>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses..."
          className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-400 focus:outline-none"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {search ? (
          // Flat search results
          <div className="space-y-2">
            {filtered.map(course => (
              <CatalogCourseCard
                key={course.id}
                course={course}
                isPlaced={placedCourseIds.has(course.id)}
                onClick={() => onCourseClick(course)}
              />
            ))}
            {filtered.length === 0 && (
              <p className="py-4 text-center text-xs text-gray-400">No courses found</p>
            )}
          </div>
        ) : (
          // Grouped view
          program.catalogGroups.map(group => {
            const courses = filtered.filter(c => group.categories.includes(c.category));
            if (courses.length === 0) return null;
            const isExpanded = expandedGroups.has(group.label);

            return (
              <div key={group.label} className="mb-2">
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="flex w-full items-center gap-1 rounded px-2 py-1.5 text-left text-xs font-bold text-gray-500 uppercase hover:bg-gray-100"
                >
                  <span className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                    &#9654;
                  </span>
                  {group.label}
                  <span className="ml-auto font-normal text-gray-400">
                    {courses.filter(c => placedCourseIds.has(c.id)).length}/{courses.length}
                  </span>
                </button>
                {isExpanded && (
                  <div className="mt-1 space-y-1.5 pl-1">
                    {group.categories.includes('cs-cogpsy') && (
                      <div className="mb-1.5 rounded bg-amber-50 border border-amber-200 px-2 py-1.5 text-xs text-amber-700">
                        <strong>Note:</strong> Get approval from Stefan Thater before choosing a CS course to make sure it counts towards your LST degree.
                      </div>
                    )}
                    {courses.map(course => (
                      <CatalogCourseCard
                        key={course.id}
                        course={course}
                        isPlaced={placedCourseIds.has(course.id)}
                        onClick={() => onCourseClick(course)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Add custom course button */}
        <button
          onClick={() => setShowAddForm(true)}
          className="mt-3 w-full rounded-lg border-2 border-dashed border-gray-300 p-2 text-xs text-gray-500 hover:border-gray-400 hover:text-gray-600"
        >
          + Add Custom Course
        </button>

        {/* Data source disclaimer */}
        <div className="mt-4 rounded-lg bg-gray-50 p-2.5 text-xs text-gray-400 leading-relaxed">
          <p className="font-medium text-gray-500 mb-1">Data sources</p>
          <p>Courses from <span className="font-medium">LSF Saarland University</span> (WiSe 25/26 + SoSe 26).</p>
          <p className="mt-1 text-amber-500">Some courses may be inaccurate. Use &ldquo;Add Custom Course&rdquo; to add or correct them.</p>
        </div>
      </div>

      {showAddForm && (
        <AddCustomCourseForm
          onAdd={(course) => {
            onAddCustomCourse(course);
            setShowAddForm(false);
          }}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
}

function AddCustomCourseForm({
  onAdd,
  onClose,
}: {
  onAdd: (course: Course) => void;
  onClose: () => void;
}) {
  const program = useProgram();
  const defaultCategory = Object.keys(program.categoryLabels)[0] ?? 'other';
  const [name, setName] = useState('');
  const [cp, setCp] = useState(6);
  const [category, setCategory] = useState<CourseCategory>(defaultCategory);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      id: `custom-${crypto.randomUUID()}`,
      name: name.trim(),
      cp,
      category,
      graded: true,
      offeredIn: ['WS', 'SS'],
      isCustom: true,
    });
  };

  return (
    <div className="border-t bg-gray-50 p-3">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-600">Add Custom Course</h3>
          <button type="button" onClick={onClose} className="text-xs text-gray-400 hover:text-gray-600">
            &times;
          </button>
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Course name"
          className="w-full rounded border px-2 py-1 text-sm"
          autoFocus
        />
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-gray-500">CP</label>
            <input
              type="number"
              value={cp}
              onChange={(e) => setCp(parseInt(e.target.value) || 0)}
              min={0}
              max={30}
              className="w-full rounded border px-2 py-1 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CourseCategory)}
              className="w-full rounded border px-2 py-1 text-sm"
            >
              {Object.entries(program.categoryLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="w-full rounded bg-blue-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-600"
        >
          Add Course
        </button>
      </form>
    </div>
  );
}
