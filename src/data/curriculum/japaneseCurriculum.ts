import { Lesson, Phase, SourceLanguage } from '../../types';

function sourceThought(source: SourceLanguage, ar: string, en: string): string {
  if (source === 'ar' || source === 'arz' || source === 'apc' || source === 'afb' || source === 'ary') return ar;
  return en;
}

export function getJapanesePhases(source: SourceLanguage): Phase[] {
  const isAr = source === 'ar';

  const phase1Lessons: Lesson[] = [];
  for (let i = 1; i <= 7; i++) {
    phase1Lessons.push({
      id: `ja-p1-l${i}`,
      phaseId: 1,
      phaseTitle: '基礎 The Core Skeleton & Particles',
      phaseLevel: 'N5 – N4',
      number: i,
      title: `Lesson ${i}: SOV Rule & Topic ${i}`,
      titleAr: `الدرس ${i}: ترتيب الجملة وحرف المبتدأ`,
      transferConcept: 'Master strict SOV word order and particles.',
      transferConceptAr: 'الفعل دائماً في نهاية الجملة اليابانية.',
      weakSpotTag: 'sov-word-order',
      exercises: [
        {
          id: `ja-ex-1-${i}-1`,
          arabicThought: 'أنا طالب',
          englishTarget: '私は学生です',
          sourceThought: sourceThought(source, 'أنا طالب', 'I am a student'),
          targetSentence: '私は学生です',
          romajiTarget: 'Watashi wa gakusei desu',
          furiganaTarget: '<ruby>私<rt>わたし</rt></ruby>は<ruby>学生<rt>がくせい</rt></ruby>です',
          acceptableAlternatives: ['私は学生です', 'わたしはがくせいです', 'watashi wa gakusei desu', '学生です'],
          wordChips: ['私', 'は', '学生', 'です', 'が', 'だ', 'あなた', '水', 'お茶', '食べる'],
          breakdownChunks: [
            { arabicText: '私', englishText: 'I', sourceText: 'أنا', targetText: '私', role: 'subject', explanation: 'Topic' },
            { arabicText: 'は', englishText: 'topic', sourceText: 'أداة', targetText: 'は', role: 'connector', explanation: 'Particle' },
            { arabicText: '学生', englishText: 'student', sourceText: 'طالب', targetText: '学生', role: 'object', explanation: 'Noun' },
            { arabicText: 'です', englishText: 'is', sourceText: 'فعل', targetText: 'です', role: 'verb', explanation: 'Copula' }
          ],
          habitHint: 'فعل الربط です في نهاية الجملة.'
        },
        {
          id: `ja-ex-1-${i}-2`,
          arabicThought: 'هذا ماء',
          englishTarget: 'これは水です',
          sourceThought: sourceThought(source, 'هذا ماء', 'This is water'),
          targetSentence: 'これは水です',
          romajiTarget: 'Kore wa mizu desu',
          furiganaTarget: 'これは<ruby>水<rt>みず</rt></ruby>です',
          acceptableAlternatives: ['これは水です', 'これはみずです', 'kore wa mizu desu'],
          wordChips: ['これ', 'は', '水', 'です', 'それ', 'あれ', 'お茶', '本'],
          breakdownChunks: [
            { arabicText: 'これ', englishText: 'this', sourceText: 'هذا', targetText: 'これ', role: 'subject', explanation: 'Demonstrative' },
            { arabicText: 'は', englishText: 'topic', sourceText: 'علامة', targetText: 'は', role: 'connector', explanation: 'Topic' },
            { arabicText: '水', englishText: 'water', sourceText: 'ماء', targetText: '水', role: 'object', explanation: 'Noun' },
            { arabicText: 'です', englishText: 'copula', sourceText: 'يكون', targetText: 'です', role: 'verb', explanation: 'Copula' }
          ],
          habitHint: 'اسم الإشارة これ.'
        },
        {
          id: `ja-ex-1-${i}-3`,
          arabicThought: 'أنا أشرب ماء',
          englishTarget: '水を飲みます',
          sourceThought: sourceThought(source, 'أنا أشرب ماء', 'I drink water'),
          targetSentence: '水を飲みます',
          romajiTarget: 'Mizu o nomimasu',
          furiganaTarget: '<ruby>水<rt>みず</rt></ruby>を<ruby>飲<rt>の</rt></ruby>みます',
          acceptableAlternatives: ['水を飲みます', 'みず을のみます'.replace('을', ''), 'mizu o nomimasu'],
          wordChips: ['水', 'を', '飲みます', 'お茶', '食べる', '見る', '行く'],
          breakdownChunks: [
            { arabicText: '水', englishText: 'water', sourceText: 'ماء', targetText: '水', role: 'object', explanation: 'Object' },
            { arabicText: 'を', englishText: 'particle', sourceText: 'أداة', targetText: 'を', role: 'connector', explanation: 'Particle' },
            { arabicText: '飲みます', englishText: 'drink', sourceText: 'أشرب', targetText: '飲みます', role: 'verb', explanation: 'Verb' }
          ],
          habitHint: 'المفعول مع を والفعل في النهاية.'
        },
        {
          id: `ja-ex-1-${i}-4`,
          arabicThought: 'أنا آكل سوشي',
          englishTarget: '寿司を食べます',
          sourceThought: sourceThought(source, 'أنا آكل سوشي', 'I eat sushi'),
          targetSentence: '寿司を食べます',
          romajiTarget: 'Sushi o tabemasu',
          furiganaTarget: '<ruby>寿司<rt>すし</rt></ruby>を<ruby>食<rt>た</rt></ruby>べます',
          acceptableAlternatives: ['寿司を食べます', 'sushi o tabemasu'],
          wordChips: ['寿司', 'を', '食べます', '飲む', '水', 'お茶'],
          breakdownChunks: [
            { arabicText: '寿司', englishText: 'sushi', sourceText: 'سوشي', targetText: '寿司', role: 'object', explanation: 'Object' },
            { arabicText: 'を', englishText: 'particle', sourceText: 'أداة', targetText: 'を', role: 'connector', explanation: 'Particle' },
            { arabicText: '食べます', englishText: 'eat', sourceText: 'آكل', targetText: '食べます', role: 'verb', explanation: 'Verb' }
          ],
          habitHint: 'فعل الأكل.'
        }
      ]
    });
  }

  const phase2Lessons: Lesson[] = [];
  for (let i = 8; i <= 14; i++) {
    phase2Lessons.push({
      id: `ja-p2-l${i}`,
      phaseId: 2,
      phaseTitle: '文法 Connections & Describing Actions',
      phaseLevel: 'N4 – N3',
      number: i,
      title: `Lesson ${i}: Te-Form & Past Tense ${i}`,
      titleAr: `الدرس ${i}: صيغة الربط والماضي`,
      transferConcept: 'Master connecting actions and past tense.',
      transferConceptAr: 'إتقان صيغة الربط والماضي.',
      weakSpotTag: 'te-form-connections',
      exercises: [
        {
          id: `ja-ex-2-${i}-1`,
          arabicThought: 'أشرب القهوة وأقرأ الكتاب',
          englishTarget: 'コーヒーを飲んで本を読みます',
          sourceThought: sourceThought(source, 'أشرب القهوة وأقرأ الكتاب', 'Drink and read'),
          targetSentence: 'コーヒーを飲んで本を読みます',
          romajiTarget: 'Koohi o nonde hon o yomimasu',
          furiganaTarget: 'コーヒーを<ruby>飲<rt>の</rt></ruby>んで<ruby>本<rt>ほん</rt></ruby>を<ruby>読<rt>よ</rt></ruby>みます',
          acceptableAlternatives: ['コーヒーを飲んで本を読みます', 'koohi o nonde hon o yomimasu'],
          wordChips: ['コーヒー', 'を', '飲んで', '本', '読みます', '水', 'お茶', '食べる', '行く', '来る', '見る', '話す'],
          breakdownChunks: [
            { arabicText: 'コーヒーを', englishText: 'coffee', sourceText: 'القهوة', targetText: 'コーヒーを', role: 'object', explanation: 'Object' },
            { arabicText: '飲んで', englishText: 'drink and', sourceText: 'وأشرب', targetText: '飲んで', role: 'connector', explanation: 'Te-form' },
            { arabicText: '本を読みます', englishText: 'read book', sourceText: 'أقرأ كتاباً', targetText: '本を読みます', role: 'verb', explanation: 'Clause' }
          ],
          habitHint: 'صيغة て.'
        },
        {
          id: `ja-ex-2-${i}-2`,
          arabicThought: 'درست اليابانية بالأمس',
          englishTarget: '昨日日本語を勉強しました',
          sourceThought: sourceThought(source, 'درست اليابانية بالأمس', 'Studied yesterday'),
          targetSentence: '昨日日本語を勉強しました',
          romajiTarget: 'Kinou nihongo o benkyou shimashita',
          furiganaTarget: '<ruby>昨日<rt>きのう</rt></ruby><ruby>日本語<rt>にほんご</rt></ruby>を<ruby>勉強<rt>べんきょう</rt></ruby>しました',
          acceptableAlternatives: ['昨日日本語を勉強しました', 'kinou nihongo o benkyou shimashita'],
          wordChips: ['昨日', '日本語', 'を', '勉強しました', '英語', '中国語', '学校', '先生'],
          breakdownChunks: [
            { arabicText: '昨日', englishText: 'yesterday', sourceText: 'أمس', targetText: '昨日', role: 'connector', explanation: 'Time' },
            { arabicText: '日本語を', englishText: 'Japanese', sourceText: 'اليابانية', targetText: '日本語を', role: 'object', explanation: 'Object' },
            { arabicText: '勉強しました', englishText: 'studied', sourceText: 'درست', targetText: '勉強しました', role: 'verb', explanation: 'Past' }
          ],
          habitHint: 'الماضي ました.'
        },
        {
          id: `ja-ex-2-${i}-3`,
          arabicThought: 'أكلت السوشي',
          englishTarget: '寿司を食べました',
          sourceThought: sourceThought(source, 'أكلت السوشي', 'Ate sushi'),
          targetSentence: '寿司を食べました',
          romajiTarget: 'Sushi o tabemashita',
          furiganaTarget: '<ruby>寿司<rt>すし</rt></ruby>を<ruby>食<rt>た</rt></ruby>べました',
          acceptableAlternatives: ['寿司を食べました', 'sushi o tabemashita'],
          wordChips: ['寿司', 'を', '食べました', '飲む', '水', 'お茶', 'ラーメン'],
          breakdownChunks: [
            { arabicText: '寿司', englishText: 'sushi', sourceText: 'سوشي', targetText: '寿司', role: 'object', explanation: 'Object' },
            { arabicText: 'を', englishText: 'particle', sourceText: 'أداة', targetText: 'を', role: 'connector', explanation: 'Particle' },
            { arabicText: '食べました', englishText: 'ate', sourceText: 'أكلت', targetText: '食べました', role: 'verb', explanation: 'Past' }
          ],
          habitHint: 'الماضي 食べました.'
        },
        {
          id: `ja-ex-2-${i}-4`,
          arabicThought: 'ذهبت إلى المكتبة',
          englishTarget: '図書館に行きました',
          sourceThought: sourceThought(source, 'ذهبت إلى المكتبة', 'Went to library'),
          targetSentence: '図書館に行きました',
          romajiTarget: 'Toshokan ni ikimashita',
          furiganaTarget: '<ruby>図書館<rt>としょかん</rt></ruby>に<ruby>行<rt>い</rt></ruby>きました',
          acceptableAlternatives: ['図書館に行きました', 'toshokan ni ikimashita'],
          wordChips: ['図書館', 'に', '行きました', 'で', 'から', '学校'],
          breakdownChunks: [
            { arabicText: '図書館', englishText: 'library', sourceText: 'المكتبة', targetText: '図書館', role: 'object', explanation: 'Place' },
            { arabicText: 'に', englishText: 'to', sourceText: 'إلى', targetText: 'に', role: 'connector', explanation: 'Destination' },
            { arabicText: '行きました', englishText: 'went', sourceText: 'ذهبت', targetText: '行きました', role: 'verb', explanation: 'Past motion' }
          ],
          habitHint: 'الذهاب في الماضي 行きました.'
        }
      ]
    });
  }

  const phase3Lessons: Lesson[] = [];
  for (let i = 15; i <= 21; i++) {
    phase3Lessons.push({
      id: `ja-p3-l${i}`,
      phaseId: 3,
      phaseTitle: '応用 Mastery, Politeness & Natural Context',
      phaseLevel: 'N3 – N2',
      number: i,
      title: `Lesson ${i}: Ability & Potential ${i}`,
      titleAr: `الدرس ${i}: القدرة والاستطاعة`,
      transferConcept: 'Master potential forms and advanced flow.',
      transferConceptAr: 'إتقان صيغ الاستطاعة والطلاقة.',
      weakSpotTag: 'potential-dekimasu',
      exercises: [
        {
          id: `ja-ex-3-${i}-1`,
          arabicThought: 'أستطيع التحدث باليابانية',
          englishTarget: '日本語ができます',
          sourceThought: sourceThought(source, 'أستطيع التحدث باليابانية', 'Can speak Japanese'),
          targetSentence: '日本語ができます',
          romajiTarget: 'Nihongo ga dekimasu',
          furiganaTarget: '<ruby>日本語<rt>にほんご</rt></ruby>ができます',
          acceptableAlternatives: ['日本語ができます', 'nihongo ga dekimasu'],
          wordChips: ['日本語', 'が', 'できます', 'を', 'は', '英語'],
          breakdownChunks: [
            { arabicText: '日本語', englishText: 'Japanese', sourceText: 'اليابانية', targetText: '日本語', role: 'object', explanation: 'Skill' },
            { arabicText: 'が', englishText: 'subject', sourceText: 'حرف', targetText: 'が', role: 'connector', explanation: 'Particle' },
            { arabicText: 'できます', englishText: 'can', sourceText: 'أستطيع', targetText: 'できます', role: 'verb', explanation: 'Potential' }
          ],
          habitHint: 'الاستطاعة ができます.'
        },
        {
          id: `ja-ex-3-${i}-2`,
          arabicThought: 'أستطيع قراءة الكتاب',
          englishTarget: '本を読むことができます',
          sourceThought: sourceThought(source, 'أستطيع قراءة الكتاب', 'Can read book'),
          targetSentence: '本を読むことができます',
          romajiTarget: 'Hon o yomu koto ga dekimasu',
          furiganaTarget: '<ruby>本<rt>ほん</rt></ruby>を<ruby>読<rt>よ</rt></ruby>むことができます',
          acceptableAlternatives: ['本を読むことができます', 'hon o yomu koto ga dekimasu'],
          wordChips: ['本を', '読む', 'ことができます', '書く', '見る'],
          breakdownChunks: [
            { arabicText: '本を', englishText: 'book', sourceText: 'الكتاب', targetText: '本を', role: 'object', explanation: 'Object' },
            { arabicText: '読むことができます', englishText: 'can read', sourceText: 'أستطيع قراءة', targetText: '読むことができます', role: 'verb', explanation: 'Potential' }
          ],
          habitHint: 'مُصْدَر + ことができます.'
        },
        {
          id: `ja-ex-3-${i}-3`,
          arabicThought: 'أحب اللغة اليابانية',
          englishTarget: '日本語が好きです',
          sourceThought: sourceThought(source, 'أحب اللغة اليابانية', 'Like Japanese'),
          targetSentence: '日本語が好きです',
          romajiTarget: 'Nihongo ga suki desu',
          furiganaTarget: '<ruby>日本語<rt>にほんご</rt></ruby>が好きです',
          acceptableAlternatives: ['日本語が好きです', 'nihongo ga suki desu'],
          wordChips: ['日本語', 'が', '好きです', '嫌い', '大'],
          breakdownChunks: [
            { arabicText: '日本語', englishText: 'Japanese', sourceText: 'اليابانية', targetText: '日本語', role: 'object', explanation: 'Object' },
            { arabicText: 'が好きです', englishText: 'like', sourceText: 'أحب', targetText: 'が好きです', role: 'verb', explanation: 'Preference' }
          ],
          habitHint: 'التفضيل が好きです.'
        },
        {
          id: `ja-ex-3-${i}-4`,
          arabicThought: 'أعرف هذا الشخص',
          englishTarget: 'この人を知っています',
          sourceThought: sourceThought(source, 'أعرف هذا الشخص', 'Know this person'),
          targetSentence: 'この人を知っています',
          romajiTarget: 'Kono hito o shitte imasu',
          furiganaTarget: 'この<ruby>人<rt>ひと</rt></ruby>を<ruby>知<rt>し</rt></ruby>っています',
          acceptableAlternatives: ['이 사람이 아닙니다', 'この人を知っています', 'kono hito o shitte imasu'],
          wordChips: ['この', '人', 'を', '知っています', '先生', '友達'],
          breakdownChunks: [
            { arabicText: 'この人', englishText: 'this person', sourceText: 'هذا الشخص', targetText: 'この人', role: 'object', explanation: 'Object' },
            { arabicText: 'を', englishText: 'particle', sourceText: 'أداة', targetText: 'を', role: 'connector', explanation: 'Particle' },
            { arabicText: '知っています', englishText: 'know', sourceText: 'أعرف', targetText: '知っています', role: 'verb', explanation: 'Verb' }
          ],
          habitHint: 'فعل المعرفة 知っています.'
        }
      ]
    });
  }

  return [
    { id: 1, title: '基礎 The Core Skeleton & Particles', titleAr: 'أساسيات البناء الياباني وحروف المعاني', level: 'N5 – N4', tagline: 'Core Particles & SOV', lessons: phase1Lessons },
    { id: 2, title: '文法 Connections & Describing Actions', titleAr: 'ربط الجمل وتوصيف الأفعال باليابانية', level: 'N4 – N3', tagline: 'Te-Form & Past Tense', lessons: phase2Lessons },
    { id: 3, title: '応用 Mastery, Politeness & Natural Context', titleAr: 'الإتقان واليابانية الطبيعية الاحترافية', level: 'N3 – N2', tagline: 'Potential & Politeness', lessons: phase3Lessons }
  ];
}
