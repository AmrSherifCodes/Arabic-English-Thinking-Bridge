import { Phase, SourceLanguage } from '../../types';

export function getJapanesePhases(source: SourceLanguage): Phase[] {
  const isAr = source === 'ar';

  return [
    {
      id: 1,
      title: '基礎 The Core Skeleton & Particles',
      titleAr: 'أساسيات البناء الياباني وحروف المعاني',
      level: 'N5 – N4',
      tagline: isAr
        ? 'أتقن وضع الفعل دائماً في نهاية الجملة (SOV)، وحروف الربط الأساسية (は, を, に)، وحذف الضمائر الزائدة.'
        : 'Master the strict SOV word order (verb at the end), core particles (は, を, に), and natural pronoun dropping.',
      lessons: [
        {
          id: 'ja-p1-l1',
          phaseId: 1,
          phaseTitle: '基礎 The Core Skeleton & Particles',
          phaseLevel: 'N5 – N4',
          number: 1,
          title: 'The SOV Rule & The Topic Particle は',
          titleAr: 'ترتيب الجملة وحرف المبتدأ (は - wa)',
          transferConcept: isAr
            ? 'في اليابانية، الفعل يأتي دائماً في النهاية المطلقة للجملة (الفاعل ثم المفعول ثم الفعل: SOV). وحرف は (يُنطق wa) يُلصق بالاسم ليقول: "فيما يخص كذا...". رابطة الكينونة المهذبة です (desu) تقف دائماً في ختام الجملة.'
            : 'In Japanese, the verb is always placed at the very end of the sentence (SOV: Subject - Object - Verb). The particle は (pronounced "wa") marks the topic ("As for X..."). The polite copula です ("desu") serves as the final anchor.',
          transferConceptAr: 'الفعل دائماً في نهاية الجملة اليابانية. وحرف は يعلم الموضوع/المبتدأ.',
          weakSpotTag: 'sov-word-order',
          exercises: [
            {
              id: 'ja-ex-1-1-1',
              arabicThought: 'أنا طالب',
              englishTarget: '私は学生です',
              sourceThought: isAr ? 'أنا طالب' : 'I am a student',
              targetSentence: '私は学生です',
              romajiTarget: 'Watashi wa gakusei desu',
              furiganaTarget: '<ruby>私<rt>わたし</rt></ruby>は<ruby>学生<rt>がくせい</rt></ruby>です',
              acceptableAlternatives: [
                'わたしはがくせいです',
                'watashi wa gakusei desu',
                '学生です',
                'がくせいです'
              ],
              wordChips: ['私', 'は', '学生', 'です', 'が', 'だ', 'わたし'],
              breakdownChunks: [
                {
                  arabicText: '私 (watashi)',
                  englishText: 'I',
                  sourceText: isAr ? 'أنا' : 'I',
                  targetText: '私',
                  role: 'subject',
                  explanation: 'Topic pronoun (Watashi)'
                },
                {
                  arabicText: 'は (wa)',
                  englishText: 'topic marker',
                  sourceText: isAr ? 'أداة الموضوع (は)' : 'topic marker',
                  targetText: 'は',
                  role: 'connector',
                  explanation: 'Particle は pronounced "wa" marking the topic'
                },
                {
                  arabicText: '学生 (gakusei)',
                  englishText: 'student',
                  sourceText: isAr ? 'طالب' : 'student',
                  targetText: '学生',
                  role: 'object',
                  explanation: 'Noun (student)'
                },
                {
                  arabicText: 'です (desu)',
                  englishText: 'am / is',
                  sourceText: isAr ? 'الكينونة المهذبة (desu)' : 'polite copula (am/is)',
                  targetText: 'です',
                  role: 'verb',
                  explanation: 'Polite copula anchoring the sentence'
                }
              ],
              habitHint: isAr
                ? 'في اليابانية، الكينونة です (desu) تقف دائماً في ختام الجملة! المبتدأ + は + الخبر + です.'
                : 'In Japanese, the polite copula です (desu) sits at the very end! Topic + は + noun + です.',
              specificMisconceptions: [
                {
                  pattern: '^です',
                  diagnosis: isAr
                    ? 'انتبه: لا تبدأ بفعل الكينونة です، بل ضعه دائماً في نهاية الجملة.'
                    : 'Remember: In Japanese, the copula "desu" belongs at the very end of the sentence.'
                }
              ]
            },
            {
              id: 'ja-ex-1-1-2',
              arabicThought: 'هذا ماء',
              englishTarget: 'これは水です',
              sourceThought: isAr ? 'هذا ماء' : 'This is water',
              targetSentence: 'これは水です',
              romajiTarget: 'Kore wa mizu desu',
              furiganaTarget: 'これは<ruby>水<rt>みず</rt></ruby>です',
              acceptableAlternatives: [
                'これはみずです',
                'kore wa mizu desu',
                '水です',
                'みずです'
              ],
              wordChips: ['これ', 'は', '水', 'です', 'みず', 'が', 'それ'],
              breakdownChunks: [
                {
                  arabicText: 'これ (kore)',
                  englishText: 'this',
                  sourceText: isAr ? 'هذا' : 'this',
                  targetText: 'これ',
                  role: 'subject',
                  explanation: 'Demonstrative pronoun (near the speaker)'
                },
                {
                  arabicText: 'は (wa)',
                  englishText: 'is for',
                  sourceText: isAr ? 'علامة المبتدأ' : 'topic marker',
                  targetText: 'は',
                  role: 'connector',
                  explanation: 'Topic particle'
                },
                {
                  arabicText: '水 (mizu)',
                  englishText: 'water',
                  sourceText: isAr ? 'ماء' : 'water',
                  targetText: '水',
                  role: 'object',
                  explanation: 'Noun (water)'
                },
                {
                  arabicText: 'です (desu)',
                  englishText: 'is',
                  sourceText: isAr ? 'فعل الكينونة' : 'is',
                  targetText: 'です',
                  role: 'verb',
                  explanation: 'Polite sentence ender'
                }
              ],
              habitHint: isAr
                ? 'اسم الإشارة القريب هو これ (kore). تليه أداة は ثم الكلمة ثم です.'
                : '"This" (close to speaker) is これ (kore). Follow with topic particle は, then noun + です.'
            },
            {
              id: 'ja-ex-1-1-3',
              arabicThought: 'كين أستاذ (معلّم)',
              englishTarget: 'ケンさんは先生です',
              sourceThought: isAr ? 'كين أستاذ' : 'Ken is a teacher',
              targetSentence: 'ケンさんは先生です',
              romajiTarget: 'Ken-san wa sensei desu',
              furiganaTarget: 'ケンさんは<ruby>先生<rt>せんせい</rt></ruby>です',
              acceptableAlternatives: [
                'ケンさんはせんせいです',
                'ken-san wa sensei desu',
                'ケンは先生です'
              ],
              wordChips: ['ケンさん', 'は', '先生', 'です', 'が', 'の', 'せんせい'],
              breakdownChunks: [
                {
                  arabicText: 'ケンさん',
                  englishText: 'Ken',
                  sourceText: isAr ? 'كين (مع لقب الاحترام san)' : 'Ken (polite suffix -san)',
                  targetText: 'ケンさん',
                  role: 'subject',
                  explanation: 'Subject with honorific title さん'
                },
                {
                  arabicText: 'は',
                  englishText: 'wa',
                  sourceText: isAr ? 'أداة は' : 'topic particle',
                  targetText: 'は',
                  role: 'connector',
                  explanation: 'Topic marker'
                },
                {
                  arabicText: '先生 (sensei)',
                  englishText: 'teacher',
                  sourceText: isAr ? 'معلم / أستاذ' : 'teacher',
                  targetText: '先生',
                  role: 'object',
                  explanation: 'Noun: teacher/doctor/master'
                },
                {
                  arabicText: 'です',
                  englishText: 'is',
                  sourceText: isAr ? 'هو (desu)' : 'is',
                  targetText: 'です',
                  role: 'verb',
                  explanation: 'Polite copula'
                }
              ],
              habitHint: isAr
                ? 'في الثقافة اليابانية، إضافة 先生 (sensei) أو さん (san) للأسماء دليل احترام أساسي.'
                : 'In Japanese culture, honorifics like さん (-san) and titles like 先生 (sensei) are essential for polite conversation.'
            }
          ]
        },
        {
          id: 'ja-p1-l2',
          phaseId: 1,
          phaseTitle: '基礎 The Core Skeleton & Particles',
          phaseLevel: 'N5 – N4',
          number: 2,
          title: 'Direct Object Particle を & Verb at the End',
          titleAr: 'أداة المفعول به (を - o) والفعل في نهاية الجملة',
          transferConcept: isAr
            ? 'عندما تفعل شيئاً بشيء ما (تشرب ماء، تأكل طعام)، يأتي المفعول به أولاً متبوعاً بحرف を (يُنطق o)، ثم يأتي الفعل الحركي في ختام الجملة! والضمير "أنا" يُحذف عادة لأن السياق واضح.'
            : 'In Japanese, the direct object comes BEFORE the verb and takes the particle を (pronounced "o"). The action verb is the closing word. Natural Japanese routinely omits "I" when obvious!',
          transferConceptAr: 'المفعول به يأخذ أداة を، والفعل الحركي يقف في ختام الجملة.',
          weakSpotTag: 'object-particle-wo',
          exercises: [
            {
              id: 'ja-ex-1-2-1',
              arabicThought: 'أنا أشرب ماء',
              englishTarget: '水を飲みます',
              sourceThought: isAr ? 'أنا أشرب ماء' : 'I drink water',
              targetSentence: '水を飲みます',
              romajiTarget: 'Mizu o nomimasu',
              furiganaTarget: '<ruby>水<rt>みず</rt></ruby>を<ruby>飲<rt>の</rt></ruby>みます',
              acceptableAlternatives: [
                'みずをのみます',
                'mizu o nomimasu',
                'mizu wo nomimasu',
                '私は水を飲みます',
                'わたしはみずをのみます'
              ],
              wordChips: ['水', 'を', '飲みます', '私', 'は', '飲んで', 'みず'],
              breakdownChunks: [
                {
                  arabicText: '水 (mizu)',
                  englishText: 'water',
                  sourceText: isAr ? 'ماء' : 'water',
                  targetText: '水',
                  role: 'object',
                  explanation: 'Direct object noun'
                },
                {
                  arabicText: 'を (o)',
                  englishText: 'object marker',
                  sourceText: isAr ? 'أداة المفعول به (o)' : 'object particle',
                  targetText: 'を',
                  role: 'connector',
                  explanation: 'Particle を marking direct object'
                },
                {
                  arabicText: '飲みます (nomimasu)',
                  englishText: 'drink',
                  sourceText: isAr ? 'أشرب (بصيغة المهذب masu)' : 'drink (polite -masu form)',
                  targetText: '飲みます',
                  role: 'verb',
                  explanation: 'Action verb at sentence end'
                }
              ],
              habitHint: isAr
                ? 'اليابانيون لا يكررون "أنا" (私) إذا كان واضحاً أنك تتحدث عن نفسك! ابدأ بالمفعول به 水 (الماء) ثم أداة を ثم الفعل 飲みます.'
                : 'Native speakers naturally drop "I" (Watashi)! Place the object "Mizu" + particle "o" + verb "nomimasu" at the end.'
            },
            {
              id: 'ja-ex-1-2-2',
              arabicThought: 'أنا آكل سوشي',
              englishTarget: '寿司を食べます',
              sourceThought: isAr ? 'أنا آكل سوشي' : 'I eat sushi',
              targetSentence: '寿司を食べます',
              romajiTarget: 'Sushi o tabemasu',
              furiganaTarget: '<ruby>寿司<rt>すし</rt></ruby>を<ruby>食<rt>た</rt></ruby>べます',
              acceptableAlternatives: [
                'すしをたべます',
                'sushi o tabemasu',
                'sushi wo tabemasu',
                '私は寿司を食べます'
              ],
              wordChips: ['寿司', 'を', '食べます', 'すし', 'は', '私', '食べて'],
              breakdownChunks: [
                {
                  arabicText: '寿司 (sushi)',
                  englishText: 'sushi',
                  sourceText: isAr ? 'سوشي' : 'sushi',
                  targetText: '寿司',
                  role: 'object',
                  explanation: 'Object food'
                },
                {
                  arabicText: 'を (o)',
                  englishText: 'object marker',
                  sourceText: isAr ? 'أداة المفعول' : 'object marker',
                  targetText: 'を',
                  role: 'connector',
                  explanation: 'Particle を'
                },
                {
                  arabicText: '食べます (tabemasu)',
                  englishText: 'eat',
                  sourceText: isAr ? 'آكل (صيغة masu المهذبة)' : 'eat (polite)',
                  targetText: '食べます',
                  role: 'verb',
                  explanation: 'Action verb at end'
                }
              ],
              habitHint: isAr
                ? 'الفعل "يأكل" هو 食べます (tabemasu). يسبقه المفعول به مع を.'
                : 'The verb "eat" is 食べます (tabemasu). It follows the direct object marked with を.'
            },
            {
              id: 'ja-ex-1-2-3',
              arabicThought: 'أنا أقرأ كتاباً',
              englishTarget: '本を読みます',
              sourceThought: isAr ? 'أنا أقرأ كتاباً' : 'I read a book',
              targetSentence: '本を読みます',
              romajiTarget: 'Hon o yomimasu',
              furiganaTarget: '<ruby>本<rt>ほん</rt></ruby>を<ruby>読<rt>よ</rt></ruby>みます',
              acceptableAlternatives: [
                'ほんをよみます',
                'hon o yomimasu',
                'hon wo yomimasu',
                '私は本を読みます'
              ],
              wordChips: ['本', 'を', '読みます', 'ほん', 'で', '私', '読んで'],
              breakdownChunks: [
                {
                  arabicText: '本 (hon)',
                  englishText: 'book',
                  sourceText: isAr ? 'كتاب' : 'book',
                  targetText: '本',
                  role: 'object',
                  explanation: 'Noun: book'
                },
                {
                  arabicText: 'を (o)',
                  englishText: 'object marker',
                  sourceText: isAr ? 'علامة المفعول به' : 'object particle',
                  targetText: 'を',
                  role: 'connector',
                  explanation: 'Particle を'
                },
                {
                  arabicText: '読みます (yomimasu)',
                  englishText: 'read',
                  sourceText: isAr ? 'أقرأ' : 'read',
                  targetText: '読みます',
                  role: 'verb',
                  explanation: 'Conjugated polite verb'
                }
              ],
              habitHint: isAr
                ? 'الكتاب هو 本 (hon)، والفعل يقرأ هو 読みます (yomimasu).'
                : '"Book" is 本 (hon), and "read" is 読みます (yomimasu).'
            }
          ]
        },
        {
          id: 'ja-p1-l3',
          phaseId: 1,
          phaseTitle: '基礎 The Core Skeleton & Particles',
          phaseLevel: 'N5 – N4',
          number: 3,
          title: 'Destination & Time Particle に (ni)',
          titleAr: 'حرف الوجهة والزمان المحدد (に - ni)',
          transferConcept: isAr
            ? 'عند التحرك نحو مكان (الذهاب إلى طوكيو، العودة للمنزل) أو تحديد وقت محدد (الساعة السابعة)، نستخدم حرف الوجهة والزمان に (ni). أفعال الحركة مثل 行きます (يذهب) تأتي في ختام الجملة.'
            : 'Movement towards a destination (going to Tokyo, returning home) or an exact time (at 7 o\'clock) takes the particle に (ni). Motion verbs like 行きます (ikimasu) anchor the clause.',
          transferConceptAr: 'حرف に يدل على الوجهة (إلى) أو الوقت المحدد (في تمام الساعة).',
          weakSpotTag: 'destination-particle-ni',
          exercises: [
            {
              id: 'ja-ex-1-3-1',
              arabicThought: 'أنا ذاهب إلى طوكيو',
              englishTarget: '東京に行きます',
              sourceThought: isAr ? 'أنا ذاهب إلى طوكيو' : 'I am going to Tokyo',
              targetSentence: '東京に行きます',
              romajiTarget: 'Tokyo ni ikimasu',
              furiganaTarget: '<ruby>東京<rt>とうきょう</rt></ruby>に<ruby>行<rt>い</rt></ruby>きます',
              acceptableAlternatives: [
                'とうきょうにいきます',
                'tokyo ni ikimasu',
                'toukyou ni ikimasu',
                '私は東京に行きます'
              ],
              wordChips: ['東京', 'に', '行きます', 'へ', 'で', 'とうきょう', '私'],
              breakdownChunks: [
                {
                  arabicText: '東京 (Tokyo)',
                  englishText: 'Tokyo',
                  sourceText: isAr ? 'طوكيو' : 'Tokyo',
                  targetText: '東京',
                  role: 'object',
                  explanation: 'Destination city'
                },
                {
                  arabicText: 'に (ni)',
                  englishText: 'to',
                  sourceText: isAr ? 'حرف الوجهة (إلى)' : 'direction particle (to)',
                  targetText: 'に',
                  role: 'connector',
                  explanation: 'Destination particle'
                },
                {
                  arabicText: '行きます (ikimasu)',
                  englishText: 'go / am going',
                  sourceText: isAr ? 'أذهب / ذاهب' : 'go',
                  targetText: '行きます',
                  role: 'verb',
                  explanation: 'Motion verb'
                }
              ],
              habitHint: isAr
                ? 'الوجهة تأتي قبل حرف に: 東京に行きます (إلى طوكيو أذهب).'
                : 'The destination precedes the particle に: 東京に行きます (Tokyo to I go).'
            },
            {
              id: 'ja-ex-1-3-2',
              arabicThought: 'أنا عائد إلى البيت',
              englishTarget: '家に帰ります',
              sourceThought: isAr ? 'أنا عائد إلى البيت' : 'I return home',
              targetSentence: '家に帰ります',
              romajiTarget: 'Ie ni kaerimasu',
              furiganaTarget: '<ruby>家<rt>いえ</rt></ruby>に<ruby>帰<rt>かえ</rt></ruby>ります',
              acceptableAlternatives: [
                'いえにかえります',
                'ie ni kaerimasu',
                'うちに帰ります',
                'うちにかえります'
              ],
              wordChips: ['家', 'に', '帰ります', 'うち', 'へ', 'で'],
              breakdownChunks: [
                {
                  arabicText: '家 (ie / uchi)',
                  englishText: 'home / house',
                  sourceText: isAr ? 'البيت' : 'home',
                  targetText: '家',
                  role: 'object',
                  explanation: 'Home noun'
                },
                {
                  arabicText: 'に (ni)',
                  englishText: 'to',
                  sourceText: isAr ? 'إلى' : 'to',
                  targetText: 'に',
                  role: 'connector',
                  explanation: 'Destination particle'
                },
                {
                  arabicText: '帰ります (kaerimasu)',
                  englishText: 'return home',
                  sourceText: isAr ? 'أعود / راجع' : 'return',
                  targetText: '帰ります',
                  role: 'verb',
                  explanation: 'Return verb'
                }
              ],
              habitHint: isAr
                ? 'فعل العودة للمنزل هو 帰ります (kaerimasu)، وهو مخصص لرجوع المرء لمكانه المعتاد.'
                : 'The verb 帰ります (kaerimasu) is specifically used for returning home or to one\'s base.'
            }
          ]
        }
      ]
    }
  ];
}

