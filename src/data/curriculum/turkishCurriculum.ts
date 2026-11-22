import { ChunkRole, Lesson, Phase, SourceLanguage } from '../../types';

function sourceThought(source: SourceLanguage, ar: string, en: string): string {
  if (source === 'ar' || source === 'arz' || source === 'apc' || source === 'afb' || source === 'ary') return ar;
  return en;
}

export function getTurkishPhases(source: SourceLanguage): Phase[] {
  const isAr = source === 'ar' || source === 'arz' || source === 'apc' || source === 'afb' || source === 'ary';

  const phase1Lessons: Lesson[] = [];
  const p1Titles = [
    { title: 'Turkish Greetings & SOV Order', titleAr: 'التحيات التركية وترتيب SOV' },
    { title: 'Asking & Everyday Ordering', titleAr: 'السؤال والطلب في المحلات' },
    { title: 'Travel & Locations', titleAr: 'السفر والأماكن' },
    { title: 'Family & Everyday Life', titleAr: 'العائلة والحياة اليومية' },
    { title: 'Work & Daily Activity', titleAr: 'العمل والنشاط اليومي' },
    { title: 'Food & Turkish Cuisine', titleAr: 'الطعام والمطبخ التركي' },
    { title: 'Shopping & Numbers', titleAr: 'التسوق والأرقام' }
  ];

  const TurkishPrompts = [
    [
      { ar: 'صباح الخير، كيف حالك؟', en: 'Günaydın, nasılsın?', sentence: 'Günaydın, nasılsın?', chips: ['Günaydın', 'nasılsın', 'iyiyim', 'teşekkürler', 'merhaba'] },
      { ar: 'أنا أريد قهوة من فضلك', en: 'Ben bir kahve istiyorum lütfen', sentence: 'Ben bir kahve istiyorum lütfen', chips: ['Ben', 'bir', 'kahve', 'istiyorum', 'lütfen', 'çay', 'su'] },
      { ar: 'أهلاً وسهلاً بك في إسطنبول', en: 'İstanbul’a hoş geldiniz', sentence: 'İstanbul’a hoş geldiniz', chips: ['İstanbul’a', 'hoş', 'geldiniz', 'merhaba', 'günaydın'] },
      { ar: 'شكراً جزيلاً لك', en: 'Çok teşekkür ederim', sentence: 'Çok teşekkür ederim', chips: ['Çok', 'teşekkür', 'ederim', 'rica', 'sağol'] }
    ],
    [
      { ar: 'بكم هذا؟', en: 'Bu ne kadar?', sentence: 'Bu ne kadar?', chips: ['Bu', 'ne', 'kadar?', 'şunlar', 'kaç', 'para'] },
      { ar: 'أين أنت الآن؟', en: 'Neredesin şimdi?', sentence: 'Neredesin şimdi?', chips: ['Neredesin', 'şimdi?', 'buradayım', 'nerede', 'evde'] },
      { ar: 'ماء بارد من فضلك', en: 'Soğuk su lütfen', sentence: 'Soğuk su lütfen', chips: ['Soğuk', 'su', 'lütfen', 'sıcak', 'çay', 'kahve'] },
      { ar: 'إلى اللقاء قريباً', en: 'Yakında görüşürüz', sentence: 'Yakında görüşürüz', chips: ['Yakında', 'görüşürüz', 'hoşça', 'kal', 'sonra'] }
    ],
    [
      { ar: 'أنا أعيش في أنقرة', en: 'Ben Ankara’da yaşıyorum', sentence: 'Ben Ankara’da yaşıyorum', chips: ['Ben', 'Ankara’da', 'yaşıyorum', 'İstanbul’da', 'evde'] },
      { ar: 'أين محطة الحافلات؟', en: 'Otobüs durağı nerede?', sentence: 'Otobüs durağı nerede?', chips: ['Otobüs', 'durağı', 'nerede?', 'istasyon', 'burada'] },
      { ar: 'أنا أذهب إلى العمل بالسيارة', en: 'İşe arabayla gidiyorum', sentence: 'İşe arabayla gidiyorum', chips: ['İşe', 'arabayla', 'gidiyorum', 'otobüsle', 'yürüyerek'] },
      { ar: 'أتمنى لك يوماً سعيداً', en: 'İyi günler dilerim', sentence: 'İyi günler dilerim', chips: ['İyi', 'günler', 'dilerim', 'akşamlar', 'geceler'] }
    ],
    [
      { ar: 'هذا صديقي العزيز', en: 'Bu benim sevgili arkadaşım', sentence: 'Bu benim sevgili arkadaşım', chips: ['Bu', 'benim', 'sevgili', 'arkadaşım', 'kardeşim', 'dostum'] },
      { ar: 'عائلتي تعيش هنا', en: 'Ailem burada yaşıyor', sentence: 'Ailem burada yaşıyor', chips: ['Ailem', 'burada', 'yaşıyor', 'orada', 'şimdi'] },
      { ar: 'نحن نأكل العشاء معاً', en: 'Birlikte akşam yemeği yiyoruz', sentence: 'Birlikte akşam yemeği yiyoruz', chips: ['Birlikte', 'akşam', 'yemeği', 'yiyoruz', 'öğle', 'kahvaltı'] },
      { ar: 'أمي تطبخ طعاماً لذيذاً', en: 'Annem lezzetli yemek pişiriyor', sentence: 'Annem lezzetli yemek pişiriyor', chips: ['Annem', 'lezzetli', 'yemek', 'pişiriyor', 'babama', 'güzel'] }
    ],
    [
      { ar: 'أنا أعمل في مكتب كبير', en: 'Büyük bir ofiste çalışıyorum', sentence: 'Büyük bir ofiste çalışıyorum', chips: ['Büyük', 'bir', 'ofiste', 'çalışıyorum', 'küçük', 'evde'] },
      { ar: 'اجتماعنا يبدأ في العاشرة', en: 'Toplantımız saat onda başlıyor', sentence: 'Toplantımız saat onda başlıyor', chips: ['Toplantımız', 'saat', 'onda', 'başlıyor', 'dokuzda', 'bitiyor'] },
      { ar: 'أنا أكتب رسالة جديدة', en: 'Yeni bir mesaj yazıyorum', sentence: 'Yeni bir mesaj yazıyorum', chips: ['Yeni', 'bir', 'mesaj', 'yazıyorum', 'mektup', 'okuyorum'] },
      { ar: 'العمل ينتهي المساء', en: 'İş akşam bitiyor', sentence: 'İş akşam bitiyor', chips: ['İş', 'akşam', 'bitiyor', 'sabah', 'öğlen'] }
    ],
    [
      { ar: 'هذا المطعم ممتاز جداً', en: 'Bu restoran çok harika', sentence: 'Bu restoran çok harika', chips: ['Bu', 'restoran', 'çok', 'harika', 'güzel', 'kötü'] },
      { ar: 'طاولة لشخصين من فضلك', en: 'İki kişilik bir masa lütfen', sentence: 'İki kişilik bir masa lütfen', chips: ['İki', 'kişilik', 'bir', 'masa', 'lütfen', 'üç', 'sandalye'] },
      { ar: 'الحساب من فضلك', en: 'Hesap lütfen', sentence: 'Hesap lütfen', chips: ['Hesap', 'lütfen', 'teşekkürler', 'nakit', 'kart'] },
      { ar: 'الشاي التركي رائع', en: 'Türk çayı çok güzel', sentence: 'Türk çayı çok güzel', chips: ['Türk', 'çayı', 'çok', 'güzel', 'kahvesi', 'sıcak'] }
    ],
    [
      { ar: 'كم سعر هذا الوشاح؟', en: 'Bu atkı ne kadar?', sentence: 'Bu atkı ne kadar?', chips: ['Bu', 'atkı', 'ne', 'kadar?', 'kazak', 'pantolon'] },
      { ar: 'أريد الدفع نقداً', en: 'Nakit ödemek istiyorum', sentence: 'Nakit ödemek istiyorum', chips: ['Nakit', 'ödemek', 'istiyorum', 'kartla', 'lütfen'] },
      { ar: 'هذا المتجر ممتلئ', en: 'Bu mağaza çok kalabalık', sentence: 'Bu mağaza çok kalabalık', chips: ['Bu', 'mağaza', 'çok', 'kalabalık', 'boş', 'görkemli'] },
      { ar: 'السعر مناسب جداً', en: 'Fiyat çok uygun', sentence: 'Fiyat çok uygun', chips: ['Fiyat', 'çok', 'uygun', 'pahalı', 'ucuz'] }
    ]
  ];

  for (let i = 1; i <= 7; i++) {
    const group = TurkishPrompts[i - 1];
    const exercises = group.map((item, idx) => ({
      id: `tr-ex-1-${i}-${idx + 1}`,
      arabicThought: item.ar,
      englishTarget: item.en,
      sourceThought: sourceThought(source, item.ar, item.en),
      targetSentence: item.sentence,
      acceptableAlternatives: [item.sentence.toLowerCase()],
      wordChips: item.chips,
      breakdownChunks: item.chips.map(c => ({
        arabicText: c, englishText: c, sourceText: c, targetText: c, role: 'modifier' as ChunkRole, explanation: 'Turkish'
      })),
      habitHint: 'قاعدة SOV في التركية.',
      explanationAr: 'في اللغة التركية يأتي الفعل دائماً في نهاية الجملة.',
      explanationEn: 'In Turkish, verbs always come at the end of the sentence.'
    }));

    phase1Lessons.push({
      id: `tr-p1-l${i}`,
      phaseId: 1,
      phaseTitle: 'Phase 1: Türkçe Cümle Yapısı (SOV)',
      phaseLevel: 'A1',
      number: i,
      title: `Lesson ${i}: ${p1Titles[i - 1].title}`,
      titleAr: `الدرس ${i}: ${p1Titles[i - 1].titleAr}`,
      transferConcept: 'In Turkish, verbs come at the end of the sentence (SOV).',
      transferConceptAr: 'في التركية يأتي الفعل في نهاية الجملة.',
      weakSpotTag: 'turkish-sov-rule',
      exercises
    });
  }

  const phase2Lessons: Lesson[] = [];
  for (let i = 8; i <= 14; i++) {
    phase2Lessons.push({
      id: `tr-p2-l${i}`,
      phaseId: 2,
      phaseTitle: 'Phase 2: İsim Halleri ve Zamanlar',
      phaseLevel: 'A2',
      number: i,
      title: `Lesson ${i}: Noun Cases & Tenses`,
      titleAr: `الدرس ${i}: حالات الأسماء والأزمنة`,
      transferConcept: 'Master Turkish noun suffixes and present continuous tense.',
      transferConceptAr: 'إتقان لواحق الأسماء والمضارع المستمر بالتركية.',
      weakSpotTag: 'turkish-tenses',
      exercises: [
        {
          id: `tr-ex-2-${i}-1`,
          arabicThought: 'أنا أذهب إلى المدرسة',
          englishTarget: 'Okula gidiyorum',
          sourceThought: sourceThought(source, 'أنا أذهب إلى المدرسة', 'I am going to school'),
          targetSentence: 'Okula gidiyorum',
          acceptableAlternatives: ['okula gidiyorum'],
          wordChips: ['Okula', 'gidiyorum', 'eve', 'işe', 'geliyorum'],
          breakdownChunks: ['Okula', 'gidiyorum', 'eve', 'işe', 'geliyorum'].map(c => ({
            arabicText: c, englishText: c, sourceText: c, targetText: c, role: 'modifier' as ChunkRole, explanation: 'Direction'
          })),
          habitHint: 'لاحقة التوجه (a-).',
          explanationAr: 'اللاحقة a- تعني "إلى" (Okula = إلى المدرسة).',
          explanationEn: 'The suffix -a means "to" (Okula = to school).'
        },
        {
          id: `tr-ex-2-${i}-2`,
          arabicThought: 'أنا أقرأ كتاباً في البيت',
          englishTarget: 'Evde kitap okuyorum',
          sourceThought: sourceThought(source, 'أنا أقرأ كتاباً في البيت', 'I read a book at home'),
          targetSentence: 'Evde kitap okuyorum',
          acceptableAlternatives: ['evde kitap okuyorum'],
          wordChips: ['Evde', 'kitap', 'okuyorum', 'okulda', 'yazıyorum'],
          breakdownChunks: ['Evde', 'kitap', 'okuyorum', 'okulda', 'yazıyorum'].map(c => ({
            arabicText: c, englishText: c, sourceText: c, targetText: c, role: 'modifier' as ChunkRole, explanation: 'Locative'
          })),
          habitHint: 'لاحقة المكان (de-).',
          explanationAr: 'اللاحقة de- تعني "في" (Evde = في البيت).',
          explanationEn: 'The suffix -de means "at/in" (Evde = at home).'
        },
        {
          id: `tr-ex-2-${i}-3`,
          arabicThought: 'أنا أشتري الخبز من المخبز',
          englishTarget: 'Fırından ekmek alıyorum',
          sourceThought: sourceThought(source, 'أنا أشتري الخبز من المخبز', 'I buy bread from the bakery'),
          targetSentence: 'Fırından ekmek alıyorum',
          acceptableAlternatives: ['firindan ekmek aliyorum', 'fırından ekmek alıyorum'],
          wordChips: ['Fırından', 'ekmek', 'alıyorum', 'marketten', 'su'],
          breakdownChunks: ['Fırından', 'ekmek', 'alıyorum', 'marketten', 'su'].map(c => ({
            arabicText: c, englishText: c, sourceText: c, targetText: c, role: 'modifier' as ChunkRole, explanation: 'Ablative'
          })),
          habitHint: 'لاحقة المصدر (dan-).',
          explanationAr: 'اللاحقة dan- تعني "من" (Fırından = من المخبز).',
          explanationEn: 'The suffix -dan means "from" (Fırından = from bakery).'
        },
        {
          id: `tr-ex-2-${i}-4`,
          arabicThought: 'نحن ننتظر الحافلة',
          englishTarget: 'Otobüsü bekliyoruz',
          sourceThought: sourceThought(source, 'نحن ننتظر الحافلة', 'We are waiting for the bus'),
          targetSentence: 'Otobüsü bekliyoruz',
          acceptableAlternatives: ['otobusu bekliyoruz', 'otobüsü bekliyoruz'],
          wordChips: ['Otobüsü', 'bekliyoruz', 'treni', 'taksiyi', 'istiyoruz'],
          breakdownChunks: ['Otobüsü', 'bekliyoruz', 'treni', 'taksiyi', 'istiyoruz'].map(c => ({
            arabicText: c, englishText: c, sourceText: c, targetText: c, role: 'modifier' as ChunkRole, explanation: 'Accusative'
          })),
          habitHint: 'لاحقة المفعول المباشر.',
          explanationAr: 'اللاحقة ü- تفيد تحديد المفعول به (Otobüsü = الحافلة).',
          explanationEn: 'The accusative suffix -ü specifies the definite object.'
        }
      ]
    });
  }

  const phase3Lessons: Lesson[] = [];
  for (let i = 15; i <= 21; i++) {
    phase3Lessons.push({
      id: `tr-p3-l${i}`,
      phaseId: 3,
      phaseTitle: 'Phase 3: Geçmiş Zaman ve Karmaşık Cümleler',
      phaseLevel: 'B1',
      number: i,
      title: `Lesson ${i}: Past Tense & Complex Structures`,
      titleAr: `الدرس ${i}: الماضي والجمل المركبة`,
      transferConcept: 'Master past tense (-di) and complex Turkish clauses.',
      transferConceptAr: 'إتقان الماضي والجمل المركبة في اللغة التركية.',
      weakSpotTag: 'turkish-past-tense',
      exercises: [
        {
          id: `tr-ex-3-${i}-1`,
          arabicThought: 'لقد ذهبت إلى إسطنبول الأسبوع الماضي',
          englishTarget: 'Geçen hafta İstanbul’a gittim',
          sourceThought: sourceThought(source, 'لقد ذهبت إلى إسطنبول الأسبوع الماضي', 'I went to Istanbul last week'),
          targetSentence: 'Geçen hafta İstanbul’a gittim',
          acceptableAlternatives: ['gecen hafta istanbula gittim', 'geçen hafta istanbul a gittim'],
          wordChips: ['Geçen', 'hafta', 'İstanbul’a', 'gittim', 'ay', 'geldim'],
          breakdownChunks: ['Geçen', 'hafta', 'İstanbul’a', 'gittim', 'ay', 'geldim'].map(c => ({
            arabicText: c, englishText: c, sourceText: c, targetText: c, role: 'modifier' as ChunkRole, explanation: 'Past tense'
          })),
          habitHint: 'الماضي للشخص الأول (-tim).',
          explanationAr: 'اللاحقة tim- تدل على الماضي للشخص الأول (gittim = ذهبتُ).',
          explanationEn: 'The suffix -tim indicates 1st person past tense (gittim = I went).'
        },
        {
          id: `tr-ex-3-${i}-2`,
          arabicThought: 'لقد أكلنا طعاماً لذيذاً أمس',
          englishTarget: 'Dün lezzetli bir yemek yedik',
          sourceThought: sourceThought(source, 'لقد أكلنا طعاماً لذيذاً أمس', 'We ate delicious food yesterday'),
          targetSentence: 'Dün lezzetli bir yemek yedik',
          acceptableAlternatives: ['dun lezzetli bir yemek yedik'],
          wordChips: ['Dün', 'lezzetli', 'bir', 'yemek', 'yedik', 'içtik', 'bugün'],
          breakdownChunks: ['Dün', 'lezzetli', 'bir', 'yemek', 'yedik', 'içtik', 'bugün'].map(c => ({
            arabicText: c, englishText: c, sourceText: c, targetText: c, role: 'modifier' as ChunkRole, explanation: 'Past plural'
          })),
          habitHint: 'الماضي للجمع (-dik).',
          explanationAr: 'اللاحقة dik- تدل على الماضي للشخص الأول الجمع (yedik = أكلنا).',
          explanationEn: 'The suffix -dik indicates 1st person plural past tense (yedik = we ate).'
        },
        {
          id: `tr-ex-3-${i}-3`,
          arabicThought: 'لأنني أحب اللغة التركية',
          englishTarget: 'Çünkü Türkçe seviyorum',
          sourceThought: sourceThought(source, 'لأنني أحب اللغة التركية', 'Because I love Turkish'),
          targetSentence: 'Çünkü Türkçe seviyorum',
          acceptableAlternatives: ['cunku turkce seviyorum', 'çünkü türkçe seviyorum'],
          wordChips: ['Çünkü', 'Türkçe', 'seviyorum', 'çalışıyorum', 'öğreniyorum'],
          breakdownChunks: ['Çünkü', 'Türkçe', 'seviyorum', 'çalışıyorum', 'öğreniyorum'].map(c => ({
            arabicText: c, englishText: c, sourceText: c, targetText: c, role: 'modifier' as ChunkRole, explanation: 'Conjunction'
          })),
          habitHint: 'أداة السبب (Çünkü).',
          explanationAr: 'كلمة Çünkü تعني "لأن".',
          explanationEn: 'Çünkü means "because".'
        },
        {
          id: `tr-ex-3-${i}-4`,
          arabicThought: 'أنا أعلم أنك تفهم',
          englishTarget: 'Anladığını biliyorum',
          sourceThought: sourceThought(source, 'أنا أعلم أنك تفهم', 'I know that you understand'),
          targetSentence: 'Anladığını biliyorum',
          acceptableAlternatives: ['anladigini biliyorum', 'anladığını biliyorum'],
          wordChips: ['Anladığını', 'biliyorum', 'gördüğünü', 'duyduğumu'],
          breakdownChunks: ['Anladığını', 'biliyorum', 'gördüğünü', 'duyduğumu'].map(c => ({
            arabicText: c, englishText: c, sourceText: c, targetText: c, role: 'modifier' as ChunkRole, explanation: 'Participle clause'
          })),
          habitHint: 'المصدر المؤول (-ğını).',
          explanationAr: 'اللاحقة ğını- تحول الفعل إلى مصدر مؤول (أنك تفهم).',
          explanationEn: 'The suffix -ğını forms a noun clause ("that you understand").'
        }
      ]
    });
  }

  return [
    { id: 1, title: 'Phase 1: Türkçe Cümle Yapısı (SOV)', titleAr: 'المرحلة ١: بنية الجملة التركية SOV', level: 'A1', tagline: 'Turkish SOV & Everyday Sentences', lessons: phase1Lessons },
    { id: 2, title: 'Phase 2: İsim Halleri ve Zamanlar', titleAr: 'المرحلة ٢: حالات الأسماء والأزمنة', level: 'A2', tagline: 'Noun Cases & Tenses', lessons: phase2Lessons },
    { id: 3, title: 'Phase 3: Geçmiş Zaman ve Karmaşık Cümleler', titleAr: 'المرحلة ٣: الماضي والجمل المركبة', level: 'B1', tagline: 'Past Tense & Complex Structures', lessons: phase3Lessons }
  ];
}
