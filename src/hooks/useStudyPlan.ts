import { useCallback, useEffect, useState } from 'react';
import type { Course, StudyPlan } from '../types';

const STORAGE_KEY = 'lst-planner-plans';
const ACTIVE_PLAN_KEY = 'lst-planner-active';

function createDefaultPlan(): StudyPlan {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    name: 'My Study Plan',
    semesters: [
      { id: crypto.randomUUID(), label: 'Semester 1', type: 'WS', courses: [] },
      { id: crypto.randomUUID(), label: 'Semester 2', type: 'SS', courses: [] },
      { id: crypto.randomUUID(), label: 'Semester 3', type: 'WS', courses: [] },
      { id: crypto.randomUUID(), label: 'Semester 4', type: 'SS', courses: [] },
    ],
    customCourses: [],
    createdAt: now,
    updatedAt: now,
  };
}

function loadPlans(): StudyPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // corrupted data
  }
  return [];
}

function savePlans(plans: StudyPlan[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

function loadActivePlanId(): string | null {
  return localStorage.getItem(ACTIVE_PLAN_KEY);
}

function saveActivePlanId(id: string) {
  localStorage.setItem(ACTIVE_PLAN_KEY, id);
}

export function useStudyPlan() {
  const [plans, setPlans] = useState<StudyPlan[]>(() => {
    const loaded = loadPlans();
    if (loaded.length === 0) {
      const def = createDefaultPlan();
      savePlans([def]);
      saveActivePlanId(def.id);
      return [def];
    }
    return loaded;
  });

  const [activePlanId, setActivePlanId] = useState<string>(() => {
    const stored = loadActivePlanId();
    if (stored && plans.some(p => p.id === stored)) return stored;
    return plans[0]?.id ?? '';
  });

  const activePlan = plans.find(p => p.id === activePlanId) ?? plans[0];

  // Persist on change
  useEffect(() => {
    savePlans(plans);
  }, [plans]);

  useEffect(() => {
    saveActivePlanId(activePlanId);
  }, [activePlanId]);

  const updatePlan = useCallback((updater: (plan: StudyPlan) => StudyPlan) => {
    setPlans(prev =>
      prev.map(p =>
        p.id === activePlanId ? { ...updater(p), updatedAt: Date.now() } : p
      )
    );
  }, [activePlanId]);

  const addCourseToSemester = useCallback((semesterId: string, courseId: string) => {
    updatePlan(plan => ({
      ...plan,
      semesters: plan.semesters.map(sem =>
        sem.id === semesterId
          ? { ...sem, courses: [...sem.courses, { courseId }] }
          : sem
      ),
    }));
  }, [updatePlan]);

  const removeCourseFromSemester = useCallback((semesterId: string, courseId: string) => {
    updatePlan(plan => ({
      ...plan,
      semesters: plan.semesters.map(sem =>
        sem.id === semesterId
          ? { ...sem, courses: sem.courses.filter(c => c.courseId !== courseId) }
          : sem
      ),
    }));
  }, [updatePlan]);

  const moveCourse = useCallback((
    fromSemesterId: string,
    toSemesterId: string,
    courseId: string
  ) => {
    updatePlan(plan => {
      // Find the placed course to preserve its data (grade, etc.)
      const fromSem = plan.semesters.find(s => s.id === fromSemesterId);
      const placedCourse = fromSem?.courses.find(c => c.courseId === courseId);
      if (!placedCourse) return plan;

      return {
        ...plan,
        semesters: plan.semesters.map(sem => {
          if (sem.id === fromSemesterId) {
            // Remove from source (only first instance)
            const idx = sem.courses.findIndex(c => c.courseId === courseId);
            const newCourses = [...sem.courses];
            if (idx >= 0) newCourses.splice(idx, 1);
            return { ...sem, courses: newCourses };
          }
          if (sem.id === toSemesterId) {
            return { ...sem, courses: [...sem.courses, { ...placedCourse }] };
          }
          return sem;
        }),
      };
    });
  }, [updatePlan]);

  const updateCourseGrade = useCallback((semesterId: string, courseId: string, grade: number | undefined) => {
    updatePlan(plan => ({
      ...plan,
      semesters: plan.semesters.map(sem =>
        sem.id === semesterId
          ? {
              ...sem,
              courses: sem.courses.map(c =>
                c.courseId === courseId ? { ...c, grade } : c
              ),
            }
          : sem
      ),
    }));
  }, [updatePlan]);

  const updateCourseCp = useCallback((semesterId: string, courseId: string, cpOverride: number | undefined) => {
    updatePlan(plan => ({
      ...plan,
      semesters: plan.semesters.map(sem =>
        sem.id === semesterId
          ? {
              ...sem,
              courses: sem.courses.map(c =>
                c.courseId === courseId ? { ...c, cpOverride } : c
              ),
            }
          : sem
      ),
    }));
  }, [updatePlan]);

  const addCustomCourse = useCallback((course: Course) => {
    updatePlan(plan => ({
      ...plan,
      customCourses: [...plan.customCourses, course],
    }));
  }, [updatePlan]);

  const addSemester = useCallback(() => {
    updatePlan(plan => {
      const lastSem = plan.semesters[plan.semesters.length - 1];
      const nextType = lastSem?.type === 'WS' ? 'SS' : 'WS';
      const nextNum = plan.semesters.length + 1;
      return {
        ...plan,
        semesters: [
          ...plan.semesters,
          {
            id: crypto.randomUUID(),
            label: `Semester ${nextNum}`,
            type: nextType,
            courses: [],
          },
        ],
      };
    });
  }, [updatePlan]);

  const removeSemester = useCallback((semesterId: string) => {
    updatePlan(plan => ({
      ...plan,
      semesters: plan.semesters.filter(s => s.id !== semesterId),
    }));
  }, [updatePlan]);

  const createNewPlan = useCallback((name: string) => {
    const newPlan = { ...createDefaultPlan(), name };
    setPlans(prev => [...prev, newPlan]);
    setActivePlanId(newPlan.id);
  }, []);

  const deletePlan = useCallback((planId: string) => {
    setPlans(prev => {
      const next = prev.filter(p => p.id !== planId);
      if (next.length === 0) {
        const def = createDefaultPlan();
        saveActivePlanId(def.id);
        setActivePlanId(def.id);
        return [def];
      }
      if (planId === activePlanId) {
        saveActivePlanId(next[0].id);
        setActivePlanId(next[0].id);
      }
      return next;
    });
  }, [activePlanId]);

  const renamePlan = useCallback((name: string) => {
    updatePlan(plan => ({ ...plan, name }));
  }, [updatePlan]);

  const replacePlans = useCallback((newPlans: StudyPlan[]) => {
    setPlans(newPlans);
    setActivePlanId(newPlans[0]?.id ?? '');
  }, []);

  const mergePlans = useCallback((importedPlans: StudyPlan[]) => {
    setPlans(prev => [...prev, ...importedPlans]);
  }, []);

  // Get all course IDs currently placed in any semester
  const placedCourseIds = new Set(
    activePlan?.semesters.flatMap(s => s.courses.map(c => c.courseId)) ?? []
  );

  return {
    plans,
    activePlan: activePlan!,
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
  };
}
