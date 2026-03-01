import { useCallback, useEffect, useState } from 'react';
import type { TimeSlot } from '../types';

type ScheduleOverrides = Record<string, TimeSlot[]>;

interface TaggedOverrides {
  owner: string;
  data: ScheduleOverrides;
}

function load(storageKey: string, expectedOwner: string): ScheduleOverrides {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw);

    // Tagged format: { owner, data }
    if (parsed && typeof parsed === 'object' && 'owner' in parsed) {
      if (parsed.owner !== expectedOwner) {
        console.warn(`[StudyPlanner] Clearing corrupted schedule overrides in ${storageKey}: owned by "${parsed.owner}", expected "${expectedOwner}"`);
        localStorage.removeItem(storageKey);
        return {};
      }
      return parsed.data ?? {};
    }

    // Legacy format: bare object (backward-compatible)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }

    return {};
  } catch {
    return {};
  }
}

function save(storageKey: string, owner: string, data: ScheduleOverrides) {
  const tagged: TaggedOverrides = { owner, data };
  localStorage.setItem(storageKey, JSON.stringify(tagged));
}

export function useScheduleOverrides(storagePrefix: string) {
  const STORAGE_KEY = `${storagePrefix}-schedule-overrides`;

  const [overrides, setOverrides] = useState<ScheduleOverrides>(() => load(STORAGE_KEY, storagePrefix));

  useEffect(() => {
    save(STORAGE_KEY, storagePrefix, overrides);
  }, [STORAGE_KEY, storagePrefix, overrides]);

  const getSchedule = useCallback((courseId: string, defaultSchedule?: TimeSlot[]): TimeSlot[] | undefined => {
    if (courseId in overrides) return overrides[courseId];
    return defaultSchedule;
  }, [overrides]);

  const setSchedule = useCallback((courseId: string, slots: TimeSlot[]) => {
    setOverrides(prev => ({ ...prev, [courseId]: slots }));
  }, []);

  const clearSchedule = useCallback((courseId: string) => {
    setOverrides(prev => {
      const next = { ...prev };
      delete next[courseId];
      return next;
    });
  }, []);

  const replaceAll = useCallback((newOverrides: ScheduleOverrides) => {
    setOverrides(newOverrides);
  }, []);

  const mergeAll = useCallback((imported: ScheduleOverrides) => {
    setOverrides(prev => ({ ...prev, ...imported }));
  }, []);

  return { overrides, getSchedule, setSchedule, clearSchedule, replaceAll, mergeAll };
}
