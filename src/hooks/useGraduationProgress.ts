import { useMemo } from 'react';
import type { Course, GraduationProgress, Semester } from '../types';
import { calculateProgress } from '../lib/ruleEngine';

export function useGraduationProgress(
  semesters: Semester[],
  customCourses: Course[]
): GraduationProgress {
  return useMemo(
    () => calculateProgress(semesters, customCourses),
    [semesters, customCourses]
  );
}
