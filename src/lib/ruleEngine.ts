import type {
  BucketId,
  BucketProgress,
  BucketRule,
  Course,
  GraduationProgress,
  PlacedCourse,
  Semester,
} from '../types';
import { getCourseById } from '../data/courses';

/** Resolve effective CP for a placed course (respects cpOverride from user toggle) */
function effectiveCP(entry: { course: Course; placed: PlacedCourse }): number {
  return entry.placed.cpOverride ?? entry.course.cp;
}

const BUCKET_RULES: BucketRule[] = [
  {
    id: 'basic-core',
    label: 'Basic + Core Lectures',
    minCP: 24,
    maxCP: null,
    description: 'At least 24 CP from basic and core lectures, of which at least 18 must be from core lectures.',
  },
  {
    id: 'seminars',
    label: 'Seminars',
    minCP: 14,
    maxCP: null,
    description: '14 CP from seminars (2 seminars worth 7 CP each).',
  },
  {
    id: 'cs-cogpsy',
    label: 'CS / Cognitive Psychology',
    minCP: 6,
    maxCP: 18,
    description: '6–18 CP from courses offered by CS or Cognitive Psychology.',
  },
  {
    id: 'electives',
    label: 'Mandatory Electives',
    minCP: 19,
    maxCP: 31,
    description: '19–31 CP from elective courses (advanced lectures, extra seminars, software projects, tutoring, internship).',
  },
  {
    id: 'master-seminar',
    label: "Master's Seminar",
    minCP: 12,
    maxCP: 12,
    description: "12 CP Master's Seminar (ungraded). Must be completed before the thesis.",
  },
  {
    id: 'master-thesis',
    label: "Master's Thesis",
    minCP: 30,
    maxCP: 30,
    description: "30 CP Master's Thesis (graded). Register within 1 semester of completing the Master's Seminar.",
  },
];

/**
 * Determines which bucket a course naturally belongs to based on its category.
 * Returns the primary bucket and possible alternative buckets.
 */
function getDefaultBucket(course: Course): BucketId {
  switch (course.category) {
    case 'basic':
    case 'core':
      return 'basic-core';
    case 'seminar':
      return 'seminars';
    case 'cs-cogpsy':
      return 'cs-cogpsy';
    case 'master-seminar':
      return 'master-seminar';
    case 'master-thesis':
      return 'master-thesis';
    // These go to electives
    case 'advanced':
    case 'software-project':
    case 'tutoring':
    case 'internship':
    case 'other':
      return 'electives';
  }
}

/**
 * Some courses can overflow into the electives bucket if their primary
 * bucket's minimum is already met.
 */
function canOverflowToElectives(course: Course): boolean {
  return ['basic', 'core', 'seminar', 'cs-cogpsy', 'advanced'].includes(course.category);
}

/**
 * Assign all placed courses to buckets using a greedy strategy:
 * 1. First pass: assign each course to its default bucket
 * 2. Second pass: overflow excess courses to electives if the bucket minimum is met
 */
function assignCoursesToBuckets(
  allPlaced: { course: Course; placed: PlacedCourse }[]
): Map<BucketId, { course: Course; placed: PlacedCourse }[]> {
  const bucketMap = new Map<BucketId, { course: Course; placed: PlacedCourse }[]>();

  // Initialize buckets
  for (const rule of BUCKET_RULES) {
    bucketMap.set(rule.id, []);
  }

  // Assign each course to its default (or overridden) bucket
  for (const entry of allPlaced) {
    const bucket = entry.placed.bucketOverride ?? getDefaultBucket(entry.course);
    const list = bucketMap.get(bucket);
    if (list) {
      list.push(entry);
    } else {
      // Unknown bucket, put in electives
      bucketMap.get('electives')!.push(entry);
    }
  }

  // Overflow: if a bucket exceeds its minimum and has courses that
  // can go to electives, move them there (only if electives needs more)
  const electivesRule = BUCKET_RULES.find(r => r.id === 'electives')!;
  const electivesCurrent = bucketMap.get('electives')!;
  const electivesCP = electivesCurrent.reduce((sum, e) => sum + effectiveCP(e), 0);

  if (electivesCP < electivesRule.minCP) {
    for (const rule of BUCKET_RULES) {
      if (rule.id === 'electives' || rule.id === 'master-seminar' || rule.id === 'master-thesis') continue;

      const bucketCourses = bucketMap.get(rule.id)!;
      const bucketCP = bucketCourses.reduce((sum, e) => sum + effectiveCP(e), 0);

      if (bucketCP > rule.minCP) {
        // Try to move overflow courses to electives
        // Sort by CP ascending to move smaller courses first
        const movable = bucketCourses
          .filter(e => canOverflowToElectives(e.course) && !e.placed.bucketOverride);

        for (const entry of movable) {
          const newBucketCP = bucketCourses.reduce((sum, e) => sum + effectiveCP(e), 0) - effectiveCP(entry);
          if (newBucketCP >= rule.minCP) {
            // Safe to move
            const idx = bucketCourses.indexOf(entry);
            bucketCourses.splice(idx, 1);
            electivesCurrent.push(entry);

            const newElectivesCP = electivesCurrent.reduce((sum, e) => sum + effectiveCP(e), 0);
            if (newElectivesCP >= electivesRule.minCP) break;
          }
        }
      }

      const newElectivesCP = electivesCurrent.reduce((sum, e) => sum + effectiveCP(e), 0);
      if (newElectivesCP >= electivesRule.minCP) break;
    }
  }

  return bucketMap;
}

export function calculateProgress(
  semesters: Semester[],
  customCourses: Course[]
): GraduationProgress {
  const warnings: string[] = [];

  // Collect all placed courses with their full course data
  const allPlaced: { course: Course; placed: PlacedCourse }[] = [];
  for (const sem of semesters) {
    for (const placed of sem.courses) {
      const course = getCourseById(placed.courseId) ?? customCourses.find(c => c.id === placed.courseId);
      if (course) {
        allPlaced.push({ course, placed });
      }
    }
  }

  // Assign to buckets
  const bucketMap = assignCoursesToBuckets(allPlaced);

  // Calculate progress for each bucket
  const buckets: BucketProgress[] = BUCKET_RULES.map(rule => {
    const courses = bucketMap.get(rule.id) ?? [];
    const currentCP = courses.reduce((sum, e) => sum + effectiveCP(e), 0);
    const bucketWarnings: string[] = [];

    // Check minimum
    if (currentCP < rule.minCP) {
      bucketWarnings.push(`Need ${rule.minCP - currentCP} more CP (${currentCP}/${rule.minCP}).`);
    }

    // Check maximum
    if (rule.maxCP !== null && currentCP > rule.maxCP) {
      bucketWarnings.push(`Exceeds maximum by ${currentCP - rule.maxCP} CP (${currentCP}/${rule.maxCP}).`);
    }

    // Special check: core lectures must be >= 18 CP within basic-core bucket
    if (rule.id === 'basic-core') {
      const coreCP = courses
        .filter(e => e.course.category === 'core')
        .reduce((sum, e) => sum + effectiveCP(e), 0);
      if (coreCP < 18) {
        bucketWarnings.push(`Need ${18 - coreCP} more CP from core lectures (${coreCP}/18 minimum).`);
      }
    }

    // Special check: seminars should be 7 CP seminars for the required bucket
    if (rule.id === 'seminars') {
      const sevenCPSeminars = courses.filter(e => effectiveCP(e) === 7);
      if (courses.length > 0 && sevenCPSeminars.length < 2 && currentCP < 14) {
        bucketWarnings.push('Need 2 seminars worth 7 CP each.');
      }
    }

    return {
      rule,
      currentCP,
      courses,
      satisfied: currentCP >= rule.minCP && (rule.maxCP === null || currentCP <= rule.maxCP),
      warnings: bucketWarnings,
    };
  });

  // Check basic-core special constraint separately for overall satisfaction
  const basicCoreBucket = buckets.find(b => b.rule.id === 'basic-core')!;
  const coreCP = basicCoreBucket.courses
    .filter(e => e.course.category === 'core')
    .reduce((sum, e) => sum + effectiveCP(e), 0);
  if (basicCoreBucket.satisfied && coreCP < 18) {
    basicCoreBucket.satisfied = false;
  }

  const totalCP = allPlaced.reduce((sum, e) => sum + effectiveCP(e), 0);

  // Check Master's Seminar before thesis ordering
  const masterSeminarSemIdx = semesters.findIndex(sem =>
    sem.courses.some(c => c.courseId === 'master-seminar')
  );
  const masterThesisSemIdx = semesters.findIndex(sem =>
    sem.courses.some(c => c.courseId === 'master-thesis')
  );
  if (masterSeminarSemIdx >= 0 && masterThesisSemIdx >= 0) {
    if (masterThesisSemIdx <= masterSeminarSemIdx) {
      warnings.push("Master's Thesis must come after the Master's Seminar.");
    }
    if (masterThesisSemIdx - masterSeminarSemIdx > 2) {
      warnings.push("Thesis registration should be within 1 semester of completing the Master's Seminar.");
    }
  }

  return {
    buckets,
    totalCP,
    totalRequired: 120,
    isComplete: totalCP >= 120 && buckets.every(b => b.satisfied) && warnings.length === 0,
    warnings,
  };
}

export { BUCKET_RULES };
