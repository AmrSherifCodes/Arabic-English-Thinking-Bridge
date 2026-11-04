import { StageNode, UnitNode, LessonNode, ExerciseItem, ExerciseType, ProgressionState } from './types';
import { PHASES_DATA } from '../data/lessons';
import { TARGET_LANGUAGES, TARGET_LANGUAGE_META } from '../data/languages';
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

type LocalizedTarget = 'de' | 'es' | 'ja';

interface LocalizedLessonDefinition {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  promptAr: string;
  promptEn: string;
  targetSentence: string;
  wordChips: string[];
  breakdownChunks: ExerciseItem['breakdownChunks'];
  explanationAr: string;
  explanationEn: string;
}

const LOCALIZED_A0_LESSONS: Record<LocalizedTarget, LocalizedLessonDefinition[]> = {
  de: [
    {
      id: 'de-a0-v2',
      titleEn: 'German Main-Clause V2 Word Order',
      titleAr: 'ترتيب الفعل في المركز الثاني بالألمانية',
      descriptionEn: 'In a main clause, the conjugated verb occupies the second position.',
      descriptionAr: 'في الجملة الرئيسية يأتي الفعل المصرف في الموقع الثاني.',
      promptAr: 'اليوم أتعلم الألمانية. ضع الفعل في الموقع الثاني.',
      promptEn: 'I am learning German today. Put the conjugated verb in position two.',
      targetSentence: 'Heute lerne ich Deutsch.',
      wordChips: ['Heute', 'lerne', 'ich', 'Deutsch.'],
      breakdownChunks: [
        { arabicText: 'اليوم', englishText: 'Heute', role: 'connector', explanation: 'A time phrase can take the first position.' },
        { arabicText: 'أتعلم', englishText: 'lerne', role: 'verb', explanation: 'The conjugated verb stays in second position.' },
        { arabicText: 'أنا', englishText: 'ich', role: 'subject', explanation: 'The subject follows the verb when another element starts the clause.' },
        { arabicText: 'الألمانية', englishText: 'Deutsch', role: 'object', explanation: 'The language being learned.' },
      ],
      explanationAr: 'بدأنا بظرف الزمن؛ لذلك يأتي الفعل المصرف في الموقع الثاني، ثم الفاعل.',
      explanationEn: 'Starting with a time phrase moves the subject after the verb; the conjugated verb remains second.',
    },
    {
      id: 'de-a0-accusative',
      titleEn: 'The Accusative Object',
      titleAr: 'المفعول به في حالة النصب الألمانية',
      descriptionEn: 'Masculine definite articles change from der to den in the accusative.',
      descriptionAr: 'تتحول أداة الاسم المذكر من der إلى den عندما يكون مفعولاً به.',
      promptAr: 'أنا أرى الرجل. استخدم أداة المفعول به للمذكر.',
      promptEn: 'I see the man. Use the masculine accusative article.',
      targetSentence: 'Ich sehe den Mann.',
      wordChips: ['Ich', 'sehe', 'den', 'Mann.'],
      breakdownChunks: [
        { arabicText: 'أنا', englishText: 'Ich', role: 'subject', explanation: 'The subject performing the action.' },
        { arabicText: 'أرى', englishText: 'sehe', role: 'verb', explanation: 'Conjugated verb in second position.' },
        { arabicText: 'الرجلَ', englishText: 'den Mann', role: 'object', explanation: 'The masculine direct object takes den in the accusative.' },
      ],
      explanationAr: 'الرجل مفعول به مباشر مذكر؛ لذلك نقول den Mann وليس der Mann.',
      explanationEn: 'Mann is a masculine direct object, so its article becomes den.',
    },
    {
      id: 'de-a0-v2-accusative',
      titleEn: 'V2 Order with an Accusative Object',
      titleAr: 'ترتيب الفعل الثاني مع المفعول به',
      descriptionEn: 'Combine a fronted time word, V2 order, and a masculine accusative object.',
      descriptionAr: 'اجمع بين ظرف في البداية والفعل في الموقع الثاني والمفعول به المذكر.',
      promptAr: 'غداً يشتري المعلم تفاحة. انتبه لمكان الفعل وأداة النكرة.',
      promptEn: 'Tomorrow the teacher buys an apple. Keep the verb second.',
      targetSentence: 'Morgen kauft der Lehrer einen Apfel.',
      wordChips: ['Morgen', 'kauft', 'der', 'Lehrer', 'einen', 'Apfel.'],
      breakdownChunks: [
        { arabicText: 'غداً', englishText: 'Morgen', role: 'connector', explanation: 'The time phrase occupies the first position.' },
        { arabicText: 'يشتري', englishText: 'kauft', role: 'verb', explanation: 'The conjugated verb occupies the second position.' },
        { arabicText: 'المعلم', englishText: 'der Lehrer', role: 'subject', explanation: 'The subject follows the verb after the fronted time phrase.' },
        { arabicText: 'تفاحةً', englishText: 'einen Apfel', role: 'object', explanation: 'Apfel is a masculine accusative object, so ein becomes einen.' },
      ],
      explanationAr: 'يأتي الفعل بعد Morgen مباشرة، ويتغير ein إلى einen لأن Apfel مفعول به مذكر.',
      explanationEn: 'The verb follows Morgen in second position; masculine accusative ein changes to einen.',
    },
  ],
  es: [
    {
      id: 'es-a0-gendered-articles',
      titleEn: 'Gendered Articles and Adjective Agreement',
      titleAr: 'أدوات التعريف وتوافق الصفة في الإسبانية',
      descriptionEn: 'Feminine singular nouns use la, and adjectives agree in gender.',
      descriptionAr: 'يأخذ الاسم المؤنث المفرد la وتتوافق الصفة معه في الجنس.',
      promptAr: 'المنزل أبيض. استخدم أداة وصفة مؤنثتين مع casa.',
      promptEn: 'The house is white. Match the article and adjective to feminine casa.',
      targetSentence: 'La casa blanca es grande.',
      wordChips: ['La', 'casa', 'blanca', 'es', 'grande.'],
      breakdownChunks: [
        { arabicText: 'الـ (مؤنث)', englishText: 'La', role: 'modifier', explanation: 'Feminine singular definite article.' },
        { arabicText: 'المنزل', englishText: 'casa', role: 'subject', explanation: 'Casa is a feminine singular noun.' },
        { arabicText: 'أبيض (مؤنث)', englishText: 'blanca', role: 'modifier', explanation: 'The adjective agrees with feminine casa.' },
        { arabicText: 'يكون', englishText: 'es', role: 'verb', explanation: 'Third-person singular form of ser.' },
        { arabicText: 'كبير', englishText: 'grande', role: 'modifier', explanation: 'Predicate adjective; grande has the same form for both genders.' },
      ],
      explanationAr: 'كلمة casa مؤنثة، لذلك نستخدم La وblanca. أما grande فشكلها لا يتغير هنا.',
      explanationEn: 'Casa is feminine, so use La and blanca. Grande has the same singular form for either gender.',
    },
    {
      id: 'es-a0-masculine-articles',
      titleEn: 'Masculine Nouns and Articles',
      titleAr: 'الاسم المذكر وأداة التعريف',
      descriptionEn: 'Masculine singular nouns use el; adjectives ending in -o commonly agree.',
      descriptionAr: 'يأخذ الاسم المذكر المفرد el، وغالباً تنتهي صفته بـ o.',
      promptAr: 'الكتاب أحمر. طابق أداة التعريف والصفة مع الاسم المذكر.',
      promptEn: 'The book is red. Match the article and adjective to masculine libro.',
      targetSentence: 'El libro rojo es nuevo.',
      wordChips: ['El', 'libro', 'rojo', 'es', 'nuevo.'],
      breakdownChunks: [
        { arabicText: 'الـ (مذكر)', englishText: 'El', role: 'modifier', explanation: 'Masculine singular definite article.' },
        { arabicText: 'الكتاب', englishText: 'libro', role: 'subject', explanation: 'Libro is a masculine singular noun.' },
        { arabicText: 'أحمر (مذكر)', englishText: 'rojo', role: 'modifier', explanation: 'The adjective agrees with masculine libro.' },
        { arabicText: 'يكون', englishText: 'es', role: 'verb', explanation: 'Third-person singular form of ser.' },
        { arabicText: 'جديد (مذكر)', englishText: 'nuevo', role: 'modifier', explanation: 'This adjective also agrees with the masculine noun.' },
      ],
      explanationAr: 'نستخدم El مع libro المذكر، وتأتي الصفتان rojo وnuevo بصيغة المذكر.',
      explanationEn: 'Libro is masculine, so its article and agreeing adjectives use masculine forms.',
    },
    {
      id: 'es-a0-verb-conjugation',
      titleEn: 'Present-Tense Verb Conjugation',
      titleAr: 'تصريف الفعل في المضارع',
      descriptionEn: 'Regular -ar verbs change their ending to match the subject.',
      descriptionAr: 'يتغير آخر الفعل المنتهي بـ ar ليتوافق مع الفاعل.',
      promptAr: 'أنا أدرس الإسبانية. صرّف estudiar مع yo.',
      promptEn: 'I study Spanish. Conjugate estudiar for yo.',
      targetSentence: 'Yo estudio español.',
      wordChips: ['Yo', 'estudio', 'español.'],
      breakdownChunks: [
        { arabicText: 'أنا', englishText: 'Yo', role: 'subject', explanation: 'First-person singular subject.' },
        { arabicText: 'أدرس', englishText: 'estudio', role: 'verb', explanation: 'Estudiar changes to estudio for yo in the present tense.' },
        { arabicText: 'الإسبانية', englishText: 'español', role: 'object', explanation: 'The subject being studied; the language name is lowercase in Spanish.' },
      ],
      explanationAr: 'الفعل estudiar من أفعال ar؛ ومع yo نحذف ar ونضيف o ليصبح estudio.',
      explanationEn: 'For a regular -ar verb, remove -ar and add -o for yo: estudiar becomes estudio.',
    },
  ],
  ja: [
    {
      id: 'ja-a0-topic-copula',
      titleEn: 'Topic Particle and the Copula',
      titleAr: 'أداة الموضوع وفعل الربط الياباني',
      descriptionEn: 'Use wa to mark the topic; desu completes a polite nominal sentence.',
      descriptionAr: 'تحدد wa موضوع الجملة، ويكمل desu الجملة الاسمية المهذبة.',
      promptAr: 'أنا طالب. ضع أداة الموضوع بعد أنا وفعل الربط في النهاية.',
      promptEn: 'I am a student. Mark the topic with wa and put the copula at the end.',
      targetSentence: 'Watashi wa gakusei desu.',
      wordChips: ['Watashi', 'wa', 'gakusei', 'desu.'],
      breakdownChunks: [
        { arabicText: 'أنا (موضوع الجملة)', englishText: 'Watashi', role: 'subject', explanation: 'The sentence topic; Japanese often omits it when understood.' },
        { arabicText: 'أداة الموضوع wa', englishText: 'wa', role: 'connector', explanation: 'Wa marks the topic and is pronounced wa.' },
        { arabicText: 'طالب', englishText: 'gakusei', role: 'object', explanation: 'The nominal predicate, student.' },
        { arabicText: 'يكون (مهذب)', englishText: 'desu', role: 'verb', explanation: 'Polite copula placed at the end of the sentence.' },
      ],
      explanationAr: 'اليابانية تضع الفعل أو فعل الربط في النهاية. تكتب は كأداة موضوع لكنها تُنطق wa.',
      explanationEn: 'Japanese places the copula at the end. The topic particle is written は but pronounced wa.',
    },
    {
      id: 'ja-a0-sov-object',
      titleEn: 'SOV Order and the Object Particle',
      titleAr: 'ترتيب الفاعل والمفعول والفعل وأداة المفعول',
      descriptionEn: 'The object marked by o comes before the verb in a basic SOV sentence.',
      descriptionAr: 'يأتي المفعول المحدد بـ o قبل الفعل في ترتيب الفاعل ثم المفعول ثم الفعل.',
      promptAr: 'أنا أشاهد قطة. ضع أداة المفعول o بعد القطة والفعل في النهاية.',
      promptEn: 'I watch a cat. Mark the object with o and place the verb last.',
      targetSentence: 'Watashi wa neko o mimasu.',
      wordChips: ['Watashi', 'wa', 'neko', 'o', 'mimasu.'],
      breakdownChunks: [
        { arabicText: 'أنا (الموضوع)', englishText: 'Watashi', role: 'subject', explanation: 'Topic / subject of the sentence.' },
        { arabicText: 'أداة الموضوع', englishText: 'wa', role: 'connector', explanation: 'Marks what the sentence is about.' },
        { arabicText: 'قطة', englishText: 'neko', role: 'object', explanation: 'The noun receiving the action.' },
        { arabicText: 'أداة المفعول o', englishText: 'o', role: 'connector', explanation: 'Marks the direct object; it is written を and pronounced o.' },
        { arabicText: 'أشاهد', englishText: 'mimasu', role: 'verb', explanation: 'The verb comes last in this SOV sentence.' },
      ],
      explanationAr: 'الترتيب هو الفاعل/الموضوع ثم المفعول ثم الفعل. تحدد を المفعول وتُنطق o.',
      explanationEn: 'The order is subject/topic, object, then verb. The particle を marks the object and is pronounced o.',
    },
    {
      id: 'ja-a0-location-particle',
      titleEn: 'Location Particle and Verb-Final Order',
      titleAr: 'أداة المكان والفعل في نهاية الجملة',
      descriptionEn: 'Use de to mark the place where an action happens, then finish with the verb.',
      descriptionAr: 'تحدد de مكان حدوث الفعل، ثم يأتي الفعل في نهاية الجملة.',
      promptAr: 'أنا أدرس في المنزل. استخدم de للمكان واجعل الفعل أخيراً.',
      promptEn: 'I study at home. Mark the action location with de and put the verb last.',
      targetSentence: 'Watashi wa ie de benkyou shimasu.',
      wordChips: ['Watashi', 'wa', 'ie', 'de', 'benkyou', 'shimasu.'],
      breakdownChunks: [
        { arabicText: 'أنا (الموضوع)', englishText: 'Watashi', role: 'subject', explanation: 'Topic / subject of the sentence.' },
        { arabicText: 'أداة الموضوع', englishText: 'wa', role: 'connector', explanation: 'Marks the topic.' },
        { arabicText: 'المنزل', englishText: 'ie', role: 'modifier', explanation: 'The place where the action occurs.' },
        { arabicText: 'أداة مكان الفعل', englishText: 'de', role: 'connector', explanation: 'Marks the location where an action takes place.' },
        { arabicText: 'دراسة', englishText: 'benkyou', role: 'object', explanation: 'The action noun used with shimasu.' },
        { arabicText: 'أقوم بالفعل', englishText: 'shimasu', role: 'verb', explanation: 'The verb phrase comes at the end.' },
      ],
      explanationAr: 'تأتي أداة المكان de بعد ie، ويأتي الفعل المركب benkyou shimasu في نهاية الجملة.',
      explanationEn: 'The location particle de follows ie, and the verb phrase benkyou shimasu ends the sentence.',
    },
  ],
};

function createLocalizedA0Stage(
  definition: Omit<StageNode, 'units' | 'stageExam'>,
  language: LocalizedTarget
): StageNode {
  const lessonDefinitions = LOCALIZED_A0_LESSONS[language];
  const units: UnitNode[] = lessonDefinitions.map((lessonDefinition, index) => {
    const unitId = `a0-${language}-unit-${index + 1}`;
    const exercise: ExerciseItem = {
      id: `${lessonDefinition.id}-exercise`,
      type: 'structure_builder',
      promptAr: lessonDefinition.promptAr,
      promptEn: lessonDefinition.promptEn,
      targetSentence: lessonDefinition.targetSentence,
      wordChips: lessonDefinition.wordChips,
      options: lessonDefinition.wordChips,
      breakdownChunks: lessonDefinition.breakdownChunks,
      explanationAr: lessonDefinition.explanationAr,
      explanationEn: lessonDefinition.explanationEn,
      skillAxes: ['structure', 'writing', 'vocabulary'],
    };
    const node: LessonNode = {
      id: lessonDefinition.id,
      unitId,
      stage: 'A0',
      titleAr: lessonDefinition.titleAr,
      titleEn: lessonDefinition.titleEn,
      descriptionAr: lessonDefinition.descriptionAr,
      descriptionEn: lessonDefinition.descriptionEn,
      icon: ['🧱', '🧩', '🚀'][index],
      exercises: [exercise],
    };
    return {
      id: unitId,
      stage: 'A0',
      titleAr: `الوحدة ${index + 1} — ${lessonDefinition.titleAr}`,
      titleEn: `Unit ${index + 1} — ${lessonDefinition.titleEn}`,
      descriptionAr: lessonDefinition.descriptionAr,
      descriptionEn: lessonDefinition.descriptionEn,
      icon: ['🧱', '🧩', '🚀'][index],
      color: ['#2DD4BF', '#F5B942', '#3B82F6'][index],
      lessons: [node],
      checkpointTest: [exercise],
    };
  });
  return {
    ...definition,
    units,
    stageExam: units.flatMap((unit) => unit.checkpointTest),
  };
}

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
  const profile = readActiveProfile();
  if (profile && profile.targetLang !== 'en') {
    const language = TARGET_LANGUAGE_META[profile.targetLang];
    if (profile.targetLang === 'de' || profile.targetLang === 'es' || profile.targetLang === 'ja') {
      const higherLevelPlaceholders = STAGE_DEFINITIONS.slice(1).map((definition, index) => {
        const lesson: Lesson = {
          id: `placeholder-${profile.targetLang}-${index + 2}`,
          phaseId: (index + 2) as 1 | 2 | 3,
          phaseTitle: definition.titleEn,
          phaseLevel: definition.stage,
          number: index + 2,
          title: `Welcome to ${language.nameEn} Module ${index + 2}`,
          titleAr: `أهلاً بك في وحدة ${language.nameAr} ${index + 2}`,
          transferConcept: `Your ${language.nameEn} learning path is being prepared.`,
          transferConceptAr: `يتم تجهيز مسار تعلم ${language.nameAr}.`,
          weakSpotTag: 'placeholder',
          exercises: [],
        };
        return createStageNode(definition, [lesson]);
      });
      return [
        createLocalizedA0Stage(STAGE_DEFINITIONS[0], profile.targetLang),
        ...higherLevelPlaceholders,
      ];
    }

    const placeholderLessons: Lesson[] = STAGE_DEFINITIONS.map((definition, index) => {
      const sentence = `Welcome to ${language.nameEn} Module ${index + 1}`;
      const phaseId = (index + 1) as 1 | 2 | 3;
      return {
        id: `placeholder-${profile.targetLang}-${index + 1}`,
        phaseId,
        phaseTitle: definition.titleEn,
        phaseLevel: definition.stage,
        number: index + 1,
        title: sentence,
        titleAr: `أهلاً بك في وحدة ${language.nameAr} ${index + 1}`,
        transferConcept: `Your ${language.nameEn} learning path is being prepared.`,
        transferConceptAr: `يتم تجهيز مسار تعلم ${language.nameAr}.`,
        weakSpotTag: 'placeholder',
        exercises: [{
          id: `placeholder-exercise-${index + 1}`,
          arabicThought: 'ستتوفر دروس هذا المسار قريباً.',
          englishTarget: sentence,
          targetSentence: sentence,
          acceptableAlternatives: [],
          wordChips: sentence.split(' '),
          breakdownChunks: [],
          habitHint: 'This language curriculum is coming soon.',
          habitHintAr: 'سيكون هذا المنهج متاحاً قريباً.',
        }],
      };
    });
    return STAGE_DEFINITIONS.map((definition, index) =>
      createStageNode(definition, [placeholderLessons[index]])
    );
  }

  const lessons = PHASES_DATA.flatMap((phase) => phase.lessons);
  return STAGE_DEFINITIONS.map((definition, index) =>
    createStageNode(
      definition,
      lessons.slice(index * LESSONS_PER_STAGE, (index + 1) * LESSONS_PER_STAGE)
    )
  );
}

function readActiveProfile(): { targetLang: keyof typeof TARGET_LANGUAGE_META } | null {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem('tb.activeProfileConfig');
  if (!raw) return null;
  try {
    const profile: unknown = JSON.parse(raw);
    if (typeof profile !== 'object' || profile === null || !('targetLang' in profile)) return null;
    const targetLang = profile.targetLang;
    return typeof targetLang === 'string' && TARGET_LANGUAGES.some((language) => language.code === targetLang)
      ? { targetLang: targetLang as keyof typeof TARGET_LANGUAGE_META }
      : null;
  } catch {
    return null;
  }
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
