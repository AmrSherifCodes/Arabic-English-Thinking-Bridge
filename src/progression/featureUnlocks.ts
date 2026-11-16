import { CefrStage, ProgressionState } from './types';
import { buildCourseStructure } from './courseData';
import { TargetLanguage } from '../types';

export interface FeatureUnlockDefinition {
  id: string;
  requiredStage: CefrStage;
  requiredLevelNumber: number;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  badgeAr: string;
  badgeEn: string;
  icon: string;
  color: 'amber' | 'emerald' | 'purple' | 'teal' | 'blue' | 'orange' | 'indigo' | 'green';
  working: boolean;
}

export const FEATURE_UNLOCKS: FeatureUnlockDefinition[] = [
  {
    id: 'srs_flashcards',
    requiredStage: 'Pre-A0',
    requiredLevelNumber: 1,
    titleAr: 'المراجعة الذكية اليومية (SM-2 SRS)',
    titleEn: 'Daily SRS Flashcards',
    descriptionAr: 'مراجعة الكلمات والعبارات التكرارية المنظمة قبل نسيانها',
    descriptionEn: 'Spaced repetition memory review right before decay',
    badgeAr: 'مفتوح من المستوى 1',
    badgeEn: 'Unlocked at Level 1',
    icon: '📚',
    color: 'amber',
    working: true,
  },
  {
    id: 'guided_questions',
    requiredStage: 'Pre-A0',
    requiredLevelNumber: 1,
    titleAr: 'الأسئلة التدريبية والمدرب الذكي',
    titleEn: 'Guided Practice & Socratic Coach',
    descriptionAr: 'أسئلة تفاعلية لتشخيص نقاط القوة والضعف وتطوير أسلوبك',
    descriptionEn: 'Interactive socratic questions to diagnose your bridge skills',
    badgeAr: 'مفتوح من المستوى 1',
    badgeEn: 'Unlocked at Level 1',
    icon: '❓',
    color: 'emerald',
    working: true,
  },
  {
    id: 'pronunciation',
    requiredStage: 'A0',
    requiredLevelNumber: 2,
    titleAr: 'مُسجّل النطق المحلّي',
    titleEn: 'Local Pronunciation Recorder',
    descriptionAr: 'سجّل صوتك واستمع إليه محلياً بدون إرساله لأي خادم',
    descriptionEn: 'Record and verify your output 100% on-device',
    badgeAr: 'ينفتح في المستوى 2 (A0)',
    badgeEn: 'Unlocks at Level 2 (A0)',
    icon: '🎙️',
    color: 'purple',
    working: true,
  },
  {
    id: 'ai_voice',
    requiredStage: 'A1',
    requiredLevelNumber: 3,
    titleAr: 'تدريب المحادثة المباشر مع عمرو شريف',
    titleEn: 'Live Voice Conversation with Amr',
    descriptionAr: 'تحدث بصوتك واحصل على تصحيحات فورية لبناء الطلاقة',
    descriptionEn: 'Speak naturally with real-time feedback',
    badgeAr: 'ينفتح في المستوى 3 (A1)',
    badgeEn: 'Unlocks at Level 3 (A1)',
    icon: '💬',
    color: 'teal',
    working: true,
  },
  {
    id: 'corporate',
    requiredStage: 'A1+',
    requiredLevelNumber: 4,
    titleAr: 'من البلدي إلى Corporate',
    titleEn: 'Egyptian to Corporate English',
    descriptionAr: 'تحويل الأفكار العامية والمصرية إلى صياغة بيئة العمل الاحترافية',
    descriptionEn: 'Refine everyday expressions into executive English',
    badgeAr: 'ينفتح في المستوى 4 (A1+)',
    badgeEn: 'Unlocks at Level 4 (A1+)',
    icon: '💼',
    color: 'blue',
    working: true,
  },
  {
    id: 'story',
    requiredStage: 'A2',
    requiredLevelNumber: 5,
    titleAr: 'القصة التفاعلية (Story Engine)',
    titleEn: 'Interactive Story Engine',
    descriptionAr: 'تجربة درامية تفاعلية بالإنجليزية للتعلم من السرد',
    descriptionEn: 'Interactive narrative adventure with real decisions',
    badgeAr: 'ينفتح في المستوى 5 (A2)',
    badgeEn: 'Unlocks at Level 5 (A2)',
    icon: '📖',
    color: 'orange',
    working: true,
  },
  {
    id: 'teacher_mode',
    requiredStage: 'B1',
    requiredLevelNumber: 6,
    titleAr: 'وضع الفصل الدراسي (Teacher Mode)',
    titleEn: 'Classroom Mode (Teacher Mode)',
    descriptionAr: 'عرض تكبير للبروجيكتور + QR لمتابعة الطلاب في الفصول',
    descriptionEn: 'Projector mode and instant student QR codes',
    badgeAr: 'ينفتح في المستوى 6 (B1)',
    badgeEn: 'Unlocks at Level 6 (B1)',
    icon: '🏫',
    color: 'indigo',
    working: true,
  },
  {
    id: 'maintenance',
    requiredStage: 'B1+',
    requiredLevelNumber: 7,
    titleAr: 'دليل صيانة وتسريع الهاتف',
    titleEn: 'Hardware Optimization Guide',
    descriptionAr: '7 خطوات تفاعلية لإطالة عمر هاتفك وتسريعه للأجهزة القديمة',
    descriptionEn: '7 interactive steps to optimize low-end phones',
    badgeAr: 'ينفتح في المستوى 7 (B1+)',
    badgeEn: 'Unlocks at Level 7 (B1+)',
    icon: '🛠️',
    color: 'emerald',
    working: true,
  },
  {
    id: 'hacker_terminal',
    requiredStage: 'B2',
    requiredLevelNumber: 8,
    titleAr: 'الطرفية بايثون (Pyodide Terminal)',
    titleEn: 'Python Pyodide Terminal',
    descriptionAr: 'تشغيل بيئة بايثون محلية واختبار التقويم التقني للغة',
    descriptionEn: 'Local WebAssembly Python environment for technical evaluation',
    badgeAr: 'ينفتح في المستوى 8 (B2)',
    badgeEn: 'Unlocks at Level 8 (B2)',
    icon: '💻',
    color: 'green',
    working: true,
  },
];

export interface FeatureUnlockStatus {
  feature: FeatureUnlockDefinition;
  isUnlocked: boolean;
  requiredLevel: number;
  stageTitleAr: string;
  stageTitleEn: string;
}

export function isFeatureUnlocked(
  featureId: string,
  state: ProgressionState,
  targetLang: TargetLanguage = 'en'
): boolean {
  const feat = FEATURE_UNLOCKS.find((f) => f.id === featureId);
  if (!feat) return true;

  const course = buildCourseStructure(targetLang);
  const activeStageIndex = course.findIndex((s) => s.stage === state.currentStage);
  const requiredStageIndex = course.findIndex((s) => s.stage === feat.requiredStage);

  const safeActive = activeStageIndex >= 0 ? activeStageIndex : 0;
  const safeReq = requiredStageIndex >= 0 ? requiredStageIndex : 0;

  return safeActive >= safeReq;
}

export function getFeatureUnlockStatus(
  featureId: string,
  state: ProgressionState,
  targetLang: TargetLanguage = 'en'
): FeatureUnlockStatus | undefined {
  const feat = FEATURE_UNLOCKS.find((f) => f.id === featureId);
  if (!feat) return undefined;

  const course = buildCourseStructure(targetLang);
  const activeStageIndex = course.findIndex((s) => s.stage === state.currentStage);
  const requiredStageIndex = course.findIndex((s) => s.stage === feat.requiredStage);

  const safeActive = activeStageIndex >= 0 ? activeStageIndex : 0;
  const safeReq = requiredStageIndex >= 0 ? requiredStageIndex : 0;

  const reqStage = course[safeReq];

  return {
    feature: feat,
    isUnlocked: safeActive >= safeReq,
    requiredLevel: feat.requiredLevelNumber,
    stageTitleAr: reqStage ? reqStage.titleAr : feat.requiredStage,
    stageTitleEn: reqStage ? reqStage.titleEn : feat.requiredStage,
  };
}

export function getUnlocksForStage(stage: CefrStage): FeatureUnlockDefinition[] {
  return FEATURE_UNLOCKS.filter((f) => f.requiredStage === stage);
}
