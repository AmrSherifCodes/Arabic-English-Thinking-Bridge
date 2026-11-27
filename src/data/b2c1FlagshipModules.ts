// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import type { CefrLevelId, ExerciseItem } from '../progression/types';
import type { TargetLanguage } from '../types';

interface RawAdvancedItem {
  promptAr: string;
  promptEn: string;
  targetSentence: string;
  explanationAr: string;
  explanationEn: string;
  transliteration?: string;
}

const B2_CURATED_BANK: Record<'en' | 'de' | 'es' | 'it' | 'fr' | 'ar', RawAdvancedItem[]> = {
  en: [
    {
      promptAr: 'بصراحة، الفكرة دي مش عملية قوي — بس نقدر نعدّلها.',
      promptEn: 'Polite disagreement & nuance: soften criticism naturally.',
      targetSentence: 'To be honest, that approach is not very practical, though we could adapt it.',
      explanationAr: 'استخدمنا To be honest و though لتلطيف الاختلاف في الرأي بأسلوب أهل اللغة.',
      explanationEn: 'Softeners like "To be honest" and "though" make disagreement sound diplomatic and native.',
    },
    {
      promptAr: 'رغم إن الرحلة اتأخرت ساعتين، الطاقم اتعامل مع الموقف باحترافية.',
      promptEn: 'Connectors (although / nevertheless): contrast two clauses smoothly.',
      targetSentence: 'Although the flight was delayed by two hours, the crew handled it professionally.',
      explanationAr: 'في الإنجليزي بنستخدم Although بدون but في نفس الجملة (فخ عربي شهير: رغم... لكن).',
      explanationEn: 'Never pair "Although" with "but" in the same sentence — English uses one connector.',
    },
    {
      promptAr: 'خليك صريح معايا، إحنا فعلاً محتاجين نغيّر الخطة دلوقتي.',
      promptEn: 'Colloquial idiom: speaking candidly like a native.',
      targetSentence: 'Let us cut to the chase; we genuinely need to rethink our plan.',
      explanationAr: 'تعبير cut to the chase معناه "ندخل في المفيد على طول" بدل الترجمة الحرفية.',
      explanationEn: '"Cut to the chase" is a natural native idiom meaning to get straight to the main point.',
    },
    {
      promptAr: 'في الأثناء، الفريق التاني كان بيجهّز العرض التقديمي للمستثمرين.',
      promptEn: 'Discourse connectors (meanwhile): linking parallel events.',
      targetSentence: 'Meanwhile, the other team was preparing the pitch for the investors.',
      explanationAr: 'Meanwhile بتربط حدثين بيحصلوا في نفس الوقت بسلاسة في الحكي الاحترافي.',
      explanationEn: '"Meanwhile" cleanly bridges simultaneous actions in storytelling and workplace updates.',
    },
    {
      promptAr: 'الموضوع ده يستاهل نفكّر فيه كويس قبل ما ناخد قرار نهائي.',
      promptEn: 'Natural persuasion & hedging before a decision.',
      targetSentence: 'That is definitely worth considering carefully before we make a final call.',
      explanationAr: 'make a final call تعبير طبيعي جداً معناه "ناخد قرار نهائي"، و worth بيجي بعدها -ing.',
      explanationEn: '"Worth + -ing" and "make a final call" are staple B2 natural-fluency collocations.',
    },
    {
      promptAr: 'مع ذلك، النتائج الجديدة أثبتت إن الفرضية الأولى كانت أدق.',
      promptEn: 'Formal connector (nevertheless) for persuasive reasoning.',
      targetSentence: 'Nevertheless, the latest results proved that the original hypothesis was more accurate.',
      explanationAr: 'Nevertheless بترفع مستوى النقاش وتوضح التحول المنطقي في الحجة.',
      explanationEn: '"Nevertheless" signals a high-clarity logical contrast in persuasive speech.',
    },
  ],
  de: [
    {
      promptAr: 'على الرغم من إن القطار اتأخر، وصلنا الاجتماع في الميعاد.',
      promptEn: 'German B2 subordinate clause (Obwohl sends conjugated verb to the end).',
      targetSentence: 'Obwohl der Zug Verspätung hatte, kamen wir pünktlich zum Treffen.',
      explanationAr: 'بعد Obwohl الفعل المصرف بيروح آخر الجملة الجانبية، والجملة الرئيسية بتبدأ بالفعل (V2).',
      explanationEn: '"Obwohl" pushes the verb to the end of the subordinate clause; the main clause starts with the verb.',
    },
    {
      promptAr: 'بصراحة، أنا شايف الموضوع من زاوية مختلفة تماماً.',
      promptEn: 'German B2 polite disagreement & perspective.',
      targetSentence: 'Ehrlich gesagt sehe ich das Thema aus einer völlig anderen Perspektive.',
      explanationAr: 'Ehrlich gesagt في الأول بتخلي الفعل sehe ييجي في الموقع الثاني V2 مباشرة.',
      explanationEn: 'Fronting "Ehrlich gesagt" keeps "sehe" in V2 position for natural native German flow.',
    },
    {
      promptAr: 'ومع ذلك، لازم نلاقي حل عملي قبل نهاية الأسبوع.',
      promptEn: 'German B2 connector (Trotzdem + V2 inversion).',
      targetSentence: 'Trotzdem müssen wir vor dem Wochenende eine praktische Lösung finden.',
      explanationAr: 'Trotzdem ظرف ربط بييجي بعده الفعل الناقص müssen مباشرة والمصدر finden في النهاية.',
      explanationEn: '"Trotzdem" triggers V2 inversion with the modal verb and pushes the infinitive to the end.',
    },
    {
      promptAr: 'الموضوع ده بيعتمد على الميزانية المتاحة والوقت.',
      promptEn: 'German B2 separable verb + preposition (abhängen von + Dativ).',
      targetSentence: 'Das hängt stark vom verfügbaren Budget und von der Zeit ab.',
      explanationAr: 'الفعل abhängen منفصل: hängt في الموقع الثاني و ab في آخر الجملة مع حالة الجر (Dativ).',
      explanationEn: '"abhängen von" is a separable verb requiring dative case (vom / von der).',
    },
    {
      promptAr: 'أثناء ذلك، الزملاء جهّزوا كل أوراق الجامعة المطلوبة.',
      promptEn: 'German B2 narrative connector (Währenddessen).',
      targetSentence: 'Währenddessen haben die Kollegen alle erforderlichen Unterlagen vorbereitet.',
      explanationAr: 'Währenddessen بتدي نفس معنى Meanwhile وتخلي الفعل المساعد haben في الموقع الثاني.',
      explanationEn: '"Währenddessen" links parallel events smoothly with V2 word order.',
    },
    {
      promptAr: 'خلينا ندخل في صلب الموضوع عشان منضيعش وقت.',
      promptEn: 'German B2 colloquial idiom (auf den Punkt kommen).',
      targetSentence: 'Kommen wir direkt auf den Punkt, damit wir keine Zeit verlieren.',
      explanationAr: 'auf den Punkt kommen تعبير ألماني أصيل معناه "ندخل في صلب الموضوع".',
      explanationEn: '"Auf den Punkt kommen" is the exact German native idiom for getting straight to the point.',
    },
  ],
  es: [
    {
      promptAr: 'رغم إن الرحلة كانت طويلة، استمتعنا بكل لحظة في مدريد.',
      promptEn: 'Spanish B2 concession (Aunque + past contrast).',
      targetSentence: 'Aunque el viaje fue largo, disfrutamos cada momento en Madrid.',
      explanationAr: 'Aunque بتربط بين التحدي والنتيجة الإيجابية بسلاسة في المحادثة الطبيعية.',
      explanationEn: '"Aunque" introduces a natural contrast without needing an extra "but".',
    },
    {
      promptAr: 'بصراحة، أعتقد إننا محتاجين نراجع الخطة قبل ما نقرر.',
      promptEn: 'Spanish B2 polite hedging & persuasion.',
      targetSentence: 'Sinceramente, creo que deberíamos revisar el plan antes de decidir.',
      explanationAr: 'استخدام الشرطي deberíamos بيلطف الاقتراح ويخليه مهذب وطبيعي جداً.',
      explanationEn: 'Using conditional "deberíamos" softens advice into diplomatic native Spanish.',
    },
    {
      promptAr: 'ومع ذلك، الحل ده أوفر بكتير على المدى الطويل.',
      promptEn: 'Spanish B2 discourse connector (Sin embargo).',
      targetSentence: 'Sin embargo, esta solución resulta mucho más económica a largo plazo.',
      explanationAr: 'Sin embargo = ومع ذلك، و a largo plazo تعبير ثابت معناه "على المدى الطويل".',
      explanationEn: '"Sin embargo" and "a largo plazo" elevate everyday Spanish to fluent B2.',
    },
    {
      promptAr: 'أتمنى إن الطقس يكون كويس بكرة عشان نتمشى.',
      promptEn: 'Spanish B2 Subjunctive mood after Ojalá.',
      targetSentence: 'Ojalá que mañana haga buen tiempo para salir a caminar.',
      explanationAr: 'بعد Ojalá بنستخدم صيغة التمني (Subjuntivo): haga بدل hace — ودي علامة الطلاقة في الإسبانية.',
      explanationEn: 'Ojalá (from Arabic ان شاء الله!) triggers the subjunctive "haga" in natural Spanish.',
    },
    {
      promptAr: 'في الأثناء، هم كانوا بيحجزوا التذاكر من التطبيق.',
      promptEn: 'Spanish B2 parallel action (Mientras tanto).',
      targetSentence: 'Mientras tanto, ellos estaban reservando los boletos desde la aplicación.',
      explanationAr: 'Mientras tanto بتربط الأحداث المتزامنة مع الماضي المستمر.',
      explanationEn: '"Mientras tanto" smoothly connects simultaneous background actions.',
    },
    {
      promptAr: 'خلينا ندخل في الموضوع على طول بدون لف ودوران.',
      promptEn: 'Spanish B2 street idiom (ir al grano).',
      targetSentence: 'Vamos directamente al grano sin dar tantos rodeos.',
      explanationAr: 'ir al grano تعبير إسباني يومي أصيل معناه "ندخل في المفيد".',
      explanationEn: '"Ir al grano" is the authentic Spanish idiom for getting straight to the point.',
    },
  ],
  it: [
    {
      promptAr: 'رغم إن القطار اتأخر شوية، لحقنا المعرض في روما.',
      promptEn: 'Italian B2 concession with Sebbene / Anche se.',
      targetSentence: 'Anche se il treno era in ritardo, siamo arrivati in tempo alla mostra.',
      explanationAr: 'Anche se بتربط التناقض بوضوح، والفعل arrivare بياخد المساعد essere في الماضي.',
      explanationEn: '"Anche se" frames contrast cleanly, paired with auxiliary "essere" for movement.',
    },
    {
      promptAr: 'بصراحة، أفضّل إننا نناقش التفاصيل دي بكرة الصبح.',
      promptEn: 'Italian B2 polite preference (Condizionale).',
      targetSentence: 'Sinceramente, preferirei discutere questi dettagli domani mattina.',
      explanationAr: 'صيغة الشرط preferirei بتخلي كلامك راقي وطبيعي زي الإيطاليين.',
      explanationEn: 'Conditional "preferirei" conveys polite, native-sounding preference.',
    },
    {
      promptAr: 'ومع ذلك، الفكرة دي تستاهل نجرّبها فعلاً.',
      promptEn: 'Italian B2 connector (Tuttavia + valere la pena).',
      targetSentence: 'Tuttavia, questa idea vale davvero la pena di essere provata.',
      explanationAr: 'Tuttavia = ومع ذلك، و valere la pena تعبير إيطالي أساسي معناه "يستاهل".',
      explanationEn: '"Tuttavia" and "valere la pena" are essential B2 Italian fluency bridges.',
    },
    {
      promptAr: 'في الأثناء، حجزنا طاولة في مطعم هادي جنب الساحة.',
      promptEn: 'Italian B2 narrative connector (Nel frattempo).',
      targetSentence: 'Nel frattempo, abbiamo prenotato un tavolo in un ristorante tranquillo.',
      explanationAr: 'Nel frattempo بتربط الأحداث اللي حصلت في نفس التوقيت.',
      explanationEn: '"Nel frattempo" links parallel actions naturally in Italian.',
    },
    {
      promptAr: 'أعتقد إن الموضوع ده مهم جداً لنجاح المشروع.',
      promptEn: 'Italian B2 Subjunctive (Congiuntivo) after pensare che.',
      targetSentence: 'Penso che questo argomento sia fondamentale per il successo del progetto.',
      explanationAr: 'بعد Penso che بنستخدم صيغة الشك/الرأي (Congiuntivo): sia بدل è.',
      explanationEn: '"Penso che" triggers the Italian subjunctive "sia", a hallmark of B2 fluency.',
    },
    {
      promptAr: 'خلينا ندخل في صلب الموضوع مباشرة.',
      promptEn: 'Italian B2 idiom (andare dritto al punto).',
      targetSentence: 'Andiamo dritti al punto senza perdere altro tempo.',
      explanationAr: 'andare dritti al punto تعبير إيطالي حي معناه "ندخل في المهم على طول".',
      explanationEn: '"Andare dritti al punto" is the natural Italian way to say get straight to the point.',
    },
  ],
  fr: [
    {
      promptAr: 'رغم إن الجو كان ممطر، استمتعنا بالمشي في باريس.',
      promptEn: 'French B2 concession (Bien que + Subjonctif).',
      targetSentence: 'Bien qu il pleuve, nous avons adoré marcher dans Paris.',
      explanationAr: 'بعد Bien que بنستخدم صيغة Subjonctif، ودي من أهم علامات مستوى B2 في الفرنسية.',
      explanationEn: '"Bien que" requires the French subjunctive — a core B2 structural milestone.',
    },
    {
      promptAr: 'بصراحة، أعتقد إن الحل ده أكثر واقعية على المدى الطويل.',
      promptEn: 'French B2 polite opinion & nuance.',
      targetSentence: 'Franchement, je trouve cette solution beaucoup plus réaliste à long terme.',
      explanationAr: 'Franchement و à long terme بتخلي أسلوبك في النقاش طبيعي وواثق.',
      explanationEn: '"Franchement" and "à long terme" give French opinions natural B2 polish.',
    },
    {
      promptAr: 'ومع ذلك، لازم ناخد في الاعتبار ميزانية الفريق.',
      promptEn: 'French B2 connector (Néanmoins + prendre en compte).',
      targetSentence: 'Néanmoins, il faut prendre en compte le budget de l équipe.',
      explanationAr: 'Néanmoins = ومع ذلك، و prendre en compte تعبير ثابت معناه "يأخذ في الاعتبار".',
      explanationEn: '"Néanmoins" and "prendre en compte" are key B2 persuasive structures.',
    },
    {
      promptAr: 'في الأثناء، كنا بنجهّز العرض التقديمي للاجتماع.',
      promptEn: 'French B2 narrative connector (Pendant ce temps).',
      targetSentence: 'Pendant ce temps, nous préparions la présentation pour la réunion.',
      explanationAr: 'Pendant ce temps بتقابل Meanwhile وبتربط حدثين متزامنين في الماضي.',
      explanationEn: '"Pendant ce temps" smoothly links parallel ongoing past events.',
    },
    {
      promptAr: 'لو كان عندي وقت أكتر، كنت هتعلم لغة رابعة.',
      promptEn: 'French B2 hypothetical conditional (Si + imparfait -> conditionnel).',
      targetSentence: 'Si j avais plus de temps, j apprendrais une quatrième langue.',
      explanationAr: 'في الشرط التخيلي: بعد Si نستخدم Imparfait وفي جواب الشرط Conditionnel.',
      explanationEn: 'Hypothetical French pairs Si + imperfect with the conditional mood.',
    },
    {
      promptAr: 'خلينا ندخل في صلب الموضوع من غير تطويل.',
      promptEn: 'French B2 idiom (aller droit au but).',
      targetSentence: 'Allons droit au but sans tourner autour du pot.',
      explanationAr: 'aller droit au but و tourner autour du pot تعبيرات فرنسية أصيلة للنقاش السريع.',
      explanationEn: '"Aller droit au but" and "tourner autour du pot" are classic native French idioms.',
    },
  ],
  ar: [
    {
      promptAr: 'Honestly, that plan is not very practical, though we can adjust it. (صراحة الخطة دي مش عملية أوي بس نقدر نظبطها)',
      promptEn: 'Honestly, that plan is not very practical, though we can adjust it. (Egyptian + Standard Bridge)',
      targetSentence: 'بصراحة الخطة دي مش عملية أوي، بس نقدر نعدلها.',
      explanationAr: 'في العامية المصرية بنقول "بصراحة" و"مش عملية أوي" لتلطيف النقد بلباقة (Bisaraha el-khitta di mish amaliyya awi, bas niqdar niaddilha).',
      explanationEn: 'Transliteration: "Bisaraha el-khitta di mish amaliyya awi, bas niqdar niaddilha." Softens disagreement naturally in Egyptian Arabic.',
    },
    {
      promptAr: 'Although the flight was delayed, the staff handled it well. (رغم إن الطيارة اتأخرت، الطاقم اتصرف باحترافية)',
      promptEn: 'Although the flight was delayed, the staff handled it well.',
      targetSentence: 'رغم إن الرحلة اتأخرت، الطاقم اتعامل باحترافية.',
      explanationAr: 'الربط بـ "رغم إن" يوضح التناقض بطلاقة (Raghm inn el-rihla itakharit, el-taqam itaamil bi-ihtirafiyya).',
      explanationEn: 'Transliteration: "Raghm inn el-rihla itakharit, el-taqam itaamil bi-ihtirafiyya."',
    },
    {
      promptAr: 'Let us get straight to the point so we save time. (خلينا ندخل في المفيد على طول)',
      promptEn: 'Let us get straight to the point so we save time.',
      targetSentence: 'خلينا ندخل في المفيد على طول عشان نوفر وقت.',
      explanationAr: 'تعبير "ندخل في المفيد" هو المقابل المصري الأصيل لـ cut to the chase (Khallina nidkhol fil-mufid ala tool).',
      explanationEn: 'Transliteration: "Khallina nidkhol fil-mufid ala tool ashan niwaffar waqt."',
    },
    {
      promptAr: 'Nevertheless, this option is much better in the long run. (ومع ذلك، الاختيار ده أفضل على المدى الطويل)',
      promptEn: 'Nevertheless, this option is much better in the long run.',
      targetSentence: 'ومع ذلك، الاختيار ده أفضل بكتير على المدى الطويل.',
      explanationAr: 'استخدام "ومع ذلك" يرفع مستوى الحوار العربي بسلاسة (Wa maa zalik, el-ikhtiyar da afdal bikteer ala el-mada el-taweel).',
      explanationEn: 'Transliteration: "Wa maa zalik, el-ikhtiyar da afdal bikteer ala el-mada el-taweel."',
    },
    {
      promptAr: 'Meanwhile, my friend booked the hotel near downtown. (في الوقت ده صاحبي حجز الفندق)',
      promptEn: 'Meanwhile, my friend booked the hotel near downtown.',
      targetSentence: 'وفي نفس الوقت، صاحبي حجز الفندق قريب من وسط البلد.',
      explanationAr: '"وسط البلد" تعني Downtown في القاهرة والإسكندرية (Wi fi nafs el-waqt, sahbi hagaz el-fondoq orayyib min wist el-balad).',
      explanationEn: 'Transliteration: "Wi fi nafs el-waqt, sahbi hagaz el-fondoq orayyib min wist el-balad."',
    },
    {
      promptAr: 'That idea is definitely worth trying before we decide. (الفكرة دي تستاهل نجربها)',
      promptEn: 'That idea is definitely worth trying before we decide.',
      targetSentence: 'الفكرة دي فعلاً تستاهل نجربها قبل ما نقرر.',
      explanationAr: '"تستاهل" تعبير عربي ومصري طبيعي جداً لـ worth it (El-fikra di filan tistahil nigarrabha abl ma niqarrar).',
      explanationEn: 'Transliteration: "El-fikra di filan tistahil nigarrabha abl ma niqarrar."',
    },
  ],
};

const C1_CURATED_BANK: Record<'en' | 'de' | 'es' | 'it' | 'fr' | 'ar', RawAdvancedItem[]> = {
  en: [
    {
      promptAr: 'الاعتماد المفرط على الذكاء الاصطناعي بدون تفكير نقدي بيضعف الإبداع البشري.',
      promptEn: 'C1 Science & Tech Debate: articulating nuanced cause and effect.',
      targetSentence: 'Over-reliance on automation without critical thinking inevitably erodes human creativity.',
      explanationAr: 'في مستوى C1 بنستخدم أسماء مجردة دقيقة (Over-reliance) وأفعال قوية (erodes) بدل جمل طويلة مكررة.',
      explanationEn: 'C1 rhetoric compresses complex ideas into crisp nominalizations ("over-reliance") and vivid verbs ("erodes").',
    },
    {
      promptAr: 'مش بس التكلفة أقل، لكن النظام كمان بيشتغل بدون إنترنت تماماً.',
      promptEn: 'C1 Rhetorical Inversion (Not only... but also).',
      targetSentence: 'Not only is the architecture cost-free, but it also operates entirely offline.',
      explanationAr: 'لما نبدأ بـ Not only بنقلب الفعل المساعد قبل الفاعل (is the architecture) لخلق تأثير خطابي قوي.',
      explanationEn: 'Negative inversion ("Not only is...") adds executive emphasis in debates and presentations.',
    },
    {
      promptAr: 'لو كنا اكتشفنا الخلل ده بدري، كنا وفرنا أسابيع من الشغل.',
      promptEn: 'C1 Inverted Third Conditional (Had we...) — formal register.',
      targetSentence: 'Had we spotted that flaw earlier, we would have saved weeks of effort.',
      explanationAr: 'حذف If وتقديم Had (Had we spotted) أسلوب C1 راقي ومباشر في تقارير الأعمال والهندسة.',
      explanationEn: 'Dropping "if" and inverting "Had we..." is a signature C1 formal business structure.',
    },
    {
      promptAr: 'يا سلام، طبعاً القطار اتأخر في اليوم الوحيد اللي عندي فيه مقابلة مهمة!',
      promptEn: 'C1 Subtle Irony & Sarcasm: tone shift in natural speech.',
      targetSentence: 'Naturally, the train breaks down on the one morning I have a crucial interview.',
      explanationAr: 'استخدام Naturally في البداية مع المضارع البسيط بيدي نبرة سخرية لطيفة ومألوفة جداً عند أهل اللغة.',
      explanationEn: '"Naturally..." with present tense creates dry, understated English irony.',
    },
    {
      promptAr: 'من منظور اقتصادي، الاستثمار في التعليم المفتوح بيحقق أعلى عائد طويل الأمد.',
      promptEn: 'C1 Formal Register: academic & policy framing.',
      targetSentence: 'From an economic standpoint, investing in open education yields the highest long-term return.',
      explanationAr: 'From an economic standpoint و yields بتحول الفكرة اليومية إلى صياغة أكاديمية ومهنية رفيعة.',
      explanationEn: '"From an economic standpoint" and "yields" shift seamlessly into formal C1 register.',
    },
    {
      promptAr: 'بوابة الأسطورة C1: بصرف النظر عن التحديات، الإتقان الحقيقي بييجي لما تفكّر باللغة مباشرة.',
      promptEn: '⚔️ C1 Legend Boss Gate: synthesis of fluency, nuance, and register.',
      targetSentence: 'Regardless of the obstacles, true mastery emerges the moment you think directly in the language.',
      explanationAr: 'مبروك وصولك لبوابة الأسطورة C1! Regardless of + emerges بتجمع الدقة والعمق في جملة واحدة.',
      explanationEn: 'C1 Legend Boss Gate: "Regardless of" paired with "emerges" delivers native-level clarity and poise.',
    },
  ],
  de: [
    {
      promptAr: 'الاعتماد الأعمى على التكنولوجيا بدون تفكير نقدي بيقلل من الإبداع.',
      promptEn: 'German C1 Science & Tech Rhetoric.',
      targetSentence: 'Blinde Abhängigkeit von Technologie ohne kritisches Denken schwächt die Kreativität.',
      explanationAr: 'في الألمانية C1 بنستخدم البناء الاسمي الدقيق (Nominalstil) لصياغة الأفكار العلمية بقوة.',
      explanationEn: 'C1 German leverages crisp nominal style ("Abhängigkeit von") for academic clarity.',
    },
    {
      promptAr: 'لو كنا فحصنا البيانات بدري، كنا تجنبنا الخطأ ده.',
      promptEn: 'German C1 Konjunktiv II Vergangenheit (Inverted conditional without wenn).',
      targetSentence: 'Hätten wir die Daten früher geprüft, hätten wir diesen Fehler vermieden.',
      explanationAr: 'تقديم Hätten بدون wenn صيغة C1 ألمانية فصيحة جداً في العمل والجامعة.',
      explanationEn: 'Omitting "wenn" and fronting "Hätten" is classic high-register C1 German.',
    },
    {
      promptAr: 'مش بس النظام مجاني، لكنه كمان بيحمي خصوصية المستخدم بالكامل.',
      promptEn: 'German C1 Correlative Emphasis (Nicht nur..., sondern auch).',
      targetSentence: 'Nicht nur ist das System kostenlos, sondern es schützt auch die Privatsphäre.',
      explanationAr: 'استخدام Nicht nur... sondern auch يبني حجة مقنعة ومنظمة في المناظرات.',
      explanationEn: 'Paired correlative connectors give German arguments executive structure.',
    },
    {
      promptAr: 'طبعاً القطار اتعطل بالذات في اليوم اللي فيه المقابلة المهمة!',
      promptEn: 'German C1 Dry Humor & Modal Particle (ausgerechnet).',
      targetSentence: 'Natürlich fällt der Zug ausgerechnet am Tag meines wichtigen Vorstellungsgesprächs aus.',
      explanationAr: 'كلمة ausgerechnet (بالذات!) من أدق أدوات النبرة والسخرية الألمانية في مستوى C1.',
      explanationEn: '"Ausgerechnet" captures unmistakable native German irony and emphasis.',
    },
    {
      promptAr: 'من الناحية العلمية، التجربة دي بتفتح آفاق جديدة تماماً.',
      promptEn: 'German C1 Academic Register.',
      targetSentence: 'Aus wissenschaftlicher Sicht eröffnet dieses Experiment völlig neue Perspektiven.',
      explanationAr: 'Aus wissenschaftlicher Sicht (من منظور علمي) افتتاحية أكاديمية ألمانية رفيعة.',
      explanationEn: '"Aus wissenschaftlicher Sicht" is a staple C1 German academic framing.',
    },
    {
      promptAr: 'بوابة الأسطورة C1: بغض النظر عن الصعوبات، الطلاقة الحقيقية تبدأ بالتفكير المباشر.',
      promptEn: '⚔️ German C1 Boss Gate (Ungeachtet + Genitiv).',
      targetSentence: 'Ungeachtet aller Hindernisse beginnt wahre Beherrschung mit direktem Denken.',
      explanationAr: 'Ungeachtet + Genitiv (المضاف إليه) علامة إتقان C1 حقيقية في الألمانية.',
      explanationEn: 'C1 Boss Gate: "Ungeachtet" with genitive case signals true C1 German mastery.',
    },
  ],
  es: [
    {
      promptAr: 'الاعتماد المفرط على الأتمتة بدون تفكير نقدي بيضعف الإبداع.',
      promptEn: 'Spanish C1 Tech & Society Debate.',
      targetSentence: 'La dependencia excesiva de la automatización sin pensamiento crítico debilita la creatividad.',
      explanationAr: 'تراكيب اسمية دقيقة تعبر عن الأفكار المجردة بأسلوب إسباني متقدم.',
      explanationEn: 'C1 Spanish frames abstract tech debates cleanly with precise nominal phrases.',
    },
    {
      promptAr: 'لو كنا اكتشفنا المشكلة بدري، كنا وفرنا وقت ومجهود كبير.',
      promptEn: 'Spanish C1 Pluperfect Subjunctive + Conditional Perfect.',
      targetSentence: 'Si hubiéramos detectado el fallo antes, habríamos ahorrado semanas de trabajo.',
      explanationAr: 'الربط بين hubiéramos (ماضي تام تمني) و habríamos هو قمة دقة الشرط في الإسبانية C1.',
      explanationEn: 'Pairing pluperfect subjunctive with conditional perfect marks fluent C1 Spanish.',
    },
    {
      promptAr: 'من منظور اقتصادي، التعليم المفتوح بيحقق أكبر عائد على المدى البعيد.',
      promptEn: 'Spanish C1 Formal Register.',
      targetSentence: 'Desde una perspectiva económica, la educación abierta genera el mayor retorno sostenible.',
      explanationAr: 'Desde una perspectiva económica افتتاحية مهنية راقية للعروض التقديمية.',
      explanationEn: 'Executive framing with "Desde una perspectiva económica" shifts cleanly to formal register.',
    },
    {
      promptAr: 'طبعاً القطار اتأخر في اليوم الوحيد اللي عندي فيه مقابلة مصيرية!',
      promptEn: 'Spanish C1 Irony & Tone Shift.',
      targetSentence: 'Cómo no, el tren se retrasa justo el día de mi entrevista más importante.',
      explanationAr: 'تعبير Cómo no! هنا بيستخدم للسخرية اللطيفة زي "طبعاً! ما هو لازم!" بالعامية.',
      explanationEn: '"Cómo no" delivers sharp, natural Spanish irony in everyday storytelling.',
    },
    {
      promptAr: 'مش بس التطبيق مجاني، لكنه كمان بيشتغل بدون إنترنت تماماً.',
      promptEn: 'Spanish C1 Rhetorical Structure (No solo... sino que también).',
      targetSentence: 'No solo es gratuita la plataforma, sino que también funciona completamente sin conexión.',
      explanationAr: 'No solo... sino que también تركيب بلاغي متقدم لترتيب الحجج.',
      explanationEn: 'Using "No solo... sino que también" creates polished C1 persuasive flow.',
    },
    {
      promptAr: 'بوابة الأسطورة C1: بغض النظر عن العقبات، الإتقان يولد عندما تفكر باللغة مباشرة.',
      promptEn: '⚔️ Spanish C1 Boss Gate.',
      targetSentence: 'Más allá de los obstáculos, el verdadero dominio surge cuando piensas directamente en español.',
      explanationAr: 'بوابة الأسطورة C1! Más allá de + surge أسلوب إسباني رفيع وطبيعي.',
      explanationEn: 'C1 Boss Gate: "Más allá de" + "surge" conveys effortless C1 fluency.',
    },
  ],
  it: [
    {
      promptAr: 'الاعتماد الزائد على التكنولوجيا بدون تفكير نقدي بيقلل الإبداع.',
      promptEn: 'Italian C1 Tech & Innovation Debate.',
      targetSentence: 'L eccessiva dipendenza dalla tecnologia senza spirito critico indebolisce la creatività.',
      explanationAr: 'spirito critico و indebolisce تراكيب إيطالية دقيقة لمستوى C1.',
      explanationEn: 'C1 Italian expresses nuanced abstract critiques with crisp vocabulary.',
    },
    {
      promptAr: 'لو كنا لاحظنا الخطأ بدري، كنا وفرنا أسابيع من العمل.',
      promptEn: 'Italian C1 Third Conditional (Periodo ipotetico dell irrealtà).',
      targetSentence: 'Se avessimo notato l errore prima, avremmo risparmiato settimane di lavoro.',
      explanationAr: 'الربط بين Congiuntivo Trapassato (avessimo) و Condizionale Passato (avremmo) علامة C1.',
      explanationEn: 'Mastering the Italian 3rd conditional is a cornerstone of C1 fluency.',
    },
    {
      promptAr: 'من منظور علمي، التجربة دي بتفتح آفاق جديدة ومهمة.',
      promptEn: 'Italian C1 Formal & Academic Register.',
      targetSentence: 'Da un punto di vista scientifico, questo esperimento apre orizzonti davvero innovativi.',
      explanationAr: 'Da un punto di vista scientifico صيغة أكاديمية ومهنية رفيعة في الإيطالية.',
      explanationEn: 'Formal register framing used in Italian academic and business discourse.',
    },
    {
      promptAr: 'طبعاً القطار اتأخر بالذات يوم المقابلة المهمة!',
      promptEn: 'Italian C1 Irony & Expressive Nuance.',
      targetSentence: 'Ovviamente il treno fa ritardo proprio il giorno del mio colloquio decisivo.',
      explanationAr: 'Ovviamente + proprio بتدي نبرة سخرية إيطالية طبيعية جداً.',
      explanationEn: '"Ovviamente... proprio" captures authentic Italian dry irony.',
    },
    {
      promptAr: 'مش بس المنصة مجانية، لكنها كمان بتشتغل أوفلاين بالكامل.',
      promptEn: 'Italian C1 Rhetorical Emphasis (Non solo... ma anche).',
      targetSentence: 'Non solo la piattaforma è gratuita, ma funziona anche completamente offline.',
      explanationAr: 'Non solo... ma anche أداة إقناع قوية في العروض والمناظرات.',
      explanationEn: 'Correlative emphasis adds persuasive punch in C1 Italian.',
    },
    {
      promptAr: 'بوابة الأسطورة C1: بغض النظر عن التحديات، الإتقان الحقيقي يبدأ بالتفكير المباشر.',
      promptEn: '⚔️ Italian C1 Boss Gate.',
      targetSentence: 'Al di là delle sfide, la vera padronanza nasce quando pensi direttamente in italiano.',
      explanationAr: 'Al di là delle sfide و padronanza (الإتقان) يختمان مسار C1 بأناقة.',
      explanationEn: 'C1 Boss Gate: "Al di là delle sfide" + "padronanza" demonstrates C1 elegance.',
    },
  ],
  fr: [
    {
      promptAr: 'الاعتماد المفرط على الأتمتة بدون تفكير نقدي بيضعف الإبداع.',
      promptEn: 'French C1 Science & Society Debate.',
      targetSentence: 'Une dépendance excessive à l automatisation sans esprit critique affaiblit la créativité.',
      explanationAr: 'esprit critique (التفكير النقدي) و affaiblit من مفردات المناظرات الفرنسية في مستوى C1.',
      explanationEn: '"Esprit critique" and precise nominal framing anchor C1 French rhetoric.',
    },
    {
      promptAr: 'لو كنا اكتشفنا المشكلة بدري، كنا وفرنا أسابيع من الجهد.',
      promptEn: 'French C1 Past Conditional (Si + plus-que-parfait -> conditionnel passé).',
      targetSentence: 'Si nous avions repéré cette erreur plus tôt, nous aurions gagné des semaines.',
      explanationAr: 'التوافق بين avions repéré و aurions gagné يعبّر عن الندم والتحليل الاحترافي في C1.',
      explanationEn: 'Plus-que-parfait paired with past conditional is essential for C1 French.',
    },
    {
      promptAr: 'من منظور اقتصادي، الاستثمار في التعليم المفتوح يحقق أعلى عائد.',
      promptEn: 'French C1 Executive & Policy Register.',
      targetSentence: 'D un point de vue économique, investir dans l éducation ouverte offre le meilleur rendement.',
      explanationAr: 'D un point de vue économique تعبير فرنسي قياسي للانتقال للأسلوب الرسمي.',
      explanationEn: '"D un point de vue économique" signals polished formal French register.',
    },
    {
      promptAr: 'طبعاً القطار اتعطل بالذات يوم مقابلتي المهمة!',
      promptEn: 'French C1 Subtle Sarcasm & Tone.',
      targetSentence: 'Bien entendu, le train tombe en panne précisément le matin de mon entretien décisif.',
      explanationAr: 'Bien entendu + précisément بتدي نبرة سخرية فرنسية مهذبة وحقيقية.',
      explanationEn: '"Bien entendu... précisément" creates unmistakable dry French irony.',
    },
    {
      promptAr: 'مش بس المنصة مجانية، لكنها كمان بتشتغل بدون إنترنت بالكامل.',
      promptEn: 'French C1 Persuasive Rhetoric (Non seulement... mais encore).',
      targetSentence: 'Non seulement cette plateforme est gratuite, mais elle fonctionne également hors ligne.',
      explanationAr: 'Non seulement... mais également بترفع جودة الخطاب الإقناعي في الفرنسية.',
      explanationEn: '"Non seulement... mais également" gives French arguments C1 polish.',
    },
    {
      promptAr: 'بوابة الأسطورة C1: بغض النظر عن الصعوبات، الإتقان الحقيقي يبدأ حين تفكّر باللغة مباشرة.',
      promptEn: '⚔️ French C1 Boss Gate.',
      targetSentence: 'Quels que soient les obstacles, la véritable maîtrise naît lorsqu on pense directement en français.',
      explanationAr: 'Quels que soient + Subjonctif هي قمة الإتقان الفرنسي في بوابة الأسطورة C1!',
      explanationEn: 'C1 Boss Gate: "Quels que soient" + subjunctive is a hallmark of C1 French mastery.',
    },
  ],
  ar: [
    {
      promptAr: 'Over-reliance on AI without critical thinking weakens human creativity. (Formal Modern Standard Arabic)',
      promptEn: 'C1 Formal Rhetoric (MSA): science & technology debate.',
      targetSentence: 'الاعتماد المفرط على الذكاء الاصطناعي دون تفكير نقدي يضعف الإبداع البشري.',
      explanationAr: 'أسلوب فصيح متين للنقاشات العلمية والأكاديمية (Al-itimad al-mufrit ala al-dhaka al-istinai duna tafkir naqdi yudif al-ibda al-bashari).',
      explanationEn: 'Transliteration: "Al-itimad al-mufrit ala al-dhaka al-istinai duna tafkir naqdi yudif al-ibda al-bashari." Formal MSA debate register.',
    },
    {
      promptAr: 'Had we spotted that issue earlier, we would have saved weeks of work. (Register shift: Executive Arabic)',
      promptEn: 'C1 Hypothetical Conditional in polished Arabic.',
      targetSentence: 'لو كنا اكتشفنا الخلل ده بدري، كنا وفرنا أسابيع من الشغل.',
      explanationAr: 'الشرط الماضي في العربية (Law kunna iktashafna el-khalal da badri, kunna waffarna asabee min el-shoghl).',
      explanationEn: 'Transliteration: "Law kunna iktashafna el-khalal da badri, kunna waffarna asabee min el-shoghl."',
    },
    {
      promptAr: 'Of course the train is late on the exact day I have an important interview! (Egyptian Humor & Irony)',
      promptEn: 'C1 Egyptian Sarcasm & Subtle Tone Shift.',
      targetSentence: 'طبعاً القطر لازم يتأخر بالذات يوم المقابلة المهمة!',
      explanationAr: 'استخدام "طبعاً... لازم... بالذات" يعطي نبرة الدعابة المصرية الأصيلة (Taban el-atr lazim yitakhar bil-zat yom el-muqabla el-muhimma!).',
      explanationEn: 'Transliteration: "Taban el-atr lazim yitakhar bil-zat yom el-muqabla el-muhimma!" Classic Egyptian dry humor.',
    },
    {
      promptAr: 'From an economic standpoint, open education delivers the highest return. (Formal Arabic)',
      promptEn: 'C1 Academic & Economic Register (MSA).',
      targetSentence: 'من منظور اقتصادي، الاستثمار في التعليم المفتوح يحقق أعلى عائد مستدام.',
      explanationAr: 'صياغة فصحى عالية للمؤتمرات والمقالات (Min manzur iqtisadi, al-istithmar fil-talim al-maftuh yuhaqqiq ala aid mustadam).',
      explanationEn: 'Transliteration: "Min manzur iqtisadi, al-istithmar fil-talim al-maftuh yuhaqqiq ala aid mustadam."',
    },
    {
      promptAr: 'Not only is the app free, it also works completely offline. (Polished Arabic)',
      promptEn: 'C1 Rhetorical Emphasis in Arabic.',
      targetSentence: 'التطبيق مش بس مجاني، ده كمان بيشتغل بدون إنترنت تماماً.',
      explanationAr: 'تركيب "مش بس... ده كمان" يقابل Not only... but also بطلاقة (El-tatbiq mish bas maggani, da kaman byishtaghal bidun internet tamaman).',
      explanationEn: 'Transliteration: "El-tatbiq mish bas maggani, da kaman byishtaghal bidun internet tamaman."',
    },
    {
      promptAr: '⚔️ C1 Legend Boss Gate: True mastery begins the moment you think directly in Arabic.',
      promptEn: '⚔️ C1 Legend Boss Gate: Formal + Natural Arabic synthesis.',
      targetSentence: 'بغض النظر عن التحديات، الإتقان الحقيقي يبدأ لحظة ما تفكر بالعربي مباشرة.',
      explanationAr: 'بوابة الأسطورة C1! (Bighadd el-nazar an el-tahaddiyat, el-itqan el-haqiqi yibda lahzit ma tifakkar bil-arabi mubasharatan).',
      explanationEn: 'Transliteration: "Bighadd el-nazar an el-tahaddiyat, el-itqan el-haqiqi yibda lahzit ma tifakkar bil-arabi mubasharatan."',
    },
  ],
};

function resolveBankLang(targetLang: TargetLanguage): 'en' | 'de' | 'es' | 'it' | 'fr' | 'ar' | null {
  if (targetLang === 'en' || targetLang === 'de' || targetLang === 'es' || targetLang === 'it' || targetLang === 'fr' || targetLang === 'ar') {
    return targetLang;
  }
  return null;
}

export function getCuratedB2C1Exercises(
  targetLang: TargetLanguage,
  levelId: CefrLevelId,
  unitId: string,
  count: number = 6
): ExerciseItem[] | null {
  if (levelId !== 'B2' && levelId !== 'C1') return null;
  const bankLang = resolveBankLang(targetLang);
  if (!bankLang) return null;

  const bank = levelId === 'B2' ? B2_CURATED_BANK[bankLang] : C1_CURATED_BANK[bankLang];
  if (!bank || bank.length === 0) return null;

  // Deterministic offset per unit so different B2/C1 units start on fresh items
  let hash = 0;
  for (let i = 0; i < unitId.length; i += 1) {
    hash = (hash * 31 + unitId.charCodeAt(i)) % 997;
  }

  const items: ExerciseItem[] = [];
  for (let i = 0; i < count; i += 1) {
    const raw = bank[(hash + i) % bank.length];
    const chips = raw.targetSentence.split(/\s+/).filter(Boolean);
    items.push({
      id: `${unitId}-${levelId.toLowerCase()}-ex-${i + 1}`,
      type: i % 2 === 0 ? 'structure_builder' : 'translate_thought',
      promptAr: raw.promptAr,
      promptEn: raw.promptEn,
      targetSentence: raw.targetSentence,
      acceptableAlternatives: [raw.targetSentence, raw.targetSentence.replace(/[.,!?;:]/g, '')],
      wordChips: chips,
      breakdownChunks: [],
      explanationAr: raw.explanationAr,
      explanationEn: raw.explanationEn,
      skillAxes: levelId === 'C1' ? ['structure', 'speaking', 'writing'] : ['structure', 'vocabulary', 'listening'],
    });
  }

  return items;
}
