import { Phase, SourceLanguage } from '../../types';

function sourceThought(source: SourceLanguage, ar: string, en: string): string {
  if (source === 'ar') return ar;
  return en; // TODO: add es/fr/zh/... when available
}

export function getJapanesePhases(source: SourceLanguage): Phase[] {
  const isAr = source === 'ar';

  return [
    {
      id: 1,
      title: '基礎 The Core Skeleton & Particles',
      titleAr: 'أساسيات البناء الياباني وحروف المعاني',
      level: 'N5 – N4',
      tagline: isAr
        ? 'أتقن وضع الفعل دائماً في نهاية الجملة (SOV)، وحروف الربط الأساسية (は, を, に, で)، وحذف الضمائر الزائدة.'
        : 'Master the strict SOV word order (verb at the end), core particles (は, を, に, で), and natural pronoun dropping.',
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
              sourceThought: sourceThought(source, 'أنا طالب', 'I am a student'),
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
                  sourceText: sourceThought(source, 'أنا', 'I'),
                  targetText: '私',
                  role: 'subject',
                  explanation: 'Topic pronoun (Watashi)'
                },
                {
                  arabicText: 'は (wa)',
                  englishText: 'topic marker',
                  sourceText: sourceThought(source, 'أداة الموضوع (は)', 'topic marker'),
                  targetText: 'は',
                  role: 'connector',
                  explanation: 'Particle は pronounced "wa" marking the topic'
                },
                {
                  arabicText: '学生 (gakusei)',
                  englishText: 'student',
                  sourceText: sourceThought(source, 'طالب', 'student'),
                  targetText: '学生',
                  role: 'object',
                  explanation: 'Noun (student)'
                },
                {
                  arabicText: 'です (desu)',
                  englishText: 'am / is',
                  sourceText: sourceThought(source, 'فعل الربط المهذب (desu)', 'polite copula (am/is)'),
                  targetText: 'です',
                  role: 'verb',
                  explanation: 'Polite copula anchoring the sentence'
                }
              ],
              habitHint: isAr
                ? 'في اليابانية، فعل الربط です (desu) يقف دائماً في ختام الجملة! المبتدأ + は + الخبر + です.'
                : 'In Japanese, the polite copula です (desu) sits at the very end! Topic + は + noun + です.',
              specificMisconceptions: [
                {
                  pattern: '^です',
                  diagnosis: isAr
                    ? 'انتبه: لا تبدأ بفعل الربط です، بل ضعه دائماً في نهاية الجملة.'
                    : 'Remember: In Japanese, the copula "desu" belongs at the very end of the sentence.'
                }
              ]
            },
            {
              id: 'ja-ex-1-1-2',
              arabicThought: 'هذا ماء',
              englishTarget: 'これは水です',
              sourceThought: sourceThought(source, 'هذا ماء', 'This is water'),
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
                  sourceText: sourceThought(source, 'هذا', 'this'),
                  targetText: 'これ',
                  role: 'subject',
                  explanation: 'Demonstrative pronoun (near the speaker)'
                },
                {
                  arabicText: 'は (wa)',
                  englishText: 'is for',
                  sourceText: sourceThought(source, 'علامة المبتدأ', 'topic marker'),
                  targetText: 'は',
                  role: 'connector',
                  explanation: 'Topic particle'
                },
                {
                  arabicText: '水 (mizu)',
                  englishText: 'water',
                  sourceText: sourceThought(source, 'ماء', 'water'),
                  targetText: '水',
                  role: 'object',
                  explanation: 'Noun (water)'
                },
                {
                  arabicText: 'です (desu)',
                  englishText: 'is',
                  sourceText: sourceThought(source, 'فعل الربط', 'is'),
                  targetText: 'です',
                  role: 'verb',
                  explanation: 'Polite sentence ender'
                }
              ],
              habitHint: isAr
                ? 'اسم الإشارة القريب هو これ (kore). تليه أداة は ثم الكلمة ثم です.'
                : '"This" (close to speaker) is これ (kore). Follow with topic particle は, then noun + です.'
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
              sourceThought: sourceThought(source, 'أنا أشرب ماء', 'I drink water'),
              targetSentence: '水を飲みます',
              romajiTarget: 'Mizu o nomimasu',
              furiganaTarget: '<ruby>水<rt>みず</rt></ruby>を<ruby>飲<rt>の</rt></ruby>みます',
              acceptableAlternatives: [
                'みずをのみます',
                'mizu o nomimasu',
                'mizu wo nomimasu',
                '私は水を飲みます'
              ],
              wordChips: ['水', 'を', '飲みます', '私', 'は', '飲んで', 'みず'],
              breakdownChunks: [
                {
                  arabicText: '水 (mizu)',
                  englishText: 'water',
                  sourceText: sourceThought(source, 'ماء', 'water'),
                  targetText: '水',
                  role: 'object',
                  explanation: 'Direct object noun'
                },
                {
                  arabicText: 'を (o)',
                  englishText: 'object marker',
                  sourceText: sourceThought(source, 'أداة المفعول به (o)', 'object particle'),
                  targetText: 'を',
                  role: 'connector',
                  explanation: 'Particle を marking direct object'
                },
                {
                  arabicText: '飲みます (nomimasu)',
                  englishText: 'drink',
                  sourceText: sourceThought(source, 'أشرب (بصيغة المهذب masu)', 'drink (polite -masu form)'),
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
              sourceThought: sourceThought(source, 'أنا آكل سوشي', 'I eat sushi'),
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
                  sourceText: sourceThought(source, 'سوشي', 'sushi'),
                  targetText: '寿司',
                  role: 'object',
                  explanation: 'Object food'
                },
                {
                  arabicText: 'を (o)',
                  englishText: 'object marker',
                  sourceText: sourceThought(source, 'أداة المفعول', 'object marker'),
                  targetText: 'を',
                  role: 'connector',
                  explanation: 'Particle を'
                },
                {
                  arabicText: '食べます (tabemasu)',
                  englishText: 'eat',
                  sourceText: sourceThought(source, 'آكل (صيغة masu المهذبة)', 'eat (polite)'),
                  targetText: '食べます',
                  role: 'verb',
                  explanation: 'Action verb at end'
                }
              ],
              habitHint: isAr
                ? 'الفعل "يأكل" هو 食べます (tabemasu). يسبقه المفعول به مع を.'
                : 'The verb "eat" is 食べます (tabemasu). It follows the direct object marked with を.'
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
              sourceThought: sourceThought(source, 'أنا ذاهب إلى طوكيو', 'I am going to Tokyo'),
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
                  sourceText: sourceThought(source, 'طوكيو', 'Tokyo'),
                  targetText: '東京',
                  role: 'object',
                  explanation: 'Destination city'
                },
                {
                  arabicText: 'に (ni)',
                  englishText: 'to',
                  sourceText: sourceThought(source, 'حرف الوجهة (إلى)', 'direction particle (to)'),
                  targetText: 'に',
                  role: 'connector',
                  explanation: 'Destination particle'
                },
                {
                  arabicText: '行きます (ikimasu)',
                  englishText: 'go / am going',
                  sourceText: sourceThought(source, 'أذهب / ذاهب', 'go'),
                  targetText: '行きます',
                  role: 'verb',
                  explanation: 'Motion verb'
                }
              ],
              habitHint: isAr
                ? 'الوجهة تأتي قبل حرف に: 東京に行きます (إلى طوكيو أذهب).'
                : 'The destination precedes the particle に: 東京に行きます (Tokyo to I go).'
            }
          ]
        },
        {
          id: 'ja-p1-l4',
          phaseId: 1,
          phaseTitle: '基礎 The Core Skeleton & Particles',
          phaseLevel: 'N5 – N4',
          number: 4,
          title: 'Location of Action Particle で (de)',
          titleAr: 'حرف مكان حدوث الفعل (で - de)',
          transferConcept: isAr
            ? 'عند التعبير عن المكان الذي يحدث فيه الأكشن أو النشاط (مثل الأكل في المطعم، العمل في الشركة)، نستخدم حرف المكان で (de).'
            : 'To specify the location where an action or event takes place (e.g., eating at a restaurant, studying at home), attach the particle で (de) to the place noun.',
          transferConceptAr: 'مكان حدوث النشاط يأخذ الأداة で.',
          weakSpotTag: 'action-location-de',
          exercises: [
            {
              id: 'ja-ex-1-4-1',
              arabicThought: 'أنا أقرأ كتاباً في المكتبة',
              englishTarget: '図書館で本を読みます',
              sourceThought: sourceThought(source, 'أنا أقرأ كتاباً في المكتبة', 'I read a book at the library'),
              targetSentence: '図書館で本を読みます',
              romajiTarget: 'Toshokan de hon o yomimasu',
              furiganaTarget: '<ruby>図書館<rt>としょかん</rt></ruby>で<ruby>本<rt>ほん</rt></ruby>を<ruby>読<rt>よ</rt></ruby>みます',
              acceptableAlternatives: [
                'としょかんでほんをよみます',
                'toshokan de hon o yomimasu'
              ],
              wordChips: ['図書館', 'で', '本', 'を', '読みます', 'に', 'へ'],
              breakdownChunks: [
                {
                  arabicText: '図書館 (toshokan)',
                  englishText: 'library',
                  sourceText: sourceThought(source, 'المكتبة', 'library'),
                  targetText: '図書館',
                  role: 'object',
                  explanation: 'Location noun'
                },
                {
                  arabicText: 'で (de)',
                  englishText: 'at / in',
                  sourceText: sourceThought(source, 'في (مكان الفعل)', 'at (action location)'),
                  targetText: 'で',
                  role: 'connector',
                  explanation: 'Location of action particle'
                },
                {
                  arabicText: '本を (hon o)',
                  englishText: 'book',
                  sourceText: sourceThought(source, 'كتاباً', 'book'),
                  targetText: '本を',
                  role: 'object',
                  explanation: 'Direct object phrase'
                },
                {
                  arabicText: '読みます (yomimasu)',
                  englishText: 'read',
                  sourceText: sourceThought(source, 'أقرأ', 'read'),
                  targetText: '読みます',
                  role: 'verb',
                  explanation: 'Final verb'
                }
              ],
              habitHint: isAr
                ? 'مكان الأكشن يأخذ で والمفعول يأخذ を والفعل يختم الجملة.'
                : 'Action location takes で, direct object takes を, and verb ends the sentence.'
            }
          ]
        }
      ]
    },
    {
      id: 2,
      title: '文法 Connections & Describing Actions',
      titleAr: 'ربط الجمل وتوصيف الأفعال باليابانية',
      level: 'N4 – N3',
      tagline: isAr
        ? 'تعلم صيغة الربط (Te-form)، التعبير عن الماضي (ました/でした)، وتوضيح الأسباب (から/ので).'
        : 'Master the Te-form for connecting actions, past tense markers (mashita/desu), and expressing reason (kara/node).',
      lessons: [
        {
          id: 'ja-p2-l1',
          phaseId: 2,
          phaseTitle: '文法 Connections & Describing Actions',
          phaseLevel: 'N4 – N3',
          number: 1,
          title: 'Connecting Actions with Te-Form (て / で)',
          titleAr: 'ربط الأحداث المتتالية بصيغة て (Te-form)',
          transferConcept: isAr
            ? 'لربط فعلين متتاليين (أشرب القهوة ثم أقرأ)، تحول الفعل الأول إلى صيغة て (مثل 飲んで) وتكمل الجملة بالفعل الثاني!'
            : 'To connect sequence of actions ("I drink coffee and then read"), convert the first verb to its Te-form (e.g. 飲んで) and finish with the second verb.',
          transferConceptAr: 'صيغة て تربط الأفعال المتتالية في جملة واحدة انسيابية.',
          weakSpotTag: 'te-form-connections',
          exercises: [
            {
              id: 'ja-ex-2-1-1',
              arabicThought: 'أنا أشرب القهوة وأقرأ الكتاب',
              englishTarget: 'コーヒーを飲んで本を読みます',
              sourceThought: sourceThought(source, 'أنا أشرب القهوة وأقرأ الكتاب', 'I drink coffee and read the book'),
              targetSentence: 'コーヒーを飲んで本を読みます',
              romajiTarget: 'Koohi o nonde hon o yomimasu',
              furiganaTarget: 'コーヒーを<ruby>飲<rt>の</rt></ruby>んで<ruby>本<rt>ほん</rt></ruby>を<ruby>読<rt>よ</rt></ruby>みます',
              acceptableAlternatives: [
                 'koohi o nonde hon o yomimasu',
                 'コーヒーをのんでほんをよみます'
              ],
              wordChips: ['コーヒーを', '飲んで', '本を', '読みます', '飲みます', 'と'],
              breakdownChunks: [
                {
                  arabicText: 'コーヒーを',
                  englishText: 'coffee',
                  sourceText: sourceThought(source, 'القهوة', 'coffee'),
                  targetText: 'コーヒーを',
                  role: 'object',
                  explanation: 'First object + particle'
                },
                {
                  arabicText: '飲んで (nonde)',
                  englishText: 'drink and...',
                  sourceText: sourceThought(source, 'أشرب و...', 'drink and'),
                  targetText: '飲んで',
                  role: 'connector',
                  explanation: 'Te-form of nomimasu connecting actions'
                },
                {
                  arabicText: '本を読みます',
                  englishText: 'read book',
                  sourceText: sourceThought(source, 'أقرأ الكتاب', 'read the book'),
                  targetText: '本を読みます',
                  role: 'verb',
                  explanation: 'Final action clause'
                }
              ],
              habitHint: isAr
                ? 'استخدم صيغة て (飲んで) لربط الفعل الأول بالفعل الثاني بدون حشو.'
                : 'Use Te-form (飲んで) to link sequential actions smoothly.'
            }
          ]
        },
        {
          id: 'ja-p2-l2',
          phaseId: 2,
          phaseTitle: '文法 Connections & Describing Actions',
          phaseLevel: 'N4 – N3',
          number: 2,
          title: 'Polite Past Tense (ました / でした)',
          titleAr: 'الماضي المهذب باليابانية (ました و でした)',
          transferConcept: isAr
            ? 'للتعبير عن الماضي المهذب، يتغير です إلى でした مع الأسماء، ويتغير します إلى ました مع الأفعال: 勉強しました (درست).'
            : 'For polite past tense, "desu" shifts to "deshita" for nouns, and verb ending "-masu" shifts to "-mashita": e.g., 勉強しました (studied).',
          transferConceptAr: 'الماضي مع الأسماء = でした، ومع الأفعال = ました.',
          weakSpotTag: 'past-tense-polite',
          exercises: [
            {
              id: 'ja-ex-2-2-1',
              arabicThought: 'أنا درست اليابانية بالأمس',
              englishTarget: '昨日日本語を勉強しました',
              sourceThought: sourceThought(source, 'أنا درست اليابانية بالأمس', 'Yesterday I studied Japanese'),
              targetSentence: '昨日日本語を勉強しました',
              romajiTarget: 'Kinou nihongo o benkyou shimashita',
              furiganaTarget: '<ruby>昨日<rt>きのう</rt></ruby><ruby>日本語<rt>にほんご</rt></ruby>を<ruby>勉強<rt>べんきょう</rt></ruby>しました',
              acceptableAlternatives: [
                'きのうにほんごをべんきょうしました',
                'kinou nihongo o benkyou shimashita'
              ],
              wordChips: ['昨日', '日本語を', '勉強しました', '勉強します', 'でした', 'は'],
              breakdownChunks: [
                {
                  arabicText: '昨日 (kinou)',
                  englishText: 'yesterday',
                  sourceText: sourceThought(source, 'الأمس', 'yesterday'),
                  targetText: '昨日',
                  role: 'connector',
                  explanation: 'Time adverb'
                },
                {
                  arabicText: '日本語を',
                  englishText: 'Japanese language',
                  sourceText: sourceThought(source, 'اليابانية', 'Japanese'),
                  targetText: '日本語を',
                  role: 'object',
                  explanation: 'Language object + を'
                },
                {
                  arabicText: '勉強しました',
                  englishText: 'studied',
                  sourceText: sourceThought(source, 'درست (ماضي)', 'studied'),
                  targetText: '勉強しました',
                  role: 'verb',
                  explanation: 'Past polite verb ending in -mashita'
                }
              ],
              habitHint: isAr
                ? 'الفعل الماضي المهذب يختم بـ ました (benkyou shimashita).'
                : 'Polite past verb forms end in -mashita.'
            }
          ]
        }
      ]
    },
    {
      id: 3,
      title: '応用 Mastery, Politeness & Natural Context',
      titleAr: 'الإتقان واليابانية الطبيعية الاحترافية',
      level: 'N3 – N2',
      tagline: isAr
        ? 'أتقن صيغة الإمكانية (できます)، الاحترام الياباني الفائق (Keigo)، وإسقاط الضمائر بالسياق الطبيعي.'
        : 'Master potential forms (dekimasu), refined Japanese politeness (Keigo), and context-aware flow.',
      lessons: [
        {
          id: 'ja-p3-l1',
          phaseId: 3,
          phaseTitle: '応用 Mastery, Politeness & Natural Context',
          phaseLevel: 'N3 – N2',
          number: 1,
          title: 'Expressing Ability & Potential (できます)',
          titleAr: 'التعبير عن القدرة والاستطاعة (できます)',
          transferConcept: isAr
            ? 'للتعبير عن استطاعة فعل شيء (أستطيع التحدث باليابانية)، نستخدم الاسم المتبوع بـ ができます: 日本語ができます.'
            : 'To express ability ("I can speak Japanese"), connect the target noun/skill with particle が followed by できます (dekimasu).',
          transferConceptAr: 'القدرة والاستطاعة = Skill + ができます.',
          weakSpotTag: 'potential-dekimasu',
          exercises: [
            {
              id: 'ja-ex-3-1-1',
              arabicThought: 'أنا أستطيع التحدث باليابانية',
              englishTarget: '日本語ができます',
              sourceThought: sourceThought(source, 'أنا أستطيع التحدث باليابانية', 'I can speak Japanese'),
              targetSentence: '日本語ができます',
              romajiTarget: 'Nihongo ga dekimasu',
              furiganaTarget: '<ruby>日本語<rt>にほんご</rt></ruby>ができます',
              acceptableAlternatives: [
                'にほんごができます',
                'nihongo ga dekimasu'
              ],
              wordChips: ['日本語', 'が', 'できます', 'を', 'は', '私'],
              breakdownChunks: [
                {
                  arabicText: '日本語 (nihongo)',
                  englishText: 'Japanese language',
                  sourceText: sourceThought(source, 'اليابانية', 'Japanese'),
                  targetText: '日本語',
                  role: 'object',
                  explanation: 'Target skill noun'
                },
                {
                  arabicText: 'が (ga)',
                  englishText: 'subject particle',
                  sourceText: sourceThought(source, 'حرف الفاعل/القدرة', 'potential subject particle'),
                  targetText: 'が',
                  role: 'connector',
                  explanation: 'Particle が used with potential verbs'
                },
                {
                  arabicText: 'できます (dekimasu)',
                  englishText: 'can do / be capable',
                  sourceText: sourceThought(source, 'أستطيع', 'can do'),
                  targetText: 'できます',
                  role: 'verb',
                  explanation: 'Potential verb form'
                }
              ],
              habitHint: isAr
                ? 'تذكر أن صيغة القدرة できます تأخذ حرف が وليس を.'
                : 'Note that the potential verb できます takes particle が instead of を.'
            }
          ]
        }
      ]
    }
  ];
}
