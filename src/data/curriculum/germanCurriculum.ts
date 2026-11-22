import { ChunkRole, Exercise, Lesson, Phase, SourceLanguage } from '../../types';

function sourceThought(source: SourceLanguage, ar: string, en: string): string {
  if (source === 'ar' || source === 'arz' || source === 'apc' || source === 'afb' || source === 'ary') return ar;
  return en;
}

const GERMAN_CHIP_ARABIC_GLOSSES: Record<string, string> = {
  'Ich': 'أنا',
  'fange': 'أبدأ',
  'früh': 'مبكراً',
  'mit': 'مع',
  'der': 'الـ (مذكر/مؤنث/محايد)',
  'die': 'الـ',
  'das': 'الـ',
  'Arbeit': 'العمل',
  'an': 'بادئة (أبدأ)',
  'heute': 'اليوم',
  'Heute': 'اليوم',
  'spät': 'متأخراً',
  'trinke': 'أشرب',
  'Kaffee': 'قهوة',
  'Wasser': 'ماء',
  'und': 'و',
  'du': 'أنت',
  'Tee': 'شاي',
  'brauche': 'أحتاج',
  'einen': 'واحد / مفرد',
  'bitte': 'من فضلك',
  'ein': 'واحد / مفرد',
  'rufe': 'أتصل',
  'dich': 'بك',
  'morgen': 'غداً',
  'wir': 'نحن',
  'Wir': 'نحن',
  'Telefon': 'هاتف',
  'jetzt': 'الآن',
  'lieben': 'نحب',
  'Deutschland': 'ألمانيا',
  'Berlin': 'برلين',
  'Hamburg': 'هامبورغ',
  'Land': 'بلد',
  'sehr': 'جداً',
  'ist': 'يكون',
  'schöner': 'جميل',
  'Tag': 'يوم',
  'wohne': 'أعيش',
  'in': 'في',
  'einer': 'واحدة / مفرد',
  'schönen': 'جميلة',
  'Stadt': 'مدينة',
  'Dorf': 'قرية',
  'Haus': 'منزل',
  'kleinen': 'صغيرة',
  'essen': 'نأكل',
  'frisches': 'طازج',
  'Brot': 'خبز',
  'Wetter': 'الطقس',
  'warm': 'دافئ',
  'kalt': 'بارد',
  'gut': 'جيد',
  'Der': 'الـ',
  'Bahnhof': 'محطة القطار',
  'nah': 'قريب',
  'weit': 'بعيد',
  'hier': 'هنا',
  'dort': 'هناك',
  'Wo': 'أين',
  'kann': 'يمكنني',
  'ich': 'أنا',
  'Ticket': 'تذكرة',
  'kaufen': 'شراء',
  'kaufen?': 'شراء',
  'Bus': 'حافلة',
  'Bahn': 'قطار',
  'Zug': 'القطار',
  'kommt': 'يصل',
  'pünktlich': 'في الموعد',
  'wünsche': 'أتمنى',
  'dir': 'لك',
  'eine': 'واحدة / مفرد',
  'gute': 'جيدة',
  'Reise': 'رحلة',
  'Fahrt': 'رحلة',
  'Mein': 'خاصتي',
  'Meine': 'خاصتي',
  'Freund': 'صديق',
  'wohnt': 'يعيش',
  'Familie': 'عائلة',
  'groß': 'كبيرة',
  'nett': 'لطيفة',
  'klein': 'صغيرة',
  'treffen': 'نلتقي',
  'uns': 'أنفسنا',
  'jedes': 'كل',
  'Wochenende': 'نهاية الأسبوع',
  'oft': 'غالباً',
  'Bruder': 'أخي',
  'arbeitet': 'يعمل',
  'Firma': 'شركة',
  'Schule': 'مدرسة',
  'Unser': 'خاصتنا',
  'Treffen': 'اجتماعنا',
  'beginnt': 'يبدأ',
  'später': 'لاحقاً',
  'schreibe': 'أكتب',
  'E-Mail': 'بريد إلكتروني',
  'Brief': 'رسالة',
  'Nachricht': 'رسالة',
  'beenden': 'ننهي',
  'Das': 'الـ',
  'Restaurant': 'مطعم',
  'bietet': 'يقدم',
  'leckeres': 'لذيذ',
  'Essen': 'طعام',
  'Garten': 'حديقة',
  'möchte': 'أريد',
  'Tisch': 'طاولة',
  'für': 'لـ / لأجل',
  'zwei': 'شخصين',
  'reservieren': 'حجز',
  'Die': 'الـ',
  'Rechnung': 'فاتورة',
  'danke': 'شكراً',
  'Karte': 'بطاقة',
  'Geld': 'نقود',
  'war': 'كان',
  'lecker': 'لذيذ',
  'Wie': 'كم',
  'viel': 'كثير',
  'kostet': 'يكلف',
  'dieses': 'هذا',
  'Dieser': 'هذا',
  'Hemd': 'قميص',
  'Hemd?': 'قميص',
  'Hose': 'بنطال',
  'Schuh': 'حذاء',
  'bezahlen': 'دفع',
  'Bargeld': 'نقد',
  'Euro': 'يورو',
  'Geschäft': 'متجر',
  'bis': 'حتى',
  'abends': 'المساء',
  'geöffnet': 'مفتوح',
  'offen': 'مفتوح',
  'Preis': 'سعر',
  'teuer': 'غالٍ',
  'billig': 'رخيص',
  'sehe': 'أرى',
  'den': 'الـ',
  'Mann': 'الرجل',
  'auf': 'على',
  'Straße': 'شارع',
  'kaufe': 'أشتري',
  'frischen': 'طازجة',
  'Apfel': 'تفاحة',
  'Er': 'هو',
  'liest': 'يقرأ',
  'neues': 'جديد',
  'Buch': 'كتاب',
  'Zeitung': 'جريدة',
  'helfen': 'نساعد',
  'dem': 'الـ',
  'alten': 'القديم',
  'Frau': 'امرأة',
  'bin': 'أكون',
  'kürzlich': 'مؤخراً',
  'nach': 'إلى',
  'gereist': 'سافرت',
  'Wien': 'فيينا',
  'habe': 'عندي',
  'süßen': 'حلوة',
  'gegessen': 'أكلت',
  'Weil': 'لأن',
  'fleißig': 'بجدية',
  'Deutsch': 'الألمانية',
  'lerne': 'أتعلم',
  'dass': 'أن',
  'obwohl': 'بالرغم من',
  'weiß': 'أعلم',
  'weiß,': 'أعلم',
  'Idee': 'فكرة',
  'verstehst': 'تفهم'
};

export function getGermanPhases(source: SourceLanguage): Phase[] {
  const isAr = source === 'ar' || source === 'arz' || source === 'apc' || source === 'afb' || source === 'ary';

  const p1l1Exercises: Exercise[] = [
    {
      id: 'de-ex-1-1-1',
      arabicThought: 'اليوم أشرب قهوة',
      englishTarget: 'Heute trinke ich Kaffee',
      sourceThought: sourceThought(source, 'اليوم أشرب قهوة', 'Today I am drinking coffee'),
      targetSentence: 'Heute trinke ich Kaffee',
      acceptableAlternatives: ['heute trinke ich kaffee', 'ich trinke heute kaffee', 'ich trinke kaffee heute'],
      wordChips: ['Heute', 'trinke', 'ich', 'Kaffee', 'und', 'du', 'Tee'],
      breakdownChunks: [
        { arabicText: 'اليوم', englishText: 'today', sourceText: isAr ? 'اليوم' : 'today', targetText: 'Heute', role: 'connector' as ChunkRole, explanation: 'Adverb' },
        { arabicText: 'أشرب', englishText: 'drink', sourceText: isAr ? 'أشرب' : 'drink', targetText: 'trinke', role: 'verb' as ChunkRole, explanation: 'Verb V2' },
        { arabicText: 'أنا', englishText: 'I', sourceText: isAr ? 'أنا' : 'I', targetText: 'ich', role: 'subject' as ChunkRole, explanation: 'Subject pronoun' },
        { arabicText: 'قهوة', englishText: 'coffee', sourceText: isAr ? 'قهوة' : 'coffee', targetText: 'Kaffee', role: 'object' as ChunkRole, explanation: 'Noun' },
        { arabicText: 'ماء', englishText: 'water', sourceText: isAr ? 'ماء' : 'water', targetText: 'Wasser', role: 'object' as ChunkRole, explanation: 'Noun' },
        { arabicText: 'و', englishText: 'and', sourceText: isAr ? 'و' : 'and', targetText: 'und', role: 'connector' as ChunkRole, explanation: 'Conjunction' },
        { arabicText: 'أنت', englishText: 'you', sourceText: isAr ? 'أنت' : 'you', targetText: 'du', role: 'subject' as ChunkRole, explanation: 'Pronoun' },
        { arabicText: 'شاي', englishText: 'tea', sourceText: isAr ? 'شاي' : 'tea', targetText: 'Tee', role: 'object' as ChunkRole, explanation: 'Noun' }
      ],
      habitHint: 'قاعدة V2 بالألمانية.',
      explanationAr: 'عند البدء بظرف مثل Heute (اليوم)، يأتي الفعل trinke مباشرة في المركز الثاني (V2)، ثم الفاعل ich.',
      explanationEn: 'When starting with an adverb like Heute, the verb trinke comes in position 2 (V2), followed by subject ich.'
    },
    {
      id: 'de-ex-1-1-2',
      arabicThought: 'أنا أحتاج إلى قهوة',
      englishTarget: 'Ich brauche einen Kaffee',
      sourceThought: sourceThought(source, 'أنا أحتاج إلى قهوة', 'I need a coffee'),
      targetSentence: 'Ich brauche einen Kaffee',
      acceptableAlternatives: ['ich brauche einen kaffee'],
      wordChips: ['Ich', 'brauche', 'einen', 'Kaffee', 'bitte', 'Tee', 'Wasser', 'ein'],
      breakdownChunks: [
        { arabicText: 'أنا', englishText: 'I', sourceText: isAr ? 'أنا' : 'I', targetText: 'Ich', role: 'subject' as ChunkRole, explanation: 'Subject pronoun' },
        { arabicText: 'أحتاج', englishText: 'need', sourceText: isAr ? 'أحتاج' : 'need', targetText: 'brauche', role: 'verb' as ChunkRole, explanation: 'Verb brauchten' },
        { arabicText: 'واحد / مفرد', englishText: 'a', sourceText: isAr ? 'أداة مفرد مذكر' : 'a', targetText: 'einen', role: 'modifier', explanation: 'Accusative masculine article' },
        { arabicText: 'قهوة', englishText: 'coffee', sourceText: isAr ? 'قهوة' : 'coffee', targetText: 'Kaffee', role: 'object' as ChunkRole, explanation: 'Noun' },
        { arabicText: 'من فضلك', englishText: 'please', sourceText: isAr ? 'من فضلك' : 'please', targetText: 'bitte', role: 'modifier', explanation: 'Polite' },
        { arabicText: 'شاي', englishText: 'tea', sourceText: isAr ? 'شاي' : 'tea', targetText: 'Tee', role: 'object' as ChunkRole, explanation: 'Noun' },
        { arabicText: 'ماء', englishText: 'water', sourceText: isAr ? 'ماء' : 'water', targetText: 'Wasser', role: 'object' as ChunkRole, explanation: 'Noun' },
        { arabicText: 'واحد / مفرد', englishText: 'a', sourceText: isAr ? 'أداة' : 'a', targetText: 'ein', role: 'modifier', explanation: 'Article' }
      ],
      habitHint: 'النصب بالألمانية (Akkusativ).',
      explanationAr: 'كلمة Kaffee مذكر، وفي حالة النصب (Akkusativ) تأخذ أداة المنصوب einen.',
      explanationEn: 'Kaffee is masculine, taking accusative article einen.'
    },
    {
      id: 'de-ex-1-1-3',
      arabicThought: 'سأتصل بك غداً',
      englishTarget: 'Ich rufe dich morgen an',
      sourceThought: sourceThought(source, 'سأتصل بك غداً', 'I will call you tomorrow'),
      targetSentence: 'Ich rufe dich morgen an',
      acceptableAlternatives: ['ich rufe dich morgen an'],
      wordChips: ['Ich', 'rufe', 'dich', 'morgen', 'an', 'heute', 'wir', 'Telefon', 'jetzt'],
      breakdownChunks: [
        { arabicText: 'أنا', englishText: 'I', sourceText: isAr ? 'أنا' : 'I', targetText: 'Ich', role: 'subject' as ChunkRole, explanation: 'Subject pronoun' },
        { arabicText: 'أتصل', englishText: 'call', sourceText: isAr ? 'أتصل' : 'call', targetText: 'rufe ... an', role: 'verb' as ChunkRole, explanation: 'Separable verb anrufen' },
        { arabicText: 'أتصل', englishText: 'call', sourceText: isAr ? 'أتصل' : 'call', targetText: 'rufe', role: 'verb' as ChunkRole, explanation: 'Verb root' },
        { arabicText: 'بك', englishText: 'you', sourceText: isAr ? 'بك' : 'you', targetText: 'dich', role: 'object' as ChunkRole, explanation: 'Accusative pronoun' },
        { arabicText: 'غداً', englishText: 'tomorrow', sourceText: isAr ? 'غداً' : 'tomorrow', targetText: 'morgen', role: 'connector' as ChunkRole, explanation: 'Adverb' },
        { arabicText: 'بادئة (أبدأ)', englishText: 'prefix', sourceText: isAr ? 'بادئة (أبدأ)' : 'prefix', targetText: 'an', role: 'verb' as ChunkRole, explanation: 'Separable prefix' },
        { arabicText: 'اليوم', englishText: 'today', sourceText: isAr ? 'اليوم' : 'today', targetText: 'heute', role: 'connector' as ChunkRole, explanation: 'Adverb' },
        { arabicText: 'نحن', englishText: 'we', sourceText: isAr ? 'نحن' : 'we', targetText: 'wir', role: 'subject' as ChunkRole, explanation: 'Pronoun' },
        { arabicText: 'هاتف', englishText: 'phone', sourceText: isAr ? 'هاتف' : 'phone', targetText: 'Telefon', role: 'object' as ChunkRole, explanation: 'Noun' },
        { arabicText: 'الآن', englishText: 'now', sourceText: isAr ? 'الآن' : 'now', targetText: 'jetzt', role: 'connector' as ChunkRole, explanation: 'Adverb' }
      ],
      habitHint: 'الأفعال المنفصلة (Trennbares Verb).',
      explanationAr: 'الفعل anrufen فعل منفصل (Trennbares Verb): الجزء الأول rufe يأتي ثانياً، والبادئة an تذهب إلى نهاية الجملة.',
      explanationEn: 'anrufen is a separable verb: main part rufe takes position 2, prefix an goes to the end.'
    },
    {
      id: 'de-ex-1-1-4',
      arabicThought: 'نحن نحب ألمانيا',
      englishTarget: 'Wir lieben Deutschland',
      sourceThought: sourceThought(source, 'نحن نحب ألمانيا', 'We love Germany'),
      targetSentence: 'Wir lieben Deutschland',
      acceptableAlternatives: ['wir lieben deutschland'],
      wordChips: ['Wir', 'lieben', 'Deutschland', 'Berlin', 'Hamburg', 'Land', 'sehr'],
      breakdownChunks: [
        { arabicText: 'نحن', englishText: 'we', sourceText: isAr ? 'نحن' : 'we', targetText: 'Wir', role: 'subject' as ChunkRole, explanation: 'Pronoun' },
        { arabicText: 'نحب', englishText: 'love', sourceText: isAr ? 'نحب' : 'love', targetText: 'lieben', role: 'verb' as ChunkRole, explanation: 'Verb' },
        { arabicText: 'ألمانيا', englishText: 'Germany', sourceText: isAr ? 'ألمانيا' : 'Germany', targetText: 'Deutschland', role: 'object' as ChunkRole, explanation: 'Proper noun' },
        { arabicText: 'برلين', englishText: 'Berlin', sourceText: isAr ? 'برلين' : 'Berlin', targetText: 'Berlin', role: 'object' as ChunkRole, explanation: 'Noun' },
        { arabicText: 'هامبورغ', englishText: 'Hamburg', sourceText: isAr ? 'هامبورغ' : 'Hamburg', targetText: 'Hamburg', role: 'object' as ChunkRole, explanation: 'Noun' },
        { arabicText: 'بلد', englishText: 'country', sourceText: isAr ? 'بلد' : 'country', targetText: 'Land', role: 'object' as ChunkRole, explanation: 'Noun' },
        { arabicText: 'جداً', englishText: 'very', sourceText: isAr ? 'جداً' : 'very', targetText: 'sehr', role: 'modifier', explanation: 'Adverb' }
      ],
      habitHint: 'تصريف الأفعال مع Wir.',
      explanationAr: 'مع الضمير Wir (نحن) ينتهي الفعل بالأحرف en مثل lieben.',
      explanationEn: 'With subject pronoun Wir, verbs take the ending -en like lieben.'
    }
  ];

  const phase1Lessons: Lesson[] = [];
  const p1Titles = [
    { title: 'Everyday Greetings & V2 Order', titleAr: 'التحيات والتعارف اليومي وقاعدة V2' },
    { title: 'Ordering & Daily Expressions', titleAr: 'الطلب والتعبير اليومي' },
    { title: 'Travel & Directions', titleAr: 'السفر والاتجاهات' },
    { title: 'Family & Friends', titleAr: 'العائلة والأصدقاء' },
    { title: 'Work & Daily Routines', titleAr: 'العمل والروتين اليومي' },
    { title: 'Food & Restaurants', titleAr: 'الطعام والمطاعم' },
    { title: 'Shopping & Prices', titleAr: 'التسوق والأسعار' }
  ];

  const GermanPrompts: Array<Array<{ ar: string; en: string; sentence: string; chips: string[]; alternatives?: string[] }>> = [
    [
      { ar: 'اليوم هو يوم مشرق', en: 'Heute ist ein schöner Tag', sentence: 'Heute ist ein schöner Tag', chips: ['Heute', 'ist', 'ein', 'schöner', 'Tag', 'gut', 'sehr', 'kalt'], alternatives: ['heute ist ein schöner tag', 'heute ist auch ein schöner tag'] },
      { ar: 'أنا أعيش في مدينة جميلة', en: 'Ich wohne in einer schönen Stadt', sentence: 'Ich wohne in einer schönen Stadt', chips: ['Ich', 'wohne', 'in', 'einer', 'schönen', 'Stadt', 'Dorf', 'Haus', 'kleinen'] },
      { ar: 'نحن نأكل الخبز الطازج', en: 'Wir essen frisches Brot', sentence: 'Wir essen frisches Brot', chips: ['Wir', 'essen', 'frisches', 'Brot', 'Kaffee', 'Wasser', 'heute'] },
      { ar: 'الطقس دافئ للغاية اليوم', en: 'Das Wetter ist heute sehr warm', sentence: 'Das Wetter ist heute sehr warm', chips: ['Das', 'Wetter', 'ist', 'heute', 'sehr', 'warm', 'kalt', 'gut'] }
    ],
    [
      { ar: 'محطة القطار قريبة جداً', en: 'Der Bahnhof ist sehr nah', sentence: 'Der Bahnhof ist sehr nah', chips: ['Der', 'Bahnhof', 'ist', 'sehr', 'nah', 'weit', 'hier', 'dort'] },
      { ar: 'أين يمكنني شراء تذكرة؟', en: 'Wo kann ich ein Ticket kaufen?', sentence: 'Wo kann ich ein Ticket kaufen?', chips: ['Wo', 'kann', 'ich', 'ein', 'Ticket', 'kaufen?', 'Bus', 'Bahn'] },
      { ar: 'القطار يصل في الموعد', en: 'Der Zug kommt pünktlich an', sentence: 'Der Zug kommt pünktlich an', chips: ['Der', 'Zug', 'kommt', 'pünktlich', 'an', 'spät', 'heute', 'jetzt'] },
      { ar: 'أتمنى لك رحلة سعيدة', en: 'Ich wünsche dir eine gute Reise', sentence: 'Ich wünsche dir eine gute Reise', chips: ['Ich', 'wünsche', 'dir', 'eine', 'gute', 'Reise', 'Fahrt', 'sehr'] }
    ],
    [
      { ar: 'صديقي يعيش هنا', en: 'Mein Freund wohnt hier', sentence: 'Mein Freund wohnt hier', chips: ['Mein', 'Freund', 'wohnt', 'hier', 'dort', 'Stadt', 'Familie', 'gut'] },
      { ar: 'عائلتي كبيرة ولطيفة', en: 'Meine Familie ist groß und nett', sentence: 'Meine Familie ist groß und nett', chips: ['Meine', 'Familie', 'ist', 'groß', 'und', 'nett', 'klein', 'sehr'] },
      { ar: 'نحن نلتقي كل نهاية أسبوع', en: 'Wir treffen uns jedes Wochenende', sentence: 'Wir treffen uns jedes Wochenende', chips: ['Wir', 'treffen', 'uns', 'jedes', 'Wochenende', 'heute', 'oft', 'hier'] },
      { ar: 'أخي يعمل في الشركة', en: 'Mein Bruder arbeitet in der Firma', sentence: 'Mein Bruder arbeitet in der Firma', chips: ['Mein', 'Bruder', 'arbeitet', 'in', 'der', 'Firma', 'Schule', 'heute'] }
    ],
    [
      { ar: 'أنا أبدأ العمل مبكراً', en: 'Ich fange früh mit der Arbeit an', sentence: 'Ich fange früh mit der Arbeit an', chips: ['Ich', 'fange', 'früh', 'mit', 'der', 'Arbeit', 'an', 'spät', 'heute'] },
      { ar: 'اجتماعنا يبدأ الآن', en: 'Unser Treffen beginnt jetzt', sentence: 'Unser Treffen beginnt jetzt', chips: ['Unser', 'Treffen', 'beginnt', 'jetzt', 'heute', 'später', 'hier'] },
      { ar: 'أنا أكتب بريداً إلكترونياً', en: 'Ich schreibe eine E-Mail', sentence: 'Ich schreibe eine E-Mail', chips: ['Ich', 'schreibe', 'eine', 'E-Mail', 'Brief', 'Nachricht', 'heute'] },
      { ar: 'نحن ننهي العمل على الموعد', en: 'Wir beenden die Arbeit pünktlich', sentence: 'Wir beenden die Arbeit pünktlich', chips: ['Wir', 'beenden', 'die', 'Arbeit', 'pünktlich', 'heute', 'früh', 'jetzt'] }
    ],
    [
      { ar: 'المطعم يقدم طعاماً لذيذاً', en: 'Das Restaurant bietet leckeres Essen', sentence: 'Das Restaurant bietet leckeres Essen', chips: ['Das', 'Restaurant', 'bietet', 'leckeres', 'Essen', 'Kaffee', 'Garten', 'gut'], alternatives: ['das restaurant bietet leckeres essen', 'das restaurant bietet gutes essen'] },
      { ar: 'أريد حجز طاولة لشخصين', en: 'Ich möchte einen Tisch für zwei reservieren', sentence: 'Ich möchte einen Tisch für zwei reservieren', chips: ['Ich', 'möchte', 'einen', 'Tisch', 'für', 'zwei', 'reservieren', 'heute'] },
      { ar: 'الفاتورة من فضلك', en: 'Die Rechnung bitte', sentence: 'Die Rechnung bitte', chips: ['Die', 'Rechnung', 'bitte', 'danke', 'Karte', 'Geld', 'hier'] },
      { ar: 'الطعام كان ممتازاً جداً', en: 'Das Essen war sehr gut', sentence: 'Das Essen war sehr gut', chips: ['Das', 'Essen', 'war', 'sehr', 'gut', 'lecker', 'warm', 'heute'] }
    ],
    [
      { ar: 'كم سعر هذا القميص؟', en: 'Wie viel kostet dieses Hemd?', sentence: 'Wie viel kostet dieses Hemd?', chips: ['Wie', 'viel', 'kostet', 'dieses', 'Hemd?', 'Hose', 'Schuh', 'heute'] },
      { ar: 'أريد الدفع بالبطاقة', en: 'Ich möchte mit Karte bezahlen', sentence: 'Ich möchte mit Karte bezahlen', chips: ['Ich', 'möchte', 'mit', 'Karte', 'bezahlen', 'Bargeld', 'Euro', 'hier'] },
      { ar: 'المتجر مفتوح حتى المساء', en: 'Das Geschäft ist bis abends geöffnet', sentence: 'Das Geschäft ist bis abends geöffnet', chips: ['Das', 'Geschäft', 'ist', 'bis', 'abends', 'geöffnet', 'offen', 'heute'] },
      { ar: 'هذا السعر مناسب جداً', en: 'Dieser Preis ist sehr gut', sentence: 'Dieser Preis ist sehr gut', chips: ['Dieser', 'Preis', 'ist', 'sehr', 'gut', 'teuer', 'billig', 'hier'] }
    ]
  ];

  for (let i = 1; i <= 7; i++) {
    let exList: Exercise[] = p1l1Exercises;
    if (i > 1) {
      const promptGroup = GermanPrompts[i - 2];
      exList = promptGroup.map((item, idx) => ({
        id: `de-ex-1-${i}-${idx+1}`,
        arabicThought: item.ar,
        englishTarget: item.en,
        sourceThought: sourceThought(source, item.ar, item.en),
        targetSentence: item.sentence,
        acceptableAlternatives: item.alternatives ?? [item.sentence.toLowerCase()],
        wordChips: item.chips,
        breakdownChunks: item.chips.map(c => {
          const arGloss = GERMAN_CHIP_ARABIC_GLOSSES[c] || GERMAN_CHIP_ARABIC_GLOSSES[c.replace(/[?,.!]/g, '')] || c;
          return {
            arabicText: isAr ? arGloss : c,
            englishText: c,
            sourceText: isAr ? arGloss : c,
            targetText: c,
            role: 'modifier' as ChunkRole,
            explanation: 'German vocabulary'
          };
        }),
        habitHint: 'قاعدة الفعل V2.',
        explanationAr: 'الفعل يتبع قاعدة V2 في الجمل الألمانية.',
        explanationEn: 'The verb follows V2 word order rule in German.'
      }));
    }

    phase1Lessons.push({
      id: `de-p1-l${i}`,
      phaseId: 1,
      phaseTitle: 'Phase 1: Der Satzbau & Die V2-Regel',
      phaseLevel: 'A1',
      number: i,
      title: `Lesson ${i}: ${p1Titles[i-1].title}`,
      titleAr: `الدرس ${i}: ${p1Titles[i-1].titleAr}`,
      transferConcept: 'Master German word order and the V2 verb rule.',
      transferConceptAr: 'إتقان مكان الفعل الثاني V2 في الجملة الألمانية.',
      weakSpotTag: 'german-v2-rule',
      exercises: exList
    });
  }

  const phase2Lessons: Lesson[] = [];
  for (let i = 8; i <= 14; i++) {
    phase2Lessons.push({
      id: `de-p2-l${i}`,
      phaseId: 2,
      phaseTitle: 'Phase 2: Die Fälle (Akkusativ & Dativ)',
      phaseLevel: 'A2',
      number: i,
      title: `Lesson ${i}: Accusative & Cases`,
      titleAr: `الدرس ${i}: حالات الإعراب والنصب والجر`,
      transferConcept: 'Master noun cases and article changes in German.',
      transferConceptAr: 'إتقان الحالات الإعرابية وتغير أدوات التعريف.',
      weakSpotTag: 'german-accusative',
      exercises: [
        {
          id: `de-ex-2-${i}-1`,
          arabicThought: 'أنا أرى الرجل في الشارع',
          englishTarget: 'Ich sehe den Mann auf der Straße',
          sourceThought: sourceThought(source, 'أنا أرى الرجل في الشارع', 'I see the man on the street'),
          targetSentence: 'Ich sehe den Mann auf der Straße',
          acceptableAlternatives: ['ich sehe den mann auf der strasse'],
          wordChips: ['Ich', 'sehe', 'den', 'Mann', 'auf', 'der', 'Straße', 'heute', 'dort'],
          breakdownChunks: ['Ich', 'sehe', 'den', 'Mann', 'auf', 'der', 'Straße', 'heute', 'dort'].map(c => {
            const arGloss = GERMAN_CHIP_ARABIC_GLOSSES[c] || GERMAN_CHIP_ARABIC_GLOSSES[c.replace(/[?,.!]/g, '')] || c;
            return { arabicText: isAr ? arGloss : c, englishText: c, sourceText: isAr ? arGloss : c, targetText: c, role: 'modifier' as ChunkRole, explanation: 'Case' };
          }),
          habitHint: 'النصب (Akkusativ).',
          explanationAr: 'في حالة النصب تتحول أداة المذكر der إلى den.',
          explanationEn: 'In accusative case, masculine article der becomes den.'
        },
        {
          id: `de-ex-2-${i}-2`,
          arabicThought: 'أنا أشتري تفاحة طازجة',
          englishTarget: 'Ich kaufe einen frischen Apfel',
          sourceThought: sourceThought(source, 'أنا أشتري تفاحة طازجة', 'I buy a fresh apple'),
          targetSentence: 'Ich kaufe einen frischen Apfel',
          acceptableAlternatives: ['ich kaufe einen frischen apfel'],
          wordChips: ['Ich', 'kaufe', 'einen', 'frischen', 'Apfel', 'Wasser', 'Banane', 'heute'],
          breakdownChunks: ['Ich', 'kaufe', 'einen', 'frischen', 'Apfel', 'Wasser', 'Banane', 'heute'].map(c => {
            const arGloss = GERMAN_CHIP_ARABIC_GLOSSES[c] || GERMAN_CHIP_ARABIC_GLOSSES[c.replace(/[?,.!]/g, '')] || c;
            return { arabicText: isAr ? arGloss : c, englishText: c, sourceText: isAr ? arGloss : c, targetText: c, role: 'modifier' as ChunkRole, explanation: 'Accusative' };
          }),
          habitHint: 'النصب للمذكر (einen).',
          explanationAr: 'كلمة Apfel مذكر وتأخذ einen في حالة النصب.',
          explanationEn: 'Apfel is masculine and takes einen in accusative.'
        },
        {
          id: `de-ex-2-${i}-3`,
          arabicThought: 'هو يقرأ كتاباً جديداً',
          englishTarget: 'Er liest ein neues Buch',
          sourceThought: sourceThought(source, 'هو يقرأ كتاباً جديداً', 'He reads a new book'),
          targetSentence: 'Er liest ein neues Buch',
          acceptableAlternatives: ['er liest ein neues buch'],
          wordChips: ['Er', 'liest', 'ein', 'neues', 'Buch', 'Zeitung', 'Brief', 'heute'],
          breakdownChunks: ['Er', 'liest', 'ein', 'neues', 'Buch', 'Zeitung', 'Brief', 'heute'].map(c => {
            const arGloss = GERMAN_CHIP_ARABIC_GLOSSES[c] || GERMAN_CHIP_ARABIC_GLOSSES[c.replace(/[?,.!]/g, '')] || c;
            return { arabicText: isAr ? arGloss : c, englishText: c, sourceText: isAr ? arGloss : c, targetText: c, role: 'modifier' as ChunkRole, explanation: 'Accusative' };
          }),
          habitHint: 'النصب للمحايد (ein).',
          explanationAr: 'كلمة Buch محايدة وتأخذ ein في حالة النصب.',
          explanationEn: 'Buch is neutral and takes ein in accusative.'
        },
        {
          id: `de-ex-2-${i}-4`,
          arabicThought: 'نحن نساعد الصديق القديم',
          englishTarget: 'Wir helfen dem alten Freund',
          sourceThought: sourceThought(source, 'نحن نساعد الصديق القديم', 'We help the old friend'),
          targetSentence: 'Wir helfen dem alten Freund',
          acceptableAlternatives: ['wir helfen dem alten freund'],
          wordChips: ['Wir', 'helfen', 'dem', 'alten', 'Freund', 'Mann', 'Frau', 'sehr'],
          breakdownChunks: ['Wir', 'helfen', 'dem', 'alten', 'Freund', 'Mann', 'Frau', 'sehr'].map(c => {
            const arGloss = GERMAN_CHIP_ARABIC_GLOSSES[c] || GERMAN_CHIP_ARABIC_GLOSSES[c.replace(/[?,.!]/g, '')] || c;
            return { arabicText: isAr ? arGloss : c, englishText: c, sourceText: isAr ? arGloss : c, targetText: c, role: 'modifier' as ChunkRole, explanation: 'Dative' };
          }),
          habitHint: 'حالة الجر (Dativ).',
          explanationAr: 'الفعل helfen يأخذ حالة الجر (Dativ): der Freund -> dem Freund.',
          explanationEn: 'The verb helfen takes Dative case: der Freund -> dem Freund.'
        }
      ]
    });
  }

  const phase3Lessons: Lesson[] = [];
  for (let i = 15; i <= 21; i++) {
    phase3Lessons.push({
      id: `de-p3-l${i}`,
      phaseId: 3,
      phaseTitle: 'Phase 3: Perfekt & Nebensätze',
      phaseLevel: 'B1',
      number: i,
      title: `Lesson ${i}: Past & Complex Sentences`,
      titleAr: `الدرس ${i}: الماضي والجمل المركبة`,
      transferConcept: 'Master Perfekt tense and subordinate clauses.',
      transferConceptAr: 'إتقان الماضي المركب والجمل الفرعية.',
      weakSpotTag: 'german-perfekt',
      exercises: [
        {
          id: `de-ex-3-${i}-1`,
          arabicThought: 'لقد سافرت إلى برلين مؤخراً',
          englishTarget: 'Ich bin kürzlich nach Berlin gereist',
          sourceThought: sourceThought(source, 'لقد سافرت إلى برلين مؤخراً', 'I recently traveled to Berlin'),
          targetSentence: 'Ich bin kürzlich nach Berlin gereist',
          acceptableAlternatives: ['ich bin kuerzlich nach berlin gereist', 'ich bin kürzlich nach berlin gereist'],
          wordChips: ['Ich', 'bin', 'kürzlich', 'nach', 'Berlin', 'gereist', 'Wien', 'heute'],
          breakdownChunks: ['Ich', 'bin', 'kürzlich', 'nach', 'Berlin', 'gereist', 'Wien', 'heute'].map(c => {
            const arGloss = GERMAN_CHIP_ARABIC_GLOSSES[c] || GERMAN_CHIP_ARABIC_GLOSSES[c.replace(/[?,.!]/g, '')] || c;
            return { arabicText: isAr ? arGloss : c, englishText: c, sourceText: isAr ? arGloss : c, targetText: c, role: 'modifier' as ChunkRole, explanation: 'Perfekt' };
          }),
          habitHint: 'الماضي المركب (Perfekt).',
          explanationAr: 'أفعال الحركة تأخذ الفعل المساعد sein في الماضي (Perfekt).',
          explanationEn: 'Movement verbs take auxiliary sein in Perfekt past tense.'
        },
        {
          id: `de-ex-3-${i}-2`,
          arabicThought: 'لقد أكلت تفاحة حلوة',
          englishTarget: 'Ich habe einen süßen Apfel gegessen',
          sourceThought: sourceThought(source, 'لقد أكلت تفاحة حلوة', 'I ate a sweet apple'),
          targetSentence: 'Ich habe einen süßen Apfel gegessen',
          acceptableAlternatives: ['ich habe einen suessen apfel gegessen', 'ich habe einen süßen apfel gegessen'],
          wordChips: ['Ich', 'habe', 'einen', 'süßen', 'Apfel', 'gegessen', 'Wasser', 'heute'],
          breakdownChunks: ['Ich', 'habe', 'einen', 'süßen', 'Apfel', 'gegessen', 'Wasser', 'heute'].map(c => {
            const arGloss = GERMAN_CHIP_ARABIC_GLOSSES[c] || GERMAN_CHIP_ARABIC_GLOSSES[c.replace(/[?,.!]/g, '')] || c;
            return { arabicText: isAr ? arGloss : c, englishText: c, sourceText: isAr ? arGloss : c, targetText: c, role: 'modifier' as ChunkRole, explanation: 'Perfekt' };
          }),
          habitHint: 'الماضي مع haben.',
          explanationAr: 'معظم الأفعال تأخذ الفعل المساعد haben وينتهي التصريف بـ gegessen.',
          explanationEn: 'Most verbs take auxiliary haben with Partizip II gegessen.'
        },
        {
          id: `de-ex-3-${i}-3`,
          arabicThought: 'لأنني أتعلم الألمانية بجدية',
          englishTarget: 'Weil ich fleißig Deutsch lerne',
          sourceThought: sourceThought(source, 'لأنني أتعلم الألمانية بجدية', 'Because I seriously learn German'),
          targetSentence: 'Weil ich fleißig Deutsch lerne',
          acceptableAlternatives: ['weil ich fleissig deutsch lerne', 'weil ich fleißig deutsch lerne'],
          wordChips: ['Weil', 'ich', 'fleißig', 'Deutsch', 'lerne', 'dass', 'obwohl', 'sehr'],
          breakdownChunks: ['Weil', 'ich', 'fleißig', 'Deutsch', 'lerne', 'dass', 'obwohl', 'sehr'].map(c => {
            const arGloss = GERMAN_CHIP_ARABIC_GLOSSES[c] || GERMAN_CHIP_ARABIC_GLOSSES[c.replace(/[?,.!]/g, '')] || c;
            return { arabicText: isAr ? arGloss : c, englishText: c, sourceText: isAr ? arGloss : c, targetText: c, role: 'modifier' as ChunkRole, explanation: 'Subordinate' };
          }),
          habitHint: 'جملة Weil الفرعية.',
          explanationAr: 'أداة الربط Weil تقوم بطرد الفعل المصرف lerne إلى نهاية الجملة تماماً.',
          explanationEn: 'The conjunction Weil pushes the conjugated verb lerne to the end.'
        },
        {
          id: `de-ex-3-${i}-4`,
          arabicThought: 'أنا أعلم أنك تفهم الفكرة',
          englishTarget: 'Ich weiß, dass du die Idee verstehst',
          sourceThought: sourceThought(source, 'أنا أعلم أنك تفهم الفكرة', 'I know that you understand the idea'),
          targetSentence: 'Ich weiß, dass du die Idee verstehst',
          acceptableAlternatives: ['ich weiß, dass du die idee verstehst', 'ich weiss, dass du die idee verstehst'],
          wordChips: ['Ich', 'weiß,', 'dass', 'du', 'die', 'Idee', 'verstehst', 'gut'],
          breakdownChunks: ['Ich', 'weiß,', 'dass', 'du', 'die', 'Idee', 'verstehst', 'gut'].map(c => {
            const arGloss = GERMAN_CHIP_ARABIC_GLOSSES[c] || GERMAN_CHIP_ARABIC_GLOSSES[c.replace(/[?,.!]/g, '')] || c;
            return { arabicText: isAr ? arGloss : c, englishText: c, sourceText: isAr ? arGloss : c, targetText: c, role: 'modifier' as ChunkRole, explanation: 'Subordinate' };
          }),
          habitHint: 'جملة dass الفرعية.',
          explanationAr: 'أداة الربط dass تطرد الفعل المصرف verstehst إلى آخر الجملة الفرعية.',
          explanationEn: 'The conjunction dass sends the conjugated verb verstehst to the end.'
        }
      ]
    });
  }

  return [
    { id: 1, title: 'Phase 1: Der Satzbau & Die V2-Regel', titleAr: 'المرحلة ١: بنية الجملة وقاعدة الفعل الثاني', level: 'A1', tagline: 'V2 Rule & Core Sentences', lessons: phase1Lessons },
    { id: 2, title: 'Phase 2: Die Fälle (Akkusativ & Dativ)', titleAr: 'المرحلة ٢: حالات الإعراب والنصب والجر', level: 'A2', tagline: 'Accusative & Articles', lessons: phase2Lessons },
    { id: 3, title: 'Phase 3: Perfekt & Nebensätze', titleAr: 'المرحلة ٣: الماضي المركب والجمل الفرعية', level: 'B1', tagline: 'Past Tense & Subordinate Clauses', lessons: phase3Lessons }
  ];
}
