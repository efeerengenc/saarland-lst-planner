import { useCallback, useEffect, useState } from 'react';
import type { TimeSlot } from '../types';

type ScheduleOverrides = Record<string, TimeSlot[]>;

function load(storageKey: string): ScheduleOverrides {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) return JSON.parse(raw);
  } catch {
    // corrupted
  }
  return {};
}

function save(storageKey: string, data: ScheduleOverrides) {
  localStorage.setItem(storageKey, JSON.stringify(data));
}

export function useScheduleOverrides(storagePrefix: string) {
  const STORAGE_KEY = `${storagePrefix}-schedule-overrides`;

  const [overrides, setOverrides] = useState<ScheduleOverrides>(() => load(STORAGE_KEY));

  useEffect(() => {
    save(STORAGE_KEY, overrides);
  }, [STORAGE_KEY, overrides]);

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
