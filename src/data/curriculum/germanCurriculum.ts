import { Phase, SourceLanguage } from '../../types';

function sourceThought(source: SourceLanguage, ar: string, en: string): string {
  if (source === 'ar') return ar;
  return en; // TODO: add es/fr/zh/... when available
}

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
              sourceThought: sourceThought(source, 'اليوم أنا أشرب قهوة', 'Today I am drinking coffee'),
              targetSentence: 'Heute trinke ich Kaffee',
              acceptableAlternatives: ['Heute trinke ich den Kaffee', 'Ich trinke heute Kaffee'],
              wordChips: ['Heute', 'trinke', 'ich', 'Kaffee', 'ist', 'der', 'trinken'],
              breakdownChunks: [
                {
                  arabicText: 'Heute',
                  englishText: 'Today',
                  sourceText: sourceThought(source, 'اليوم', 'Today'),
                  targetText: 'Heute',
                  role: 'connector',
                  explanation: 'Position 1: Time adverbial'
                },
                {
                  arabicText: 'trinke',
                  englishText: 'drink',
                  sourceText: sourceThought(source, 'أشرب', 'am drinking'),
                  targetText: 'trinke',
                  role: 'verb',
                  explanation: 'Position 2: Conjugated verb locked in position'
                },
                {
                  arabicText: 'ich',
                  englishText: 'I',
                  sourceText: sourceThought(source, 'أنا', 'I'),
                  targetText: 'ich',
                  role: 'subject',
                  explanation: 'Position 3: Inverted subject after verb'
                },
                {
                  arabicText: 'Kaffee',
                  englishText: 'coffee',
                  sourceText: sourceThought(source, 'قهوة', 'coffee'),
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
              sourceThought: sourceThought(source, 'الآن نحن نتعلّم الألمانية', 'Now we are learning German'),
              targetSentence: 'Jetzt lernen wir Deutsch',
              acceptableAlternatives: ['Wir lernen jetzt Deutsch'],
              wordChips: ['Jetzt', 'lernen', 'wir', 'Deutsch', 'sind', 'das', 'lerne'],
              breakdownChunks: [
                {
                  arabicText: 'Jetzt',
                  englishText: 'Now',
                  sourceText: sourceThought(source, 'الآن', 'Now'),
                  targetText: 'Jetzt',
                  role: 'connector',
                  explanation: 'Position 1: Time adverb'
                },
                {
                  arabicText: 'lernen',
                  englishText: 'learn',
                  sourceText: sourceThought(source, 'نتعلم', 'are learning'),
                  targetText: 'lernen',
                  role: 'verb',
                  explanation: 'Position 2: Locked conjugated verb for wir'
                },
                {
                  arabicText: 'wir',
                  englishText: 'we',
                  sourceText: sourceThought(source, 'نحن', 'we'),
                  targetText: 'wir',
                  role: 'subject',
                  explanation: 'Position 3: Inverted subject'
                },
                {
                  arabicText: 'Deutsch',
                  englishText: 'German',
                  sourceText: sourceThought(source, 'الألمانية', 'German'),
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
              sourceThought: sourceThought(source, 'غداً هو يسافر إلى برلين', 'Tomorrow he travels to Berlin'),
              targetSentence: 'Morgen reist er nach Berlin',
              acceptableAlternatives: ['Morgen fährt er nach Berlin', 'Er reist morgen nach Berlin'],
              wordChips: ['Morgen', 'reist', 'er', 'nach', 'Berlin', 'fährt', 'ist'],
              breakdownChunks: [
                {
                  arabicText: 'Morgen',
                  englishText: 'Tomorrow',
                  sourceText: sourceThought(source, 'غداً', 'Tomorrow'),
                  targetText: 'Morgen',
                  role: 'connector',
                  explanation: 'Time modifier in position 1'
                },
                {
                  arabicText: 'reist',
                  englishText: 'travels',
                  sourceText: sourceThought(source, 'يسافر', 'travels'),
                  targetText: 'reist',
                  role: 'verb',
                  explanation: 'Conjugated verb in position 2'
                },
                {
                  arabicText: 'er',
                  englishText: 'he',
                  sourceText: sourceThought(source, 'هو', 'he'),
                  targetText: 'er',
                  role: 'subject',
                  explanation: 'Inverted subject'
                },
                {
                  arabicText: 'nach Berlin',
                  englishText: 'to Berlin',
                  sourceText: sourceThought(source, 'إلى برلين', 'to Berlin'),
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
              sourceThought: sourceThought(source, 'أنا أحتاج قهوة', 'I need a coffee'),
              targetSentence: 'Ich brauche einen Kaffee',
              acceptableAlternatives: ['Ich brauche den Kaffee'],
              wordChips: ['Ich', 'brauche', 'einen', 'Kaffee', 'ein', 'der', 'Kaffees'],
              breakdownChunks: [
                {
                  arabicText: 'Ich',
                  englishText: 'I',
                  sourceText: sourceThought(source, 'أنا', 'I'),
                  targetText: 'Ich',
                  role: 'subject',
                  explanation: 'Nominative subject'
                },
                {
                  arabicText: 'brauche',
                  englishText: 'need',
                  sourceText: sourceThought(source, 'أحتاج', 'need'),
                  targetText: 'brauche',
                  role: 'verb',
                  explanation: 'Action verb requiring accusative object'
                },
                {
                  arabicText: 'einen Kaffee',
                  englishText: 'a coffee',
                  sourceText: sourceThought(source, 'قهوة', 'a coffee'),
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
              sourceThought: sourceThought(source, 'هي ترى الكلب', 'She sees the dog'),
              targetSentence: 'Sie sieht den Hund',
              acceptableAlternatives: ['Sie sieht einen Hund'],
              wordChips: ['Sie', 'sieht', 'den', 'Hund', 'der', 'das', 'Hunde'],
              breakdownChunks: [
                {
                  arabicText: 'Sie',
                  englishText: 'She',
                  sourceText: sourceThought(source, 'هي', 'She'),
                  targetText: 'Sie',
                  role: 'subject',
                  explanation: 'Subject pronoun'
                },
                {
                  arabicText: 'sieht',
                  englishText: 'sees',
                  sourceText: sourceThought(source, 'ترى', 'sees'),
                  targetText: 'sieht',
                  role: 'verb',
                  explanation: 'Transitive verb (sehen)'
                },
                {
                  arabicText: 'den Hund',
                  englishText: 'the dog',
                  sourceText: sourceThought(source, 'الكلب', 'the dog'),
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
              sourceThought: sourceThought(source, 'نحن لدينا مشكلة', 'We have a problem'),
              targetSentence: 'Wir haben ein Problem',
              acceptableAlternatives: ['Wir haben das Problem'],
              wordChips: ['Wir', 'haben', 'ein', 'Problem', 'einen', 'das', 'habe'],
              breakdownChunks: [
                {
                  arabicText: 'Wir',
                  englishText: 'We',
                  sourceText: sourceThought(source, 'نحن', 'We'),
                  targetText: 'Wir',
                  role: 'subject',
                  explanation: 'Subject'
                },
                {
                  arabicText: 'haben',
                  englishText: 'have',
                  sourceText: sourceThought(source, 'لدينا', 'have'),
                  targetText: 'haben',
                  role: 'verb',
                  explanation: 'Verb'
                },
                {
                  arabicText: 'ein Problem',
                  englishText: 'a problem',
                  sourceText: sourceThought(source, 'مشكلة', 'a problem'),
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
              sourceThought: sourceThought(source, 'أنا سأتصل بك غداً', 'I will call you tomorrow'),
              targetSentence: 'Ich rufe dich morgen an',
              acceptableAlternatives: ['Morgen rufe ich dich an'],
              wordChips: ['Ich', 'rufe', 'dich', 'morgen', 'an', 'anrufen', 'werde'],
              breakdownChunks: [
                {
                  arabicText: 'Ich',
                  englishText: 'I',
                  sourceText: sourceThought(source, 'أنا', 'I'),
                  targetText: 'Ich',
                  role: 'subject',
                  explanation: 'Subject pronoun'
                },
                {
                  arabicText: 'rufe',
                  englishText: 'call',
                  sourceText: sourceThought(source, 'أتصل', 'call'),
                  targetText: 'rufe',
                  role: 'verb',
                  explanation: 'Verb stem in position 2'
                },
                {
                  arabicText: 'dich morgen',
                  englishText: 'you tomorrow',
                  sourceText: sourceThought(source, 'بك غداً', 'you tomorrow'),
                  targetText: 'dich morgen',
                  role: 'object',
                  explanation: 'Pronoun object + time adverb'
                },
                {
                  arabicText: 'an',
                  englishText: '(up)',
                  sourceText: sourceThought(source, 'بادئة (an)', 'prefix'),
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
              sourceThought: sourceThought(source, 'القطار يصل الآن', 'The train is arriving now'),
              targetSentence: 'Der Zug kommt jetzt an',
              acceptableAlternatives: ['Jetzt kommt der Zug an'],
              wordChips: ['Der', 'Zug', 'kommt', 'jetzt', 'an', 'ankommt', 'ist'],
              breakdownChunks: [
                {
                  arabicText: 'Der Zug',
                  englishText: 'The train',
                  sourceText: sourceThought(source, 'القطار', 'The train'),
                  targetText: 'Der Zug',
                  role: 'subject',
                  explanation: 'Subject noun phrase'
                },
                {
                  arabicText: 'kommt',
                  englishText: 'comes',
                  sourceText: sourceThought(source, 'يصل', 'is arriving'),
                  targetText: 'kommt',
                  role: 'verb',
                  explanation: 'Verb stem in position 2'
                },
                {
                  arabicText: 'jetzt',
                  englishText: 'now',
                  sourceText: sourceThought(source, 'الآن', 'now'),
                  targetText: 'jetzt',
                  role: 'connector',
                  explanation: 'Time adverb'
                },
                {
                  arabicText: 'an',
                  englishText: '(prefix)',
                  sourceText: sourceThought(source, 'بادئة an', 'prefix'),
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
        },
        {
          id: 'de-p1-l4',
          phaseId: 1,
          phaseTitle: 'Das Fundament · German Foundations',
          phaseLevel: 'A1 – A2',
          number: 4,
          title: 'Modal Verbs & Infinitive at the End',
          titleAr: 'الأفعال الناقصة والفعل المصدري في نهاية الجملة (Modalverben)',
          transferConcept: isAr
            ? 'عند استخدام أفعال القدرة أو الرغبة (können, müssen, wollen)، يأتي الفعل الناقص المصرف في الموقع 2، بينما يُدفع الفعل الأساسي إلى آخر الجملة بصيغة المصدر (Infinitive): Ich kann Deutsch sprechen.'
            : 'When using modal verbs (können, müssen, wollen), the conjugated modal verb stands in position 2, pushing the main verb in its full infinitive form to the absolute end: "Ich kann Deutsch sprechen".',
          transferConceptAr: 'الفعل الناقص يأخذ الموقع 2، والفعل الرئيسي يذهب للمصدر في نهاية الجملة.',
          weakSpotTag: 'modal-verbs-infinitive',
          exercises: [
            {
              id: 'de-ex-1-4-1',
              arabicThought: 'أنا أستطيع التحدث بالألمانية',
              englishTarget: 'Ich kann Deutsch sprechen',
              sourceThought: sourceThought(source, 'أنا أستطيع التحدث بالألمانية', 'I can speak German'),
              targetSentence: 'Ich kann Deutsch sprechen',
              acceptableAlternatives: ['Ich kann gut Deutsch sprechen'],
              wordChips: ['Ich', 'kann', 'Deutsch', 'sprechen', 'spreche', 'können'],
              breakdownChunks: [
                {
                  arabicText: 'Ich',
                  englishText: 'I',
                  sourceText: sourceThought(source, 'أنا', 'I'),
                  targetText: 'Ich',
                  role: 'subject',
                  explanation: 'Subject pronoun'
                },
                {
                  arabicText: 'kann',
                  englishText: 'can',
                  sourceText: sourceThought(source, 'أستطيع', 'can'),
                  targetText: 'kann',
                  role: 'verb',
                  explanation: 'Conjugated modal verb in position 2'
                },
                {
                  arabicText: 'Deutsch',
                  englishText: 'German',
                  sourceText: sourceThought(source, 'الألمانية', 'German'),
                  targetText: 'Deutsch',
                  role: 'object',
                  explanation: 'Direct object'
                },
                {
                  arabicText: 'sprechen',
                  englishText: 'speak',
                  sourceText: sourceThought(source, 'أتحدث (في المصدر)', 'to speak'),
                  targetText: 'sprechen',
                  role: 'verb',
                  explanation: 'Infinitive verb at sentence end'
                }
              ],
              habitHint: isAr
                ? 'ضع kann في الموقع الثاني واطرد spreche إلى النهاية في صورة المصدر sprechen.'
                : 'Place "kann" in position 2 and push "sprechen" in its infinitive form to the very end.'
            }
          ]
        },
        {
          id: 'de-p1-l5',
          phaseId: 1,
          phaseTitle: 'Das Fundament · German Foundations',
          phaseLevel: 'A1 – A2',
          number: 5,
          title: 'Negation: nicht vs kein',
          titleAr: 'النفي بالألمانية (kein للأسماء و nicht للأفعال والصفات)',
          transferConcept: isAr
            ? 'في الألمانية، ينفى الاسم المسبوق بنكرة أو بدون أداة بـ kein (مثل kein Geld / keinen Schlüssel). أما الأفعال والصفات والأسماء المعرفة فتنفي بـ nicht!'
            : 'In German, nouns with indefinite or zero articles are negated with "kein" (e.g. "kein Geld" / "keinen Schlüssel"). Verbs, adjectives, and definite nouns are negated with "nicht"!',
          transferConceptAr: 'استخدم kein لنفي الأسماء النكرة، واستخدم nicht لنفي الأفعال والصفات.',
          weakSpotTag: 'negation-nicht-kein',
          exercises: [
            {
              id: 'de-ex-1-5-1',
              arabicThought: 'أنا ليس لدي مفتاح (مذكر)',
              englishTarget: 'Ich habe keinen Schlüssel',
              sourceThought: sourceThought(source, 'أنا ليس لدي مفتاح', 'I have no key'),
              targetSentence: 'Ich habe keinen Schlüssel',
              acceptableAlternatives: ['Ich habe keinen Schlüssel dabei'],
              wordChips: ['Ich', 'habe', 'keinen', 'Schlüssel', 'nicht', 'ein', 'keine'],
              breakdownChunks: [
                {
                  arabicText: 'Ich',
                  englishText: 'I',
                  sourceText: sourceThought(source, 'أنا', 'I'),
                  targetText: 'Ich',
                  role: 'subject',
                  explanation: 'Subject'
                },
                {
                  arabicText: 'habe',
                  englishText: 'have',
                  sourceText: sourceThought(source, 'عندي', 'have'),
                  targetText: 'habe',
                  role: 'verb',
                  explanation: 'Verb requiring accusative'
                },
                {
                  arabicText: 'keinen Schlüssel',
                  englishText: 'no key',
                  sourceText: sourceThought(source, 'ليس لدي مفتاح', 'no key'),
                  targetText: 'keinen Schlüssel',
                  role: 'object',
                  explanation: 'Accusative masculine negation: kein -> keinen'
                }
              ],
              habitHint: isAr
                ? 'مفتاح مذكر (der Schlüssel) ومفعول به، لنفيه نستخدم keinen بدلاً من nicht.'
                : 'Key is masculine (der Schlüssel). In accusative negation, use "keinen".'
            },
            {
              id: 'de-ex-1-5-2',
              arabicThought: 'هذا ليس صحيحاً',
              englishTarget: 'Das ist nicht richtig',
              sourceThought: sourceThought(source, 'هذا ليس صحيحاً', 'That is not correct'),
              targetSentence: 'Das ist nicht richtig',
              acceptableAlternatives: ['Das ist nicht falsch'],
              wordChips: ['Das', 'ist', 'nicht', 'richtig', 'kein', 'keine', 'es'],
              breakdownChunks: [
                {
                  arabicText: 'Das',
                  englishText: 'That',
                  sourceText: sourceThought(source, 'هذا', 'That'),
                  targetText: 'Das',
                  role: 'subject',
                  explanation: 'Demonstrative subject'
                },
                {
                  arabicText: 'ist',
                  englishText: 'is',
                  sourceText: sourceThought(source, 'يكون', 'is'),
                  targetText: 'ist',
                  role: 'verb',
                  explanation: 'Copula verb'
                },
                {
                  arabicText: 'nicht richtig',
                  englishText: 'not correct',
                  sourceText: sourceThought(source, 'ليس صحيحاً', 'not correct'),
                  targetText: 'nicht richtig',
                  role: 'modifier',
                  explanation: 'Adjective negated with nicht'
                }
              ],
              habitHint: isAr
                ? 'الصفات (مثل richtig) تنفى بـ nicht وليس بـ kein.'
                : 'Adjectives like "richtig" are negated with "nicht", never "kein".'
            }
          ]
        }
      ]
    },
    {
      id: 2,
      title: 'Satzverbindungen & Dativ · Case Shifts & Clause Connectors',
      titleAr: 'حالة الجر (Dativ) وأدوات الربط الفرعية',
      level: 'A2 – B1',
      tagline: isAr
        ? 'تعلم حالة الجر (Dativ)، حروف الجر المزدوجة، وأدوات الربط (weil, dass) التي تنقل الفعل لآخر الجملة.'
        : 'Master the Dative case, two-way prepositions, and subordinating conjunctions (weil, dass) that push verbs to the end.',
      lessons: [
        {
          id: 'de-p2-l1',
          phaseId: 2,
          phaseTitle: 'Satzverbindungen & Dativ · Case Shifts & Clause Connectors',
          phaseLevel: 'A2 – B1',
          number: 1,
          title: 'The Dative Indirect Object',
          titleAr: 'المفعول به الثاني / حالة الجر (Dativ)',
          transferConcept: isAr
            ? 'حالة الجر (Dativ) تُستخدم للمستفيد أو المفعول به غير المباشر (مثل إعطاء شيء لشخص). تتحول der و das إلى dem، وتتحول die إلى der! نقول: Ich helfe dem Mann (أنا أساعد الرجل).'
            : 'The Dative case marks indirect objects and recipients. Definite articles change: masculine (der) and neuter (das) become "dem", feminine (die) becomes "der"! e.g. "Ich helfe dem Mann".',
          transferConceptAr: 'في حالة الداتيف Dativ: المذكر والحيادي يصبحان dem والمؤنث يصبح der.',
          weakSpotTag: 'dative-case',
          exercises: [
            {
              id: 'de-ex-2-1-1',
              arabicThought: 'أنا أساعد الرجل',
              englishTarget: 'Ich helfe dem Mann',
              sourceThought: sourceThought(source, 'أنا أساعد الرجل', 'I help the man'),
              targetSentence: 'Ich helfe dem Mann',
              acceptableAlternatives: ['Ich helfe einem Mann'],
              wordChips: ['Ich', 'helfe', 'dem', 'Mann', 'den', 'der', 'das'],
              breakdownChunks: [
                {
                  arabicText: 'Ich',
                  englishText: 'I',
                  sourceText: sourceThought(source, 'أنا', 'I'),
                  targetText: 'Ich',
                  role: 'subject',
                  explanation: 'Subject pronoun'
                },
                {
                  arabicText: 'helfe',
                  englishText: 'help',
                  sourceText: sourceThought(source, 'أساعد', 'help'),
                  targetText: 'helfe',
                  role: 'verb',
                  explanation: 'Verb requiring Dative object (helfen)'
                },
                {
                  arabicText: 'dem Mann',
                  englishText: 'the man',
                  sourceText: sourceThought(source, 'للأخ/للرجل', 'the man'),
                  targetText: 'dem Mann',
                  role: 'object',
                  explanation: 'Dative masculine: der Mann -> dem Mann'
                }
              ],
              habitHint: isAr
                ? 'الفعل helfen يتطلب Dativ دائماً! لذلك der Mann تتحول إلى dem Mann.'
                : 'The verb "helfen" always requires Dative! Therefore "der Mann" becomes "dem Mann".'
            }
          ]
        },
        {
          id: 'de-p2-l2',
          phaseId: 2,
          phaseTitle: 'Satzverbindungen & Dativ · Case Shifts & Clause Connectors',
          phaseLevel: 'A2 – B1',
          number: 2,
          title: 'Subordinating Conjunctions (weil, dass) & End-Verb Rule',
          titleAr: 'أدوات الربط (weil, dass) وقاعدة طرد الفعل للنهاية',
          transferConcept: isAr
            ? 'عند استخدام أدوات الربط الفرعية مثل weil (لأن) أو dass (أن)، يتحول الفعل المصرف إلى نهاية الجملة الفرعية كلياً: Ich lerne Deutsch, weil es wichtig ist.'
            : 'Subordinating conjunctions like "weil" (because) or "dass" (that) kick the conjugated verb all the way to the very end of the sub-clause: "Ich lerne Deutsch, weil es wichtig ist".',
          transferConceptAr: 'أدوات مثل weil و dass تطرد الفعل المصرف لآخر الجملة الفرعية.',
          weakSpotTag: 'subordinating-conjunctions',
          exercises: [
            {
              id: 'de-ex-2-2-1',
              arabicThought: 'أنا أتعلم الألمانية لأنها مهمة',
              englishTarget: 'Ich lerne Deutsch, weil es wichtig ist',
              sourceThought: sourceThought(source, 'أنا أتعلم الألمانية لأنها مهمة', 'I am learning German because it is important'),
              targetSentence: 'Ich lerne Deutsch, weil es wichtig ist',
              acceptableAlternatives: ['Weil es wichtig ist, lerne ich Deutsch'],
              wordChips: ['Ich', 'lerne', 'Deutsch,', 'weil', 'es', 'wichtig', 'ist', 'ist.'],
              breakdownChunks: [
                {
                  arabicText: 'Ich lerne Deutsch,',
                  englishText: 'I learn German,',
                  sourceText: sourceThought(source, 'أنا أتعلم الألمانية', 'I learn German,'),
                  targetText: 'Ich lerne Deutsch,',
                  role: 'subject',
                  explanation: 'Main clause (V2 order)'
                },
                {
                  arabicText: 'weil',
                  englishText: 'because',
                  sourceText: sourceThought(source, 'لأن', 'because'),
                  targetText: 'weil',
                  role: 'connector',
                  explanation: 'Subordinating conjunction kicking verb to end'
                },
                {
                  arabicText: 'es wichtig',
                  englishText: 'it important',
                  sourceText: sourceThought(source, 'هي مهمة', 'it important'),
                  targetText: 'es wichtig',
                  role: 'modifier',
                  explanation: 'Subject and predicate in sub-clause'
                },
                {
                  arabicText: 'ist',
                  englishText: 'is',
                  sourceText: sourceThought(source, 'تكون (في النهاية)', 'is (at end)'),
                  targetText: 'ist',
                  role: 'verb',
                  explanation: 'Conjugated verb pushed to absolute end by weil'
                }
              ],
              habitHint: isAr
                ? 'أداة الربط weil تطرد الفعل ist إلى آخر كلمة في الجملة الفرعية.'
                : 'The conjunction "weil" kicks the verb "ist" to the very end of the clause.'
            }
          ]
        },
        {
          id: 'de-p2-l3',
          phaseId: 2,
          phaseTitle: 'Satzverbindungen & Dativ · Case Shifts & Clause Connectors',
          phaseLevel: 'A2 – B1',
          number: 3,
          title: 'Conversational Past Tense (Das Perfekt)',
          titleAr: 'الماضي التحدثي (Perfekt مع haben و sein)',
          transferConcept: isAr
            ? 'في المحادثة اليومية، التعبير عن الماضي يتم بوضع haben أو sein في الموقع 2، ووضع اسم المفعول (Partizip II) في نهاية الجملة: Ich habe Deutsch gelernt / Ich bin nach Berlin gefahren.'
            : 'German conversational past uses "haben" or "sein" in position 2, pushing the past participle (Partizip II) to the absolute end: "Ich habe Deutsch gelernt" or "Ich bin nach Berlin gefahren".',
          transferConceptAr: 'الماضي التحدثي = haben/sein في الخانة 2 + التصريف الثالث في آخر كلمة.',
          weakSpotTag: 'perfekt-past-tense',
          exercises: [
            {
              id: 'de-ex-2-3-1',
              arabicThought: 'أنا درست الألمانية',
              englishTarget: 'Ich habe Deutsch gelernt',
              sourceThought: sourceThought(source, 'أنا درست الألمانية', 'I have learned German'),
              targetSentence: 'Ich habe Deutsch gelernt',
              acceptableAlternatives: ['Ich lernte Deutsch'],
              wordChips: ['Ich', 'habe', 'Deutsch', 'gelernt', 'bin', 'lernen'],
              breakdownChunks: [
                {
                  arabicText: 'Ich',
                  englishText: 'I',
                  sourceText: sourceThought(source, 'أنا', 'I'),
                  targetText: 'Ich',
                  role: 'subject',
                  explanation: 'Subject pronoun'
                },
                {
                  arabicText: 'habe',
                  englishText: 'have',
                  sourceText: sourceThought(source, 'فعل مساعدة', 'have'),
                  targetText: 'habe',
                  role: 'auxiliary',
                  explanation: 'Auxiliary verb in position 2'
                },
                {
                  arabicText: 'Deutsch',
                  englishText: 'German',
                  sourceText: sourceThought(source, 'الألمانية', 'German'),
                  targetText: 'Deutsch',
                  role: 'object',
                  explanation: 'Object'
                },
                {
                  arabicText: 'gelernt',
                  englishText: 'learned',
                  sourceText: sourceThought(source, 'تعلمت (التصريف الثالث)', 'learned'),
                  targetText: 'gelernt',
                  role: 'verb',
                  explanation: 'Partizip II ending the sentence'
                }
              ],
              habitHint: isAr
                ? 'ضع habe في الموقع الثاني واختم الجملة بالتصريف الثالث gelernt.'
                : 'Put "habe" in position 2 and close the sentence with past participle "gelernt".'
            }
          ]
        },
        {
          id: 'de-p2-l4',
          phaseId: 2,
          phaseTitle: 'Satzverbindungen & Dativ · Case Shifts & Clause Connectors',
          phaseLevel: 'A2 – B1',
          number: 4,
          title: 'Two-Way Prepositions (Wechselpräpositionen)',
          titleAr: 'حروف الجر المزدوجة (الموقع مع Dativ والحركة مع Akkusativ)',
          transferConcept: isAr
            ? 'حروف الجر مثل in, auf, an تتطلب Dativ عند الثبات والموقع (Wo? أين؟)، بينما تتطلب Akkusativ عند الحركة والاتجاه (Wohin? إلى أين؟): Der Schlüssel liegt auf dem Tisch.'
            : 'Two-way prepositions (in, auf, an) take Dative for static location (Wo? Where?), but Accusative for directional movement (Wohin? Where to?): "Der Schlüssel liegt auf dem Tisch".',
          transferConceptAr: 'الموقع الثابت يأخذ Dativ (auf dem Tisch)، والحركة إلى مكان تأخذ Akkusativ (auf den Tisch).',
          weakSpotTag: 'two-way-prepositions',
          exercises: [
            {
              id: 'de-ex-2-4-1',
              arabicThought: 'المفتاح موضوع على الطاولة (ثبات/موقع)',
              englishTarget: 'Der Schlüssel liegt auf dem Tisch',
              sourceThought: sourceThought(source, 'المفتاح موضوع على الطاولة', 'The key is lying on the table'),
              targetSentence: 'Der Schlüssel liegt auf dem Tisch',
              acceptableAlternatives: ['Der Schlüssel ist auf dem Tisch'],
              wordChips: ['Der', 'Schlüssel', 'liegt', 'auf', 'dem', 'Tisch', 'den', 'das'],
              breakdownChunks: [
                {
                  arabicText: 'Der Schlüssel',
                  englishText: 'The key',
                  sourceText: sourceThought(source, 'المفتاح', 'The key'),
                  targetText: 'Der Schlüssel',
                  role: 'subject',
                  explanation: 'Masculine nominative subject'
                },
                {
                  arabicText: 'liegt',
                  englishText: 'is lying',
                  sourceText: sourceThought(source, 'موضوع', 'is lying'),
                  targetText: 'liegt',
                  role: 'verb',
                  explanation: 'Static position verb'
                },
                {
                  arabicText: 'auf dem Tisch',
                  englishText: 'on the table',
                  sourceText: sourceThought(source, 'على الطاولة', 'on the table'),
                  targetText: 'auf dem Tisch',
                  role: 'modifier',
                  explanation: 'Dative location: der Tisch -> dem Tisch'
                }
              ],
              habitHint: isAr
                ? 'الفعل liegen يعبر عن موقع ثابت، لذلك auf تأخذ Dativ: dem Tisch.'
                : 'The verb "liegen" shows static location, so "auf" requires Dative: "dem Tisch".'
            },
            {
              id: 'de-ex-2-4-2',
              arabicThought: 'أنا أضع المفتاح على الطاولة (حركة)',
              englishTarget: 'Ich lege den Schlüssel auf den Tisch',
              sourceThought: sourceThought(source, 'أنا أضع المفتاح على الطاولة', 'I put the key on the table'),
              targetSentence: 'Ich lege den Schlüssel auf den Tisch',
              acceptableAlternatives: ['Ich tue den Schlüssel auf den Tisch'],
              wordChips: ['Ich', 'lege', 'den', 'Schlüssel', 'auf', 'den', 'Tisch', 'dem'],
              breakdownChunks: [
                {
                  arabicText: 'Ich',
                  englishText: 'I',
                  sourceText: sourceThought(source, 'أنا', 'I'),
                  targetText: 'Ich',
                  role: 'subject',
                  explanation: 'Subject'
                },
                {
                  arabicText: 'lege',
                  englishText: 'put',
                  sourceText: sourceThought(source, 'أضع', 'put'),
                  targetText: 'lege',
                  role: 'verb',
                  explanation: 'Action verb of movement'
                },
                {
                  arabicText: 'den Schlüssel',
                  englishText: 'the key',
                  sourceText: sourceThought(source, 'المفتاح', 'the key'),
                  targetText: 'den Schlüssel',
                  role: 'object',
                  explanation: 'Direct object'
                },
                {
                  arabicText: 'auf den Tisch',
                  englishText: 'onto the table',
                  sourceText: sourceThought(source, 'على الطاولة', 'onto the table'),
                  targetText: 'auf den Tisch',
                  role: 'modifier',
                  explanation: 'Accusative direction: der Tisch -> den Tisch'
                }
              ],
              habitHint: isAr
                ? 'الفعل legen يعبر عن حركة نقل، لذلك auf تأخذ Akkusativ: den Tisch.'
                : 'The verb "legen" shows movement, so "auf" takes Accusative: "den Tisch".'
            }
          ]
        },
        {
          id: 'de-p2-l5',
          phaseId: 2,
          phaseTitle: 'Satzverbindungen & Dativ · Case Shifts & Clause Connectors',
          phaseLevel: 'A2 – B1',
          number: 5,
          title: 'Relative Clauses (Relativsätze)',
          titleAr: 'جمل الوصل وضماءر الوصل (der, die, das)',
          transferConcept: isAr
            ? 'جملة الوصل توضح اسماً سابتاً. ضمير الوصل يوافق الاسم في الجنس والعدد، والفعل المصرف في جملة الوصل يُدفع دائماً إلى نهاية الجملة: Das ist der Mann, der hier arbeitet.'
            : 'Relative clauses describe a preceding noun. The relative pronoun matches gender and number, and the conjugated verb moves to the very end of the relative clause: "Das ist der Mann, der hier arbeitet".',
          transferConceptAr: 'ضمير الوصل يتبع جنس الاسم، والفعل المصرف يختم جملة الوصل.',
          weakSpotTag: 'relative-clauses',
          exercises: [
            {
              id: 'de-ex-2-5-1',
              arabicThought: 'هذا هو الرجل الذي يعمل هنا',
              englishTarget: 'Das ist der Mann, der hier arbeitet',
              sourceThought: sourceThought(source, 'هذا هو الرجل الذي يعمل هنا', 'That is the man who works here'),
              targetSentence: 'Das ist der Mann, der hier arbeitet',
              acceptableAlternatives: ['Hier ist der Mann, der arbeitet'],
              wordChips: ['Das', 'ist', 'der', 'Mann,', 'der', 'hier', 'arbeitet', 'arbeitest', 'den'],
              breakdownChunks: [
                {
                  arabicText: 'Das ist der Mann,',
                  englishText: 'That is the man,',
                  sourceText: sourceThought(source, 'هذا هو الرجل', 'That is the man,'),
                  targetText: 'Das ist der Mann,',
                  role: 'subject',
                  explanation: 'Main clause'
                },
                {
                  arabicText: 'der',
                  englishText: 'who',
                  sourceText: sourceThought(source, 'الذي', 'who'),
                  targetText: 'der',
                  role: 'connector',
                  explanation: 'Masculine nominative relative pronoun'
                },
                {
                  arabicText: 'hier arbeitet',
                  englishText: 'works here',
                  sourceText: sourceThought(source, 'يعمل هنا', 'works here'),
                  targetText: 'hier arbeitet',
                  role: 'verb',
                  explanation: 'End-position verb in relative clause'
                }
              ],
              habitHint: isAr
                ? 'ضمير الوصل der يعود على Mann، والفعل arbeitet يختم الجملة.'
                : 'Relative pronoun "der" refers to "Mann", and verb "arbeitet" ends the clause.'
            },
            {
              id: 'de-ex-2-5-2',
              arabicThought: 'هذا هو الكتاب الذي أقرأه',
              englishTarget: 'Das ist das Buch, das ich lese',
              sourceThought: sourceThought(source, 'هذا هو الكتاب الذي أقرأه', 'That is the book that I am reading'),
              targetSentence: 'Das ist das Buch, das ich lese',
              acceptableAlternatives: ['Das ist das Buch, welches ich lese'],
              wordChips: ['Das', 'ist', 'das', 'Buch,', 'das', 'ich', 'lese', 'der', 'liest'],
              breakdownChunks: [
                {
                  arabicText: 'Das ist das Buch,',
                  englishText: 'That is the book,',
                  sourceText: sourceThought(source, 'هذا هو الكتاب', 'That is the book,'),
                  targetText: 'Das ist das Buch,',
                  role: 'subject',
                  explanation: 'Main clause'
                },
                {
                  arabicText: 'das ich lese',
                  englishText: 'that I read',
                  sourceText: sourceThought(source, 'الذي أقرأه', 'that I read'),
                  targetText: 'das ich lese',
                  role: 'verb',
                  explanation: 'Neuter relative clause with verb at end'
                }
              ],
              habitHint: isAr
                ? 'الكتاب محايد (das Buch)، فضمير الوصل هو das والفعل lese في آخر الجملة.'
                : 'Book is neuter (das Buch), relative pronoun is "das", verb "lese" goes at the end.'
            }
          ]
        }
      ]
    },
    {
      id: 3,
      title: 'Souveräne Sprache · Mastery & Expressiveness',
      titleAr: 'الإتقان واللغة الألمانية المتقدمة',
      level: 'B1 – B2',
      tagline: isAr
        ? 'أتقن الأفعال المنعكسة، مبني للمجهول، والصياغة المهذبة الفائقة (Konjunktiv II).'
        : 'Master reflexive verbs, passive voice, and refined German politeness (Konjunktiv II).',
      lessons: [
        {
          id: 'de-p3-l1',
          phaseId: 3,
          phaseTitle: 'Souveräne Sprache · Mastery & Expressiveness',
          phaseLevel: 'B1 – B2',
          number: 1,
          title: 'Polite Requests with Konjunktiv II (hätte / würde)',
          titleAr: 'الطلبات المهذبة الاحترافية (Konjunktiv II)',
          transferConcept: isAr
            ? 'في المعاملات الألمانية المهذبة والشركات، بدلاً من الطلب المباشر، نستخدم صيغة Konjunktiv II مثل Ich hätte gern... (أود أن أحصل على...) أو Würden Sie bitte... (هل تكرمت بـ...): Ich hätte gern einen Kaffee, bitte.'
            : 'In professional German interaction, replace direct demands with Konjunktiv II forms like "Ich hätte gern..." (I would like...) or "Würden Sie bitte...": "Ich hätte gern einen Kaffee, bitte".',
          transferConceptAr: 'للطلب المهذب الاحترافي استخدم Ich hätte gern... أو Würden Sie bitte...',
          weakSpotTag: 'konjunktiv-politeness',
          exercises: [
            {
              id: 'de-ex-3-1-1',
              arabicThought: 'لو سمحت، أود الحصول على فنجان قهوة (طلب مهذب)',
              englishTarget: 'Ich hätte gern einen Kaffee, bitte',
              sourceThought: sourceThought(source, 'لو سمحت، أود الحصول على فنجان قهوة', 'I would like a coffee, please'),
              targetSentence: 'Ich hätte gern einen Kaffee, bitte',
              acceptableAlternatives: ['Ich möchte einen Kaffee, bitte', 'Könnte ich einen Kaffee haben?'],
              wordChips: ['Ich', 'hätte', 'gern', 'einen', 'Kaffee,', 'bitte', 'will', 'ein'],
              breakdownChunks: [
                {
                  arabicText: 'Ich hätte gern',
                  englishText: 'I would like',
                  sourceText: sourceThought(source, 'أود الحصول على', 'I would like'),
                  targetText: 'Ich hätte gern',
                  role: 'subject',
                  explanation: 'Ultra-polite Konjunktiv II request formula'
                },
                {
                  arabicText: 'einen Kaffee',
                  englishText: 'a coffee',
                  sourceText: sourceThought(source, 'قهوة', 'a coffee'),
                  targetText: 'einen Kaffee',
                  role: 'object',
                  explanation: 'Accusative masculine object'
                },
                {
                  arabicText: 'bitte',
                  englishText: 'please',
                  sourceText: sourceThought(source, 'من فضلك', 'please'),
                  targetText: 'bitte',
                  role: 'modifier',
                  explanation: 'Courtesy particle'
                }
              ],
              habitHint: isAr
                ? 'استخدم دائماً "Ich hätte gern..." للطلب الاحترافي في المقاهي والمطاعم والعمل.'
                : 'Always use "Ich hätte gern..." for refined, polite requests in German.'
            }
          ]
        },
        {
          id: 'de-p3-l2',
          phaseId: 3,
          phaseTitle: 'Souveräne Sprache · Mastery & Expressiveness',
          phaseLevel: 'B1 – B2',
          number: 2,
          title: 'Passive Voice (Vorgangspassiv)',
          titleAr: 'المبني للمجهول (werden + Partizip II)',
          transferConcept: isAr
            ? 'المبني للمجهول يركز على الحدث بدلاً من الفاعل. يصاغ بوضع فعل werden المصرف في الموقع 2 والتصريف الثالث (Partizip II) في ختام الجملة: Der Bericht wird heute geschrieben.'
            : 'The passive voice emphasizes the action rather than the actor. Formed with conjugated "werden" in position 2 and the past participle (Partizip II) at the end: "Der Bericht wird heute geschrieben".',
          transferConceptAr: 'المبني للمجهول = werden في الموقع 2 + Partizip II في ختام الجملة.',
          weakSpotTag: 'passive-voice',
          exercises: [
            {
              id: 'de-ex-3-2-1',
              arabicThought: 'التقرير يُكتب اليوم (مبني للمجهول)',
              englishTarget: 'Der Bericht wird heute geschrieben',
              sourceThought: sourceThought(source, 'التقرير يُكتب اليوم', 'The report is written today'),
              targetSentence: 'Der Bericht wird heute geschrieben',
              acceptableAlternatives: ['Der Bericht wird heute verfasst'],
              wordChips: ['Der', 'Bericht', 'wird', 'heute', 'geschrieben', 'ist', 'schreiben'],
              breakdownChunks: [
                {
                  arabicText: 'Der Bericht',
                  englishText: 'The report',
                  sourceText: sourceThought(source, 'التقرير', 'The report'),
                  targetText: 'Der Bericht',
                  role: 'subject',
                  explanation: 'Subject noun'
                },
                {
                  arabicText: 'wird',
                  englishText: 'is (being)',
                  sourceText: sourceThought(source, 'يتم/يُكتب', 'is'),
                  targetText: 'wird',
                  role: 'auxiliary',
                  explanation: 'Passive auxiliary verb in position 2'
                },
                {
                  arabicText: 'heute geschrieben',
                  englishText: 'written today',
                  sourceText: sourceThought(source, 'اليوم كتابته', 'today written'),
                  targetText: 'heute geschrieben',
                  role: 'verb',
                  explanation: 'Time adverb + Partizip II at end'
                }
              ],
              habitHint: isAr
                ? 'استخدم wird في الخانة 2 واختم الجملة بـ geschrieben.'
                : 'Put "wird" in position 2 and finish the clause with participle "geschrieben".'
            },
            {
              id: 'de-ex-3-2-2',
              arabicThought: 'الرسالة تم إرسالها أمس',
              englishTarget: 'Die E-Mail wurde gestern gesendet',
              sourceThought: sourceThought(source, 'الرسالة تم إرسالها أمس', 'The email was sent yesterday'),
              targetSentence: 'Die E-Mail wurde gestern gesendet',
              acceptableAlternatives: ['Die E-Mail wurde gestern geschickt'],
              wordChips: ['Die', 'E-Mail', 'wurde', 'gestern', 'gesendet', 'war', 'senden'],
              breakdownChunks: [
                {
                  arabicText: 'Die E-Mail',
                  englishText: 'The email',
                  sourceText: sourceThought(source, 'الرسالة', 'The email'),
                  targetText: 'Die E-Mail',
                  role: 'subject',
                  explanation: 'Subject'
                },
                {
                  arabicText: 'wurde',
                  englishText: 'was',
                  sourceText: sourceThought(source, 'تمت', 'was'),
                  targetText: 'wurde',
                  role: 'auxiliary',
                  explanation: 'Past passive auxiliary (wurde)'
                },
                {
                  arabicText: 'gestern gesendet',
                  englishText: 'sent yesterday',
                  sourceText: sourceThought(source, 'إرسالها أمس', 'sent yesterday'),
                  targetText: 'gestern gesendet',
                  role: 'verb',
                  explanation: 'Time adverb + past participle'
                }
              ],
              habitHint: isAr
                ? 'في الماضي للمبني للمجهول نستخدم wurde في الخانة 2.'
                : 'In past passive voice, use "wurde" in position 2.'
            }
          ]
        },
        {
          id: 'de-p3-l3',
          phaseId: 3,
          phaseTitle: 'Souveräne Sprache · Mastery & Expressiveness',
          phaseLevel: 'B1 – B2',
          number: 3,
          title: 'Reflexive Verbs in Business (Reflexive Verben)',
          titleAr: 'الأفعال المنعكسة في بيئة العمل (sich freuen, sich vorbereiten)',
          transferConcept: isAr
            ? 'الأفعال المنعكسة ترتبط بضمير منعكس (mich, dich, sich, uns). في سياق الشركات نستخدمها للتعبير عن التطلع والاهتمام والتحضير: Ich freue mich auf das Projekt.'
            : 'Reflexive verbs use reflexive pronouns (mich, dich, sich, uns). In professional settings they express anticipation, interest, or preparation: "Ich freue mich auf das Projekt".',
          transferConceptAr: 'الأفعال المنعكسة تستخدم الضمائر mich, dich, sich للتعبير عن الحالة والاهتمام.',
          weakSpotTag: 'reflexive-verbs',
          exercises: [
            {
              id: 'de-ex-3-3-1',
              arabicThought: 'أنا متطلع إلى المشروع',
              englishTarget: 'Ich freue mich auf das Projekt',
              sourceThought: sourceThought(source, 'أنا متطلع إلى المشروع', 'I am looking forward to the project'),
              targetSentence: 'Ich freue mich auf das Projekt',
              acceptableAlternatives: ['Wir freuen uns auf das Projekt'],
              wordChips: ['Ich', 'freue', 'mich', 'auf', 'das', 'Projekt', 'dich', 'sich'],
              breakdownChunks: [
                {
                  arabicText: 'Ich',
                  englishText: 'I',
                  sourceText: sourceThought(source, 'أنا', 'I'),
                  targetText: 'Ich',
                  role: 'subject',
                  explanation: 'Subject'
                },
                {
                  arabicText: 'freue mich',
                  englishText: 'look forward (myself)',
                  sourceText: sourceThought(source, 'متطلع/أسعد', 'look forward'),
                  targetText: 'freue mich',
                  role: 'verb',
                  explanation: 'Reflexive verb + pronoun (sich freuen)'
                },
                {
                  arabicText: 'auf das Projekt',
                  englishText: 'to the project',
                  sourceText: sourceThought(source, 'إلى المشروع', 'to the project'),
                  targetText: 'auf das Projekt',
                  role: 'modifier',
                  explanation: 'Prepositional object (auf + accusative)'
                }
              ],
              habitHint: isAr
                ? 'سياق التطلع يتطلب sich freuen auf + Akkusativ (mich auf das Projekt).'
                : 'The idiom "looking forward to" requires "sich freuen auf" + Accusative.'
            },
            {
              id: 'de-ex-3-3-2',
              arabicThought: 'نحن مهتمون بهذا الحل',
              englishTarget: 'Wir interessieren uns für diese Lösung',
              sourceThought: sourceThought(source, 'نحن مهتمون بهذا الحل', 'We are interested in this solution'),
              targetSentence: 'Wir interessieren uns für diese Lösung',
              acceptableAlternatives: ['Ich interessiere mich für diese Lösung'],
              wordChips: ['Wir', 'interessieren', 'uns', 'für', 'diese', 'Lösung', 'sich', 'mich'],
              breakdownChunks: [
                {
                  arabicText: 'Wir interessieren uns',
                  englishText: 'We interest ourselves',
                  sourceText: sourceThought(source, 'نحن مهتمون', 'We are interested'),
                  targetText: 'Wir interessieren uns',
                  role: 'subject',
                  explanation: 'Plural subject + reflexive pronoun (uns)'
                },
                {
                  arabicText: 'für diese Lösung',
                  englishText: 'in this solution',
                  sourceText: sourceThought(source, 'بهذا الحل', 'in this solution'),
                  targetText: 'für diese Lösung',
                  role: 'modifier',
                  explanation: 'für + accusative prepositional phrase'
                }
              ],
              habitHint: isAr
                ? 'الاهتمام بشيء = sich interessieren für + Akkusativ.'
                : 'Expressing interest = "sich interessieren für" + Accusative.'
            }
          ]
        },
        {
          id: 'de-p3-l4',
          phaseId: 3,
          phaseTitle: 'Souveräne Sprache · Mastery & Expressiveness',
          phaseLevel: 'B1 – B2',
          number: 4,
          title: 'Purpose Clauses with um... zu',
          titleAr: 'جمل الغاية والهدف (um... zu + المصدر)',
          transferConcept: isAr
            ? 'للتعبير عن الهدف والغاية (من أجل كذا)، نستخدم التركيب um... zu حيث توضع um بعد الفاصلة، وتوضع zu قبل المصدر في ختام الجملة تماماً: Ich lerne Deutsch, um in Deutschland zu arbeiten.'
            : 'To express purpose ("in order to"), use the bracket "um... zu". "um" introduces the clause after a comma, and "zu" precedes the infinitive at the absolute end: "Ich lerne Deutsch, um in Deutschland zu arbeiten".',
          transferConceptAr: 'جمل الهدف: um تبدأ الجملة الفرعية و zu تقف قبل المصدر في نهايتها.',
          weakSpotTag: 'purpose-clauses-um-zu',
          exercises: [
            {
              id: 'de-ex-3-4-1',
              arabicThought: 'أنا أتعلم الألمانية لأعمل في ألمانيا',
              englishTarget: 'Ich lerne Deutsch, um in Deutschland zu arbeiten',
              sourceThought: sourceThought(source, 'أنا أتعلم الألمانية لأعمل في ألمانيا', 'I learn German to work in Germany'),
              targetSentence: 'Ich lerne Deutsch, um in Deutschland zu arbeiten',
              acceptableAlternatives: ['Ich studiere Deutsch, um in Deutschland zu arbeiten'],
              wordChips: ['Ich', 'lerne', 'Deutsch,', 'um', 'in', 'Deutschland', 'zu', 'arbeiten', 'gearbeitet', 'weil'],
              breakdownChunks: [
                {
                  arabicText: 'Ich lerne Deutsch,',
                  englishText: 'I learn German,',
                  sourceText: sourceThought(source, 'أنا أتعلم الألمانية', 'I learn German,'),
                  targetText: 'Ich lerne Deutsch,',
                  role: 'subject',
                  explanation: 'Main clause'
                },
                {
                  arabicText: 'um in Deutschland',
                  englishText: 'in order in Germany',
                  sourceText: sourceThought(source, 'من أجل في ألمانيا', 'in order in Germany'),
                  targetText: 'um in Deutschland',
                  role: 'connector',
                  explanation: 'Purpose bracket start (um)'
                },
                {
                  arabicText: 'zu arbeiten',
                  englishText: 'to work',
                  sourceText: sourceThought(source, 'أن أعمل', 'to work'),
                  targetText: 'zu arbeiten',
                  role: 'verb',
                  explanation: 'Infinitive with zu ending the purpose clause'
                }
              ],
              habitHint: isAr
                ? 'ضع um في بداية جملة الهدف، واختم بـ zu ثم الفعل المصدر arbeiten.'
                : 'Start the purpose clause with "um" and finish with "zu" + infinitive "arbeiten".'
            },
            {
              id: 'de-ex-3-4-2',
              arabicThought: 'نحن بحاجة إلى وقت إضافي لإكمال المهمة',
              englishTarget: 'Wir brauchen mehr Zeit, um die Aufgabe zu erledigen',
              sourceThought: sourceThought(source, 'نحن بحاجة إلى وقت إضافي لإكمال المهمة', 'We need more time to complete the task'),
              targetSentence: 'Wir brauchen mehr Zeit, um die Aufgabe zu erledigen',
              acceptableAlternatives: ['Wir benötigen mehr Zeit, um die Aufgabe zu beenden'],
              wordChips: ['Wir', 'brauchen', 'mehr', 'Zeit,', 'um', 'die', 'Aufgabe', 'zu', 'erledigen', 'erledigt'],
              breakdownChunks: [
                {
                  arabicText: 'Wir brauchen mehr Zeit,',
                  englishText: 'We need more time,',
                  sourceText: sourceThought(source, 'نحن نحتاج وقتاً أكثر', 'We need more time,'),
                  targetText: 'Wir brauchen mehr Zeit,',
                  role: 'subject',
                  explanation: 'Main clause'
                },
                {
                  arabicText: 'um die Aufgabe zu erledigen',
                  englishText: 'to complete the task',
                  sourceText: sourceThought(source, 'من أجل إنجاز المهمة', 'to complete the task'),
                  targetText: 'um die Aufgabe zu erledigen',
                  role: 'verb',
                  explanation: 'um ... zu + infinitive bracket'
                }
              ],
              habitHint: isAr
                ? 'استخدم التركيب um die Aufgabe zu erledigen للتعبير عن الغاية والهدف.'
                : 'Use "um ... zu" bracket to express purpose clearly.'
            }
          ]
        },
        {
          id: 'de-p3-l5',
          phaseId: 3,
          phaseTitle: 'Souveräne Sprache · Mastery & Expressiveness',
          phaseLevel: 'B1 – B2',
          number: 5,
          title: 'Concession & Contrast (obwohl / trotzdem)',
          titleAr: 'أدوات التناقض والاستثناء (obwohl طاردة للفعل و trotzdem عاكسة للفاعل)',
          transferConcept: isAr
            ? 'للتعبير عن التناقض: obwohl (على الرغم من) هي أداة ربط فرعية تطرد الفعل إلى النهاية. أما trotzdem (مع ذلك) فهي ظرف يقع في الخانة 1 ويعكس الفاعل بعدها فوراً!'
            : 'For contrast: "obwohl" (although) is a sub-clause conjunction kicking the verb to the end. "trotzdem" (nevertheless) is an adverb taking position 1 and inverting the subject!',
          transferConceptAr: 'obwohl تطرد الفعل إلى النهاية، بينما trotzdem تضع الفعل في الخانة 2 ويعقبها الفاعل.',
          weakSpotTag: 'contrast-connectors-obwohl',
          exercises: [
            {
              id: 'de-ex-3-5-1',
              arabicThought: 'على الرغم من أنها تمطر، أنا أذهب للمشي',
              englishTarget: 'Obwohl es regnet, gehe ich spazieren',
              sourceThought: sourceThought(source, 'على الرغم من أنها تمطر، أنا أذهب للمشي', 'Although it is raining, I go for a walk'),
              targetSentence: 'Obwohl es regnet, gehe ich spazieren',
              acceptableAlternatives: ['Ich gehe spazieren, obwohl es regnet'],
              wordChips: ['Obwohl', 'es', 'regnet,', 'gehe', 'ich', 'spazieren', 'regnen', 'aber'],
              breakdownChunks: [
                {
                  arabicText: 'Obwohl es regnet,',
                  englishText: 'Although it rains,',
                  sourceText: sourceThought(source, 'على الرغم من أنها تمطر', 'Although it rains,'),
                  targetText: 'Obwohl es regnet,',
                  role: 'connector',
                  explanation: 'Sub-clause with verb at end'
                },
                {
                  arabicText: 'gehe ich spazieren',
                  englishText: 'go I walking',
                  sourceText: sourceThought(source, 'أمشي أنا', 'go I walking'),
                  targetText: 'gehe ich spazieren',
                  role: 'verb',
                  explanation: 'Main clause with inverted subject after sub-clause'
                }
              ],
              habitHint: isAr
                ? 'obwohl تطرد regnet لنهاية جملتها، والجملة الرئيسية تبدأ فوراً بالفعل gehe.'
                : 'Conjunction "obwohl" kicks "regnet" to sub-clause end; the main clause starts with verb "gehe".'
            },
            {
              id: 'de-ex-3-5-2',
              arabicThought: 'هو متعب، مع ذلك يواصل العمل',
              englishTarget: 'Er ist müde, trotzdem arbeitet er weiter',
              sourceThought: sourceThought(source, 'هو متعب، مع ذلك يواصل العمل', 'He is tired, nevertheless he continues working'),
              targetSentence: 'Er ist müde, trotzdem arbeitet er weiter',
              acceptableAlternatives: ['Trotzdem arbeitet er weiter, obwohl er müde ist'],
              wordChips: ['Er', 'ist', 'müde,', 'trotzdem', 'arbeitet', 'er', 'weiter', 'obwohl', 'arbeiten'],
              breakdownChunks: [
                {
                  arabicText: 'Er ist müde,',
                  englishText: 'He is tired,',
                  sourceText: sourceThought(source, 'هو متعب', 'He is tired,'),
                  targetText: 'Er ist müde,',
                  role: 'subject',
                  explanation: 'First main clause'
                },
                {
                  arabicText: 'trotzdem arbeitet er weiter',
                  englishText: 'nevertheless works he on',
                  sourceText: sourceThought(source, 'مع ذلك يواصل العمل', 'nevertheless works he on'),
                  targetText: 'trotzdem arbeitet er weiter',
                  role: 'verb',
                  explanation: 'Adverb in position 1 inverting subject er after arbeitet'
                }
              ],
              habitHint: isAr
                ? 'trotzdem تأخذ الخانة 1، ويليها الفعل arbeitet فوراً ثم الضمير er.'
                : '"trotzdem" takes position 1, immediately followed by verb "arbeitet" and subject "er".'
            }
          ]
        }
      ]
    }
  ];
}
