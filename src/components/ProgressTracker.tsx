import type { GraduationProgress } from '../types';

interface ProgressTrackerProps {
  progress: GraduationProgress;
}

export function ProgressTracker({ progress }: ProgressTrackerProps) {
  return (
    <div className="rounded-xl border-2 border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-700">Graduation Progress</h2>
        <span
          className={`rounded-full px-3 py-1 text-sm font-bold ${
            progress.isComplete
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {progress.totalCP} / {progress.totalRequired} CP
        </span>
      </div>

      <div className="space-y-3">
        {progress.buckets.map((bucket) => {
          const pct = bucket.rule.maxCP
            ? Math.min(100, (bucket.currentCP / bucket.rule.maxCP) * 100)
            : Math.min(100, (bucket.currentCP / bucket.rule.minCP) * 100);

          const overMax = bucket.rule.maxCP !== null && bucket.currentCP > bucket.rule.maxCP;

          return (
            <div key={bucket.rule.id}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600">
                  {bucket.rule.label}
                </span>
                <span className="text-xs text-gray-500">
                  {bucket.currentCP} / {bucket.rule.minCP}
                  {bucket.rule.maxCP !== null && bucket.rule.maxCP !== bucket.rule.minCP
                    ? `–${bucket.rule.maxCP}`
                    : ''}{' '}
                  CP
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-100">
                <div
                  className={`h-2 rounded-full transition-all ${
                    overMax
                      ? 'bg-red-400'
                      : bucket.satisfied
                        ? 'bg-green-400'
                        : bucket.currentCP > 0
                          ? 'bg-amber-400'
                          : 'bg-gray-200'
                  }`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
              {bucket.warnings.length > 0 && (
                <div className="mt-0.5">
                  {bucket.warnings.map((w, i) => (
                    <p key={i} className="text-xs text-amber-600">{w}</p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* GPA */}
      <GpaDisplay buckets={progress.buckets} />

      {/* Global warnings */}
      {progress.warnings.length > 0 && (
        <div className="mt-3 rounded-lg bg-red-50 p-2">
          {progress.warnings.map((w, i) => (
            <p key={i} className="text-xs text-red-600">{w}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function GpaDisplay({ buckets }: { buckets: GraduationProgress['buckets'] }) {
  const gradedCourses = buckets
    .flatMap(b => b.courses)
    .filter(e => e.course.graded && e.placed.grade !== undefined);

  if (gradedCourses.length === 0) return null;

  const getCP = (e: { course: { cp: number }; placed: { cpOverride?: number } }) =>
    e.placed.cpOverride ?? e.course.cp;

  const totalWeightedGrade = gradedCourses.reduce(
    (sum, e) => sum + (e.placed.grade! * getCP(e)),
    0
  );
  const totalCP = gradedCourses.reduce((sum, e) => sum + getCP(e), 0);
  const gpa = totalWeightedGrade / totalCP;

  return (
    <div className="mt-3 flex items-center justify-between border-t pt-3">
      <span className="text-xs font-medium text-gray-600">
        Weighted Average ({gradedCourses.length} graded)
      </span>
      <span
        className={`rounded-full px-2 py-0.5 text-sm font-bold ${
          gpa <= 1.5
            ? 'bg-green-100 text-green-700'
            : gpa <= 2.5
              ? 'bg-amber-100 text-amber-700'
              : 'bg-red-100 text-red-700'
        }`}
      >
        {gpa.toFixed(2)}
      </span>
    </div>
  );
}
