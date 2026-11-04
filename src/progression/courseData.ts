import { StageNode, UnitNode, LessonNode, ExerciseItem, ExerciseType } from './types';
import { PHASES_DATA } from '../data/lessons';
import type { Exercise, Lesson } from '../types';

/**
 * Converts legacy exercise structure into structured ExerciseItem with ExerciseTypes.
 */
function mapLegacyExerciseToItem(ex: Exercise, lessonId: string, idx: number): ExerciseItem {
  let type: ExerciseType = 'structure_builder';
  if (ex.wordChips && ex.wordChips.length > 0) {
    type = 'structure_builder';
  } else if (idx % 2 === 1) {
    type = 'translate_thought';
  }

  const chips = ex.wordChips.length > 0 ? ex.wordChips : ex.englishTarget.split(' ');

  return {
    id: ex.id || `ex-${lessonId}-${idx}`,
    type,
    promptAr: ex.arabicThought || ex.sourceThought || 'عبر عن المعنى بالإنجليزي:',
    promptEn: ex.englishTarget || ex.targetSentence || '',
    targetSentence: ex.targetSentence || ex.englishTarget,
    acceptableAlternatives: ex.acceptableAlternatives || [],
    wordChips: chips,
    options: chips,
    explanationAr: ex.habitHintAr || 'ركز على تركيب الجملة وتجنب الترجمة الحرفية.',
    explanationEn: 'Focus on English structure rather than word-for-word translation.',
    skillAxes: ['structure', 'writing', 'vocabulary'],
  };
}

/**
 * Maps the three canonical curriculum phases into A0, A1, and A2.
 */
export function buildCourseStructure(): StageNode[] {
  const stageDefinitions: Omit<StageNode, 'units' | 'stageExam'>[] = [
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

  const createStageNode = (
    definition: Omit<StageNode, 'units' | 'stageExam'>,
    rawLessons: Lesson[]
  ): StageNode => {
    const stage = definition.stage;
    const unitLessonGroups = Array.from({ length: 3 }, (_, index) =>
      rawLessons.slice(
        Math.floor((index * rawLessons.length) / 3),
        Math.floor(((index + 1) * rawLessons.length) / 3)
      )
    );

    const mapToLessonNode = (l: Lesson, unitId: string): LessonNode => ({
      id: `${stage.toLowerCase()}-${l.id}`,
      unitId,
      stage,
      titleAr: l.titleAr || l.title,
      titleEn: l.title || l.titleAr,
      descriptionAr: l.transferConceptAr || l.transferConcept || '',
      descriptionEn: l.transferConcept || '',
      icon: '🧠',
      exercises: l.exercises.map((ex, idx) => mapLegacyExerciseToItem(ex, l.id, idx)),
    });

    const units: UnitNode[] = unitLessonGroups.map((unitLessons, index) => {
      const unitId = `${stage.toLowerCase()}-unit-${index + 1}`;
      const titlesEn = ['Sentence Foundations', 'Guided Practice', 'Independent Use'];
      const titlesAr = ['أساسيات الجملة', 'التدريب الموجّه', 'الاستخدام المستقل'];
      const colors = ['#2DD4BF', '#F5B942', '#3B82F6'];
      const icons = ['🧱', '⚡', '🚀'];
      const checkpointTest = unitLessons.flatMap((lesson) =>
        lesson.exercises.map((ex, idx) => mapLegacyExerciseToItem(ex, lesson.id, idx))
      );

      return {
        id: unitId,
        stage,
        titleAr: `الوحدة ${index + 1} — ${titlesAr[index]} (${stage})`,
        titleEn: `Unit ${index + 1} — ${titlesEn[index]} (${stage})`,
        descriptionAr: 'تدريبات متدرجة لترسيخ بناء الجملة',
        descriptionEn: 'Progressive practice to reinforce sentence construction',
        icon: icons[index],
        color: colors[index],
        lessons: unitLessons.map((lesson) => mapToLessonNode(lesson, unitId)),
        checkpointTest,
      };
    });

    return {
      ...definition,
      units,
      stageExam: units.flatMap((u) => u.checkpointTest).slice(0, 10),
    };
  };

  const allLessons = PHASES_DATA.flatMap((phase) => phase.lessons);
  return stageDefinitions.map((definition, index) =>
    createStageNode(definition, allLessons.slice(index * 9, (index + 1) * 9))
  );
}
