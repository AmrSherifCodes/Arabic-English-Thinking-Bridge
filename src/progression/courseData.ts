import { StageNode, UnitNode, LessonNode, ExerciseItem, ExerciseType, ProgressionState } from './types';
import { PHASES_DATA } from '../data/lessons';
import type { Exercise, Lesson } from '../types';

const LESSONS_PER_STAGE = 9;

const STAGE_DEFINITIONS: Omit<StageNode, 'units' | 'stageExam'>[] = [
  {
    stage: 'A0',
    titleAr: 'المرحلة A0 · الانطلاقة والأساسات',
    titleEn: 'Stage A0 · Absolute Starter Foundations',
    descriptionAr: 'بناء الجمل الأساسية وفهم الهيكل الإنجليزي الأولي',
    descriptionEn: 'Build essential sentence patterns and core English structure',
  },
  {
    stage: 'A1',
    titleAr: 'المرحلة A1 · التفكير اليومي والتعبير',
    titleEn: 'Stage A1 · Everyday Thinking & Expression',
    descriptionAr: 'التعبير عن الأحداث والروابط والمواقف اليومية',
    descriptionEn: 'Express everyday events, relationships, and situations',
  },
  {
    stage: 'A2',
    titleAr: 'المرحلة A2 · الجمل المركبة والربط',
    titleEn: 'Stage A2 · Complex Sentences & Connectors',
    descriptionAr: 'ربط الأفكار والتعبير بدقة في سياقات متنوعة',
    descriptionEn: 'Connect ideas and communicate precisely in varied contexts',
  },
];

function mapLegacyExerciseToItem(exercise: Exercise, lessonId: string, index: number): ExerciseItem {
  const chips = exercise.wordChips.length > 0
    ? exercise.wordChips
    : exercise.englishTarget.split(' ');
  const type: ExerciseType = chips.length > 0 ? 'structure_builder' : 'translate_thought';

  return {
    id: exercise.id || `ex-${lessonId}-${index}`,
    type,
    promptAr: exercise.arabicThought || exercise.sourceThought || 'عبر عن المعنى بالإنجليزي:',
    promptEn: exercise.englishTarget || exercise.targetSentence || '',
    targetSentence: exercise.targetSentence || exercise.englishTarget,
    acceptableAlternatives: exercise.acceptableAlternatives,
    wordChips: chips,
    options: chips,
    explanationAr: exercise.habitHintAr || 'ركز على تركيب الجملة وتجنب الترجمة الحرفية.',
    explanationEn: 'Focus on English structure rather than word-for-word translation.',
    skillAxes: ['structure', 'writing', 'vocabulary'],
  };
}

function createStageNode(
  definition: Omit<StageNode, 'units' | 'stageExam'>,
  lessons: Lesson[]
): StageNode {
  const unitGroups = Array.from({ length: 3 }, (_, index) =>
    lessons.slice(
      Math.floor((index * lessons.length) / 3),
      Math.floor(((index + 1) * lessons.length) / 3)
    )
  );

  const units: UnitNode[] = unitGroups.map((unitLessons, index) => {
    const unitId = `${definition.stage.toLowerCase()}-unit-${index + 1}`;
    const mappedLessons = unitLessons.map((lesson): LessonNode => ({
      id: `${definition.stage.toLowerCase()}-${lesson.id}`,
      unitId,
      stage: definition.stage,
      titleAr: lesson.titleAr || lesson.title,
      titleEn: lesson.title || lesson.titleAr,
      descriptionAr: lesson.transferConceptAr || lesson.transferConcept,
      descriptionEn: lesson.transferConcept,
      icon: '🧠',
      exercises: lesson.exercises.map((exercise, exerciseIndex) =>
        mapLegacyExerciseToItem(exercise, lesson.id, exerciseIndex)
      ),
    }));

    return {
      id: unitId,
      stage: definition.stage,
      titleAr: `الوحدة ${index + 1} — ${['أساسيات الجملة', 'التدريب الموجّه', 'الاستخدام المستقل'][index]} (${definition.stage})`,
      titleEn: `Unit ${index + 1} — ${['Sentence Foundations', 'Guided Practice', 'Independent Use'][index]} (${definition.stage})`,
      descriptionAr: 'تدريبات متدرجة لترسيخ بناء الجملة',
      descriptionEn: 'Progressive practice to reinforce sentence construction',
      icon: ['🧱', '⚡', '🚀'][index],
      color: ['#2DD4BF', '#F5B942', '#3B82F6'][index],
      lessons: mappedLessons,
      checkpointTest: unitLessons.flatMap((lesson) =>
        lesson.exercises.map((exercise, exerciseIndex) =>
          mapLegacyExerciseToItem(exercise, lesson.id, exerciseIndex)
        )
      ),
    };
  });

  return {
    ...definition,
    units,
    stageExam: units.flatMap((unit) => unit.checkpointTest).slice(0, 10),
  };
}

export function buildCourseStructure(): StageNode[] {
  const lessons = PHASES_DATA.flatMap((phase) => phase.lessons);
  return STAGE_DEFINITIONS.map((definition, index) =>
    createStageNode(
      definition,
      lessons.slice(index * LESSONS_PER_STAGE, (index + 1) * LESSONS_PER_STAGE)
    )
  );
}

export function isStageUnlocked(state: ProgressionState, stage: StageNode['stage']): boolean {
  const stages = buildCourseStructure();
  const activeStageIndex = stages.findIndex((item) => item.stage === state.currentStage);
  const requestedStageIndex = stages.findIndex((item) => item.stage === stage);
  return requestedStageIndex >= 0 && activeStageIndex >= 0 && requestedStageIndex <= activeStageIndex;
}

export function getNextStageAfterLessonCompletion(
  state: ProgressionState,
  completedLessonId: string
): StageNode['stage'] | undefined {
  const stages = buildCourseStructure();
  const currentStageIndex = stages.findIndex((item) => item.stage === state.currentStage);
  if (currentStageIndex < 0) return undefined;

  const currentStageLessons = stages[currentStageIndex].units.flatMap((unit) => unit.lessons);
  const completedLessonIds = new Set([...state.completedLessonIds, completedLessonId]);
  if (!currentStageLessons.every((lesson) => completedLessonIds.has(lesson.id))) return undefined;

  return stages[currentStageIndex + 1]?.stage;
}

export function isLessonUnlocked(state: ProgressionState, lesson: LessonNode): boolean {
  if (!isStageUnlocked(state, lesson.stage)) return false;
  if (state.completedLessonIds.includes(lesson.id)) return true;
  if (lesson.stage !== state.currentStage) return true;

  const stage = buildCourseStructure().find((item) => item.stage === lesson.stage);
  if (!stage) return false;

  const lessons = stage.units.flatMap((unit) => unit.lessons);
  const nextLessonIndex = lessons.findIndex(
    (item) => !state.completedLessonIds.includes(item.id)
  );
  const lessonIndex = lessons.findIndex((item) => item.id === lesson.id);
  return nextLessonIndex < 0 || (lessonIndex >= 0 && lessonIndex <= nextLessonIndex);
}
