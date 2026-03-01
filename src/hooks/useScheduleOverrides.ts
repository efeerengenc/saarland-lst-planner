import { useCallback, useEffect, useState } from 'react';
import type { TimeSlot } from '../types';

const STORAGE_KEY = 'lst-planner-schedule-overrides';

type ScheduleOverrides = Record<string, TimeSlot[]>;

function load(): ScheduleOverrides {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // corrupted
  }
  return {};
}

function save(data: ScheduleOverrides) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useScheduleOverrides() {
  const [overrides, setOverrides] = useState<ScheduleOverrides>(load);

  useEffect(() => {
    save(overrides);
  }, [overrides]);

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
