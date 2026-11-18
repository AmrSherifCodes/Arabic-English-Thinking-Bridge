/**
 * CC0 1.0 Universal - Public Domain
 * Pedagogy inspired by Mihalis Eleftheriou & Language Transfer. Built in Alexandria. CC0.
 */

import { ExamQuestion } from '../types';

export const englishQuestions: ExamQuestion[] = [
  // ================= A1 LEVEL (8 Questions) =================
  {
    id: 'en-a1-grammar-001', lang: 'en', cefr: 'A1', skill: 'grammar', type: 'mcq',
    promptArz: 'اختار الكلمة الصح:',
    stem: 'I ___ from Egypt.',
    options: ['am', 'is', 'are', 'be'], correctIndex: 0,
    explanationArz: 'مع "I" بنقول "am" على طول. زي ما بنقول "أنا من مصر" — ثابتة.',
    tags: ['copula', 'be']
  },
  {
    id: 'en-a1-vocab-001', lang: 'en', cefr: 'A1', skill: 'vocabulary', type: 'mcq',
    promptArz: 'إيه معنى "water"؟',
    stem: 'Can I have some water, please?',
    options: ['مية', 'عصير', 'شاي', 'لبن'], correctIndex: 0,
    explanationArz: '"Water" = مية. أسهل كلمة في الامتحان كله، شد حيلك.',
    tags: ['everyday-nouns']
  },
  {
    id: 'en-a1-grammar-002', lang: 'en', cefr: 'A1', skill: 'grammar', type: 'mcq',
    promptArz: 'اختار الأداة الصح:',
    stem: 'This is ___ apple.',
    options: ['an', 'a', 'the', 'no article'], correctIndex: 0,
    explanationArz: 'الكلمة بتبدأ بحرف متحرك (a)، يبقى بياخد "an" مش "a".',
    tags: ['articles']
  },
  {
    id: 'en-a1-vocab-002', lang: 'en', cefr: 'A1', skill: 'vocabulary', type: 'mcq',
    promptArz: 'معنى "book" إيه في الجملة دي؟',
    stem: 'I read a book every night.',
    options: ['كتاب', 'قلم', 'شنطة', 'موبايل'], correctIndex: 0,
    explanationArz: '"Book" = كتاب. سهلة زي شاي بالنعناع.',
    tags: ['everyday-nouns']
  },
  {
    id: 'en-a1-listening-001', lang: 'en', cefr: 'A1', skill: 'listening', type: 'mcq',
    promptArz: 'اسمع واختار المعنى الصح:',
    stem: '(اضغط "شغّل الصوت" الأول)',
    audioText: 'Good morning, my friend.',
    options: ['صباح الخير يا صاحبي', 'مساء الخير يا أستاذ', 'مع السلامة', 'تصبح على خير'], correctIndex: 0,
    explanationArz: '"Good morning" يعني صباح الخير، و"my friend" يعني يا صاحبي.',
    tags: ['greetings']
  },
  {
    id: 'en-a1-reading-001', lang: 'en', cefr: 'A1', skill: 'reading', type: 'mcq',
    promptArz: 'اقرا الجملة واختار صح:',
    stem: 'My name is Hassan. I live in Cairo.',
    options: ['حسن ساكن في القاهرة', 'حسن ساكن في طنطا', 'حسن ساكن في دبي', 'حسن مش في مصر'], correctIndex: 0,
    explanationArz: '"I live in Cairo" = أنا ساكن في القاهرة. واضحة ومباشرة.',
    tags: ['reading']
  },
  {
    id: 'en-a1-grammar-003', lang: 'en', cefr: 'A1', skill: 'grammar', type: 'mcq',
    promptArz: 'اختار الضمير الصح:',
    stem: 'They ___ playing football.',
    options: ['are', 'is', 'am', 'was'], correctIndex: 0,
    explanationArz: 'الضمير "They" بياخد "are" في المضارع المستمر.',
    tags: ['pronouns', 'present-continuous']
  },
  {
    id: 'en-a1-vocab-003', lang: 'en', cefr: 'A1', skill: 'vocabulary', type: 'mcq',
    promptArz: 'إيه معنى "car"؟',
    stem: 'He bought a new car.',
    options: ['عربية', 'عجلة', 'طيارة', 'مركب'], correctIndex: 0,
    explanationArz: '"Car" = عربية.',
    tags: ['vehicles']
  },

  // ================= A2 LEVEL (8 Questions) =================
  {
    id: 'en-a2-grammar-001', lang: 'en', cefr: 'A2', skill: 'grammar', type: 'mcq',
    promptArz: 'كمّل الجملة:',
    stem: 'She ___ to the gym every Friday.',
    options: ['goes', 'go', 'going', 'gone'], correctIndex: 0,
    explanationArz: 'مع she/he/it بنزود "s" في المضارع البسيط. قاعدة صغيرة بس بتفرق كتير.',
    tags: ['present-simple']
  },
  {
    id: 'en-a2-listening-001', lang: 'en', cefr: 'A2', skill: 'listening', type: 'mcq',
    promptArz: 'اسمع الجملة واختار المعنى الصح:',
    stem: '(اضغط "شغّل الصوت" الأول)',
    audioText: 'I usually take the metro to work.',
    options: ['بروح الشغل بالمترو عادةً', 'بروح الشغل بالعربية دايمًا', 'مش بروح الشغل خالص', 'بروح الشغل مشي'], correctIndex: 0,
    explanationArz: '"Usually" = عادةً، و"take the metro" = أركب المترو. سهلة زي محطة سيدي جابر.',
    tags: ['transport']
  },
  {
    id: 'en-a2-grammar-002', lang: 'en', cefr: 'A2', skill: 'grammar', type: 'mcq',
    promptArz: 'اختار صيغة الماضي الصح:',
    stem: 'Yesterday, we ___ a great movie.',
    options: ['watched', 'watch', 'watching', 'watches'], correctIndex: 0,
    explanationArz: 'كلمة "Yesterday" بتدل على الماضي البسيط، عشان كده بنحط "-ed" للأفعال المنتظمة.',
    tags: ['past-simple']
  },
  {
    id: 'en-a2-vocab-001', lang: 'en', cefr: 'A2', skill: 'vocabulary', type: 'mcq',
    promptArz: 'اختار الصفة الصح:',
    stem: 'Alexandria is a ___ city on the coast.',
    options: ['beautiful', 'angry', 'slow', 'dark'], correctIndex: 0,
    explanationArz: '"Beautiful" يعني جميلة. وصف مناسب تمامًا لعروس البحر.',
    tags: ['adjectives']
  },
  {
    id: 'en-a2-reading-001', lang: 'en', cefr: 'A2', skill: 'reading', type: 'mcq',
    promptArz: 'اقرا واختار الصح:',
    stem: 'Sara loves cooking. She makes delicious pasta every weekend.',
    options: ['سارة بتحب تطبخ باستا في الويك إند', 'سارة بتكره المطبخ', 'سارة بتشتري بيتزا دايمًا', 'سارة مش بتأكل باستا'], correctIndex: 0,
    explanationArz: '"Loves cooking" = بتحب الطبخ، و"delicious pasta" = باستا لديدة.',
    tags: ['reading']
  },
  {
    id: 'en-a2-grammar-003', lang: 'en', cefr: 'A2', skill: 'grammar', type: 'mcq',
    promptArz: 'اختار كلمة المقارنة الصح:',
    stem: 'A plane is ___ than a train.',
    options: ['faster', 'fast', 'fastest', 'more fast'], correctIndex: 0,
    explanationArz: 'في المقارنة بين حاجتين بنزود "-er" للصفات القصيرة + "than".',
    tags: ['comparatives']
  },
  {
    id: 'en-a2-vocab-002', lang: 'en', cefr: 'A2', skill: 'vocabulary', type: 'mcq',
    promptArz: 'معنى "tired" إيه؟',
    stem: 'After a long day, Ahmed felt very tired.',
    options: ['تعبان', 'مبسوط', 'جوعان', 'خايف'], correctIndex: 0,
    explanationArz: '"Tired" يعني تعبان أو مجهد.',
    tags: ['feelings']
  },
  {
    id: 'en-a2-listening-002', lang: 'en', cefr: 'A2', skill: 'listening', type: 'mcq',
    promptArz: 'اسمع واختار الإجابة الصح:',
    stem: '(اضغط "شغّل الصوت" الأول)',
    audioText: 'Where is the nearest supermarket?',
    options: ['بيسأل عن أقرب سوبرماركت', 'بيسأل عن محطة القطر', 'بيسأل عن الساعة كم', 'بيطلب أكل في مطعم'], correctIndex: 0,
    explanationArz: '"Where is" = فين، و"nearest supermarket" = أقرب سوبرماركت.',
    tags: ['listening', 'directions']
  },

  // ================= B1 LEVEL (8 Questions) =================
  {
    id: 'en-b1-grammar-001', lang: 'en', cefr: 'B1', skill: 'grammar', type: 'mcq',
    promptArz: 'اختار الصح:',
    stem: 'I ___ in Alexandria since 2019.',
    options: ['have lived', 'live', 'lived', 'am living'], correctIndex: 0,
    explanationArz: '"Since" مع نقطة زمنية + فعل مستمر للحاضر = present perfect. لو قلت "I live since" غلط، لازم "have lived".',
    tags: ['present-perfect', 'since']
  },
  {
    id: 'en-b1-reading-001', lang: 'en', cefr: 'B1', skill: 'reading', type: 'mcq',
    promptArz: 'اقرا واختار:',
    stem: 'Omar moved to Cairo last year. He still calls his family in Alexandria every night.',
    options: ['عمر ساكن في القاهرة دلوقتي', 'عمر لسه في إسكندرية', 'عمر مش بيتصل بحد', 'عمر هينتقل الشهر الجاي'], correctIndex: 0,
    explanationArz: '"Moved to" = انتقل، و"last year" = السنة اللي فاتت. يبقى هو دلوقتي في القاهرة.',
    tags: ['reading', 'past-simple']
  },
  {
    id: 'en-b1-grammar-002', lang: 'en', cefr: 'B1', skill: 'grammar', type: 'mcq',
    promptArz: 'كمّل جملة الشرط:',
    stem: 'If it rains tomorrow, we ___ at home.',
    options: ['will stay', 'stayed', 'staying', 'would stay'], correctIndex: 0,
    explanationArz: 'الحالة الشرطية الأولى (First Conditional): مضارع بسيط في الأول + "will + المصدر" في جواب الشرط.',
    tags: ['conditionals']
  },
  {
    id: 'en-b1-vocab-001', lang: 'en', cefr: 'B1', skill: 'vocabulary', type: 'mcq',
    promptArz: 'اختار الكلمة المناسبة للسياق:',
    stem: 'He decided to ___ his job and start his own business.',
    options: ['quit', 'hire', 'keep', 'promote'], correctIndex: 0,
    explanationArz: '"Quit" يعني يستقيل أو يسيب الشغل عشان يفتح مشروعه الخاص.',
    tags: ['business-vocab']
  },
  {
    id: 'en-b1-listening-001', lang: 'en', cefr: 'B1', skill: 'listening', type: 'mcq',
    promptArz: 'اسمع واختار المعنى المقصود:',
    stem: '(اضغط "شغّل الصوت" الأول)',
    audioText: 'Although it was raining heavily, they decided to go for a walk.',
    options: ['خرجوا يستمتعوا بالمشي رغم المطر الغزير', 'قعدوا في البيت عشان المطر', 'إلغوا الرحلة خالص', 'العربية عطلت منهم في المطر'], correctIndex: 0,
    explanationArz: '"Although" تعني بالرغم من. رغم شدة المطر قرروا يتمشوا.',
    tags: ['conjunctions']
  },
  {
    id: 'en-b1-grammar-003', lang: 'en', cefr: 'B1', skill: 'grammar', type: 'mcq',
    promptArz: 'اختار صيغة المبني للمجهول (Passive):',
    stem: 'The new bridge ___ built last month.',
    options: ['was', 'is', 'were', 'has'], correctIndex: 0,
    explanationArz: 'الكوبري مفرد والحدث تمت في الماضي (last month)، بنستخدم "was built".',
    tags: ['passive-voice']
  },
  {
    id: 'en-b1-vocab-002', lang: 'en', cefr: 'B1', skill: 'vocabulary', type: 'mcq',
    promptArz: 'إيه التعبير المرادف لـ "solve a problem"؟',
    stem: 'We need to ___ this issue immediately.',
    options: ['resolve', 'ignore', 'delay', 'create'], correctIndex: 0,
    explanationArz: '"Resolve an issue" تعني يحل المشكلة، زي "solve a problem".',
    tags: ['collocations']
  },
  {
    id: 'en-b1-reading-002', lang: 'en', cefr: 'B1', skill: 'reading', type: 'mcq',
    promptArz: 'اقرا النص وفكّر في الاستنتاج الصح:',
    stem: 'Nour works as a software engineer. She spends most of her day coding and solving bugs.',
    options: ['نور شغلانتها مهندسة برمجيات', 'نور مدرسة لغة إنجليزية', 'نور طبيبة في مستشفى', 'نور مهندسة ديكور'], correctIndex: 0,
    explanationArz: '"Software engineer" = مهندسة برمجيات.',
    tags: ['reading', 'professions']
  },

  // ================= B2 LEVEL (8 Questions) =================
  {
    id: 'en-b2-grammar-001', lang: 'en', cefr: 'B2', skill: 'grammar', type: 'mcq',
    promptArz: 'اختار التركيبة الصح للتندم على الماضي:',
    stem: 'I wish I ___ harder for the exam.',
    options: ['had studied', 'studied', 'have studied', 'would study'], correctIndex: 0,
    explanationArz: 'التندم على حدث في الماضي مع "I wish" بياخد الماضي التام (had + past participle).',
    tags: ['wishes', 'past-perfect']
  },
  {
    id: 'en-b2-vocab-001', lang: 'en', cefr: 'B2', skill: 'vocabulary', type: 'mcq',
    promptArz: 'معنى التعبير ده إيه في الإنجليزي؟',
    stem: 'The new policy had a profound ___ on the local market.',
    options: ['impact', 'cause', 'reason', 'source'], correctIndex: 0,
    explanationArz: '"Profound impact" يعني تأثير عميق أو كبير جداً على السوق.',
    tags: ['advanced-collocations']
  },
  {
    id: 'en-b2-listening-001', lang: 'en', cefr: 'B2', skill: 'listening', type: 'mcq',
    promptArz: 'اسمع وفكّر في فكرة المتحدث الرئيسية:',
    stem: '(اضغط "شغّل الصوت" الأول)',
    audioText: 'Had we known about the delay earlier, we would have chosen a different route.',
    options: ['لو كنا عرفنا عن التأخير بدري، كنا اخترنا طريق تاني', 'احنا كنا عارفين عن التأخير وأخدنا نفس الطريق', 'الطريق كان فاضي وما كانش فيه تأخير', 'احنا وصلنا في ميعادنا بالظبط'], correctIndex: 0,
    explanationArz: 'دي الحالة الشرطية الثالثة المقلوبة (Inverted 3rd Conditional) للحديث عن افتراض ماضي لم يحدث.',
    tags: ['advanced-conditionals']
  },
  {
    id: 'en-b2-reading-001', lang: 'en', cefr: 'B2', skill: 'reading', type: 'mcq',
    promptArz: 'اقرا الفقرة واختار المعنى الأدق:',
    stem: 'Despite several initial setbacks, the research team managed to finalize the study ahead of schedule.',
    options: ['الفريق نجح إنه ينهي الدراسة قبل الميعاد رغم صعوبات البداية', 'الفريق فشل في إنهاء الدراسة بسبب المشاكل', 'الدراسة اتأجلت للسنة الجاية', 'الفريق ما واجهش أي مشكلة في البداية'], correctIndex: 0,
    explanationArz: '"Setbacks" تعني عقبات/مشاكل، و"ahead of schedule" يعني قبل الموعد المحدد.',
    tags: ['reading', 'advanced-text']
  },
  {
    id: 'en-b2-grammar-002', lang: 'en', cefr: 'B2', skill: 'grammar', type: 'mcq',
    promptArz: 'كمّل بتركيب الأفعال المتبوعة بـ Gerund/Infinitive:',
    stem: 'She postponed ___ the decision until next week.',
    options: ['making', 'to make', 'make', 'having made'], correctIndex: 0,
    explanationArz: 'الفعل "postpone" بيجي بعده Gerund (verb + ing).',
    tags: ['gerunds']
  },
  {
    id: 'en-b2-vocab-002', lang: 'en', cefr: 'B2', skill: 'vocabulary', type: 'mcq',
    promptArz: 'اختار الكلمة اللي بتكمل المعنى:',
    stem: 'Her explanation was so ___ that everyone understood immediately.',
    options: ['lucid', 'vague', 'ambiguous', 'dull'], correctIndex: 0,
    explanationArz: '"Lucid" تعني واضحة وجلية وسهلة الفهم.',
    tags: ['vocabulary', 'advanced-adjectives']
  },
  {
    id: 'en-b2-grammar-003', lang: 'en', cefr: 'B2', skill: 'grammar', type: 'mcq',
    promptArz: 'اختار التركيب الصح للمقارنة التناسبية:',
    stem: 'The more you practice, ___ you become.',
    options: ['the more fluent', 'fluer', 'most fluent', 'more fluent'], correctIndex: 0,
    explanationArz: 'تركيبة التناسب: "The more ..., the more ...". كل ما تتمرن أكتر، كل ما تبقى أطلق.',
    tags: ['double-comparatives']
  },
  {
    id: 'en-b2-listening-002', lang: 'en', cefr: 'B2', skill: 'listening', type: 'mcq',
    promptArz: 'اسمع وفكّر في المغزى:',
    stem: '(اضغط "شغّل الصوت" الأول)',
    audioText: 'Never before have I seen such dedication to a project.',
    options: ['عمره ما شاف إخلاص في العمل بالشكل ده قبل كده', 'هو متعود يرى إخلاص في العمل باستمرار', 'الشغل كان سيء جدًا وما فيهوش إخلاص', 'المشروع اتلغى بسبب عدم الاهتمام'], correctIndex: 0,
    explanationArz: 'تركيب الانقلاب (Inversion): "Never before have I seen..." للتأكيد والتعجب.',
    tags: ['inversion']
  },

  // ================= C1 LEVEL (8 Questions) =================
  {
    id: 'en-c1-grammar-001', lang: 'en', cefr: 'C1', skill: 'grammar', type: 'mcq',
    promptArz: 'اختار التركيبة اللغوية المتقدمة الصح:',
    stem: 'Scarcely ___ the announcement when the crowd erupted in applause.',
    options: ['had he made', 'he had made', 'did he make', 'he has made'], correctIndex: 0,
    explanationArz: 'مع الكلمات المنفية المقدمة زي "Scarcely / Hardly / No sooner" بنعمل Inversion بـ had + subject + V3.',
    tags: ['inversion', 'c1-grammar']
  },
  {
    id: 'en-c1-vocab-001', lang: 'en', cefr: 'C1', skill: 'vocabulary', type: 'mcq',
    promptArz: 'اختار المفردة البلاغية المتقدمة:',
    stem: 'The author\'s style is characterized by a high degree of ___ and elegance.',
    options: ['eloquence', 'reluctance', 'negligence', 'redundancy'], correctIndex: 0,
    explanationArz: '"Eloquence" يعني الفصاحة والبلاغة والبيان العالي.',
    tags: ['c1-vocab']
  },
  {
    id: 'en-c1-reading-001', lang: 'en', cefr: 'C1', skill: 'reading', type: 'mcq',
    promptArz: 'اقرا الجملة المعقدة دي واختار استنتاجها الأقوى:',
    stem: 'Notwithstanding the skepticism of contemporary critics, the theory has stood the test of time.',
    options: ['النظرية صمدت مع الوقت رغم تشكيك نقاد عصرها', 'النقاد كانوا صح والنظرية أثبتت فشلها', 'النقاد أيدوا النظرية من أول يوم', 'النظرية اتنست ومحدش بقى يفتكرها'], correctIndex: 0,
    explanationArz: '"Notwithstanding" تعني بالرغم من، و"stood the test of time" تعني صمدت وتبرهنت عبر الزمن.',
    tags: ['reading', 'c1-text']
  },
  {
    id: 'en-c1-listening-001', lang: 'en', cefr: 'C1', skill: 'listening', type: 'mcq',
    promptArz: 'اسمع المقطع الأكاديمي ده واختار الفكرة الأساسية:',
    stem: '(اضغط "شغّل الصوت" الأول)',
    audioText: 'Far from being a liability, diversity of thought is a catalyst for breakthrough innovation.',
    options: ['تنوع الآراء مش عبء، بل هو محفز للابتكار غير المسبوق', 'تنوع الآراء بيسبب مشاكل كتير في الشغل', 'الابتكار بيحصل بس لما الكل يتفقوا', 'التفكير المختلف ملوش أي تأثير على النجاح'], correctIndex: 0,
    explanationArz: '"Catalyst for breakthrough innovation" تعني محفز دافع ومباشر للابتكار الجذري.',
    tags: ['listening', 'c1-listening']
  },
  {
    id: 'en-c1-grammar-002', lang: 'en', cefr: 'C1', skill: 'grammar', type: 'mcq',
    promptArz: 'اختار التركيب النحوي الأكاديمي الدقيق:',
    stem: 'Be that ___ it may, we must proceed with caution.',
    options: ['as', 'so', 'if', 'what'], correctIndex: 0,
    explanationArz: 'تعبير مجازي ثابت (Subjunctive idiom): "Be that as it may" = مهما كان الأمر أو يكن ما يكون.',
    tags: ['subjunctive', 'idioms']
  },
  {
    id: 'en-c1-vocab-002', lang: 'en', cefr: 'C1', skill: 'vocabulary', type: 'mcq',
    promptArz: 'إيه معنى الكلمة المتقدمة دي؟',
    stem: 'His comments were so ___ that they sparked an intense debate.',
    options: ['provocative', 'placid', 'insignificant', 'monotonous'], correctIndex: 0,
    explanationArz: '"Provocative" يعني مثير للجدل أو التفكير أو الاستفهام.',
    tags: ['c1-vocab']
  },
  {
    id: 'en-c1-reading-002', lang: 'en', cefr: 'C1', skill: 'reading', type: 'mcq',
    promptArz: 'حلل العبارة الفلسفية التالية:',
    stem: 'Perfection is not attainable, but if we chase perfection we can catch excellence.',
    options: ['الكمال المطلق صعب، بس السعي وراه بيوصلنا للامتياز والتميز', 'الكمال سهل الوصول ليه في أي وقت', 'مفيش داعي نحاول نطور من نفسنا', 'التميز محتاج حظ ومش محتاج سعى'], correctIndex: 0,
    explanationArz: 'مقولة شهيرة: السعي نحو الكمال هو الطريق الحقيقي للوصول للتميز الجوهري.',
    tags: ['reading', 'philosophy']
  },
  {
    id: 'en-c1-listening-002', lang: 'en', cefr: 'C1', skill: 'listening', type: 'mcq',
    promptArz: 'اسمع المقطع البلاغي ده واختار المعنى المفصل:',
    stem: '(اضغط "شغّل الصوت" الأول)',
    audioText: 'The line between ambition and arrogance is often paper-thin.',
    options: ['الخيط بين الطموح والتكبر رفيع جدًا في كثير من الأحيان', 'الطموح والتكبر ملهمش أي علاقة ببعض', 'أي شخص طموح هو بالضرورة متكبر', 'التكبر صفة هامة للوصول للطموح'], correctIndex: 0,
    explanationArz: '"Paper-thin" تعني رفيع جدًا كالورقة (حد فاصل دقيق).',
    tags: ['listening', 'metaphors']
  }
];
