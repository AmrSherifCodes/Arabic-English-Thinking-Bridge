import { StageNode, CefrStage, UnitNode, LessonNode, ExerciseItem, ExerciseType } from './types';
import { PHASES_DATA } from '../data/lessons';

/**
 * Converts legacy exercise structure into structured ExerciseItem with ExerciseTypes.
 */
function mapLegacyExerciseToItem(ex: any, lessonId: string, idx: number): ExerciseItem {
  let type: ExerciseType = 'structure_builder';
  if (ex.wordChips && ex.wordChips.length > 0) {
    type = 'structure_builder';
  } else if (idx % 2 === 1) {
    type = 'translate_thought';
  }

  const chips = ex.options || ex.wordChips || (ex.englishTarget ? ex.englishTarget.split(' ') : ['I', 'learn', 'English']);

  return {
    id: ex.id || `ex-${lessonId}-${idx}`,
    type,
    promptAr: ex.arabicThought || ex.sourceThought || ex.promptAr || 'عبر عن المعنى بالإنجليزي:',
    promptEn: ex.englishTarget || ex.targetSentence || ex.promptEn || '',
    targetSentence: ex.englishTarget || ex.targetSentence || '',
    acceptableAlternatives: ex.acceptableAlternatives || [],
    wordChips: chips,
    options: chips,
    explanationAr: ex.habitHint || ex.habitHintAr || ex.explanationAr || 'ركز على تركيب الجملة وتجنب الترجمة الحرفية.',
    explanationEn: 'Focus on English structure rather than word-for-word translation.',
    skillAxes: ['structure', 'writing', 'vocabulary'],
  };
}

/**
 * Maps the 27 canonical lessons from PHASES_DATA into 7 CEFR Stages (A0 to C2).
 */
export function buildCourseStructure(): StageNode[] {
  const allLessons = PHASES_DATA.flatMap((phase) => phase.lessons);

  // Divide 27 lessons across Stages A0, A1, A2
  const a0Lessons = allLessons.slice(0, 9);
  const a1Lessons = allLessons.slice(9, 18);
  const a2Lessons = allLessons.slice(18, 27);
  const b1Lessons = allLessons.slice(9, 18);
  const b2Lessons = allLessons.slice(18, 27);
  const c1Lessons = allLessons.slice(18, 27);
  const c2Lessons = allLessons.slice(18, 27);

  const createStageNode = (
    stage: CefrStage,
    titleAr: string,
    titleEn: string,
    descAr: string,
    descEn: string,
    rawLessons: any[]
  ): StageNode => {
    // Group raw lessons into 3 Units per Stage
    const unit1Lessons = rawLessons.slice(0, 3);
    const unit2Lessons = rawLessons.slice(3, 6);
    const unit3Lessons = rawLessons.slice(6, 9);

    const mapToLessonNode = (l: any, unitId: string): LessonNode => ({
      id: `${stage.toLowerCase()}-${l.id}`,
      unitId,
      stage,
      titleAr: l.titleAr || l.title,
      titleEn: l.title || l.titleAr,
      descriptionAr: l.transferConceptAr || l.transferConcept || '',
      descriptionEn: l.transferConcept || '',
      icon: '🧠',
      exercises: l.exercises.map((ex: any, idx: number) => mapLegacyExerciseToItem(ex, l.id, idx)),
    });

    const units: UnitNode[] = [
      {
        id: `${stage.toLowerCase()}-unit-1`,
        stage,
        titleAr: `الوحدة الأولى — الهيكل والأساسيات (${stage})`,
        titleEn: `Unit 1 — Core Sentence Structure (${stage})`,
        descriptionAr: 'تفكيك عقدة الجملة والروابط المحذوفة',
        descriptionEn: 'Deconstructing Arabic-English transfer gaps',
        icon: '🧱',
        color: '#2DD4BF',
        lessons: unit1Lessons.map((l) => mapToLessonNode(l, `${stage.toLowerCase()}-unit-1`)),
        checkpointTest: unit1Lessons.flatMap((l) =>
          l.exercises.map((ex: any, idx: number) => mapLegacyExerciseToItem(ex, l.id, idx))
        ),
      },
      {
        id: `${stage.toLowerCase()}-unit-2`,
        stage,
        titleAr: `الوحدة الثانية — الزمن والتعبير اليومي (${stage})`,
        titleEn: `Unit 2 — Tenses & Daily Expressions (${stage})`,
        descriptionAr: 'الانتقال إلى التفكير المباشر بدون تردد',
        descriptionEn: 'Building instant spoken reflexes',
        icon: '⚡',
        color: '#F5B942',
        lessons: unit2Lessons.map((l) => mapToLessonNode(l, `${stage.toLowerCase()}-unit-2`)),
        checkpointTest: unit2Lessons.flatMap((l) =>
          l.exercises.map((ex: any, idx: number) => mapLegacyExerciseToItem(ex, l.id, idx))
        ),
      },
      {
        id: `${stage.toLowerCase()}-unit-3`,
        stage,
        titleAr: `الوحدة الثالثة — الطلاقة التلقائية (${stage})`,
        titleEn: `Unit 3 — Spontaneous Fluency (${stage})`,
        descriptionAr: 'إتقان التعبيرات المركبة ونطق الشارع',
        descriptionEn: 'Mastering idioms and conversational pace',
        icon: '🚀',
        color: '#3B82F6',
        lessons: unit3Lessons.map((l) => mapToLessonNode(l, `${stage.toLowerCase()}-unit-3`)),
        checkpointTest: unit3Lessons.flatMap((l) =>
          l.exercises.map((ex: any, idx: number) => mapLegacyExerciseToItem(ex, l.id, idx))
        ),
      },
    ];

    return {
      stage,
      titleAr,
      titleEn,
      descriptionAr: descAr,
      descriptionEn: descEn,
      units,
      stageExam: units.flatMap((u) => u.checkpointTest).slice(0, 10),
    };
  };

  return [
    createStageNode(
      'A0',
      'المرحلة A0 · الانطلاقة والأساسات',
      'Stage A0 · Absolute Starter Foundations',
      'بناء الهيكل البنائي الأولي والجمل الاسمية الأساسية',
      'Mastering fundamental sentence patterns and zero-copula bridging',
      a0Lessons
    ),
    createStageNode(
      'A1',
      'المرحلة A1 · التفكير اليومي والتعبير',
      'Stage A1 · Everyday Thinking & Expression',
      'حياة الشارع، الأفعال المباشرة والأنشطة اليومية',
      'Everyday conversations, direct verbs, and routine thinking',
      a1Lessons
    ),
    createStageNode(
      'A2',
      'المرحلة A2 · الجمل المركبة والربط',
      'Stage A2 · Complex Sentences & Connectors',
      'ربط الأفكار، أدوات الربط والحديث بدون انقطاع',
      'Connecting thoughts smoothly with natural English connectors',
      a2Lessons
    ),
    createStageNode(
      'B1',
      'المرحلة B1 · الاستقلالية والطلاقة',
      'Stage B1 · Independent Fluency',
      'التعبير عن الآراء، الأبحاث والمواقف المعقدة',
      'Expressing opinions and handling complex scenarios',
      b1Lessons
    ),
    createStageNode(
      'B2',
      'المرحلة B2 · الصياغات الاحترافية والعمل',
      'Stage B2 · Corporate & Workplace Master',
      'التحول من البلدي إلى Corporate واللغة المهنية',
      'Executive phrasing and workplace communication',
      b2Lessons
    ),
    createStageNode(
      'C1',
      'المرحلة C1 · الاحتراف المتقدم والعمق',
      'Stage C1 · Advanced Nuance & Register',
      'الدقة اللغوية، البلاغة والتفكير الأكاديمي',
      'Academic research, register control, and nuance',
      c1Lessons
    ),
    createStageNode(
      'C2',
      'المرحلة C2 · طلاقة المتحدث الأصلي',
      'Stage C2 · Native-Level Mastery',
      'التحدث بفطرة المتحدث الأصلي الكاملة',
      'Effortless native cognitive intuition',
      c2Lessons
    ),
  ];
}
