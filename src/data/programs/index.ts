import type { ProgramConfig } from '../../types';
import { lstProgram } from './lst';
import { bioinformaticsProgram } from './bioinformatics';

export const PROGRAMS: ProgramConfig[] = [lstProgram, bioinformaticsProgram];

export const DEFAULT_PROGRAM_ID = 'lst';

export function getProgram(id: string): ProgramConfig {
  return PROGRAMS.find(p => p.id === id) ?? lstProgram;
}
