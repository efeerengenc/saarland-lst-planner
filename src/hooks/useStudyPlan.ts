import { useCallback, useEffect, useState } from 'react';
import type { Course, StudyPlan } from '../types';

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

/**
 * Tagged storage format. The `owner` field is the storagePrefix of the program
 * that owns this data. If a different program's data is found, it's treated as
 * corrupted (from a bug in an earlier version) and cleared.
 */
interface TaggedPlans {
  owner: string;
  plans: StudyPlan[];
}

function loadPlans(storageKey: string, expectedOwner: string): StudyPlan[] {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);

    // New tagged format: { owner, plans }
    if (parsed && typeof parsed === 'object' && 'owner' in parsed) {
      if (parsed.owner !== expectedOwner) {
        // Data belongs to another program — corrupted by a previous bug. Clear it.
        console.warn(`[StudyPlanner] Clearing corrupted data in ${storageKey}: owned by "${parsed.owner}", expected "${expectedOwner}"`);
        localStorage.removeItem(storageKey);
        return [];
      }
      return parsed.plans ?? [];
    }

    // Legacy format: bare array (backward-compatible for pre-tagged data)
    if (Array.isArray(parsed)) return parsed;

    return [];
  } catch {
    // corrupted JSON
    return [];
  }
}

function savePlans(storageKey: string, owner: string, plans: StudyPlan[]) {
  const tagged: TaggedPlans = { owner, plans };
  localStorage.setItem(storageKey, JSON.stringify(tagged));
}

function loadActivePlanId(activeKey: string): string | null {
  return localStorage.getItem(activeKey);
}

function saveActivePlanId(activeKey: string, id: string) {
  localStorage.setItem(activeKey, id);
}

export function useStudyPlan(storagePrefix: string) {
  const STORAGE_KEY = `${storagePrefix}-plans`;
  const ACTIVE_PLAN_KEY = `${storagePrefix}-active`;

  const [plans, setPlans] = useState<StudyPlan[]>(() => {
    const loaded = loadPlans(STORAGE_KEY, storagePrefix);
    if (loaded.length === 0) {
      const def = createDefaultPlan();
      savePlans(STORAGE_KEY, storagePrefix, [def]);
      saveActivePlanId(ACTIVE_PLAN_KEY, def.id);
      return [def];
    }
    return loaded;
  });

  const [activePlanId, setActivePlanId] = useState<string>(() => {
    const stored = loadActivePlanId(ACTIVE_PLAN_KEY);
    if (stored && plans.some(p => p.id === stored)) return stored;
    return plans[0]?.id ?? '';
  });

  const activePlan = plans.find(p => p.id === activePlanId) ?? plans[0];

  // Persist on change — always tag with the owning program
  useEffect(() => {
    savePlans(STORAGE_KEY, storagePrefix, plans);
  }, [STORAGE_KEY, storagePrefix, plans]);

  useEffect(() => {
    saveActivePlanId(ACTIVE_PLAN_KEY, activePlanId);
  }, [ACTIVE_PLAN_KEY, activePlanId]);

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
      const fromSem = plan.semesters.find(s => s.id === fromSemesterId);
      const placedCourse = fromSem?.courses.find(c => c.courseId === courseId);
      if (!placedCourse) return plan;

      return {
        ...plan,
        semesters: plan.semesters.map(sem => {
          if (sem.id === fromSemesterId) {
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
        saveActivePlanId(ACTIVE_PLAN_KEY, def.id);
        setActivePlanId(def.id);
        return [def];
      }
      if (planId === activePlanId) {
        saveActivePlanId(ACTIVE_PLAN_KEY, next[0].id);
        setActivePlanId(next[0].id);
      }
      return next;
    });
  }, [ACTIVE_PLAN_KEY, activePlanId]);

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
