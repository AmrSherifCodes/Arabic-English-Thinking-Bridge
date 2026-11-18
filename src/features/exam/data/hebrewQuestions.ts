/**
 * CC0 1.0 Universal - Public Domain
 * Pedagogy inspired by Mihalis Eleftheriou & Language Transfer. Built in Alexandria. CC0.
 *
 * Hebrew Language Module (Linguistic & Comparative Semitic Focus)
 * Strictly neutral: zero political, religious, or country references.
 */

import { ExamQuestion } from '../types';

export const hebrewQuestions: ExamQuestion[] = [
  // ================= A1 LEVEL (8 Questions) =================
  {
    id: 'he-a1-grammar-001', lang: 'he', cefr: 'A1', skill: 'grammar', type: 'mcq',
    promptArz: 'اختار الضمير المناسب للـ "أنا":',
    stem: '___ לומד ערבית ועברית.',
    options: ['אני', 'אתה', 'הוא', 'אנחנו'], correctIndex: 0,
    explanationArz: '"אני" (أني) يعني أنا. قريبة جداً من العربية، نفس الجذر السامي.',
    tags: ['pronouns', 'cognates']
  },
  {
    id: 'he-a1-vocab-001', lang: 'he', cefr: 'A1', skill: 'vocabulary', type: 'mcq',
    promptArz: 'إيه معنى كلمة "מים" (مايم)؟',
    stem: 'אפשר לקבל מים, בבקשה?',
    options: ['مية', 'خبز', 'شاي', 'لبن'], correctIndex: 0,
    explanationArz: '"מים" (مايم) تعني مية، مشتقة من نفس الجذر "م-ي-هـ / م-א-י".',
    tags: ['semitic-cognates', 'everyday']
  },
  {
    id: 'he-a1-grammar-002', lang: 'he', cefr: 'A1', skill: 'grammar', type: 'mcq',
    promptArz: 'اختار اسم الإشارة المذكر (هذا):',
    stem: '___ בית גדול.',
    options: ['זה', 'זאת', 'אלה', 'הם'], correctIndex: 0,
    explanationArz: '"זה" (زيه) تعني هذا للمذكر. زي كلمة "ذا" في العربية.',
    tags: ['demonstratives']
  },
  {
    id: 'he-a1-vocab-002', lang: 'he', cefr: 'A1', skill: 'vocabulary', type: 'mcq',
    promptArz: 'معنى "בית" (بيت) إيه؟',
    stem: 'אני בבית עכשיו.',
    options: ['بيت', 'مدرسة', 'مستشفى', 'شارع'], correctIndex: 0,
    explanationArz: '"בית" (بيت) نفس الكلمة والنطق والمعنى بالظبط في العربي.',
    tags: ['cognates']
  },
  {
    id: 'he-a1-listening-001', lang: 'he', cefr: 'A1', skill: 'listening', type: 'mcq',
    promptArz: 'اسمع واختار التحية الصح:',
    stem: '(اضغط "شغّل الصوت" الأول)',
    audioText: 'שלום, בוקר טוב.',
    options: ['أهلاً، صباح الخير', 'مساء الخير يا فندم', 'تصبح على خير', 'مع السلامة'], correctIndex: 0,
    explanationArz: '"שלום" (شلوم/سلام) تعني سلام/أهلاً، و"בוקר טוב" (بوكير طوف) تعني صباح الخير (باكر طيب).',
    tags: ['greetings']
  },
  {
    id: 'he-a1-reading-001', lang: 'he', cefr: 'A1', skill: 'reading', type: 'mcq',
    promptArz: 'اقرا النص البسيط واختار الإجابة الصح:',
    stem: 'קוראים לי דני. אני מורה.',
    options: ['داني بيشتغل معلم', 'داني مهندس', 'داني طبيب', 'داني طالب'], correctIndex: 0,
    explanationArz: '"מורה" (موريه) تعني معلم/مدرس.',
    tags: ['reading']
  },
  {
    id: 'he-a1-grammar-003', lang: 'he', cefr: 'A1', skill: 'grammar', type: 'mcq',
    promptArz: 'اختار أداة التعريف (الـ):',
    stem: '___ ספר שייך לתלמיד.',
    options: ['ה', 'ב', 'ל', 'מ'], correctIndex: 0,
    explanationArz: 'أداة التعريف في العبرية هي اللاحقة "ה" (هـ) التي تُضاف لأول الاسم (הספר = الكتاب).',
    tags: ['articles']
  },
  {
    id: 'he-a1-vocab-003', lang: 'he', cefr: 'A1', skill: 'vocabulary', type: 'mcq',
    promptArz: 'معنى "ספר" (سيفر) إيه؟',
    stem: 'אני קורא ספר מעניין.',
    options: ['كتاب/سِفْر', 'قلم', 'طاولة', 'حقيبة'], correctIndex: 0,
    explanationArz: '"ספר" (سِفر) تعني كتاب. نفس الجذر السامي س-ف-ر (سِفْر في العربية).',
    tags: ['cognates']
  },

  // ================= A2 LEVEL (8 Questions) =================
  {
    id: 'he-a2-grammar-001', lang: 'he', cefr: 'A2', skill: 'grammar', type: 'mcq',
    promptArz: 'اختار حرف الجر المناسب لـ (في / Inside):',
    stem: 'הם יושבים ___ חדר.',
    options: ['ב', 'ל', 'מ', 'על'], correctIndex: 0,
    explanationArz: 'حرف الجر "ב" (بـ) يُضاف مباشرة للكلمة بمعنى "في" أو "بـ".',
    tags: ['prepositions']
  },
  {
    id: 'he-a2-listening-001', lang: 'he', cefr: 'A2', skill: 'listening', type: 'mcq',
    promptArz: 'اسمع واختار المكان الصح:',
    stem: '(اضغط "شغّل الصوت" الأول)',
    audioText: 'אני הולך לשוק לקנות ירקות.',
    options: ['رايح السوق يشتري خضار', 'رايح المحطة يركب القطر', 'رايح الجامعة يحضر محاضرة', 'راجع البيت ينام'], correctIndex: 0,
    explanationArz: '"שוק" (شوق) = سوق، و"ירקות" (يرقوت) = خضراوات (من جذر ورَق/خُضرة).',
    tags: ['transport', 'vocab']
  },
  {
    id: 'he-a2-grammar-002', lang: 'he', cefr: 'A2', skill: 'grammar', type: 'mcq',
    promptArz: 'اختار صيغة الجمع المؤنث للأفعال في المضارع:',
    stem: 'הבנות ___ מכתב.',
    options: ['כותבות', 'כותב', 'כותבת', 'כותבים'], correctIndex: 0,
    explanationArz: 'جمع المؤنث في العبرية بياخد اللاحقة "-ות" (وت) في المضارع (כותבות = يكتبن).',
    tags: ['present-tense']
  },
  {
    id: 'he-a2-vocab-001', lang: 'he', cefr: 'A2', skill: 'vocabulary', type: 'mcq',
    promptArz: 'معنى "שמש" (شيمش) إيه؟',
    stem: 'השמש זורחת בבוקר.',
    options: ['شمس', 'قمر', 'نجم', 'سحاب'], correctIndex: 0,
    explanationArz: '"שמש" (شيمش) هي الشرف والشمس بنفس الجذر السامي.',
    tags: ['nature', 'cognates']
  },
  {
    id: 'he-a2-reading-001', lang: 'he', cefr: 'A2', skill: 'reading', type: 'mcq',
    promptArz: 'اقرا واختار الإجابة الصحيحة:',
    stem: 'דנה קוראת עיתון כל בוקר בשעה שבע.',
    options: ['دانا بتقرا جريدة كل يوم الساعة 7 صباحاً', 'دانا بتسمع راديو بالليل', 'دانا بتسافر كل يوم الساعة 7', 'دانا بتطبخ الصبح'], correctIndex: 0,
    explanationArz: '"עיתון" (عيتون) = جريدة/صحيفة (من جذر عِت/وقت).',
    tags: ['reading']
  },
  {
    id: 'he-a2-grammar-003', lang: 'he', cefr: 'A2', skill: 'grammar', type: 'mcq',
    promptArz: 'اختار مفعول به المعرف (את):',
    stem: 'אני רואה ___ האיש.',
    options: ['את', 'עם', 'על', 'אל'], correctIndex: 0,
    explanationArz: 'كلمة "את" (إيت) تُستخدم كأداة للمفعول به المحدد المعرف بالـ.',
    tags: ['direct-object']
  },
  {
    id: 'he-a2-vocab-002', lang: 'he', cefr: 'A2', skill: 'vocabulary', type: 'mcq',
    promptArz: 'معنى "יום" (يوم) الجمع بتاعه إيه؟',
    stem: 'שבעה ___ בשבוע.',
    options: ['ימים', 'שנים', 'חדשים', 'שעות'], correctIndex: 0,
    explanationArz: '"ימים" (ياميم) هي جمع كلمة "יום" (يوم).',
    tags: ['time']
  },
  {
    id: 'he-a2-listening-002', lang: 'he', cefr: 'A2', skill: 'listening', type: 'mcq',
    promptArz: 'اسمع واختار الإجابة:',
    stem: '(اضغط "شغّل الصوت" الأول)',
    audioText: 'מה השעה עכשיו?',
    options: ['بيسأل عن الساعة كم دلوقتي', 'بيسأل عن مكان المحطة', 'بيطلب أكل وشرب', 'بيسلم على صديقه'], correctIndex: 0,
    explanationArz: '"מה השעה" (ماه هشاعاه) = كم الساعة الآن.',
    tags: ['listening']
  },

  // ================= B1 LEVEL (8 Questions) =================
  {
    id: 'he-b1-grammar-001', lang: 'he', cefr: 'B1', skill: 'grammar', type: 'mcq',
    promptArz: 'اختار تصريف الماضي للمتكلم (אני):',
    stem: 'אתמול ___ את המאמר.',
    options: ['קראתי', 'קראת', 'קרא', 'קראנו'], correctIndex: 0,
    explanationArz: 'في الماضي مع المتكلم (أنا) بنضيف اللاحقة "-תי" (تي) كـ (קראתי = قرأتُ). قريبة من العربية.',
    tags: ['past-tense']
  },
  {
    id: 'he-b1-reading-001', lang: 'he', cefr: 'B1', skill: 'reading', type: 'mcq',
    promptArz: 'اقرا واختار المعنى الدقيق:',
    stem: 'למרות הגשם הכבד, המשיכו המטיילים בדרכם.',
    options: ['رغم المطر الشديد، كمل المسافرين طريقهم', 'المسافرين رجعوا عشان المطر', 'المطر وقف والناس خرجت', 'الرحلة اتلغت تماماً'], correctIndex: 0,
    explanationArz: '"למרות" (لمروت) = بالرغم من.',
    tags: ['reading', 'connectors']
  },
  {
    id: 'he-b1-grammar-002', lang: 'he', cefr: 'B1', skill: 'grammar', type: 'mcq',
    promptArz: 'اختار اسم الفاعل المشتق (وزن פועל):',
    stem: 'הוא ___ מכתב לחברו.',
    options: ['כותב', 'כתב', 'יכתוב', 'לכתוב'], correctIndex: 0,
    explanationArz: 'وزن اسم الفاعل البسيط في العبرية (פועל - فوعيل) مثل כותב (كوتيف = كاتب).',
    tags: ['binyanim']
  },
  {
    id: 'he-b1-vocab-001', lang: 'he', cefr: 'B1', skill: 'vocabulary', type: 'mcq',
    promptArz: 'معنى كلمة "החלטה" (هحلاطاه) إيه؟',
    stem: 'קיבלנו החלטה חשובה.',
    options: ['قرار', 'مشكلة', 'سؤال', 'اقتراح'], correctIndex: 0,
    explanationArz: '"החלטה" تعني قرار (من جذر ח-ל-ט / حَلَطَ حسم).',
    tags: ['abstract-nouns']
  },
  {
    id: 'he-b1-listening-001', lang: 'he', cefr: 'B1', skill: 'listening', type: 'mcq',
    promptArz: 'اسمع واستنتج الفكرة:',
    stem: '(اضغط "شغّل الصوت" الأول)',
    audioText: 'אם יהיה לי זמן מחר, אבוא לבקר אותך.',
    options: ['لو عندي وقت بكرة، هجي أزورك', 'أنا مش هاجي أزورك خالص', 'أنا جيت زرتك إمبارح', 'أنا مش فاضي الأسبوع ده'], correctIndex: 0,
    explanationArz: '"אם יהיה לי זמן" = لو هيبقى عندي وقت (جملة شرطية مستقبلية).',
    tags: ['conditionals']
  },
  {
    id: 'he-b1-grammar-003', lang: 'he', cefr: 'B1', skill: 'grammar', type: 'mcq',
    promptArz: 'اختار حرف الجر مع الضمير המתאים (معك / With you):',
    stem: 'אני רוצה לדבר ___ (איתך).',
    options: ['איתך', 'עלייך', 'אלייך', 'ממך'], correctIndex: 0,
    explanationArz: '"איתך" (إيتاخ/إيتح) تعني معك.',
    tags: ['prepositions-with-pronouns']
  },
  {
    id: 'he-b1-vocab-002', lang: 'he', cefr: 'B1', skill: 'vocabulary', type: 'mcq',
    promptArz: 'معنى كلمة "פתרון" (بيترون) إيه؟',
    stem: 'מצאנו פתרון לבעיה.',
    options: ['حل', 'سبب', 'نتيجة', 'عائق'], correctIndex: 0,
    explanationArz: '"פתרון" تعني حل للمشكلة (من جذر פ-ת-ר / فسر وشرح وفك).',
    tags: ['vocab']
  },
  {
    id: 'he-b1-reading-002', lang: 'he', cefr: 'B1', skill: 'reading', type: 'mcq',
    promptArz: 'اقرا واختار الصح:',
    stem: 'המחקר החדש מראה את החשיבות של תזונה מאוזנת.',
    options: ['البحث الجديد بيوضح أهمية التغذية المتوازنة', 'البحث أثبت إن الرياضة مش مهمة', 'البحث بيتكلم عن التلوث البيئي', 'البحث اتلغى بسبب نقص التمويل'], correctIndex: 0,
    explanationArz: '"מחקר" (محقار) = بحث (من جذر حـقـر/بحث)، و"תזונה" = تغذية.',
    tags: ['reading']
  },

  // ================= B2 LEVEL (8 Questions) =================
  {
    id: 'he-b2-grammar-001', lang: 'he', cefr: 'B2', skill: 'grammar', type: 'mcq',
    promptArz: 'اختار صيغة المبني للمجهول في وزن נפעל:',
    stem: 'הספר ___ בשנה שעברה.',
    options: ['נכתב', 'כותב', 'יכתוב', 'לכתוב'], correctIndex: 0,
    explanationArz: 'وزن נפעל (نيفعل) يُستخدم كأنفعال ومبني للمجهول (נכתב = كُتِبَ / انكتب).',
    tags: ['binyanim', 'passive']
  },
  {
    id: 'he-b2-vocab-001', lang: 'he', cefr: 'B2', skill: 'vocabulary', type: 'mcq',
    promptArz: 'اختار الكلمة المتقدمة الدالة على "تأثير":',
    stem: 'לשינוי האקלים יש ___ רבה על החקלאות.',
    options: ['השפעה', 'סיבה', 'תוצאה', 'מטרה'], correctIndex: 0,
    explanationArz: '"השפעה" (هشفاعاه) تعني تأثير (من جذر ש-פ-ע / نبع وأفاض).',
    tags: ['b2-vocab']
  },
  {
    id: 'he-b2-listening-001', lang: 'he', cefr: 'B2', skill: 'listening', type: 'mcq',
    promptArz: 'اسمع المقطع واستنتج المغزى المعقد:',
    stem: '(اضغط "شغّل الصوت" الأول)',
    audioText: 'ככל שמתרגלים יותר, כך משפרים את המיומנות.',
    options: ['كل ما بتتمرن أكتر، كل ما المهارة بتحسن', 'التمرين ملوش أي تأثير على المهارة', 'المهارة بتيجي بالحظر مش بالتمرين', 'التمرين الكتير بيضعف المستوى'], correctIndex: 0,
    explanationArz: 'تركيب التناسب: "ככל ש... כך..." (كلما ... كلما ...).',
    tags: ['syntax']
  },
  {
    id: 'he-b2-reading-001', lang: 'he', cefr: 'B2', skill: 'reading', type: 'mcq',
    promptArz: 'اقرا الفقرة الأكاديمية واختار الاستنتاج الدقيق:',
    stem: 'על אף הקשיים הכלכליים, הצליחה החברה להרחיב את פעילותה.',
    options: ['رغم الصعوبات الاقتصادية، نجحت الشركة في توسيع نشاطها', 'الشركة أفلست بسبب الأزمة', 'الشركة قللت نشاطها في السوق', 'الشركة اتعطلت تماماً'], correctIndex: 0,
    explanationArz: '"על אף" (عل أف) = بالرغم من (حرف ربط فصيح).',
    tags: ['reading', 'advanced-connectors']
  },
  {
    id: 'he-b2-grammar-002', lang: 'he', cefr: 'B2', skill: 'grammar', type: 'mcq',
    promptArz: 'اختار صيغة المصدر المباشر (שם פועל):',
    stem: 'חשוב ___ את השפה בהתמדה.',
    options: ['ללמוד', 'למד', 'לומד', 'ילמד'], correctIndex: 0,
    explanationArz: 'المصدر المسبوق بحرف اللام (ללמוד = أن يتعلم / التعلم).',
    tags: ['infinitive']
  },
  {
    id: 'he-b2-vocab-002', lang: 'he', cefr: 'B2', skill: 'vocabulary', type: 'mcq',
    promptArz: 'معنى المصطلح اللغوي "התפתחות" (هتفتخوت) إيه؟',
    stem: 'אנו עוקבים אחר ___ הטכנולוגיה.',
    options: ['התפתחות', 'ירידה', 'הפסקה', 'שגיאה'], correctIndex: 0,
    explanationArz: '"התפתחות" تعني تطور (من جذر פ-ת-ח / فتح وتفتح).',
    tags: ['b2-vocab']
  },
  {
    id: 'he-b2-grammar-003', lang: 'he', cefr: 'B2', skill: 'grammar', type: 'mcq',
    promptArz: 'اختار التركيب الشرطي غير المحقق (לו):',
    stem: 'לו ___ זאת קודם, הייתי פועל אחרת.',
    options: ['ידעתי', 'אדע', 'יודע', 'דע'], correctIndex: 0,
    explanationArz: 'أداة الشرط الامتناعي "לו" (لو) يتبعها الفعل الماضي للتعبير عن افتراض لم يتحقق.',
    tags: ['conditionals']
  },
  {
    id: 'he-b2-listening-002', lang: 'he', cefr: 'B2', skill: 'listening', type: 'mcq',
    promptArz: 'اسمع واختار التأويل الأدق:',
    stem: '(اضغط "شغّل الصوت" الأول)',
    audioText: 'מן הראוי לבחון את הנושא מכל הצדדים.',
    options: ['من الجدير والمستحسن فحص الموضوع من كل الجوانب', 'الموضوع مش محتاج أي فحص', 'الفحص لازم يكون من جانب واحد بس', 'الموضوع اتقفل خلاص'], correctIndex: 0,
    explanationArz: '"מן הראוי" (من هراؤي) = من الجدير بالذكر / المستحسن.',
    tags: ['listening']
  },

  // ================= C1 LEVEL (8 Questions) =================
  {
    id: 'he-c1-grammar-001', lang: 'he', cefr: 'C1', skill: 'grammar', type: 'mcq',
    promptArz: 'اختار التركيبة اللغوية الفصيحة جداً (مستقلة الروابط):',
    stem: 'בבלתי נמנע הוא שתיווצר מורכבות ___ המצב.',
    options: ['עקב', 'בגלל', 'מפני', 'שכן'], correctIndex: 0,
    explanationArz: '"עקב" (أقيف/عَقِب) يُستخدم كحرف جر فصيح بمعنى "بسبب / على إثر".',
    tags: ['c1-syntax']
  },
  {
    id: 'he-c1-vocab-001', lang: 'he', cefr: 'C1', skill: 'vocabulary', type: 'mcq',
    promptArz: 'اختار المفردة البلاغية الفصيحة:',
    stem: 'דבריו היו מתובלים ב___ רבה ובחריפות מחשבתית.',
    options: ['פנינות חכמה', 'טעויות', 'שעמום', 'היסוס'], correctIndex: 0,
    explanationArz: '"פנינות חכמה" تعني درر من الحكمة والبلاغة.',
    tags: ['c1-vocab']
  },
  {
    id: 'he-c1-reading-001', lang: 'he', cefr: 'C1', skill: 'reading', type: 'mcq',
    promptArz: 'اقرا النص الأكاديمي الفلسفي واختار التحليل الأصح:',
    stem: 'אין לראות במכשולים אלא אבני בוחן להערכת הנחישות.',
    options: ['العقبات مش إلا اختبارات حقيقية لتقييم العزيمة والإصرار', 'العقبات بتثبت إن الهدف مستحيل', 'العزيمة مالهاش دور في تجاوز الصعاب', 'الهدف اتلغى تماماً'], correctIndex: 0,
    explanationArz: '"אבני בוחן" (أبني بوحن) = محك واختبار حقيقي.',
    tags: ['reading', 'c1-philosophy']
  },
  {
    id: 'he-c1-listening-001', lang: 'he', cefr: 'C1', skill: 'listening', type: 'mcq',
    promptArz: 'اسمع المقطع اللغوي السامي واختار المغزى الأعمق:',
    stem: '(اضغط "شغّل الصوت" الأول)',
    audioText: 'שורשי השפות השמיות מעידים על זיקה תרבותית ולשונית עמוקה.',
    options: ['جذور اللغات السامية بتشهد على علاقة ورابطة لغوية وثقافية عميقة', 'اللغات السامية ملهاش أي صلة ببعض', 'اللغات اتطورت بشكل منفصل تماماً', 'البحث اللغوي لم يجد أي نتائج'], correctIndex: 0,
    explanationArz: '"זיקה" (زيكاه) تعني صلة ورابطة وثيقة.',
    tags: ['listening', 'linguistics']
  },
  {
    id: 'he-c1-grammar-002', lang: 'he', cefr: 'C1', skill: 'grammar', type: 'mcq',
    promptArz: 'اختار التركيب الاستثنائي الفصيح (זולת):',
    stem: 'אין איש בחדר ___ המרצה.',
    options: ['זולת', 'אם', 'כי', 'או'], correctIndex: 0,
    explanationArz: '"זולת" (زولات) تعني سِوى / باستثناء.',
    tags: ['advanced-particles']
  },
  {
    id: 'he-c1-vocab-002', lang: 'he', cefr: 'C1', skill: 'vocabulary', type: 'mcq',
    promptArz: 'إيه معنى التعبير البلاغي "אבן פינה" (إيبن فيناه)؟',
    stem: 'מחקר זה מהווה ___ בתחום הבלשנות.',
    options: ['אבן פינה', 'אבן נגף', 'סוף דבר', 'טעות חמורה'], correctIndex: 0,
    explanationArz: '"אבן פינה" تعني حجر الزاوية والأساس الجوهري.',
    tags: ['c1-idioms']
  },
  {
    id: 'he-c1-reading-002', lang: 'he', cefr: 'C1', skill: 'reading', type: 'mcq',
    promptArz: 'اقرا البيت الشعر البلاغي واختار معناه:',
    stem: 'הזמן הוא מורה מצוין, אך למרבה הצער הוא הורג את תלמידיו.',
    options: ['الوقت معلم ممتاز بس للأسف بينهي حياة طلابه مع الزمن', 'الوقت مش بيعلم حاجة خالص', 'الطلاب بيعيشوا للأبد مع العلم', 'المعلم مش بيقدر يدرس كويس'], correctIndex: 0,
    explanationArz: 'مقولة بلاغية عن طبيعة الوقت والزمن.',
    tags: ['reading', 'literature']
  },
  {
    id: 'he-c1-listening-002', lang: 'he', cefr: 'C1', skill: 'listening', type: 'mcq',
    promptArz: 'اسمع واختار الاستنتاج البلاغي الدقيق:',
    stem: '(اضغط "شغّل الصوت" الأول)',
    audioText: 'חופש הדיבור אינו רק זכות, אלא גם אחריות חברתית ראשונה במעלה.',
    options: ['حرية التعبير مش مجرد حق، دي كمان مسؤولية مجتمعية في المقام الأول', 'حرية التعبير مالهاش أي ضوابط أو مسؤولية', 'المسؤولية بتمنع حرية التعبير', 'الحق أهم من المسؤولية دايمًا'], correctIndex: 0,
    explanationArz: '"ראשונה במעלה" (راشونا بَمعلاه) = في المقام الأول والأعلى.',
    tags: ['listening', 'c1-phrases']
  }
];
