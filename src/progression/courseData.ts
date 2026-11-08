import { StageNode, UnitNode, LessonNode, ExerciseItem, ExerciseType, ProgressionState, CefrStage } from './types';
import { PHASES_DATA } from '../data/lessons';
import { TARGET_LANGUAGES, TARGET_LANGUAGE_META } from '../data/languages';
import { getTargetDictionary } from '../data/dictionaries';
import { assignCEFRLevels } from './cefrSorter';
import type { ChunkRole, Exercise, Lesson, TargetLanguage } from '../types';

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

export type LocalizedTarget = 'de' | 'es' | 'ja' | 'fr' | 'zh' | 'hi' | 'ru' | 'pt' | 'it' | 'el';

export interface LocalizedLessonDefinition {
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

export const LOCALIZED_A0_LESSONS: Record<LocalizedTarget, LocalizedLessonDefinition[]> = {
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
    {
      id: 'de-a0-copula-student',
      titleEn: 'The Present-Tense Copula',
      titleAr: 'فعل الربط في المضارع',
      descriptionEn: 'German uses sein to connect a subject to a noun.',
      descriptionAr: 'تستخدم الألمانية sein للربط بين الفاعل والاسم.',
      promptAr: 'أنا تلميذ. استخدم فعل الربط sein.',
      promptEn: 'I am a school pupil. Use the present-tense copula sein.',
      targetSentence: 'Ich bin Schüler.',
      wordChips: ['Ich', 'bin', 'Schüler.'],
      breakdownChunks: [
        { arabicText: 'أنا', englishText: 'Ich', role: 'subject', explanation: 'The first-person subject.' },
        { arabicText: 'أكون', englishText: 'bin', role: 'verb', explanation: 'Bin is the first-person singular form of sein.' },
        { arabicText: 'تلميذ', englishText: 'Schüler', role: 'object', explanation: 'The noun identifies the subject.' },
      ],
      explanationAr: 'يتغير sein إلى bin مع ich، ويأتي الفعل المصرف في الموقع الثاني.',
      explanationEn: 'Sein becomes bin with ich, and the conjugated verb occupies the second position.',
    },
    {
      id: 'de-a0-v2-accusative-coffee',
      titleEn: 'V2 Order with a Masculine Object',
      titleAr: 'ترتيب V2 مع مفعول مذكر',
      descriptionEn: 'Start with a time expression and use the masculine accusative article.',
      descriptionAr: 'ابدأ بظرف زمن واستخدم أداة المفعول المذكر.',
      promptAr: 'اليوم أشرب القهوة. ضع الفعل في المركز الثاني.',
      promptEn: 'Today I drink the coffee. Keep the conjugated verb in second position.',
      targetSentence: 'Heute trinke ich den Kaffee.',
      wordChips: ['Heute', 'trinke', 'ich', 'den', 'Kaffee.'],
      breakdownChunks: [
        { arabicText: 'اليوم', englishText: 'Heute', role: 'connector', explanation: 'The time phrase takes the first position.' },
        { arabicText: 'أشرب', englishText: 'trinke', role: 'verb', explanation: 'The conjugated verb stays in second position.' },
        { arabicText: 'أنا', englishText: 'ich', role: 'subject', explanation: 'The subject follows the verb after the fronted time phrase.' },
        { arabicText: 'القهوة', englishText: 'den Kaffee', role: 'object', explanation: 'Kaffee is masculine and takes den as a direct object.' },
      ],
      explanationAr: 'بعد Heute يأتي الفعل المصرف مباشرة، ويأخذ Kaffee المذكر أداة den كمفعول به.',
      explanationEn: 'The verb follows Heute; masculine Kaffee takes den as a direct object.',
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
    localizedLesson('es-a0-gendered-adjectives', 'Adjective Agreement with el', 'توافق الصفة مع الاسم المذكر', 'الكلب الصغير لطيف.', 'Match the masculine article and adjective to perro.', 'El perro pequeño es amable.', [
      ['الـ المذكرة', 'El', 'modifier', 'El is the masculine singular definite article.'],
      ['الكلب', 'perro', 'subject', 'Perro is a masculine noun.'],
      ['الصغير', 'pequeño', 'modifier', 'The adjective agrees with the masculine noun.'],
      ['يكون', 'es', 'verb', 'Es is the third-person singular form of ser.'],
      ['لطيف', 'amable', 'modifier', 'Amable has the same form for masculine and feminine nouns.'],
    ]),
    localizedLesson('es-a0-present-comer', 'Present-Tense -er Verb', 'فعل منتهي بـ er في المضارع', 'أنا آكل الخبز.', 'Conjugate regular -er verb comer for yo.', 'Yo como pan.', [
      ['أنا', 'Yo', 'subject', 'First-person singular subject pronoun.'],
      ['آكل', 'como', 'verb', 'Comer changes to como for yo in the present tense.'],
      ['الخبز', 'pan', 'object', 'The direct object of the sentence.'],
    ]),
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
      targetSentence: '私は学生です。',
      wordChips: ['私は', '学生', 'です。'],
      breakdownChunks: [
        { arabicText: 'أنا وأداة الموضوع', englishText: '私は', role: 'subject', explanation: 'Watashi means “I”; は marks the topic and is pronounced wa.' },
        { arabicText: 'طالب', englishText: '学生', role: 'object', explanation: 'The nominal predicate means student.' },
        { arabicText: 'فعل ربط مهذب', englishText: 'です。', role: 'verb', explanation: 'The polite copula comes at the end.' },
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
      targetSentence: '私は猫を見ます。',
      wordChips: ['私は', '猫を', '見ます。'],
      breakdownChunks: [
        { arabicText: 'أنا وأداة الموضوع', englishText: '私は', role: 'subject', explanation: 'Watashi means “I”; は marks the topic.' },
        { arabicText: 'القطة وأداة المفعول', englishText: '猫を', role: 'object', explanation: '猫 means cat; を marks it as the direct object.' },
        { arabicText: 'أشاهد', englishText: '見ます。', role: 'verb', explanation: 'The verb comes last in this SOV sentence.' },
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
      targetSentence: '私は家で勉強します。',
      wordChips: ['私は', '家で', '勉強します。'],
      breakdownChunks: [
        { arabicText: 'أنا وأداة الموضوع', englishText: '私は', role: 'subject', explanation: 'Watashi means “I”; は marks the topic.' },
        { arabicText: 'في المنزل', englishText: '家で', role: 'modifier', explanation: '家 means home; で marks where an action takes place.' },
        { arabicText: 'أدرس', englishText: '勉強します。', role: 'verb', explanation: 'The verb phrase comes at the end.' },
      ],
      explanationAr: 'تأتي أداة المكان de بعد ie، ويأتي الفعل المركب benkyou shimasu في نهاية الجملة.',
      explanationEn: 'The location particle de follows ie, and the verb phrase benkyou shimasu ends the sentence.',
    },
    localizedLesson('ja-a0-topic-copula-engineer', 'A Profession with the Copula', 'المهنة مع فعل الربط', 'هو مهندس. ضع أداة الموضوع وفعل الربط في النهاية.', 'He is an engineer. Mark the topic and end with the copula.', '彼はエンジニアです。', [
      ['هو وأداة الموضوع', '彼は', 'subject', '彼 means he; は marks the topic.'],
      ['مهندس', 'エンジニア', 'object', 'エンジニア is the profession engineer.'],
      ['فعل ربط مهذب', 'です。', 'verb', 'The polite copula comes at the end.'],
    ], ['彼は', 'エンジニア', 'です。']),
    localizedLesson('ja-a0-this-is-a-book', 'Demonstrative and Nominal Predicate', 'اسم الإشارة والخبر الاسمي', 'هذا كتاب. اختم الجملة بفعل الربط.', 'This is a book. Finish with the copula.', 'これは本です。', [
      ['هذا وأداة الموضوع', 'これは', 'subject', 'これ means this; は marks the topic.'],
      ['كتاب', '本', 'object', '本 means book.'],
      ['فعل ربط مهذب', 'です。', 'verb', 'The polite copula comes last.'],
    ], ['これは', '本', 'です。']),
  ],
  fr: [
    {
      id: 'fr-a0-student',
      titleEn: 'First-Person Subject Pronoun & Verb',
      titleAr: 'ضمير المتكلم وفعل الكينونة',
      descriptionEn: 'Express identity with Je suis.',
      descriptionAr: 'التعبير عن الهوية والمهنة مع Je suis.',
      promptAr: 'أنا طالب.',
      promptEn: 'I am a student.',
      targetSentence: 'Je suis étudiant.',
      wordChips: ['Je', 'suis', 'étudiant.'],
      breakdownChunks: [
        { arabicText: 'أنا', englishText: 'Je', role: 'subject', explanation: 'First person subject pronoun.' },
        { arabicText: 'أكون', englishText: 'suis', role: 'verb', explanation: 'First-person present form of être.' },
        { arabicText: 'طالب', englishText: 'étudiant', role: 'object', explanation: 'Noun predicate describing the subject.' },
      ],
      explanationAr: 'في الفرنسية نستخدم être (suis) للربط بين الفاعل والمهنة.',
      explanationEn: 'French uses être (suis) to connect the subject to a profession.',
    },
    {
      id: 'fr-a0-engineer',
      titleEn: 'Third-Person Singular Copula',
      titleAr: 'ضمير الغائب مع فعل الكينونة',
      descriptionEn: 'Express third-person singular identity with Il est.',
      descriptionAr: 'التعبير عن الغائب المذكر مع Il est.',
      promptAr: 'هو مهندس.',
      promptEn: 'He is an engineer.',
      targetSentence: 'Il est ingénieur.',
      wordChips: ['Il', 'est', 'ingénieur.'],
      breakdownChunks: [
        { arabicText: 'هو', englishText: 'Il', role: 'subject', explanation: 'Third-person singular masculine pronoun.' },
        { arabicText: 'يكون', englishText: 'est', role: 'verb', explanation: 'Third-person singular form of être.' },
        { arabicText: 'مهندس', englishText: 'ingénieur', role: 'object', explanation: 'Profession noun.' },
      ],
      explanationAr: 'نستخدم Il مع est لإخبار المهنة أو الصفة للغائب.',
      explanationEn: 'Use Il with est for third-person singular professions.',
    },
    {
      id: 'fr-a0-learn-french',
      titleEn: 'Present Tense Regular Verb',
      titleAr: 'الفعل المضارع المنتظم',
      descriptionEn: 'Use J\'apprends with a direct object.',
      descriptionAr: 'استخدام الفعل في المضارع مع المفعول المباشر.',
      promptAr: 'أنا أتعلم الفرنسية.',
      promptEn: 'I am learning French.',
      targetSentence: "J'apprends le français.",
      wordChips: ["J'apprends", 'le', 'français.'],
      breakdownChunks: [
        { arabicText: 'أنا أتعلم', englishText: "J'apprends", role: 'verb', explanation: 'Apprendre contracted with Je.' },
        { arabicText: 'الـ', englishText: 'le', role: 'modifier', explanation: 'Masculine singular definite article.' },
        { arabicText: 'الفرنسية', englishText: 'français', role: 'object', explanation: 'Language noun.' },
      ],
      explanationAr: 'تندمج Je مع appris لتصبح J\'apprends قبل الحرف المتحرك.',
      explanationEn: 'Je elides to J\' before a vowel sound in J\'apprends.',
    },
    {
      id: 'fr-a0-read-book',
      titleEn: 'Feminine Subject & Indefinite Article',
      titleAr: 'الفاعل المؤنث وأداة النكرة',
      descriptionEn: 'Use Elle with un livre.',
      descriptionAr: 'استخدام Elle مع المفعول به المذكر un livre.',
      promptAr: 'هي تقرأ كتاباً.',
      promptEn: 'She is reading a book.',
      targetSentence: 'Elle lit un livre.',
      wordChips: ['Elle', 'lit', 'un', 'livre.'],
      breakdownChunks: [
        { arabicText: 'هي', englishText: 'Elle', role: 'subject', explanation: 'Third-person feminine pronoun.' },
        { arabicText: 'تقرأ', englishText: 'lit', role: 'verb', explanation: 'Third-person present form of lire.' },
        { arabicText: 'كتاباً', englishText: 'un livre', role: 'object', explanation: 'Indefinite article plus masculine noun livre.' },
      ],
      explanationAr: 'الفعل lit هو تصريف lire مع Elle، وun هي أداة النكرة للمذكر.',
      explanationEn: 'Lit is third-person present of lire; un is the masculine indefinite article.',
    },
    {
      id: 'fr-a0-drink-coffee',
      titleEn: 'Fronted Time Adverb & Partitive',
      titleAr: 'ظرف الزمن وأداة التجزئة',
      descriptionEn: 'Start with Aujourd\'hui and use the partitive du.',
      descriptionAr: 'البدء بظرف الزمن واستخدام أداة التجزئة du café.',
      promptAr: 'اليوم أشرب القهوة.',
      promptEn: 'Today I drink coffee.',
      targetSentence: "Aujourd'hui je bois du café.",
      wordChips: ["Aujourd'hui", 'je', 'bois', 'du', 'café.'],
      breakdownChunks: [
        { arabicText: 'اليوم', englishText: "Aujourd'hui", role: 'connector', explanation: 'Fronted time expression.' },
        { arabicText: 'أنا', englishText: 'je', role: 'subject', explanation: 'Subject pronoun.' },
        { arabicText: 'أشرب', englishText: 'bois', role: 'verb', explanation: 'First-person present form of boire.' },
        { arabicText: 'القهوة', englishText: 'du café', role: 'object', explanation: 'Partitive article du plus café.' },
      ],
      explanationAr: 'نستخدم du café لأن القهوة اسم غير معدود مع فعل الشرب.',
      explanationEn: 'Du is the partitive article used with uncountable mass nouns like café.',
    },
  ],
  zh: [
    {
      id: 'zh-a0-student',
      titleEn: 'Subject, Copula, and Predicate',
      titleAr: 'الفاعل وفعل الربط 是',
      descriptionEn: 'Express identity with 是 in Chinese.',
      descriptionAr: 'استخدام 是 للربط بين الفاعل والمهنة.',
      promptAr: 'أنا طالب.',
      promptEn: 'I am a student.',
      targetSentence: '我是学生。',
      wordChips: ['我', '是', '学生。'],
      breakdownChunks: [
        { arabicText: 'أنا', englishText: '我', role: 'subject', explanation: 'First-person singular pronoun wo.' },
        { arabicText: 'أكون', englishText: '是', role: 'verb', explanation: 'The copula shi connects subject to noun.' },
        { arabicText: 'طالب', englishText: '学生', role: 'object', explanation: 'Noun predicate xuesheng.' },
      ],
      explanationAr: 'الفعل 是 يربط بين الفاعل والاسم بشكل مباشر في الجملة الاسمية.',
      explanationEn: 'The copula shi directly links the subject pronoun wo to xuesheng.',
    },
    {
      id: 'zh-a0-engineer',
      titleEn: 'Third-Person Pronoun 他',
      titleAr: 'ضمير الغائب المذكر 他',
      descriptionEn: 'Use 他 with 是 for occupations.',
      descriptionAr: 'استخدام 他 مع 是 للتعبير عن مهنة الغائب.',
      promptAr: 'هو مهندس.',
      promptEn: 'He is an engineer.',
      targetSentence: '他是工程师。',
      wordChips: ['他', '是', '工程师。'],
      breakdownChunks: [
        { arabicText: 'هو', englishText: '他', role: 'subject', explanation: 'Masculine third-person pronoun ta.' },
        { arabicText: 'يكون', englishText: '是', role: 'verb', explanation: 'Copula verb shi.' },
        { arabicText: 'مهندس', englishText: '工程师', role: 'object', explanation: 'Profession noun gongchengshi.' },
      ],
      explanationAr: 'كلمة 他 تعني هو، و工程师 تعني مهندس.',
      explanationEn: 'Ta means he, shi is the copula, and gongchengshi means engineer.',
    },
    {
      id: 'zh-a0-learn-chinese',
      titleEn: 'SVO Order with Action Verb',
      titleAr: 'ترتيب فاعل-فعل-مفعول في الصينية',
      descriptionEn: 'Form basic SVO sentence with 学习.',
      descriptionAr: 'بناء جملة أفعال بسيطة مع الفعل 学习.',
      promptAr: 'أنا أتعلم الصينية.',
      promptEn: 'I learn Chinese.',
      targetSentence: '我学习中文。',
      wordChips: ['我', '学习', '中文。'],
      breakdownChunks: [
        { arabicText: 'أنا', englishText: '我', role: 'subject', explanation: 'Subject pronoun wo.' },
        { arabicText: 'أتعلم', englishText: '学习', role: 'verb', explanation: 'Verb xuexi.' },
        { arabicText: 'الصينية', englishText: '中文', role: 'object', explanation: 'Language object zhongwen.' },
      ],
      explanationAr: 'الصينية تتبع ترتيب SVO الأساسي: الفاعل ثم الفعل ثم المفعول.',
      explanationEn: 'Chinese follows standard SVO word order: Subject + Verb + Object.',
    },
    {
      id: 'zh-a0-read-book',
      titleEn: 'Measure Word & Direct Object',
      titleAr: 'كلمة القياس 本 والمفعول',
      descriptionEn: 'Use measure word 本 with 书.',
      descriptionAr: 'استخدام كلمة التمييز 本 قبل الكتاب.',
      promptAr: 'هي تقرأ كتاباً.',
      promptEn: 'She reads a book.',
      targetSentence: '她看一本书。',
      wordChips: ['她', '看', '一本', '书。'],
      breakdownChunks: [
        { arabicText: 'هي', englishText: '她', role: 'subject', explanation: 'Feminine pronoun ta.' },
        { arabicText: 'تقرأ', englishText: '看', role: 'verb', explanation: 'Verb kan (to look/read).' },
        { arabicText: 'كتاباً واحداً', englishText: '一本', role: 'modifier', explanation: 'Number yi + measure word ben for books.' },
        { arabicText: 'كتاب', englishText: '书', role: 'object', explanation: 'Noun shu.' },
      ],
      explanationAr: 'تطلب الصينية كلمة القياس 本 عند استخدام العدد 一 مع الكتب.',
      explanationEn: 'Chinese requires the classifier ben between number yi and noun shu.',
    },
    {
      id: 'zh-a0-drink-coffee',
      titleEn: 'Time Word Placement in Chinese',
      titleAr: 'موقع ظرف الزمن في الصينية',
      descriptionEn: 'Place 今天 after subject or before verb.',
      descriptionAr: 'وضع ظرف الزمن 今天 قبل الفعل.',
      promptAr: 'اليوم أشرب القهوة.',
      promptEn: 'Today I drink coffee.',
      targetSentence: '今天我喝咖啡。',
      wordChips: ['今天', '我', '喝', '咖啡。'],
      breakdownChunks: [
        { arabicText: 'اليوم', englishText: '今天', role: 'connector', explanation: 'Time word jintian.' },
        { arabicText: 'أنا', englishText: '我', role: 'subject', explanation: 'Subject pronoun wo.' },
        { arabicText: 'أشرب', englishText: '喝', role: 'verb', explanation: 'Verb he.' },
        { arabicText: 'القهوة', englishText: '咖啡', role: 'object', explanation: 'Object kafei.' },
      ],
      explanationAr: 'تأتي ظروف الزمن في الصينية قبل الفعل دائماً.',
      explanationEn: 'Time expressions in Chinese always precede the main verb phrase.',
    },
  ],
  hi: [
    {
      id: 'hi-a0-student',
      titleEn: 'SOV Order with Auxiliary हूँ',
      titleAr: 'ترتيب فاعل-مفعول-فعل بـ हूँ',
      descriptionEn: 'Form SOV sentence with हूँ at the end.',
      descriptionAr: 'بناء جملة بالترتيب الهندي مع إنهاء الجملة بـ हूँ.',
      promptAr: 'أنا طالب.',
      promptEn: 'I am a student.',
      targetSentence: 'मैं छात्र हूँ।',
      wordChips: ['मैं', 'छात्र', 'हूँ।'],
      breakdownChunks: [
        { arabicText: 'أنا', englishText: 'मैं', role: 'subject', explanation: 'First-person pronoun main.' },
        { arabicText: 'طالب', englishText: 'छात्र', role: 'object', explanation: 'Noun predicate chhatra.' },
        { arabicText: 'أكون', englishText: 'हूँ', role: 'verb', explanation: 'Auxiliary verb hoon placed sentence-finally.' },
      ],
      explanationAr: 'تتبع الهندية ترتيب SOV، حيث يأتي فعل الكينونة हूँ في نهاية الجملة دائماً.',
      explanationEn: 'Hindi follows SOV word order; auxiliary verb hoon comes at the end.',
    },
    {
      id: 'hi-a0-engineer',
      titleEn: 'Third Person Singular है',
      titleAr: 'ضمير الغائب مع है',
      descriptionEn: 'Use वह with है for third-person.',
      descriptionAr: 'استخدام ضمير الغائب वह مع فعل الكينونة है.',
      promptAr: 'هو مهندس.',
      promptEn: 'He is an engineer.',
      targetSentence: 'वह इंजीनियर है।',
      wordChips: ['वह', 'इंजीनियर', 'है।'],
      breakdownChunks: [
        { arabicText: 'هو', englishText: 'वह', role: 'subject', explanation: 'Third-person pronoun vah.' },
        { arabicText: 'مهندس', englishText: 'इंजीनियर', role: 'object', explanation: 'Noun engineer.' },
        { arabicText: 'يكون', englishText: 'है', role: 'verb', explanation: 'Auxiliary hai at sentence end.' },
      ],
      explanationAr: 'مع الضمير वह يأتي فعل الكينونة hai في آخر الجملة.',
      explanationEn: 'Vah corresponds to third-person singular and pairs with sentence-final hai.',
    },
    {
      id: 'hi-a0-learn-hindi',
      titleEn: 'Present Imperfective Aspect',
      titleAr: 'فعل المضارع في الهندية',
      descriptionEn: 'Form present habit with सीखता हूँ.',
      descriptionAr: 'التعبير عن الفعل المضارع المستمر/الاعتيادي مع सीखता हूँ.',
      promptAr: 'أنا أتعلم الهندية.',
      promptEn: 'I learn Hindi.',
      targetSentence: 'मैं हिंदी सीखता हूँ।',
      wordChips: ['मैं', 'हिंदी', 'सीखता', 'हूँ।'],
      breakdownChunks: [
        { arabicText: 'أنا', englishText: 'मैं', role: 'subject', explanation: 'Pronoun main.' },
        { arabicText: 'الهندية', englishText: 'हिंदी', role: 'object', explanation: 'Language noun hindi.' },
        { arabicText: 'أتعلم', englishText: 'सीखता', role: 'verb', explanation: 'Participle seekhta.' },
        { arabicText: 'أكون', englishText: 'हूँ', role: 'auxiliary', explanation: 'Sentence-final auxiliary hoon.' },
      ],
      explanationAr: 'في الهندية يأتي المفعول हिंदी قبل الفعل सीखता हूँ.',
      explanationEn: 'The direct object precedes the verbal group in Hindi SOV structure.',
    },
    {
      id: 'hi-a0-read-book',
      titleEn: 'Feminine Subject Verb Alignment',
      titleAr: 'توافق الفعل مع الفاعل المؤنث',
      descriptionEn: 'Feminine agreement with पढ़ती है.',
      descriptionAr: 'تأنيث الفعل पढ़ती है مع الفاعل المؤنث वह.',
      promptAr: 'هي تقرأ كتاباً.',
      promptEn: 'She reads a book.',
      targetSentence: 'वह एक किताब पढ़ती है।',
      wordChips: ['वह', 'एक', 'किताब', 'पढ़ती', 'है।'],
      breakdownChunks: [
        { arabicText: 'هي', englishText: 'वह', role: 'subject', explanation: 'Feminine pronoun vah.' },
        { arabicText: 'كتاباً واحداً', englishText: 'एक किताब', role: 'object', explanation: 'Ek (one/a) + kitab (book).' },
        { arabicText: 'تقرأ', englishText: 'पढ़ती', role: 'verb', explanation: 'Feminine participle padhti.' },
        { arabicText: 'تكون', englishText: 'है', role: 'auxiliary', explanation: 'Auxiliary hai.' },
      ],
      explanationAr: 'يتغير تصريف الفعل إلى padhti للمؤنث بدلاً من padhta للمذكر.',
      explanationEn: 'The participle reflects gender: padhti is feminine singular.',
    },
    {
      id: 'hi-a0-drink-tea',
      titleEn: 'Fronted Time Adverb in SOV',
      titleAr: 'ظرف الزمن المتقدم مع SOV',
      descriptionEn: 'Start with time word आज in SOV.',
      descriptionAr: 'وضع ظرف الزمن आज في بداية الجملة الهندية.',
      promptAr: 'اليوم أشرب الشاي.',
      promptEn: 'Today I drink tea.',
      targetSentence: 'आज मैं चाय पीता हूँ।',
      wordChips: ['आज', 'मैं', 'चाय', 'पीता', 'हूँ।'],
      breakdownChunks: [
        { arabicText: 'اليوم', englishText: 'आज', role: 'connector', explanation: 'Time word aaj.' },
        { arabicText: 'أنا', englishText: 'मैं', role: 'subject', explanation: 'Pronoun main.' },
        { arabicText: 'الشاي', englishText: 'चाय', role: 'object', explanation: 'Object chai.' },
        { arabicText: 'أشرب', englishText: 'पीता हूँ', role: 'verb', explanation: 'Verbal group peeta hoon.' },
      ],
      explanationAr: 'يبدأ ظرف الزمن aaj الجملة، ويليه الفاعل ثم المفعول ثم الفعل.',
      explanationEn: 'Time modifier aaj is placed sentence-initially before subject and object.',
    },
  ],
  ru: [
    {
      id: 'ru-a0-student',
      titleEn: 'Zero-Copula Nominal Clause',
      titleAr: 'الجملة الاسمية بدون فعل ربط',
      descriptionEn: 'Russian omits present-tense copula is/am.',
      descriptionAr: 'تحذف الروسية فعل الكينونة في زمن المضارع.',
      promptAr: 'أنا طالب.',
      promptEn: 'I am a student.',
      targetSentence: 'Я студент.',
      wordChips: ['Я', 'студент.'],
      breakdownChunks: [
        { arabicText: 'أنا', englishText: 'Я', role: 'subject', explanation: 'First-person pronoun Ya.' },
        { arabicText: 'طالب', englishText: 'студент', role: 'object', explanation: 'Noun student.' },
      ],
      explanationAr: 'في الروسية لا يوجد فعل ربط للمضارع، فتتكون الجملة من الفاعل والخبر مباشرة مثل العربية.',
      explanationEn: 'Russian present tense omits the copula verb: subject directly connects to predicate.',
    },
    {
      id: 'ru-a0-engineer',
      titleEn: 'Third-Person Nominal Clause',
      titleAr: 'جملة الغائب الاسمية',
      descriptionEn: 'Express third-person identity without copula.',
      descriptionAr: 'التعبير عن مهنة الغائب بدون فعل ربط.',
      promptAr: 'هو مهندس.',
      promptEn: 'He is an engineer.',
      targetSentence: 'Он инженер.',
      wordChips: ['Он', 'инженер.'],
      breakdownChunks: [
        { arabicText: 'هو', englishText: 'Он', role: 'subject', explanation: 'Masculine pronoun On.' },
        { arabicText: 'مهندس', englishText: 'инженер', role: 'object', explanation: 'Profession noun inzhener.' },
      ],
      explanationAr: 'الضمير Он يوضع مع اسم المهنة инженер بدون أي أفعال مساعدة.',
      explanationEn: 'On is followed directly by inzhener without present auxiliary.',
    },
    {
      id: 'ru-a0-learn-russian',
      titleEn: 'First-Person Verb Conjugation',
      titleAr: 'تصريف المضارع مع المفعول به',
      descriptionEn: 'Conjugate изучать with direct object.',
      descriptionAr: 'تصريف الفعل изучать مع المفعول به بحالة النصب.',
      promptAr: 'أنا أتعلم الروسية.',
      promptEn: 'I study Russian language.',
      targetSentence: 'Я изучаю русский язык.',
      wordChips: ['Я', 'изучаю', 'русский', 'язык.'],
      breakdownChunks: [
        { arabicText: 'أنا', englishText: 'Я', role: 'subject', explanation: 'Pronoun Ya.' },
        { arabicText: 'أتعلم', englishText: 'изучаю', role: 'verb', explanation: 'First-person present form of izuchat.' },
        { arabicText: 'اللغة الروسية', englishText: 'русский язык', role: 'object', explanation: 'Accusative phrase russkiy yazyk.' },
      ],
      explanationAr: 'الفعل изучаю هو التصريف الأول للفعل изучать.',
      explanationEn: 'Izuchayu is the first-person singular present form of izuchat.',
    },
    {
      id: 'ru-a0-read-book',
      titleEn: 'Feminine Accusative Direct Object',
      titleAr: 'المفعول به المؤنث بحالة النصب',
      descriptionEn: 'Feminine noun книга changes to книгу in accusative.',
      descriptionAr: 'تحول نهاية الاسم المؤنث إلى у في حالة النصب.',
      promptAr: 'هي تقرأ كتاباً.',
      promptEn: 'She reads a book.',
      targetSentence: 'Она читает книгу.',
      wordChips: ['Она', 'читает', 'книгу.'],
      breakdownChunks: [
        { arabicText: 'هي', englishText: 'Она', role: 'subject', explanation: 'Feminine pronoun Ona.' },
        { arabicText: 'تقرأ', englishText: 'читает', role: 'verb', explanation: 'Third-person present form chitaet.' },
        { arabicText: 'كتاباً', englishText: 'книгу', role: 'object', explanation: 'Accusative form of kniga.' },
      ],
      explanationAr: 'تتحول книга إلى книгу لأنها مفعول به مباشر بحالة النصب (винительный падеж).',
      explanationEn: 'Feminine noun kniga takes -u ending as an accusative direct object.',
    },
    {
      id: 'ru-a0-drink-coffee',
      titleEn: 'Fronted Time Modifier in Russian',
      titleAr: 'ظرف الزمن المتقدم في الروسية',
      descriptionEn: 'Place Сегодня at the start of sentence.',
      descriptionAr: 'وضع Сегодня في بداية الجملة الروسية.',
      promptAr: 'اليوم أشرب القهوة.',
      promptEn: 'Today I drink coffee.',
      targetSentence: 'Сегодня я пью кофе.',
      wordChips: ['Сегодня', 'я', 'пью', 'кофе.'],
      breakdownChunks: [
        { arabicText: 'اليوم', englishText: 'Сегодня', role: 'connector', explanation: 'Time adverb segodnya.' },
        { arabicText: 'أنا', englishText: 'я', role: 'subject', explanation: 'Pronoun ya.' },
        { arabicText: 'أشرب', englishText: 'пью', role: 'verb', explanation: 'First-person present form pyu.' },
        { arabicText: 'القهوة', englishText: 'кофе', role: 'object', explanation: 'Invariable noun kofe.' },
      ],
      explanationAr: 'كلمة кофе اسم لا يتغير شكله في جميع الحالات الإعرابية.',
      explanationEn: 'Kofe is an indeclinable foreign noun in Russian.',
    },
  ],
  pt: [
    {
      id: 'pt-a0-student',
      titleEn: 'Subject Pronoun & Verb Ser',
      titleAr: 'الفاعل مع فعل الكينونة Ser',
      descriptionEn: 'Use Eu sou for permanent identity.',
      descriptionAr: 'استخدام Eu sou للهوية والمهنة.',
      promptAr: 'أنا طالب.',
      promptEn: 'I am a student.',
      targetSentence: 'Eu sou estudante.',
      wordChips: ['Eu', 'sou', 'estudante.'],
      breakdownChunks: [
        { arabicText: 'أنا', englishText: 'Eu', role: 'subject', explanation: 'First-person pronoun Eu.' },
        { arabicText: 'أكون', englishText: 'sou', role: 'verb', explanation: 'First-person present of ser.' },
        { arabicText: 'طالب', englishText: 'estudante', role: 'object', explanation: 'Noun estudante.' },
      ],
      explanationAr: 'في البرتغالية نستخدم فعل ser (sou) مع المهن والصفات الدائمة.',
      explanationEn: 'Ser (sou) is used for permanent characteristics and occupations in Portuguese.',
    },
    {
      id: 'pt-a0-engineer',
      titleEn: 'Third-Person Singular Verb Form',
      titleAr: 'ضمير الغائب مع É',
      descriptionEn: 'Use Ele é for third person.',
      descriptionAr: 'استخدام Ele é مع مهنة الغائب.',
      promptAr: 'هو مهندس.',
      promptEn: 'He is an engineer.',
      targetSentence: 'Ele é engenheiro.',
      wordChips: ['Ele', 'é', 'engenheiro.'],
      breakdownChunks: [
        { arabicText: 'هو', englishText: 'Ele', role: 'subject', explanation: 'Masculine pronoun Ele.' },
        { arabicText: 'يكون', englishText: 'é', role: 'verb', explanation: 'Third-person present of ser.' },
        { arabicText: 'مهندس', englishText: 'engenheiro', role: 'object', explanation: 'Profession noun engenheiro.' },
      ],
      explanationAr: 'الحرف é هو تصريف ser للغائب المذكر Ele.',
      explanationEn: 'É is the third-person singular present form of ser.',
    },
    {
      id: 'pt-a0-learn-portuguese',
      titleEn: 'Present Tense Regular Verb',
      titleAr: 'الفعل المضارع المنتظم',
      descriptionEn: 'Conjugate aprender with direct object.',
      descriptionAr: 'تصريف الفعل aprender في المضارع.',
      promptAr: 'أنا أتعلم البرتغالية.',
      promptEn: 'I learn Portuguese.',
      targetSentence: 'Eu aprendo português.',
      wordChips: ['Eu', 'aprendo', 'português.'],
      breakdownChunks: [
        { arabicText: 'أنا', englishText: 'Eu', role: 'subject', explanation: 'Pronoun Eu.' },
        { arabicText: 'أتعلم', englishText: 'aprendo', role: 'verb', explanation: 'First-person present form of aprender.' },
        { arabicText: 'البرتغالية', englishText: 'português', role: 'object', explanation: 'Language noun português.' },
      ],
      explanationAr: 'ينتهي الفعل المضارع المنتظم مع Eu بالحرف o ليصبح aprendo.',
      explanationEn: 'First-person present of regular -er verbs ends in -o: aprendo.',
    },
    {
      id: 'pt-a0-read-book',
      titleEn: 'Feminine Subject & Indefinite Article',
      titleAr: 'المفعول به مع أداة النكرة',
      descriptionEn: 'Use Ela with um livro.',
      descriptionAr: 'استخدام Ela مع um livro المذكر.',
      promptAr: 'هي تقرأ كتاباً.',
      promptEn: 'She reads a book.',
      targetSentence: 'Ela lê um livro.',
      wordChips: ['Ela', 'lê', 'um', 'livro.'],
      breakdownChunks: [
        { arabicText: 'هي', englishText: 'Ela', role: 'subject', explanation: 'Feminine pronoun Ela.' },
        { arabicText: 'تقرأ', englishText: 'lê', role: 'verb', explanation: 'Third-person present of ler.' },
        { arabicText: 'كتاباً', englishText: 'um livro', role: 'object', explanation: 'Masculine article um + livro.' },
      ],
      explanationAr: 'الفعل lê هو تصريف ler مع Ela، وum هي أداة النكرة للمذكر.',
      explanationEn: 'Lê is third-person present of ler; um is masculine indefinite article.',
    },
    {
      id: 'pt-a0-drink-coffee',
      titleEn: 'Fronted Time Expression',
      titleAr: 'ظرف الزمن المتقدم',
      descriptionEn: 'Start with Hoje in SVO.',
      descriptionAr: 'البدء بظرف الزمن Hoje قبل الفاعل.',
      promptAr: 'اليوم أشرب القهوة.',
      promptEn: 'Today I drink coffee.',
      targetSentence: 'Hoje eu bebo café.',
      wordChips: ['Hoje', 'eu', 'bebo', 'café.'],
      breakdownChunks: [
        { arabicText: 'اليوم', englishText: 'Hoje', role: 'connector', explanation: 'Time expression Hoje.' },
        { arabicText: 'أنا', englishText: 'eu', role: 'subject', explanation: 'Subject pronoun eu.' },
        { arabicText: 'أشرب', englishText: 'bebo', role: 'verb', explanation: 'First-person present form of beber.' },
        { arabicText: 'القهوة', englishText: 'café', role: 'object', explanation: 'Noun café.' },
      ],
      explanationAr: 'الظرف Hoje يوضع في بداية الجملة، ويليه الفاعل eu ثم الفعل bebo.',
      explanationEn: 'Hoje introduces time context at the start of the clause.',
    },
  ],
  it: [
    {
      id: 'it-a0-student',
      titleEn: 'First-Person Subject & Verb Essere',
      titleAr: 'الفاعل مع فعل Essere',
      descriptionEn: 'Use Io sono for identity.',
      descriptionAr: 'استخدام Io sono للهوية والمهنة.',
      promptAr: 'أنا طالب.',
      promptEn: 'I am a student.',
      targetSentence: 'Io sono studente.',
      wordChips: ['Io', 'sono', 'studente.'],
      breakdownChunks: [
        { arabicText: 'أنا', englishText: 'Io', role: 'subject', explanation: 'First-person pronoun Io.' },
        { arabicText: 'أكون', englishText: 'sono', role: 'verb', explanation: 'First-person present form of essere.' },
        { arabicText: 'طالب', englishText: 'studente', role: 'object', explanation: 'Noun studente.' },
      ],
      explanationAr: 'في الإيطالية نستخدم essere (sono) للتعبير عن الهوية والمهنة.',
      explanationEn: 'Essere (sono) connects first-person subject to occupation noun.',
    },
    {
      id: 'it-a0-engineer',
      titleEn: 'Third-Person Verb Form È',
      titleAr: 'ضمير الغائب مع È',
      descriptionEn: 'Use Lui è for third person.',
      descriptionAr: 'استخدام Lui è مع اسم المهنة.',
      promptAr: 'هو مهندس.',
      promptEn: 'He is an engineer.',
      targetSentence: 'Lui è ingegnere.',
      wordChips: ['Lui', 'è', 'ingegnere.'],
      breakdownChunks: [
        { arabicText: 'هو', englishText: 'Lui', role: 'subject', explanation: 'Masculine pronoun Lui.' },
        { arabicText: 'يكون', englishText: 'è', role: 'verb', explanation: 'Third-person present of essere.' },
        { arabicText: 'مهندس', englishText: 'ingegnere', role: 'object', explanation: 'Profession noun ingegnere.' },
      ],
      explanationAr: 'الحرف È المزود بنبرة هو تصريف essere للغائب Lui.',
      explanationEn: 'Accented È is third-person singular present of essere.',
    },
    {
      id: 'it-a0-learn-italian',
      titleEn: 'Present Tense Verb & Article',
      titleAr: 'المضارع مع أداة التعريف المعرفة',
      descriptionEn: 'Elide l\'article before italiano.',
      descriptionAr: 'دمج أداة التعريف l\' مع italiano.',
      promptAr: 'أنا أتعلم الإيطالية.',
      promptEn: 'I learn Italian.',
      targetSentence: "Io imparo l'italiano.",
      wordChips: ['Io', 'imparo', "l'italiano."],
      breakdownChunks: [
        { arabicText: 'أنا', englishText: 'Io', role: 'subject', explanation: 'Pronoun Io.' },
        { arabicText: 'أتعلم', englishText: 'imparo', role: 'verb', explanation: 'First-person present of imparare.' },
        { arabicText: 'الإيطالية', englishText: "l'italiano", role: 'object', explanation: 'Elided article l\' with italiano.' },
      ],
      explanationAr: 'تتحول أداة التعريف lo إلى l\' قبل اسم اللغة italiano الصادر بحرف متحرك.',
      explanationEn: 'Definite article lo elides to l\' before vowels: l\'italiano.',
    },
    {
      id: 'it-a0-read-book',
      titleEn: 'Feminine Subject & Direct Object',
      titleAr: 'فاعل مؤنث مع مفعول نكرة',
      descriptionEn: 'Use Lei with un libro.',
      descriptionAr: 'استخدام Lei مع un libro.',
      promptAr: 'هي تقرأ كتاباً.',
      promptEn: 'She reads a book.',
      targetSentence: 'Lei legge un libro.',
      wordChips: ['Lei', 'legge', 'un', 'libro.'],
      breakdownChunks: [
        { arabicText: 'هي', englishText: 'Lei', role: 'subject', explanation: 'Feminine pronoun Lei.' },
        { arabicText: 'تقرأ', englishText: 'legge', role: 'verb', explanation: 'Third-person present of leggere.' },
        { arabicText: 'كتاباً', englishText: 'un libro', role: 'object', explanation: 'Indefinite article un + libro.' },
      ],
      explanationAr: 'الفعل legge هو تصريف leggere مع Lei، وun هي أداة النكرة للمذكر.',
      explanationEn: 'Legge is third-person present of leggere; un is masculine indefinite article.',
    },
    {
      id: 'it-a0-drink-coffee',
      titleEn: 'Fronted Time Adverb & Verb',
      titleAr: 'ظرف الزمن مع المفعول به',
      descriptionEn: 'Start with Oggi in SVO.',
      descriptionAr: 'البدء بظرف الزمن Oggi.',
      promptAr: 'اليوم أشرب القهوة.',
      promptEn: 'Today I drink a coffee.',
      targetSentence: 'Oggi bevo un caffè.',
      wordChips: ['Oggi', 'bevo', 'un', 'caffè.'],
      breakdownChunks: [
        { arabicText: 'اليوم', englishText: 'Oggi', role: 'connector', explanation: 'Time adverb Oggi.' },
        { arabicText: 'أشرب', englishText: 'bevo', role: 'verb', explanation: 'First-person present form of bere.' },
        { arabicText: 'قهوة واحدة', englishText: 'un caffè', role: 'object', explanation: 'Article un + caffè.' },
      ],
      explanationAr: 'في الإيطالية يمكن حذف ضمير الفاعل Io لأن تصريف bevo يدل عليه بوضوح.',
      explanationEn: 'Italian is a pro-drop language; subject pronoun Io is naturally omitted before bevo.',
    },
  ],
  el: [],
};

type LocalizedChunk = [arabicText: string, englishText: string, role: ChunkRole, explanation: string];

function localizedLesson(
  id: string,
  titleEn: string,
  titleAr: string,
  promptAr: string,
  promptEn: string,
  targetSentence: string,
  chunks: LocalizedChunk[],
  wordChips = targetSentence.split(' '),
): LocalizedLessonDefinition {
  return {
    id,
    titleEn,
    titleAr,
    descriptionEn: titleEn,
    descriptionAr: titleAr,
    promptAr,
    promptEn,
    targetSentence,
    wordChips,
    breakdownChunks: chunks.map(([arabicText, englishText, role, explanation]) => ({
      arabicText,
      englishText,
      role,
      explanation,
    })),
    explanationAr: promptAr,
    explanationEn: promptEn,
  };
}

const BASE_LOCALIZED_A1_A2_LESSONS: Pick<
  Record<LocalizedTarget, Record<'A1' | 'A2', LocalizedLessonDefinition[]>>,
  'de' | 'es' | 'ja'
> = {
  de: {
    A1: [
      localizedLesson('de-a1-separable-aufstehen', 'Separable Verbs: aufstehen', 'الأفعال المنفصلة: الاستيقاظ', 'أنا أستيقظ في السابعة.', 'Place the separable prefix at the end.', 'Ich stehe um sieben Uhr auf.', [
        ['أنا', 'Ich', 'subject', 'The subject starts the clause.'],
        ['أستيقظ', 'stehe', 'verb', 'The conjugated verb takes the second position.'],
        ['في السابعة', 'um sieben Uhr', 'modifier', 'The time phrase follows the conjugated verb.'],
        ['بادئة الفعل المنفصلة', 'auf', 'connector', 'The prefix separates and moves to the end of the main clause.'],
      ]),
      localizedLesson('de-a1-separable-anrufen', 'Separable Verbs: anrufen', 'الأفعال المنفصلة: الاتصال', 'هو يتصل بأمه اليوم.', 'Conjugate anrufen and place its prefix last.', 'Er ruft seine Mutter heute an.', [
        ['هو', 'Er', 'subject', 'The subject performs the action.'],
        ['يتصل', 'ruft', 'verb', 'The conjugated part of anrufen is in second position.'],
        ['أمه', 'seine Mutter', 'object', 'The direct object follows the verb.'],
        ['اليوم', 'heute', 'modifier', 'The time word appears before the separated prefix.'],
        ['بادئة الفعل', 'an', 'connector', 'The separable prefix moves to the end.'],
      ]),
      localizedLesson('de-a1-modal-muessen', 'Modal Verbs and the Infinitive', 'الأفعال الناقصة والمصدر', 'علينا أن نعمل اليوم.', 'Use müssen in second position and the infinitive at the end.', 'Wir müssen heute arbeiten.', [
        ['نحن', 'Wir', 'subject', 'The subject comes first.'],
        ['يجب علينا', 'müssen', 'auxiliary', 'The conjugated modal verb takes second position.'],
        ['اليوم', 'heute', 'modifier', 'The time expression sits in the middle field.'],
        ['أن نعمل', 'arbeiten', 'verb', 'The infinitive goes to the end after a modal verb.'],
      ]),
      localizedLesson('de-a1-modal-koennen', 'Modal Verb können', 'الفعل الناقص können', 'أستطيع التحدث بالألمانية.', 'Conjugate können and put the infinitive at the end.', 'Ich kann Deutsch sprechen.', [
        ['أنا', 'Ich', 'subject', 'The subject starts the clause.'],
        ['أستطيع', 'kann', 'auxiliary', 'Können is conjugated for ich and stays in second position.'],
        ['الألمانية', 'Deutsch', 'object', 'The language is the object of sprechen.'],
        ['التحدث', 'sprechen', 'verb', 'The infinitive follows the modal verb at the end.'],
      ]),
      localizedLesson('de-a1-separable-aufmachen', 'Separable Verb aufmachen', 'الفعل المنفصل aufmachen', 'هو يفتح النافذة.', 'Conjugate aufmachen and move auf to the end.', 'Er macht das Fenster auf.', [
        ['هو', 'Er', 'subject', 'The subject performs the action.'],
        ['يفتح', 'macht', 'verb', 'The conjugated verb takes second position.'],
        ['النافذة', 'das Fenster', 'object', 'Das Fenster is the neuter direct object.'],
        ['بادئة الفعل', 'auf', 'connector', 'The separable prefix moves to the end.'],
      ]),
    ],
    A2: [
      localizedLesson('de-a2-perfekt', 'Talking About the Past with Perfekt', 'التحدث عن الماضي بصيغة Perfekt', 'شاهدت فيلماً أمس.', 'Build the past with haben and a participle at the end.', 'Ich habe gestern einen Film gesehen.', [
        ['أنا', 'Ich', 'subject', 'The subject starts the sentence.'],
        ['قد', 'habe', 'auxiliary', 'The auxiliary haben is conjugated in second position.'],
        ['أمس', 'gestern', 'modifier', 'The time expression follows the auxiliary.'],
        ['فيلماً', 'einen Film', 'object', 'The masculine direct object takes einen.'],
        ['شاهدت', 'gesehen', 'verb', 'The past participle goes at the end.'],
      ]),
      localizedLesson('de-a2-dative', 'Dative Objects', 'المفعول غير المباشر في حالة Dativ', 'هي تساعد أخاها.', 'Use the dative form ihrem Bruder after helfen.', 'Sie hilft ihrem Bruder.', [
        ['هي', 'Sie', 'subject', 'The subject comes first.'],
        ['تساعد', 'hilft', 'verb', 'Helfen takes a dative object in German.'],
        ['أخاها', 'ihrem Bruder', 'object', 'The masculine dative article changes to ihrem.'],
      ]),
      localizedLesson('de-a2-subordinate-weil', 'Word Order After weil', 'ترتيب الكلمات بعد weil', 'سأبقى في المنزل لأن المطر يهطل.', 'Move the conjugated verb to the end of the weil clause.', 'Ich bleibe zu Hause, weil es regnet.', [
        ['أنا أبقى', 'Ich bleibe', 'subject', 'The main clause keeps normal V2 order.'],
        ['في المنزل', 'zu Hause', 'modifier', 'The place phrase completes the main clause.'],
        ['لأن', 'weil', 'connector', 'Weil introduces a subordinate clause.'],
        ['المطر يهطل', 'es regnet', 'verb', 'The conjugated verb moves to the end of the subordinate clause.'],
      ]),
      localizedLesson('de-a2-perfekt-gehen', 'Perfekt with sein', 'صيغة Perfekt مع sein', 'ذهبنا إلى السينما أمس.', 'Use sein with the past participle of gehen.', 'Wir sind gestern ins Kino gegangen.', [
        ['نحن', 'Wir', 'subject', 'The subject starts the sentence.'],
        ['قد ذهبنا', 'sind', 'auxiliary', 'Movement verbs commonly form Perfekt with sein.'],
        ['أمس', 'gestern', 'modifier', 'The time expression describes when it happened.'],
        ['إلى السينما', 'ins Kino', 'modifier', 'Ins is a contraction of in das.'],
        ['ذهبنا', 'gegangen', 'verb', 'The past participle goes at the end.'],
      ]),
      localizedLesson('de-a2-subordinate-wenn', 'Verb-Final Order After wenn', 'الفعل في نهاية جملة wenn', 'إذا كان لدي وقت، أزور أختي.', 'Place the conjugated verb at the end of the wenn clause.', 'Wenn ich Zeit habe, besuche ich meine Schwester.', [
        ['إذا', 'Wenn', 'connector', 'Wenn introduces a subordinate condition.'],
        ['أنا', 'ich', 'subject', 'The subject of the subordinate clause.'],
        ['وقتاً', 'Zeit', 'object', 'Zeit is the object of haben.'],
        ['لدي', 'habe', 'verb', 'The conjugated verb moves to the end of the subordinate clause.'],
        ['أزور أختي', 'besuche ich meine Schwester', 'verb', 'The main clause follows with V2 order.'],
      ]),
    ],
  },
  es: {
    A1: [
      localizedLesson('es-a1-ser-identity', 'Ser for Identity and Occupation', 'استخدام ser للهوية والمهنة', 'أنا طالب.', 'Use ser for identity and occupations.', 'Soy estudiante.', [
        ['أنا أكون', 'Soy', 'verb', 'Soy is the first-person form of ser.'],
        ['طالب', 'estudiante', 'object', 'The noun identifies the speaker.'],
      ]),
      localizedLesson('es-a1-estar-location', 'Estar for Location', 'استخدام estar للمكان', 'أنا في المنزل.', 'Use estar to express a location.', 'Estoy en casa.', [
        ['أنا أكون', 'Estoy', 'verb', 'Estoy is the first-person form of estar.'],
        ['في', 'en', 'connector', 'En introduces the location.'],
        ['المنزل', 'casa', 'object', 'Casa names the location.'],
      ]),
      localizedLesson('es-a1-present-hablar', 'Regular Present-Tense Conjugation', 'تصريف الأفعال المنتظمة في المضارع', 'نحن نتحدث الإسبانية.', 'Conjugate regular -ar verb hablar for nosotros.', 'Nosotros hablamos español.', [
        ['نحن', 'Nosotros', 'subject', 'The subject pronoun is explicit.'],
        ['نتحدث', 'hablamos', 'verb', 'The -ar ending changes to -amos for nosotros.'],
        ['الإسبانية', 'español', 'object', 'The language is the object of the verb.'],
      ]),
      localizedLesson('es-a1-present-trabajar', 'Present-Tense -ar Verb', 'فعل ar في المضارع', 'أنت تعمل في المنزل.', 'Conjugate trabajar for tú.', 'Tú trabajas en casa.', [
        ['أنت', 'Tú', 'subject', 'The subject pronoun is explicit.'],
        ['تعمل', 'trabajas', 'verb', 'Trabajar takes the -as ending for tú.'],
        ['في المنزل', 'en casa', 'modifier', 'En casa expresses the location.'],
      ]),
      localizedLesson('es-a1-estar-state', 'Estar for a Temporary State', 'استخدام estar للحالة المؤقتة', 'نحن متعبون اليوم.', 'Use estar and match the adjective to nosotros.', 'Estamos cansados hoy.', [
        ['نحن نكون', 'Estamos', 'verb', 'Estamos is the nosotros form of estar.'],
        ['متعبون', 'cansados', 'modifier', 'The adjective is masculine plural to agree with nosotros.'],
        ['اليوم', 'hoy', 'modifier', 'The time expression completes the sentence.'],
      ]),
    ],
    A2: [
      localizedLesson('es-a2-preterite-comprar', 'Simple Past: Preterite', 'الماضي البسيط: Pretérito', 'اشتريت كتاباً أمس.', 'Use the first-person preterite form of comprar.', 'Ayer compré un libro.', [
        ['أمس', 'Ayer', 'modifier', 'The time expression can start the sentence.'],
        ['اشتريت', 'compré', 'verb', 'The first-person preterite of comprar ends in -é.'],
        ['كتاباً', 'un libro', 'object', 'The indefinite article un introduces a masculine noun.'],
      ]),
      localizedLesson('es-a2-estar-reason', 'State and Reason with estar', 'الحالة والسبب باستخدام estar', 'هي متعبة لأنها تعمل كثيراً.', 'Describe a temporary state and connect its reason.', 'Ella está cansada porque trabaja mucho.', [
        ['هي', 'Ella', 'subject', 'The subject is explicit.'],
        ['تكون (حالة مؤقتة)', 'está', 'verb', 'Estar describes a temporary state.'],
        ['متعبة', 'cansada', 'modifier', 'The adjective agrees with the feminine subject.'],
        ['لأن', 'porque', 'connector', 'Porque introduces the reason.'],
        ['تعمل كثيراً', 'trabaja mucho', 'verb', 'The present-tense clause explains the state.'],
      ]),
      localizedLesson('es-a2-ir-future', 'Near Future with ir a', 'المستقبل القريب باستخدام ir a', 'سنذهب للسفر غداً.', 'Use ir + a + infinitive for a planned future action.', 'Vamos a viajar mañana.', [
        ['نحن نذهب', 'Vamos', 'verb', 'The present form vamos refers to nosotros.'],
        ['إلى', 'a', 'connector', 'The preposition a links ir to the infinitive.'],
        ['السفر', 'viajar', 'object', 'The infinitive names the planned action.'],
        ['غداً', 'mañana', 'modifier', 'The time expression places the action in the future.'],
      ]),
      localizedLesson('es-a2-preterite-ver', 'Preterite of ver', 'الماضي البسيط للفعل ver', 'شاهدنا فيلماً أمس.', 'Use the nosotros preterite of ver.', 'Ayer vimos una película.', [
        ['أمس', 'Ayer', 'modifier', 'The time expression may start the sentence.'],
        ['شاهدنا', 'vimos', 'verb', 'Vimos is the nosotros preterite of ver.'],
        ['فيلماً', 'una película', 'object', 'Película is feminine and takes una.'],
      ]),
      localizedLesson('es-a2-future', 'Simple Future Tense', 'زمن المستقبل البسيط', 'سأزور عائلتي غداً.', 'Use the future form of visitar.', 'Visitaré a mi familia mañana.', [
        ['سأزور', 'Visitaré', 'verb', 'The future ending -é marks the first-person singular.'],
        ['عائلتي', 'a mi familia', 'object', 'The personal a precedes a person as a direct object.'],
        ['غداً', 'mañana', 'modifier', 'The time expression sets the future context.'],
      ]),
    ],
  },
  ja: {
    A1: [
      localizedLesson('ja-a1-i-adjective', 'Japanese I-Adjectives', 'صفات i في اليابانية', 'هذه التفاحة حمراء.', 'Use an i-adjective before desu.', 'このりんごは赤いです。', [
        ['هذه التفاحة وأداة الموضوع', 'このりんごは', 'subject', 'このりんご means this apple; は marks the topic.'],
        ['حمراء', '赤い', 'modifier', '赤い is an i-adjective describing the apple.'],
        ['صيغة مهذبة', 'です。', 'verb', 'です gives the sentence a polite ending.'],
      ], ['このりんごは', '赤い', 'です。']),
      localizedLesson('ja-a1-i-past', 'Past Form of I-Adjectives', 'صيغة الماضي لصفات i', 'كان الجو بارداً أمس.', 'Change samui to its past form samukatta.', '昨日は寒かったです。', [
        ['أمس وأداة الموضوع', '昨日は', 'modifier', '昨日 means yesterday; は marks the topic.'],
        ['كان بارداً', '寒かった', 'modifier', 'The i-adjective 寒い changes to 寒かった in the past.'],
        ['صيغة مهذبة', 'です。', 'verb', 'です keeps the statement polite.'],
      ], ['昨日は', '寒かった', 'です。']),
      localizedLesson('ja-a1-na-adjective', 'Japanese Na-Adjectives', 'صفات na في اليابانية', 'هذه المدينة هادئة.', 'Use na-adjective shizuka with desu.', 'この町は静かです。', [
        ['هذه المدينة وأداة الموضوع', 'この町は', 'subject', 'この町 means this town; は marks the topic.'],
        ['هادئة', '静か', 'modifier', '静か is a na-adjective; it does not take な before です.'],
        ['صيغة مهذبة', 'です。', 'verb', 'です completes the polite predicate.'],
      ], ['この町は', '静か', 'です。']),
      localizedLesson('ja-a1-na-famous', 'Na-Adjective before a Noun', 'صفة na قبل الاسم', 'هذا المتجر مشهور.', 'Use a na-adjective as a polite predicate.', 'この店は有名です。', [
        ['هذا المتجر وأداة الموضوع', 'この店は', 'subject', 'この店 means this shop; は marks the topic.'],
        ['مشهور', '有名', 'modifier', '有名 is a na-adjective and needs no な before です.'],
        ['صيغة مهذبة', 'です。', 'verb', 'です completes the polite predicate.'],
      ], ['この店は', '有名', 'です。']),
      localizedLesson('ja-a1-i-negative-past', 'Past Negative I-Adjective', 'النفي الماضي لصفة i', 'لم يكن الجو بارداً أمس.', 'Use the past-negative form of samui.', '昨日は寒くなかったです。', [
        ['أمس وأداة الموضوع', '昨日は', 'modifier', '昨日 means yesterday; は marks the topic.'],
        ['لم يكن بارداً', '寒くなかった', 'modifier', '寒い changes to 寒くなかった for past negation.'],
        ['صيغة مهذبة', 'です。', 'verb', 'です keeps the statement polite.'],
      ], ['昨日は', '寒くなかった', 'です。']),
    ],
    A2: [
      localizedLesson('ja-a2-i-negative-past', 'Past Negative I-Adjectives', 'النفي في الماضي لصفات i', 'لم أكن مشغولاً أمس.', 'Form the past negative of an i-adjective.', '昨日は忙しくなかったです。', [
        ['أمس وأداة الموضوع', '昨日は', 'modifier', '昨日 means yesterday; は marks the topic.'],
        ['لم أكن مشغولاً', '忙しくなかった', 'modifier', '忙しい changes to 忙しくなかった for past negation.'],
        ['صيغة مهذبة', 'です。', 'verb', 'です makes the negative statement polite.'],
      ], ['昨日は', '忙しくなかった', 'です。']),
      localizedLesson('ja-a2-giving-particle', 'Particles in a Giving Sentence', 'أدوات الجملة عند إعطاء شيء', 'أعطيت صديقي كتاباً.', 'Mark the recipient with ni and the object with o.', '私は友達に本をあげました。', [
        ['أنا وأداة الموضوع', '私は', 'subject', '私 means I; は marks the topic.'],
        ['إلى صديقي', '友達に', 'object', 'に marks the recipient.'],
        ['كتاباً وأداة المفعول', '本を', 'object', '本 means book; を marks the direct object.'],
        ['أعطيت', 'あげました。', 'verb', 'The polite past verb comes last.'],
      ], ['私は', '友達に', '本を', 'あげました。']),
      localizedLesson('ja-a2-reason-kara', 'Giving a Reason with kara', 'ذكر السبب باستخدام kara', 'لأن المطر يهطل، أبقى في المنزل.', 'Put the reason before kara and the result after it.', '雨が降っていますから、家にいます。', [
        ['المطر وأداة الفاعل', '雨が', 'subject', '雨 means rain; が marks the subject of the event.'],
        ['يهطل', '降っています', 'verb', 'The ている form describes ongoing rain.'],
        ['لأن', 'から、', 'connector', 'から marks the reason.'],
        ['في المنزل', '家に', 'modifier', 'に marks the location of being.'],
        ['أبقى', 'います。', 'verb', 'The result clause follows the reason.'],
      ], ['雨が', '降っています', 'から、', '家に', 'います。']),
      localizedLesson('ja-a2-object-particle', 'Object Particle and Verb-Final Order', 'أداة المفعول والفعل في النهاية', 'أقرأ كتاباً في المنزل.', 'Mark the object with を and put the verb at the end.', '私は家で本を読みます。', [
        ['أنا وأداة الموضوع', '私は', 'subject', '私 means I; は marks the topic.'],
        ['في المنزل', '家で', 'modifier', 'で marks where the reading takes place.'],
        ['كتاباً وأداة المفعول', '本を', 'object', 'を marks 本 as the direct object.'],
        ['أقرأ', '読みます。', 'verb', 'The polite verb comes at the end.'],
      ], ['私は', '家で', '本を', '読みます。']),
      localizedLesson('ja-a2-past-verb', 'Polite Past Verb Form', 'صيغة الفعل الماضي المهذبة', 'أكلت التفاحة أمس.', 'Use the polite past form of taberu.', '昨日りんごを食べました。', [
        ['أمس', '昨日', 'modifier', '昨日 means yesterday.'],
        ['التفاحة وأداة المفعول', 'りんごを', 'object', 'を marks りんご as the direct object.'],
        ['أكلت', '食べました。', 'verb', '食べました is the polite past form of 食べる.'],
      ], ['昨日', 'りんごを', '食べました。']),
    ],
  },
};

interface SimpleLocalizedLesson {
  promptAr: string;
  targetSentence: string;
  wordChips: string[];
}

function createSimpleLocalizedLessons(
  language: string,
  stage: 'A1' | 'A2',
  entries: SimpleLocalizedLesson[]
): LocalizedLessonDefinition[] {
  return entries.map(({ promptAr, targetSentence, wordChips }, index) => {
    const titleEn = `${language} ${stage} sentence pattern ${index + 1}`;
    const titleAr = `${stage} — ${promptAr}`;
    return localizedLesson(
      `${language.toLowerCase()}-${stage.toLowerCase()}-sentence-${index + 1}`,
      titleEn,
      titleAr,
      promptAr,
      titleEn,
      targetSentence,
      [[promptAr, targetSentence, 'modifier', 'Practice the complete sentence pattern.']],
      wordChips
    );
  });
}

const ADDITIONAL_LOCALIZED_A1_A2_LESSONS: Pick<
  Record<LocalizedTarget, Record<'A1' | 'A2', LocalizedLessonDefinition[]>>,
  'fr' | 'zh' | 'hi' | 'ru' | 'pt' | 'it' | 'el'
> = {
  fr: {
    A1: createSimpleLocalizedLessons('French', 'A1', [
      { promptAr: 'أنا أذهب إلى المدرسة.', targetSentence: "Je vais à l'école.", wordChips: ['Je', 'vais', 'à', "l'école."] },
      { promptAr: 'نحن نتحدث مع أصدقائنا.', targetSentence: 'Nous parlons avec nos amis.', wordChips: ['Nous', 'parlons', 'avec', 'nos', 'amis.'] },
      { promptAr: 'هي تأكل تفاحة.', targetSentence: 'Elle mange une pomme.', wordChips: ['Elle', 'mange', 'une', 'pomme.'] },
      { promptAr: 'هو يعمل اليوم.', targetSentence: "Il travaille aujourd'hui.", wordChips: ['Il', 'travaille', "aujourd'hui."] },
      { promptAr: 'أستقل الحافلة في الصباح.', targetSentence: 'Je prends le bus le matin.', wordChips: ['Je', 'prends', 'le', 'bus', 'le', 'matin.'] },
    ]),
    A2: createSimpleLocalizedLessons('French', 'A2', [
      { promptAr: 'أتعلم الفرنسية لأنني أعيش في باريس.', targetSentence: "J'apprends le français parce que j'habite à Paris.", wordChips: ["J'apprends", 'le', 'français', 'parce', 'que', "j'habite", 'à', 'Paris.'] },
      { promptAr: 'عندما يكون الجو جميلاً، نمشي في الحديقة.', targetSentence: 'Quand il fait beau, nous marchons dans le parc.', wordChips: ['Quand', 'il', 'fait', 'beau,', 'nous', 'marchons', 'dans', 'le', 'parc.'] },
      { promptAr: 'اشتريت هذا الكتاب أمس.', targetSentence: "J'ai acheté ce livre hier.", wordChips: ["J'ai", 'acheté', 'ce', 'livre', 'hier.'] },
      { promptAr: 'سأتصل بك عندما أصل إلى المنزل.', targetSentence: "Je t'appellerai quand j'arriverai à la maison.", wordChips: ['Je', "t'appellerai", 'quand', "j'arriverai", 'à', 'la', 'maison.'] },
      { promptAr: 'نفضل القطار لأنه أسرع من الحافلة.', targetSentence: 'Nous préférons le train parce qu’il est plus rapide que le bus.', wordChips: ['Nous', 'préférons', 'le', 'train', 'parce', 'qu’il', 'est', 'plus', 'rapide', 'que', 'le', 'bus.'] },
    ]),
  },
  zh: {
    A1: createSimpleLocalizedLessons('Chinese', 'A1', [
      { promptAr: 'أنا أتعلم الصينية.', targetSentence: '我学习中文。', wordChips: ['我', '学习', '中文。'] },
      { promptAr: 'هي تشرب الماء.', targetSentence: '她喝水。', wordChips: ['她', '喝', '水。'] },
      { promptAr: 'نحن نذهب إلى المدرسة.', targetSentence: '我们去学校。', wordChips: ['我们', '去', '学校。'] },
      { promptAr: 'هو يحب القهوة.', targetSentence: '他喜欢咖啡。', wordChips: ['他', '喜欢', '咖啡。'] },
      { promptAr: 'أريد تفاحة واحدة.', targetSentence: '我想要一个苹果。', wordChips: ['我', '想要', '一个', '苹果。'] },
    ]),
    A2: createSimpleLocalizedLessons('Chinese', 'A2', [
      { promptAr: 'لأن الجو بارد، أرتدي معطفاً.', targetSentence: '因为天气很冷，所以我穿上了外套。', wordChips: ['因为', '天气', '很冷，', '所以', '我', '穿上了', '外套。'] },
      { promptAr: 'بعد أن أنهي عملي، سأذهب إلى المنزل.', targetSentence: '我做完工作以后就回家。', wordChips: ['我', '做完', '工作', '以后', '就', '回家。'] },
      { promptAr: 'إذا كان لديك وقت، فلنذهب إلى المتحف.', targetSentence: '如果你有时间，我们就去博物馆。', wordChips: ['如果', '你', '有', '时间，', '我们', '就', '去', '博物馆。'] },
      { promptAr: 'هذا المطعم أرخص من المطعم المجاور.', targetSentence: '这家餐厅比旁边那家便宜。', wordChips: ['这家', '餐厅', '比', '旁边', '那家', '便宜。'] },
      { promptAr: 'قرأت الكتاب الذي أعطيتني إياه.', targetSentence: '我读了你给我的那本书。', wordChips: ['我', '读了', '你', '给', '我的', '那本', '书。'] },
    ]),
  },
  hi: {
    A1: createSimpleLocalizedLessons('Hindi', 'A1', [
      { promptAr: 'أنا أتعلم الهندية.', targetSentence: 'मैं हिंदी सीखता हूँ।', wordChips: ['मैं', 'हिंदी', 'सीखता', 'हूँ।'] },
      { promptAr: 'هي تشرب الماء.', targetSentence: 'वह पानी पीती है।', wordChips: ['वह', 'पानी', 'पीती', 'है।'] },
      { promptAr: 'نحن نذهب إلى السوق.', targetSentence: 'हम बाज़ार जाते हैं।', wordChips: ['हम', 'बाज़ार', 'जाते', 'हैं।'] },
      { promptAr: 'هو يقرأ كتاباً.', targetSentence: 'वह एक किताब पढ़ता है।', wordChips: ['वह', 'एक', 'किताब', 'पढ़ता', 'है।'] },
      { promptAr: 'أريد كوباً من الشاي.', targetSentence: 'मुझे एक कप चाय चाहिए।', wordChips: ['मुझे', 'एक', 'कप', 'चाय', 'चाहिए।'] },
    ]),
    A2: createSimpleLocalizedLessons('Hindi', 'A2', [
      { promptAr: 'لأن الجو بارد، أبقى في المنزل.', targetSentence: 'मौसम ठंडा है, इसलिए मैं घर पर रहता हूँ।', wordChips: ['मौसम', 'ठंडा', 'है,', 'इसलिए', 'मैं', 'घर', 'पर', 'रहता', 'हूँ।'] },
      { promptAr: 'بعد أن أنهي عملي، سأتصل بك.', targetSentence: 'काम खत्म करने के बाद मैं तुम्हें फ़ोन करूँगा।', wordChips: ['काम', 'खत्म', 'करने', 'के', 'बाद', 'मैं', 'तुम्हें', 'फ़ोन', 'करूँगा।'] },
      { promptAr: 'إذا أمطرت غداً، سنبقى في الداخل.', targetSentence: 'अगर कल बारिश हुई, तो हम अंदर रहेंगे।', wordChips: ['अगर', 'कल', 'बारिश', 'हुई,', 'तो', 'हम', 'अंदर', 'रहेंगे।'] },
      { promptAr: 'هذا الطريق أقصر من الطريق الآخر.', targetSentence: 'यह रास्ता दूसरे रास्ते से छोटा है।', wordChips: ['यह', 'रास्ता', 'दूसरे', 'रास्ते', 'से', 'छोटा', 'है।'] },
      { promptAr: 'قرأت الرسالة التي أرسلتها لي.', targetSentence: 'मैंने वह संदेश पढ़ा जो तुमने मुझे भेजा था।', wordChips: ['मैंने', 'वह', 'संदेश', 'पढ़ा', 'जो', 'तुमने', 'मुझे', 'भेजा', 'था।'] },
    ]),
  },
  ru: {
    A1: createSimpleLocalizedLessons('Russian', 'A1', [
      { promptAr: 'أنا أتعلم الروسية.', targetSentence: 'Я изучаю русский язык.', wordChips: ['Я', 'изучаю', 'русский', 'язык.'] },
      { promptAr: 'هي تشرب воду.', targetSentence: 'Она пьёт воду.', wordChips: ['Она', 'пьёт', 'воду.'] },
      { promptAr: 'نحن نذهب إلى المدرسة.', targetSentence: 'Мы идём в школу.', wordChips: ['Мы', 'идём', 'в', 'школу.'] },
      { promptAr: 'هو يقرأ كتاباً جديداً.', targetSentence: 'Он читает новую книгу.', wordChips: ['Он', 'читает', 'новую', 'книгу.'] },
      { promptAr: 'أريد كوباً من الشاي.', targetSentence: 'Я хочу чашку чая.', wordChips: ['Я', 'хочу', 'чашку', 'чая.'] },
    ]),
    A2: createSimpleLocalizedLessons('Russian', 'A2', [
      { promptAr: 'لأن الجو بارد، سأرتدي معطفي.', targetSentence: 'Так как на улице холодно, я надену пальто.', wordChips: ['Так', 'как', 'на', 'улице', 'холодно,', 'я', 'надену', 'пальто.'] },
      { promptAr: 'بعد أن أنهي عملي، سأعود إلى المنزل.', targetSentence: 'После того как я закончу работу, я вернусь домой.', wordChips: ['После', 'того', 'как', 'я', 'закончу', 'работу,', 'я', 'вернусь', 'домой.'] },
      { promptAr: 'إذا كان لدي وقت، سأزور المتحف.', targetSentence: 'Если у меня будет время, я посещу музей.', wordChips: ['Если', 'у', 'меня', 'будет', 'время,', 'я', 'посещу', 'музей.'] },
      { promptAr: 'هذا الطريق أقصر من الطريق الآخر.', targetSentence: 'Эта дорога короче, чем другая.', wordChips: ['Эта', 'дорога', 'короче,', 'чем', 'другая.'] },
      { promptAr: 'قرأت الكتاب الذي أعطيتني إياه.', targetSentence: 'Я прочитал книгу, которую ты мне дал.', wordChips: ['Я', 'прочитал', 'книгу,', 'которую', 'ты', 'мне', 'дал.'] },
    ]),
  },
  pt: {
    A1: createSimpleLocalizedLessons('Portuguese', 'A1', [
      { promptAr: 'أنا أتعلم البرتغالية.', targetSentence: 'Eu estudo português.', wordChips: ['Eu', 'estudo', 'português.'] },
      { promptAr: 'هي تشرب الماء.', targetSentence: 'Ela bebe água.', wordChips: ['Ela', 'bebe', 'água.'] },
      { promptAr: 'نحن نذهب إلى المدرسة.', targetSentence: 'Nós vamos à escola.', wordChips: ['Nós', 'vamos', 'à', 'escola.'] },
      { promptAr: 'هو يقرأ كتاباً جديداً.', targetSentence: 'Ele lê um livro novo.', wordChips: ['Ele', 'lê', 'um', 'livro', 'novo.'] },
      { promptAr: 'أريد كوباً من الشاي.', targetSentence: 'Eu quero uma xícara de chá.', wordChips: ['Eu', 'quero', 'uma', 'xícara', 'de', 'chá.'] },
    ]),
    A2: createSimpleLocalizedLessons('Portuguese', 'A2', [
      { promptAr: 'أتعلم البرتغالية لأنني أعيش في البرازيل.', targetSentence: 'Aprendo português porque moro no Brasil.', wordChips: ['Aprendo', 'português', 'porque', 'moro', 'no', 'Brasil.'] },
      { promptAr: 'عندما يكون الجو جميلاً، نمشي في الحديقة.', targetSentence: 'Quando faz sol, caminhamos no parque.', wordChips: ['Quando', 'faz', 'sol,', 'caminhamos', 'no', 'parque.'] },
      { promptAr: 'اشتريت هذا الكتاب أمس.', targetSentence: 'Comprei este livro ontem.', wordChips: ['Comprei', 'este', 'livro', 'ontem.'] },
      { promptAr: 'سأتصل بك عندما أصل إلى المنزل.', targetSentence: 'Vou ligar para você quando chegar em casa.', wordChips: ['Vou', 'ligar', 'para', 'você', 'quando', 'chegar', 'em', 'casa.'] },
      { promptAr: 'نفضل القطار لأنه أسرع من الحافلة.', targetSentence: 'Preferimos o trem porque é mais rápido que o ônibus.', wordChips: ['Preferimos', 'o', 'trem', 'porque', 'é', 'mais', 'rápido', 'que', 'o', 'ônibus.'] },
    ]),
  },
  it: {
    A1: createSimpleLocalizedLessons('Italian', 'A1', [
      { promptAr: 'أنا أتعلم الإيطالية.', targetSentence: 'Studio italiano.', wordChips: ['Studio', 'italiano.'] },
      { promptAr: 'هي تشرب الماء.', targetSentence: 'Lei beve acqua.', wordChips: ['Lei', 'beve', 'acqua.'] },
      { promptAr: 'نحن نذهب إلى المدرسة.', targetSentence: 'Andiamo a scuola.', wordChips: ['Andiamo', 'a', 'scuola.'] },
      { promptAr: 'هو يقرأ كتاباً جديداً.', targetSentence: 'Lui legge un libro nuovo.', wordChips: ['Lui', 'legge', 'un', 'libro', 'nuovo.'] },
      { promptAr: 'أريد كوباً من الشاي.', targetSentence: 'Vorrei una tazza di tè.', wordChips: ['Vorrei', 'una', 'tazza', 'di', 'tè.'] },
    ]),
    A2: createSimpleLocalizedLessons('Italian', 'A2', [
      { promptAr: 'أتعلم الإيطالية لأنني أعيش في إيطاليا.', targetSentence: 'Imparo l’italiano perché vivo in Italia.', wordChips: ['Imparo', 'l’italiano', 'perché', 'vivo', 'in', 'Italia.'] },
      { promptAr: 'عندما يكون الجو جميلاً، نمشي في الحديقة.', targetSentence: 'Quando c’è bel tempo, camminiamo nel parco.', wordChips: ['Quando', 'c’è', 'bel', 'tempo,', 'camminiamo', 'nel', 'parco.'] },
      { promptAr: 'اشتريت هذا الكتاب أمس.', targetSentence: 'Ho comprato questo libro ieri.', wordChips: ['Ho', 'comprato', 'questo', 'libro', 'ieri.'] },
      { promptAr: 'سأتصل بك عندما أصل إلى المنزل.', targetSentence: 'Ti chiamerò quando arriverò a casa.', wordChips: ['Ti', 'chiamerò', 'quando', 'arriverò', 'a', 'casa.'] },
      { promptAr: 'نفضل القطار لأنه أسرع من الحافلة.', targetSentence: 'Preferiamo il treno perché è più veloce dell’autobus.', wordChips: ['Preferiamo', 'il', 'treno', 'perché', 'è', 'più', 'veloce', 'dell’autobus.'] },
    ]),
  },
  el: {
    A1: [],
    A2: [],
  },
};

export const LOCALIZED_A1_A2_LESSONS: Record<
  LocalizedTarget,
  Record<'A1' | 'A2', LocalizedLessonDefinition[]>
> = { ...BASE_LOCALIZED_A1_A2_LESSONS, ...ADDITIONAL_LOCALIZED_A1_A2_LESSONS };

function createLocalizedStage(
  definition: Omit<StageNode, 'units' | 'stageExam'>,
  lessonDefinitions: LocalizedLessonDefinition[]
): StageNode {
  const units: UnitNode[] = lessonDefinitions.map((lessonDefinition, index) => {
    const unitId = `${definition.stage.toLowerCase()}-unit-${index + 1}`;

    const primaryExercise: ExerciseItem = {
      id: `${lessonDefinition.id}-main-exercise`,
      type: 'structure_builder',
      promptAr: lessonDefinition.promptAr,
      promptEn: lessonDefinition.promptEn,
      targetSentence: lessonDefinition.targetSentence,
      wordChips: [...lessonDefinition.wordChips],
      options: [...lessonDefinition.wordChips],
      breakdownChunks: lessonDefinition.breakdownChunks,
      explanationAr: lessonDefinition.explanationAr,
      explanationEn: lessonDefinition.explanationEn,
      skillAxes: ['structure', 'writing', 'vocabulary'],
    };

    const reviewExercises: ExerciseItem[] = lessonDefinitions
      .filter((_, idx) => idx !== index)
      .slice(0, 2)
      .map((def, exIdx) => ({
        id: `${lessonDefinition.id}-review-${exIdx}`,
        type: 'structure_builder',
        promptAr: def.promptAr,
        promptEn: def.promptEn,
        targetSentence: def.targetSentence,
        wordChips: [...def.wordChips],
        options: [...def.wordChips],
        breakdownChunks: def.breakdownChunks,
        explanationAr: def.explanationAr,
        explanationEn: def.explanationEn,
        skillAxes: ['structure', 'writing', 'vocabulary'],
      }));

    const exercisesPool = [primaryExercise, ...reviewExercises];

    const node: LessonNode = {
      id: lessonDefinition.id,
      unitId,
      stage: definition.stage,
      titleAr: lessonDefinition.titleAr,
      titleEn: lessonDefinition.titleEn,
      descriptionAr: lessonDefinition.descriptionAr,
      descriptionEn: lessonDefinition.descriptionEn,
      icon: ['🧱', '🧩', '🚀'][index % 3],
      exercises: exercisesPool,
    };
    return {
      id: unitId,
      stage: definition.stage,
      titleAr: `الوحدة ${index + 1} — ${lessonDefinition.titleAr}`,
      titleEn: `Unit ${index + 1} — ${lessonDefinition.titleEn}`,
      descriptionAr: lessonDefinition.descriptionAr,
      descriptionEn: lessonDefinition.descriptionEn,
      icon: ['🧱', '🧩', '🚀'][index % 3],
      color: ['#2DD4BF', '#F5B942', '#3B82F6'][index % 3],
      lessons: [node],
      checkpointTest: exercisesPool,
    };
  });
  return {
    ...definition,
    units,
    stageExam: units.flatMap((unit) => unit.checkpointTest),
  };
}

function mapLegacyExerciseToItem(
  exercise: Exercise,
  lessonId: string,
  index: number,
  fallbackExplanationAr?: string,
  fallbackExplanationEn?: string
): ExerciseItem {
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
    explanationAr: exercise.habitHintAr || fallbackExplanationAr || 'ركز على تركيب الجملة وتجنب الترجمة الحرفية.',
    explanationEn: exercise.habitHint || fallbackExplanationEn || 'Focus on English structure rather than word-for-word translation.',
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
        mapLegacyExerciseToItem(
          exercise,
          lesson.id,
          exerciseIndex,
          lesson.transferConceptAr,
          lesson.transferConcept
        )
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
          mapLegacyExerciseToItem(
            exercise,
            lesson.id,
            exerciseIndex,
            lesson.transferConceptAr,
            lesson.transferConcept
          )
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

export function generateProceduralStageLessons(
  targetLang: LocalizedTarget,
  stage: CefrStage,
  seedDefinitions: LocalizedLessonDefinition[] = [],
  focusArea: string = 'general',
  count = 100,
  sourceLang: string = 'en'
): LocalizedLessonDefinition[] {
  const result: LocalizedLessonDefinition[] = [...seedDefinitions];

  const rawDict = getTargetDictionary(targetLang as TargetLanguage);
  const rankedDict = assignCEFRLevels(rawDict);

  let pool = rankedDict.filter((entry) => entry.cefrLevel === stage);
  if (!pool || pool.length < 10) {
    pool = rankedDict;
  }

  if (focusArea === 'tech' || focusArea === 'business' || focusArea === 'travel') {
    const keywords = focusArea === 'tech'
      ? ['system', 'data', 'code', 'net', 'tech', 'work', 'computer', 'app', 'file', 'user', 'prime', 'alpha']
      : focusArea === 'business'
      ? ['office', 'work', 'trade', 'money', 'company', 'meeting', 'deal', 'client', 'center']
      : ['travel', 'hotel', 'road', 'city', 'car', 'fly', 'ticket', 'station', 'park'];

    const filtered = pool.filter((item) => {
      const term = (item.term || (item as any).word || '').toLowerCase();
      const en = (item.sourceMeanings?.en || (item as any).translation || '').toLowerCase();
      return keywords.some((k) => term.includes(k) || en.includes(k));
    });

    if (filtered.length >= 10) {
      pool = filtered;
    }
  }

  let i = result.length;
  while (result.length < count && pool.length > 0) {
    const entry1 = pool[i % pool.length] || pool[0] || { term: 'Das', sourceMeanings: { en: 'That', ar: 'ذلك' } };
    const entry2 = pool[(i + 3) % pool.length] || pool[1] || { term: 'ist', sourceMeanings: { en: 'is', ar: 'يكون' } };
    const entry3 = pool[(i + 7) % pool.length] || pool[2] || { term: 'gut', sourceMeanings: { en: 'good', ar: 'جيد' } };

    const term1 = entry1.term || (entry1 as any).word || 'Das';
    const term2 = entry2.term || (entry2 as any).word || 'ist';
    const term3 = entry3.term || (entry3 as any).word || 'gut';

    const en1 = entry1.sourceMeanings?.en || (entry1 as any).translation || term1;
    const en2 = entry2.sourceMeanings?.en || (entry2 as any).translation || term2;
    const en3 = entry3.sourceMeanings?.en || (entry3 as any).translation || term3;

    const ar1 = entry1.sourceMeanings?.ar || en1;
    const ar2 = entry2.sourceMeanings?.ar || en2;
    const ar3 = entry3.sourceMeanings?.ar || en3;

    const lessonNum = result.length + 1;
    const lessonId = `${targetLang}-${stage.toLowerCase()}-gen-${lessonNum}`;

    const targetSentence = targetLang === 'ja' || targetLang === 'zh'
      ? `${term1}${term2}${term3}`
      : `${term1} ${term2} ${term3}.`;

    const wordChips = targetLang === 'ja' || targetLang === 'zh'
      ? [term1, term2, term3]
      : [term1, term2, `${term3}.`];

    const promptAr = `${ar1} ${ar2} ${ar3}`;

    result.push({
      id: lessonId,
      titleEn: `Lesson ${lessonNum}: ${term1}`,
      titleAr: `الدرس ${lessonNum}: ${ar1}`,
      descriptionEn: `Procedural ${focusArea} structure drill #${lessonNum} (${stage})`,
      descriptionAr: `تمرين بناء الهيكل بالمفردات (${focusArea}) رقم ${lessonNum}`,
      promptAr: `عبر عن المعنى: ${promptAr}`,
      promptEn: `Express: ${en1} ${en2} ${en3}`,
      targetSentence,
      wordChips,
      breakdownChunks: [
        { arabicText: ar1, englishText: term1, role: 'subject', explanation: `Term 1: ${en1}` },
        { arabicText: ar2, englishText: term2, role: 'verb', explanation: `Term 2: ${en2}` },
        { arabicText: ar3, englishText: term3, role: 'object', explanation: `Term 3: ${en3}` },
      ],
      explanationAr: `بناء جملة بالمفردات: ${ar1} - ${ar2} - ${ar3}`,
      explanationEn: `${focusArea} vocabulary structure drill #${lessonNum}`,
    });

    i++;
  }

  return result;
}

export function buildCourseStructure(
  requestedTarget?: TargetLanguage,
  requestedSource?: string,
  requestedFocus?: string
): StageNode[] {
  const activeProfile = readActiveProfile();
  const targetLang = requestedTarget ?? activeProfile?.targetLang ?? 'en';
  const focusArea = requestedFocus ?? activeProfile?.focusArea ?? 'general';
  const sourceLang = requestedSource ?? activeProfile?.sourceLang ?? 'arz';

  if (lastRoutedTargetLang !== targetLang) {
    console.log('[Curriculum Router] Loading language:', targetLang, 'Focus Area:', focusArea, 'Source:', sourceLang);
    lastRoutedTargetLang = targetLang;
  }

  switch (targetLang) {
    case 'de':
    case 'es':
    case 'ja':
    case 'fr':
    case 'zh':
    case 'hi':
    case 'ru':
    case 'pt':
    case 'it':
    case 'el': {
      const seedA0 = LOCALIZED_A0_LESSONS[targetLang] || [];
      const seedA1 = LOCALIZED_A1_A2_LESSONS[targetLang]?.A1 || [];
      const seedA2 = LOCALIZED_A1_A2_LESSONS[targetLang]?.A2 || [];

      const a0 = generateProceduralStageLessons(targetLang, 'A0', seedA0, focusArea, 10, sourceLang);
      const a1 = generateProceduralStageLessons(targetLang, 'A1', seedA1, focusArea, 15, sourceLang);
      const a2 = generateProceduralStageLessons(targetLang, 'A2', seedA2, focusArea, 20, sourceLang);

      return [
        createLocalizedStage(STAGE_DEFINITIONS[0], a0),
        createLocalizedStage(STAGE_DEFINITIONS[1], a1),
        createLocalizedStage(STAGE_DEFINITIONS[2], a2),
      ];
    }
    case 'en': {
      const lessons = PHASES_DATA.flatMap((phase) => phase.lessons);
      return STAGE_DEFINITIONS.map((definition, index) =>
        createStageNode(
          definition,
          lessons.slice(index * LESSONS_PER_STAGE, (index + 1) * LESSONS_PER_STAGE)
        )
      );
    }
    default: {
      const unexpectedTarget: never = targetLang;
      throw new Error(`No curriculum is configured for target language: ${unexpectedTarget}`);
    }
  }
}

let lastRoutedTargetLang: TargetLanguage | undefined;

function readActiveProfile(): { targetLang: TargetLanguage; focusArea?: string; sourceLang?: string } | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const directTarget = localStorage.getItem('tb.targetLang');
    let focusArea = 'general';
    let sourceLang = 'arz';

    const rawConfig = localStorage.getItem('tb.activeProfileConfig');
    if (rawConfig) {
      const parsedConfig = JSON.parse(rawConfig);
      if (parsedConfig && typeof parsedConfig === 'object') {
        if (typeof parsedConfig.goal === 'string') focusArea = parsedConfig.goal;
        if (typeof parsedConfig.focusArea === 'string') focusArea = parsedConfig.focusArea;
        if (typeof parsedConfig.sourceLang === 'string') sourceLang = parsedConfig.sourceLang;
      }
    }

    if (directTarget && TARGET_LANGUAGES.some((l) => l.code === directTarget)) {
      return { targetLang: directTarget as TargetLanguage, focusArea, sourceLang };
    }

    if (rawConfig) {
      const parsedConfig = JSON.parse(rawConfig);
      if (parsedConfig && typeof parsedConfig === 'object' && 'targetLang' in parsedConfig) {
        const lang = parsedConfig.targetLang;
        if (typeof lang === 'string' && TARGET_LANGUAGES.some((l) => l.code === lang)) {
          return { targetLang: lang as TargetLanguage, focusArea, sourceLang };
        }
      }
    }

    const rawProfile = localStorage.getItem('tb.userProfile');
    if (rawProfile) {
      const parsedProfile = JSON.parse(rawProfile);
      if (parsedProfile && typeof parsedProfile === 'object') {
        if (typeof parsedProfile.focusArea === 'string') focusArea = parsedProfile.focusArea;
        else if (typeof parsedProfile.goal === 'string') focusArea = parsedProfile.goal;

        if (typeof parsedProfile.sourceLanguage === 'string') sourceLang = parsedProfile.sourceLanguage;
        else if (typeof parsedProfile.dialect === 'string') sourceLang = parsedProfile.dialect === 'egyptian' ? 'arz' : 'ar';

        if ('targetLanguage' in parsedProfile) {
          const lang = parsedProfile.targetLanguage;
          if (typeof lang === 'string' && TARGET_LANGUAGES.some((l) => l.code === lang)) {
            return { targetLang: lang as TargetLanguage, focusArea, sourceLang };
          }
        }
      }
    }
  } catch {}
  return null;
}

export function isStageUnlocked(
  state: ProgressionState,
  stage: StageNode['stage'],
  targetLang?: TargetLanguage
): boolean {
  const stages = buildCourseStructure(targetLang);
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

export function isLessonUnlocked(
  state: ProgressionState,
  lesson: LessonNode,
  targetLang?: TargetLanguage
): boolean {
  if (!isStageUnlocked(state, lesson.stage, targetLang)) return false;
  if (state.completedLessonIds.includes(lesson.id)) return true;
  if (lesson.stage !== state.currentStage) return true;

  const stage = buildCourseStructure(targetLang).find((item) => item.stage === lesson.stage);
  if (!stage) return false;

  const lessons = stage.units.flatMap((unit) => unit.lessons);
  const nextLessonIndex = lessons.findIndex(
    (item) => !state.completedLessonIds.includes(item.id)
  );
  const lessonIndex = lessons.findIndex((item) => item.id === lesson.id);
  return nextLessonIndex < 0 || (lessonIndex >= 0 && lessonIndex <= nextLessonIndex);
}
