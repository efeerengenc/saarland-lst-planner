import { useMemo } from 'react';
import type { Course, GraduationProgress, ProgramConfig, Semester } from '../types';
import { calculateProgress } from '../lib/ruleEngine';

export function useGraduationProgress(
  semesters: Semester[],
  customCourses: Course[],
  program: ProgramConfig,
): GraduationProgress {
  return useMemo(
    () => calculateProgress(semesters, customCourses, program),
    [semesters, customCourses, program]
  );
}
