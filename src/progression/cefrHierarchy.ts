import {
  LevelNode,
  PhaseNode,
  ModuleNode,
  UnitNode,
  LessonNode,
  ExerciseItem,
  CefrLevelId,
  PhaseId,
  ModuleId,
  SkillBranch,
  ProgressionState,
  StageNode,
  CefrStage,
} from './types';
import { PHASES_DATA } from '../data/lessons';
import type { TargetLanguage } from '../types';
import { getCurriculum } from '../data/curriculumRegistry';
import { TARGET_LANGUAGE_META } from '../data/languages';
import { getTargetDictionary } from '../data/dictionaries';

function dictLoadedKey(targetLang: TargetLanguage): string {
  return `${targetLang}:${getTargetDictionary(targetLang).length > 0 ? '1' : '0'}`;
}

/**
 * Skill Branch Definitions & Helper Maps
 */
export const SKILL_BRANCH_META: Record<
  SkillBranch,
  { labelAr: string; labelEn: string; color: string; icon: string }
> = {
  grammar: { labelAr: 'القواعد والتراكيب', labelEn: 'Grammar', color: '#3B82F6', icon: 'Layers' },
  vocabulary: { labelAr: 'المفردات والسياق', labelEn: 'Vocabulary', color: '#10B981', icon: 'BookOpen' },
  pronunciation: { labelAr: 'النطق والأصوات', labelEn: 'Pronunciation', color: '#F59E0B', icon: 'Mic' },
  listening: { labelAr: 'الاستماع والفهم', labelEn: 'Listening', color: '#EC4899', icon: 'Headphones' },
};

/**
 * Creates default exercises for any generated lesson node
 */

function sanitizeUnitTitleAr(titleAr: string, targetLang: TargetLanguage): string {
  if (targetLang === 'en') return titleAr;
  return titleAr
    .replace(/\s*\([^)]*-\w+[^)]*\)/g, '')
    .replace(/\s*\([^)]*(don't|doesn't|Do|Does|Did|Didn't|Going to|Will|Ever|Never|Just|Already|Yet|For|Since|like|prefer|Comparatives|in|on|at|near|This|That|These|Those|Wish|Passive|Passive Voice|Modals|Pitch|Participle|Cleft)[^)]*\)/gi, '')
    .replace(/:\s*"[^"]*"/g, '')
    .replace(/(-ed)/gi, '')
    .replace(/Going to/gi, '')
    .replace(/Will/gi, '')
    .trim();
}

function sanitizeDescriptionAr(descAr: string, targetLang: TargetLanguage): string {
  if (targetLang === 'en') return descAr;
  const targetName = TARGET_LANGUAGE_META[targetLang]?.nameAr || 'اللغة المستهدفة';
  return descAr
    .replace(/am\/is\/are\s*going to/gi, 'قواعد التخطيط')
    .replace(/going to/gi, '')
    .replace(/will/gi, '')
    .replace(/الإنجليزية/g, targetName)
    .replace(/إنجليزية/g, targetName)
    .trim();
}

const poolCache: Record<string, any[]> = {};
function getPoolForLang(targetLang: TargetLanguage) {
  const key = dictLoadedKey(targetLang);
  if (poolCache[key]) return poolCache[key];
  const sourceLang = targetLang === 'ar' ? 'en' : 'ar';
  const phases = getCurriculum(sourceLang, targetLang);
  const pool = phases.flatMap((p) => p.lessons).flatMap((l) => l.exercises);
  poolCache[key] = pool;
  return pool;
}

function createExercisesForUnit(
  unitId: string,
  unitTitleEn: string,
  unitTitleAr: string,
  skills: SkillBranch[],
  count: number = 5,
  targetLang: TargetLanguage = 'en'
): ExerciseItem[] {
  const pool = getPoolForLang(targetLang);
  const fallbackPool = PHASES_DATA.flatMap((p) => p.lessons).flatMap((l) => l.exercises);

  const items: ExerciseItem[] = [];

  for (let i = 0; i < count; i++) {
    const activePool = pool.length > 0 ? pool : fallbackPool;
    const rawItem = activePool[(items.length + i * 3) % activePool.length];
    const skillAxes: ('structure' | 'vocabulary' | 'listening' | 'speaking' | 'writing')[] = [];
    if (skills.includes('grammar')) skillAxes.push('structure', 'writing');
    if (skills.includes('vocabulary')) skillAxes.push('vocabulary');
    if (skills.includes('listening')) skillAxes.push('listening');
    if (skills.includes('pronunciation')) skillAxes.push('speaking');

    const targetSentence = rawItem?.targetSentence || rawItem?.englishTarget || `Practice ${unitTitleEn} #${i + 1}`;
    const wordChips = rawItem?.wordChips && rawItem.wordChips.length > 0
      ? rawItem.wordChips
      : targetSentence.split(/\s+/).filter(Boolean);

    const resolvedPromptAr = targetLang === 'ar'
      ? (rawItem?.promptEn || rawItem?.sourceThought || rawItem?.englishTarget || `Practice ${unitTitleEn} #${i + 1}`)
      : (rawItem?.arabicThought || rawItem?.sourceThought || `تمرين ${unitTitleAr} - الجزء ${i + 1}`);

    const candidatePromptEn = rawItem?.promptEn || rawItem?.sourceThought || '';
    const resolvedPromptEn =
      candidatePromptEn && candidatePromptEn !== targetSentence
        ? candidatePromptEn
        : resolvedPromptAr;

    const targetNameAr = TARGET_LANGUAGE_META[targetLang]?.nameAr || 'الإنجليزية';
    const rawArClue =
      (rawItem?.explanationAr && /[\u0600-\u06FF]/.test(rawItem.explanationAr) ? rawItem.explanationAr : '') ||
      (rawItem?.habitHintAr && /[\u0600-\u06FF]/.test(rawItem.habitHintAr) ? rawItem.habitHintAr : '') ||
      (rawItem?.habitHint && /[\u0600-\u06FF]/.test(rawItem.habitHint) ? rawItem.habitHint : '');

    items.push({
      id: `${unitId}-ex-${i + 1}`,
      type: i % 2 === 0 ? 'structure_builder' : 'translate_thought',
      promptAr: resolvedPromptAr,
      promptEn: resolvedPromptEn,
      targetSentence,
      acceptableAlternatives: rawItem?.acceptableAlternatives || [targetSentence],
      wordChips: wordChips.length > 0 ? wordChips : [targetSentence],
      breakdownChunks: rawItem?.breakdownChunks || [],
      explanationAr: rawArClue || `ركز على بناء المعنى والجملة باللغة ${targetNameAr}.`,
      explanationEn: `Focus on natural sentence construction for ${unitTitleEn}.`,
      skillAxes: skillAxes.length > 0 ? skillAxes : ['structure', 'vocabulary'],
    });
  }

  return items;
}

function createLessonsForUnit(
  unitId: string,
  stage: CefrStage,
  levelId: CefrLevelId,
  phaseId: PhaseId,
  moduleId: ModuleId,
  unitTitleAr: string,
  unitTitleEn: string,
  skills: SkillBranch[],
  count: number = 4,
  targetLang: TargetLanguage = 'en'
): LessonNode[] {
  const lessons: LessonNode[] = [];
  for (let i = 1; i <= count; i++) {
    lessons.push({
      id: `${unitId}-l${i}`,
      unitId,
      stage,
      levelId,
      phaseId,
      moduleId,
      skills,
      estimatedMinutes: Math.round(levelId === 'A1' ? 5 : levelId === 'A2' ? 7 : levelId === 'B1' ? 9 : levelId === 'B2' ? 11 : 12),
      titleAr: `${unitTitleAr} — الدرس ${i}`,
      titleEn: `${unitTitleEn} — Lesson ${i}`,
      descriptionAr: `تطبيق عملي وتدريبات متدرجة على ${unitTitleAr}`,
      descriptionEn: `Interactive practice and step-by-step exercises for ${unitTitleEn}`,
      icon: skills.includes('grammar') ? 'Layers' : skills.includes('listening') ? 'Headphones' : skills.includes('pronunciation') ? 'Mic' : 'BookOpen',
      exercises: createExercisesForUnit(`${unitId}-l${i}`, unitTitleEn, unitTitleAr, skills, 6, targetLang),
      canDoIds: [`${levelId.toLowerCase()}-cd-${(i % 5) + 1}`],
    });
  }
  return lessons;
}

/**
 * Built-in Master CEFR 5-Tier Level Architecture (A1 -> C1)
 */
export const CEFR_LEVELS_MASTER: LevelNode[] = [
  // ====================== LEVEL A1 ======================
  {
    level: 'A1',
    titleAr: 'المستوى A1: المبتدئ الشامل',
    titleEn: 'Level A1: Beginner Foundations',
    descriptionAr: 'بناء الأساس في المحادثات اليومية والتعريف بالنفس والطلب والسؤال',
    descriptionEn: 'Build core foundation for daily greetings, identity, food, and basic navigation',
    color: 'amber',
    icon: 'Sprout',
    estimatedMinutes: 360,
    capstoneLessonId: 'a1-capstone',
    canDo: [
      { id: 'a1-cd-1', textAr: 'التعريف بالنفس والسؤال عن الاسم والعمر والجنسية والعمل', textEn: 'Introduce myself and ask simple questions about name, age, nationality, and job' },
      { id: 'a1-cd-2', textAr: 'طلب الطعام والمشروبات في الكافيهات والمطاعم ببساطة', textEn: 'Order simple food and drinks in cafés and restaurants' },
      { id: 'a1-cd-3', textAr: 'التحدث عن الروتين اليومي والأفعال المتكررة', textEn: 'Talk about my daily routine using present simple' },
      { id: 'a1-cd-4', textAr: 'السؤال عن الاتجاهات وفهم الإجابات البسيطة للمواصلات', textEn: 'Ask for directions and understand simple transit answers' },
      { id: 'a1-cd-5', textAr: 'العد وإخبار الوقت والتاريخ والأرقام في الحياة اليومية', textEn: 'Count, tell time, and use numbers in real situations' },
    ],
    phases: [
      {
        id: 'A1.1',
        level: 'A1',
        order: 1,
        titleAr: 'A1.1: الاتصال الأول والتعريف',
        titleEn: 'A1.1: First Contact & Identity',
        descriptionAr: 'التحيات، التعارف، الأرقام والأوقات الأساسية',
        descriptionEn: 'Greetings, introductions, numbers, and basic time',
        estimatedMinutes: 120,
        masteryCheckId: 'a1.1-mastery',
        modules: [
          {
            id: 'a1.1-m1',
            phaseId: 'A1.1',
            titleAr: 'الهوية والتحيات',
            titleEn: 'Identity & Greetings',
            skills: ['vocabulary', 'pronunciation'],
            units: [
              {
                id: 'a1.1-u1',
                stage: 'A1',
                titleAr: 'التحيات اليومية والوداع',
                titleEn: 'Greetings & Goodbyes',
                descriptionAr: 'أدبيات السلام والتعارف الأساسي',
                descriptionEn: 'Essential hello, goodbye, and polite phrases',
                icon: 'MessageSquare',
                color: 'amber',
                estimatedMinutes: 30,
                skills: ['vocabulary', 'pronunciation'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'a1.1-u2',
                stage: 'A1',
                titleAr: 'الأسماء والجنسيات والمهن',
                titleEn: 'Names, Nationalities & Jobs',
                descriptionAr: 'التعبير عن الهوية والبلد والعمل',
                descriptionEn: 'Expressing origin, name, and profession',
                icon: 'User',
                color: 'amber',
                estimatedMinutes: 30,
                skills: ['vocabulary', 'grammar'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'a1.1-u3',
                stage: 'A1',
                titleAr: 'تقديم الآخرين والعائلة',
                titleEn: 'Introducing Others & Family',
                descriptionAr: 'تقديم الأصدقاء وأفراد الأسرة',
                descriptionEn: 'Introducing friends and family members',
                icon: 'Users',
                color: 'amber',
                estimatedMinutes: 30,
                skills: ['vocabulary', 'grammar'],
                lessons: [],
                checkpointTest: [],
              },
            ],
          },
          {
            id: 'a1.1-m2',
            phaseId: 'A1.1',
            titleAr: 'الأرقام والأوقات',
            titleEn: 'Numbers & Time',
            skills: ['vocabulary', 'listening'],
            units: [
              {
                id: 'a1.1-u4',
                stage: 'A1',
                titleAr: 'الأرقام من 1 إلى 20',
                titleEn: 'Numbers 1 to 20',
                descriptionAr: 'العد الأساسي ونطق الأرقام',
                descriptionEn: 'Basic counting and pronunciation',
                icon: 'Hash',
                color: 'amber',
                estimatedMinutes: 25,
                skills: ['vocabulary', 'pronunciation'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'a1.1-u5',
                stage: 'A1',
                titleAr: 'الأرقام من 21 إلى 100',
                titleEn: 'Numbers 21 to 100',
                descriptionAr: 'التعامل مع العقود والأرقام الأكبر',
                descriptionEn: 'Tens, hundreds, and larger numbers',
                icon: 'Hash',
                color: 'amber',
                estimatedMinutes: 25,
                skills: ['vocabulary', 'listening'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'a1.1-u6',
                stage: 'A1',
                titleAr: 'إخبار الوقت والتسلسل',
                titleEn: 'Telling Time',
                descriptionAr: 'قراءة الساعة والدقائق',
                descriptionEn: 'Reading clocks and minutes',
                icon: 'Clock',
                color: 'amber',
                estimatedMinutes: 25,
                skills: ['listening', 'vocabulary'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'a1.1-u7',
                stage: 'A1',
                titleAr: 'الأيام والأشهر وفصول السنة',
                titleEn: 'Days, Months & Seasons',
                descriptionAr: 'أيام الأسبوع والتقويم السنوي',
                descriptionEn: 'Weekdays, months, and seasonal time',
                icon: 'Calendar',
                color: 'amber',
                estimatedMinutes: 25,
                skills: ['vocabulary'],
                lessons: [],
                checkpointTest: [],
              },
            ],
          },
        ],
      },
      {
        id: 'A1.2',
        level: 'A1',
        order: 2,
        titleAr: 'A1.2: الحياة اليومية والأساسيات',
        titleEn: 'A1.2: Daily Life Basics',
        descriptionAr: 'الروتين، المضارع البسيط، الطعام، والمطاعم',
        descriptionEn: 'Daily routines, present simple, food, and dining',
        estimatedMinutes: 120,
        masteryCheckId: 'a1.2-mastery',
        modules: [
          {
            id: 'a1.2-m1',
            phaseId: 'A1.2',
            titleAr: 'الروتين اليومي والمضارع البسيط',
            titleEn: 'Daily Routine & Present Simple',
            skills: ['grammar', 'vocabulary'],
            units: [
              {
                id: 'a1.2-u1',
                stage: 'A1',
                titleAr: 'المضارع البسيط — الإثبات',
                titleEn: 'Present Simple — Affirmative',
                descriptionAr: 'التعبير عن العادات والأفعال المتكررة',
                descriptionEn: 'Habits and repeating daily actions',
                icon: 'Sun',
                color: 'amber',
                estimatedMinutes: 30,
                skills: ['grammar', 'vocabulary'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'a1.2-u2',
                stage: 'A1',
                titleAr: 'المضارع البسيط — النفي (don\'t / doesn\'t)',
                titleEn: 'Present Simple — Negative',
                descriptionAr: 'نفي العادات والأفعال اليومية',
                descriptionEn: 'Negating habits with don\'t and doesn\'t',
                icon: 'XCircle',
                color: 'amber',
                estimatedMinutes: 30,
                skills: ['grammar'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'a1.2-u3',
                stage: 'A1',
                titleAr: 'صياغة الأسئلة (Do / Does)',
                titleEn: 'Question Forms (Do / Does)',
                descriptionAr: 'السؤال عن العادات والتفضيلات',
                descriptionEn: 'Asking questions about routines',
                icon: 'HelpCircle',
                color: 'amber',
                estimatedMinutes: 30,
                skills: ['grammar', 'listening'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'a1.2-u4',
                stage: 'A1',
                titleAr: 'تعبيرات الوقت والظروف',
                titleEn: 'Time Expressions & Frequency',
                descriptionAr: 'استخدام always, sometimes, never',
                descriptionEn: 'Using frequency adverbs in daily sentences',
                icon: 'Clock',
                color: 'amber',
                estimatedMinutes: 30,
                skills: ['grammar', 'vocabulary'],
                lessons: [],
                checkpointTest: [],
              },
            ],
          },
          {
            id: 'a1.2-m2',
            phaseId: 'A1.2',
            titleAr: 'الطعام والطلب والمطعم',
            titleEn: 'Food & Restaurant Dialogues',
            skills: ['vocabulary', 'listening'],
            units: [
              {
                id: 'a1.2-u5',
                stage: 'A1',
                titleAr: 'قاموس الأطعمة والمشروبات',
                titleEn: 'Food & Drink Vocabulary',
                descriptionAr: 'أسماء الوجبات والمكونات الأساسية',
                descriptionEn: 'Meals, ingredients, and everyday drinks',
                icon: 'Coffee',
                color: 'amber',
                estimatedMinutes: 30,
                skills: ['vocabulary'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'a1.2-u6',
                stage: 'A1',
                titleAr: 'أدبيات الطلب: "I want" vs "I\'d like"',
                titleEn: 'Polite Ordering: "I\'d like"',
                descriptionAr: 'الطلب بأسلوب مهذب ولبق',
                descriptionEn: 'Making polite requests at venues',
                icon: 'Smile',
                color: 'amber',
                estimatedMinutes: 30,
                skills: ['vocabulary', 'pronunciation'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'a1.2-u7',
                stage: 'A1',
                titleAr: 'حوارات الكافيه والمطعم',
                titleEn: 'Café & Restaurant Dialogues',
                descriptionAr: 'التفاعل مع النادل ودفع الفاتورة',
                descriptionEn: 'Interacting with servers and paying bills',
                icon: 'Utensils',
                color: 'amber',
                estimatedMinutes: 30,
                skills: ['listening', 'vocabulary'],
                lessons: [],
                checkpointTest: [],
              },
            ],
          },
        ],
      },
      {
        id: 'A1.3',
        level: 'A1',
        order: 3,
        titleAr: 'A1.3: التجوّل والتسوّق',
        titleEn: 'A1.3: Getting Around & Shopping',
        descriptionAr: 'حروف الجر المكانية، السؤال عن الاتجاهات، والتسوق',
        descriptionEn: 'Prepositions of place, directions, prices, and shopping',
        estimatedMinutes: 120,
        masteryCheckId: 'a1.3-mastery',
        modules: [
          {
            id: 'a1.3-m1',
            phaseId: 'A1.3',
            titleAr: 'الاتجاهات والأماكن',
            titleEn: 'Directions & Places',
            skills: ['vocabulary', 'listening'],
            units: [
              {
                id: 'a1.3-u1',
                stage: 'A1',
                titleAr: 'حروف الجر المكانية (in, on, at, near)',
                titleEn: 'Prepositions of Place',
                descriptionAr: 'تحديد موقع الأشياء والأماكن بدقة',
                descriptionEn: 'Locating objects and places clearly',
                icon: 'MapPin',
                color: 'amber',
                estimatedMinutes: 30,
                skills: ['grammar', 'vocabulary'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'a1.3-u2',
                stage: 'A1',
                titleAr: 'السؤال عن الاتجاهات وإرشاد الآخرين',
                titleEn: 'Asking for Directions',
                descriptionAr: 'كيف تطلب وتصف الطريق في المدينة',
                descriptionEn: 'Asking and giving simple street directions',
                icon: 'Navigation',
                color: 'amber',
                estimatedMinutes: 30,
                skills: ['vocabulary', 'listening'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'a1.3-u3',
                stage: 'A1',
                titleAr: 'وسائل المواصلات العامة',
                titleEn: 'Public Transport',
                descriptionAr: 'التنقل بالحافلة، المترو، والتاكسي',
                descriptionEn: 'Buses, metro, taxis, and ticket buying',
                icon: 'Bus',
                color: 'amber',
                estimatedMinutes: 30,
                skills: ['vocabulary', 'listening'],
                lessons: [],
                checkpointTest: [],
              },
            ],
          },
          {
            id: 'a1.3-m2',
            phaseId: 'A1.3',
            titleAr: 'أساسيات التسوّق والأسعار',
            titleEn: 'Shopping Basics & Prices',
            skills: ['vocabulary', 'grammar'],
            units: [
              {
                id: 'a1.3-u4',
                stage: 'A1',
                titleAr: 'السؤال عن الأسعار والعملات',
                titleEn: 'Prices & Currencies',
                descriptionAr: 'استخدام How much is this?',
                descriptionEn: 'Asking prices and handling payment terms',
                icon: 'Tag',
                color: 'amber',
                estimatedMinutes: 30,
                skills: ['vocabulary', 'listening'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'a1.3-u5',
                stage: 'A1',
                titleAr: 'أسماء الإشارة (This / That / These / Those)',
                titleEn: 'Demonstratives (This / That / These / Those)',
                descriptionAr: 'الإشارة للمفرد والجمع القريب والبعيد',
                descriptionEn: 'Pointing near/far singular/plural items',
                icon: 'Pointer',
                color: 'amber',
                estimatedMinutes: 30,
                skills: ['grammar'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'a1.3-u6',
                stage: 'A1',
                titleAr: 'الطلبات اللبقة في المحلات',
                titleEn: 'Simple Polite Requests',
                descriptionAr: 'التحدث مع البائع واستبدال المنتجات',
                descriptionEn: 'Store interactions and basic shopping help',
                icon: 'ShoppingBag',
                color: 'amber',
                estimatedMinutes: 30,
                skills: ['vocabulary', 'pronunciation'],
                lessons: [],
                checkpointTest: [],
              },
            ],
          },
        ],
      },
    ],
  },

  // ====================== LEVEL A2 ======================
  {
    level: 'A2',
    titleAr: 'المستوى A2: التعبير والقصص اليومية',
    titleEn: 'Level A2: Elementary Stories & Situations',
    descriptionAr: 'سرد الماضي، التخطيط للمستقبل، والتفاعل مع خدمات المدينة',
    descriptionEn: 'Past simple stories, future intentions with going to, city interactions, and personal opinions',
    color: 'teal',
    icon: 'Compass',
    estimatedMinutes: 600,
    capstoneLessonId: 'a2-capstone',
    canDo: [
      { id: 'a2-cd-1', textAr: 'وصف الأحداث والتجارب الماضية باستخدام الماضي البسيط', textEn: 'Describe past events using past simple' },
      { id: 'a2-cd-2', textAr: 'التحدث عن الخطط المستقبلية والقرارات الفورية', textEn: 'Talk about future plans (going to / will)' },
      { id: 'a2-cd-3', textAr: 'إدارة التعاملات في الصيدلية والبنك والفندق', textEn: 'Handle everyday transactions (bank, pharmacy, hotel)' },
      { id: 'a2-cd-4', textAr: 'التعبير عن الإعجاب والمقارنة والآراء البسيطة', textEn: 'Express likes/dislikes, comparisons, and simple opinions' },
      { id: 'a2-cd-5', textAr: 'فهم التسجيلات الصوتية والنصوص القصيرة حول المواضيع المألوفة', textEn: 'Understand short texts and audio about familiar topics' },
    ],
    phases: [
      {
        id: 'A2.1',
        level: 'A2',
        order: 1,
        titleAr: 'A2.1: قصص الماضي والذكريات',
        titleEn: 'A2.1: Stories & The Past',
        descriptionAr: 'إتقان الماضي البسيط وسرد الأحداث',
        descriptionEn: 'Past simple verbs, narrative flow, and storytelling',
        estimatedMinutes: 210,
        masteryCheckId: 'a2.1-mastery',
        modules: [
          {
            id: 'a2.1-m1',
            phaseId: 'A2.1',
            titleAr: 'الماضي البسيط والأفعال',
            titleEn: 'Past Simple Mastery',
            skills: ['grammar', 'vocabulary'],
            units: [
              {
                id: 'a2.1-u1',
                stage: 'A2',
                titleAr: 'الأفعال المنتظمة وتصريف الماضي (-ed)',
                titleEn: 'Regular Verbs & -ed Endings',
                descriptionAr: 'قواعد إضافة -ed ونطقها الصحيح',
                descriptionEn: 'Past endings and pronunciation rules',
                icon: 'History',
                color: 'teal',
                estimatedMinutes: 30,
                skills: ['grammar', 'pronunciation'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'a2.1-u2',
                stage: 'A2',
                titleAr: 'الأفعال الشاذة الأكثر استخداماً',
                titleEn: 'Essential Irregular Verbs',
                descriptionAr: 'حفظ وتطبيق أشهر 50 فعل شاذ في الماضي',
                descriptionEn: 'High-frequency irregular past forms',
                icon: 'Zap',
                color: 'teal',
                estimatedMinutes: 30,
                skills: ['vocabulary', 'grammar'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'a2.1-u3',
                stage: 'A2',
                titleAr: 'نفي الماضي والأسئلة (Didn\'t / Did)',
                titleEn: 'Past Negative & Questions',
                descriptionAr: 'تكوين الأسئلة والنفي في الماضي',
                descriptionEn: 'Forming negatives and questions with Did',
                icon: 'HelpCircle',
                color: 'teal',
                estimatedMinutes: 30,
                skills: ['grammar'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'a2.1-u4',
                stage: 'A2',
                titleAr: 'علامات الماضي الزمنية (yesterday, ago, last)',
                titleEn: 'Past Time Markers',
                descriptionAr: 'تحديد توقيت الأحداث الماضية بدقة',
                descriptionEn: 'Expressing precise timing in the past',
                icon: 'Clock',
                color: 'teal',
                estimatedMinutes: 30,
                skills: ['grammar', 'vocabulary'],
                lessons: [],
                checkpointTest: [],
              },
            ],
          },
          {
            id: 'a2.1-m2',
            phaseId: 'A2.1',
            titleAr: 'فن السرد والقصص',
            titleEn: 'Storytelling & Sequencing',
            skills: ['listening', 'vocabulary'],
            units: [
              {
                id: 'a2.1-u5',
                stage: 'A2',
                titleAr: 'روابط التسلسل (first, then, after that, finally)',
                titleEn: 'Sequencing Words',
                descriptionAr: 'ربط أحداث القصة بتسلسل منطقي',
                descriptionEn: 'Connecting events logically in order',
                icon: 'Link',
                color: 'teal',
                estimatedMinutes: 30,
                skills: ['grammar', 'vocabulary'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'a2.1-u6',
                stage: 'A2',
                titleAr: 'قراءة وفهم القصص القصيرة',
                titleEn: 'Short Story Reading',
                descriptionAr: 'قراءة واستخراج التفاصيل الرئيسية من نصوص الماضي',
                descriptionEn: 'Extracting key details from narrative texts',
                icon: 'BookOpen',
                color: 'teal',
                estimatedMinutes: 30,
                skills: ['listening', 'vocabulary'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'a2.1-u7',
                stage: 'A2',
                titleAr: 'إعادة إخبار الأحداث الماضية',
                titleEn: 'Retelling a Personal Story',
                descriptionAr: 'صياغة موقف شخصي حصل معك في الماضي',
                descriptionEn: 'Narrating a personal event smoothly',
                icon: 'Mic',
                color: 'teal',
                estimatedMinutes: 30,
                skills: ['pronunciation', 'grammar'],
                lessons: [],
                checkpointTest: [],
              },
            ],
          },
        ],
      },
      {
        id: 'A2.2',
        level: 'A2',
        order: 2,
        titleAr: 'A2.2: المستقبل والخطط',
        titleEn: 'A2.2: Future & Intentions',
        descriptionAr: 'النية المسبقة (going to) والقرارات الفورية (will)',
        descriptionEn: 'Intentions, predictions, offers, and immediate decisions',
        estimatedMinutes: 180,
        masteryCheckId: 'a2.2-mastery',
        modules: [
          {
            id: 'a2.2-m1',
            phaseId: 'A2.2',
            titleAr: 'النيّة والخطط (Going to)',
            titleEn: 'Going To Intentions',
            skills: ['grammar', 'vocabulary'],
            units: [
              {
                id: 'a2.2-u1',
                stage: 'A2',
                titleAr: 'التعبير عن الخطط المستقبلية المؤكدة',
                titleEn: 'Future Intentions',
                descriptionAr: 'استخدام am/is/are going to للتخطيط',
                descriptionEn: 'Planning ahead with going to',
                icon: 'Compass',
                color: 'teal',
                estimatedMinutes: 30,
                skills: ['grammar', 'vocabulary'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'a2.2-u2',
                stage: 'A2',
                titleAr: 'التنبؤات القائمة على أدلة',
                titleEn: 'Predictions with Evidence',
                descriptionAr: 'التنبؤ بما سيحدث بناءً على ما تراه',
                descriptionEn: 'Predicting near-future visible events',
                icon: 'Eye',
                color: 'teal',
                estimatedMinutes: 30,
                skills: ['grammar', 'listening'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'a2.2-u3',
                stage: 'A2',
                titleAr: 'أسئلة ونفي المستقبل (Going to)',
                titleEn: 'Going To Questions & Negatives',
                descriptionAr: 'السؤال عن خطط الآخرين ونفي النوايا',
                descriptionEn: 'Asking others about their future plans',
                icon: 'HelpCircle',
                color: 'teal',
                estimatedMinutes: 30,
                skills: ['grammar'],
                lessons: [],
                checkpointTest: [],
              },
            ],
          },
          {
            id: 'a2.2-m2',
            phaseId: 'A2.2',
            titleAr: 'القرارات والوعود (Will)',
            titleEn: 'Will Basics & Choice',
            skills: ['grammar', 'vocabulary'],
            units: [
              {
                id: 'a2.2-u4',
                stage: 'A2',
                titleAr: 'الوعود والعروض والقرارات الفورية',
                titleEn: 'Promises, Offers & Instant Decisions',
                descriptionAr: 'اتخاذ قرار لحظي باللغة الإنجليزية',
                descriptionEn: 'Making spontaneous offers and promises',
                icon: 'CheckSquare',
                color: 'teal',
                estimatedMinutes: 30,
                skills: ['grammar', 'vocabulary'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'a2.2-u5',
                stage: 'A2',
                titleAr: 'التفرقة بين Will و Going to',
                titleEn: 'Will vs Going To',
                descriptionAr: 'الفارق الجوهري في المعنى بين الصيغتين',
                descriptionEn: 'Key distinction between plan and instant decision',
                icon: 'GitCompare',
                color: 'teal',
                estimatedMinutes: 30,
                skills: ['grammar'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'a2.2-u6',
                stage: 'A2',
                titleAr: 'المحادثات الموجهة نحو المستقبل',
                titleEn: 'Future Dialogues Practice',
                descriptionAr: 'محادثات واقعية حول حجز العطلات والرحلات',
                descriptionEn: 'Real dialogues about travel and weekend plans',
                icon: 'MessageCircle',
                color: 'teal',
                estimatedMinutes: 30,
                skills: ['listening', 'pronunciation'],
                lessons: [],
                checkpointTest: [],
              },
            ],
          },
        ],
      },
      {
        id: 'A2.3',
        level: 'A2',
        order: 3,
        titleAr: 'A2.3: معاملات الحياة والآراء',
        titleEn: 'A2.3: Life Transactions & Opinions',
        descriptionAr: 'البنك والصيدلية للفندق، مقارنات الآراء والتفضيلات',
        descriptionEn: 'Bank, pharmacy, hotel check-in, complaints, and comparatives',
        estimatedMinutes: 210,
        masteryCheckId: 'a2.3-mastery',
        modules: [
          {
            id: 'a2.3-m1',
            phaseId: 'A2.3',
            titleAr: 'معاملات المدينة والمؤسسات',
            titleEn: 'City & Service Transactions',
            skills: ['vocabulary', 'listening'],
            units: [
              {
                id: 'a2.3-u1',
                stage: 'A2',
                titleAr: 'المعاملات البنكية والمالية',
                titleEn: 'Bank Transactions',
                descriptionAr: 'فتح حساب، سحب وإيداع الأموال',
                descriptionEn: 'Opening accounts and basic banking terms',
                icon: 'DollarSign',
                color: 'teal',
                estimatedMinutes: 30,
                skills: ['vocabulary', 'listening'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'a2.3-u2',
                stage: 'A2',
                titleAr: 'الصيدلية والأعراض الصحية',
                titleEn: 'Pharmacy & Health Symptoms',
                descriptionAr: 'وصف الألم والشعور وشراء الأدوية',
                descriptionEn: 'Describing pain and buying over-the-counter medicine',
                icon: 'Crosshair',
                color: 'teal',
                estimatedMinutes: 30,
                skills: ['vocabulary', 'listening'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'a2.3-u3',
                stage: 'A2',
                titleAr: 'إجراءات الفندق والحجز',
                titleEn: 'Hotel Check-in & Amenities',
                descriptionAr: 'تسجيل الدخول وطلب الخدمات الغرفية',
                descriptionEn: 'Front desk interactions and room requests',
                icon: 'Home',
                color: 'teal',
                estimatedMinutes: 30,
                skills: ['vocabulary', 'listening'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'a2.3-u4',
                stage: 'A2',
                titleAr: 'تقديم الشكاوى وحل المشكلات',
                titleEn: 'Handling Complaints Politely',
                descriptionAr: 'الاعتراض والشكوى بأسلوب لبق',
                descriptionEn: 'Expressing problems and requesting solutions',
                icon: 'AlertCircle',
                color: 'teal',
                estimatedMinutes: 30,
                skills: ['vocabulary', 'pronunciation'],
                lessons: [],
                checkpointTest: [],
              },
            ],
          },
          {
            id: 'a2.3-m2',
            phaseId: 'A2.3',
            titleAr: 'الآراء والمقارنات',
            titleEn: 'Opinions & Comparisons',
            skills: ['grammar', 'vocabulary'],
            units: [
              {
                id: 'a2.3-u5',
                stage: 'A2',
                titleAr: 'التعبير عن التفضيلات (like / prefer)',
                titleEn: 'Expressing Likes & Preferences',
                descriptionAr: 'وصف الهوايات وما تحب وما تكره',
                descriptionEn: 'Hobbies, preferences, and interests',
                icon: 'Heart',
                color: 'teal',
                estimatedMinutes: 30,
                skills: ['vocabulary', 'grammar'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'a2.3-u6',
                stage: 'A2',
                titleAr: 'صفات المقارنة (Comparatives: -er / more)',
                titleEn: 'Comparative Adjectives',
                descriptionAr: 'المقارنة بين شخصين أو مكانين أو شيئين',
                descriptionEn: 'Comparing two people, places, or objects',
                icon: 'Sliders',
                color: 'teal',
                estimatedMinutes: 30,
                skills: ['grammar', 'vocabulary'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'a2.3-u7',
                stage: 'A2',
                titleAr: 'الموافقة والاعتراض البسيط',
                titleEn: 'Agreeing & Disagreeing',
                descriptionAr: 'التعبير عن الرأي: I agree / I don\'t think so',
                descriptionEn: 'Simple phrases for sharing viewpoints',
                icon: 'ThumbsUp',
                color: 'teal',
                estimatedMinutes: 30,
                skills: ['vocabulary', 'listening'],
                lessons: [],
                checkpointTest: [],
              },
            ],
          },
        ],
      },
    ],
  },

  // ====================== LEVEL B1 ======================
  {
    level: 'B1',
    titleAr: 'المستوى B1: الاستقلالية والتعبير الذاتي',
    titleEn: 'Level B1: Intermediate Fluency & Ideas',
    descriptionAr: 'الربط بين الماضي والحاضر، النقاش والتعبير عن الرأي، وقراءة النصوص الواقعية',
    descriptionEn: 'Present perfect vs past simple, opinion structure, travel problem solving, and short email writing',
    color: 'sky',
    icon: 'Navigation',
    estimatedMinutes: 960,
    capstoneLessonId: 'b1-capstone',
    canDo: [
      { id: 'b1-cd-1', textAr: 'سرد التجارب الشخصية بالربط بين الماضي البسيط والمضارع التام', textEn: 'Narrate experiences using present perfect vs past simple' },
      { id: 'b1-cd-2', textAr: 'إدارة المواقف غير المتوقعة أثناء السفر والتنقل', textEn: 'Handle unexpected situations while traveling' },
      { id: 'b1-cd-3', textAr: 'التعبير عن الرأي والدفاع عنه بتقديم الأسباب المنطقية', textEn: 'Express and defend a simple opinion' },
      { id: 'b1-cd-4', textAr: 'فهم النقاط الرئيسية في الحديث الواضح حول الأفكار المألوفة', textEn: 'Understand the main point of clear speech on familiar topics' },
      { id: 'b1-cd-5', textAr: 'كتابة رسائل بريد إلكتروني وتدوينات شخصية منظمة', textEn: 'Write a short personal email or message' },
    ],
    phases: [
      {
        id: 'B1.1',
        level: 'B1',
        order: 1,
        titleAr: 'B1.1: جسر الماضي والحاضر',
        titleEn: 'B1.1: Past Meets Present',
        descriptionAr: 'المضارع التام، خبرات الحياة، وتجارب السفر والعمل',
        descriptionEn: 'Present perfect nuances, life experiences, travel and work talk',
        estimatedMinutes: 300,
        masteryCheckId: 'b1.1-mastery',
        modules: [
          {
            id: 'b1.1-m1',
            phaseId: 'B1.1',
            titleAr: 'إتقان المضارع التام',
            titleEn: 'Present Perfect Mastery',
            skills: ['grammar', 'vocabulary'],
            units: [
              {
                id: 'b1.1-u1',
                stage: 'B1',
                titleAr: 'خبرات الحياة (Ever / Never)',
                titleEn: 'Life Experiences (Ever / Never)',
                descriptionAr: 'السؤال والتحدث عن الخبرات التراكمية',
                descriptionEn: 'Talking about lifetime occurrences',
                icon: 'Award',
                color: 'sky',
                estimatedMinutes: 40,
                skills: ['grammar', 'vocabulary'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'b1.1-u2',
                stage: 'B1',
                titleAr: 'الأحداث المكتملة حديثاً (Just / Already / Yet)',
                titleEn: 'Recent Actions (Just / Already / Yet)',
                descriptionAr: 'الوقت القريب المكتمل أو المنتظر',
                descriptionEn: 'Immediate completed or expected tasks',
                icon: 'CheckCircle',
                color: 'sky',
                estimatedMinutes: 40,
                skills: ['grammar'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'b1.1-u3',
                stage: 'B1',
                titleAr: 'استمرارية الزمن (For vs Since)',
                titleEn: 'Duration (For vs Since)',
                descriptionAr: 'التعبير عن المدة والنقطة الزمنية البادئة',
                descriptionEn: 'Time duration vs starting point',
                icon: 'Clock',
                color: 'sky',
                estimatedMinutes: 40,
                skills: ['grammar', 'vocabulary'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'b1.1-u4',
                stage: 'B1',
                titleAr: 'المضارع التام مقابل الماضي البسيط',
                titleEn: 'Present Perfect vs Past Simple',
                descriptionAr: 'المعيار الجوهري: التوقيت المريب مقابل التوقيت المحدد',
                descriptionEn: 'Unspecified time vs specific past time',
                icon: 'GitBranches',
                color: 'sky',
                estimatedMinutes: 40,
                skills: ['grammar'],
                lessons: [],
                checkpointTest: [],
              },
            ],
          },
          {
            id: 'b1.1-m2',
            phaseId: 'B1.1',
            titleAr: 'قصص الخبرات والمحادثة',
            titleEn: 'Experience Stories & Small Talk',
            skills: ['listening', 'pronunciation'],
            units: [
              {
                id: 'b1.1-u5',
                stage: 'B1',
                titleAr: 'مواقف السفر والرحلات',
                titleEn: 'Travel Stories & Mishaps',
                descriptionAr: 'سرد أحداث الطيران والمطارات والرحلات',
                descriptionEn: 'Flight and travel experience stories',
                icon: 'Send',
                color: 'sky',
                estimatedMinutes: 45,
                skills: ['vocabulary', 'listening'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'b1.1-u6',
                stage: 'B1',
                titleAr: 'أساسيات مقابلات العمل',
                titleEn: 'Job Interview Basics',
                descriptionAr: 'التحدث عن الخبرات السابقة والمهارات',
                descriptionEn: 'Presenting experience and skills in interviews',
                icon: 'Briefcase',
                color: 'sky',
                estimatedMinutes: 45,
                skills: ['vocabulary', 'pronunciation'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'b1.1-u7',
                stage: 'B1',
                titleAr: 'أدبيات المحادثة الجانبية (Small Talk)',
                titleEn: 'Professional Small Talk',
                descriptionAr: 'كسر الجليد مع زملائك بالعمل',
                descriptionEn: 'Icebreakers and informal professional chat',
                icon: 'MessageSquare',
                color: 'sky',
                estimatedMinutes: 50,
                skills: ['listening', 'pronunciation'],
                lessons: [],
                checkpointTest: [],
              },
            ],
          },
        ],
      },
      {
        id: 'B1.2',
        level: 'B1',
        order: 2,
        titleAr: 'B1.2: الآراء والنقاش والشرط',
        titleEn: 'B1.2: Opinions & Conditionals',
        descriptionAr: 'إبداء الرأي، التدرج في الموافقة، والحالات الشرطية 0 و 1',
        descriptionEn: 'Stating viewpoints, partial agreement, zero & first conditionals',
        estimatedMinutes: 330,
        masteryCheckId: 'b1.2-mastery',
        modules: [
          {
            id: 'b1.2-m1',
            phaseId: 'B1.2',
            titleAr: 'صياغة الآراء والوجهات',
            titleEn: 'Structuring Opinions',
            skills: ['vocabulary', 'grammar'],
            units: [
              {
                id: 'b1.2-u1',
                stage: 'B1',
                titleAr: 'صيغ الرأي (In my opinion / From my perspective)',
                titleEn: 'Advanced Opinion Markers',
                descriptionAr: 'التنويع في إبداء وجهات النظر',
                descriptionEn: 'Varied ways to introduce personal opinions',
                icon: 'Edit3',
                color: 'sky',
                estimatedMinutes: 45,
                skills: ['vocabulary', 'grammar'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'b1.2-u2',
                stage: 'B1',
                titleAr: 'الموافقة الجزئية (I see your point, but...)',
                titleEn: 'Partial Agreement & Softening',
                descriptionAr: 'إظهار تفهم الطرف الآخر قبل الرد',
                descriptionEn: 'Acknowledging counter-perspectives first',
                icon: 'Check',
                color: 'sky',
                estimatedMinutes: 45,
                skills: ['vocabulary', 'pronunciation'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'b1.2-u3',
                stage: 'B1',
                titleAr: 'الاعتراض المهذب وصياغة الحجج',
                titleEn: 'Polite Disagreement & Arguments',
                descriptionAr: 'الاعتراض الدبلوماسي في اجتماعات العمل',
                descriptionEn: 'Diplomatic ways to object in discussion',
                icon: 'Shield',
                color: 'sky',
                estimatedMinutes: 45,
                skills: ['vocabulary', 'listening'],
                lessons: [],
                checkpointTest: [],
              },
            ],
          },
          {
            id: 'b1.2-m2',
            phaseId: 'B1.2',
            titleAr: 'الحالات الشرطية (0 & 1)',
            titleEn: 'Conditionals 0 & 1',
            skills: ['grammar', 'vocabulary'],
            units: [
              {
                id: 'b1.2-u4',
                stage: 'B1',
                titleAr: 'الشرط الصفري — الحقائق العامة',
                titleEn: 'Zero Conditional — General Truths',
                descriptionAr: 'التعبير عن الحقائق العلمية والقوانين',
                descriptionEn: 'Stating facts and inevitable outcomes',
                icon: 'Zap',
                color: 'sky',
                estimatedMinutes: 45,
                skills: ['grammar'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'b1.2-u5',
                stage: 'B1',
                titleAr: 'الشرط الأول — الاحتمالات المستقبلية',
                titleEn: 'First Conditional — Real Future',
                descriptionAr: 'ربط سبب محتمل بحديث في المستقبل',
                descriptionEn: 'Consequences of possible future events',
                icon: 'ArrowRight',
                color: 'sky',
                estimatedMinutes: 45,
                skills: ['grammar', 'vocabulary'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'b1.2-u6',
                stage: 'B1',
                titleAr: 'تقديم النصائح والإرشادات',
                titleEn: 'Giving Advice & Recommendations',
                descriptionAr: 'استخدام Should / If I were you',
                descriptionEn: 'Suggesting solutions and recommendations',
                icon: 'HelpCircle',
                color: 'sky',
                estimatedMinutes: 45,
                skills: ['grammar', 'listening'],
                lessons: [],
                checkpointTest: [],
              },
            ],
          },
        ],
      },
      {
        id: 'B1.3',
        level: 'B1',
        order: 3,
        titleAr: 'B1.3: القراءة والكتابة الواقعية',
        titleEn: 'B1.3: Real World Reading & Writing',
        descriptionAr: 'قراءة الإيميلات والمقالات، صياغة الرسائل الشخصية والتقييمات',
        descriptionEn: 'Comprehending news & email, writing personal messages & reviews',
        estimatedMinutes: 330,
        masteryCheckId: 'b1.3-mastery',
        modules: [
          {
            id: 'b1.3-m1',
            phaseId: 'B1.3',
            titleAr: 'فهم النصوص القصيرة',
            titleEn: 'Comprehending Short Texts',
            skills: ['listening', 'vocabulary'],
            units: [
              {
                id: 'b1.3-u1',
                stage: 'B1',
                titleAr: 'فهم رسائل البريد الإلكتروني',
                titleEn: 'Email Reading & Intent',
                descriptionAr: 'استخراج الأفكار المطلوبة والتوقيتات من الرسائل',
                descriptionEn: 'Scanning emails for key requests and dates',
                icon: 'Mail',
                color: 'sky',
                estimatedMinutes: 45,
                skills: ['vocabulary', 'listening'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'b1.3-u2',
                stage: 'B1',
                titleAr: 'عناوين الأخبار والرسائل السريعة',
                titleEn: 'News Headlines & Alerts',
                descriptionAr: 'فهم لغة الصحافة والعناوين المختصرة',
                descriptionEn: 'Deconstructing news headliners and summary alerts',
                icon: 'FileText',
                color: 'sky',
                estimatedMinutes: 45,
                skills: ['vocabulary'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'b1.3-u3',
                stage: 'B1',
                titleAr: 'المدونات والمقالات التثقيفية',
                titleEn: 'Blogs & Articles Comprehension',
                descriptionAr: 'متابعة الأفكار الرئيسية في المقالات المتوسطة',
                descriptionEn: 'Following flow in medium-length articles',
                icon: 'BookOpen',
                color: 'sky',
                estimatedMinutes: 45,
                skills: ['vocabulary', 'listening'],
                lessons: [],
                checkpointTest: [],
              },
            ],
          },
          {
            id: 'b1.3-m2',
            phaseId: 'B1.3',
            titleAr: 'أساسيات الكتابة المنظمة',
            titleEn: 'Structured Writing Basics',
            skills: ['grammar', 'vocabulary'],
            units: [
              {
                id: 'b1.3-u4',
                stage: 'B1',
                titleAr: 'كتابة الإيميل الشخصي والمهني البسيط',
                titleEn: 'Personal & Simple Business Email',
                descriptionAr: 'هيكلة الإيميل: الترحيب، العرض، والختام',
                descriptionEn: 'Structuring email greetings, body, and sign-offs',
                icon: 'Edit2',
                color: 'sky',
                estimatedMinutes: 45,
                skills: ['grammar', 'vocabulary'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'b1.3-u5',
                stage: 'B1',
                titleAr: 'كتابة التقييمات (Product & Venue Reviews)',
                titleEn: 'Writing Reviews & Feedback',
                descriptionAr: 'تقييم تجربة منتج أو مطعم أو فندق',
                descriptionEn: 'Drafting reviews with positive and negative feedback',
                icon: 'Star',
                color: 'sky',
                estimatedMinutes: 45,
                skills: ['vocabulary', 'grammar'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'b1.3-u6',
                stage: 'B1',
                titleAr: 'تعبئة استمارات التقديم والنماذج',
                titleEn: 'Form Filling & Application Data',
                descriptionAr: 'إدخال البيانات والملاحظات الشخصية بدقة',
                descriptionEn: 'Accurate form inputs and personal notes',
                icon: 'FilePlus',
                color: 'sky',
                estimatedMinutes: 45,
                skills: ['vocabulary'],
                lessons: [],
                checkpointTest: [],
              },
            ],
          },
        ],
      },
    ],
  },

  // ====================== LEVEL B2 ======================
  {
    level: 'B2',
    titleAr: 'المستوى B2: التفكير التجريدي والاحترافي',
    titleEn: 'Level B2: Upper-Intermediate Abstract Thinking',
    descriptionAr: 'الشرط المعقد، المبني للمجهول، روابط النقاش المتقدمة، ولغة الأعمال والأكاديميا',
    descriptionEn: 'Unreal conditionals 2 & 3, passive voice, cohesion, persuasive speech, and academic reading',
    color: 'indigo',
    icon: 'TrendingUp',
    estimatedMinutes: 1440,
    capstoneLessonId: 'b2-capstone',
    canDo: [
      { id: 'b2-cd-1', textAr: 'فهم النقاشات والخطابات الطويلة الموجهة للأفكار التجريدية', textEn: 'Understand extended speech on abstract topics' },
      { id: 'b2-cd-2', textAr: 'بناء وتفنيد الحجج في المناظرات والاجتماعات الاحترافية', textEn: 'Argue a position with supporting reasons and counterarguments' },
      { id: 'b2-cd-3', textAr: 'فهم المعاني والنبرات الضمنية في المقالات والأفلام', textEn: 'Understand implicit meaning in complex texts' },
      { id: 'b2-cd-4', textAr: 'كتابة تقارير ومقالات إقناعية منظمة ومقنعة', textEn: 'Write a structured opinion essay or formal report' },
      { id: 'b2-cd-5', textAr: 'إدارة المواقف الاحترافية المعقدة واجتماعات الأعمال', textEn: 'Handle professional and academic situations fluently' },
    ],
    phases: [
      {
        id: 'B2.1',
        level: 'B2',
        order: 1,
        titleAr: 'B2.1: التفكير التجريدي والمبني للمجهول',
        titleEn: 'B2.1: Abstract Thinking & Passive',
        descriptionAr: 'الشرط الثاني والثالث، الندم، والمبني للمجهول المتقدم',
        descriptionEn: 'Unreal conditionals (2nd & 3rd), regrets, passive voice in business',
        estimatedMinutes: 480,
        masteryCheckId: 'b2.1-mastery',
        modules: [
          {
            id: 'b2.1-m1',
            phaseId: 'B2.1',
            titleAr: 'الشرط غير الواقعي (2 & 3)',
            titleEn: 'Unreal Conditionals 2 & 3',
            skills: ['grammar', 'vocabulary'],
            units: [
              {
                id: 'b2.1-u1',
                stage: 'B2',
                titleAr: 'الشرط الثاني — تخيل الحاضر (If I were...)',
                titleEn: 'Second Conditional — Hypothetical Present',
                descriptionAr: 'افتراض سيناريوهات خيالية في الوقت الحالي',
                descriptionEn: 'Present unreal situations and hypotheses',
                icon: 'Cloud',
                color: 'indigo',
                estimatedMinutes: 60,
                skills: ['grammar'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'b2.1-u2',
                stage: 'B2',
                titleAr: 'الشرط الثالث — تخيل الماضي (If I had known...)',
                titleEn: 'Third Conditional — Unreal Past',
                descriptionAr: 'افتراض تغيير أحداث قد انتهت بالفعل في الماضي',
                descriptionEn: 'Past unreal events and alternative outcomes',
                icon: 'RotateCcw',
                color: 'indigo',
                estimatedMinutes: 60,
                skills: ['grammar'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'b2.1-u3',
                stage: 'B2',
                titleAr: 'الشرط المختلط (Mixed Conditionals)',
                titleEn: 'Mixed Conditionals',
                descriptionAr: 'ربط حدث الماضي بتأثيره التخيلي في الحاضر',
                descriptionEn: 'Linking past causes with present hypothetical effects',
                icon: 'GitCommit',
                color: 'indigo',
                estimatedMinutes: 60,
                skills: ['grammar'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'b2.1-u4',
                stage: 'B2',
                titleAr: 'التعبير عن الندم والأمنيات (Wish / Should have)',
                titleEn: 'Expressing Regrets & Wishes',
                descriptionAr: 'التعبير الراقي عن تمني لو حدث الشيء بشكل مختلف',
                descriptionEn: 'Reflecting on past actions with regret and wish',
                icon: 'Frown',
                color: 'indigo',
                estimatedMinutes: 60,
                skills: ['grammar', 'vocabulary'],
                lessons: [],
                checkpointTest: [],
              },
            ],
          },
          {
            id: 'b2.1-m2',
            phaseId: 'B2.1',
            titleAr: 'صيغ المبني للمجهول (Passive Voice)',
            titleEn: 'Passive Voice in Context',
            skills: ['grammar', 'vocabulary'],
            units: [
              {
                id: 'b2.1-u5',
                stage: 'B2',
                titleAr: 'المبني للمجهول في المضارع والماضي',
                titleEn: 'Passive Present & Past',
                descriptionAr: 'التركيز على الحدث والمستلم بدلاً من الفاعل',
                descriptionEn: 'Shifting focus from actor to object/result',
                icon: 'Layers',
                color: 'indigo',
                estimatedMinutes: 60,
                skills: ['grammar'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'b2.1-u6',
                stage: 'B2',
                titleAr: 'المبني للمجهول مع الأفعال الناقصة (Modals Passive)',
                titleEn: 'Passive with Modals (Must be done)',
                descriptionAr: 'التعبير عن الالتزام والأحكام الصارمة بالعمل',
                descriptionEn: 'Expressing rules and requirements in business',
                icon: 'FileCheck',
                color: 'indigo',
                estimatedMinutes: 60,
                skills: ['grammar', 'vocabulary'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'b2.1-u7',
                stage: 'B2',
                titleAr: 'لغة التقرير الإخباري والأكاديمي',
                titleEn: 'Reporting Passive & Formal News',
                descriptionAr: 'استخدام It is believed that... / It has been reported...',
                descriptionEn: 'Impersonal formal reporting techniques',
                icon: 'Globe',
                color: 'indigo',
                estimatedMinutes: 60,
                skills: ['vocabulary', 'grammar'],
                lessons: [],
                checkpointTest: [],
              },
            ],
          },
        ],
      },
      {
        id: 'B2.2',
        level: 'B2',
        order: 2,
        titleAr: 'B2.2: المناظرة والإقناع',
        titleEn: 'B2.2: Debate & Persuasion',
        descriptionAr: 'روابط الربط المتقدمة، صياغة الحجج، والتفنيد الدبلوماسي',
        descriptionEn: 'Advanced cohesion (however/despite), structured debate, counterarguments',
        estimatedMinutes: 480,
        masteryCheckId: 'b2.2-mastery',
        modules: [
          {
            id: 'b2.2-m1',
            phaseId: 'B2.2',
            titleAr: 'الروابط المتقدمة والتكتيكات اللغوية',
            titleEn: 'Advanced Cohesion & Connectors',
            skills: ['grammar', 'vocabulary'],
            units: [
              {
                id: 'b2.2-u1',
                stage: 'B2',
                titleAr: 'التناقض الراقي (However / Although / Whereas)',
                titleEn: 'Contrast Connectors',
                descriptionAr: 'الربط بين فكرتين متضادتين بأناقة',
                descriptionEn: 'Expressing contrast smoothly in formal register',
                icon: 'Sliders',
                color: 'indigo',
                estimatedMinutes: 60,
                skills: ['grammar', 'vocabulary'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'b2.2-u2',
                stage: 'B2',
                titleAr: 'روابط الرغم (Despite / In spite of)',
                titleEn: 'Concession (Despite / In spite of)',
                descriptionAr: 'استخدام الأسماء وجمل gerund للتعبير عن التنازل',
                descriptionEn: 'Using noun phrases for formal concession',
                icon: 'Shield',
                color: 'indigo',
                estimatedMinutes: 60,
                skills: ['grammar'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'b2.2-u3',
                stage: 'B2',
                titleAr: 'الروابط الرسمية (Furthermore, Consequently, Hence)',
                titleEn: 'Formal Connectors',
                descriptionAr: 'هيكلة الأبحاث والرسائل الرسمية للأعمال',
                descriptionEn: 'Adding weight and sequence to professional writing',
                icon: 'ExternalLink',
                color: 'indigo',
                estimatedMinutes: 60,
                skills: ['vocabulary', 'grammar'],
                lessons: [],
                checkpointTest: [],
              },
            ],
          },
          {
            id: 'b2.2-m2',
            phaseId: 'B2.2',
            titleAr: 'الخطاب الإقناعي والمناظرة',
            titleEn: 'Persuasive Speech & Debate',
            skills: ['pronunciation', 'listening'],
            units: [
              {
                id: 'b2.2-u4',
                stage: 'B2',
                titleAr: 'بناء الحجة المنطقية (Claim, Reason, Evidence)',
                titleEn: 'Structured Logical Arguments',
                descriptionAr: 'صياغة الموقف وتدعيمه بالأدلة',
                descriptionEn: 'Building sound arguments with evidence',
                icon: 'CheckCircle2',
                color: 'indigo',
                estimatedMinutes: 60,
                skills: ['vocabulary', 'pronunciation'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'b2.2-u5',
                stage: 'B2',
                titleAr: 'تفنيد الحجج المنافسة (Counterarguments)',
                titleEn: 'Refuting Counterarguments',
                descriptionAr: 'توقع الاعتراض والرد عليه بقوة ودبلوماسية',
                descriptionEn: 'Anticipating and dismantling opposing points',
                icon: 'XOctagon',
                color: 'indigo',
                estimatedMinutes: 60,
                skills: ['listening', 'pronunciation'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'b2.2-u6',
                stage: 'B2',
                titleAr: 'تمارين المناظرة التفاعلية',
                titleEn: 'Debate Drills & Live Simulation',
                descriptionAr: 'محاكاة النقاشات الساخنة في القضايا العامة',
                descriptionEn: 'Simulated debate on hot topics',
                icon: 'Mic',
                color: 'indigo',
                estimatedMinutes: 60,
                skills: ['pronunciation', 'listening'],
                lessons: [],
                checkpointTest: [],
              },
            ],
          },
        ],
      },
      {
        id: 'B2.3',
        level: 'B2',
        order: 3,
        titleAr: 'B2.3: الإنجليزية المهنية والأكاديمية',
        titleEn: 'B2.3: Professional & Academic English',
        descriptionAr: 'اجتماعات الشركات، العروض التقديمية، وتحليل المقالات والبيانات الأكاديمية',
        descriptionEn: 'Workplace meetings, presentations, academic analysis, and executive summaries',
        estimatedMinutes: 480,
        masteryCheckId: 'b2.3-mastery',
        modules: [
          {
            id: 'b2.3-m1',
            phaseId: 'B2.3',
            titleAr: 'التواصل في بيئة العمل الشركاتية',
            titleEn: 'Corporate Workplace Communication',
            skills: ['vocabulary', 'listening'],
            units: [
              {
                id: 'b2.3-u1',
                stage: 'B2',
                titleAr: 'إدارة وتوجيه اجتماعات العمل',
                titleEn: 'Facilitating Meetings',
                descriptionAr: 'افتتاح الاجتماع، تحديد الجدول، وإتاحة الفرص',
                descriptionEn: 'Opening meetings, setting agenda, and moderating',
                icon: 'Users',
                color: 'indigo',
                estimatedMinutes: 60,
                skills: ['vocabulary', 'pronunciation'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'b2.3-u2',
                stage: 'B2',
                titleAr: 'المراسلات المهنية المتقدمة',
                titleEn: 'Advanced Corporate Emailing',
                descriptionAr: 'التفاوض وشرح التحديات عبر البريد',
                descriptionEn: 'Negotiation and escalation over email',
                icon: 'Mail',
                color: 'indigo',
                estimatedMinutes: 60,
                skills: ['grammar', 'vocabulary'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'b2.3-u3',
                stage: 'B2',
                titleAr: 'تقديم العروض التقديمية (Pitch & Presentation)',
                titleEn: 'Delivering Presentations',
                descriptionAr: 'جذب الجمهور والتنقل بين شرائح العرض',
                descriptionEn: 'Engaging audiences and signposting slides',
                icon: 'Tv',
                color: 'indigo',
                estimatedMinutes: 60,
                skills: ['pronunciation', 'vocabulary'],
                lessons: [],
                checkpointTest: [],
              },
            ],
          },
          {
            id: 'b2.3-m2',
            phaseId: 'B2.3',
            titleAr: 'القراءة والتحليل الأكاديمي',
            titleEn: 'Academic Reading & Data',
            skills: ['vocabulary', 'listening'],
            units: [
              {
                id: 'b2.3-u4',
                stage: 'B2',
                titleAr: 'تحليل الأوراق البحثية والمقالات',
                titleEn: 'Analyzing Research Articles',
                descriptionAr: 'استخلاص المنهجيات والنتائج الرئيسية',
                descriptionEn: 'Extracting methodologies and findings',
                icon: 'BookOpen',
                color: 'indigo',
                estimatedMinutes: 60,
                skills: ['vocabulary', 'grammar'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'b2.3-u5',
                stage: 'B2',
                titleAr: 'قراءة الرسوم البيانية والإحصاءات',
                titleEn: 'Data Interpretation & Graphs',
                descriptionAr: 'وصف اتجاهات النمو والهبوط والإحصاء',
                descriptionEn: 'Describing trends, charts, and statistics',
                icon: 'BarChart2',
                color: 'indigo',
                estimatedMinutes: 60,
                skills: ['vocabulary'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'b2.3-u6',
                stage: 'B2',
                titleAr: 'كتابة المخصات التنفيذية (Executive Summaries)',
                titleEn: 'Drafting Executive Summaries',
                descriptionAr: 'كتابة تقرير موجز يلخص مشروعات كاملة',
                descriptionEn: 'Summarizing long proposals concisely',
                icon: 'FileText',
                color: 'indigo',
                estimatedMinutes: 60,
                skills: ['grammar', 'vocabulary'],
                lessons: [],
                checkpointTest: [],
              },
            ],
          },
        ],
      },
    ],
  },

  // ====================== LEVEL C1 ======================
  {
    level: 'C1',
    titleAr: 'المستوى C1: طلاقة المحترفين والعلماء',
    titleEn: 'Level C1: Advanced Professional Fluency',
    descriptionAr: 'الدقة اللغوية المتناهية، النبرة الثقافية، أدوات التحوط الأكاديمي، والارتجال بلا صعوبة',
    descriptionEn: 'Full register nuance, idioms, cleft sentences, hedging, stress-free impromptu speech, and critical voice',
    color: 'fuchsia',
    icon: 'Crown',
    estimatedMinutes: 2400,
    capstoneLessonId: 'c1-capstone',
    canDo: [
      { id: 'c1-cd-1', textAr: 'التعبير عن الأفكار المعقدة بطلاقة وتلقائية وبدون بحث عن الكلمات', textEn: 'Express ideas fluently and spontaneously without searching for words' },
      { id: 'c1-cd-2', textAr: 'إتقان التمايز بين السجلات اللغوية الرسمية وغير الرسمية والمصطلحات', textEn: 'Master formal vs informal registers, idioms, and context collocations' },
      { id: 'c1-cd-3', textAr: 'استخدام الجمل المركبة المعقدة وأسلوب التحوط الأكاديمي', textEn: 'Use modal hedging and participle/cleft clauses in complex discourse' },
      { id: 'c1-cd-4', textAr: 'فهم الخطابات السريعة والبودكاست والمقالات الأكاديمية تحت الضغط', textEn: 'Understand extended speech, podcasts, and articles under pressure' },
      { id: 'c1-cd-5', textAr: 'إلقاء خطابات ارتجالية والمشاركة في مناظرات بمستوى يضاهي المتحدث الأصلي', textEn: 'Deliver impromptu speeches and engage in panels with near-native nuance' },
    ],
    phases: [
      {
        id: 'C1.1',
        level: 'C1',
        order: 1,
        titleAr: 'C1.1: الدقة والنبرة والتحوط',
        titleEn: 'C1.1: Nuance & Subtlety',
        descriptionAr: 'السجلات اللغوية، التعبيرات الاصطلاحية، وأسلوب التحوط الأكاديمي',
        descriptionEn: 'Formal/informal nuances, native collocations, phrasal verbs, academic hedging',
        estimatedMinutes: 780,
        masteryCheckId: 'c1.1-mastery',
        modules: [
          {
            id: 'c1.1-m1',
            phaseId: 'C1.1',
            titleAr: 'السجل اللغوي والتعبيرات الاصطلاحية',
            titleEn: 'Advanced Register & Idioms',
            skills: ['vocabulary', 'pronunciation'],
            units: [
              {
                id: 'c1.1-u1',
                stage: 'C1',
                titleAr: 'السجل الرسمي مقابل العامي المتقدم',
                titleEn: 'Formal vs Informal Register Nuance',
                descriptionAr: 'التحول المرن بين أسلوب الشارع ولغة مجلس الإدارة',
                descriptionEn: 'Seamlessly switching tone between casual and executive',
                icon: 'Sliders',
                color: 'fuchsia',
                estimatedMinutes: 90,
                skills: ['vocabulary', 'pronunciation'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'c1.1-u2',
                stage: 'C1',
                titleAr: 'المصطلحات الثقافية والمجازية (Native Idioms)',
                titleEn: 'Native Idiomatic Expressions',
                descriptionAr: 'استخدام تعبيرات المتحدث الأصلي بسياقها الصحيح',
                descriptionEn: 'Using native idioms naturally in context',
                icon: 'Sparkles',
                color: 'fuchsia',
                estimatedMinutes: 90,
                skills: ['vocabulary'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'c1.1-u3',
                stage: 'C1',
                titleAr: 'المتلازمات اللفظية القوية (Advanced Collocations)',
                titleEn: 'Advanced Collocations',
                descriptionAr: 'تركيبات الكلمات الطبيعية الشديدة الدقة',
                descriptionEn: 'High-level word pairings used by experts',
                icon: 'Link',
                color: 'fuchsia',
                estimatedMinutes: 90,
                skills: ['vocabulary', 'grammar'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'c1.1-u4',
                stage: 'C1',
                titleAr: 'الأفعال المركبة المركبة (Phrasal Verbs in Context)',
                titleEn: 'Phrasal Verbs in Context',
                descriptionAr: 'تجاوز المعنى الحرفي للأفعال المرفوقة بحروف جر',
                descriptionEn: 'Mastering multi-word verbs in professional usage',
                icon: 'Zap',
                color: 'fuchsia',
                estimatedMinutes: 90,
                skills: ['vocabulary'],
                lessons: [],
                checkpointTest: [],
              },
            ],
          },
          {
            id: 'c1.1-m2',
            phaseId: 'C1.1',
            titleAr: 'التحوط الأكاديمي واللغة اللبقة',
            titleEn: 'Modality & Academic Hedging',
            skills: ['grammar', 'vocabulary'],
            units: [
              {
                id: 'c1.1-u5',
                stage: 'C1',
                titleAr: 'الأفعال الناقصة المتقدمة (Advanced Modals)',
                titleEn: 'Advanced Modals & Probability',
                descriptionAr: 'صياغة الاحتمالية الدقيقة: might well, bound to, highly likely',
                descriptionEn: 'Subtle degrees of certainty and obligation',
                icon: 'HelpCircle',
                color: 'fuchsia',
                estimatedMinutes: 100,
                skills: ['grammar'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'c1.1-u6',
                stage: 'C1',
                titleAr: 'تلطيف الادعاءات في النقاشات',
                titleEn: 'Softening Claims & Assertions',
                descriptionAr: 'تجنب الأحكام المطلقة بأسلوب أكاديمي محترف',
                descriptionEn: 'Avoiding over-generalizations in debate',
                icon: 'ShieldAlert',
                color: 'fuchsia',
                estimatedMinutes: 100,
                skills: ['vocabulary', 'pronunciation'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'c1.1-u7',
                stage: 'C1',
                titleAr: 'أسلوب التحوط في الكتابة الأكاديمية (Hedging)',
                titleEn: 'Academic Hedging Techniques',
                descriptionAr: 'استخدام Seem, Appear, Tend to, Supposedly',
                descriptionEn: 'Precision hedging in papers and reports',
                icon: 'FileText',
                color: 'fuchsia',
                estimatedMinutes: 100,
                skills: ['grammar', 'vocabulary'],
                lessons: [],
                checkpointTest: [],
              },
            ],
          },
        ],
      },
      {
        id: 'C1.2',
        level: 'C1',
        order: 2,
        titleAr: 'C1.2: الخطاب المعقد والاستماع المكثف',
        titleEn: 'C1.2: Complex Discourse & High-Speed Audio',
        descriptionAr: 'جمل الموصول المتقدمة، جمل التقسيم (Cleft)، والاستماع تحت الضغط',
        descriptionEn: 'Advanced relative/cleft clauses, participle phrases, fast podcasts & real-time notes',
        estimatedMinutes: 780,
        masteryCheckId: 'c1.2-mastery',
        modules: [
          {
            id: 'c1.2-m1',
            phaseId: 'C1.2',
            titleAr: 'تراكيب الجمل المتعددة البنود',
            titleEn: 'Multi-Clause Structures',
            skills: ['grammar', 'vocabulary'],
            units: [
              {
                id: 'c1.2-u1',
                stage: 'C1',
                titleAr: 'جمل الموصول المتقدمة والحذف',
                titleEn: 'Advanced Relative Clauses & Reduced Forms',
                descriptionAr: 'اختصار وتعميق جمل الموصول بلا تكلف',
                descriptionEn: 'Reducing relative clauses for natural flow',
                icon: 'GitMerge',
                color: 'fuchsia',
                estimatedMinutes: 100,
                skills: ['grammar'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'c1.2-u2',
                stage: 'C1',
                titleAr: 'جمل اسم الفاعل والمفعول (Participle Clauses)',
                titleEn: 'Participle Clauses (Having done...)',
                descriptionAr: 'دمج جملتين في جملة واحدة ذات بلاغة عالية',
                descriptionEn: 'Combining complex events with participle phrases',
                icon: 'Layers',
                color: 'fuchsia',
                estimatedMinutes: 100,
                skills: ['grammar'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'c1.2-u3',
                stage: 'C1',
                titleAr: 'جمل التقسيم والتأكيد (Cleft Sentences: What I mean is...)',
                titleEn: 'Cleft Sentences for Emphasis',
                descriptionAr: 'التركيز الشديد على نقطة معينة لإبرازها',
                descriptionEn: 'Adding rhetorical focus using cleft structures',
                icon: 'Sparkles',
                color: 'fuchsia',
                estimatedMinutes: 100,
                skills: ['grammar', 'pronunciation'],
                lessons: [],
                checkpointTest: [],
              },
            ],
          },
          {
            id: 'c1.2-m2',
            phaseId: 'C1.2',
            titleAr: 'القراءة والاستماع تحت الضغط',
            titleEn: 'Reading & Listening Under Pressure',
            skills: ['listening', 'vocabulary'],
            units: [
              {
                id: 'c1.2-u4',
                stage: 'C1',
                titleAr: 'تحليل المقالات المطولة والمعقدة',
                titleEn: 'Extended Complex Articles',
                descriptionAr: 'قراءة وفهم المقالات من Economist & Nature',
                descriptionEn: 'Dissecting dense long-form journalism',
                icon: 'BookOpen',
                color: 'fuchsia',
                estimatedMinutes: 100,
                skills: ['vocabulary', 'listening'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'c1.2-u5',
                stage: 'C1',
                titleAr: 'متابعة البودكاست السريع واللكنات المتعددة',
                titleEn: 'Fast-Paced Podcasts & Accents',
                descriptionAr: 'فهم الكلام السريع بوجود لكنات إنجليزية مختلفة',
                descriptionEn: 'Deciphering rapid native speech across global accents',
                icon: 'Headphones',
                color: 'fuchsia',
                estimatedMinutes: 100,
                skills: ['listening'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'c1.2-u6',
                stage: 'C1',
                titleAr: 'تدوين الملاحظات الفوري أثناء الاستماع',
                titleEn: 'Real-Time Note Taking',
                descriptionAr: 'تسجيل الأفكار الرئيسية بدقة أثناء المحاضرات',
                descriptionEn: 'Capturing core arguments live during talks',
                icon: 'Edit3',
                color: 'fuchsia',
                estimatedMinutes: 100,
                skills: ['listening', 'vocabulary'],
                lessons: [],
                checkpointTest: [],
              },
            ],
          },
        ],
      },
      {
        id: 'C1.3',
        level: 'C1',
        order: 3,
        titleAr: 'C1.3: الإتقان والصوت الخاص',
        titleEn: 'C1.3: Mastery & Personal Voice',
        descriptionAr: 'الكتابة النقدية والإبداعية، والحديث الارتجالي تحت الضغط',
        descriptionEn: 'Critical essays, creative prose, impromptu speaking, panel discussion mastery',
        estimatedMinutes: 840,
        masteryCheckId: 'c1.3-mastery',
        modules: [
          {
            id: 'c1.3-m1',
            phaseId: 'C1.3',
            titleAr: 'الكتابة الإبداعية والنقدية',
            titleEn: 'Creative & Critical Writing',
            skills: ['grammar', 'vocabulary'],
            units: [
              {
                id: 'c1.3-u1',
                stage: 'C1',
                titleAr: 'كتابة المقال الإقناعي النقدي',
                titleEn: 'Critical Argumentation Essays',
                descriptionAr: 'هيكلة مقال بأسلوب فلسفي وأكاديمي متميز',
                descriptionEn: 'Drafting high-level persuasive opinion papers',
                icon: 'PenTool',
                color: 'fuchsia',
                estimatedMinutes: 110,
                skills: ['grammar', 'vocabulary'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'c1.3-u2',
                stage: 'C1',
                titleAr: 'المراجعات النقدية للأعمال الفكرية',
                titleEn: 'Critical Reviews & Synthesis',
                descriptionAr: 'تقييم الكتب والسياسات والاستراتيجيات',
                descriptionEn: 'Synthesizing complex ideas into sharp reviews',
                icon: 'Star',
                color: 'fuchsia',
                estimatedMinutes: 110,
                skills: ['vocabulary'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'c1.3-u3',
                stage: 'C1',
                titleAr: 'الكتابة الإبداعية والسرد المتقدم',
                titleEn: 'Creative Writing & Tone Control',
                descriptionAr: 'التحكم في العاطفة والجرس الموسيقي للجمل',
                descriptionEn: 'Mastering tone, rhythm, and prose aesthetics',
                icon: 'Feather',
                color: 'fuchsia',
                estimatedMinutes: 110,
                skills: ['vocabulary', 'grammar'],
                lessons: [],
                checkpointTest: [],
              },
            ],
          },
          {
            id: 'c1.3-m2',
            phaseId: 'C1.3',
            titleAr: 'التحدث تحت الضغط في المحافل',
            titleEn: 'Speaking Under Pressure & Panels',
            skills: ['pronunciation', 'listening'],
            units: [
              {
                id: 'c1.3-u4',
                stage: 'C1',
                titleAr: 'الحديث الارتجالي (Impromptu Speech)',
                titleEn: 'Impromptu Speech Mastery',
                descriptionAr: 'التحدث لمدة 3 دقائق في موضوع مفاجئ بلا تردد',
                descriptionEn: 'Speaking on sudden topics instantly with structure',
                icon: 'Mic',
                color: 'fuchsia',
                estimatedMinutes: 110,
                skills: ['pronunciation'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'c1.3-u5',
                stage: 'C1',
                titleAr: 'المشاركة في جلسات الحوار (Panel Discussions)',
                titleEn: 'Panel Discussion Dynamics',
                descriptionAr: 'المداخلة والتعقيب وتسيير الحوار بين الخبراء',
                descriptionEn: 'Interjecting and moderating expert discussions',
                icon: 'Users',
                color: 'fuchsia',
                estimatedMinutes: 110,
                skills: ['listening', 'pronunciation'],
                lessons: [],
                checkpointTest: [],
              },
              {
                id: 'c1.3-u6',
                stage: 'C1',
                titleAr: 'السرد القصصي ذو النبرات الدقيقة',
                titleEn: 'Nuanced Storytelling & Humour',
                descriptionAr: 'استخدام السخرية اللطيفة والتنقل بالنبرة',
                descriptionEn: 'Using subtle wit, sarcasm, and tone shifts',
                icon: 'Smile',
                color: 'fuchsia',
                estimatedMinutes: 110,
                skills: ['pronunciation', 'vocabulary'],
                lessons: [],
                checkpointTest: [],
              },
            ],
          },
        ],
      },
    ],
  },
];

// Initialize all unit lesson nodes cached per (target language, dictionary-loaded state)
const _cachedTreesByLang: Record<string, LevelNode[]> = {};

export function getCefrLevelHierarchy(targetLang: TargetLanguage = 'en'): LevelNode[] {
  const cacheKey = dictLoadedKey(targetLang);
  if (_cachedTreesByLang[cacheKey]) return _cachedTreesByLang[cacheKey];

  // Deep clone master definition and scaffold lesson nodes for each unit
  const levels: LevelNode[] = JSON.parse(JSON.stringify(CEFR_LEVELS_MASTER));
  const targetName = TARGET_LANGUAGE_META[targetLang]?.nameAr || 'الإنجليزية';

  levels.forEach((level) => {
    if (targetLang !== 'en') {
      level.titleAr = level.titleAr.replace(/الإنجليزية/g, targetName).replace(/إنجليزية/g, targetName);
    }
    level.phases.forEach((phase) => {
      if (targetLang !== 'en') {
        phase.titleAr = sanitizeUnitTitleAr(phase.titleAr, targetLang)
          .replace(/الإنجليزية/g, targetName)
          .replace(/إنجليزية/g, targetName);
      }
      phase.modules.forEach((mod) => {
        if (targetLang !== 'en') {
          mod.titleAr = sanitizeUnitTitleAr(mod.titleAr, targetLang)
            .replace(/الإنجليزية/g, targetName)
            .replace(/إنجليزية/g, targetName);
        }
        mod.units.forEach((unit) => {
          let sanitizedAr = sanitizeUnitTitleAr(unit.titleAr, targetLang);
          if (targetLang !== 'en') {
            sanitizedAr = sanitizedAr.replace(/الإنجليزية/g, targetName).replace(/إنجليزية/g, targetName);
          }
          unit.titleAr = sanitizedAr;
          if (unit.descriptionAr) {
            unit.descriptionAr = sanitizeDescriptionAr(unit.descriptionAr, targetLang);
          }
          const mappedStage: CefrStage = level.level === 'A1' ? 'A1' : level.level === 'A2' ? 'A2' : level.level === 'B1' ? 'B1' : level.level === 'B2' ? 'B2' : 'C1';
          unit.lessons = createLessonsForUnit(
            unit.id,
            mappedStage,
            level.level,
            phase.id,
            mod.id,
            sanitizedAr,
            unit.titleEn,
            mod.skills,
            4,
            targetLang
          );
        });
      });
    });
  });

  _cachedTreesByLang[cacheKey] = levels;
  return levels;
}

/**
 * Returns all lesson nodes flattened across all levels
 */
export function getAllHierarchicalLessons(targetLang: TargetLanguage = 'en'): LessonNode[] {
  const hierarchy = getCefrLevelHierarchy(targetLang);
  const lessons: LessonNode[] = [];
  hierarchy.forEach((level) => {
    level.phases.forEach((phase) => {
      phase.modules.forEach((mod) => {
        mod.units.forEach((unit) => {
          lessons.push(...unit.lessons);
        });
      });
    });
  });
  return lessons;
}

/**
 * Hierarchical Unlock Evaluation Functions
 */

export function isHierarchicalLevelUnlocked(
  state: ProgressionState,
  levelId: CefrLevelId
): boolean {
  if (levelId === 'A1') return true; // A1 unlocked by default
  const levels: CefrLevelId[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
  const index = levels.indexOf(levelId);
  if (index <= 0) return true;

  // Placement test override
  if (state.placementResult) {
    const placedIndex = levels.indexOf(state.placementResult.levelId);
    if (index <= placedIndex) return true;
  }

  const prevLevelId = levels[index - 1];
  const capResult = state.capstoneResults?.[prevLevelId];
  if (capResult && capResult.passed) return true;

  // Auto-unlock if user has completed >= 80% of previous level lessons
  const prevLevelLessons = getAllHierarchicalLessons().filter((l) => l.levelId === prevLevelId);
  if (prevLevelLessons.length === 0) return false;
  const completedPrevCount = prevLevelLessons.filter((l) => state.completedLessonIds.includes(l.id)).length;
  return completedPrevCount / prevLevelLessons.length >= 0.8;
}

export function isHierarchicalPhaseUnlocked(
  state: ProgressionState,
  phaseId: PhaseId
): boolean {
  if (phaseId === 'A1.1') return true;
  const levelId = phaseId.split('.')[0] as CefrLevelId;
  if (!isHierarchicalLevelUnlocked(state, levelId)) return false;

  const hierarchy = getCefrLevelHierarchy();
  const levelNode = hierarchy.find((l) => l.level === levelId);
  if (!levelNode) return false;

  const phaseIndex = levelNode.phases.findIndex((p) => p.id === phaseId);
  if (phaseIndex <= 0) return true; // First phase of an unlocked level is unlocked

  if (state.placementResult && state.placementResult.levelId === levelId) {
    const placedPhaseNumber = parseFloat(state.placementResult.phaseId.replace(/[^\d.]/g, '') || '1.1');
    const currPhaseNumber = parseFloat(phaseId.replace(/[^\d.]/g, '') || '1.1');
    if (currPhaseNumber <= placedPhaseNumber) return true;
  }

  const prevPhase = levelNode.phases[phaseIndex - 1];
  const prevPhaseLessons: LessonNode[] = [];
  prevPhase.modules.forEach((m) => m.units.forEach((u) => prevPhaseLessons.push(...u.lessons)));

  if (prevPhaseLessons.length === 0) return true;
  const completedCount = prevPhaseLessons.filter((l) => state.completedLessonIds.includes(l.id)).length;

  const isMasteryPassed = !prevPhase.masteryCheckId || (state.capstoneResults?.[prevPhase.id]?.passed ?? true);
  return (completedCount / prevPhaseLessons.length >= 0.7) && isMasteryPassed;
}

export function isHierarchicalModuleUnlocked(
  state: ProgressionState,
  moduleId: ModuleId,
  phaseId: PhaseId
): boolean {
  if (!isHierarchicalPhaseUnlocked(state, phaseId)) return false;

  const hierarchy = getCefrLevelHierarchy();
  const levelId = phaseId.split('.')[0] as CefrLevelId;
  const levelNode = hierarchy.find((l) => l.level === levelId);
  const phaseNode = levelNode?.phases.find((p) => p.id === phaseId);
  if (!phaseNode) return false;

  const modIndex = phaseNode.modules.findIndex((m) => m.id === moduleId);
  if (modIndex <= 0) return true; // First module of unlocked phase is unlocked

  const prevMod = phaseNode.modules[modIndex - 1];
  const prevModLessons: LessonNode[] = [];
  prevMod.units.forEach((u) => prevModLessons.push(...u.lessons));

  if (prevModLessons.length === 0) return true;
  const completedCount = prevModLessons.filter((l) => state.completedLessonIds.includes(l.id)).length;
  return completedCount / prevModLessons.length >= 0.7;
}

export function isHierarchicalUnitUnlocked(
  state: ProgressionState,
  unitId: string,
  moduleId: ModuleId,
  phaseId: PhaseId
): boolean {
  if (!isHierarchicalModuleUnlocked(state, moduleId, phaseId)) return false;

  const hierarchy = getCefrLevelHierarchy();
  const levelId = phaseId.split('.')[0] as CefrLevelId;
  const levelNode = hierarchy.find((l) => l.level === levelId);
  const phaseNode = levelNode?.phases.find((p) => p.id === phaseId);
  const modNode = phaseNode?.modules.find((m) => m.id === moduleId);
  if (!modNode) return false;

  const unitIndex = modNode.units.findIndex((u) => u.id === unitId);
  if (unitIndex <= 0) return true; // First unit of unlocked module is unlocked

  const prevUnit = modNode.units[unitIndex - 1];
  if (prevUnit.lessons.length === 0) return true;
  const completedCount = prevUnit.lessons.filter((l) => state.completedLessonIds.includes(l.id)).length;
  return completedCount / prevUnit.lessons.length >= 0.7;
}

export function isHierarchicalLessonUnlocked(
  state: ProgressionState,
  lesson: LessonNode
): boolean {
  if (state.completedLessonIds.includes(lesson.id)) return true;

  const phaseId = lesson.phaseId || 'A1.1';
  const moduleId = lesson.moduleId || 'a1.1-m1';
  const unitId = lesson.unitId;

  if (!isHierarchicalUnitUnlocked(state, unitId, moduleId, phaseId)) return false;

  const hierarchy = getCefrLevelHierarchy();
  const levelId = (lesson.levelId || 'A1') as CefrLevelId;
  const levelNode = hierarchy.find((l) => l.level === levelId);
  const phaseNode = levelNode?.phases.find((p) => p.id === phaseId);
  const modNode = phaseNode?.modules.find((m) => m.id === moduleId);
  const unitNode = modNode?.units.find((u) => u.id === unitId);

  if (!unitNode || unitNode.lessons.length === 0) return true;

  const lessonIndex = unitNode.lessons.findIndex((l) => l.id === lesson.id);
  if (lessonIndex <= 0) return true; // First lesson of unlocked unit is unlocked

  const prevLesson = unitNode.lessons[lessonIndex - 1];
  return state.completedLessonIds.includes(prevLesson.id);
}

/**
 * Skill Tree Radar Calculator (Grammar, Vocabulary, Pronunciation, Listening)
 */
export function calculateLevelSkillNodes(
  state: ProgressionState,
  levelId: CefrLevelId
): Record<SkillBranch, { xp: number; mastery: number }> {
  const branches: SkillBranch[] = ['grammar', 'vocabulary', 'pronunciation', 'listening'];
  const result: Record<SkillBranch, { xp: number; mastery: number }> = {
    grammar: { xp: 0, mastery: 0 },
    vocabulary: { xp: 0, mastery: 0 },
    pronunciation: { xp: 0, mastery: 0 },
    listening: { xp: 0, mastery: 0 },
  };

  const levelLessons = getAllHierarchicalLessons().filter((l) => l.levelId === levelId);
  const totalLessons = levelLessons.length || 1;

  branches.forEach((branch) => {
    const branchLessons = levelLessons.filter((l) => l.skills?.includes(branch));
    const completedBranchLessons = branchLessons.filter((l) => state.completedLessonIds.includes(l.id));

    const totalAvailableXp = branchLessons.length * (levelId === 'A1' ? 10 : levelId === 'A2' ? 15 : levelId === 'B1' ? 20 : levelId === 'B2' ? 30 : 40);
    const earnedXp = completedBranchLessons.length * (levelId === 'A1' ? 10 : levelId === 'A2' ? 15 : levelId === 'B1' ? 20 : levelId === 'B2' ? 30 : 40);

    const mastery = totalAvailableXp > 0 ? Math.min(1.0, earnedXp / totalAvailableXp) : 0;

    result[branch] = {
      xp: earnedXp,
      mastery: Number(mastery.toFixed(2)),
    };
  });

  return result;
}

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generates Level Capstone Lesson
 */
export function generateCapstoneLesson(levelId: CefrLevelId): LessonNode {
  const levelNode = CEFR_LEVELS_MASTER.find((l) => l.level === levelId) || CEFR_LEVELS_MASTER[0];
  const rawExercises = createExercisesForUnit(`capstone-${levelId}`, levelNode.titleEn, levelNode.titleAr, ['grammar', 'vocabulary', 'listening', 'pronunciation'], 20);
  const exercises = shuffleArray(rawExercises);

  return {
    id: `${levelId.toLowerCase()}-capstone`,
    unitId: `capstone-unit-${levelId}`,
    stage: levelId === 'A1' ? 'A1' : levelId === 'A2' ? 'A2' : levelId === 'B1' ? 'B1' : levelId === 'B2' ? 'B2' : 'C1',
    levelId,
    phaseId: `${levelId}.3`,
    moduleId: `${levelId.toLowerCase()}.3-m2`,
    titleAr: `اختبار الإتقان الختامي — ${levelNode.titleAr}`,
    titleEn: `Final Capstone Assessment — ${levelNode.titleEn}`,
    descriptionAr: `اختبار شامل لقياس كافة المهارات وبيانات Can-Do للمستوى ${levelId}`,
    descriptionEn: `Comprehensive capstone assessment evaluating all ${levelId} can-do competencies`,
    icon: 'Crown',
    estimatedMinutes: 20,
    skills: ['grammar', 'vocabulary', 'pronunciation', 'listening'],
    exercises,
  };
}

/**
 * Generates Phase Mastery Check Lesson
 */
export function generatePhaseMasteryCheck(phaseId: PhaseId): LessonNode {
  const levelId = phaseId.split('.')[0] as CefrLevelId;
  const rawExercises = createExercisesForUnit(`mastery-${phaseId}`, `Phase ${phaseId} Assessment`, `اختبار المرحلة ${phaseId}`, ['grammar', 'vocabulary', 'listening'], 10);
  const exercises = shuffleArray(rawExercises);

  return {
    id: `${phaseId.toLowerCase()}-mastery`,
    unitId: `mastery-unit-${phaseId}`,
    stage: levelId === 'A1' ? 'A1' : levelId === 'A2' ? 'A2' : levelId === 'B1' ? 'B1' : levelId === 'B2' ? 'B2' : 'C1',
    levelId,
    phaseId,
    moduleId: `${phaseId.toLowerCase()}-m1`,
    titleAr: `اختبار اجتياز المرحلة ${phaseId}`,
    titleEn: `Phase Mastery Check ${phaseId}`,
    descriptionAr: `تقييم سريع لقياس مدى استيعاب مهارات المرحلة ${phaseId}`,
    descriptionEn: `Mini-assessment evaluating mastery of Phase ${phaseId} skill blocks`,
    icon: 'CheckSquare',
    estimatedMinutes: 10,
    skills: ['grammar', 'vocabulary', 'listening'],
    exercises,
  };
}

/**
 * Generates Adaptive Placement Test
 */
export function generatePlacementTest(): LessonNode {
  const rawExercises = createExercisesForUnit('placement-test', 'CEFR Adaptive Placement', 'تحديد المستوى التكيفي', ['grammar', 'vocabulary', 'listening'], 15);
  const exercises = shuffleArray(rawExercises);

  return {
    id: 'cefr-placement-test',
    unitId: 'placement-unit',
    stage: 'A1',
    levelId: 'A1',
    phaseId: 'A1.1',
    moduleId: 'a1.1-m1',
    titleAr: 'اختبار تحديد المستوى التكيفي (10 دقائق)',
    titleEn: 'Adaptive CEFR Placement Test (10 min)',
    descriptionAr: 'اختبار تقيمي ذكي لتحديد مستواك الحقيقي من A1 إلى C1 بملء الفراغات والبناء',
    descriptionEn: 'Smart adaptive assessment to place your starting level accurately from A1 to C1',
    icon: 'Compass',
    estimatedMinutes: 10,
    skills: ['grammar', 'vocabulary', 'listening', 'pronunciation'],
    exercises,
  };
}

/**
 * Compatibility Shim: Converts LevelNode[] hierarchy into classic StageNode[] format
 * so legacy callers (e.g. buildCourseStructure) work without breaking!
 */
export function convertHierarchyToStageNodes(hierarchy: LevelNode[]): StageNode[] {
  const stageDefs: Array<{ stage: CefrStage; levelId: CefrLevelId; phaseOrder: number }> = [
    { stage: 'Pre-A0', levelId: 'A1', phaseOrder: 1 },
    { stage: 'A0', levelId: 'A1', phaseOrder: 2 },
    { stage: 'A1', levelId: 'A1', phaseOrder: 3 },
    { stage: 'A1+', levelId: 'A2', phaseOrder: 1 },
    { stage: 'A2', levelId: 'A2', phaseOrder: 2 },
    { stage: 'B1', levelId: 'B1', phaseOrder: 1 },
    { stage: 'B1+', levelId: 'B1', phaseOrder: 2 },
    { stage: 'B2', levelId: 'B2', phaseOrder: 1 },
    { stage: 'C1', levelId: 'C1', phaseOrder: 1 },
    { stage: 'C1+', levelId: 'C1', phaseOrder: 2 },
  ];

  return stageDefs.map((def) => {
    const levelNode = hierarchy.find((l) => l.level === def.levelId) || hierarchy[0];
    const phaseNode = levelNode.phases[def.phaseOrder - 1] || levelNode.phases[0];

    const units: UnitNode[] = [];
    phaseNode.modules.forEach((mod) => {
      mod.units.forEach((u) => {
        units.push({
          id: u.id,
          stage: def.stage,
          titleAr: u.titleAr,
          titleEn: u.titleEn,
          descriptionAr: u.descriptionAr,
          descriptionEn: u.descriptionEn,
          icon: u.icon,
          color: u.color,
          lessons: u.lessons,
          checkpointTest: u.lessons[0]?.exercises || [],
        });
      });
    });

    return {
      stage: def.stage,
      titleAr: phaseNode.titleAr,
      titleEn: phaseNode.titleEn,
      descriptionAr: phaseNode.descriptionAr,
      descriptionEn: phaseNode.descriptionEn,
      units,
      stageExam: units[0]?.checkpointTest || [],
    };
  });
}
