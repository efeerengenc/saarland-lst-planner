import type { ProgramConfig, Course, BucketProgress, PlacedCourse } from '../../types';

/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║  LST PROGRAM CONFIG — Language Science & Technology              ║
 * ╠═══════════════════════════════════════════════════════════════════╣
 * ║                                                                   ║
 * ║  Migrated from courses.ts, ruleEngine.ts, CourseCatalog.tsx       ║
 * ║  into a single ProgramConfig object.                              ║
 * ║                                                                   ║
 * ║  Basic lectures (Grundlagenvorlesungen):                          ║
 * ║    → LSF WiSe 2025/26. All offered in WS only.                   ║
 * ║                                                                   ║
 * ║  Core lectures (Stammvorlesungen):                                ║
 * ║    → LSF WiSe 2025/26 + SoSe 2026. Alternating WS/SS.           ║
 * ║                                                                   ║
 * ║  Advanced lectures (Vertiefungsvorlesungen):                      ║
 * ║    → LSF WiSe 2025/26 + SoSe 2026.                               ║
 * ║                                                                   ║
 * ║  Seminars:                                                        ║
 * ║    → LSF WiSe 2025/26 (10 seminars) + SoSe 2026 (17 seminars).   ║
 * ║      Schedules, instructors, rooms from LSF.                      ║
 * ║                                                                   ║
 * ║  Software projects:                                               ║
 * ║    → LSF WiSe 2025/26 (3 projects) + SoSe 2026 (4 projects).    ║
 * ║                                                                   ║
 * ║  CS / Cognitive Psychology:                                       ║
 * ║    → ⚠ NOT FROM LSF. Manually curated from common LST electives. ║
 * ║      Only "Statistics with R" is from LSF. Other CS courses       ║
 * ║      (Machine Learning, Neural Networks, HLCV, etc.) are from     ║
 * ║      general knowledge — schedules/offerings may be inaccurate.   ║
 * ║                                                                   ║
 * ║  Last updated: March 2026 from LSF Saarland University.          ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 */

export const LST_COURSES: Course[] = [
  // ═══════════════════════════════════════════════════════════
  // BASIC LECTURES (Grundlagenvorlesungen)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'found-emp',
    name: 'Foundations of Empirical Methods',
    nameDE: 'Grundlagen der empirischen Methoden',
    cp: 3,
    sws: 2,
    category: 'basic',
    graded: true,
    offeredIn: ['WS'],
    assessmentType: 'Written examination',
    description: 'Introduction to empirical research methods for language science, including experimental design, data collection, and basic statistical analysis.',
    instructor: 'Torsten Kai Jachmann',
    schedule: [
      { day: 'Fri', start: '08:30', end: '10:00', type: 'lecture', room: 'C7.3 Room 1.12' },
    ],
  },
  {
    id: 'found-math',
    name: 'Foundations of Mathematics',
    nameDE: 'Grundlagen der Mathematik',
    cp: 6,
    sws: 4,
    category: 'basic',
    graded: true,
    offeredIn: ['WS'],
    assessmentType: 'Written examination, preliminary assessment',
    description: 'Mathematical foundations required for computational linguistics: linear algebra, probability theory, and formal languages.',
    instructor: 'Michael Hahn',
    cmsUrl: 'https://cms.sic.saarland/fof_math_ss2526',
    schedule: [
      { day: 'Mon', start: '12:15', end: '13:45', type: 'lecture', room: 'B3.2 HS 0.03' },
      { day: 'Fri', start: '12:15', end: '13:45', type: 'lecture', room: 'B3.2 HS 0.03' },
    ],
  },
  {
    id: 'found-ling',
    name: 'Foundations of Linguistics',
    nameDE: 'Grundlagen der Linguistik',
    cp: 6,
    sws: 4,
    category: 'basic',
    graded: true,
    offeredIn: ['WS'],
    assessmentType: 'Written examination, preliminary assessment',
    description: 'Overview of core linguistic subfields: phonology, morphology, syntax, semantics, and pragmatics.',
    instructor: 'Verkerk, Yung, Kleber, Sullivan',
    schedule: [
      { day: 'Tue', start: '12:15', end: '13:45', type: 'lecture', room: 'C7.3 Room 1.12' },
      { day: 'Thu', start: '12:15', end: '13:45', type: 'tutorial', room: 'C7.3 Room 1.12' },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // CORE LECTURES (Stammvorlesungen)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'comp-ling',
    name: 'Computational Linguistics',
    nameDE: 'Computerlinguistik',
    cp: 6,
    sws: 4,
    category: 'core',
    graded: true,
    offeredIn: ['WS'],
    assessmentType: 'Project, preliminary assessment',
    description: 'Core methods in computational linguistics: parsing, formal grammars, finite-state methods, and computational morphology.',
    instructor: 'Alexander Koller',
    cmsUrl: 'https://cms.sic.saarland/i2cl_2526',
    schedule: [
      { day: 'Tue', start: '10:15', end: '11:45', type: 'lecture', room: 'C7.2 Room -1.05' },
      { day: 'Fri', start: '10:15', end: '11:45', type: 'tutorial', room: 'C7.2 Room -1.05' },
    ],
  },
  {
    id: 'comp-psycho',
    name: 'Computational Psycholinguistics',
    nameDE: 'Computerlinguistische Psycholinguistik',
    cp: 6,
    sws: 4,
    category: 'core',
    graded: true,
    offeredIn: ['WS'],
    assessmentType: 'Written examination, preliminary assessment',
    description: 'Computational models of human language processing, including models of reading, sentence comprehension, and language production.',
    instructor: 'Matthew Crocker',
    schedule: [
      { day: 'Mon', start: '14:15', end: '15:45', type: 'lecture', room: 'C7.3 Room 1.12' },
      { day: 'Wed', start: '14:15', end: '15:45', type: 'tutorial', room: 'C7.3 Room 1.12' },
    ],
  },
  {
    id: 'sem-theory',
    name: 'Semantic Theory',
    nameDE: 'Semantische Theorie',
    cp: 6,
    sws: 4,
    category: 'core',
    graded: true,
    offeredIn: ['SS'],
    assessmentType: 'Written examination, preliminary assessment',
    description: 'Formal semantics: lambda calculus, type theory, compositionality, quantification, and discourse representation theory.',
    instructor: 'Michael Sullivan',
    schedule: [
      { day: 'Tue', start: '10:15', end: '11:45', type: 'lecture', room: 'C7.3 Room 1.12' },
      { day: 'Wed', start: '10:15', end: '11:45', type: 'tutorial', room: 'C7.3 Room 1.12' },
    ],
  },
  {
    id: 'speech-sci',
    name: 'Speech Science',
    nameDE: 'Sprechwissenschaft',
    cp: 6,
    sws: 4,
    category: 'core',
    graded: true,
    offeredIn: ['WS'],
    assessmentType: 'Written examination, preliminary assessment',
    description: 'Phonetics and speech technology: acoustic analysis, speech perception, prosody, and the physics of speech production.',
    instructor: 'Felicitas Kleber, Valentin Kany',
    schedule: [
      { day: 'Thu', start: '10:15', end: '11:45', type: 'lecture', room: 'C7.3 Room 1.12' },
      { day: 'Mon', start: '10:15', end: '11:45', type: 'tutorial', room: 'C7.3 Room 1.12' },
    ],
  },
  {
    id: 'stat-nlp',
    name: 'Statistical Natural Language Processing',
    nameDE: 'Statistische Sprachverarbeitung',
    cp: 6,
    sws: 4,
    category: 'core',
    graded: true,
    offeredIn: ['SS'],
    assessmentType: 'Written examination, preliminary assessment',
    description: 'Statistical and machine learning methods for NLP: language models, text classification, sequence labeling, and neural approaches.',
    instructor: 'Dietrich Klakow',
    cmsUrl: 'https://cms.sic.saarland/snlp26',
    schedule: [
      { day: 'Wed', start: '14:15', end: '15:45', type: 'lecture', room: 'E1.3 HS I' },
    ],
  },
  {
    id: 'syn-theory',
    name: 'Syntactic Theory',
    nameDE: 'Syntaktische Theorie',
    cp: 6,
    sws: 4,
    category: 'core',
    graded: true,
    offeredIn: ['SS'],
    assessmentType: 'Written examination, preliminary assessment',
    description: 'Formal syntax: phrase structure grammars, transformational grammar, HPSG, LFG, and minimalism.',
    instructor: 'Tania Avgustinova',
    schedule: [
      { day: 'Fri', start: '10:15', end: '11:45', type: 'lecture', room: 'C7.3 Room 1.12' },
      { day: 'Fri', start: '14:15', end: '15:45', type: 'tutorial', room: 'C7.3 Room 1.12' },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // ADVANCED LECTURES (Vertiefungsvorlesungen)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'conn-lang',
    name: 'Connectionist Language Processing',
    nameDE: 'Konnektionistische Sprachverarbeitung',
    cp: 6,
    sws: 4,
    category: 'advanced',
    graded: true,
    offeredIn: ['SS'],
    assessmentType: 'Written examination',
    description: 'Neural network architectures for language: RNNs, LSTMs, transformers, and their application to NLP tasks.',
    instructor: 'Matthew Crocker',
    schedule: [
      { day: 'Tue', start: '14:15', end: '15:45', type: 'lecture', room: 'C7.3 Room 1.12' },
      { day: 'Thu', start: '14:15', end: '15:45', type: 'tutorial', room: 'C7.3 Room 1.12' },
    ],
  },
  {
    id: 'exp-methods',
    name: 'Experimental Methods in Psycholinguistic Research',
    nameDE: 'Experimentelle Methoden in der psycholinguistischen Forschung',
    cp: 6,
    sws: 4,
    category: 'advanced',
    graded: true,
    offeredIn: ['SS'],
    assessmentType: 'Projects',
    description: 'Advanced experimental methods for psycholinguistic research: eye-tracking, ERP, self-paced reading, and statistical modeling.',
    instructor: 'Torsten Kai Jachmann, Masato Nakamura',
    schedule: [
      { day: 'Wed', start: '12:15', end: '13:45', type: 'lecture', room: 'C7.3 Room 1.12' },
      { day: 'Fri', start: '12:15', end: '13:45', type: 'tutorial', room: 'C7.3 Room 1.12' },
    ],
  },
  {
    id: 'lab-phon',
    name: 'Laboratory Phonology',
    cp: 6,
    sws: 4,
    category: 'advanced',
    graded: true,
    offeredIn: ['SS'],
    assessmentType: 'Written examination',
    description: 'Laboratory approaches to phonological research, bridging phonetics and phonology with experimental methods.',
    instructor: 'Felicitas Kleber, Jürgen Trouvain',
    schedule: [
      { day: 'Wed', start: '16:00', end: '17:30', type: 'lecture', room: 'C7.2 Room 5.09' },
      { day: 'Mon', start: '10:15', end: '11:45', type: 'tutorial', room: 'C7.2 Room 5.09' },
    ],
  },
  {
    id: 'dsp',
    name: 'Digital Signal Processing',
    nameDE: 'Digitale Signalverarbeitung',
    cp: 6,
    sws: 4,
    category: 'advanced',
    graded: true,
    offeredIn: ['SS'],
    assessmentType: 'Written examination',
    description: 'Discrete-time signals and systems, DFT, FFT, digital filter design, and applications to speech and audio.',
    instructor: 'Dietrich Klakow',
    cmsUrl: 'https://cms.sic.saarland/dsp26',
    schedule: [
      { day: 'Tue', start: '14:00', end: '16:00', type: 'lecture', room: 'E1.3 HS I' },
    ],
  },
  {
    id: 'fund-sp',
    name: 'Fundamentals of Signal Processing',
    nameDE: 'Grundlagen der Signalverarbeitung',
    cp: 6,
    sws: 4,
    category: 'advanced',
    graded: true,
    offeredIn: ['WS'],
    assessmentType: 'Written examination',
    description: 'Continuous-time and discrete-time signal processing fundamentals, Fourier analysis, and sampling theory.',
    instructor: 'Dietrich Klakow',
    cmsUrl: 'https://cms.sic.saarland/gsv_ws25',
    schedule: [
      { day: 'Thu', start: '14:00', end: '16:00', type: 'lecture', room: 'A5.1 HS I' },
      { day: 'Thu', start: '16:00', end: '18:00', type: 'tutorial', room: 'A5.1 HS I' },
    ],
  },
  {
    id: 'theory-ml-lm',
    name: 'Theory of Machine Learning for Language Models',
    cp: 6,
    sws: 4,
    category: 'advanced',
    graded: true,
    offeredIn: ['SS'],
    assessmentType: 'Written examination, preliminary assessment',
    description: 'Theoretical foundations of machine learning as applied to language models, including optimization theory and generalization bounds. Listed as Stammvorlesung in LSF.',
    instructor: 'Michael Hahn, Yash Sarrof',
    cmsUrl: 'https://cms.sic.saarland/ml_theory_lm_ss26',
    schedule: [
      { day: 'Mon', start: '14:15', end: '15:45', type: 'lecture', room: 'B3.2 HS 0.03' },
      { day: 'Thu', start: '12:15', end: '13:45', type: 'tutorial', room: 'B3.2 HS 0.03' },
    ],
  },
  {
    id: 'intro-python',
    name: 'Introduction to Python Programming',
    cp: 6,
    sws: 4,
    category: 'advanced',
    graded: true,
    offeredIn: ['WS'],
    assessmentType: 'Written examination',
    description: 'Programming course covering Python fundamentals for computational linguistics students.',
    instructor: 'Jörg Steffen',
    schedule: [
      { day: 'Tue', start: '12:15', end: '13:45', type: 'lecture', room: 'B3.1 HS II' },
      { day: 'Thu', start: '12:15', end: '13:45', type: 'tutorial', room: 'B3.1 HS II' },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // CS / COGNITIVE PSYCHOLOGY
  // ═══════════════════════════════════════════════════════════
  {
    id: 'ml',
    name: 'Machine Learning',
    nameDE: 'Maschinelles Lernen',
    cp: 9,
    sws: 6,
    category: 'cs-cogpsy',
    graded: true,
    offeredIn: ['WS', 'SS'],
    assessmentType: 'Written examination',
    description: 'Supervised and unsupervised learning, SVMs, decision trees, ensemble methods, neural networks, and evaluation methodology.',
    instructor: 'Isabel Valera',
    cmsUrl: 'https://cms.sic.saarland/ml26',
    schedule: [
      { day: 'Mon', start: '14:15', end: '15:45', type: 'lecture', room: 'E2.2 GHH 0.01' },
      { day: 'Thu', start: '12:15', end: '13:45', type: 'lecture', room: 'E2.2 GHH 0.01' },
    ],
  },
  {
    id: 'nn',
    name: 'Neural Networks: Implementation and Application',
    nameDE: 'Neuronale Netze: Implementierung und Anwendung',
    cp: 6,
    sws: 4,
    category: 'cs-cogpsy',
    graded: true,
    offeredIn: ['WS'],
    assessmentType: 'Project',
    description: 'Hands-on implementation of neural network architectures including CNNs, RNNs, and transformers using modern frameworks.',
    instructor: 'Dietrich Klakow',
    cmsUrl: 'https://cms.sic.saarland/nnia_25',
    schedule: [
      { day: 'Tue', start: '14:15', end: '15:45', type: 'lecture', room: 'E2.5 HS I' },
    ],
  },
  {
    id: 'hlcv',
    name: 'High-Level Computer Vision',
    nameDE: 'Computer Vision',
    cp: 6,
    sws: 4,
    category: 'cs-cogpsy',
    graded: true,
    offeredIn: ['SS'],
    assessmentType: 'Written examination',
    description: 'Object recognition, scene understanding, image segmentation, and deep learning for computer vision.',
    instructor: 'Bernt Schiele',
    cmsUrl: 'https://cms.sic.saarland/hlcvss26',
    schedule: [
      { day: 'Wed', start: '10:00', end: '12:00', type: 'lecture', room: 'E1.5 Room 002' },
      { day: 'Mon', start: '10:00', end: '12:00', type: 'tutorial', room: 'E1.5 Room 002' },
    ],
  },
  {
    id: 'eml',
    name: 'Elements of Machine Learning',
    cp: 6,
    sws: 4,
    category: 'cs-cogpsy',
    graded: true,
    offeredIn: ['WS'],
    assessmentType: 'Written examination',
    description: 'Introduction to core machine learning concepts and algorithms.',
    instructor: 'Kavya Gupta, Isabel Valera',
    cmsUrl: 'https://cms.sic.saarland/eml25',
    schedule: [
      { day: 'Thu', start: '16:00', end: '18:00', type: 'lecture', room: 'E2.2 LH 0.01' },
    ],
  },
  {
    id: 'rl',
    name: 'Reinforcement Learning',
    cp: 6,
    sws: 4,
    category: 'cs-cogpsy',
    graded: true,
    offeredIn: ['WS'],
    assessmentType: 'Written examination',
    description: 'Markov decision processes, policy gradient methods, Q-learning, and deep reinforcement learning.',
    instructor: 'Verena Wolf',
    cmsUrl: 'https://cms.sic.saarland/rl_25',
    schedule: [
      { day: 'Mon', start: '14:15', end: '15:45', type: 'lecture', room: 'E13 HS II' },
    ],
  },
  {
    id: 'stats-r',
    name: 'Statistics with R',
    cp: 6,
    sws: 4,
    category: 'cs-cogpsy',
    graded: true,
    offeredIn: ['WS'],
    assessmentType: 'Project',
    description: 'Applied statistics using R: data visualization, hypothesis testing, regression, and mixed-effects models.',
    instructor: 'Vera Demberg, Emilia Ellsiepen, Laura Pissani',
    cmsUrl: 'https://cms.sic.saarland/statr_2526',
    schedule: [
      { day: 'Tue', start: '08:30', end: '10:00', type: 'lecture', room: 'E2.2 GHH 0.01' },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // SEMINARS — SS 2026
  // ═══════════════════════════════════════════════════════════
  {
    id: 'sem-cog-perspectives-lm',
    name: 'Cognitive Perspectives on Language Models',
    cp: 7,
    cpOptions: [4, 7],
    sws: 2,
    category: 'seminar',
    graded: true,
    offeredIn: ['SS'],
    assessmentType: 'Oral presentation, seminar paper (7 CP) or presentation only (4 CP)',
    description: 'Block seminar examining language models through the lens of cognitive science.',
    instructor: 'Katherine McCurdy',
  },
  {
    id: 'sem-diffusion-lm',
    name: 'Diffusion Language Models',
    cp: 7,
    cpOptions: [4, 7],
    sws: 2,
    category: 'seminar',
    graded: true,
    offeredIn: ['SS'],
    assessmentType: 'Oral presentation, seminar paper (7 CP) or presentation only (4 CP)',
    description: 'Seminar on diffusion-based approaches to language modeling and generation.',
    instructor: 'Yupei Du',
    schedule: [
      { day: 'Mon', start: '14:15', end: '15:45', type: 'seminar', room: 'C7.3 Room 1.14' },
    ],
  },
  {
    id: 'sem-knowledge-augmentation',
    name: 'Exploring Knowledge Augmentation Methods for Language Models',
    cp: 7,
    cpOptions: [4, 7],
    sws: 2,
    category: 'seminar',
    graded: true,
    offeredIn: ['SS'],
    assessmentType: 'Oral presentation, seminar paper (7 CP) or presentation only (4 CP)',
    description: 'Exploring retrieval-augmented generation and other knowledge augmentation techniques for LMs.',
    instructor: 'Cennet Oguz, Suruthai Noon Lywen Pokaratsiri Goldstein',
    schedule: [
      { day: 'Tue', start: '08:30', end: '10:00', type: 'seminar', room: 'C7.3 Room 1.14' },
    ],
  },
  {
    id: 'sem-llm-reasoning',
    name: 'LLM Complex Reasoning',
    cp: 7,
    cpOptions: [4, 7],
    sws: 2,
    category: 'seminar',
    graded: true,
    offeredIn: ['SS'],
    assessmentType: 'Oral presentation, seminar paper (7 CP) or presentation only (4 CP)',
    description: 'Seminar on complex reasoning capabilities and limitations of large language models.',
    instructor: 'Yupei Du',
    schedule: [
      { day: 'Fri', start: '12:15', end: '13:45', type: 'seminar', room: 'C7.3 Room 1.14' },
    ],
  },
  {
    id: 'sem-lm-embeddings-lexicon',
    name: 'Language Model Embeddings and the Human Lexicon',
    cp: 7,
    cpOptions: [4, 7],
    sws: 2,
    category: 'seminar',
    graded: true,
    offeredIn: ['SS'],
    assessmentType: 'Oral presentation, seminar paper (7 CP) or presentation only (4 CP)',
    description: 'Investigating connections between language model embeddings and human lexical representation and processing.',
    instructor: 'Vera Demberg, Jiaxin Li',
    schedule: [
      { day: 'Wed', start: '14:15', end: '15:45', type: 'seminar', room: 'C7.3 Room 1.14' },
      { day: 'Thu', start: '16:15', end: '17:45', type: 'tutorial', room: 'C7.3 Room 1.14' },
    ],
  },
  {
    id: 'sem-low-resource-mt',
    name: 'Low-Resource Machine Translation',
    cp: 7,
    cpOptions: [4, 7],
    sws: 2,
    category: 'seminar',
    graded: true,
    offeredIn: ['SS'],
    assessmentType: 'Oral presentation, seminar paper (7 CP) or presentation only (4 CP)',
    description: 'Approaches to machine translation for low-resource language pairs.',
    schedule: [
      { day: 'Tue', start: '16:15', end: '17:45', type: 'seminar', room: 'C7.2 Room -1.05' },
    ],
  },
  {
    id: 'sem-cog-ling',
    name: 'Cognitive Linguistics',
    cp: 7,
    cpOptions: [4, 7],
    sws: 2,
    category: 'seminar',
    graded: true,
    offeredIn: ['SS'],
    assessmentType: 'Oral presentation, seminar paper (7 CP) or presentation only (4 CP)',
    description: 'Key topics in cognitive linguistics including conceptual metaphor, construction grammar, and categorization.',
    instructor: 'Annemarie Verkerk',
    schedule: [
      { day: 'Thu', start: '10:15', end: '11:45', type: 'seminar', room: 'A2.2 Room 2.03' },
    ],
  },
  {
    id: 'sem-disagreement-nlp',
    name: 'Disagreement in NLP',
    cp: 7,
    cpOptions: [4, 7],
    sws: 2,
    category: 'seminar',
    graded: true,
    offeredIn: ['SS'],
    assessmentType: 'Oral presentation, seminar paper (7 CP) or presentation only (4 CP)',
    description: 'Seminar on handling annotator disagreement, subjectivity, and ambiguity in NLP tasks.',
    instructor: 'Frances Yung, Anwesha Das',
    schedule: [
      { day: 'Mon', start: '12:15', end: '13:45', type: 'seminar', room: 'C7.3 Room 1.14' },
    ],
  },
  {
    id: 'sem-ml-lang-processing-ss',
    name: 'Machine Learning for Language Processing',
    cp: 7,
    cpOptions: [4, 7],
    sws: 2,
    category: 'seminar',
    graded: true,
    offeredIn: ['SS'],
    assessmentType: 'Oral presentation, seminar paper (7 CP) or presentation only (4 CP)',
    description: 'Block seminar on machine learning methods applied to language processing tasks.',
    instructor: 'Dietrich Klakow',
  },
  {
    id: 'sem-multimodal-dialogue',
    name: 'Multimodal Dialogue Systems',
    cp: 7,
    cpOptions: [4, 7],
    sws: 2,
    category: 'seminar',
    graded: true,
    offeredIn: ['SS'],
    assessmentType: 'Oral presentation, seminar paper (7 CP) or presentation only (4 CP)',
    description: 'Block seminar on multimodal dialogue systems integrating speech, gesture, and language understanding.',
    instructor: 'Volha Petukhova',
  },
  {
    id: 'sem-multimodal-lang-understanding',
    name: 'Multimodal Language Understanding',
    cp: 7,
    cpOptions: [4, 7],
    sws: 2,
    category: 'seminar',
    graded: true,
    offeredIn: ['SS'],
    assessmentType: 'Oral presentation, seminar paper (7 CP) or presentation only (4 CP)',
    description: 'Seminar on multimodal language understanding combining vision, language, and other modalities.',
    instructor: 'Varsha Suresh',
    schedule: [
      { day: 'Mon', start: '08:30', end: '10:00', type: 'seminar', room: 'C7.3 Room 1.14' },
    ],
  },
  {
    id: 'sem-nn-brains',
    name: 'Neural Networks in Brains and Computers',
    cp: 7,
    cpOptions: [4, 7],
    sws: 2,
    category: 'seminar',
    graded: true,
    offeredIn: ['SS'],
    assessmentType: 'Oral presentation, seminar paper (7 CP) or presentation only (4 CP)',
    description: 'Interdisciplinary seminar comparing biological neural networks with artificial neural networks.',
    instructor: 'Michael Hahn',
    schedule: [
      { day: 'Tue', start: '12:15', end: '13:45', type: 'seminar', room: 'C7.3 Room 1.14' },
    ],
  },
  {
    id: 'sem-sociophonetics',
    name: 'Sociophonetics',
    cp: 7,
    cpOptions: [4, 7],
    sws: 2,
    category: 'seminar',
    graded: true,
    offeredIn: ['SS'],
    assessmentType: 'Oral presentation, seminar paper (7 CP) or presentation only (4 CP)',
    description: 'The intersection of phonetics and sociolinguistics, studying how speech varies across social groups.',
    instructor: 'Felicitas Kleber',
    schedule: [
      { day: 'Tue', start: '10:15', end: '11:45', type: 'seminar', room: 'C7.2 Room 5.09' },
    ],
  },
  {
    id: 'sem-topics-stats-r',
    name: 'Topics in Inferential Statistics (with R)',
    cp: 7,
    cpOptions: [4, 7],
    sws: 2,
    category: 'seminar',
    graded: true,
    offeredIn: ['SS'],
    assessmentType: 'Oral presentation, seminar paper (7 CP) or presentation only (4 CP)',
    description: 'Advanced topics in inferential statistics with practical applications using R.',
    instructor: 'Emilia Ellsiepen',
    schedule: [
      { day: 'Mon', start: '10:15', end: '11:45', type: 'seminar', room: 'C7.3 Room 1.14' },
    ],
  },
  {
    id: 'sem-efficient-robust-nlp',
    name: 'Efficient and Robust NLP',
    cp: 7,
    cpOptions: [4, 7],
    sws: 2,
    category: 'seminar',
    graded: true,
    offeredIn: ['SS'],
    assessmentType: 'Oral presentation, seminar paper (7 CP) or presentation only (4 CP)',
    description: 'Techniques for making NLP systems more efficient and robust in real-world applications.',
    instructor: 'Simon Ostermann',
    schedule: [
      { day: 'Wed', start: '12:15', end: '13:45', type: 'seminar', room: 'C7.3 Room 1.14' },
    ],
  },
  {
    id: 'sem-pragmatic-llm',
    name: 'Pragmatic Processing in Large Language Models',
    cp: 7,
    cpOptions: [4, 7],
    sws: 2,
    category: 'seminar',
    graded: true,
    offeredIn: ['SS'],
    assessmentType: 'Oral presentation, seminar paper (7 CP) or presentation only (4 CP)',
    description: 'Investigating how LLMs handle pragmatic phenomena such as implicature, presupposition, and discourse.',
    instructor: 'Vera Demberg, Alexandra Mayn',
    schedule: [
      { day: 'Wed', start: '08:30', end: '10:00', type: 'seminar', room: 'C7.3 Room 1.14' },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // SEMINARS — WS 2025/26
  // ═══════════════════════════════════════════════════════════
  {
    id: 'sem-milestones-ml',
    name: 'Milestones in Machine Learning and Language',
    cp: 7,
    cpOptions: [4, 7],
    sws: 2,
    category: 'seminar',
    graded: true,
    offeredIn: ['WS'],
    assessmentType: 'Oral presentation, seminar paper (7 CP) or presentation only (4 CP)',
    description: 'Seminar covering landmark papers and breakthroughs in machine learning applied to NLP.',
    instructor: 'Yash Sarrof',
    cmsUrl: 'https://cms.sic.saarland/milestones_2526',
    schedule: [
      { day: 'Wed', start: '16:15', end: '17:45', type: 'seminar', room: 'C7.3 Room 1.14' },
    ],
  },
  {
    id: 'sem-lm-abilities',
    name: 'Theoretical Abilities and Limitations of Language Models',
    cp: 7,
    cpOptions: [4, 7],
    sws: 2,
    category: 'seminar',
    graded: true,
    offeredIn: ['WS'],
    assessmentType: 'Oral presentation, seminar paper (7 CP) or presentation only (4 CP)',
    description: 'Explores the theoretical foundations and boundaries of what language models can and cannot do.',
    instructor: 'Xinting Huang, Michael Hahn',
    schedule: [
      { day: 'Wed', start: '10:15', end: '11:45', type: 'seminar', room: 'C7.3 Room 1.14' },
    ],
  },
  {
    id: 'sem-argumentation-mining',
    name: 'Argumentation Mining',
    cp: 7,
    cpOptions: [4, 7],
    sws: 2,
    category: 'seminar',
    graded: true,
    offeredIn: ['WS'],
    assessmentType: 'Oral presentation, seminar paper (7 CP) or presentation only (4 CP)',
    description: 'Block seminar on computational approaches to detecting and analyzing argumentation in text.',
    instructor: 'Volha Petukhova',
  },
  {
    id: 'sem-lang-prod-comp',
    name: 'Comparing Language Production and Comprehension',
    cp: 7,
    cpOptions: [4, 7],
    sws: 2,
    category: 'seminar',
    graded: true,
    offeredIn: ['WS'],
    assessmentType: 'Oral presentation, seminar paper (7 CP) or presentation only (4 CP)',
    description: 'Seminar comparing psycholinguistic models and evidence for language production vs. comprehension processes.',
    instructor: 'Masato Nakamura',
    schedule: [
      { day: 'Thu', start: '14:15', end: '15:45', type: 'seminar', room: 'C7.3 Room 1.14' },
    ],
  },
  {
    id: 'sem-llm-safety',
    name: 'LLM Safety',
    cp: 7,
    cpOptions: [4, 7],
    sws: 2,
    category: 'seminar',
    graded: true,
    offeredIn: ['WS'],
    assessmentType: 'Oral presentation, seminar paper (7 CP) or presentation only (4 CP)',
    description: 'Seminar on safety issues in large language models: alignment, toxicity, bias, and adversarial attacks.',
    instructor: 'Yupei Du',
    schedule: [
      { day: 'Wed', start: '14:15', end: '15:45', type: 'seminar', room: 'C7.3 Room 1.14' },
    ],
  },
  {
    id: 'sem-ml-lang-processing-ws',
    name: 'Machine Learning for Language Processing',
    cp: 7,
    cpOptions: [4, 7],
    sws: 2,
    category: 'seminar',
    graded: true,
    offeredIn: ['WS'],
    assessmentType: 'Oral presentation, seminar paper (7 CP) or presentation only (4 CP)',
    description: 'Block seminar on machine learning methods applied to language processing tasks.',
    instructor: 'Dietrich Klakow',
  },
  {
    id: 'sem-agentic-llm',
    name: 'Towards Agentic LLMs that Reason and Plan',
    cp: 7,
    cpOptions: [4, 7],
    sws: 2,
    category: 'seminar',
    graded: true,
    offeredIn: ['WS'],
    assessmentType: 'Oral presentation, seminar paper (7 CP) or presentation only (4 CP)',
    description: 'Seminar on developing large language models that can autonomously reason and plan.',
    instructor: 'Yupei Du',
    schedule: [
      { day: 'Tue', start: '16:15', end: '17:45', type: 'seminar', room: 'C7.3 Room 1.12' },
    ],
  },
  {
    id: 'sem-acquisition-spoken-lang',
    name: 'Acquisition of Spoken Language',
    cp: 7,
    cpOptions: [4, 7],
    sws: 2,
    category: 'seminar',
    graded: true,
    offeredIn: ['WS'],
    assessmentType: 'Oral presentation, seminar paper (7 CP) or presentation only (4 CP)',
    description: 'Seminar on how children and adults acquire spoken language, covering phonological and prosodic development.',
    instructor: 'Felicitas Kleber',
    schedule: [
      { day: 'Tue', start: '16:15', end: '17:45', type: 'seminar', room: 'C7.3 Room 1.14' },
    ],
  },
  {
    id: 'sem-lexical-prediction',
    name: 'Lexical Prediction in Human Sentence Processing',
    cp: 7,
    cpOptions: [4, 7],
    sws: 2,
    category: 'seminar',
    graded: true,
    offeredIn: ['WS'],
    assessmentType: 'Oral presentation, seminar paper (7 CP) or presentation only (4 CP)',
    description: 'Seminar on predictive mechanisms in human sentence processing, focusing on lexical prediction.',
    instructor: 'Masato Nakamura',
    schedule: [
      { day: 'Wed', start: '12:15', end: '13:45', type: 'seminar', room: 'C7.3 Room 1.14' },
    ],
  },
  {
    id: 'sem-scientific-communication',
    name: 'Scientific Communication',
    cp: 7,
    cpOptions: [4, 7],
    sws: 2,
    category: 'seminar',
    graded: true,
    offeredIn: ['WS'],
    assessmentType: 'Oral presentation, seminar paper (7 CP) or presentation only (4 CP)',
    description: 'Seminar on academic writing and presentation skills for scientific communication.',
    instructor: 'Suruthai Noon Lywen Pokaratsiri Goldstein',
    schedule: [
      { day: 'Fri', start: '14:30', end: '18:00', type: 'seminar' },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // SEMINAR PLACEHOLDERS (for future/unknown seminars)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'seminar-placeholder',
    name: 'Seminar (7 CP)',
    cp: 7,
    cpOptions: [4, 7],
    sws: 2,
    category: 'seminar',
    graded: true,
    offeredIn: ['WS', 'SS'],
    assessmentType: 'Oral presentation, seminar paper',
    description: 'Generic seminar placeholder. Use for seminars not yet listed. Topics vary by semester.',
  },
  {
    id: 'seminar-small-placeholder',
    name: 'Seminar (4 CP)',
    cp: 4,
    sws: 2,
    category: 'seminar',
    graded: true,
    offeredIn: ['WS', 'SS'],
    assessmentType: 'Oral presentation',
    description: 'Shorter seminar placeholder (presentation only, no paper).',
  },

  // ═══════════════════════════════════════════════════════════
  // SOFTWARE PROJECTS — SS 2026
  // ═══════════════════════════════════════════════════════════
  {
    id: 'swp-llm-agents',
    name: 'LLM-Based Agents',
    cp: 8,
    sws: 3,
    category: 'software-project',
    graded: true,
    offeredIn: ['SS'],
    assessmentType: 'Project + written report + presentation',
    description: 'Software project building agents powered by large language models.',
    instructor: 'Mareike Hartmann',
    schedule: [
      { day: 'Mon', start: '12:15', end: '13:45', type: 'lecture', room: 'C7.2 Room -1.05' },
    ],
  },
  {
    id: 'swp-trustworthy-nlp',
    name: 'Trustworthy Natural Language Processing',
    cp: 8,
    sws: 3,
    category: 'software-project',
    graded: true,
    offeredIn: ['SS'],
    assessmentType: 'Project + written report + presentation',
    description: 'Software project focused on building trustworthy and reliable NLP systems.',
    instructor: 'Simon Ostermann',
    schedule: [
      { day: 'Thu', start: '08:30', end: '10:00', type: 'lecture', room: 'C7.3 Room 1.14' },
    ],
  },
  {
    id: 'swp-nmt-scratch',
    name: 'Neural Machine Translation from Scratch',
    cp: 8,
    sws: 3,
    category: 'software-project',
    graded: true,
    offeredIn: ['SS'],
    assessmentType: 'Project + written report + presentation',
    description: 'Software project implementing a neural machine translation system from scratch.',
    instructor: 'Yasser Hamidullah',
    schedule: [
      { day: 'Mon', start: '16:15', end: '17:45', type: 'lecture', room: 'C7.2 Room -1.05' },
    ],
  },
  {
    id: 'swp-neural-networks',
    name: 'Neural Networks (Software Project)',
    cp: 8,
    sws: 3,
    category: 'software-project',
    graded: true,
    offeredIn: ['WS', 'SS'],
    assessmentType: 'Project + written report + presentation',
    description: 'Block software project on neural network implementation and application.',
    instructor: 'Dietrich Klakow',
  },

  // ═══════════════════════════════════════════════════════════
  // SOFTWARE PROJECTS — WS 2025/26
  // ═══════════════════════════════════════════════════════════
  {
    id: 'swp-mechanistic-nlp',
    name: 'Implementing Mechanistic Approaches in NLP',
    cp: 8,
    sws: 3,
    category: 'software-project',
    graded: true,
    offeredIn: ['WS'],
    assessmentType: 'Project + written report + presentation',
    description: 'Software project implementing mechanistic interpretability approaches for NLP systems.',
    instructor: 'Tanja Bäumel',
    schedule: [
      { day: 'Mon', start: '12:15', end: '13:45', type: 'lecture', room: 'C7.2 Room -1.05' },
    ],
  },
  {
    id: 'swp-pretraining-lm',
    name: 'Pretraining Language Models',
    cp: 8,
    sws: 3,
    category: 'software-project',
    graded: true,
    offeredIn: ['WS'],
    assessmentType: 'Project + written report + presentation',
    description: 'Software project on pretraining language models from scratch.',
    instructor: 'Michael Sullivan',
    schedule: [
      { day: 'Mon', start: '16:15', end: '17:45', type: 'lecture', room: 'C7.3 Room 1.14' },
    ],
  },
  {
    id: 'software-project',
    name: 'Software Project (Generic)',
    cp: 8,
    sws: 4,
    category: 'software-project',
    graded: true,
    offeredIn: ['WS', 'SS'],
    assessmentType: 'Project + written report + presentation',
    description: 'Generic software project placeholder. Group programming project addressing a problem in computational linguistics.',
  },

  // ═══════════════════════════════════════════════════════════
  // FINAL MODULES
  // ═══════════════════════════════════════════════════════════
  {
    id: 'master-seminar',
    name: "Master's Seminar",
    nameDE: 'Master-Seminar',
    cp: 12,
    sws: 2,
    category: 'master-seminar',
    graded: false,
    offeredIn: ['WS', 'SS'],
    assessmentType: 'Oral presentation, seminar paper',
    description: 'Preparatory seminar for the Master\'s thesis. Students present their proposed thesis topic and submit a written description.',
  },
  {
    id: 'master-thesis',
    name: "Master's Thesis",
    nameDE: 'Master-Arbeit',
    cp: 30,
    sws: 0,
    category: 'master-thesis',
    graded: true,
    offeredIn: ['WS', 'SS'],
    assessmentType: 'Thesis',
    description: 'Independent research project (6 months). Demonstrates the ability to work on problems in computational linguistics or related fields.',
  },

  // ═══════════════════════════════════════════════════════════
  // OTHER
  // ═══════════════════════════════════════════════════════════
  {
    id: 'tutoring',
    name: 'Tutoring',
    nameDE: 'Tutoriumsleitung',
    cp: 4,
    sws: 2,
    category: 'tutoring',
    graded: false,
    offeredIn: ['WS', 'SS'],
    assessmentType: 'Ungraded',
    description: 'Supervising undergraduate students in exercise/problem-solving classes. Only one group permitted.',
  },
  {
    id: 'internship',
    name: 'Work Placement / Internship',
    nameDE: 'Praktikum',
    cp: 8,
    sws: 0,
    category: 'internship',
    graded: false,
    offeredIn: ['WS', 'SS'],
    assessmentType: 'Ungraded',
    description: 'At least 6 weeks of approved work placement. Must be approved by the Examination Board.',
  },
];

export const lstProgram: ProgramConfig = {
  id: 'lst',
  name: 'Language Science & Technology',
  shortName: 'LST',
  courses: LST_COURSES,

  categoryLabels: {
    'basic': 'Basic Lectures',
    'core': 'Core Lectures',
    'advanced': 'Advanced Lectures',
    'seminar': 'Seminars',
    'software-project': 'Software Projects',
    'cs-cogpsy': 'CS / Cognitive Psychology',
    'master-seminar': "Master's Seminar",
    'master-thesis': "Master's Thesis",
    'tutoring': 'Tutoring',
    'internship': 'Internship',
    'other': 'Other',
  },

  categoryColors: {
    'basic': 'bg-blue-100 border-blue-300 text-blue-800',
    'core': 'bg-indigo-100 border-indigo-300 text-indigo-800',
    'advanced': 'bg-purple-100 border-purple-300 text-purple-800',
    'seminar': 'bg-amber-100 border-amber-300 text-amber-800',
    'software-project': 'bg-green-100 border-green-300 text-green-800',
    'cs-cogpsy': 'bg-teal-100 border-teal-300 text-teal-800',
    'master-seminar': 'bg-rose-100 border-rose-300 text-rose-800',
    'master-thesis': 'bg-red-100 border-red-300 text-red-800',
    'tutoring': 'bg-gray-100 border-gray-300 text-gray-800',
    'internship': 'bg-orange-100 border-orange-300 text-orange-800',
    'other': 'bg-slate-100 border-slate-300 text-slate-800',
  },

  categoryPdfColors: {
    basic:              { bg: [219, 234, 254], text: [30, 64, 175],  border: [147, 197, 253] },
    core:               { bg: [224, 231, 255], text: [55, 48, 163],  border: [165, 180, 252] },
    advanced:           { bg: [243, 232, 255], text: [107, 33, 168], border: [216, 180, 254] },
    seminar:            { bg: [254, 243, 199], text: [146, 64, 14],  border: [252, 211, 77] },
    'software-project': { bg: [220, 252, 231], text: [22, 101, 52],  border: [134, 239, 172] },
    'cs-cogpsy':        { bg: [204, 251, 241], text: [17, 94, 89],   border: [94, 234, 212] },
    'master-seminar':   { bg: [255, 228, 230], text: [159, 18, 57],  border: [253, 164, 175] },
    'master-thesis':    { bg: [254, 226, 226], text: [185, 28, 28],  border: [252, 165, 165] },
    tutoring:           { bg: [243, 244, 246], text: [31, 41, 55],   border: [209, 213, 219] },
    internship:         { bg: [255, 237, 213], text: [154, 52, 18],  border: [253, 186, 116] },
    other:              { bg: [241, 245, 249], text: [30, 41, 59],   border: [203, 213, 225] },
  },

  catalogGroups: [
    { label: 'Basic Lectures', categories: ['basic'] },
    { label: 'Core Lectures', categories: ['core'] },
    { label: 'Advanced Lectures', categories: ['advanced'] },
    { label: 'Seminars & Projects', categories: ['seminar', 'software-project'] },
    { label: 'CS / Cognitive Psychology', categories: ['cs-cogpsy'] },
    { label: 'Final Module', categories: ['master-seminar', 'master-thesis'] },
    { label: 'Other', categories: ['tutoring', 'internship'] },
  ],

  bucketRules: [
    { id: 'basic-core', label: 'Basic + Core Lectures', minCP: 24, maxCP: null, description: 'At least 24 CP from basic and core lectures, of which at least 18 must be from core lectures.' },
    { id: 'seminars', label: 'Seminars', minCP: 14, maxCP: null, description: '14 CP from seminars (2 seminars worth 7 CP each).' },
    { id: 'cs-cogpsy', label: 'CS / Cognitive Psychology', minCP: 6, maxCP: 18, description: '6\u201318 CP from courses offered by CS or Cognitive Psychology.' },
    { id: 'electives', label: 'Mandatory Electives', minCP: 19, maxCP: 31, description: '19\u201331 CP from elective courses (advanced lectures, extra seminars, software projects, tutoring, internship).' },
    { id: 'master-seminar', label: "Master's Seminar", minCP: 12, maxCP: 12, description: "12 CP Master's Seminar (ungraded). Must be completed before the thesis." },
    { id: 'master-thesis', label: "Master's Thesis", minCP: 30, maxCP: 30, description: "30 CP Master's Thesis (graded). Register within 1 semester of completing the Master's Seminar." },
  ],

  categoryToBucket: {
    'basic': 'basic-core',
    'core': 'basic-core',
    'seminar': 'seminars',
    'cs-cogpsy': 'cs-cogpsy',
    'master-seminar': 'master-seminar',
    'master-thesis': 'master-thesis',
    'advanced': 'electives',
    'software-project': 'electives',
    'tutoring': 'electives',
    'internship': 'electives',
    'other': 'electives',
  },

  overflowCategories: ['basic', 'core', 'seminar', 'cs-cogpsy', 'advanced'],
  electivesBucket: 'electives',
  totalRequired: 120,
  storagePrefix: 'lst-planner',

  specialChecks(buckets: BucketProgress[], allPlaced: { course: Course; placed: PlacedCourse }[]) {
    // ── 1. Core lectures must contribute at least 18 CP to basic-core ──
    const basicCoreBucket = buckets.find(b => b.rule.id === 'basic-core');
    if (basicCoreBucket) {
      const coreCP = basicCoreBucket.courses
        .filter(c => c.course.category === 'core')
        .reduce((sum, c) => sum + (c.placed.cpOverride ?? c.course.cp), 0);
      if (coreCP < 18) {
        basicCoreBucket.warnings.push(
          `Core lectures: ${coreCP} / 18 CP. At least 18 CP must come from core lectures (Stammvorlesungen).`
        );
        basicCoreBucket.satisfied = false;
      }
    }

    // ── 2. Seminars bucket should have 2 seminars worth 7 CP each ──
    const seminarsBucket = buckets.find(b => b.rule.id === 'seminars');
    if (seminarsBucket) {
      const sevenCPSeminars = seminarsBucket.courses.filter(
        c => (c.placed.cpOverride ?? c.course.cp) === 7
      );
      if (seminarsBucket.currentCP >= 14 && sevenCPSeminars.length < 2) {
        seminarsBucket.warnings.push(
          'You need 2 seminars worth 7 CP each (Referat + Hausarbeit). Consider upgrading 4 CP seminars.'
        );
      }
    }

    // ── 3. Master's seminar should come before thesis ──
    const hasMasterSeminar = allPlaced.some(c => c.course.id === 'master-seminar');
    const hasMasterThesis = allPlaced.some(c => c.course.id === 'master-thesis');
    if (hasMasterThesis && !hasMasterSeminar) {
      const thesisBucket = buckets.find(b => b.rule.id === 'master-thesis');
      if (thesisBucket) {
        thesisBucket.warnings.push(
          "Master's Seminar must be completed before registering for the Master's Thesis."
        );
      }
    }
  },
};
