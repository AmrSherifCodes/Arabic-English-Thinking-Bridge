/**
 * CC0 1.0 Universal - Public Domain
 * Pedagogy inspired by Mihalis Eleftheriou & Language Transfer. Built in Alexandria. CC0.
 */

import { ExamQuestion } from '../types';

export const germanQuestions: ExamQuestion[] = [
  // ================= A1 LEVEL (8 Questions) =================
  {
    id: 'de-a1-grammar-001', lang: 'de', cefr: 'A1', skill: 'grammar', type: 'mcq',
    promptArz: 'اختار الفعل الصح:',
    stem: 'Ich ___ aus Ägypten.',
    options: ['komme', 'kommst', 'kommt', 'kommen'], correctIndex: 0,
    explanationArz: 'مع "ich" الفعل بياخد "-e": ich komme. زي "أنا من مصر" بالظبط.',
    tags: ['kommen', 'verbs']
  },
  {
    id: 'de-a1-vocab-001', lang: 'de', cefr: 'A1', skill: 'vocabulary', type: 'mcq',
    promptArz: 'إيه معنى "Bahnhof"؟',
    stem: 'Der Bahnhof ist nicht weit von hier.',
    options: ['محطة القطر', 'المطار', 'المترو', 'المرسى'], correctIndex: 0,
    explanationArz: '"Bahnhof" = محطة القطر. "Bahn" = سكة حديد، و"Hof" = ساحة. بسيطة.',
    tags: ['travel']
  },
  {
    id: 'de-a1-grammar-002', lang: 'de', cefr: 'A1', skill: 'grammar', type: 'mcq',
    promptArz: 'كمّل بأداة التعريف المذكرة الصح:',
    stem: '___ Mann heißt Thomas.',
    options: ['Der', 'Die', 'Das', 'Ein'], correctIndex: 0,
    explanationArz: '"Mann" اسم مذكر بياخد أداة التعريف "Der".',
    tags: ['articles']
  },
  {
    id: 'de-a1-vocab-002', lang: 'de', cefr: 'A1', skill: 'vocabulary', type: 'mcq',
    promptArz: 'إيه معنى "Wasser" في الألماني؟',
    stem: 'Ein Glas Wasser, bitte.',
    options: ['مية', 'شاي', 'قهوة', 'عصير'], correctIndex: 0,
    explanationArz: '"Wasser" هي المية بالألماني، قريبة جداً من "water" بالإنجليزي.',
    tags: ['food-drinks']
  },
  {
    id: 'de-a1-listening-001', lang: 'de', cefr: 'A1', skill: 'listening', type: 'mcq',
    promptArz: 'اسمع واختار التحية الصح:',
    stem: '(اضغط "شغّل الصوت" الأول)',
    audioText: 'Guten Tag, wie geht es Ihnen?',
    options: ['نهارك سعيد، إزاي حضرتك؟', 'تصبح على خير يا صديقي', 'مع السلامة يا فندم', 'أهلاً في بيتك'], correctIndex: 0,
    explanationArz: '"Guten Tag" = نهارك سعيد، و"wie geht es Ihnen" = إزاي حضرتك.',
    tags: ['greetings']
  },
  {
    id: 'de-a1-reading-001', lang: 'de', cefr: 'A1', skill: 'reading', type: 'mcq',
    promptArz: 'اقرا الجملة البسيطة دي واختار صح:',
    stem: 'Mein Name ist Anna. Ich wohne in Berlin.',
    options: ['آنا ساكنة في برلين', 'آنا ساكنة في ميونخ', 'آنا ساكنة في القاهرة', 'آنا مش في ألمانيا'], correctIndex: 0,
    explanationArz: '"Ich wohne in Berlin" = أنا ساكنة في برلين.',
    tags: ['reading']
  },
  {
    id: 'de-a1-grammar-003', lang: 'de', cefr: 'A1', skill: 'grammar', type: 'mcq',
    promptArz: 'اختار التصريف الصح لفعل "sein" (يكون):',
    stem: 'Wir ___ Studenten.',
    options: ['sind', 'bist', 'ist', 'seid'], correctIndex: 0,
    explanationArz: 'مع الضمير "Wir" (نحن) تصريف فعل يكون هو "sind".',
    tags: ['sein']
  },
  {
    id: 'de-a1-vocab-003', lang: 'de', cefr: 'A1', skill: 'vocabulary', type: 'mcq',
    promptArz: 'معنى "Buch" إيه بالألماني؟',
    stem: 'Ich lese ein Buch.',
    options: ['كتاب', 'قلم', 'كرسي', 'طاولة'], correctIndex: 0,
    explanationArz: '"Buch" = كتاب. أخت "book" بالإنجليزي.',
    tags: ['everyday-objects']
  },

  // ================= A2 LEVEL (8 Questions) =================
  {
    id: 'de-a2-grammar-001', lang: 'de', cefr: 'A2', skill: 'grammar', type: 'mcq',
    promptArz: 'كمّل الجملة في زمن الماضي Perfekt:',
    stem: 'Ich habe gestern einen Film ___.',
    options: ['gesehen', 'sehen', 'sieht', 'sah'], correctIndex: 0,
    explanationArz: 'في الـ Perfekt: "haben + Partizip II". الفعل "sehen" بيبقى "gesehen".',
    tags: ['perfekt']
  },
  {
    id: 'de-a2-listening-001', lang: 'de', cefr: 'A2', skill: 'listening', type: 'mcq',
    promptArz: 'اسمع واختار وسيلة المواصلات الصح:',
    stem: '(اضغط "شغّل الصوت" الأول)',
    audioText: 'Ich fahre mit dem Bus zur Arbeit.',
    options: ['بروح الشغل بالباص', 'بروح الشغل بالمترو', 'بروح الشغل مشي', 'مش بروح الشغل'], correctIndex: 0,
    explanationArz: '"mit dem Bus" = بالباص، و"zur Arbeit" = للشغل.',
    tags: ['transport']
  },
  {
    id: 'de-a2-grammar-002', lang: 'de', cefr: 'A2', skill: 'grammar', type: 'mcq',
    promptArz: 'اختار حرف الجر المناسب للـ Dativ:',
    stem: 'Ich fahre mit ___ Zug nach Kairo.',
    options: ['dem', 'den', 'der', 'das'], correctIndex: 0,
    explanationArz: 'حرف الجر "mit" دايمًا بياخد Dativ. وكلمة "Zug" مذكر (der) بتبقى "dem".',
    tags: ['dativ']
  },
  {
    id: 'de-a2-vocab-001', lang: 'de', cefr: 'A2', skill: 'vocabulary', type: 'mcq',
    promptArz: 'معنى كلمة "Arzt" إيه؟',
    stem: 'Der Arzt untersucht den Patienten.',
    options: ['طبيب', 'مهندس', 'معلم', 'سائق'], correctIndex: 0,
    explanationArz: '"Arzt" يعني دكتور أو طبيب.',
    tags: ['jobs']
  },
  {
    id: 'de-a2-reading-001', lang: 'de', cefr: 'A2', skill: 'reading', type: 'mcq',
    promptArz: 'اقرا واختار الإجابة الصح:',
    stem: 'Lisa geht jeden Samstag einkaufen. Sie kauft Gemüse und Obst auf dem Markt.',
    options: ['ليزا بتشتري خضار وفاكهة من السوق كل سبت', 'ليزا بتروح السبت السينما', 'ليزا بتسافر كل سبت', 'ليزا بتطبخ في البيت فقط'], correctIndex: 0,
    explanationArz: '"einkaufen" = تسوق، "Gemüse" = خضار، "Obst" = فاكهة.',
    tags: ['reading']
  },
  {
    id: 'de-a2-grammar-003', lang: 'de', cefr: 'A2', skill: 'grammar', type: 'mcq',
    promptArz: 'اختار فعل ناقص (Modalverb) مناسب:',
    stem: 'Hier ___ man nicht rauchen.',
    options: ['darf', 'will', 'möchte', 'mag'], correctIndex: 0,
    explanationArz: '"darf nicht" تُستخدم للمنع أو التحريم الحتمي (ممنوع التدخين).',
    tags: ['modalverben']
  },
  {
    id: 'de-a2-vocab-002', lang: 'de', cefr: 'A2', skill: 'vocabulary', type: 'mcq',
    promptArz: 'عكس كلمة "kalt" (بارد) إيه بالألماني؟',
    stem: 'Im Sommer ist es sehr ___.',
    options: ['warm', 'alt', 'groß', 'klein'], correctIndex: 0,
    explanationArz: 'عكس "kalt" هو "warm" (دافئ/حار).',
    tags: ['opposites']
  },
  {
    id: 'de-a2-listening-002', lang: 'de', cefr: 'A2', skill: 'listening', type: 'mcq',
    promptArz: 'اسمع التوقيت واختار الصح:',
    stem: '(اضغط "شغّل الصوت" الأول)',
    audioText: 'Der Zug kommt um acht Uhr an.',
    options: ['القطر بيوصل الساعة 8', 'القطر بيوصل الساعة 10', 'القطر هيتأخر ساعتين', 'القطر مش هيجي'], correctIndex: 0,
    explanationArz: '"um acht Uhr" = الساعة 8، و"kommt an" = يوصل.',
    tags: ['time']
  },

  // ================= B1 LEVEL (8 Questions) =================
  {
    id: 'de-b1-grammar-001', lang: 'de', cefr: 'B1', skill: 'grammar', type: 'mcq',
    promptArz: 'اختار حرف الجر الصح المتبوع بـ Dativ:',
    stem: 'Ich interessiere mich ___ Musik.',
    options: ['für', 'an', 'auf', 'von'], correctIndex: 0,
    explanationArz: '"sich interessieren für" تعبير ثابت. زي "مهتم بـ" — الفعل بيسحب حرف الجر معاه.',
    tags: ['verbs-with-prepositions']
  },
  {
    id: 'de-b1-reading-001', lang: 'de', cefr: 'B1', skill: 'reading', type: 'mcq',
    promptArz: 'اقرا واختار الصح:',
    stem: 'Anna wohnt seit zwei Jahren in Berlin. Früher hat sie in München gelebt.',
    options: ['آنا ساكنة في برلين دلوقتي', 'آنا في ميونخ دلوقتي', 'آنا هتنتقل برلين', 'آنا مش ساكنة في ألمانيا'], correctIndex: 0,
    explanationArz: '"seit zwei Jahren in Berlin" = من سنتين في برلين. يبقى هي دلوقتي هناك.',
    tags: ['reading', 'seit']
  },
  {
    id: 'de-b1-grammar-002', lang: 'de', cefr: 'B1', skill: 'grammar', type: 'mcq',
    promptArz: 'اختار الأداة الرابطة الصح (weil) وموقع الفعل:',
    stem: 'Ich bleibe zu Hause, weil ich krank ___.',
    options: ['bin', 'ist', 'sein', 'war'], correctIndex: 0,
    explanationArz: 'الرابط "weil" بيطرد الفعل المصرف لآخر الجملة: "weil ich krank bin".',
    tags: ['subordinate-clauses', 'weil']
  },
  {
    id: 'de-b1-vocab-001', lang: 'de', cefr: 'B1', skill: 'vocabulary', type: 'mcq',
    promptArz: 'معنى كلمة "Ausbildung" إيه في ألمانيا؟',
    stem: 'Er macht eine Ausbildung als Mechatroniker.',
    options: ['تدريب مهني عملي', 'إجازة سنوية', 'رحلة سياحية', 'حفلة تخرج'], correctIndex: 0,
    explanationArz: '"Ausbildung" هو نظام التدريب المهني الثنائي في ألمانيا.',
    tags: ['education']
  },
  {
    id: 'de-b1-listening-001', lang: 'de', cefr: 'B1', skill: 'listening', type: 'mcq',
    promptArz: 'اسمع واختار المغزى:',
    stem: '(اضغط "شغّل الصوت" الأول)',
    audioText: 'Obwohl das Wetter schlecht war, haben wir einen langen Spaziergang gemacht.',
    options: ['تمشوا مشوار طويل رغم إن الجو كان سيء', 'قعدوا في البيت عشان الجو سيء', 'الجو كان مشمس ورائع', 'الرحلة اتلغت بالكامل'], correctIndex: 0,
    explanationArz: '"Obwohl" تعني بالرغم من (جملة جانبية بتطرد الفعل للآخر).',
    tags: ['obwohl']
  },
  {
    id: 'de-b1-grammar-003', lang: 'de', cefr: 'B1', skill: 'grammar', type: 'mcq',
    promptArz: 'اختار صيغة الروابط المتلازمة (je ... desto):',
    stem: 'Je mehr du lernst, ___ besser sprichst du.',
    options: ['desto', 'weil', 'dass', 'ob'], correctIndex: 0,
    explanationArz: 'تركيبة التناسب: "je ... desto ..." (كلما ... كلما ...).',
    tags: ['comparatives']
  },
  {
    id: 'de-b1-vocab-002', lang: 'de', cefr: 'B1', skill: 'vocabulary', type: 'mcq',
    promptArz: 'معنى الفعل "empfehlen" إيه؟',
    stem: 'Können Sie mir ein gutes Restaurant empfehlen?',
    options: ['يوصي/يرشح', 'يرفض', 'يدفع', 'يحجز'], correctIndex: 0,
    explanationArz: '"empfehlen" يعني يرشح أو يوصي بمكان أو خدمة.',
    tags: ['verbs']
  },
  {
    id: 'de-b1-reading-002', lang: 'de', cefr: 'B1', skill: 'reading', type: 'mcq',
    promptArz: 'اقرا الخبر الصغير واختار النتيجة:',
    stem: 'Wegen eines Streiks fahren heute keine Bahnen.',
    options: ['مفيش قطارات شغال اليوم بسبب الإضراب', 'القطارات شغال بانتظام', 'سعر التذاكر نزل للنصف', 'المحطة اتفتحت حديثاً'], correctIndex: 0,
    explanationArz: '"Wegen eines Streiks" = بسبب إضراب.',
    tags: ['news']
  },

  // ================= B2 LEVEL (8 Questions) =================
  {
    id: 'de-b2-grammar-001', lang: 'de', cefr: 'B2', skill: 'grammar', type: 'mcq',
    promptArz: 'كمّل بأسلوب التمني والأمنيات (Konjunktiv II):',
    stem: 'Wenn ich mehr Zeit hätte, ___ ich mehr reisen.',
    options: ['würde', 'werde', 'wurde', 'hatte'], correctIndex: 0,
    explanationArz: 'في افتراضات وتمنيات الماضي/الحاضر غير الواقعية بنستخدم "würde + Infinitiv".',
    tags: ['konjunktiv-ii']
  },
  {
    id: 'de-b2-vocab-001', lang: 'de', cefr: 'B2', skill: 'vocabulary', type: 'mcq',
    promptArz: 'اختار المصطلح التعبيري المناسب:',
    stem: 'Das Thema steht heute nicht zur ___.',
    options: ['Debatte', 'Frage', 'Antwort', 'Lösung'], correctIndex: 0,
    explanationArz: 'التعبير الثابت "etwas steht zur Debatte" يعني موضوع المطروح للنقاش.',
    tags: ['nomen-nomen-verbindungen']
  },
  {
    id: 'de-b2-listening-001', lang: 'de', cefr: 'B2', skill: 'listening', type: 'mcq',
    promptArz: 'اسمع واستنتج الفكرة المتقدمة:',
    stem: '(اضغط "شغّل الصوت" الأول)',
    audioText: 'Es wird empfohlen, die Unterlagen vorab gründlich zu prüfen.',
    options: ['يُنصح بمراجعة الأوراق بدقة مسبقاً', 'الأوراق مش مهمة ومش محتاجة مراجعة', 'المراجعة هتكون بعد الاجتماع مش قبله', 'الأوراق اتفقدت بالكامل'], correctIndex: 0,
    explanationArz: '"Es wird empfohlen" صيغة مبني للمجهول غير شخصية راقية.',
    tags: ['passiv']
  },
  {
    id: 'de-b2-reading-001', lang: 'de', cefr: 'B2', skill: 'reading', type: 'mcq',
    promptArz: 'اقرا واختار المغزى الأكاديمي:',
    stem: 'Anstatt die Herausforderung anzunehmen, weichten einige Beteiligte der Diskussion aus.',
    options: ['بدلاً من قبول التحدي، تهرب بعض المشاركين من النقاش', 'الكل قبلوا التحدي وناقشوا بحماس', 'النقاش اتلغى بقرار رسمي', 'التحدي كان سهل على الجميع'], correctIndex: 0,
    explanationArz: '"Anstatt ... zu" تعني بدلاً من، و"ausweichen" تعني يتهرب من.',
    tags: ['reading']
  },
  {
    id: 'de-b2-grammar-002', lang: 'de', cefr: 'B2', skill: 'grammar', type: 'mcq',
    promptArz: 'اختار تركيب اسم الفاعل المتقدم (Partizip I als Adjektiv):',
    stem: 'Die ___ Zahlen zeigen ein deutliches Wachstum.',
    options: ['steigenden', 'gestiegen', 'steigen', 'steigt'], correctIndex: 0,
    explanationArz: 'اسم الفاعل المشتق المستمر (steigend) كصفة متبوعة بتصريف الأداة.',
    tags: ['partizip-i']
  },
  {
    id: 'de-b2-vocab-002', lang: 'de', cefr: 'B2', skill: 'vocabulary', type: 'mcq',
    promptArz: 'معنى الفعل المتقدم "berücksichtigen" إيه؟',
    stem: 'Wir müssen alle Faktoren berücksichtigen.',
    options: ['ياخد في الاعتبار/يراعي', 'يرفض ويستبعد', 'يهمل', 'يكرر'], correctIndex: 0,
    explanationArz: '"berücksichtigen" تعني يضع في الحسبان والاعتبار.',
    tags: ['b2-vocab']
  },
  {
    id: 'de-b2-grammar-003', lang: 'de', cefr: 'B2', skill: 'grammar', type: 'mcq',
    promptArz: 'اختار حرف الجر المتبوع بـ Genitiv:',
    stem: '___ des schlechten Wetters fand das Konzert statt.',
    options: ['Trotz', 'Wegen', 'Durch', 'Mit'], correctIndex: 0,
    explanationArz: '"Trotz" (بالرغم من) بياخد إضافة Genitiv (des schlechten Wetters).',
    tags: ['genitiv']
  },
  {
    id: 'de-b2-listening-002', lang: 'de', cefr: 'B2', skill: 'listening', type: 'mcq',
    promptArz: 'اسمع المقطع الأكاديمي ده:',
    stem: '(اضغط "شغّل الصوت" الأول)',
    audioText: 'Je früher die Maßnahmen ergriffen werden, desto nachhaltiger ist der Erfolg.',
    options: ['كل ما اتخذت الإجراءات بدري، كل ما كان النجاح أكثر استدامة', 'الإجراءات المبكرة مالهاش قيمة', 'التأخير هو أفضل حل', 'النجاح مش بيعتمد على الإجراءات'], correctIndex: 0,
    explanationArz: '"nachhaltig" تعني مستدام أو ذو أثر ممتد.',
    tags: ['je-desto']
  },

  // ================= C1 LEVEL (8 Questions) =================
  {
    id: 'de-c1-grammar-001', lang: 'de', cefr: 'C1', skill: 'grammar', type: 'mcq',
    promptArz: 'اختار صيغة نقل الكلام الأكاديمية (Konjunktiv I):',
    stem: 'Der Sprecher erklärte, die Verhandlungen ___ fortgesetzt.',
    options: ['werden', 'würden', 'wurden', 'sein'], correctIndex: 0,
    explanationArz: 'نقل الأخبار والتصريحات الرسمية في الألماني بياخد Konjunktiv I (werden).',
    tags: ['konjunktiv-i']
  },
  {
    id: 'de-c1-vocab-001', lang: 'de', cefr: 'C1', skill: 'vocabulary', type: 'mcq',
    promptArz: 'اختار المفردة البلاغية المتقدمة جداً:',
    stem: 'Seine Argumentation war von bemerkenswerter ___ geprägt.',
    options: ['Schlüssigkeit', 'Einfachheit', 'Nachlässigkeit', 'Verwirrung'], correctIndex: 0,
    explanationArz: '"Schlüssigkeit" تعني منطقية الجدل والترابط المحكم للإثبات.',
    tags: ['c1-vocab']
  },
  {
    id: 'de-c1-reading-001', lang: 'de', cefr: 'C1', skill: 'reading', type: 'mcq',
    promptArz: 'اقرا النص الأكاديمي المعقد ده واختار الاستنتاج الدقيق:',
    stem: 'Unbeschadet der bisherigen Erfolge bedarf das System einer grundlegenden Überarbeitung.',
    options: ['بغض النظر عن النجاحات السابقة، النظام محتاج مراجعة وتطوير جذري', 'النجاحات السابقة بتأكد إن النظام مش محتاج أي تعديل', 'النظام فشل بالكامل ولم يحقق أي نجاح', 'المراجعة هتكون شهرية'], correctIndex: 0,
    explanationArz: '"Unbeschadet" (دون المساس بـ / بغض النظر عن) حرف جر رفيع المستوى مع Genitiv.',
    tags: ['reading', 'c1-text']
  },
  {
    id: 'de-c1-listening-001', lang: 'de', cefr: 'C1', skill: 'listening', type: 'mcq',
    promptArz: 'اسمع العبارة الفلسفية الألمانية وتفكر في مغزاها:',
    stem: '(اضغط "شغّل الصوت" الأول)',
    audioText: 'Es gilt als erwiesen, dass Diversität die Innovationskraft maßgeblich stärkt.',
    options: ['أُثبت بشكل قاطع إن التنوع بيعزز القدرة الابتكارية بشكل جوهري', 'التنوع ملوش علاقة بالابتكار', 'الابتكار بيقل في وجود التنوع', 'لم يثبت حتى الآن أي أثر للتنوع'], correctIndex: 0,
    explanationArz: '"Es gilt als erwiesen" تعني يُعتبر بحكم الثابت والمبرهن عليه.',
    tags: ['listening', 'c1-listening']
  },
  {
    id: 'de-c1-grammar-002', lang: 'de', cefr: 'C1', skill: 'grammar', type: 'mcq',
    promptArz: 'اختار بديل المبني للمجهول الأكاديمي (sein + zu + Infinitiv):',
    stem: 'Diese Aufgabe ist bis morgen zu ___.',
    options: ['erledigen', 'erledigt', 'erledigte', 'erledigend'], correctIndex: 0,
    explanationArz: 'تركيبة "sein + zu + Infinitiv" تعبر عن وجوب أو إمكانية العمل وتساوي "muss erledigt werden".',
    tags: ['passiverstatz']
  },
  {
    id: 'de-c1-vocab-002', lang: 'de', cefr: 'C1', skill: 'vocabulary', type: 'mcq',
    promptArz: 'إيه معنى الفعل الفلسفي "hinterfragen"؟',
    stem: 'Kritische Denker müssen gewohnte Annahmen stets hinterfragen.',
    options: ['يتساءل ويفحص بدقة وموضوعية', 'يقبل بدون تفكير', 'يتجاهل', 'يكرر الكلام'], correctIndex: 0,
    explanationArz: '"hinterfragen" يعني يتساءل عن خلفية الشيء ولا يأخذه كبديهية.',
    tags: ['c1-vocab']
  },
  {
    id: 'de-c1-reading-002', lang: 'de', cefr: 'C1', skill: 'reading', type: 'mcq',
    promptArz: 'اقرا العبارة البلاغية واختار التأويل الصح:',
    stem: 'Wer die Gegenwart verstehen will, muss die Vergangenheit erforschen.',
    options: ['فهم الحاضر بيتطلب البحث والدراسة في أعماق الماضي', 'الماضي ملوش أي قيمة في فهم الحاضر', 'المستقبل هو الوحيد المهم', 'دراسة التاريخ مجرد تسلية'], correctIndex: 0,
    explanationArz: 'مقولة تاريخية: فهم الواقع الحاضر مرهون بمعرفة جذوره التاريخية.',
    tags: ['reading', 'history']
  },
  {
    id: 'de-c1-listening-002', lang: 'de', cefr: 'C1', skill: 'listening', type: 'mcq',
    promptArz: 'اسمع واستنتج التعبير الأكاديمي:',
    stem: '(اضغط "شغّل الصوت" الأول)',
    audioText: 'In Anbetracht der Umstände ist diese Entscheidung alternativlos.',
    options: ['بالنظر للظروف الراهنة، القرار ده لا بديل عنه', 'فيه بدائل كتير متاحة للقرار ده', 'الظروف مش مهمة في اتخاذ القرار', 'القرار اتأجل لموعد غير مسمى'], correctIndex: 0,
    explanationArz: '"alternativlos" تعني خيار حتمي لا يوجد له بديل آخر في تلك الظروف.',
    tags: ['listening', 'c1-phrases']
  }
];
