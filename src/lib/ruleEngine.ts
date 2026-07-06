import type {
  BucketId,
  BucketProgress,
  BucketRule,
  Course,
  GraduationProgress,
  PlacedCourse,
  ProgramConfig,
  Semester,
} from '../types';

/** Resolve effective CP for a placed course (respects cpOverride from user toggle) */
function effectiveCP(entry: { course: Course; placed: PlacedCourse }): number {
  return entry.placed.cpOverride ?? entry.course.cp;
}

/**
 * Assign all placed courses to buckets using a greedy strategy:
 * 1. First pass: assign each course to its default bucket
 * 2. Second pass: overflow excess courses to electives if the bucket minimum is met
 */
function assignCoursesToBuckets(
  allPlaced: { course: Course; placed: PlacedCourse }[],
  program: ProgramConfig,
): Map<BucketId, { course: Course; placed: PlacedCourse }[]> {
  const bucketMap = new Map<BucketId, { course: Course; placed: PlacedCourse }[]>();

  // Initialize buckets
  for (const rule of program.bucketRules) {
    bucketMap.set(rule.id, []);
  }

  // Assign each course to its default (or overridden) bucket
  for (const entry of allPlaced) {
    const bucket = entry.placed.bucketOverride ?? program.categoryToBucket[entry.course.category] ?? program.electivesBucket;
    const list = bucketMap.get(bucket);
    if (list) {
      list.push(entry);
    } else {
      // Unknown bucket, put in electives
      bucketMap.get(program.electivesBucket)!.push(entry);
    }
  }

  // Overflow: if a bucket exceeds its minimum and has courses that
  // can go to electives, move them there (only if electives needs more)
  const electivesRule = program.bucketRules.find(r => r.id === program.electivesBucket);
  if (!electivesRule) return bucketMap;

  const electivesCurrent = bucketMap.get(program.electivesBucket)!;

  // Pass 1: relieve buckets that exceed their maximum by moving eligible
  // courses to electives (e.g. a 3rd seminar counts as a mandatory elective),
  // as long as the source bucket stays at its minimum and electives has room.
  for (const rule of program.bucketRules) {
    if (rule.id === program.electivesBucket || rule.maxCP === null) continue;

    const bucketCourses = bucketMap.get(rule.id)!;
    const movable = bucketCourses
      .filter(e => program.overflowCategories.includes(e.course.category) && !e.placed.bucketOverride);

    for (const entry of movable) {
      const bucketCP = bucketCourses.reduce((sum, e) => sum + effectiveCP(e), 0);
      if (bucketCP <= rule.maxCP) break;

      const electivesCP = electivesCurrent.reduce((sum, e) => sum + effectiveCP(e), 0);
      const fitsElectives = electivesRule.maxCP === null || electivesCP + effectiveCP(entry) <= electivesRule.maxCP;
      if (bucketCP - effectiveCP(entry) >= rule.minCP && fitsElectives) {
        const idx = bucketCourses.indexOf(entry);
        bucketCourses.splice(idx, 1);
        electivesCurrent.push(entry);
      }
    }
  }

  // Pass 2: if electives is still below its minimum, pull surplus courses
  // from buckets that exceed their own minimum.
  const electivesCP = electivesCurrent.reduce((sum, e) => sum + effectiveCP(e), 0);

  if (electivesCP < electivesRule.minCP) {
    for (const rule of program.bucketRules) {
      if (rule.id === program.electivesBucket || rule.id === 'master-seminar' || rule.id === 'master-thesis') continue;

      const bucketCourses = bucketMap.get(rule.id)!;
      const bucketCP = bucketCourses.reduce((sum, e) => sum + effectiveCP(e), 0);

      if (bucketCP > rule.minCP) {
        // Try to move overflow courses to electives
        const movable = bucketCourses
          .filter(e => program.overflowCategories.includes(e.course.category) && !e.placed.bucketOverride);

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
  customCourses: Course[],
  program: ProgramConfig,
): GraduationProgress {
  const warnings: string[] = [];

  // Collect all placed courses with their full course data
  const allPlaced: { course: Course; placed: PlacedCourse }[] = [];
  for (const sem of semesters) {
    for (const placed of sem.courses) {
      const course = program.courses.find(c => c.id === placed.courseId) ?? customCourses.find(c => c.id === placed.courseId);
      if (course) {
        allPlaced.push({ course, placed });
      }
    }
  }

  // Assign to buckets
  const bucketMap = assignCoursesToBuckets(allPlaced, program);

  // Calculate progress for each bucket
  const buckets: BucketProgress[] = program.bucketRules.map((rule: BucketRule) => {
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

    return {
      rule,
      currentCP,
      courses,
      satisfied: currentCP >= rule.minCP && (rule.maxCP === null || currentCP <= rule.maxCP),
      warnings: bucketWarnings,
    };
  });

  // Run program-specific checks
  if (program.specialChecks) {
    program.specialChecks(buckets, allPlaced);
  }

  const totalCP = allPlaced.reduce((sum, e) => sum + effectiveCP(e), 0);

  // Check Master's Seminar before thesis ordering
  const masterSeminarSemIdx = semesters.findIndex(sem =>
    sem.courses.some(c => {
      const course = program.courses.find(cc => cc.id === c.courseId);
      return course?.category === 'master-seminar';
    })
  );
  const masterThesisSemIdx = semesters.findIndex(sem =>
    sem.courses.some(c => {
      const course = program.courses.find(cc => cc.id === c.courseId);
      return course?.category === 'master-thesis';
    })
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
    totalRequired: program.totalRequired,
    isComplete: totalCP >= program.totalRequired && buckets.every(b => b.satisfied) && warnings.length === 0,
    warnings,
  };
}
