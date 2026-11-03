import { Phase, SourceLanguage } from '../../types';

export function getGermanPhases(source: SourceLanguage): Phase[] {
  const isAr = source === 'ar';

  return [
    {
      id: 1,
      title: 'Das Fundament · German Foundations',
      titleAr: 'الأساسات الألمانية وهيكل الجملة الصارم',
      level: 'A1 – A2',
      tagline: isAr
        ? 'أتقن تموضع الفعل الإلزامي (V2)، أدوات التعريف الثلاث، وتصريف المفعول به المباشر.'
        : 'Master the strict V2 verb rule, the 3 genders (der/die/das), and accusative case shifts.',
      lessons: [
        {
          id: 'de-p1-l1',
          phaseId: 1,
          phaseTitle: 'Das Fundament · German Foundations',
          phaseLevel: 'A1 – A2',
          number: 1,
          title: 'The Strict V2 Word Order Rule',
          titleAr: 'قاعدة الفعل الثاني الصارمة (Verb-Zweit-Regel)',
          transferConcept: isAr
            ? 'في العربية والإنجليزية، إذا بدأت بالظرف مثل "اليوم"، يمكنك القول "اليوم أنا أشرب قهوة". في الألمانية، الفعل المصرف محبوس ومغناطيسي في الموقع رقم 2 دائماً! إذا بدأت بـ Heute، ينعكس الفاعل ليأتي بعد الفعل مباشرة: Heute trinke ich Kaffee.'
            : 'In English, starting with a time word allows: "Today I drink coffee". In German main clauses, the conjugated verb MUST occupy Position 2. If Position 1 is taken by "Heute", the subject steps directly behind the verb: "Heute trinke ich Kaffee".',
          transferConceptAr: 'في الألمانية، الفعل المصرف محبوس في الموقع الثاني دائماً. إذا بدأت بالزمان، ينعكس الفاعل بعد الفعل: Heute trinke ich Kaffee.',
          weakSpotTag: 'v2-word-order',
          exercises: [
            {
              id: 'de-ex-1-1-1',
              arabicThought: 'اليوم أنا أشرب قهوة',
              englishTarget: 'Heute trinke ich Kaffee',
              sourceThought: isAr ? 'اليوم أنا أشرب قهوة' : 'Today I am drinking coffee',
              targetSentence: 'Heute trinke ich Kaffee',
              acceptableAlternatives: ['Heute trinke ich den Kaffee', 'Ich trinke heute Kaffee'],
              wordChips: ['Heute', 'trinke', 'ich', 'Kaffee', 'ist', 'der', 'trinken'],
              breakdownChunks: [
                {
                  arabicText: 'Heute',
                  englishText: 'Today',
                  sourceText: isAr ? 'اليوم' : 'Today',
                  targetText: 'Heute',
                  role: 'connector',
                  explanation: 'Position 1: Time adverbial'
                },
                {
                  arabicText: 'trinke',
                  englishText: 'drink',
                  sourceText: isAr ? 'أشرب' : 'am drinking',
                  targetText: 'trinke',
                  role: 'verb',
                  explanation: 'Position 2: Conjugated verb locked in position'
                },
                {
                  arabicText: 'ich',
                  englishText: 'I',
                  sourceText: isAr ? 'أنا' : 'I',
                  targetText: 'ich',
                  role: 'subject',
                  explanation: 'Position 3: Inverted subject after verb'
                },
                {
                  arabicText: 'Kaffee',
                  englishText: 'coffee',
                  sourceText: isAr ? 'قهوة' : 'coffee',
                  targetText: 'Kaffee',
                  role: 'object',
                  explanation: 'Capitalized masculine noun complement'
                }
              ],
              habitHint: isAr
                ? 'في الألمانية، الفعل مكانه محجوز دائماً في الخانة الثانية! بما أننا بدأنا بـ "Heute"، يجب أن يأتي الفعل "trinke" فوراً ثم يليه "ich".'
                : 'German main clauses strictly enforce the V2 rule! Because "Heute" takes position 1, the verb "trinke" must come second, pushing "ich" to position 3.',
              specificMisconceptions: [
                {
                  pattern: '^heute ich',
                  diagnosis: isAr
                    ? 'انتبه: لا تقل "Heute ich trinke". في الألمانية، الفعل trinke يجب أن يكون في الموقع 2 دائماً.'
                    : 'Notice V2 interference: Never say "Heute ich trinke". The verb must follow position 1 immediately: "Heute trinke ich".'
                }
              ]
            },
            {
              id: 'de-ex-1-1-2',
              arabicThought: 'الآن نحن نتعلّم الألمانية',
              englishTarget: 'Jetzt lernen wir Deutsch',
              sourceThought: isAr ? 'الآن نحن نتعلّم الألمانية' : 'Now we are learning German',
              targetSentence: 'Jetzt lernen wir Deutsch',
              acceptableAlternatives: ['Wir lernen jetzt Deutsch'],
              wordChips: ['Jetzt', 'lernen', 'wir', 'Deutsch', 'sind', 'das', 'lerne'],
              breakdownChunks: [
                {
                  arabicText: 'Jetzt',
                  englishText: 'Now',
                  sourceText: isAr ? 'الآن' : 'Now',
                  targetText: 'Jetzt',
                  role: 'connector',
                  explanation: 'Position 1: Time adverb'
                },
                {
                  arabicText: 'lernen',
                  englishText: 'learn',
                  sourceText: isAr ? 'نتعلم' : 'are learning',
                  targetText: 'lernen',
                  role: 'verb',
                  explanation: 'Position 2: Locked conjugated verb for wir'
                },
                {
                  arabicText: 'wir',
                  englishText: 'we',
                  sourceText: isAr ? 'نحن' : 'we',
                  targetText: 'wir',
                  role: 'subject',
                  explanation: 'Position 3: Inverted subject'
                },
                {
                  arabicText: 'Deutsch',
                  englishText: 'German',
                  sourceText: isAr ? 'الألمانية' : 'German',
                  targetText: 'Deutsch',
                  role: 'object',
                  explanation: 'Language object noun (capitalized)'
                }
              ],
              habitHint: isAr
                ? 'ابدأ بـ Jetzt، ثم ضع الفعل lernen مباشرة في الخانة الثانية قبل الضمير wir.'
                : 'Start with "Jetzt", lock the verb "lernen" in position 2, followed by the subject "wir".'
            },
            {
              id: 'de-ex-1-1-3',
              arabicThought: 'غداً هو يسافر إلى برلين',
              englishTarget: 'Morgen reist er nach Berlin',
              sourceThought: isAr ? 'غداً هو يسافر إلى برلين' : 'Tomorrow he travels to Berlin',
              targetSentence: 'Morgen reist er nach Berlin',
              acceptableAlternatives: ['Morgen fährt er nach Berlin', 'Er reist morgen nach Berlin'],
              wordChips: ['Morgen', 'reist', 'er', 'nach', 'Berlin', 'fährt', 'ist'],
              breakdownChunks: [
                {
                  arabicText: 'Morgen',
                  englishText: 'Tomorrow',
                  sourceText: isAr ? 'غداً' : 'Tomorrow',
                  targetText: 'Morgen',
                  role: 'connector',
                  explanation: 'Time modifier in position 1'
                },
                {
                  arabicText: 'reist',
                  englishText: 'travels',
                  sourceText: isAr ? 'يسافر' : 'travels',
                  targetText: 'reist',
                  role: 'verb',
                  explanation: 'Conjugated verb in position 2'
                },
                {
                  arabicText: 'er',
                  englishText: 'he',
                  sourceText: isAr ? 'هو' : 'he',
                  targetText: 'er',
                  role: 'subject',
                  explanation: 'Inverted subject'
                },
                {
                  arabicText: 'nach Berlin',
                  englishText: 'to Berlin',
                  sourceText: isAr ? 'إلى برلين' : 'to Berlin',
                  targetText: 'nach Berlin',
                  role: 'modifier',
                  explanation: 'Directional prepositional phrase'
                }
              ],
              habitHint: isAr
                ? 'المدن والبلدان بدون أدوات تأخذ حرف الجر nach (إلى برلين = nach Berlin).'
                : 'Cities and countries without articles take the preposition "nach" (to Berlin = nach Berlin).'
            }
          ]
        },
        {
          id: 'de-p1-l2',
          phaseId: 1,
          phaseTitle: 'Das Fundament · German Foundations',
          phaseLevel: 'A1 – A2',
          number: 2,
          title: 'The 3 Genders & Accusative Case',
          titleAr: 'أدوات التعريف الثلاث وتصريف المفعول به (Akkusativ)',
          transferConcept: isAr
            ? 'الأسماء في الألمانية إما مذكر (der) أو مؤنث (die) أو محايد (das). عندما يقع الاسم المذكر مفعولاً به مباشراً (Akkusativ)، تتحول أداة التعريف der إلى den وأداة النكرة ein إلى einen! أما المؤنث والمحايد فلا يتغيران.'
            : 'German nouns have 3 genders: masculine (der), feminine (die), and neuter (das). When a masculine noun is a direct object (Accusative), "der" shifts to "den" and "ein" shifts to "einen"!',
          transferConceptAr: 'الاسم المذكر يتحول في المفعول به من der إلى den ومن ein إلى einen (Ich habe einen Bruder).',
          weakSpotTag: 'accusative-case',
          exercises: [
            {
              id: 'de-ex-1-2-1',
              arabicThought: 'أنا أحتاج قهوة (مذكّرة)',
              englishTarget: 'Ich brauche einen Kaffee',
              sourceThought: isAr ? 'أنا أحتاج قهوة' : 'I need a coffee',
              targetSentence: 'Ich brauche einen Kaffee',
              acceptableAlternatives: ['Ich brauche den Kaffee'],
              wordChips: ['Ich', 'brauche', 'einen', 'Kaffee', 'ein', 'der', 'Kaffees'],
              breakdownChunks: [
                {
                  arabicText: 'Ich',
                  englishText: 'I',
                  sourceText: isAr ? 'أنا' : 'I',
                  targetText: 'Ich',
                  role: 'subject',
                  explanation: 'Nominative subject'
                },
                {
                  arabicText: 'brauche',
                  englishText: 'need',
                  sourceText: isAr ? 'أحتاج' : 'need',
                  targetText: 'brauche',
                  role: 'verb',
                  explanation: 'Action verb requiring accusative object'
                },
                {
                  arabicText: 'einen Kaffee',
                  englishText: 'a coffee',
                  sourceText: isAr ? 'قهوة' : 'a coffee',
                  targetText: 'einen Kaffee',
                  role: 'object',
                  explanation: 'Masculine accusative indefinite article: ein -> einen'
                }
              ],
              habitHint: isAr
                ? 'كلمة Kaffee مذكرة (der Kaffee). وبما أنها مفعول به هنا، فإن "ein" تتحول إجبارياً إلى "einen".'
                : 'Coffee is masculine (der Kaffee). Since it is the direct object here, "ein" becomes "einen".'
            },
            {
              id: 'de-ex-1-2-2',
              arabicThought: 'هي ترى الكلب',
              englishTarget: 'Sie sieht den Hund',
              sourceThought: isAr ? 'هي ترى الكلب' : 'She sees the dog',
              targetSentence: 'Sie sieht den Hund',
              acceptableAlternatives: ['Sie sieht einen Hund'],
              wordChips: ['Sie', 'sieht', 'den', 'Hund', 'der', 'das', 'Hunde'],
              breakdownChunks: [
                {
                  arabicText: 'Sie',
                  englishText: 'She',
                  sourceText: isAr ? 'هي' : 'She',
                  targetText: 'Sie',
                  role: 'subject',
                  explanation: 'Subject pronoun'
                },
                {
                  arabicText: 'sieht',
                  englishText: 'sees',
                  sourceText: isAr ? 'ترى' : 'sees',
                  targetText: 'sieht',
                  role: 'verb',
                  explanation: 'Transitive verb (sehen)'
                },
                {
                  arabicText: 'den Hund',
                  englishText: 'the dog',
                  sourceText: isAr ? 'الكلب' : 'the dog',
                  targetText: 'den Hund',
                  role: 'object',
                  explanation: 'Masculine accusative: der Hund -> den Hund'
                }
              ],
              habitHint: isAr
                ? 'الكلب مذكر (der Hund). في حالة المفعول به، تتحول der إلى den.'
                : 'Dog is masculine (der Hund). In accusative case, "der" turns into "den".'
            },
            {
              id: 'de-ex-1-2-3',
              arabicThought: 'نحن لدينا مشكلة (محايدة)',
              englishTarget: 'Wir haben ein Problem',
              sourceThought: isAr ? 'نحن لدينا مشكلة' : 'We have a problem',
              targetSentence: 'Wir haben ein Problem',
              acceptableAlternatives: ['Wir haben das Problem'],
              wordChips: ['Wir', 'haben', 'ein', 'Problem', 'einen', 'das', 'habe'],
              breakdownChunks: [
                {
                  arabicText: 'Wir',
                  englishText: 'We',
                  sourceText: isAr ? 'نحن' : 'We',
                  targetText: 'Wir',
                  role: 'subject',
                  explanation: 'Subject'
                },
                {
                  arabicText: 'haben',
                  englishText: 'have',
                  sourceText: isAr ? 'لدينا' : 'have',
                  targetText: 'haben',
                  role: 'verb',
                  explanation: 'Verb'
                },
                {
                  arabicText: 'ein Problem',
                  englishText: 'a problem',
                  sourceText: isAr ? 'مشكلة' : 'a problem',
                  targetText: 'ein Problem',
                  role: 'object',
                  explanation: 'Neuter accusative: das Problem remains ein Problem'
                }
              ],
              habitHint: isAr
                ? 'كلمة Problem محايدة (das Problem)، والاسم المحايد لا يتغير في المفعول به (ein Problem).'
                : 'Problem is neuter (das Problem), and neuter nouns keep "ein" in the accusative.'
            }
          ]
        },
        {
          id: 'de-p1-l3',
          phaseId: 1,
          phaseTitle: 'Das Fundament · German Foundations',
          phaseLevel: 'A1 – A2',
          number: 3,
          title: 'Separable Verbs & The Clause Bracket',
          titleAr: 'الأفعال المنفصلة وقوس الجملة (Trennbare Verben)',
          transferConcept: isAr
            ? 'الأفعال المنفصلة (مثل anrufen = يتصل هاتفياً) تنشطر في المضارع: الفعل الأساسي يظل في الموقع 2، بينما البادئة (an) تطير إلى آخر الجملة تماماً كقوس يحيط بالكلام: Ich rufe dich morgen an!'
            : 'Separable verbs split in present tense main clauses: the conjugated stem takes position 2, and the prefix travels to the very end of the sentence: "Ich rufe dich morgen an!"',
          transferConceptAr: 'الفعل المنفصل ينقسم لنصفين: الأساس في الموقع 2 والبادئة في نهاية الجملة.',
          weakSpotTag: 'separable-verbs',
          exercises: [
            {
              id: 'de-ex-1-3-1',
              arabicThought: 'أنا سأتصل بك غداً (anrufen)',
              englishTarget: 'Ich rufe dich morgen an',
              sourceThought: isAr ? 'أنا سأتصل بك غداً' : 'I will call you tomorrow',
              targetSentence: 'Ich rufe dich morgen an',
              acceptableAlternatives: ['Morgen rufe ich dich an'],
              wordChips: ['Ich', 'rufe', 'dich', 'morgen', 'an', 'anrufen', 'werde'],
              breakdownChunks: [
                {
                  arabicText: 'Ich',
                  englishText: 'I',
                  sourceText: isAr ? 'أنا' : 'I',
                  targetText: 'Ich',
                  role: 'subject',
                  explanation: 'Subject pronoun'
                },
                {
                  arabicText: 'rufe',
                  englishText: 'call',
                  sourceText: isAr ? 'أتصل' : 'call',
                  targetText: 'rufe',
                  role: 'verb',
                  explanation: 'Verb stem in position 2'
                },
                {
                  arabicText: 'dich morgen',
                  englishText: 'you tomorrow',
                  sourceText: isAr ? 'بك غداً' : 'you tomorrow',
                  targetText: 'dich morgen',
                  role: 'object',
                  explanation: 'Pronoun object + time adverb'
                },
                {
                  arabicText: 'an',
                  englishText: '(up)',
                  sourceText: isAr ? 'بادئة (an)' : 'prefix',
                  targetText: 'an',
                  role: 'modifier',
                  explanation: 'Separated prefix at the absolute end of the sentence'
                }
              ],
              habitHint: isAr
                ? 'الفعل anrufen ينقسم: rufe في الموقع الثاني، و an تقف في نهاية الجملة كقفل ختامي.'
                : 'The verb "anrufen" splits: "rufe" is in position 2, and "an" stands at the very end of the sentence.'
            },
            {
              id: 'de-ex-1-3-2',
              arabicThought: 'القطار يصل الآن (ankommen)',
              englishTarget: 'Der Zug kommt jetzt an',
              sourceThought: isAr ? 'القطار يصل الآن' : 'The train is arriving now',
              targetSentence: 'Der Zug kommt jetzt an',
              acceptableAlternatives: ['Jetzt kommt der Zug an'],
              wordChips: ['Der', 'Zug', 'kommt', 'jetzt', 'an', 'ankommt', 'ist'],
              breakdownChunks: [
                {
                  arabicText: 'Der Zug',
                  englishText: 'The train',
                  sourceText: isAr ? 'القطار' : 'The train',
                  targetText: 'Der Zug',
                  role: 'subject',
                  explanation: 'Subject noun phrase'
                },
                {
                  arabicText: 'kommt',
                  englishText: 'comes',
                  sourceText: isAr ? 'يصل' : 'is arriving',
                  targetText: 'kommt',
                  role: 'verb',
                  explanation: 'Verb stem in position 2'
                },
                {
                  arabicText: 'jetzt',
                  englishText: 'now',
                  sourceText: isAr ? 'الآن' : 'now',
                  targetText: 'jetzt',
                  role: 'connector',
                  explanation: 'Time adverb'
                },
                {
                  arabicText: 'an',
                  englishText: '(prefix)',
                  sourceText: isAr ? 'بادئة an' : 'prefix',
                  targetText: 'an',
                  role: 'modifier',
                  explanation: 'Separated prefix at sentence end'
                }
              ],
              habitHint: isAr
                ? 'الفعل هو ankommen: نقول kommt في البداية و an في النهاية.'
                : 'The verb is "ankommen": place "kommt" in position 2 and "an" at the end.'
            }
          ]
        }
      ]
    }
  ];
}

