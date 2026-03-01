import type { ExportEnvelope, StudyPlan, TimeSlot } from '../types';

const CURRENT_VERSION = 1;

export function createExportData(
  plans: StudyPlan[],
  scheduleOverrides: Record<string, TimeSlot[]>
): ExportEnvelope {
  return {
    version: CURRENT_VERSION as 1,
    exportedAt: Date.now(),
    plans,
    scheduleOverrides,
  };
}

export function downloadJSON(data: ExportEnvelope, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseImportFile(text: string): ExportEnvelope {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object') throw new Error('Invalid file format');
  if (parsed.version !== CURRENT_VERSION) throw new Error(`Unsupported version: ${parsed.version}`);
  if (!Array.isArray(parsed.plans)) throw new Error('Missing plans array');
  if (typeof parsed.scheduleOverrides !== 'object') throw new Error('Missing scheduleOverrides');
  return parsed as ExportEnvelope;
}

export function remapPlanIds(plans: StudyPlan[]): StudyPlan[] {
  return plans.map(plan => ({
    ...plan,
    id: crypto.randomUUID(),
    semesters: plan.semesters.map(sem => ({
      ...sem,
      id: crypto.randomUUID(),
    })),
  }));
}
