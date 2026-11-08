import { Phase, SourceLanguage } from '../../types';

export function getSpanishPhases(source: SourceLanguage): Phase[] {
  const isAr = source === 'ar';

  return [
    {
      id: 1,
      title: 'Los Cimientos · Spanish Foundations',
      titleAr: 'الأساسات الإسبانية: الأجناس والفعل ser/estar',
      level: 'A1 – A2',
      tagline: isAr
        ? 'أتقن أدوات التعريف (el/la)، توافق الصفة (o/a)، والفرق بين ser (دائم) و estar (حالة).'
        : 'Master definite articles (el/la), adjective agreement (o/a), and the ser (permanent) vs estar (state) split.',
      lessons: [
        {
          id: 'es-p1-l1',
          phaseId: 1,
          phaseTitle: 'Los Cimientos · Spanish Foundations',
          phaseLevel: 'A1 – A2',
          number: 1,
          title: 'Gendered Articles & Adjective Agreement',
          titleAr: 'أدوات التعريف (el/la) وتوافق الصفة (o/a)',
          transferConcept: isAr
            ? 'في الإسبانية، كل اسم إما مذكر (el) أو مؤنث (la)، والصفة تغير terminación (o/a) لتوافق جنس الاسم: la casa blanca (البيت الأبيض).'
            : 'In Spanish, every noun is masculine (el) or feminine (la), and adjectives change their ending (o/a) to match the noun gender: la casa blanca.',
          transferConceptAr: 'الاسم المذكر يأخذ el والمؤنث la، والصفة تغير o/a لتوافق جنس الاسم.',
          weakSpotTag: 'gender-agreement',
          exercises: [
            {
              id: 'es-ex-1-1-1',
              arabicThought: 'البيت الأبيض كبير',
              englishTarget: 'La casa blanca es grande',
              sourceThought: isAr ? 'البيت الأبيض كبير' : 'The white house is big',
              targetSentence: 'La casa blanca es grande',
              acceptableAlternatives: ['La casa grande es blanca'],
              wordChips: ['La', 'casa', 'blanca', 'es', 'grande', 'el', 'blanco'],
              breakdownChunks: [
                {
                  arabicText: 'La casa',
                  englishText: 'The house',
                  sourceText: isAr ? 'البيت' : 'The house',
                  targetText: 'La casa',
                  role: 'subject',
                  explanation: 'Feminine noun with definite article la'
                },
                {
                  arabicText: 'blanca',
                  englishText: 'white',
                  sourceText: isAr ? 'أبيض' : 'white',
                  targetText: 'blanca',
                  role: 'modifier',
                  explanation: 'Adjective agrees in gender: blanco -> blanca'
                },
                {
                  arabicText: 'es grande',
                  englishText: 'is big',
                  sourceText: isAr ? 'كبير' : 'is big',
                  targetText: 'es grande',
                  role: 'verb',
                  explanation: 'ser + adjective for permanent quality'
                }
              ],
              habitHint: isAr
                ? 'ك casa مؤنث، فالأداة la والصفة blanca (وليس blanco).'
                : 'casa is feminine, so use la and blanca (not blanco).'
            },
            {
              id: 'es-ex-1-1-2',
              arabicThought: 'الولد الصغير يلعب',
              englishTarget: 'El niño pequeño juega',
              sourceThought: isAr ? 'الولد الصغير يلعب' : 'The small boy plays',
              targetSentence: 'El niño pequeño juega',
              acceptableAlternatives: ['El niño juega'],
              wordChips: ['El', 'niño', 'pequeño', 'juega', 'la', 'pequeña', 'jugar'],
              breakdownChunks: [
                {
                  arabicText: 'El niño',
                  englishText: 'The boy',
                  sourceText: isAr ? 'الولد' : 'The boy',
                  targetText: 'El niño',
                  role: 'subject',
                  explanation: 'Masculine noun with article el'
                },
                {
                  arabicText: 'pequeño',
                  englishText: 'small',
                  sourceText: isAr ? 'صغير' : 'small',
                  targetText: 'pequeño',
                  role: 'modifier',
                  explanation: 'Adjective agrees: pequeño (masc)'
                },
                {
                  arabicText: 'juega',
                  englishText: 'plays',
                  sourceText: isAr ? 'يلعب' : 'plays',
                  targetText: 'juega',
                  role: 'verb',
                  explanation: 'Third-person singular of jugar'
                }
              ],
              habitHint: isAr
                ? 'niño مذكر، لذا pequeño (وليس pequeña).'
                : 'niño is masculine, so pequeño (not pequeña).'
            },
            {
              id: 'es-ex-1-1-3',
              arabicThought: 'السيارة الحمراء سريعة',
              englishTarget: 'El coche rojo es rápido',
              sourceThought: isAr ? 'السيارة الحمراء سريعة' : 'The red car is fast',
              targetSentence: 'El coche rojo es rápido',
              acceptableAlternatives: ['La coche roja es rápida'],
              wordChips: ['El', 'coche', 'rojo', 'es', 'rápido', 'la', 'roja'],
              breakdownChunks: [
                {
                  arabicText: 'El coche',
                  englishText: 'The car',
                  sourceText: isAr ? 'السيارة' : 'The car',
                  targetText: 'El coche',
                  role: 'subject',
                  explanation: 'coche is masculine in Spanish'
                },
                {
                  arabicText: 'rojo',
                  englishText: 'red',
                  sourceText: isAr ? 'أحمر' : 'red',
                  targetText: 'rojo',
                  role: 'modifier',
                  explanation: 'Adjective agrees: rojo (masc)'
                },
                {
                  arabicText: 'es rápido',
                  englishText: 'is fast',
                  sourceText: isAr ? 'سريع' : 'is fast',
                  targetText: 'es rápido',
                  role: 'verb',
                  explanation: 'ser for permanent characteristic'
                }
              ],
              habitHint: isAr
                ? 'coche مذكر despite "car" often feminine in other languages; use el/rojo/rápido.'
                : 'coche is masculine; use el/rojo/rápido.'
            }
          ]
        },
        {
          id: 'es-p1-l2',
          phaseId: 1,
          phaseTitle: 'Los Cimientos · Spanish Foundations',
          phaseLevel: 'A1 – A2',
          number: 2,
          title: 'Ser vs Estar',
          titleAr: 'ser مقابل estar (دائم مقابل حالة)',
          transferConcept: isAr
            ? 'ser للهوية والصفات الدائمة (Soy estudiante)، و estar للحالات والمواضع المؤقتة (Estoy cansado).'
            : 'ser is for identity and permanent traits (Soy estudiante); estar is for states and temporary locations (Estoy cansado).',
          transferConceptAr: 'ser = هوية/دائم، estar = حالة/موقع مؤقت.',
          weakSpotTag: 'ser-estar',
          exercises: [
            {
              id: 'es-ex-1-2-1',
              arabicThought: 'أنا طالب',
              englishTarget: 'Soy estudiante',
              sourceThought: isAr ? 'أنا طالب' : 'I am a student',
              targetSentence: 'Soy estudiante',
              acceptableAlternatives: ['Yo soy estudiante'],
              wordChips: ['Soy', 'estudiante', 'estoy', 'estás', 'es'],
              breakdownChunks: [
                {
                  arabicText: 'Soy',
                  englishText: 'I am',
                  sourceText: isAr ? 'أنا' : 'I am',
                  targetText: 'Soy',
                  role: 'verb',
                  explanation: 'ser first-person singular for identity'
                },
                {
                  arabicText: 'estudiante',
                  englishText: 'student',
                  sourceText: isAr ? 'طالب' : 'student',
                  targetText: 'estudiante',
                  role: 'subject',
                  explanation: 'Noun of profession with ser'
                }
              ],
              habitHint: isAr
                ? 'المهنة/الهوية تستخدم ser: Soy estudiante.'
                : 'Profession/identity uses ser: Soy estudiante.'
            },
            {
              id: 'es-ex-1-2-2',
              arabicThought: 'أنا متعب',
              englishTarget: 'Estoy cansado',
              sourceThought: isAr ? 'أنا متعب' : 'I am tired',
              targetSentence: 'Estoy cansado',
              acceptableAlternatives: ['Estoy cansada'],
              wordChips: ['Estoy', 'cansado', 'soy', 'cansada', 'estás'],
              breakdownChunks: [
                {
                  arabicText: 'Estoy',
                  englishText: 'I am',
                  sourceText: isAr ? 'أنا' : 'I am',
                  targetText: 'Estoy',
                  role: 'verb',
                  explanation: 'estar first-person singular for state'
                },
                {
                  arabicText: 'cansado',
                  englishText: 'tired',
                  sourceText: isAr ? 'متعب' : 'tired',
                  targetText: 'cansado',
                  role: 'modifier',
                  explanation: 'Past participle as adjective with estar'
                }
              ],
              habitHint: isAr
                ? 'الحالة/الشعور المؤقت يستخدم estar: Estoy cansado.'
                : 'Temporary state/feeling uses estar: Estoy cansado.'
            }
          ]
        },
        {
          id: 'es-p1-l3',
          phaseId: 1,
          phaseTitle: 'Los Cimientos · Spanish Foundations',
          phaseLevel: 'A1 – A2',
          number: 3,
          title: 'Regular Present Tense -ar',
          titleAr: 'المضارع المنتظم -ar',
          transferConcept: isAr
            ? 'الأفعال المنتهية بـ -ar (hablar) تتصريف: yo hablo, tú hablas, él habla, nosotros hablamos, ellos hablan.'
            : 'Regular -ar verbs (hablar) conjugate: yo hablo, tú hablas, él habla, nosotros hablamos, ellos hablan.',
          transferConceptAr: 'تصريف -ar: hablo, hablas, habla, hablamos, hablan.',
          weakSpotTag: 'present-ar',
          exercises: [
            {
              id: 'es-ex-1-3-1',
              arabicThought: 'أنا أتحدث الإسبانية',
              englishTarget: 'Hablo español',
              sourceThought: isAr ? 'أنا أتحدث الإسبانية' : 'I speak Spanish',
              targetSentence: 'Hablo español',
              acceptableAlternatives: ['Yo hablo español'],
              wordChips: ['Hablo', 'español', 'habla', 'hablas', 'hablamos'],
              breakdownChunks: [
                {
                  arabicText: 'Hablo',
                  englishText: 'I speak',
                  sourceText: isAr ? 'أتحدث' : 'I speak',
                  targetText: 'Hablo',
                  role: 'verb',
                  explanation: 'First-person singular of hablar (-ar)'
                },
                {
                  arabicText: 'español',
                  englishText: 'Spanish',
                  sourceText: isAr ? 'الإسبانية' : 'Spanish',
                  targetText: 'español',
                  role: 'object',
                  explanation: 'Language as direct object'
                }
              ],
              habitHint: isAr
                ? 'في الإسبانية، الضمير "yo" يمكن حذفه: Hablo español.'
                : 'In Spanish, the subject pronoun yo can be dropped: Hablo español.'
            },
            {
              id: 'es-ex-1-3-2',
              arabicThought: 'نحن ندرس في المكتبة',
              englishTarget: 'Estudiamos en la biblioteca',
              sourceThought: isAr ? 'نحن ندرس في المكتبة' : 'We study in the library',
              targetSentence: 'Estudiamos en la biblioteca',
              acceptableAlternatives: ['Nosotros estudiamos en la biblioteca'],
              wordChips: ['Estudiamos', 'en', 'la', 'biblioteca', 'estudian', 'estudio'],
              breakdownChunks: [
                {
                  arabicText: 'Estudiamos',
                  englishText: 'We study',
                  sourceText: isAr ? 'ندرس' : 'We study',
                  targetText: 'Estudiamos',
                  role: 'verb',
                  explanation: 'First-person plural of estudiar (-ar)'
                },
                {
                  arabicText: 'en la biblioteca',
                  englishText: 'in the library',
                  sourceText: isAr ? 'في المكتبة' : 'in the library',
                  targetText: 'en la biblioteca',
                  role: 'modifier',
                  explanation: 'Prepositional phrase of place'
                }
              ],
              habitHint: isAr
                ? 'نحن = estudiamos (بدون nosotros).'
                : 'We = estudiamos (nosotros optional).'
            }
          ]
        },
        {
          id: 'es-p1-l4',
          phaseId: 1,
          phaseTitle: 'Los Cimientos · Spanish Foundations',
          phaseLevel: 'A1 – A2',
          number: 4,
          title: 'Regular Present Tense -er / -ir',
          titleAr: 'المضارع المنتظم -er و -ir',
          transferConcept: isAr
            ? 'الأفعال بـ -er (comer) و -ir (vivir) تشترك في تصريف المضارع: yo como/vivo, tú comes/vives, él come/vive.'
            : 'Regular -er (comer) and -ir (vivir) verbs share present conjugation: yo como/vivo, tú comes/vives, él come/vive.',
          transferConceptAr: 'تصريف -er/-ir: como/vivo, comes/vives, come/vive.',
          weakSpotTag: 'present-er-ir',
          exercises: [
            {
              id: 'es-ex-1-4-1',
              arabicThought: 'أنا آكل خبزاً',
              englishTarget: 'Como pan',
              sourceThought: isAr ? 'أنا آكل خبزاً' : 'I eat bread',
              targetSentence: 'Como pan',
              acceptableAlternatives: ['Yo como pan'],
              wordChips: ['Como', 'pan', 'comes', 'come', 'comemos'],
              breakdownChunks: [
                {
                  arabicText: 'Como',
                  englishText: 'I eat',
                  sourceText: isAr ? 'آكل' : 'I eat',
                  targetText: 'Como',
                  role: 'verb',
                  explanation: 'First-person singular of comer (-er)'
                },
                {
                  arabicText: 'pan',
                  englishText: 'bread',
                  sourceText: isAr ? 'خبز' : 'bread',
                  targetText: 'pan',
                  role: 'object',
                  explanation: 'Direct object'
                }
              ],
              habitHint: isAr
                ? 'الضمير yo محذوف: Como pan.'
                : 'Subject pronoun yo is dropped: Como pan.'
            },
            {
              id: 'es-ex-1-4-2',
              arabicThought: 'هو يعيش في مدريد',
              englishTarget: 'Vive en Madrid',
              sourceThought: isAr ? 'هو يعيش في مدريد' : 'He lives in Madrid',
              targetSentence: 'Vive en Madrid',
              acceptableAlternatives: ['Él vive en Madrid'],
              wordChips: ['Vive', 'en', 'Madrid', 'vivo', 'viven', 'vives'],
              breakdownChunks: [
                {
                  arabicText: 'Vive',
                  englishText: 'He lives',
                  sourceText: isAr ? 'يعيش' : 'He lives',
                  targetText: 'Vive',
                  role: 'verb',
                  explanation: 'Third-person singular of vivir (-ir)'
                },
                {
                  arabicText: 'en Madrid',
                  englishText: 'in Madrid',
                  sourceText: isAr ? 'في مدريد' : 'in Madrid',
                  targetText: 'en Madrid',
                  role: 'modifier',
                  explanation: 'Prepositional phrase of place'
                }
              ],
              habitHint: isAr
                ? 'vivir (-ir) مثل comer (-er) في المفرد: vive.'
                : 'vivir (-ir) behaves like comer (-er) in singular: vive.'
            }
          ]
        },
        {
          id: 'es-p1-l5',
          phaseId: 1,
          phaseTitle: 'Los Cimientos · Spanish Foundations',
          phaseLevel: 'A1 – A2',
          number: 5,
          title: 'Question Formation & Inversion',
          titleAr: 'تكوين الأسئلة والقلب (Inversión)',
          transferConcept: isAr
            ? 'في الإسبانية، الأسئلة تستخدم inversion (فعل + فاعل) أو intonation، وتبدأ بـ ¿ و تنتهي بـ ?: ¿Cómo te llamas?'
            : 'Spanish questions use inversion (verb + subject) or intonation, and are wrapped in ¿ ... ?: ¿Cómo te llamas?',
          transferConceptAr: 'الأسئلة تبدأ بـ ¿ وتنتهي بـ ?، وتستخدم inversion.',
          weakSpotTag: 'questions-inversion',
          exercises: [
            {
              id: 'es-ex-1-5-1',
              arabicThought: 'كيف تسمى؟',
              englishTarget: '¿Cómo te llamas?',
              sourceThought: isAr ? 'كيف تسمى؟' : 'What is your name?',
              targetSentence: '¿Cómo te llamas?',
              acceptableAlternatives: ['¿Cuál es tu nombre?'],
              wordChips: ['¿Cómo', 'te', 'llamas?', 'tu', 'nombre', 'es'],
              breakdownChunks: [
                {
                  arabicText: '¿Cómo',
                  englishText: 'How',
                  sourceText: isAr ? 'كيف' : 'How',
                  targetText: '¿Cómo',
                  role: 'connector',
                  explanation: 'Interrogative opener'
                },
                {
                  arabicText: 'te llamas',
                  englishText: 'do you call yourself',
                  sourceText: isAr ? 'تسمى' : 'do you call yourself',
                  targetText: 'te llamas',
                  role: 'verb',
                  explanation: 'Reflexive verb llamarse, second person'
                }
              ],
              habitHint: isAr
                ? 'الأسئلة تُغلق بـ ? وتُفتح بـ ¿.'
                : 'Questions open with ¿ and close with ?.'
            },
            {
              id: 'es-ex-1-5-2',
              arabicThought: 'أين تعيش؟',
              englishTarget: '¿Dónde vives?',
              sourceThought: isAr ? 'أين تعيش؟' : 'Where do you live?',
              targetSentence: '¿Dónde vives?',
              acceptableAlternatives: ['¿En dónde vives?'],
              wordChips: ['¿Dónde', 'vives?', 'vive', 'vivo', 'viven'],
              breakdownChunks: [
                {
                  arabicText: '¿Dónde',
                  englishText: 'Where',
                  sourceText: isAr ? 'أين' : 'Where',
                  targetText: '¿Dónde',
                  role: 'connector',
                  explanation: 'Interrogative of place'
                },
                {
                  arabicText: 'vives',
                  englishText: 'do you live',
                  sourceText: isAr ? 'تعيش' : 'do you live',
                  targetText: 'vives',
                  role: 'verb',
                  explanation: 'Second-person singular of vivir'
                }
              ],
              habitHint: isAr
                ? '¿Dónde + فعل (vives) بدون subject pronoun.'
                : '¿Dónde + verb (vives) with dropped subject pronoun.'
            }
          ]
        }
      ]
    },
    {
      id: 2,
      title: 'Conexiones y Pasado · Connectors & Past',
      titleAr: 'الروابط والماضي: preterite/imperfect والضمائر',
      level: 'A2 – B1',
      tagline: isAr
        ? 'أتقن preterite (حدث منتهٍ) مقابل imperfect (وصف/عادة)، ضمائر المفعول (lo/la/le)، por/para، والفعل reflexive.'
        : 'Master preterite (completed event) vs imperfect (description/habit), object pronouns (lo/la/le), por/para, and reflexive verbs.',
      lessons: [
        {
          id: 'es-p2-l1',
          phaseId: 2,
          phaseTitle: 'Conexiones y Pasado · Connectors & Past',
          phaseLevel: 'A2 – B1',
          number: 1,
          title: 'Preterite vs Imperfect',
          titleAr: 'preterite مقابل imperfect',
          transferConcept: isAr
            ? 'preterite (comí) لحدث منتهٍ في وقت محدد؛ imperfect (comía) لعادة أو وصف في الماضي: Ayer comí paella / Cuando era niño vivía en El Cairo.'
            : 'preterite (comí) for a completed event at a specific time; imperfect (comía) for habits or descriptions in the past.',
          transferConceptAr: 'preterite = حدث منتهٍ، imperfect = عادة/وصف.',
          weakSpotTag: 'preterite-imperfect',
          exercises: [
            {
              id: 'es-ex-2-1-1',
              arabicThought: 'أمس أكلت باييلا',
              englishTarget: 'Ayer comí paella',
              sourceThought: isAr ? 'أمس أكلت باييلا' : 'Yesterday I ate paella',
              targetSentence: 'Ayer comí paella',
              acceptableAlternatives: ['Comí paella ayer'],
              wordChips: ['Ayer', 'comí', 'paella', 'comía', 'como', 'comimos'],
              breakdownChunks: [
                {
                  arabicText: 'Ayer',
                  englishText: 'Yesterday',
                  sourceText: isAr ? 'أمس' : 'Yesterday',
                  targetText: 'Ayer',
                  role: 'connector',
                  explanation: 'Time marker for completed event'
                },
                {
                  arabicText: 'comí',
                  englishText: 'I ate',
                  sourceText: isAr ? 'أكلت' : 'I ate',
                  targetText: 'comí',
                  role: 'verb',
                  explanation: 'Preterite first-person singular of comer'
                },
                {
                  arabicText: 'paella',
                  englishText: 'paella',
                  sourceText: isAr ? 'باييلا' : 'paella',
                  targetText: 'paella',
                  role: 'object',
                  explanation: 'Direct object'
                }
              ],
              habitHint: isAr
                ? 'حدث منتهٍ (أمس) → preterite: comí.'
                : 'Completed event (yesterday) → preterite: comí.'
            },
            {
              id: 'es-ex-2-1-2',
              arabicThought: 'عندما كنت طفلاً، كنت أعيش في القاهرة',
              englishTarget: 'Cuando era niño vivía en El Cairo',
              sourceThought: isAr ? 'عندما كنت طفلاً، كنت أعيش في القاهرة' : 'When I was a child, I lived in Cairo',
              targetSentence: 'Cuando era niño vivía en El Cairo',
              acceptableAlternatives: ['Vivía en El Cairo cuando era niño'],
              wordChips: ['Cuando', 'era', 'niño', 'vivía', 'en', 'El', 'Cairo', 'viví'],
              breakdownChunks: [
                {
                  arabicText: 'Cuando era niño',
                  englishText: 'When I was a child',
                  sourceText: isAr ? 'عندما كنت طفلاً' : 'When I was a child',
                  targetText: 'Cuando era niño',
                  role: 'connector',
                  explanation: 'Imperfect for description/background'
                },
                {
                  arabicText: 'vivía',
                  englishText: 'I lived',
                  sourceText: isAr ? 'كنت أعيش' : 'I lived',
                  targetText: 'vivía',
                  role: 'verb',
                  explanation: 'Imperfect of vivir for habit'
                },
                {
                  arabicText: 'en El Cairo',
                  englishText: 'in Cairo',
                  sourceText: isAr ? 'في القاهرة' : 'in Cairo',
                  targetText: 'en El Cairo',
                  role: 'modifier',
                  explanation: 'Prepositional phrase of place'
                }
              ],
              habitHint: isAr
                ? 'عادة/وصف في الماضي → imperfect: vivía.'
                : 'Habit/description in past → imperfect: vivía.'
            }
          ]
        },
        {
          id: 'es-p2-l2',
          phaseId: 2,
          phaseTitle: 'Conexiones y Pasado · Connectors & Past',
          phaseLevel: 'A2 – B1',
          number: 2,
          title: 'Direct & Indirect Object Pronouns',
          titleAr: 'ضمائر المفعول المباشر (lo/la) والغير مباشر (le/les)',
          transferConcept: isAr
            ? 'ضمائر المفعول تسبق الفعل: lo (هو)، la (هي)، le (له/لها)، les (لهم): Lo vi (رأيته)، Le di el libro (أعطيته الكتاب).'
            : 'Object pronouns precede the verb: lo (him/it), la (her/it), le (to him/her), les (to them): Lo vi, Le di el libro.',
          transferConceptAr: 'ضمائر المفعول قبل الفعل: lo/la/le/les.',
          weakSpotTag: 'object-pronouns',
          exercises: [
            {
              id: 'es-ex-2-2-1',
              arabicThought: 'رأيته أمس',
              englishTarget: 'Lo vi ayer',
              sourceThought: isAr ? 'رأيته أمس' : 'I saw him yesterday',
              targetSentence: 'Lo vi ayer',
              acceptableAlternatives: ['Ayer lo vi'],
              wordChips: ['Lo', 'vi', 'ayer', 'la', 'le', 'vió'],
              breakdownChunks: [
                {
                  arabicText: 'Lo',
                  englishText: 'Him',
                  sourceText: isAr ? 'ه' : 'Him',
                  targetText: 'Lo',
                  role: 'object',
                  explanation: 'Direct object pronoun (masc)'
                },
                {
                  arabicText: 'vi',
                  englishText: 'I saw',
                  sourceText: isAr ? 'رأيت' : 'I saw',
                  targetText: 'vi',
                  role: 'verb',
                  explanation: 'Preterite of ver'
                },
                {
                  arabicText: 'ayer',
                  englishText: 'yesterday',
                  sourceText: isAr ? 'أمس' : 'yesterday',
                  targetText: 'ayer',
                  role: 'modifier',
                  explanation: 'Time adverb'
                }
              ],
              habitHint: isAr
                ? 'ضمير المفعول (lo) قبل الفعل (vi).'
                : 'Object pronoun (lo) before the verb (vi).'
            },
            {
              id: 'es-ex-2-2-2',
              arabicThought: 'أعطيته الكتاب',
              englishTarget: 'Le di el libro',
              sourceThought: isAr ? 'أعطيته الكتاب' : 'I gave him the book',
              targetSentence: 'Le di el libro',
              acceptableAlternatives: ['Le di un libro'],
              wordChips: ['Le', 'di', 'el', 'libro', 'la', 'lo', 'dio'],
              breakdownChunks: [
                {
                  arabicText: 'Le',
                  englishText: 'To him',
                  sourceText: isAr ? 'له' : 'To him',
                  targetText: 'Le',
                  role: 'object',
                  explanation: 'Indirect object pronoun'
                },
                {
                  arabicText: 'di',
                  englishText: 'I gave',
                  sourceText: isAr ? 'أعطيت' : 'I gave',
                  targetText: 'di',
                  role: 'verb',
                  explanation: 'Preterite of dar'
                },
                {
                  arabicText: 'el libro',
                  englishText: 'the book',
                  sourceText: isAr ? 'الكتاب' : 'the book',
                  targetText: 'el libro',
                  role: 'object',
                  explanation: 'Direct object'
                }
              ],
              habitHint: isAr
                ? 'indirect (le) + verb + direct object.'
                : 'indirect (le) + verb + direct object.'
            }
          ]
        },
        {
          id: 'es-p2-l3',
          phaseId: 2,
          phaseTitle: 'Conexiones y Pasado · Connectors & Past',
          phaseLevel: 'A2 – B1',
          number: 3,
          title: 'Por vs Para',
          titleAr: 'por مقابل para',
          transferConcept: isAr
            ? 'para = هدف/وجهة/موعد (Para mañana)، por = سبب/مدة/ means (Por eso، por la mañana).'
            : 'para = purpose/destination/deadline (Para mañana); por = cause/duration/means (Por eso، por la mañana).',
          transferConceptAr: 'para = هدف/وجهة، por = سبب/مدة.',
          weakSpotTag: 'por-para',
          exercises: [
            {
              id: 'es-ex-2-3-1',
              arabicThought: 'هذا الهدية لك',
              englishTarget: 'Este regalo es para ti',
              sourceThought: isAr ? 'هذا الهدية لك' : 'This gift is for you',
              targetSentence: 'Este regalo es para ti',
              acceptableAlternatives: ['El regalo es para ti'],
              wordChips: ['Este', 'regalo', 'es', 'para', 'ti', 'por', 'tú'],
              breakdownChunks: [
                {
                  arabicText: 'Este regalo',
                  englishText: 'This gift',
                  sourceText: isAr ? 'هذا الهدية' : 'This gift',
                  targetText: 'Este regalo',
                  role: 'subject',
                  explanation: 'Demonstrative + noun'
                },
                {
                  arabicText: 'es para ti',
                  englishText: 'is for you',
                  sourceText: isAr ? 'لك' : 'is for you',
                  targetText: 'es para ti',
                  role: 'verb',
                  explanation: 'para for recipient/destination'
                }
              ],
              habitHint: isAr
                ? 'المستفيد/الوجهة → para.'
                : 'Recipient/destination → para.'
            },
            {
              id: 'es-ex-2-3-2',
              arabicThought: 'أشرب قهوة في الصباح',
              englishTarget: 'Bebo café por la mañana',
              sourceThought: isAr ? 'أشرب قهوة في الصباح' : 'I drink coffee in the morning',
              targetSentence: 'Bebo café por la mañana',
              acceptableAlternatives: ['Tomo café por la mañana'],
              wordChips: ['Bebo', 'café', 'por', 'la', 'mañana', 'para', 'el'],
              breakdownChunks: [
                {
                  arabicText: 'Bebo café',
                  englishText: 'I drink coffee',
                  sourceText: isAr ? 'أشرب قهوة' : 'I drink coffee',
                  targetText: 'Bebo café',
                  role: 'verb',
                  explanation: 'Present tense of beber'
                },
                {
                  arabicText: 'por la mañana',
                  englishText: 'in the morning',
                  sourceText: isAr ? 'في الصباح' : 'in the morning',
                  targetText: 'por la mañana',
                  role: 'modifier',
                  explanation: 'por for time of day'
                }
              ],
              habitHint: isAr
                ? 'وقت/مدة → por (por la mañana).'
                : 'Time/duration → por (por la mañana).'
            }
          ]
        },
        {
          id: 'es-p2-l4',
          phaseId: 2,
          phaseTitle: 'Conexiones y Pasado · Connectors & Past',
          phaseLevel: 'A2 – B1',
          number: 4,
          title: 'Reflexive Verbs & Daily Routine',
          titleAr: 'الأفعال Reflexive والروتين اليومي',
          transferConcept: isAr
            ? 'الأفعال reflexive (levantarse, ducharse) تتطلب ضمير reflexive (me, te, se) قبل الفعل: Me levanto a las 7.'
            : 'Reflexive verbs (levantarse, ducharse) require a reflexive pronoun (me, te, se) before the verb: Me levanto a las 7.',
          transferConceptAr: 'الأفعال reflexive تأخذ ضمير reflexive: me/te/se + فعل.',
          weakSpotTag: 'reflexive-verbs',
          exercises: [
            {
              id: 'es-ex-2-4-1',
              arabicThought: 'أستيقظ في السابعة',
              englishTarget: 'Me levanto a las siete',
              sourceThought: isAr ? 'أستيقظ في السابعة' : 'I get up at seven',
              targetSentence: 'Me levanto a las siete',
              acceptableAlternatives: ['Me levanto a las 7'],
              wordChips: ['Me', 'levanto', 'a', 'las', 'siete', 'te', 'levanta'],
              breakdownChunks: [
                {
                  arabicText: 'Me',
                  englishText: 'Myself',
                  sourceText: isAr ? 'نفسي' : 'Myself',
                  targetText: 'Me',
                  role: 'object',
                  explanation: 'Reflexive pronoun'
                },
                {
                  arabicText: 'levanto',
                  englishText: 'I get up',
                  sourceText: isAr ? 'أستيقظ' : 'I get up',
                  targetText: 'levanto',
                  role: 'verb',
                  explanation: 'First-person singular of levantarse'
                },
                {
                  arabicText: 'a las siete',
                  englishText: 'at seven',
                  sourceText: isAr ? 'في السابعة' : 'at seven',
                  targetText: 'a las siete',
                  role: 'modifier',
                  explanation: 'Time expression'
                }
              ],
              habitHint: isAr
                ? 'reflexive: me + levanto.'
                : 'reflexive: me + levanto.'
            },
            {
              id: 'es-ex-2-4-2',
              arabicThought: 'أنا أستحم',
              englishTarget: 'Me ducho',
              sourceThought: isAr ? 'أنا أستحم' : 'I shower',
              targetSentence: 'Me ducho',
              acceptableAlternatives: ['Me baño'],
              wordChips: ['Me', 'ducho', 'duchas', 'ducha', 'baño'],
              breakdownChunks: [
                {
                  arabicText: 'Me',
                  englishText: 'Myself',
                  sourceText: isAr ? 'نفسي' : 'Myself',
                  targetText: 'Me',
                  role: 'object',
                  explanation: 'Reflexive pronoun'
                },
                {
                  arabicText: 'ducho',
                  englishText: 'I shower',
                  sourceText: isAr ? 'أستحم' : 'I shower',
                  targetText: 'ducho',
                  role: 'verb',
                  explanation: 'First-person singular of ducharse'
                }
              ],
              habitHint: isAr
                ? 'ducharse reflexive: me ducho.'
                : 'ducharse is reflexive: me ducho.'
            }
          ]
        },
        {
          id: 'es-p2-l5',
          phaseId: 2,
          phaseTitle: 'Conexiones y Pasado · Connectors & Past',
          phaseLevel: 'A2 – B1',
          number: 5,
          title: 'Subjunctive after "que" (Wish/Emotion)',
          titleAr: 'الم subjunctive بعد "que" (أمنية/عاطفة)',
          transferConcept: isAr
            ? 'بعد تعبيرات الأمنية/العاطفة (Espero que، Me alegro de que)، يستخدم subjunctive: Espero que tengas razón.'
            : 'After wish/emotion expressions (Espero que, Me alegro de que), use subjunctive: Espero que tengas razón.',
          transferConceptAr: 'أمنية/عاطفة + que + subjunctive.',
          weakSpotTag: 'subjunctive-wish',
          exercises: [
            {
              id: 'es-ex-2-5-1',
              arabicThought: 'آمل أن تكون على حق',
              englishTarget: 'Espero que tengas razón',
              sourceThought: isAr ? 'آمل أن تكون على حق' : 'I hope you are right',
              targetSentence: 'Espero que tengas razón',
              acceptableAlternatives: ['Espero que tengas razón.'],
              wordChips: ['Espero', 'que', 'tengas', 'razón', 'tienes', 'tiene'],
              breakdownChunks: [
                {
                  arabicText: 'Espero',
                  englishText: 'I hope',
                  sourceText: isAr ? 'آمل' : 'I hope',
                  targetText: 'Espero',
                  role: 'verb',
                  explanation: 'Main clause verb'
                },
                {
                  arabicText: 'que tengas razón',
                  englishText: 'that you are right',
                  sourceText: isAr ? 'أن تكون على حق' : 'that you are right',
                  targetText: 'que tengas razón',
                  role: 'connector',
                  explanation: 'que + subjunctive (tengas)'
                }
              ],
              habitHint: isAr
                ? 'Espero que + subjunctive (tengas، ليس tienes).'
                : 'Espero que + subjunctive (tengas, not tienes).'
            },
            {
              id: 'es-ex-2-5-2',
              arabicThought: 'أنا سعيد لأنك هنا',
              englishTarget: 'Me alegro de que estés aquí',
              sourceThought: isAr ? 'أنا سعيد لأنك هنا' : 'I am glad that you are here',
              targetSentence: 'Me alegro de que estés aquí',
              acceptableAlternatives: ['Me alegro de que estés aquí.'],
              wordChips: ['Me', 'alegro', 'de', 'que', 'estés', 'aquí', 'estás'],
              breakdownChunks: [
                {
                  arabicText: 'Me alegro de que',
                  englishText: 'I am glad that',
                  sourceText: isAr ? 'أنا سعيد لأن' : 'I am glad that',
                  targetText: 'Me alegro de que',
                  role: 'verb',
                  explanation: 'Emotion expression'
                },
                {
                  arabicText: 'estés aquí',
                  englishText: 'you are here',
                  sourceText: isAr ? 'أنك هنا' : 'you are here',
                  targetText: 'estés aquí',
                  role: 'connector',
                  explanation: 'subjunctive after emotion'
                }
              ],
              habitHint: isAr
                ? 'Me alegro de que + subjunctive (estés).'
                : 'Me alegro de que + subjunctive (estés).'
            }
          ]
        }
      ]
    },
    {
      id: 3,
      title: 'Dominio · Mastery',
      titleAr: 'الإتقان: subjunctive متقدم، شرط، مبني للمجهول، register مهني',
      level: 'B1 – B2',
      tagline: isAr
        ? 'أتقن subjunctive في Clauses (cuando, hasta que)، الشرط (Me gustaría)، مبني للمجهول (se habla)، واللغة المهنية (Estimado/a).'
        : 'Master subjunctive in clauses (cuando, hasta que), conditional (Me gustaría), passive with se, and business register (Estimado/a).',
      lessons: [
        {
          id: 'es-p3-l1',
          phaseId: 3,
          phaseTitle: 'Dominio · Mastery',
          phaseLevel: 'B1 – B2',
          number: 1,
          title: 'Subjunctive in Adverbial Clauses',
          titleAr: 'subjunctive في Clauses (cuando, hasta que)',
          transferConcept: isAr
            ? 'في clauses مع cuando/hasta que/antes de que، استخدم subjunctive إذا كان الحدث مستقبلياً: Cuando llegues, llámame.'
            : 'In clauses with cuando/hasta que/antes de que, use subjunctive when the event is future: Cuando llegues, llámame.',
          transferConceptAr: 'cuando/hasta que + subjunctive (إذا مستقبل).',
          weakSpotTag: 'subjunctive-clauses',
          exercises: [
            {
              id: 'es-ex-3-1-1',
              arabicThought: 'عندما تصل، اتصل بي',
              englishTarget: 'Cuando llegues, llámame',
              sourceThought: isAr ? 'عندما تصل، اتصل بي' : 'When you arrive, call me',
              targetSentence: 'Cuando llegues, llámame',
              acceptableAlternatives: ['Llámame cuando llegues'],
              wordChips: ['Cuando', 'llegues', 'llámame', 'llegas', 'llegar'],
              breakdownChunks: [
                {
                  arabicText: 'Cuando llegues',
                  englishText: 'When you arrive',
                  sourceText: isAr ? 'عندما تصل' : 'When you arrive',
                  targetText: 'Cuando llegues',
                  role: 'connector',
                  explanation: 'cuando + subjunctive (future event)'
                },
                {
                  arabicText: 'llámame',
                  englishText: 'call me',
                  sourceText: isAr ? 'اتصل بي' : 'call me',
                  targetText: 'llámame',
                  role: 'verb',
                  explanation: 'Imperative with reflexive pronoun'
                }
              ],
              habitHint: isAr
                ? 'حدث مستقبلي → subjunctive: llegues (وليس llegas).'
                : 'Future event → subjunctive: llegues (not llegas).'
            },
            {
              id: 'es-ex-3-1-2',
              arabicThought: 'سأنتظر حتى تنتهي',
              englishTarget: 'Esperaré hasta que termines',
              sourceThought: isAr ? 'سأنتظر حتى تنتهي' : 'I will wait until you finish',
              targetSentence: 'Esperaré hasta que termines',
              acceptableAlternatives: ['Hasta que termines, esperaré'],
              wordChips: ['Esperaré', 'hasta', 'que', 'termines', 'terminas', 'terminar'],
              breakdownChunks: [
                {
                  arabicText: 'Esperaré',
                  englishText: 'I will wait',
                  sourceText: isAr ? 'سأنتظر' : 'I will wait',
                  targetText: 'Esperaré',
                  role: 'verb',
                  explanation: 'Future tense'
                },
                {
                  arabicText: 'hasta que termines',
                  englishText: 'until you finish',
                  sourceText: isAr ? 'حتى تنتهي' : 'until you finish',
                  targetText: 'hasta que termines',
                  role: 'connector',
                  explanation: 'hasta que + subjunctive'
                }
              ],
              habitHint: isAr
                ? 'hasta que + subjunctive (termines).'
                : 'hasta que + subjunctive (termines).'
            }
          ]
        },
        {
          id: 'es-p3-l2',
          phaseId: 3,
          phaseTitle: 'Dominio · Mastery',
          phaseLevel: 'B1 – B2',
          number: 2,
          title: 'Conditional & Polite Register',
          titleAr: 'الشرط (conditional) واللغة المهذبة',
          transferConcept: isAr
            ? 'الشرط (Me gustaría، ¿Podría usted...?) для طلب مهذب: Me gustaría un café، por favor.'
            : 'Conditional for polite requests: Me gustaría un café, por favor.',
          transferConceptAr: 'الشرط للطلب المهذب: Me gustaría، ¿Podría usted...?',
          weakSpotTag: 'conditional-polite',
          exercises: [
            {
              id: 'es-ex-3-2-1',
              arabicThought: 'أود الحصول على فنجان قهوة، من فضلك',
              englishTarget: 'Me gustaría un café, por favor',
              sourceThought: isAr ? 'أود الحصول على فنجان قهوة، من فضلك' : 'I would like a coffee, please',
              targetSentence: 'Me gustaría un café, por favor',
              acceptableAlternatives: ['Quisiera un café, por favor'],
              wordChips: ['Me', 'gustaría', 'un', 'café,', 'por', 'favor', 'quiero'],
              breakdownChunks: [
                {
                  arabicText: 'Me gustaría',
                  englishText: 'I would like',
                  sourceText: isAr ? 'أود' : 'I would like',
                  targetText: 'Me gustaría',
                  role: 'verb',
                  explanation: 'Conditional of gustar for politeness'
                },
                {
                  arabicText: 'un café',
                  englishText: 'a coffee',
                  sourceText: isAr ? 'فنجان قهوة' : 'a coffee',
                  targetText: 'un café',
                  role: 'object',
                  explanation: 'Direct object'
                },
                {
                  arabicText: 'por favor',
                  englishText: 'please',
                  sourceText: isAr ? 'من فضلك' : 'please',
                  targetText: 'por favor',
                  role: 'modifier',
                  explanation: 'Courtesy phrase'
                }
              ],
              habitHint: isAr
                ? 'Me gustaría = طلب مهذب (conditional).'
                : 'Me gustaría = polite request (conditional).'
            },
            {
              id: 'es-ex-3-2-2',
              arabicThought: 'هل يمكنك مساعدتي؟',
              englishTarget: '¿Podría usted ayudarme?',
              sourceThought: isAr ? 'هل يمكنك مساعدتي؟' : 'Could you help me?',
              targetSentence: '¿Podría usted ayudarme?',
              acceptableAlternatives: ['¿Podrías ayudarme?'],
              wordChips: ['¿Podría', 'usted', 'ayudarme?', 'puedes', 'ayuda'],
              breakdownChunks: [
                {
                  arabicText: '¿Podría usted',
                  englishText: 'Could you (formal)',
                  sourceText: isAr ? 'هل يمكنك' : 'Could you (formal)',
                  targetText: '¿Podría usted',
                  role: 'verb',
                  explanation: 'Conditional polite + formal pronoun'
                },
                {
                  arabicText: 'ayudarme',
                  englishText: 'help me',
                  sourceText: isAr ? 'مساعدتي' : 'help me',
                  targetText: 'ayudarme',
                  role: 'verb',
                  explanation: 'Infinitive + reflexive pronoun'
                }
              ],
              habitHint: isAr
                ? '¿Podría usted = صيغة مهذبة/رسمية.'
                : '¿Podría usted = polite/formal register.'
            }
          ]
        },
        {
          id: 'es-p3-l3',
          phaseId: 3,
          phaseTitle: 'Dominio · Mastery',
          phaseLevel: 'B1 – B2',
          number: 3,
          title: 'Passive with "se"',
          titleAr: 'المبني للمجهول مع "se"',
          transferConcept: isAr
            ? 'للوصف impersonal/被动态، استخدم se + فعل: Se habla español (يتحدث الإسبانية).'
            : 'For impersonal/passive, use se + verb: Se habla español (Spanish is spoken).',
          transferConceptAr: 'se + فعل للوصف impersonal.',
          weakSpotTag: 'passive-se',
          exercises: [
            {
              id: 'es-ex-3-3-1',
              arabicThought: 'يتحدث الإسبانية هنا',
              englishTarget: 'Se habla español aquí',
              sourceThought: isAr ? 'يتحدث الإسبانية هنا' : 'Spanish is spoken here',
              targetSentence: 'Se habla español aquí',
              acceptableAlternatives: ['Aquí se habla español'],
              wordChips: ['Se', 'habla', 'español', 'aquí', 'hablan', 'hablo'],
              breakdownChunks: [
                {
                  arabicText: 'Se habla',
                  englishText: 'is spoken',
                  sourceText: isAr ? 'يتحدث' : 'is spoken',
                  targetText: 'Se habla',
                  role: 'verb',
                  explanation: 'se + third-person singular'
                },
                {
                  arabicText: 'español',
                  englishText: 'Spanish',
                  sourceText: isAr ? 'الإسبانية' : 'Spanish',
                  targetText: 'español',
                  role: 'subject',
                  explanation: 'Subject of passive'
                },
                {
                  arabicText: 'aquí',
                  englishText: 'here',
                  sourceText: isAr ? 'هنا' : 'here',
                  targetText: 'aquí',
                  role: 'modifier',
                  explanation: 'Place adverb'
                }
              ],
              habitHint: isAr
                ? 'se + فعل (habla) للوصف impersonal.'
                : 'se + verb (habla) for impersonal statement.'
            },
            {
              id: 'es-ex-3-3-2',
              arabicThought: 'تُباع التذاكر هنا',
              englishTarget: 'Se venden entradas aquí',
              sourceThought: isAr ? 'تُباع التذاكر هنا' : 'Tickets are sold here',
              targetSentence: 'Se venden entradas aquí',
              acceptableAlternatives: ['Aquí se venden entradas'],
              wordChips: ['Se', 'venden', 'entradas', 'aquí', 'vende', 'vendo'],
              breakdownChunks: [
                {
                  arabicText: 'Se venden',
                  englishText: 'are sold',
                  sourceText: isAr ? 'تُباع' : 'are sold',
                  targetText: 'Se venden',
                  role: 'verb',
                  explanation: 'se + plural verb (entradas)'
                },
                {
                  arabicText: 'entradas',
                  englishText: 'tickets',
                  sourceText: isAr ? 'التذاكر' : 'tickets',
                  targetText: 'entradas',
                  role: 'subject',
                  explanation: 'Plural subject'
                },
                {
                  arabicText: 'aquí',
                  englishText: 'here',
                  sourceText: isAr ? 'هنا' : 'here',
                  targetText: 'aquí',
                  role: 'modifier',
                  explanation: 'Place adverb'
                }
              ],
              habitHint: isAr
                ? 'إذا كان subject plural، الفعل plural: se venden.'
                : 'If subject is plural, verb plural: se venden.'
            }
          ]
        },
        {
          id: 'es-p3-l4',
          phaseId: 3,
          phaseTitle: 'Dominio · Mastery',
          phaseLevel: 'B1 – B2',
          number: 4,
          title: 'Reported Speech Tense Shift',
          titleAr: 'الكلام الم rapporté وتحول الأزمنة',
          transferConcept: isAr
            ? 'في الكلام الم rapporté، الأزمنة تتحول: Dijo que vendría (قال إنه سيأتي).'
            : 'In reported speech, tenses shift: Dijo que vendría (He said he would come).',
          transferConceptAr: 'الكلام الم rapporté: تحول الأزمنة (vendría).',
          weakSpotTag: 'reported-speech',
          exercises: [
            {
              id: 'es-ex-3-4-1',
              arabicThought: 'قال إنه سيأتي',
              englishTarget: 'Dijo que vendría',
              sourceThought: isAr ? 'قال إنه سيأتي' : 'He said he would come',
              targetSentence: 'Dijo que vendría',
              acceptableAlternatives: ['Dijo que iba a venir'],
              wordChips: ['Dijo', 'que', 'vendría', 'viene', 'vino', 'diría'],
              breakdownChunks: [
                {
                  arabicText: 'Dijo',
                  englishText: 'He said',
                  sourceText: isAr ? 'قال' : 'He said',
                  targetText: 'Dijo',
                  role: 'verb',
                  explanation: 'Preterite of decir'
                },
                {
                  arabicText: 'que vendría',
                  englishText: 'that he would come',
                  sourceText: isAr ? 'إنه سيأتي' : 'that he would come',
                  targetText: 'que vendría',
                  role: 'connector',
                  explanation: 'Reported future → conditional'
                }
              ],
              habitHint: isAr
                ? 'vendrá → vendría في الكلام الم rapporté.'
                : 'vendrá → vendría in reported speech.'
            },
            {
              id: 'es-ex-3-4-2',
              arabicThought: 'أخبرتني أنها كانت متعبة',
              englishTarget: 'Me dijo que estaba cansada',
              sourceThought: isAr ? 'أخبرتني أنها كانت متعبة' : 'She told me she was tired',
              targetSentence: 'Me dijo que estaba cansada',
              acceptableAlternatives: ['Me dijo que estaba cansado'],
              wordChips: ['Me', 'dijo', 'que', 'estaba', 'cansada', 'está', 'cansado'],
              breakdownChunks: [
                {
                  arabicText: 'Me dijo',
                  englishText: 'She told me',
                  sourceText: isAr ? 'أخبرتني' : 'She told me',
                  targetText: 'Me dijo',
                  role: 'verb',
                  explanation: 'Preterite of decir with indirect object'
                },
                {
                  arabicText: 'que estaba cansada',
                  englishText: 'that she was tired',
                  sourceText: isAr ? 'أنها كانت متعبة' : 'that she was tired',
                  targetText: 'que estaba cansada',
                  role: 'connector',
                  explanation: 'Reported state → imperfect'
                }
              ],
              habitHint: isAr
                ? 'está → estaba في الكلام الم rapporté.'
                : 'está → estaba in reported speech.'
            }
          ]
        },
        {
          id: 'es-p3-l5',
          phaseId: 3,
          phaseTitle: 'Dominio · Mastery',
          phaseLevel: 'B1 – B2',
          number: 5,
          title: 'Business Formal Register',
          titleAr: 'اللغة الرسمية في العمل',
          transferConcept: isAr
            ? 'في المراسلات المهنية، استخدم Estimado/a، Quedo a la espera، Cordialmente: Estimado Sr. García, quedo a la espera de su respuesta.'
            : 'In professional correspondence, use Estimado/a, Quedo a la espera, Cordialmente.',
          transferConceptAr: 'اللغة المهنية: Estimado/a، Quedo a la espera.',
          weakSpotTag: 'business-register',
          exercises: [
            {
              id: 'es-ex-3-5-1',
              arabicThought: 'عزيزي السيد غارسيا، أنتظر ردك',
              englishTarget: 'Estimado Sr. García, quedo a la espera de su respuesta',
              sourceThought: isAr ? 'عزيزي السيد غارسيا، أنتظر ردك' : 'Dear Mr. García, I look forward to your reply',
              targetSentence: 'Estimado Sr. García, quedo a la espera de su respuesta',
              acceptableAlternatives: ['Estimado señor García, quedo a la espera de su respuesta.'],
              wordChips: ['Estimado', 'Sr.', 'García,', 'quedo', 'a', 'la', 'espera', 'de', 'su', 'respuesta'],
              breakdownChunks: [
                {
                  arabicText: 'Estimado Sr. García',
                  englishText: 'Dear Mr. García',
                  sourceText: isAr ? 'عزيزي السيد غارسيا' : 'Dear Mr. García',
                  targetText: 'Estimado Sr. García',
                  role: 'connector',
                  explanation: 'Formal salutation'
                },
                {
                  arabicText: 'quedo a la espera de su respuesta',
                  englishText: 'I look forward to your reply',
                  sourceText: isAr ? 'أنتظر ردك' : 'I look forward to your reply',
                  targetText: 'quedo a la espera de su respuesta',
                  role: 'verb',
                  explanation: 'Formal closing formula'
                }
              ],
              habitHint: isAr
                ? 'Estimado + Sr./Sra. + اسم، ثم Quedo a la espera.'
                : 'Estimado + Sr./Sra. + name, then Quedo a la espera.'
            },
            {
              id: 'es-ex-3-5-2',
              arabicThought: 'مع أطيب التحيات',
              englishTarget: 'Cordialmente',
              sourceThought: isAr ? 'مع أطيب التحيات' : 'Best regards',
              targetSentence: 'Cordialmente',
              acceptableAlternatives: ['Atentamente', 'Saludos cordiales'],
              wordChips: ['Cordialmente', 'Atentamente', 'Saludos', 'cordiales'],
              breakdownChunks: [
                {
                  arabicText: 'Cordialmente',
                  englishText: 'Best regards',
                  sourceText: isAr ? 'مع أطيب التحيات' : 'Best regards',
                  targetText: 'Cordialmente',
                  role: 'modifier',
                  explanation: 'Formal sign-off'
                }
              ],
              habitHint: isAr
                ? 'Cordialmente / Atentamente for formal emails.'
                : 'Cordialmente / Atentamente for formal emails.'
            }
          ]
        }
      ]
    }
  ];
}