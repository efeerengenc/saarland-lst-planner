/**
 * Thin compatibility layer.
 * Components should use the ProgramContext (useProgram()) instead of importing from here.
 * This file exists only so the build doesn't break during migration —
 * any remaining references will be updated to use ProgramContext.
 */
import type { Course } from '../types';
import { lstProgram } from './programs/lst';

// Re-export for any legacy callers (will be removed)
export const COURSES: Course[] = lstProgram.courses;
export const CATEGORY_LABELS = lstProgram.categoryLabels;
export const CATEGORY_COLORS = lstProgram.categoryColors;

export function getCourseById(id: string): Course | undefined {
  return lstProgram.courses.find(c => c.id === id);
}

export function getCoursesByCategory(category: Course['category']): Course[] {
  return lstProgram.courses.filter(c => c.category === category);
}
