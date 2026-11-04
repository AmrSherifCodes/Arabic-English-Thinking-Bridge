import { StageNode, UnitNode, LessonNode, ExerciseItem, ExerciseType, ProgressionState } from './types';
import { PHASES_DATA } from '../data/lessons';
import { TARGET_LANGUAGES, TARGET_LANGUAGE_META } from '../data/languages';
import type { ChunkRole, Exercise, Lesson } from '../types';

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

type LocalizedChunk = [arabicText: string, englishText: string, role: ChunkRole, explanation: string];

function localizedLesson(
  id: string,
  titleEn: string,
  titleAr: string,
  promptAr: string,
  promptEn: string,
  targetSentence: string,
  chunks: LocalizedChunk[],
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
    wordChips: targetSentence.split(' '),
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

const LOCALIZED_A1_A2_LESSONS: Record<LocalizedTarget, Record<'A1' | 'A2', LocalizedLessonDefinition[]>> = {
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
    ],
  },
  ja: {
    A1: [
      localizedLesson('ja-a1-i-adjective', 'Japanese I-Adjectives', 'صفات i في اليابانية', 'هذه التفاحة حمراء.', 'Use an i-adjective before desu.', 'Kono ringo wa akai desu.', [
        ['هذه التفاحة', 'Kono ringo', 'subject', 'Kono ringo is the noun phrase.'],
        ['أداة الموضوع', 'wa', 'connector', 'Wa marks the topic.'],
        ['حمراء', 'akai', 'modifier', 'Akai is an i-adjective describing the apple.'],
        ['صيغة مهذبة', 'desu', 'verb', 'Desu gives the sentence a polite ending.'],
      ]),
      localizedLesson('ja-a1-i-past', 'Past Form of I-Adjectives', 'صيغة الماضي لصفات i', 'كان الجو بارداً أمس.', 'Change samui to its past form samukatta.', 'Kinou wa samukatta desu.', [
        ['أمس', 'Kinou', 'modifier', 'The time expression sets a past context.'],
        ['أداة الموضوع', 'wa', 'connector', 'Wa marks the topic.'],
        ['كان بارداً', 'samukatta', 'modifier', 'The i-adjective ending changes to -katta in the past.'],
        ['صيغة مهذبة', 'desu', 'verb', 'Desu keeps the statement polite.'],
      ]),
      localizedLesson('ja-a1-na-adjective', 'Japanese Na-Adjectives', 'صفات na في اليابانية', 'هذه المدينة هادئة.', 'Use na-adjective shizuka with desu.', 'Kono machi wa shizuka desu.', [
        ['هذه المدينة', 'Kono machi', 'subject', 'Kono machi is the topic noun phrase.'],
        ['أداة الموضوع', 'wa', 'connector', 'Wa marks the topic.'],
        ['هادئة', 'shizuka', 'modifier', 'Shizuka is a na-adjective; before a noun it takes na.'],
        ['صيغة مهذبة', 'desu', 'verb', 'Desu completes the polite predicate.'],
      ]),
    ],
    A2: [
      localizedLesson('ja-a2-i-negative-past', 'Past Negative I-Adjectives', 'النفي في الماضي لصفات i', 'لم أكن مشغولاً أمس.', 'Form the past negative of an i-adjective.', 'Kinou wa isogashiku nakatta desu.', [
        ['أمس', 'Kinou', 'modifier', 'The time expression sets the past context.'],
        ['أداة الموضوع', 'wa', 'connector', 'Wa marks the topic.'],
        ['لم يكن مزدحماً', 'isogashiku nakatta', 'modifier', 'The adjective changes to -ku nakatta for past negation.'],
        ['صيغة مهذبة', 'desu', 'verb', 'Desu makes the negative statement polite.'],
      ]),
      localizedLesson('ja-a2-giving-particle', 'Particles in a Giving Sentence', 'أدوات الجملة عند إعطاء شيء', 'أعطيت صديقي كتاباً.', 'Mark the recipient with ni and the object with o.', 'Watashi wa tomodachi ni hon o agemashita.', [
        ['أنا', 'Watashi', 'subject', 'The speaker is the topic.'],
        ['أداة الموضوع', 'wa', 'connector', 'Wa marks the topic.'],
        ['إلى صديقي', 'tomodachi ni', 'object', 'Ni marks the recipient.'],
        ['كتاباً', 'hon', 'object', 'Hon is the thing being given.'],
        ['أداة المفعول', 'o', 'connector', 'O marks the direct object.'],
        ['أعطيت', 'agemashita', 'verb', 'The polite past verb comes last.'],
      ]),
      localizedLesson('ja-a2-reason-kara', 'Giving a Reason with kara', 'ذكر السبب باستخدام kara', 'لأن المطر يهطل، أبقى في المنزل.', 'Put the reason before kara and the result after it.', 'Ame ga futte imasu kara, uchi ni imasu.', [
        ['المطر', 'Ame', 'subject', 'Ame is the topic of the reason clause.'],
        ['أداة الفاعل', 'ga', 'connector', 'Ga marks the subject of the event.'],
        ['يهطل', 'futte imasu', 'verb', 'The te-iru form describes ongoing rain.'],
        ['لأن', 'kara', 'connector', 'Kara marks the reason.'],
        ['في المنزل', 'uchi ni', 'modifier', 'Ni marks the location of being.'],
        ['أبقى', 'imasu', 'verb', 'The result clause follows the reason.'],
      ]),
    ],
  },
};

function createLocalizedStage(
  definition: Omit<StageNode, 'units' | 'stageExam'>,
  lessonDefinitions: LocalizedLessonDefinition[]
): StageNode {
  const units: UnitNode[] = lessonDefinitions.map((lessonDefinition, index) => {
    const unitId = `${definition.stage.toLowerCase()}-unit-${index + 1}`;
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
      stage: definition.stage,
      titleAr: lessonDefinition.titleAr,
      titleEn: lessonDefinition.titleEn,
      descriptionAr: lessonDefinition.descriptionAr,
      descriptionEn: lessonDefinition.descriptionEn,
      icon: ['🧱', '🧩', '🚀'][index],
      exercises: [exercise],
    };
    return {
      id: unitId,
      stage: definition.stage,
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
      return [
        createLocalizedStage(STAGE_DEFINITIONS[0], LOCALIZED_A0_LESSONS[profile.targetLang]),
        createLocalizedStage(STAGE_DEFINITIONS[1], LOCALIZED_A1_A2_LESSONS[profile.targetLang].A1),
        createLocalizedStage(STAGE_DEFINITIONS[2], LOCALIZED_A1_A2_LESSONS[profile.targetLang].A2),
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
