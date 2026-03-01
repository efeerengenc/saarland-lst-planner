import type { BucketProgress, Course, ProgramConfig } from '../../types';

// ═══════════════════════════════════════════════════════════════════
// BIOINFORMATICS M.Sc. — Course Catalog
// Data from LSF Saarland University (WiSe 2025/26 + SoSe 2026)
// Program structure from Studienordnung 21 January 2016
// ═══════════════════════════════════════════════════════════════════

export const BIOINFO_COURSES: Course[] = [
  // ─────────────────────────────────────────────
  // CORE CS LECTURES (category: 'core-cs')
  // ─────────────────────────────────────────────
  {
    id: 'bioinfo-im1',
    name: 'Algorithms and Data Structures',
    cp: 9,
    category: 'core-cs',
    instructor: 'Prof. Dr. Danupon Na Nongkai',
    graded: true,
    offeredIn: ['SS'],
    schedule: [
      { day: 'Mon', start: '16:00', end: '18:00', room: 'E2 5 Hörsaal I' },
      { day: 'Thu', start: '16:00', end: '18:00', room: 'E2 2 Hörsaal 0.01' },
    ],
  },
  {
    id: 'bioinfo-im2',
    name: 'Computer Graphics',
    cp: 9,
    category: 'core-cs',
    instructor: 'Prof. Dr. Philipp Slusallek',
    graded: true,
    offeredIn: ['WS'],
    schedule: [
      { day: 'Mon', start: '10:00', end: '12:00', room: 'E1 3 Hörsaal I' },
      { day: 'Thu', start: '08:00', end: '10:00', room: 'E1 3 Hörsaal I' },
    ],
  },
  {
    id: 'bioinfo-im4',
    name: 'Introduction to Computational Logic',
    cp: 9,
    category: 'core-cs',
    instructor: 'Prof. Dr. Gert Smolka',
    graded: true,
    offeredIn: ['SS'],
    schedule: [
      { day: 'Wed', start: '12:00', end: '14:00', room: 'E1 3 Hörsaal I' },
      { day: 'Fri', start: '12:00', end: '14:00', room: 'E1 3 Hörsaal I' },
    ],
  },
  {
    id: 'bioinfo-im5',
    name: 'Image Processing and Computer Vision',
    cp: 9,
    category: 'core-cs',
    instructor: 'Prof. Dr. Joachim Weickert',
    graded: true,
    offeredIn: ['SS'],
    schedule: [
      { day: 'Tue', start: '10:00', end: '12:00', room: 'Online' },
      { day: 'Fri', start: '10:00', end: '12:00', room: 'Online' },
    ],
  },
  {
    id: 'bioinfo-im6',
    name: 'Discrete Optimization',
    cp: 9,
    category: 'core-cs',
    instructor: 'Prof. Dr. Andreas Karrenbauer',
    graded: true,
    offeredIn: ['SS'],
    schedule: [
      { day: 'Wed', start: '14:00', end: '16:00', room: '' },
      { day: 'Thu', start: '14:00', end: '16:00', room: '' },
    ],
  },
  {
    id: 'bioinfo-im7',
    name: 'Machine Learning',
    cp: 9,
    category: 'core-cs',
    instructor: 'Prof. Dr. Maria Isabel Valera Martinez',
    graded: true,
    offeredIn: ['SS'],
    schedule: [
      { day: 'Mon', start: '14:00', end: '16:00', room: 'E2 2 Hörsaal 0.01' },
      { day: 'Thu', start: '12:00', end: '14:00', room: 'E2 2 Hörsaal 0.01' },
    ],
  },
  {
    id: 'bioinfo-im8',
    name: 'Data Networks',
    cp: 9,
    category: 'core-cs',
    instructor: 'Prof. Dr. Anja Feldmann',
    graded: true,
    offeredIn: ['SS'],
    schedule: [
      { day: 'Tue', start: '14:00', end: '16:00', room: 'E1 3 Hörsaal II' },
      { day: 'Fri', start: '14:00', end: '16:00', room: 'E1 3 Hörsaal II' },
    ],
  },
  {
    id: 'bioinfo-im9',
    name: 'Artificial Intelligence',
    cp: 9,
    category: 'core-cs',
    instructor: 'Prof. Dr. Jörg Hoffmann',
    graded: true,
    offeredIn: ['WS'],
    schedule: [
      { day: 'Tue', start: '14:00', end: '16:00', room: 'E1 3 Hörsaal II' },
      { day: 'Thu', start: '10:00', end: '12:00', room: 'E1 3 Hörsaal II' },
    ],
  },
  {
    id: 'bioinfo-im10',
    name: 'Software Engineering',
    cp: 9,
    category: 'core-cs',
    instructor: 'Prof. Dr. Sven Apel',
    graded: true,
    offeredIn: ['WS'],
    schedule: [
      { day: 'Mon', start: '08:00', end: '10:00', room: 'E1 3 Hörsaal II' },
      { day: 'Tue', start: '12:00', end: '14:00', room: 'E1 3 Hörsaal II' },
    ],
  },
  {
    id: 'bioinfo-im11',
    name: 'Neural Networks: Theory and Implementation',
    cp: 9,
    category: 'core-cs',
    instructor: 'Prof. Dr. Dietrich Klakow',
    graded: true,
    offeredIn: ['WS'],
    schedule: [
      { day: 'Tue', start: '14:00', end: '16:00', room: 'E2 5 Hörsaal I' },
    ],
  },

  // ─────────────────────────────────────────────
  // ADVANCED BIOSCIENCES (category: 'adv-bioscience')
  // ─────────────────────────────────────────────
  {
    id: 'bioinfo-bm1',
    name: 'Molecular Biotechnology',
    cp: 3,
    category: 'adv-bioscience',
    instructor: 'Dr. Frank Hannemann',
    graded: true,
    offeredIn: ['SS'],
    schedule: [],
  },
  {
    id: 'bioinfo-bm2a',
    name: 'Medical Biotechnology',
    cp: 3,
    category: 'adv-bioscience',
    instructor: 'Dr. Zimmermann',
    graded: true,
    offeredIn: ['SS'],
    schedule: [
      { day: 'Fri', start: '10:15', end: '12:00', room: 'A1 5 SR 3.7' },
    ],
  },
  {
    id: 'bioinfo-bm2b',
    name: 'The Human Genome and Human Disease',
    cp: 3,
    category: 'adv-bioscience',
    instructor: 'Prof. Dr. Eckart Meese, Prof. Dr. Jens Mayer',
    graded: true,
    offeredIn: ['WS'],
    schedule: [],
  },
  {
    id: 'bioinfo-bm3-wise',
    name: 'NanoBioMaterials 1',
    cp: 3,
    category: 'adv-bioscience',
    instructor: 'Dr. Lola Gonzalez-García, Prof. Dr. Tobias Kraus',
    graded: true,
    offeredIn: ['WS'],
    schedule: [
      { day: 'Fri', start: '10:00', end: '12:00', room: '' },
    ],
  },
  {
    id: 'bioinfo-bm3-sose',
    name: 'NanoBiomaterials 2',
    cp: 3,
    category: 'adv-bioscience',
    instructor: 'Dr. Kraegeloh',
    graded: true,
    offeredIn: ['SS'],
    schedule: [
      { day: 'Fri', start: '10:00', end: '12:00', room: 'C4 3 Kleiner Hörsaal II' },
    ],
  },
  {
    id: 'bioinfo-bm4',
    name: 'Principles of Epigenetics and Epigenomics',
    cp: 3,
    category: 'adv-bioscience',
    instructor: 'Prof. Dr. Julia Schulze-Hentrich',
    graded: true,
    offeredIn: ['WS'],
    schedule: [
      { day: 'Fri', start: '08:30', end: '10:00', room: '' },
    ],
  },
  {
    id: 'bioinfo-bm5-1',
    name: 'Medicinal Chemistry & Drug Design for Bioinformaticians',
    cp: 5,
    category: 'adv-bioscience',
    instructor: 'Dr. Elgaher, Dr. Empting',
    graded: true,
    offeredIn: ['SS'],
    schedule: [
      { day: 'Mon', start: '12:00', end: '14:00', room: 'E2 1 SR 0.01' },
    ],
  },
  {
    id: 'bioinfo-bm5-2',
    name: 'Advances in Drug Delivery',
    cp: 3,
    category: 'adv-bioscience',
    instructor: 'Dr. Lee',
    graded: true,
    offeredIn: ['SS'],
    schedule: [],
  },

  // ─────────────────────────────────────────────
  // ADVANCED BIOINFORMATICS (category: 'adv-bioinformatics')
  // ─────────────────────────────────────────────
  {
    id: 'bioinfo-bim1',
    name: 'Bioinformatics 3',
    cp: 9,
    category: 'adv-bioinformatics',
    instructor: 'Prof. Dr. Volkhard Helms',
    graded: true,
    offeredIn: ['SS'],
    schedule: [
      { day: 'Tue', start: '10:15', end: '11:45', room: 'E2 1 SR 0.01' },
      { day: 'Thu', start: '14:15', end: '15:45', room: 'E2 1 SR 0.01' },
    ],
  },
  {
    id: 'bioinfo-bibm1-1',
    name: 'Computational Methods for Epigenome Analysis',
    cp: 5,
    category: 'adv-bioinformatics',
    instructor: 'Dr. Fabian Müller',
    graded: true,
    offeredIn: ['SS'],
    schedule: [],
    description: 'Block course, dates TBA',
  },
  {
    id: 'bioinfo-bibm1-2',
    name: 'Processing of Biological Data',
    cp: 5,
    category: 'adv-bioinformatics',
    instructor: 'Prof. Dr. Volkhard Helms',
    graded: true,
    offeredIn: ['WS'],
    schedule: [
      { day: 'Tue', start: '10:15', end: '11:45', room: 'E2 1 SR 0.07' },
    ],
  },
  {
    id: 'bioinfo-bibm1-3',
    name: 'Modern Methods in Drug Discovery',
    cp: 5,
    category: 'adv-bioinformatics',
    instructor: 'Dr. Michael Hutter',
    graded: true,
    offeredIn: ['WS'],
    schedule: [
      { day: 'Mon', start: '10:15', end: '11:45', room: 'E2 1 SR 0.01' },
    ],
  },
  {
    id: 'bioinfo-bibm1-4',
    name: 'Elements of Machine Learning',
    cp: 6,
    category: 'adv-bioinformatics',
    instructor: 'Prof. Dr. Maria Isabel Valera Martinez',
    graded: true,
    offeredIn: ['WS'],
    schedule: [
      { day: 'Thu', start: '16:00', end: '18:00', room: 'E2 2 Hörsaal 0.01' },
    ],
  },
  {
    id: 'bioinfo-bibm1-5',
    name: 'Microbiome Data Analysis',
    cp: 5,
    category: 'adv-bioinformatics',
    instructor: 'Jun.-Prof. Alexey Gurevich',
    graded: true,
    offeredIn: ['WS'],
    schedule: [
      { day: 'Wed', start: '10:15', end: '11:45', room: 'E2 1 SR 0.07' },
    ],
  },
  {
    id: 'bioinfo-bibm1-6',
    name: 'Open-Source Software for Data Driven Drug Design',
    cp: 5,
    category: 'adv-bioinformatics',
    instructor: 'Prof. Dr. Andrea Volkamer',
    graded: true,
    offeredIn: ['WS'],
    schedule: [],
    description: 'Block course, Feb–Mar',
  },
  {
    id: 'bioinfo-bibm1-7',
    name: 'Structural Bioinformatics',
    cp: 5,
    category: 'adv-bioinformatics',
    instructor: 'Dr. Olga Kalinina',
    graded: true,
    offeredIn: ['WS'],
    schedule: [
      { day: 'Wed', start: '12:15', end: '13:45', room: 'E2 1 SR 0.01' },
    ],
  },
  {
    id: 'bioinfo-bibm1-8',
    name: 'Single-Cell Bioinformatics',
    cp: 9,
    category: 'adv-bioinformatics',
    instructor: 'Dr. Fabian Müller',
    graded: true,
    offeredIn: ['WS'],
    schedule: [],
    description: 'Check icb.uni-saarland.de/scb2025 for schedule',
  },

  // ─────────────────────────────────────────────
  // PRACTICAL SKILLS — BIOSCIENCES (category: 'practical-bioscience')
  // ─────────────────────────────────────────────
  {
    id: 'bioinfo-bipm1',
    name: 'Programming Course',
    cp: 5,
    category: 'practical-bioscience',
    instructor: 'Dr. Keller',
    graded: false,
    offeredIn: ['SS'],
    schedule: [
      { day: 'Tue', start: '12:15', end: '13:45', room: 'E2 1 SR 0.01' },
      { day: 'Thu', start: '10:15', end: '11:45', room: 'E2 1 SR 0.01' },
    ],
  },

  // ─────────────────────────────────────────────
  // KEY CAREER SKILLS (category: 'career-skills')
  // ─────────────────────────────────────────────
  {
    id: 'bioinfo-ebm1',
    name: 'Organization of Scientific Research',
    cp: 1,
    category: 'career-skills',
    instructor: 'Prof. Dr. Volkhard Helms',
    graded: false,
    offeredIn: ['SS'],
    schedule: [],
  },
  {
    id: 'bioinfo-ebm1b',
    name: 'Scientific Writing',
    cp: 1,
    category: 'career-skills',
    instructor: 'Dr. Michael Hutter',
    graded: false,
    offeredIn: ['SS'],
    schedule: [],
    description: 'Block course, dates TBA',
  },
  {
    id: 'bioinfo-ebm2',
    name: 'Project Management',
    cp: 1,
    category: 'career-skills',
    instructor: '',
    graded: false,
    offeredIn: [],
    schedule: [],
    description: 'May be offered outside regular LSF listing',
  },
  {
    id: 'bioinfo-ebm3',
    name: 'Patent Law and Bioethics',
    cp: 1,
    category: 'career-skills',
    instructor: '',
    graded: false,
    offeredIn: [],
    schedule: [],
    description: 'May be offered outside regular LSF listing',
  },

  // ─────────────────────────────────────────────
  // ADVANCED PRACTICAL SKILLS (category: 'adv-practical')
  // ─────────────────────────────────────────────
  {
    id: 'bioinfo-bpm1',
    name: 'Advanced Lab Course in the Life Sciences',
    cp: 8,
    category: 'adv-practical',
    instructor: '',
    graded: false,
    offeredIn: [],
    schedule: [],
    description: 'Contact department directly for arrangements',
  },

  // ─────────────────────────────────────────────
  // SEMINARS (category: 'seminar')
  // ─────────────────────────────────────────────
  {
    id: 'bioinfo-bism1-1',
    name: 'Seminar: Classical Bioinformatics',
    cp: 7,
    category: 'seminar',
    instructor: 'Prof. Dr. Sven Rahmann',
    graded: true,
    offeredIn: ['SS'],
    schedule: [],
  },
  {
    id: 'bioinfo-bism1-2',
    name: 'Seminar: Protein Design',
    cp: 7,
    category: 'seminar',
    instructor: 'Dr. Olga Kalinina, Prof. Dr. Dietrich Klakow',
    graded: true,
    offeredIn: ['SS'],
    schedule: [],
  },
  {
    id: 'bioinfo-bism1-3',
    name: 'Seminar: Data Driven Drug Design',
    cp: 7,
    category: 'seminar',
    instructor: 'Prof. Dr. Andrea Volkamer',
    graded: true,
    offeredIn: ['WS'],
    schedule: [],
  },
  {
    id: 'bioinfo-bism1-4',
    name: 'Seminar: Single-Cell Omics for Systems Immunology',
    cp: 7,
    category: 'seminar',
    instructor: 'Prof. Dr. Andreas Keller',
    graded: true,
    offeredIn: ['WS'],
    schedule: [],
  },
  {
    id: 'bioinfo-bism1-5',
    name: 'Seminar: Modern Minimal Perfect Hashing',
    cp: 7,
    category: 'seminar',
    instructor: 'Prof. Dr. Sven Rahmann',
    graded: true,
    offeredIn: ['WS'],
    schedule: [],
  },
  {
    id: 'bioinfo-bism1-6',
    name: 'Seminar: ML for Virtual Cell Models',
    cp: 7,
    category: 'seminar',
    instructor: 'Dr. Jonas Fischer, Prof. Dr. Andreas Keller',
    graded: true,
    offeredIn: ['WS'],
    schedule: [],
  },

  // ─────────────────────────────────────────────
  // MASTER'S SEMINAR (category: 'master-seminar')
  // ─────────────────────────────────────────────
  {
    id: 'bioinfo-bims1',
    name: "Master's Seminar on Topics in Bioinformatics",
    cp: 12,
    category: 'master-seminar',
    instructor: '',
    graded: true,
    offeredIn: ['WS', 'SS'],
    schedule: [],
    description: 'Arranged individually with supervisor',
  },

  // ─────────────────────────────────────────────
  // MASTER'S THESIS (category: 'master-thesis')
  // ─────────────────────────────────────────────
  {
    id: 'bioinfo-thesis',
    name: "Master's Thesis",
    cp: 30,
    category: 'master-thesis',
    instructor: '',
    graded: true,
    offeredIn: ['WS', 'SS'],
    schedule: [],
    description: 'Independent research project (6 months). 30 ECTS.',
  },
];

export const bioinformaticsProgram: ProgramConfig = {
  id: 'bioinfo',
  name: 'Bioinformatics',
  shortName: 'Bioinfo',
  courses: BIOINFO_COURSES,

  categoryLabels: {
    'core-cs': 'Core CS Lectures',
    'adv-bioscience': 'Advanced Biosciences',
    'adv-bioinformatics': 'Advanced Bioinformatics',
    'practical-bioscience': 'Practical Skills (Bio)',
    'career-skills': 'Key Career Skills',
    'adv-practical': 'Advanced Practical Skills',
    'seminar': 'Seminars',
    'master-seminar': "Master's Seminar",
    'master-thesis': "Master's Thesis",
    'other': 'Other',
  },

  categoryColors: {
    'core-cs':              'bg-indigo-100 border-indigo-300 text-indigo-800',
    'adv-bioscience':       'bg-emerald-100 border-emerald-300 text-emerald-800',
    'adv-bioinformatics':   'bg-purple-100 border-purple-300 text-purple-800',
    'practical-bioscience': 'bg-cyan-100 border-cyan-300 text-cyan-800',
    'career-skills':        'bg-gray-100 border-gray-300 text-gray-800',
    'adv-practical':        'bg-teal-100 border-teal-300 text-teal-800',
    'seminar':              'bg-amber-100 border-amber-300 text-amber-800',
    'master-seminar':       'bg-rose-100 border-rose-300 text-rose-800',
    'master-thesis':        'bg-red-100 border-red-300 text-red-800',
    'other':                'bg-slate-100 border-slate-300 text-slate-800',
  },

  categoryPdfColors: {
    'core-cs':              { bg: [224, 231, 255], text: [55, 48, 163],  border: [165, 180, 252] },
    'adv-bioscience':       { bg: [209, 250, 229], text: [6, 95, 70],   border: [110, 231, 183] },
    'adv-bioinformatics':   { bg: [243, 232, 255], text: [107, 33, 168], border: [216, 180, 254] },
    'practical-bioscience': { bg: [207, 250, 254], text: [14, 116, 144], border: [103, 232, 249] },
    'career-skills':        { bg: [243, 244, 246], text: [31, 41, 55],   border: [209, 213, 219] },
    'adv-practical':        { bg: [204, 251, 241], text: [17, 94, 89],   border: [94, 234, 212] },
    'seminar':              { bg: [254, 243, 199], text: [146, 64, 14],  border: [252, 211, 77] },
    'master-seminar':       { bg: [255, 228, 230], text: [159, 18, 57],  border: [253, 164, 175] },
    'master-thesis':        { bg: [254, 226, 226], text: [185, 28, 28],  border: [252, 165, 165] },
    'other':                { bg: [241, 245, 249], text: [30, 41, 59],   border: [203, 213, 225] },
  },

  catalogGroups: [
    { label: 'Core CS Lectures', categories: ['core-cs'] },
    { label: 'Advanced Biosciences', categories: ['adv-bioscience'] },
    { label: 'Advanced Bioinformatics', categories: ['adv-bioinformatics'] },
    { label: 'Practical Skills', categories: ['practical-bioscience', 'adv-practical'] },
    { label: 'Seminars', categories: ['seminar'] },
    { label: 'Career Skills', categories: ['career-skills'] },
    { label: 'Final Modules', categories: ['master-seminar', 'master-thesis'] },
  ],

  bucketRules: [
    {
      id: 'core-cs',
      label: 'Core CS Lectures',
      minCP: 18,
      maxCP: null,
      description: 'At least 18 CP from core lecture courses in computer science.',
    },
    {
      id: 'adv-bioscience',
      label: 'Advanced Biosciences',
      minCP: 12,
      maxCP: null,
      description: 'At least 12 CP from advanced lectures in the biosciences.',
    },
    {
      id: 'adv-bioinformatics',
      label: 'Advanced Bioinformatics',
      minCP: 19,
      maxCP: null,
      description: 'At least 19 CP from advanced lectures in bioinformatics.',
    },
    {
      id: 'practical',
      label: 'Practical Skills',
      minCP: 5,
      maxCP: null,
      description: 'At least 5 CP from practical skills classes in the biosciences.',
    },
    {
      id: 'seminar',
      label: 'Seminars',
      minCP: 7,
      maxCP: null,
      description: 'At least 7 CP from seminars on topics in bioinformatics. Max 2 seminars on certificate.',
    },
    {
      id: 'electives',
      label: 'Free Electives',
      minCP: 0,
      maxCP: null,
      description: 'Remaining 17 CP from any permitted category. Max 2 seminars (S-M-1) on certificate.',
    },
    {
      id: 'master-seminar',
      label: "Master's Seminar",
      minCP: 12,
      maxCP: 12,
      description: "12 CP Master's Seminar. Must be completed before the thesis.",
    },
    {
      id: 'master-thesis',
      label: "Master's Thesis",
      minCP: 30,
      maxCP: 30,
      description: "30 CP Master's Thesis (6 months). Register within 1 semester of completing the Master's Seminar.",
    },
  ],

  categoryToBucket: {
    'core-cs': 'core-cs',
    'adv-bioscience': 'adv-bioscience',
    'adv-bioinformatics': 'adv-bioinformatics',
    'practical-bioscience': 'practical',
    'career-skills': 'electives',
    'adv-practical': 'electives',
    'seminar': 'seminar',
    'master-seminar': 'master-seminar',
    'master-thesis': 'master-thesis',
    'other': 'electives',
  },

  overflowCategories: ['core-cs', 'adv-bioscience', 'adv-bioinformatics', 'practical-bioscience', 'seminar'],
  electivesBucket: 'electives',
  totalRequired: 120,
  storagePrefix: 'bioinfo-planner',

  specialChecks(buckets: BucketProgress[]) {
    // Special check: max 2 seminars on certificate
    const seminarBucket = buckets.find(b => b.rule.id === 'seminar');
    const electiveBucket = buckets.find(b => b.rule.id === 'electives');
    if (seminarBucket && electiveBucket) {
      const totalSeminars = seminarBucket.courses.length +
        electiveBucket.courses.filter(e => e.course.category === 'seminar').length;
      if (totalSeminars > 2) {
        seminarBucket.warnings.push(`Max 2 seminars allowed on certificate (you have ${totalSeminars}).`);
      }
    }
  },
};
