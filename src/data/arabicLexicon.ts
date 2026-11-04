export interface LexiconArEntry {
  grammarAr: string;
  tipAr: string;
}

export const LEXICON_AR: Record<string, LexiconArEntry> = {
  "أنا": {
    grammarAr: "ضمير متكلم",
    tipAr: "لازم تيجي بعدها am أو فعل في الإنجليزي."
  },
  "طبيب": {
    grammarAr: "اسم مفرد معدود",
    tipAr: "حط حرف التنكير a قبل الوظائف المفردة في الإنجليزي."
  },
  "في": {
    grammarAr: "حرف جر",
    tipAr: "بتترجم in للمدن والغرف، on للأيام، و at للأوقات والمؤسسات."
  },
  "الإسكندرية": {
    grammarAr: "اسم علم",
    tipAr: "أسماء المدن لا تسبقها أداة التعريف the في الإنجليزية."
  },
  "هو": {
    grammarAr: "ضمير غائب مفرد مذكّر",
    tipAr: "محتاج is في الجمل الاسمية أو بياخد s مع الفعل في المضارع البسيط."
  },
  "مهندس": {
    grammarAr: "اسم مفرد معدود",
    tipAr: "بياخد an لما يبدأ بصوت متحرك زي an engineer."
  },
  "معماري": {
    grammarAr: "صفة / اسم مكمل",
    tipAr: "مهندس معماري بتتجمع في كلمة واحدة وهي an architect."
  },
  "الطقس": {
    grammarAr: "اسم فاعل معرفة",
    tipAr: "اسم غير معدود مفرد — بياخد فعل الربط is."
  },
  "بارد": {
    grammarAr: "صفة",
    tipAr: "محتاج فعل ربط قبله زي is cold في الإنجليزي."
  },
  "جدا": {
    grammarAr: "ظرف درجة",
    tipAr: "بيتحط قبل الصفة في الإنجليزي زي very cold."
  },
  "اليوم": {
    grammarAr: "ظرف زمان",
    tipAr: "بييجي في آخر الجملة أو في أولها خالص."
  },
  "نحن": {
    grammarAr: "ضمير متكلم للجمع",
    tipAr: "بياخد فعل الربط للجمع are زي We are."
  },
  "جاهزون": {
    grammarAr: "خبر صفة",
    tipAr: "الصفة في الإنجليزي مش بتتجمع — بتفضل ready ومسبوقة بـ are."
  },
  "للمقابلة": {
    grammarAr: "حرف جر (لـ) + اسم معرفة",
    tipAr: "كلمة ready بتيجي معاها for في الإنجليزي (ready for)."
  },
  "أحب": {
    grammarAr: "فعل مضارع",
    tipAr: "بييجي بعد الضمير I مباشرة زي I like."
  },
  "القهوة": {
    grammarAr: "اسم غير معدود",
    tipAr: "شيّل الـ التعريف لما تتكلم عن القهوة بشكل عام (hot coffee)."
  },
  "الساخنة": {
    grammarAr: "صفة",
    tipAr: "حط الصفة قبل الاسم وبدون the زي hot coffee."
  },
  "بشكل": {
    grammarAr: "شبه جملة ظرفية",
    tipAr: "بتدل إن الكلام عام وبدون أدوات تعريف."
  },
  "عام": {
    grammarAr: "صفة",
    tipAr: "المفاهيم العامة مش بتاخد the في الإنجليزي."
  },
  "اشترى": {
    grammarAr: "فعل ماضي بسيط",
    tipAr: "فعل شاذ الماضي من buy هو bought."
  },
  "دراجة": {
    grammarAr: "اسم مفرد معدود",
    tipAr: "لازم تحط حرف التنكير a قبل الاسم المفرد (a bicycle)."
  },
  "جديدة": {
    grammarAr: "صفة",
    tipAr: "بتتحط بين أداة التنكير والاسم زي a new bike."
  },
  "الموسيقى": {
    grammarAr: "اسم مجرد غير معدود",
    tipAr: "المفاهيم المجردة مش بتاخد the زي Music makes me happy."
  },
  "تجعلني": {
    grammarAr: "فعل سببي + ياء المتكلم",
    tipAr: "الموسيقى مفرد غير معدود فالفعل بياخد s زي makes me."
  },
  "سعيدا": {
    grammarAr: "صفة مكملة",
    tipAr: "تركيبة makes me + الصفة مباشرة زي makes me happy."
  },
  "كفكرة": {
    grammarAr: "جار ومجرور للتوضيح",
    tipAr: "فكرة مجردة بتلغي أداة التعريف the."
  },
  "عامة": {
    grammarAr: "صفة",
    tipAr: "الفئات العامة بتلغي the في الإنجليزي."
  },
  "عندي": {
    grammarAr: "شبه جملة للملكية",
    tipAr: "في الإنجليزي بنستخدم فعل الملكية الصريح I have."
  },
  "محاضرة": {
    grammarAr: "اسم مفرد معدود",
    tipAr: "لازم تحط أداة التنكير a زي a lecture."
  },
  "كيمياء": {
    grammarAr: "اسم مضاف",
    tipAr: "بيتحط قبل الاسم في الإنجليزي زي chemistry lecture."
  },
  "غدا": {
    grammarAr: "ظرف زمان",
    tipAr: "مش محتاج حرف جر قبله في الإنجليزي (tomorrow)."
  },
  "سؤال": {
    grammarAr: "اسم مفرد معدود",
    tipAr: "محتاج a أو an في المفرد زي an important question."
  },
  "مهم": {
    grammarAr: "صفة",
    tipAr: "بدأ بصوت متحرك عشان كده بياخد an زي an important task."
  },
  "عنده": {
    grammarAr: "ضمير ملكية للغائب",
    tipAr: "في الإنجليزي بنحولها لفاعل وفعل: He has."
  },
  "سيارة": {
    grammarAr: "اسم مفرد معدود",
    tipAr: "بتتحط الصفة قبلها زي an electric car."
  },
  "كهربائية": {
    grammarAr: "صفة",
    tipAr: "بدأت بصوت متحرك فتاخد an electric car."
  },
  "ليس": {
    grammarAr: "أداة نفي",
    tipAr: "مع الملكية بننفي بـ do not have في الإنجليزي."
  },
  "لدي": {
    grammarAr: "تركيبة ملكية",
    tipAr: "بعد النفي بنرجع الفعل للمصدر I do not have."
  },
  "وقت": {
    grammarAr: "اسم غير معدود",
    tipAr: "بييجي مع enough زي enough time."
  },
  "كاف": {
    grammarAr: "محدد / صفة",
    tipAr: "كلمة enough بتيجي قبل الأسماء زي enough time."
  },
  "الآن": {
    grammarAr: "ظرف زمان",
    tipAr: "غالباً بيتحط في آخر الجملة (now)."
  },
  "لا": {
    grammarAr: "أداة نفي للمضارع",
    tipAr: "بنجيب الفعل المساعد do / does not قبل الفعل الأصلي."
  },
  "أشرب": {
    grammarAr: "فعل مضارع",
    tipAr: "بييجي في المصدر بعد do not زي I do not drink."
  },
  "الشاي": {
    grammarAr: "اسم غير معدود",
    tipAr: "في التفضيل العام بنشيل the زي green tea."
  },
  "الأخضر": {
    grammarAr: "صفة",
    tipAr: "بتتحط قبل الاسم من غير the زي green tea."
  },
  "سارة": {
    grammarAr: "اسم علم مفرد غائب",
    tipAr: "بتأخد الفعل المساعد does not في النفي."
  },
  "تعمل": {
    grammarAr: "فعل مضارع",
    tipAr: "بنشيل الـ s من الفعل بعد does not زي Sarah does not work."
  },
  "عطلة": {
    grammarAr: "اسم زمان",
    tipAr: "جزء من عطلة نهاية الأسبوع the weekend."
  },
  "نهاية": {
    grammarAr: "اسم مضاف",
    tipAr: "بتتجمع مع كلمة الأسبوع لتكوين كلمة weekend."
  },
  "الأسبوع": {
    grammarAr: "اسم معرفة",
    tipAr: "بياخد حرف الجر on زي on the weekend."
  },
  "يعمل": {
    grammarAr: "فعل مضارع",
    tipAr: "بيرجع لمصدره بدون s بعد does not."
  },
  "يوم": {
    grammarAr: "اسم زمان",
    tipAr: "الأيام في الإنجليزي بتاخد حرف الجر on قبليها."
  },
  "الجمعة": {
    grammarAr: "اسم يوم من الأسبوع",
    tipAr: "لازم يبدأ بحرف كابيتال في الإنجليزي (on Friday)."
  },
  "هم": {
    grammarAr: "ضمير غائب للجمع",
    tipAr: "بياخد do not في نفي المضارع (They do not live)."
  },
  "يعيشون": {
    grammarAr: "فعل مضارع",
    tipAr: "بييجي في المصدر بعد do not (They do not live)."
  },
  "هنا": {
    grammarAr: "ظرف مكان",
    tipAr: "بيتحط بعد الفعل مباشرة (live here)."
  },
  "بعد": {
    grammarAr: "أداة زمنية",
    tipAr: "بعد الآن في النفي بتترجم anymore في آخر الجملة."
  },
  "هل": {
    grammarAr: "حرف استفهام",
    tipAr: "مفيش كلمة واحدة لـ هل — بنبدأ بالفعل المساعد Do / Does / Have."
  },
  "تتحدث": {
    grammarAr: "فعل مضارع للمخاطب",
    tipAr: "بينقسم لفاعل وفعل بعد Do زي Do you speak?"
  },
  "الإنجليزية": {
    grammarAr: "اسم لغة معرفة",
    tipAr: "تبدأ بحرف كبير ومبتاخدش the قبلها (speak English)."
  },
  "بطلاقة": {
    grammarAr: "ظرف حال",
    tipAr: "بيتحط بعد المفعول به زي speak English fluently."
  },
  "يعيش": {
    grammarAr: "فعل مضارع",
    tipAr: "بعد Does بيرجع للمصدر live بدون s."
  },
  "أخوك": {
    grammarAr: "اسم + كاف الخطاب",
    tipAr: "ضمير الملكية your بييجي قبل الاسم (your brother)."
  },
  "لندن": {
    grammarAr: "اسم مدينة",
    tipAr: "المدن بتاخد حرف الجر in (in London)."
  },
  "تحتاج": {
    grammarAr: "فعل مضارع",
    tipAr: "مع هل بتعمل Do you need...?"
  },
  "إلى": {
    grammarAr: "حرف جر",
    tipAr: "فعل need بياخد مفعول به مباشر بدون to أو بياخد to + مصدر."
  },
  "أي": {
    grammarAr: "أداة عموم ونفي/استفهام",
    tipAr: "بتستخدم في الأسئلة والنفي زي any help."
  },
  "مساعدة": {
    grammarAr: "اسم غير معدود",
    tipAr: "اسم غير معدود في الإنجليزي ومش بيتجمع."
  },
  "أستطيع": {
    grammarAr: "فعل ناقص للمتكلم",
    tipAr: "فعل Can بييجي بعده الفعل في المصدر بدون to مباشرة."
  },
  "مساعدتك": {
    grammarAr: "مصدر + كاف الخطاب",
    tipAr: "بعد can بنستخدم الفعل والمفعول: help you."
  },
  "هذا": {
    grammarAr: "اسم إشارة للمفرد",
    tipAr: "بنشيل الـ التعريف من الاسم اللي بعده في الإنجليزي (this project)."
  },
  "المشروع": {
    grammarAr: "اسم مفرد معدود",
    tipAr: "بييجي مع with بعد help زي help you with this project."
  },
  "أريد": {
    grammarAr: "فعل رغبة في المضارع",
    tipAr: "بييجي بعده to + المصدر زي I want to learn."
  },
  "أن": {
    grammarAr: "حرف مصدري ونصب",
    tipAr: "بتترجم to بين الفعلين زي want to learn."
  },
  "أتعلم": {
    grammarAr: "فعل مضارع منصوب",
    tipAr: "بعد want to بنحط الفعل في المصدر learn."
  },
  "لغة": {
    grammarAr: "اسم مفرد معدود",
    tipAr: "لازم ياخد أداة تنكير a زي a new language."
  },
  "بحاجة": {
    grammarAr: "شبه جملة للاحتياج",
    tipAr: "بتتعبر بالفعل need to في الإنجليزي (We need to leave)."
  },
  "مغادرة": {
    grammarAr: "مصدر اسمي",
    tipAr: "بعد need to بنحط الفعل في المصدر leave."
  },
  "المكان": {
    grammarAr: "اسم معرفة",
    tipAr: "مفعول به مباشر للفعل leave (leave the place)."
  },
  "بيت": {
    grammarAr: "اسم مفرد معدود",
    tipAr: "بييجي بعد الصفات بتاعته زي a big and beautiful house."
  },
  "كبير": {
    grammarAr: "صفة",
    tipAr: "بتتحط قبل الاسم في الإنجليزي (big)."
  },
  "وجميل": {
    grammarAr: "حرف عطف + صفة",
    tipAr: "بيتحطوا قبل الاسم زي a big and beautiful house."
  },
  "قابلت": {
    grammarAr: "فعل ماضي + تاء الفاعل",
    tipAr: "بتترجم للفاعل والفعل الماضي I met."
  },
  "صديقا": {
    grammarAr: "اسم مفرد معدود",
    tipAr: "مسبوق بالصفة وأداة التنكير an old friend."
  },
  "قديما": {
    grammarAr: "صفة",
    tipAr: "بدأت بصوت متحرك عشان كده بتاخد an زي an old friend."
  },
  "من": {
    grammarAr: "حرف جر",
    tipAr: "بتترجم from زي from university."
  },
  "الجامعة": {
    grammarAr: "اسم مؤسسي",
    tipAr: "غالباً بتيجي بدون the لما تكون قصدك الدراسة (from university)."
  },
  "لديهم": {
    grammarAr: "تركيبة ملكية للجمع",
    tipAr: "بنحول الفاعل لضمير جمع: They have."
  },
  "خطة": {
    grammarAr: "اسم مفرد معدود",
    tipAr: "بتيجي بعد مجمع الصفات زي a very clever plan."
  },
  "ذكية": {
    grammarAr: "صفة",
    tipAr: "بتتحط قبل الاسم plan (a clever plan)."
  },
  "العمل": {
    grammarAr: "اسم مكان عمل",
    tipAr: "بنستخدم at work من غير the للتعبير عن مكان العمل."
  },
  "وسأتصل": {
    grammarAr: "عطف + سين الاستقبال + فعل",
    tipAr: "بتفك لـ 4 كلمات: and I will call."
  },
  "بك": {
    grammarAr: "جار ومجرور",
    tipAr: "فعل call متعدي مباشر في الإنجليزي ومش بياخد حرف جر (call you)."
  },
  "لاحقا": {
    grammarAr: "ظرف زمان",
    tipAr: "بيتحط في آخر الجملة (call you later)."
  },
  "لدينا": {
    grammarAr: "تركيبة ملكية للمتكلمين",
    tipAr: "بتترجم لفاعل وفعل: We have."
  },
  "اجتماع": {
    grammarAr: "اسم مفرد معدود",
    tipAr: "بياخد an important meeting."
  },
  "الاثنين": {
    grammarAr: "اسم يوم",
    tipAr: "أيام الأسبوع بتاخد on وحرف كابيتال (on Monday)."
  },
  "يستيقظ": {
    grammarAr: "فعل مضارع",
    tipAr: "فعل مركّب بياخد s مع المفرد الغائب (He wakes up)."
  },
  "مبكرا": {
    grammarAr: "ظرف",
    tipAr: "بييجي بعد الفعل المركّب (wakes up early)."
  },
  "لقد": {
    grammarAr: "حرف تحقيق",
    tipAr: "بيدل على المضارع التام have / has + التصريف الثالث لما يكون مفيش وقت ماضي محدد."
  },
  "أرسلت": {
    grammarAr: "فعل ماضي + تاء الفاعل",
    tipAr: "مع لقد بتترجم I have sent."
  },
  "التقرير": {
    grammarAr: "اسم معرفة",
    tipAr: "مفعول به بيتحط بعد الفعل."
  },
  "بالفعل": {
    grammarAr: "ظرف",
    tipAr: "غالباً بيتحط بين have والتصريف الثالث (have already sent)."
  },
  "أدرس": {
    grammarAr: "فعل مضارع",
    tipAr: "مع كلمة منذ (Duration) بيتحول لمضارع تام مستمر I have been studying."
  },
  "اللغة": {
    grammarAr: "اسم معرفة",
    tipAr: "في الإنجليزي بنقول German مباشرة من غير the language."
  },
  "الألمانية": {
    grammarAr: "اسم لغة",
    tipAr: "أسماء اللغات بتبدأ بحرف كابيتال ومن غير the."
  },
  "منذ": {
    grammarAr: "حرف جر للمدة",
    tipAr: "بنستخدم for للمدة المحسوبة (for two months) و since لنقطة البداية."
  },
  "شهرين": {
    grammarAr: "اسم مثنى",
    tipAr: "في الإنجليزي بنعبر برقم two + اسم جمع months."
  },
  "فقدت": {
    grammarAr: "فعل ماضي + تاء الفاعل",
    tipAr: "لأن المفاتيح لسه ضايعة دلوقتي، بنستخدم المضارع التام I have lost."
  },
  "مفاتيحي": {
    grammarAr: "اسم جمع + ياء المتكلم",
    tipAr: "صفة الملكية my بتيجي قبل الاسم my keys."
  },
  "اشتريت": {
    grammarAr: "فعل ماضي + تاء الفاعل",
    tipAr: "عشان كلمة أمس موجودة، لازم نستخدم الماضي البسيط I bought."
  },
  "هذه": {
    grammarAr: "اسم إشارة للمؤنث/المفرد",
    tipAr: "اسم الإشارة this وبيتلغى الـ التعريف بعده."
  },
  "الساعة": {
    grammarAr: "اسم مفرد",
    tipAr: "بنشيل الـ بعد this وبتبقى this watch."
  },
  "أمس": {
    grammarAr: "ظرف زمان ماضي",
    tipAr: "بيحدد زمني ماضي مقفول — بيجبرنا نستخدم الماضي البسيط!"
  },
  "سبق": {
    grammarAr: "فعل للتجربة",
    tipAr: "هل سبق لك أن... بتترجم لقاعدة تجارب الحياة Have you ever + V3?"
  },
  "زرت": {
    grammarAr: "تصريف ثالث",
    tipAr: "بعد Have you ever بنستخدم التصريف الثالث visited."
  },
  "اليابان": {
    grammarAr: "اسم دولة",
    tipAr: "مفيش the قبل اسم دولة Japan."
  },
  "التي": {
    grammarAr: "اسم موصول للمؤنث",
    tipAr: "بيستبدل المفعول به تماماً — إياك تكرر الضمير العائد بعدها!"
  },
  "الكتاب": {
    grammarAr: "اسم رئيسي معرفة",
    tipAr: "بييجي بعده جملة الوصل مباشرة The book I borrowed."
  },
  "الذي": {
    grammarAr: "اسم موصول للمذكر",
    tipAr: "ممكن تحذفه لما ييجي بعده فاعل وفعل (The book I borrowed)."
  },
  "استعرته": {
    grammarAr: "فعل + فاعل + ضمير عائد",
    tipAr: "إياك تترجم الهاء العائدة! قول The book I borrowed مش borrowed it."
  },
  "مفيد": {
    grammarAr: "خبر صفة",
    tipAr: "محتاج فعل الربط is قبل الصفة is very useful."
  },
  "لو": {
    grammarAr: "حرف شرط غير جازم (امتناع)",
    tipAr: "بيفعل الحالة الشرطية الثانية: If + past simple, ... would + base verb."
  },
  "كنت": {
    grammarAr: "فعل كان في الشرط",
    tipAr: "في النصيحة التخيلية الإنجليزي بيفضل صيغة Subjunctive: If I were you."
  },
  "مكانك": {
    grammarAr: "تعبير شرطي اصطلاحي",
    tipAr: "لو كنت مكانك بتترجم اصطلاحياً If I were you."
  },
  "لقبلت": {
    grammarAr: "لام الجواب + فعل + فاعل",
    tipAr: "اللام في جواب الشرط بتترجم I would + المصدر (I would accept)."
  },
  "ذلك": {
    grammarAr: "اسم إشارة للبعيد",
    tipAr: "that offer."
  },
  "العرض": {
    grammarAr: "اسم مفرد",
    tipAr: "بنشيل الـ بعد ذلك وبتبقى that offer."
  },
  "إذا": {
    grammarAr: "حرف شرط للممكن",
    tipAr: "بياخد مضارع بسيط في جملة الشرط و will في جواب الشرط."
  },
  "أمطرت": {
    grammarAr: "فعل شرط",
    tipAr: "الإنجليزي محتاج الفاعل الوهمي للطقس it + مضارع بسيط rains بعد If."
  },
  "سنلغي": {
    grammarAr: "سين الاستقبال + فعل جمع",
    tipAr: "بتتفك لـ we will cancel."
  },
  "الرحلة": {
    grammarAr: "اسم معرفة",
    tipAr: "مفعول به مباشر للفعل cancel."
  }
};
