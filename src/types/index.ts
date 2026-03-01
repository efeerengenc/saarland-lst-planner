// Categories and buckets are now strings to support any program
export type CourseCategory = string;
export type BucketId = string;

export type SemesterType = 'WS' | 'SS';

export type Weekday = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';

export interface TimeSlot {
  day: Weekday;
  start: string; // "HH:MM" 24h format
  end: string;   // "HH:MM" 24h format
  room?: string;
  type?: 'lecture' | 'tutorial' | 'seminar';
}

export interface Course {
  id: string;
  name: string;
  nameDE?: string;
  cp: number;
  cpOptions?: number[];  // e.g. [4, 7] for seminars (4 CP = Referat only, 7 CP = Referat + Hausarbeit)
  sws?: number;
  category: CourseCategory;
  graded: boolean;
  offeredIn: SemesterType[] | readonly string[];
  instructor?: string;
  cmsUrl?: string;
  lsfUrl?: string;
  description?: string;
  assessmentType?: string;
  isCustom?: boolean;
  schedule?: TimeSlot[];
}

export interface PlacedCourse {
  courseId: string;
  grade?: number;
  cpOverride?: number;        // chosen CP when course has cpOptions (e.g. 4 or 7 for seminars)
  bucketOverride?: BucketId;
}

export interface Semester {
  id: string;
  label: string;
  type: SemesterType;
  courses: PlacedCourse[];
}

export interface StudyPlan {
  id: string;
  name: string;
  semesters: Semester[];
  customCourses: Course[];
  createdAt: number;
  updatedAt: number;
}

export interface BucketRule {
  id: BucketId;
  label: string;
  minCP: number;
  maxCP: number | null;
  description: string;
}

export interface BucketProgress {
  rule: BucketRule;
  currentCP: number;
  courses: { course: Course; placed: PlacedCourse }[];
  satisfied: boolean;
  warnings: string[];
}

export interface GraduationProgress {
  buckets: BucketProgress[];
  totalCP: number;
  totalRequired: number;
  isComplete: boolean;
  warnings: string[];
}

export interface ExportEnvelope {
  version: 1;
  exportedAt: number;
  plans: StudyPlan[];
  scheduleOverrides: Record<string, TimeSlot[]>;
}

// ═══════════════════════════════════════════
// Program config — per-program data & rules
// ═══════════════════════════════════════════

export interface ProgramConfig {
  id: string;
  name: string;             // "Language Science & Technology"
  shortName: string;        // "LST"
  courses: Course[];
  categoryLabels: Record<string, string>;
  categoryColors: Record<string, string>;
  categoryPdfColors: Record<string, { bg: [number, number, number]; text: [number, number, number]; border: [number, number, number] }>;
  catalogGroups: { label: string; categories: string[] }[];
  bucketRules: BucketRule[];
  categoryToBucket: Record<string, string>;   // category → default bucket id
  overflowCategories: string[];               // categories that can overflow to electives
  electivesBucket: string;                    // which bucket is "electives"
  totalRequired: number;
  storagePrefix: string;                      // localStorage key prefix
  specialChecks?: (buckets: BucketProgress[], allPlaced: { course: Course; placed: PlacedCourse }[]) => void;
}
