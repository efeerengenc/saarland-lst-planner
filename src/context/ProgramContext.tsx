import { createContext, useContext } from 'react';
import type { ProgramConfig, Course } from '../types';

// Will be initialized with actual program in App.tsx
const ProgramContext = createContext<ProgramConfig>(null as unknown as ProgramConfig);

export const ProgramProvider = ProgramContext.Provider;

export function useProgram(): ProgramConfig {
  return useContext(ProgramContext);
}

/** Look up a course by id within a program's catalog + custom courses */
export function findCourse(program: ProgramConfig, customCourses: Course[], courseId: string): Course | undefined {
  return program.courses.find(c => c.id === courseId) ?? customCourses.find(c => c.id === courseId);
}
