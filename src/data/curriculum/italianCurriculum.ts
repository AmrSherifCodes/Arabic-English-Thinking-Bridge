import { Phase, SourceLanguage } from '../../types';

function sourceThought(source: SourceLanguage, ar: string, en: string): string {
  return source === 'ar' ? ar : en;
}

export function getItalianPhases(source: SourceLanguage = 'ar'): Phase[] {
  const isAr = source === 'ar';

  return [
    {
      id: 1,
      title: 'Fondamenti Italiani · Italian Foundations',
      titleAr: 'الأساسات الإيطالية: أدوات التعريف والأفعال essere/avere',
      level: 'A1 – A2',
      tagline: isAr
        ? 'أتقن أدوات التعريف (il/la/l’)، توافق الصفة، والأفعال الأساسية essere و avere والنفي بـ non.'
        : 'Master definite articles (il/la/l’), adjective agreement, core verbs essere/avere, and negation with non.',
      lessons: [
        {
          id: 'it-p1-l1',
          phaseId: 1,
          phaseTitle: 'Fondamenti Italiani · Italian Foundations',
          phaseLevel: 'A1 – A2',
          number: 1,
          title: 'Definite Articles & Adjective Agreement',
          titleAr: 'أدوات التعريف (il/la/l’) وتوافق الصفة',
          transferConcept: isAr
            ? 'في الإيطالية، الاسم المذكر ينتهي بـ o والمؤنث بـ a، وتأخذ أدوات il/la وقبل المتحرك l’: la casa bianca (البيت الأبيض).'
            : 'In Italian, masculine nouns end in -o, feminine in -a. Articles are il/la/l’. Adjectives match gender: la casa bianca.',
          transferConceptAr: 'الاسم المذكر ينتهي بـ o والمؤنث بـ a، والصفة تطابق جنس الاسم.',
          weakSpotTag: 'gender-agreement',
          exercises: [
            {
              id: 'it-ex-1-1-1',
              arabicThought: 'البيت الأبيض كبير',
              englishTarget: 'La casa bianca è grande',
              sourceThought: sourceThought(source, 'البيت الأبيض كبير', 'The white house is big'),
              targetSentence: 'La casa bianca è grande',
              acceptableAlternatives: ['La casa grande è bianca'],
              wordChips: ['La', 'casa', 'bianca', 'è', 'grande', 'il', 'bianco'],
              breakdownChunks: [
                {
                  arabicText: 'La casa',
                  englishText: 'The house',
                  sourceText: isAr ? 'البيت' : 'The house',
                  targetText: 'La casa',
                  role: 'subject',
                  explanation: 'Feminine noun with article la'
                },
                {
                  arabicText: 'bianca',
                  englishText: 'white',
                  sourceText: isAr ? 'أبيض' : 'white',
                  targetText: 'bianca',
                  role: 'modifier',
                  explanation: 'Feminine adjective ending in -a'
                },
                {
                  arabicText: 'è grande',
                  englishText: 'is big',
                  sourceText: isAr ? 'كبير' : 'is big',
                  targetText: 'è grande',
                  role: 'verb',
                  explanation: 'essere 3rd person singular + adjective grande'
                }
              ],
              habitHint: isAr
                ? 'casa مؤنث، لذا الصفة bianca (وليس bianco).'
                : 'casa is feminine, so use bianca (not bianco).'
            },
            {
              id: 'it-ex-1-1-2',
              arabicThought: 'الولد الصغير يلعب في الحديقة',
              englishTarget: 'Il ragazzo piccolo gioca nel parco',
              sourceThought: sourceThought(source, 'الولد الصغير يلعب في الحديقة', 'The small boy plays in the park'),
              targetSentence: 'Il ragazzo piccolo gioca nel parco',
              acceptableAlternatives: ['Il piccolo ragazzo gioca nel parco'],
              wordChips: ['Il', 'ragazzo', 'piccolo', 'gioca', 'nel', 'parco', 'la', 'piccola'],
              breakdownChunks: [
                {
                  arabicText: 'Il ragazzo piccolo',
                  englishText: 'The small boy',
                  sourceText: isAr ? 'الولد الصغير' : 'The small boy',
                  targetText: 'Il ragazzo piccolo',
                  role: 'subject',
                  explanation: 'Masculine noun with article il + adjective'
                },
                {
                  arabicText: 'gioca',
                  englishText: 'plays',
                  sourceText: isAr ? 'يلعب' : 'plays',
                  targetText: 'gioca',
                  role: 'verb',
                  explanation: 'giocare 3rd person singular'
                },
                {
                  arabicText: 'nel parco',
                  englishText: 'in the park',
                  sourceText: isAr ? 'في الحديقة' : 'in the park',
                  targetText: 'nel parco',
                  role: 'modifier',
                  explanation: 'articulated preposition in + il -> nel'
                }
              ],
              habitHint: isAr
                ? 'ragazzo مذكر ينتهي بـ o ومعه أداة il.'
                : 'ragazzo is masculine ending in -o with article il.'
            },
            {
              id: 'it-ex-1-1-3',
              arabicThought: 'السيارة الحمراء سريعة جداً',
              englishTarget: 'La macchina rossa è molto veloce',
              sourceThought: sourceThought(source, 'السيارة الحمراء سريعة جداً', 'The red car is very fast'),
              targetSentence: 'La macchina rossa è molto veloce',
              acceptableAlternatives: ['L’auto rossa è molto veloce'],
              wordChips: ['La', 'macchina', 'rossa', 'è', 'molto', 'veloce', 'il', 'rosso'],
              breakdownChunks: [
                {
                  arabicText: 'La macchina',
                  englishText: 'The car',
                  sourceText: isAr ? 'السيارة' : 'The car',
                  targetText: 'La macchina',
                  role: 'subject',
                  explanation: 'Feminine noun'
                },
                {
                  arabicText: 'rossa',
                  englishText: 'red',
                  sourceText: isAr ? 'حمراء' : 'red',
                  targetText: 'rossa',
                  role: 'modifier',
                  explanation: 'Color adjective agreeing in feminine'
                },
                {
                  arabicText: 'è molto veloce',
                  englishText: 'is very fast',
                  sourceText: isAr ? 'سريعة جداً' : 'is very fast',
                  targetText: 'è molto veloce',
                  role: 'verb',
                  explanation: 'essere + adverb molto + adjective'
                }
              ],
              habitHint: isAr
                ? 'macchina مؤنث، وتأخذ la وصفة اللون rossa.'
                : 'macchina is feminine, requiring la and rossa.'
            }
          ]
        },
        {
          id: 'it-p1-l2',
          phaseId: 1,
          phaseTitle: 'Fondamenti Italiani · Italian Foundations',
          phaseLevel: 'A1 – A2',
          number: 2,
          title: 'Core Verbs: essere (To Be) & avere (To Have)',
          titleAr: 'الأفعال الأساسية: essere (يكون) و avere (يملك)',
          transferConcept: isAr
            ? 'فعل الكينونة essere (sono, sei, è, siamo...) والملكية avere (ho, hai, ha, abbiamo...). الضمائر تُحذف عادة: Sono studente / Ho un libro.'
            : 'Core verbs essere (sono, sei, è...) and avere (ho, hai, ha...). Subject pronouns are usually dropped: Sono studente / Ho un libro.',
          transferConceptAr: 'احذف الضمير الشخصي واستخدم sono للهوية و ho للملكية والعمر.',
          weakSpotTag: 'auxiliary-verbs',
          exercises: [
            {
              id: 'it-ex-1-2-1',
              arabicThought: 'أنا طالب في الجامعة',
              englishTarget: 'Sono uno studente all’università',
              sourceThought: sourceThought(source, 'أنا طالب في الجامعة', 'I am a student at the university'),
              targetSentence: 'Sono uno studente all’università',
              acceptableAlternatives: ['Sono studente all’università', 'Io sono uno studente all’università'],
              wordChips: ['Sono', 'uno', 'studente', 'all’università', 'ho', 'è'],
              breakdownChunks: [
                {
                  arabicText: 'Sono',
                  englishText: 'I am',
                  sourceText: isAr ? 'أنا أكون' : 'I am',
                  targetText: 'Sono',
                  role: 'subject',
                  explanation: '1st person singular of essere (pronoun io dropped)'
                },
                {
                  arabicText: 'uno studente',
                  englishText: 'a student',
                  sourceText: isAr ? 'طالب' : 'a student',
                  targetText: 'uno studente',
                  role: 'modifier',
                  explanation: 'Indefinite article uno before st- cluster'
                },
                {
                  arabicText: 'all’università',
                  englishText: 'at the university',
                  sourceText: isAr ? 'في الجامعة' : 'at the university',
                  targetText: 'all’università',
                  role: 'modifier',
                  explanation: 'Preposition a + l’università -> all’università'
                }
              ],
              habitHint: isAr
                ? 'لا تقل Io sono uno studente بل اترك الضمير: Sono uno studente.'
                : 'Subject pronoun io is omitted in natural Italian: Sono uno studente.'
            },
            {
              id: 'it-ex-1-2-2',
              arabicThought: 'هو أستاذ في المدرسة',
              englishTarget: 'È un professore a scuola',
              sourceThought: sourceThought(source, 'هو أستاذ في المدرسة', 'He is a teacher at school'),
              targetSentence: 'È un professore a scuola',
              acceptableAlternatives: ['Lui è un professore a scuola'],
              wordChips: ['È', 'un', 'professore', 'a', 'scuola', 'ha', 'sono'],
              breakdownChunks: [
                {
                  arabicText: 'È',
                  englishText: 'He is',
                  sourceText: isAr ? 'هو يكون' : 'He is',
                  targetText: 'È',
                  role: 'subject',
                  explanation: '3rd person singular of essere (è with grave accent)'
                },
                {
                  arabicText: 'un professore',
                  englishText: 'a teacher',
                  sourceText: isAr ? 'أستاذ' : 'a teacher',
                  targetText: 'un professore',
                  role: 'modifier',
                  explanation: 'Masculine indefinite noun phrase'
                },
                {
                  arabicText: 'a scuola',
                  englishText: 'at school',
                  sourceText: isAr ? 'في المدرسة' : 'at school',
                  targetText: 'a scuola',
                  role: 'modifier',
                  explanation: 'Preposition a before scuola'
                }
              ],
              habitHint: isAr
                ? 'فعل è (هو يكون) يُكتب بدقة بنبرة هابطة (È) للتمييز عن حرف العطف e (و).'
                : 'The verb È (he/she/it is) requires a grave accent to distinguish from e (and).'
            },
            {
              id: 'it-ex-1-2-3',
              arabicThought: 'عندي سيارة جديدة وكتاب جميل',
              englishTarget: 'Ho una macchina nuova e un bel libro',
              sourceThought: sourceThought(source, 'عندي سيارة جديدة وكتاب جميل', 'I have a new car and a nice book'),
              targetSentence: 'Ho una macchina nuova e un bel libro',
              acceptableAlternatives: ['Io ho una macchina nuova e un bel libro'],
              wordChips: ['Ho', 'una', 'macchina', 'nuova', 'e', 'un', 'bel', 'libro', 'sono'],
              breakdownChunks: [
                {
                  arabicText: 'Ho',
                  englishText: 'I have',
                  sourceText: isAr ? 'عندي' : 'I have',
                  targetText: 'Ho',
                  role: 'subject',
                  explanation: '1st person singular of avere (silent h)'
                },
                {
                  arabicText: 'una macchina nuova',
                  englishText: 'a new car',
                  sourceText: isAr ? 'سيارة جديدة' : 'a new car',
                  targetText: 'una macchina nuova',
                  role: 'object',
                  explanation: 'Feminine object phrase'
                },
                {
                  arabicText: 'e un bel libro',
                  englishText: 'and a nice book',
                  sourceText: isAr ? 'وكتاب جميل' : 'and a nice book',
                  targetText: 'e un bel libro',
                  role: 'object',
                  explanation: 'Conjunction e + masculine object phrase'
                }
              ],
              habitHint: isAr
                ? 'فعل الملكية هو Ho (حرف h صامت في النطق الإيطالي).'
                : 'Ho is the 1st person form of avere (silent h in pronunciation).'
            }
          ]
        },
        {
          id: 'it-p1-l3',
          phaseId: 1,
          phaseTitle: 'Fondamenti Italiani · Italian Foundations',
          phaseLevel: 'A1 – A2',
          number: 3,
          title: 'Regular -are Verbs in Present Tense',
          titleAr: 'أفعال المجموعة الأولى (-are) في المضارع',
          transferConcept: isAr
            ? 'الأفعال المنتهية بـ -are تحذف النهاية وتضيف: -o, -i, -a, -iamo, -ate, -ano: parlo, parli, parla, parliamo.'
            : 'Regular -are verbs drop -are and add endings -o, -i, -a, -iamo, -ate, -ano: parlo, parli, parla, parliamo.',
          transferConceptAr: 'احذف -are وأضف نهايات المضارع (-o, -i, -a, -iamo, -ate, -ano).',
          weakSpotTag: 'are-verb-conjugation',
          exercises: [
            {
              id: 'it-ex-1-3-1',
              arabicThought: 'أنا أتحدث الإيطالية كل يوم',
              englishTarget: 'Parlo italiano ogni giorno',
              sourceThought: sourceThought(source, 'أنا أتحدث الإيطالية كل يوم', 'I speak Italian every day'),
              targetSentence: 'Parlo italiano ogni giorno',
              acceptableAlternatives: ['Parlo l’italiano ogni giorno'],
              wordChips: ['Parlo', 'italiano', 'ogni', 'giorno', 'parli', 'parlare'],
              breakdownChunks: [
                {
                  arabicText: 'Parlo',
                  englishText: 'I speak',
                  sourceText: isAr ? 'أتحدث' : 'I speak',
                  targetText: 'Parlo',
                  role: 'subject',
                  explanation: 'parlare conjugated in 1st person (-o)'
                },
                {
                  arabicText: 'italiano',
                  englishText: 'Italian',
                  sourceText: isAr ? 'الإيطالية' : 'Italian',
                  targetText: 'italiano',
                  role: 'object',
                  explanation: 'Language noun'
                },
                {
                  arabicText: 'ogni giorno',
                  englishText: 'every day',
                  sourceText: isAr ? 'كل يوم' : 'every day',
                  targetText: 'ogni giorno',
                  role: 'modifier',
                  explanation: 'Time expression'
                }
              ],
              habitHint: isAr
                ? 'مع "أنا" ينتهي الفعل بـ -o دائماً: Parlo.'
                : 'First-person singular ends in -o: Parlo.'
            },
            {
              id: 'it-ex-1-3-2',
              arabicThought: 'نحن نعيش في روما وندرس هناك',
              englishTarget: 'Abitiamo a Roma e studiamo lì',
              sourceThought: sourceThought(source, 'نحن نعيش في روما وندرس هناك', 'We live in Rome and study there'),
              targetSentence: 'Abitiamo a Roma e studiamo lì',
              acceptableAlternatives: ['Noi abitiamo a Roma e studiamo lì'],
              wordChips: ['Abitiamo', 'a', 'Roma', 'e', 'studiamo', 'lì', 'abita'],
              breakdownChunks: [
                {
                  arabicText: 'Abitiamo',
                  englishText: 'We live',
                  sourceText: isAr ? 'نعيش' : 'We live',
                  targetText: 'Abitiamo',
                  role: 'subject',
                  explanation: 'abitare conjugated in 1st person plural (-iamo)'
                },
                {
                  arabicText: 'a Roma',
                  englishText: 'in Rome',
                  sourceText: isAr ? 'في روما' : 'in Rome',
                  targetText: 'a Roma',
                  role: 'modifier',
                  explanation: 'Preposition a before city names'
                },
                {
                  arabicText: 'e studiamo lì',
                  englishText: 'and study there',
                  sourceText: isAr ? 'وندريس هناك' : 'and study there',
                  targetText: 'e studiamo lì',
                  role: 'connector',
                  explanation: 'studiare in 1st person plural + adverb lì'
                }
              ],
              habitHint: isAr
                ? 'نهاية المتكلمين (نحن) دائماً -iamo: Abitiamo, Studiamo.'
                : 'First-person plural ending is always -iamo: Abitiamo, Studiamo.'
            },
            {
              id: 'it-ex-1-3-3',
              arabicThought: 'هم يعملون في مكتب كبير بوسط المدينة',
              englishTarget: 'Lavorano in un grande ufficio in centro',
              sourceThought: sourceThought(source, 'هم يعملون في مكتب كبير بوسط المدينة', 'They work in a big office downtown'),
              targetSentence: 'Lavorano in un grande ufficio in centro',
              acceptableAlternatives: ['Loro lavorano in un grande ufficio in centro'],
              wordChips: ['Lavorano', 'in', 'un', 'grande', 'ufficio', 'in', 'centro', 'lavorare'],
              breakdownChunks: [
                {
                  arabicText: 'Lavorano',
                  englishText: 'They work',
                  sourceText: isAr ? 'يعملون' : 'They work',
                  targetText: 'Lavorano',
                  role: 'subject',
                  explanation: 'lavorare conjugated in 3rd person plural (-ano)'
                },
                {
                  arabicText: 'in un grande ufficio',
                  englishText: 'in a big office',
                  sourceText: isAr ? 'في مكتب كبير' : 'in a big office',
                  targetText: 'in un grande ufficio',
                  role: 'modifier',
                  explanation: 'Preposition in + indefinite noun phrase'
                },
                {
                  arabicText: 'in centro',
                  englishText: 'downtown',
                  sourceText: isAr ? 'في وسط المدينة' : 'downtown',
                  targetText: 'in centro',
                  role: 'modifier',
                  explanation: 'Location phrase in centro'
                }
              ],
              habitHint: isAr
                ? 'مع الغائبين (هم) ينتهي الفعل بـ -ano: Lavorano.'
                : 'Third-person plural ending for -are verbs is -ano: Lavorano.'
            }
          ]
        },
        {
          id: 'it-p1-l4',
          phaseId: 1,
          phaseTitle: 'Fondamenti Italiani · Italian Foundations',
          phaseLevel: 'A1 – A2',
          number: 4,
          title: 'Negation with non',
          titleAr: 'النفي باستخدام non',
          transferConcept: isAr
            ? 'النفي في الإيطالية بسيط جداً: ضع كلمة non قبل الفعل مباشرة: Non parlo spagnolo (لا أتحدث الإسبانية).'
            : 'Italian negation is simple: place non directly before the verb: Non parlo spagnolo.',
          transferConceptAr: 'ضع non قبل الفعل المصرف مباشرة لنفي الجملة.',
          weakSpotTag: 'negation-pattern',
          exercises: [
            {
              id: 'it-ex-1-4-1',
              arabicThought: 'أنا لا أتحدث الإسبانية',
              englishTarget: 'Non parlo spagnolo',
              sourceThought: sourceThought(source, 'أنا لا أتحدث الإسبانية', 'I do not speak Spanish'),
              targetSentence: 'Non parlo spagnolo',
              acceptableAlternatives: ['Io non parlo lo spagnolo'],
              wordChips: ['Non', 'parlo', 'spagnolo', 'no', 'parli'],
              breakdownChunks: [
                {
                  arabicText: 'Non parlo',
                  englishText: 'I do not speak',
                  sourceText: isAr ? 'لا أتحدث' : 'I do not speak',
                  targetText: 'Non parlo',
                  role: 'subject',
                  explanation: 'Negation non before verb parlo'
                },
                {
                  arabicText: 'spagnolo',
                  englishText: 'Spanish',
                  sourceText: isAr ? 'الإسبانية' : 'Spanish',
                  targetText: 'spagnolo',
                  role: 'object',
                  explanation: 'Language object'
                }
              ],
              habitHint: isAr
                ? 'استخدم non قبل الفعل (وليس no): Non parlo.'
                : 'Use non before the verb (not no).'
            },
            {
              id: 'it-ex-1-4-2',
              arabicThought: 'هو ليس متعباً اليوم',
              englishTarget: 'Non è stanco oggi',
              sourceThought: sourceThought(source, 'هو ليس متعباً اليوم', 'He is not tired today'),
              targetSentence: 'Non è stanco oggi',
              acceptableAlternatives: ['Lui non è stanco oggi'],
              wordChips: ['Non', 'è', 'stanco', 'oggi', 'no', 'sono'],
              breakdownChunks: [
                {
                  arabicText: 'Non è',
                  englishText: 'He is not',
                  sourceText: isAr ? 'هو ليس' : 'He is not',
                  targetText: 'Non è',
                  role: 'subject',
                  explanation: 'Negation non + verb è'
                },
                {
                  arabicText: 'stanco oggi',
                  englishText: 'tired today',
                  sourceText: isAr ? 'متعباً اليوم' : 'tired today',
                  targetText: 'stanco oggi',
                  role: 'modifier',
                  explanation: 'Adjective stanco + time adverb oggi'
                }
              ],
              habitHint: isAr
                ? 'ضع non قبل فعل الكينونة مباشرة: Non è stanco.'
                : 'Place non directly before the verb è.'
            },
            {
              id: 'it-ex-1-4-3',
              arabicThought: 'ليس لدينا سيارة في هذه المدينة',
              englishTarget: 'Non abbiamo una macchina in questa città',
              sourceThought: sourceThought(source, 'ليس لدينا سيارة في هذه المدينة', 'We do not have a car in this city'),
              targetSentence: 'Non abbiamo una macchina in questa città',
              acceptableAlternatives: ['Noi non abbiamo una macchina in questa città'],
              wordChips: ['Non', 'abbiamo', 'una', 'macchina', 'in', 'questa', 'città', 'ho'],
              breakdownChunks: [
                {
                  arabicText: 'Non abbiamo',
                  englishText: 'We do not have',
                  sourceText: isAr ? 'ليس لدينا' : 'We do not have',
                  targetText: 'Non abbiamo',
                  role: 'subject',
                  explanation: 'Negation non + 1st person plural abbiamo'
                },
                {
                  arabicText: 'una macchina',
                  englishText: 'a car',
                  sourceText: isAr ? 'سيارة' : 'a car',
                  targetText: 'una macchina',
                  role: 'object',
                  explanation: 'Feminine object'
                },
                {
                  arabicText: 'in questa città',
                  englishText: 'in this city',
                  sourceText: isAr ? 'في هذه المدينة' : 'in this city',
                  targetText: 'in questa città',
                  role: 'modifier',
                  explanation: 'Preposition in + demonstrative questa + città'
                }
              ],
              habitHint: isAr
                ? 'città كلمة مؤنثة تُكتب بنبرة على الآخِر (città).'
                : 'città is feminine and carries a grave accent on the final -à.'
            }
          ]
        },
        {
          id: 'it-p1-l5',
          phaseId: 1,
          phaseTitle: 'Fondamenti Italiani · Italian Foundations',
          phaseLevel: 'A1 – A2',
          number: 5,
          title: 'Question Formation & Interrogatives',
          titleAr: 'صياغة الأسئلة وأدوات الاستفهام (Dove, Come, Perché)',
          transferConcept: isAr
            ? 'السؤال في الإيطالية يعتمد على النبرة الصاعدة (intonation) أو استخدام الأدوات: Dove (أين)، Come (كيف)، Perché (لماذا).'
            : 'Questions use rising intonation or question words: Dove (where), Come (how), Perché (why).',
          transferConceptAr: 'ارفع نبرة الصوت في نهاية الجملة أو استخدم أدوات Dove/Come/Perché.',
          weakSpotTag: 'question-formation',
          exercises: [
            {
              id: 'it-ex-1-5-1',
              arabicThought: 'أين تسكن أنت؟',
              englishTarget: 'Dove abiti?',
              sourceThought: sourceThought(source, 'أين تسكن أنت؟', 'Where do you live?'),
              targetSentence: 'Dove abiti?',
              acceptableAlternatives: ['Dove abiti tu?'],
              wordChips: ['Dove', 'abiti', '?', 'tu', 'abita'],
              breakdownChunks: [
                {
                  arabicText: 'Dove',
                  englishText: 'Where',
                  sourceText: isAr ? 'أين' : 'Where',
                  targetText: 'Dove',
                  role: 'connector',
                  explanation: 'Interrogative adverb for place'
                },
                {
                  arabicText: 'abiti',
                  englishText: 'do you live',
                  sourceText: isAr ? 'تسكن' : 'do you live',
                  targetText: 'abiti',
                  role: 'verb',
                  explanation: 'abitare in 2nd person singular (-i)'
                }
              ],
              habitHint: isAr
                ? 'مع "أنت" الفعل ينتهي بـ -i: abiti.'
                : 'Second-person singular ends in -i: abiti.'
            },
            {
              id: 'it-ex-1-5-2',
              arabicThought: 'ما اسمك؟ (كيف تسمى؟)',
              englishTarget: 'Come ti chiami?',
              sourceThought: sourceThought(source, 'ما اسمك؟ (كيف تسمى؟)', 'What is your name?'),
              targetSentence: 'Come ti chiami?',
              acceptableAlternatives: ['Come si chiama?'],
              wordChips: ['Come', 'ti', 'chiami', '?', 'si', 'chiamo'],
              breakdownChunks: [
                {
                  arabicText: 'Come',
                  englishText: 'How',
                  sourceText: isAr ? 'كيف' : 'How',
                  targetText: 'Come',
                  role: 'connector',
                  explanation: 'Interrogative adverb'
                },
                {
                  arabicText: 'ti chiami',
                  englishText: 'you are called',
                  sourceText: isAr ? 'تسمى' : 'you are called',
                  targetText: 'ti chiami',
                  role: 'verb',
                  explanation: 'Reflexive verb chiamarsi with pronoun ti'
                }
              ],
              habitHint: isAr
                ? 'الضمير المنعكس ti يوضع قبل الفعل: Come ti chiami ?'
                : 'Reflexive pronoun ti is placed before the verb.'
            },
            {
              id: 'it-ex-1-5-3',
              arabicThought: 'لماذا تدرس اللغة الإيطالية؟',
              englishTarget: 'Perché studi l’italiano?',
              sourceThought: sourceThought(source, 'لماذا تدرس اللغة الإيطالية؟', 'Why do you study Italian?'),
              targetSentence: 'Perché studi l’italiano?',
              acceptableAlternatives: ['Perché studi italiano?'],
              wordChips: ['Perché', 'studi', 'l’italiano', '?', 'studiare', 'il'],
              breakdownChunks: [
                {
                  arabicText: 'Perché',
                  englishText: 'Why',
                  sourceText: isAr ? 'لماذا' : 'Why',
                  targetText: 'Perché',
                  role: 'connector',
                  explanation: 'Interrogative adverb requiring acute accent (é)'
                },
                {
                  arabicText: 'studi',
                  englishText: 'do you study',
                  sourceText: isAr ? 'تدرس' : 'do you study',
                  targetText: 'studi',
                  role: 'verb',
                  explanation: 'studiare in 2nd person singular'
                },
                {
                  arabicText: 'l’italiano',
                  englishText: 'Italian',
                  sourceText: isAr ? 'الإيطالية' : 'Italian',
                  targetText: 'l’italiano',
                  role: 'object',
                  explanation: 'Language noun with elided article l’'
                }
              ],
              habitHint: isAr
                ? 'Perché تُكتب بنبرة حادة على e (é).'
                : 'Perché is written with an acute accent on the final -é.'
            }
          ]
        }
      ]
    },
    {
      id: 2,
      title: 'Transizione Intermedia · Intermediate Italian Dynamics',
      titleAr: 'المرحلة الانتقالية: الماضي والضمائر والمستقبل',
      level: 'A2 – B1',
      tagline: isAr
        ? 'أتقن الماضي القريب (passato prossimo)، الوصف (imperfetto)، الضمائر المباشرة وغير المباشرة، والمستقبل.'
        : 'Master Passato Prossimo, Imperfetto, direct/indirect pronouns, and future tenses.',
      lessons: [
        {
          id: 'it-p2-l1',
          phaseId: 2,
          phaseTitle: 'Transizione Intermedia · Intermediate Italian Dynamics',
          phaseLevel: 'A2 – B1',
          number: 1,
          title: 'Past Tense with Passato Prossimo',
          titleAr: 'الماضي المركب القريب (Passato Prossimo)',
          transferConcept: isAr
            ? 'يتكون Passato Prossimo من avere/essere + اسم المفعول: Ho comprato un libro / Sono andato al cinema.'
            : 'Passato Prossimo uses avere/essere + past participle: Ho comprato un libro / Sono andato al cinema.',
          transferConceptAr: 'avere/essere في المضارع + participe passato للحدث المكتمل.',
          weakSpotTag: 'passato-prossimo',
          exercises: [
            {
              id: 'it-ex-2-1-1',
              arabicThought: 'اشتريت كتاباً جديداً أمس',
              englishTarget: 'Ho comprato un nuovo libro ieri',
              sourceThought: sourceThought(source, 'اشتريت كتاباً جديداً أمس', 'I bought a new book yesterday'),
              targetSentence: 'Ho comprato un nuovo libro ieri',
              acceptableAlternatives: ['Ieri ho comprato un nuovo libro'],
              wordChips: ['Ho', 'comprato', 'un', 'nuovo', 'libro', 'ieri', 'sono'],
              breakdownChunks: [
                {
                  arabicText: 'Ho comprato',
                  englishText: 'I bought',
                  sourceText: isAr ? 'اشتريت' : 'I bought',
                  targetText: 'Ho comprato',
                  role: 'subject',
                  explanation: 'avere (ho) + past participle comprato'
                },
                {
                  arabicText: 'un nuovo libro',
                  englishText: 'a new book',
                  sourceText: isAr ? 'كتاباً جديداً' : 'a new book',
                  targetText: 'un nuovo libro',
                  role: 'object',
                  explanation: 'Masculine object phrase'
                },
                {
                  arabicText: 'ieri',
                  englishText: 'yesterday',
                  sourceText: isAr ? 'أمس' : 'yesterday',
                  targetText: 'ieri',
                  role: 'modifier',
                  explanation: 'Time adverb'
                }
              ],
              habitHint: isAr
                ? 'فعل comprare يأخذ الفعل المساعد avere: Ho comprato.'
                : 'The verb comprare uses auxiliary avere: Ho comprato.'
            },
            {
              id: 'it-ex-2-1-2',
              arabicThought: 'هو أنهى عمله في الوقت المناسب',
              englishTarget: 'Ha finito il suo lavoro in tempo',
              sourceThought: sourceThought(source, 'هو أنهى عمله في الوقت المناسب', 'He finished his work on time'),
              targetSentence: 'Ha finito il suo lavoro in tempo',
              acceptableAlternatives: ['Lui ha finito il suo lavoro in tempo'],
              wordChips: ['Ha', 'finito', 'il', 'suo', 'lavoro', 'in', 'tempo', 'è'],
              breakdownChunks: [
                {
                  arabicText: 'Ha finito',
                  englishText: 'He finished',
                  sourceText: isAr ? 'أنهى' : 'He finished',
                  targetText: 'Ha finito',
                  role: 'subject',
                  explanation: 'avere (ha) + past participle of finire (finito)'
                },
                {
                  arabicText: 'il suo lavoro',
                  englishText: 'his work',
                  sourceText: isAr ? 'عمله' : 'his work',
                  targetText: 'il suo lavoro',
                  role: 'object',
                  explanation: 'Possessive with article: il suo lavoro'
                },
                {
                  arabicText: 'in tempo',
                  englishText: 'on time',
                  sourceText: isAr ? 'في الوقت المناسب' : 'on time',
                  targetText: 'in tempo',
                  role: 'modifier',
                  explanation: 'Time expression'
                }
              ],
              habitHint: isAr
                ? 'في الإيطالية نضع أداة التعريف قبل صفة الملكية: il suo lavoro.'
                : 'Italian includes the article before possessives: il suo lavoro.'
            },
            {
              id: 'it-ex-2-1-3',
              arabicThought: 'ذهبت إلى السينما مع أصدقائي',
              englishTarget: 'Sono andato al cinema con i miei amici',
              sourceThought: sourceThought(source, 'ذهبت إلى السينما مع أصدقائي', 'I went to the cinema with my friends'),
              targetSentence: 'Sono andato al cinema con i miei amici',
              acceptableAlternatives: ['Sono andata al cinema con i miei amici'],
              wordChips: ['Sono', 'andato', 'al', 'cinema', 'con', 'i', 'miei', 'amici', 'ho'],
              breakdownChunks: [
                {
                  arabicText: 'Sono andato',
                  englishText: 'I went',
                  sourceText: isAr ? 'ذهبت' : 'I went',
                  targetText: 'Sono andato',
                  role: 'subject',
                  explanation: 'Motion verb andare takes essere: Sono + andato'
                },
                {
                  arabicText: 'al cinema',
                  englishText: 'to the cinema',
                  sourceText: isAr ? 'إلى السينما' : 'to the cinema',
                  targetText: 'al cinema',
                  role: 'modifier',
                  explanation: 'al = a + il'
                },
                {
                  arabicText: 'con i miei amici',
                  englishText: 'with my friends',
                  sourceText: isAr ? 'مع أصدقائي' : 'with my friends',
                  targetText: 'con i miei amici',
                  role: 'modifier',
                  explanation: 'con + article i + possessive miei + amici'
                }
              ],
              habitHint: isAr
                ? 'أفعال الحركة مثل andare تأخذ المساعد essere وتطابق الفاعل تذكيراً وتأنيثاً: Sono andato/andata.'
                : 'Motion verbs like andare take essere and agree in gender: andato/andata.'
            }
          ]
        },
        {
          id: 'it-p2-l2',
          phaseId: 2,
          phaseTitle: 'Transizione Intermedia · Intermediate Italian Dynamics',
          phaseLevel: 'A2 – B1',
          number: 2,
          title: 'Imperfect Tense (Imperfetto) vs Passato Prossimo',
          titleAr: 'زمن الوصف والعادات (Imperfetto) مقارنة بالماضي المركب',
          transferConcept: isAr
            ? 'تستخدم Imperfetto للوصف والعادات والظروف المستمرة في الماضي: Quando ero giovane, giocavo spesso.'
            : 'Use Imperfetto for descriptions, states, and repeated actions in the past: Quando ero giovane, giocavo spesso.',
          transferConceptAr: 'Imperfetto للوصف والعادات المستمرة في الماضي (نهايات -avo, -avi, -ava...).',
          weakSpotTag: 'imperfetto-usage',
          exercises: [
            {
              id: 'it-ex-2-2-1',
              arabicThought: 'عندما كنت صغيراً، كنت ألعاب كثيراً',
              englishTarget: 'Quando ero giovane, giocavo spesso',
              sourceThought: sourceThought(source, 'عندما كنت صغيراً، كنت ألعاب كثيراً', 'When I was young, I used to play often'),
              targetSentence: 'Quando ero giovane, giocavo spesso',
              acceptableAlternatives: ['Giocavo spesso quando ero giovane'],
              wordChips: ['Quando', 'ero', 'giovane', 'giocavo', 'spesso', 'sono', 'ho giocato'],
              breakdownChunks: [
                {
                  arabicText: 'Quando ero giovane',
                  englishText: 'When I was young',
                  sourceText: isAr ? 'عندما كنت صغيراً' : 'When I was young',
                  targetText: 'Quando ero giovane',
                  role: 'connector',
                  explanation: 'imperfetto of essere (ero) for past state'
                },
                {
                  arabicText: 'giocavo spesso',
                  englishText: 'I used to play often',
                  sourceText: isAr ? 'كنت ألعاب كثيراً' : 'I used to play often',
                  targetText: 'giocavo spesso',
                  role: 'connector',
                  explanation: 'imperfetto of giocare (giocavo) for past habit'
                }
              ],
              habitHint: isAr
                ? 'للوصف والعادات في الماضي استخدم Imperfetto: ero, giocavo.'
                : 'For past states and habits, use Imperfetto.'
            },
            {
              id: 'it-ex-2-2-2',
              arabicThought: 'كان الطقس جميلاً عندما خرجنا',
              englishTarget: 'Faceva bel tempo quando siamo usciti',
              sourceThought: sourceThought(source, 'كان الطقس جميلاً عندما خرجنا', 'The weather was nice when we went out'),
              targetSentence: 'Faceva bel tempo quando siamo usciti',
              acceptableAlternatives: ['Quando siamo usciti, faceva bel tempo'],
              wordChips: ['Faceva', 'bel', 'tempo', 'quando', 'siamo', 'usciti', 'ha fatto'],
              breakdownChunks: [
                {
                  arabicText: 'Faceva bel tempo',
                  englishText: 'The weather was nice',
                  sourceText: isAr ? 'كان الطقس جميلاً' : 'The weather was nice',
                  targetText: 'Faceva bel tempo',
                  role: 'connector',
                  explanation: 'imperfetto of fare for background weather'
                },
                {
                  arabicText: 'quando siamo usciti',
                  englishText: 'when we went out',
                  sourceText: isAr ? 'عندما خرجنا' : 'when we went out',
                  targetText: 'quando siamo usciti',
                  role: 'connector',
                  explanation: 'passato prossimo of uscire for punctual event'
                }
              ],
              habitHint: isAr
                ? 'الوصف خلفية بـ Imperfetto (faceva) والحدث المكتمل بـ Passato prossimo (siamo usciti).'
                : 'Background weather uses Imperfetto; interrupted event uses Passato prossimo.'
            },
            {
              id: 'it-ex-2-2-3',
              arabicThought: 'بينما كنت أدرس، اتصل بي صديقي',
              englishTarget: 'Mentre studiavo, il mio amico mi ha telefonato',
              sourceThought: sourceThought(source, 'بينما كنت أدرس، اتصل بي صديقي', 'While I was studying, my friend called me'),
              targetSentence: 'Mentre studiavo, il mio amico mi ha telefonato',
              acceptableAlternatives: ['Il mio amico mi ha telefonato mentre studiavo'],
              wordChips: ['Mentre', 'quando', 'studiavo', 'il', 'mio', 'amico', 'mi', 'ha', 'telefonato', 'domani'],
              breakdownChunks: [
                {
                  arabicText: 'Mentre studiavo',
                  englishText: 'While I was studying',
                  sourceText: isAr ? 'بينما كنت أدرس' : 'While I was studying',
                  targetText: 'Mentre studiavo',
                  role: 'connector',
                  explanation: 'mentre + imperfetto for ongoing action'
                },
                {
                  arabicText: 'il mio amico mi ha telefonato',
                  englishText: 'my friend called me',
                  sourceText: isAr ? 'اتصل بي صديقي' : 'my friend called me',
                  targetText: 'il mio amico mi ha telefonato',
                  role: 'connector',
                  explanation: 'passato prossimo for interrupting event'
                }
              ],
              habitHint: isAr
                ? 'رابط الزمان mentre يأخذ دائماً Imperfetto للحدث المستمر.'
                : 'Time connector mentre takes Imperfetto for ongoing past actions.'
            }
          ]
        },
        {
          id: 'it-p2-l3',
          phaseId: 2,
          phaseTitle: 'Transizione Intermedia · Intermediate Italian Dynamics',
          phaseLevel: 'A2 – B1',
          number: 3,
          title: 'Direct & Indirect Object Pronouns (lo/la/li/le, gli/le)',
          titleAr: 'ضمائر المفعول المباشر وغير المباشر (lo/la/li/le, gli/le)',
          transferConcept: isAr
            ? 'ضمير المفعول يوضع قبل الفعل المصرف: Lo vedo (أراه)، Gli ho parlato (تحدثت إليه).'
            : 'Object pronouns precede the conjugated verb: Lo vedo (I see him), Gli ho parlato (I spoke to him).',
          transferConceptAr: 'ضع ضمير المفعول المباشر (lo/la/li/le) أو غير المباشر (gli/le) قبل الفعل.',
          weakSpotTag: 'object-pronouns',
          exercises: [
            {
              id: 'it-ex-2-3-1',
              arabicThought: 'أنا أراه كل صباح في القطار',
              englishTarget: 'Lo vedo ogni mattina sul treno',
              sourceThought: sourceThought(source, 'أنا أراه كل صباح في القطار', 'I see him every morning on the train'),
              targetSentence: 'Lo vedo ogni mattina sul treno',
              acceptableAlternatives: ['Ogni mattina lo vedo sul treno'],
              wordChips: ['Lo', 'vedo', 'ogni', 'mattina', 'sul', 'treno', 'gli'],
              breakdownChunks: [
                {
                  arabicText: 'Lo vedo',
                  englishText: 'I see him',
                  sourceText: isAr ? 'أراه' : 'I see him',
                  targetText: 'Lo vedo',
                  role: 'subject',
                  explanation: 'Direct pronoun lo before verb vedo'
                },
                {
                  arabicText: 'ogni mattina sul treno',
                  englishText: 'every morning on the train',
                  sourceText: isAr ? 'كل صباح في القطار' : 'every morning on the train',
                  targetText: 'ogni mattina sul treno',
                  role: 'modifier',
                  explanation: 'Time and location phrase'
                }
              ],
              habitHint: isAr
                ? 'الضمير المباشر المذكر هو Lo ويوضع قبل الفعل.'
                : 'Direct masculine pronoun Lo precedes the verb.'
            },
            {
              id: 'it-ex-2-3-2',
              arabicThought: 'تحدثت إليه البارحة بخصوص المشروع',
              englishTarget: 'Gli ho parlato ieri riguardo al progetto',
              sourceThought: sourceThought(source, 'تحدثت إليه البارحة بخصوص المشروع', 'I spoke to him yesterday regarding the project'),
              targetSentence: 'Gli ho parlato ieri riguardo al progetto',
              acceptableAlternatives: ['Gli ho parlato ieri del progetto'],
              wordChips: ['Gli', 'ho', 'parlato', 'ieri', 'riguardo', 'al', 'progetto', 'lo'],
              breakdownChunks: [
                {
                  arabicText: 'Gli ho parlato',
                  englishText: 'I spoke to him',
                  sourceText: isAr ? 'تحدثت إليه' : 'I spoke to him',
                  targetText: 'Gli ho parlato',
                  role: 'subject',
                  explanation: 'Indirect pronoun gli (to him) before auxiliary ho'
                },
                {
                  arabicText: 'ieri riguardo al progetto',
                  englishText: 'yesterday regarding the project',
                  sourceText: isAr ? 'أمس بخصوص المشروع' : 'yesterday regarding the project',
                  targetText: 'ieri riguardo al progetto',
                  role: 'modifier',
                  explanation: 'Time adverb + prepositional phrase'
                }
              ],
              habitHint: isAr
                ? 'الضمير غير المباشر للمذكر (إليه) هو Gli ويوضع قبل المساعد ho.'
                : 'Indirect pronoun Gli (to him) precedes the auxiliary verb.'
            },
            {
              id: 'it-ex-2-3-3',
              arabicThought: 'أرسلت لهم التقرير بالبريد الإلكتروني',
              englishTarget: 'Ho mandato loro il rapporto via e-mail',
              sourceThought: sourceThought(source, 'أرسلت لهم التقرير بالبريد الإلكتروني', 'I sent them the report by email'),
              targetSentence: 'Ho mandato loro il rapporto via e-mail',
              acceptableAlternatives: ['Gli ho mandato il rapporto via e-mail'],
              wordChips: ['Ho', 'mandato', 'loro', 'il', 'rapporto', 'via', 'e-mail', 'li'],
              breakdownChunks: [
                {
                  arabicText: 'Ho mandato loro',
                  englishText: 'I sent them',
                  sourceText: isAr ? 'أرسلت لهم' : 'I sent them',
                  targetText: 'Ho mandato loro',
                  role: 'subject',
                  explanation: 'avere + past participle + indirect pronoun loro after verb'
                },
                {
                  arabicText: 'il rapporto via e-mail',
                  englishText: 'the report by email',
                  sourceText: isAr ? 'التقرير بالبريد الإلكتروني' : 'the report by email',
                  targetText: 'il rapporto via e-mail',
                  role: 'object',
                  explanation: 'Direct object + means phrase'
                }
              ],
              habitHint: isAr
                ? 'الضمير loro (لهم) يوضع بعد الفعل عادة أو يمكن استخدام gli قبل الفعل.'
                : 'Indirect pronoun loro is usually placed after the verb.'
            }
          ]
        },
        {
          id: 'it-p2-l4',
          phaseId: 2,
          phaseTitle: 'Transizione Intermedia · Intermediate Italian Dynamics',
          phaseLevel: 'A2 – B1',
          number: 4,
          title: 'Future Tense (Futuro Semplice)',
          titleAr: 'زمن المستقبل البسيط (Futuro Semplice)',
          transferConcept: isAr
            ? 'المستقبل البسيط يضيف النهايات (-erò, -erai, -erà, -eremo, -erete, -eranno) لمصدر الأفعال المنتظمة.'
            : 'Futuro Semplice adds endings (-erò, -erai, -erà, -eremo, -erete, -eranno) to verb stem.',
          transferConceptAr: 'أضف نهايات المستقبل الإيطالي للجذر للتعبر عن الأحداث القادمة.',
          weakSpotTag: 'future-tense',
          exercises: [
            {
              id: 'it-ex-2-4-1',
              arabicThought: 'سأتصل بك غداً صباحاً',
              englishTarget: 'Ti telefonerò domani mattina',
              sourceThought: sourceThought(source, 'سأتصل بك غداً صباحاً', 'I will call you tomorrow morning'),
              targetSentence: 'Ti telefonerò domani mattina',
              acceptableAlternatives: ['Ti chiamerò domani mattina'],
              wordChips: ['Ti', 'telefonerò', 'domani', 'mattina', 'chiamo'],
              breakdownChunks: [
                {
                  arabicText: 'Ti telefonerò',
                  englishText: 'I will call you',
                  sourceText: isAr ? 'سأتصل بك' : 'I will call you',
                  targetText: 'Ti telefonerò',
                  role: 'subject',
                  explanation: 'Pronoun ti + telefonare in futuro semplice (-erò)'
                },
                {
                  arabicText: 'domani mattina',
                  englishText: 'tomorrow morning',
                  sourceText: isAr ? 'غداً صباحاً' : 'tomorrow morning',
                  targetText: 'domani mattina',
                  role: 'modifier',
                  explanation: 'Time phrase'
                }
              ],
              habitHint: isAr
                ? 'نهاية المتكلم في المستقبل البسيط هي -erò وتُكتب بنبرة (telefonerò).'
                : 'First-person singular future ending -erò takes a grave accent.'
            },
            {
              id: 'it-ex-2-4-2',
              arabicThought: 'سأكون هناك في تمام الساعة العاشرة',
              englishTarget: 'Sarò lì alle dieci precise',
              sourceThought: sourceThought(source, 'سأكون هناك في تمام الساعة العاشرة', 'I will be there at ten o’clock sharp'),
              targetSentence: 'Sarò lì alle dieci precise',
              acceptableAlternatives: ['Sarò là alle dieci precise'],
              wordChips: ['Sarò', 'lì', 'alle', 'dieci', 'precise', 'sono'],
              breakdownChunks: [
                {
                  arabicText: 'Sarò',
                  englishText: 'I will be',
                  sourceText: isAr ? 'سأكون' : 'I will be',
                  targetText: 'Sarò',
                  role: 'subject',
                  explanation: 'Futuro semplice of essere (stem sar- + -ò)'
                },
                {
                  arabicText: 'lì alle dieci precise',
                  englishText: 'there at ten o’clock sharp',
                  sourceText: isAr ? 'هناك في تمام العاشرة' : 'there at ten o’clock sharp',
                  targetText: 'lì alle dieci precise',
                  role: 'modifier',
                  explanation: 'Adverb + articulated preposition time phrase'
                }
              ],
              habitHint: isAr
                ? 'جذر essere في المستقبل هو sar-: Sarò (سأكون).'
                : 'Futuro semplice stem of essere is sar-: Sarò.'
            },
            {
              id: 'it-ex-2-4-3',
              arabicThought: 'السنة القادمة سنزور إيطاليا',
              englishTarget: 'L’anno prossimo visiteremo l’Italia',
              sourceThought: sourceThought(source, 'السنة القادمة سنزور إيطاليا', 'Next year we will visit Italy'),
              targetSentence: 'L’anno prossimo visiteremo l’Italia',
              acceptableAlternatives: ['Visiteremo l’Italia l’anno prossimo'],
              wordChips: ['L’anno', 'prossimo', 'visiteremo', 'l’Italia', 'visitiamo'],
              breakdownChunks: [
                {
                  arabicText: 'L’anno prossimo',
                  englishText: 'Next year',
                  sourceText: isAr ? 'السنة القادمة' : 'Next year',
                  targetText: 'L’anno prossimo',
                  role: 'modifier',
                  explanation: 'Time expression'
                },
                {
                  arabicText: 'visiteremo l’Italia',
                  englishText: 'we will visit Italy',
                  sourceText: isAr ? 'سنزور إيطاليا' : 'we will visit Italy',
                  targetText: 'visiteremo l’Italia',
                  role: 'connector',
                  explanation: 'visitare in 1st person plural futuro (-eremo) + l’Italia'
                }
              ],
              habitHint: isAr
                ? 'أسماء الدول تأخذ أداة تعريف عادة في الإيطالية: l’Italia.'
                : 'Country names take definite articles in Italian: l’Italia.'
            }
          ]
        },
        {
          id: 'it-p2-l5',
          phaseId: 2,
          phaseTitle: 'Transizione Intermedia · Intermediate Italian Dynamics',
          phaseLevel: 'A2 – B1',
          number: 5,
          title: 'Expressing Cause & Reason (perché, poiché, siccome)',
          titleAr: 'التعبير عن السبب والعلة (perché, poiché, siccome)',
          transferConcept: isAr
            ? 'تستخدم perché للسبب في وسط الجملة، بينما siccome تأتي في بداية الجملة.'
            : 'Use perché mid-sentence, and siccome when starting with cause.',
          transferConceptAr: 'perché بعد الجملة الرئيسية، و siccome في بداية الجملة.',
          weakSpotTag: 'causal-connectors',
          exercises: [
            {
              id: 'it-ex-2-5-1',
              arabicThought: 'أتعلم الإيطالية لأنني أعيش في إيطاليا',
              englishTarget: 'Imparo l’italiano perché vivo in Italia',
              sourceThought: sourceThought(source, 'أتعلم الإيطالية لأنني أعيش في إيطاليا', 'I learn Italian because I live in Italy'),
              targetSentence: 'Imparo l’italiano perché vivo in Italia',
              acceptableAlternatives: ['Studio l’italiano perché vivo in Italia'],
              wordChips: ['Imparo', 'l’italiano', 'perché', 'vivo', 'in', 'Italia', 'siccome'],
              breakdownChunks: [
                {
                  arabicText: 'Imparo l’italiano',
                  englishText: 'I learn Italian',
                  sourceText: isAr ? 'أتعلم الإيطالية' : 'I learn Italian',
                  targetText: 'Imparo l’italiano',
                  role: 'connector',
                  explanation: 'imparare present tense'
                },
                {
                  arabicText: 'perché vivo in Italia',
                  englishText: 'because I live in Italy',
                  sourceText: isAr ? 'لأنني أعيش في إيطاليا' : 'because I live in Italy',
                  targetText: 'perché vivo in Italia',
                  role: 'connector',
                  explanation: 'Causal connector perché + clause'
                }
              ],
              habitHint: isAr
                ? 'البلدان تأخذ حرف الجر in بدون أداة مع الأفعال: in Italia.'
                : 'Country names take preposition in without article: in Italia.'
            },
            {
              id: 'it-ex-2-5-2',
              arabicThought: 'بما أنها تمطر، سنبقى في المنزل',
              englishTarget: 'Siccome piove, restiamo a casa',
              sourceThought: sourceThought(source, 'بما أنها تمطر، سنبقى في المنزل', 'Since it is raining, we stay at home'),
              targetSentence: 'Siccome piove, restiamo a casa',
              acceptableAlternatives: ['Poiché piove, restiamo a casa'],
              wordChips: ['Siccome', 'piove', 'restiamo', 'a', 'casa', 'perché'],
              breakdownChunks: [
                {
                  arabicText: 'Siccome piove',
                  englishText: 'Since it is raining',
                  sourceText: isAr ? 'بما أنها تمطر' : 'Since it is raining',
                  targetText: 'Siccome piove',
                  role: 'connector',
                  explanation: 'Initial causal connector siccome'
                },
                {
                  arabicText: 'restiamo a casa',
                  englishText: 'we stay at home',
                  sourceText: isAr ? 'سنبقى في المنزل' : 'we stay at home',
                  targetText: 'restiamo a casa',
                  role: 'connector',
                  explanation: 'restare present tense + location'
                }
              ],
              habitHint: isAr
                ? 'عند بدء الجملة بالسبب استخدم Siccome بدلاً من Perché.'
                : 'When starting sentence with cause, use Siccome rather than Perché.'
            },
            {
              id: 'it-ex-2-5-3',
              arabicThought: 'نفضل القطار لأنه أسرع من الحافلة',
              englishTarget: 'Preferiamo il treno perché è più veloce dell’autobus',
              sourceThought: sourceThought(source, 'نفضل القطار لأنه أسرع من الحافلة', 'We prefer the train because it is faster than the bus'),
              targetSentence: 'Preferiamo il treno perché è più veloce dell’autobus',
              acceptableAlternatives: ['Preferiamo il treno poiché è più veloce dell’autobus'],
              wordChips: ['Preferiamo', 'il', 'treno', 'perché', 'è', 'più', 'veloce', 'dell’autobus', 'meno' /* distractor */],
              breakdownChunks: [
                {
                  arabicText: 'Preferiamo il treno',
                  englishText: 'We prefer the train',
                  sourceText: isAr ? 'نفضل القطار' : 'We prefer the train',
                  targetText: 'Preferiamo il treno',
                  role: 'connector',
                  explanation: 'preferire 1st person plural'
                },
                {
                  arabicText: 'perché è più veloce dell’autobus',
                  englishText: 'because it is faster than the bus',
                  sourceText: isAr ? 'لأنه أسرع من الحافلة' : 'because it is faster than the bus',
                  targetText: 'perché è più veloce dell’autobus',
                  role: 'connector',
                  explanation: 'perché + comparative più ... di'
                }
              ],
              habitHint: isAr
                ? 'المقارنة في الإيطالية: più + صفة + di (أو dell’).'
                : 'Italian comparative pattern: più + adjective + di/dell’.'
            }
          ]
        }
      ]
    },
    {
      id: 3,
      title: 'Padronanza e Comunicazione Professionnelle',
      titleAr: 'التمكن والتواصل المهني: الشك والشرط والأسلوب الرسمي',
      level: 'B1 – B2',
      tagline: isAr
        ? 'أتقن صيغة الشك (congiuntivo)، الشرط (condizionale)، الضمائر الموصولة، والمراسلات الرسمية.'
        : 'Master Congiuntivo, Condizionale for politeness, complex relative pronouns, and corporate etiquette.',
      lessons: [
        {
          id: 'it-p3-l1',
          phaseId: 3,
          phaseTitle: 'Padronanza e Comunicazione Professionnelle',
          phaseLevel: 'B1 – B2',
          number: 1,
          title: 'Subjunctive Mood (Congiuntivo) in Necessity & Emotion',
          titleAr: 'صيغة الشك والالتزام (Congiuntivo بعد è necessario che)',
          transferConcept: isAr
            ? 'تستخدم صيغة congiuntivo بعد أفعال الشك والضرورة والمشاعر: È necessario che tu venga / Sono felice che tu sia qui.'
            : 'Congiuntivo is required after expressions of necessity, doubt, and emotion: È necessario che tu venga.',
          transferConceptAr: 'استخدم congiuntivo بعد أفعال الضرورة والمشاعر والشك.',
          weakSpotTag: 'subjunctive-mood',
          exercises: [
            {
              id: 'it-ex-3-1-1',
              arabicThought: 'يجب أن تأتي إلى الاجتماع في الوقت المحدد',
              englishTarget: 'È necessario che tu venga alla riunione in orario',
              sourceThought: sourceThought(source, 'يجب أن تأتي إلى الاجتماع في الوقت المحدد', 'It is necessary that you come to the meeting on time'),
              targetSentence: 'È necessario che tu venga alla riunione in orario',
              acceptableAlternatives: ['Bisogna che tu venga alla riunione in orario'],
              wordChips: ['È necessario che', 'tu', 'venga', 'alla', 'riunione', 'in', 'orario', 'vieni'],
              breakdownChunks: [
                {
                  arabicText: 'È necessario che tu venga',
                  englishText: 'It is necessary that you come',
                  sourceText: isAr ? 'يجب أن تأتي' : 'It is necessary that you come',
                  targetText: 'È necessario che tu venga',
                  role: 'subject',
                  explanation: 'Impersonal necessity expression + congiuntivo of venire (venga)'
                },
                {
                  arabicText: 'alla riunione in orario',
                  englishText: 'to the meeting on time',
                  sourceText: isAr ? 'إلى الاجتماع في الموعد' : 'to the meeting on time',
                  targetText: 'alla riunione in orario',
                  role: 'modifier',
                  explanation: 'Location + time phrase'
                }
              ],
              habitHint: isAr
                ? 'بعد è necessario che يكون الفعل في الـ congiuntivo: venga (وليس vieni).'
                : 'After è necessario che, use congiuntivo form venga.'
            },
            {
              id: 'it-ex-3-1-2',
              arabicThought: 'يسعدني كثيراً أن تكون هنا معنا',
              englishTarget: 'Sono molto felice che tu sia qui con noi',
              sourceThought: sourceThought(source, 'يسعدني كثيراً أن تكون هنا معنا', 'I am very happy that you are here with us'),
              targetSentence: 'Sono molto felice che tu sia qui con noi',
              acceptableAlternatives: ['Sono lieto che tu sia qui con noi'],
              wordChips: ['Sono', 'molto', 'felice', 'che', 'tu', 'sia', 'qui', 'con', 'noi', 'sei'],
              breakdownChunks: [
                {
                  arabicText: 'Sono molto felice che',
                  englishText: 'I am very happy that',
                  sourceText: isAr ? 'يسعدني كثيراً أن' : 'I am very happy that',
                  targetText: 'Sono molto felice che',
                  role: 'connector',
                  explanation: 'Emotion triggering congiuntivo'
                },
                {
                  arabicText: 'tu sia qui con noi',
                  englishText: 'you are here with us',
                  sourceText: isAr ? 'تكون هنا معنا' : 'you are here with us',
                  targetText: 'tu sia qui con noi',
                  role: 'connector',
                  explanation: 'congiuntivo of essere (sia)'
                }
              ],
              habitHint: isAr
                ? 'صيغة الـ congiuntivo لـ essere مع tu هي sia (وليس sei).'
                : 'Congiuntivo of essere for tu is sia (not sei).'
            },
            {
              id: 'it-ex-3-1-3',
              arabicThought: 'أريد أن تنهي هذا التقرير قبل المساء',
              englishTarget: 'Voglio che tu finisca questo rapporto prima di stasera',
              sourceThought: sourceThought(source, 'أريد أن تنهي هذا التقرير قبل المساء', 'I want you to finish this report before tonight'),
              targetSentence: 'Voglio che tu finisca questo rapporto prima di stasera',
              acceptableAlternatives: ['Desidero che tu finisca questo rapporto prima di stasera'],
              wordChips: ['Voglio', 'che', 'tu', 'finisca', 'questo', 'rapporto', 'prima', 'di', 'stasera', 'finisci'],
              breakdownChunks: [
                {
                  arabicText: 'Voglio che tu finisca',
                  englishText: 'I want you to finish',
                  sourceText: isAr ? 'أريد أن تنهي' : 'I want you to finish',
                  targetText: 'Voglio che tu finisca',
                  role: 'subject',
                  explanation: 'volere che + congiuntivo of finire (finisca)'
                },
                {
                  arabicText: 'questo rapporto prima di stasera',
                  englishText: 'this report before tonight',
                  sourceText: isAr ? 'هذا التقرير قبل المساء' : 'this report before tonight',
                  targetText: 'questo rapporto prima di stasera',
                  role: 'object',
                  explanation: 'Demonstrative + noun + time phrase'
                }
              ],
              habitHint: isAr
                ? 'فعل الرغبة volere che يتطلب congiuntivo: finisca.'
                : 'volere che requires congiuntivo: finisca.'
            }
          ]
        },
        {
          id: 'it-p3-l2',
          phaseId: 3,
          phaseTitle: 'Padronanza e Comunicazione Professionnelle',
          phaseLevel: 'B1 – B2',
          number: 2,
          title: 'Conditional for Polite Requests (Condizionale)',
          titleAr: 'صيغة الشرط والطلب المهذب (vorrei, potrebbe)',
          transferConcept: isAr
            ? 'في الطلبات المهذبة استخدم الشرط: Vorrei un caffè (أود قهوة)، Potrebbe aiutarmi? (هل يمكنك مساعدتي؟).'
            : 'For polite requests, use Condizionale: Vorrei (I would like) or Potrebbe (Could you).',
          transferConceptAr: 'استخدم Condizionale للطلب المهذب لتجنب الأسلوب المباشر.',
          weakSpotTag: 'polite-requests',
          exercises: [
            {
              id: 'it-ex-3-2-1',
              arabicThought: 'أود الحصول على فنجان قهوة لو سمحت',
              englishTarget: 'Vorrei una tazza di caffè per favore',
              sourceThought: sourceThought(source, 'أود الحصول على فنجان قهوة لو سمحت', 'I would like a cup of coffee please'),
              targetSentence: 'Vorrei una tazza di caffè per favore',
              acceptableAlternatives: ['Vorrei un caffè per favore'],
              wordChips: ['Vorrei', 'una', 'tazza', 'di', 'caffè', 'per', 'favore', 'voglio', 'tazze'],
              breakdownChunks: [
                {
                  arabicText: 'Vorrei',
                  englishText: 'I would like',
                  sourceText: isAr ? 'أود' : 'I would like',
                  targetText: 'Vorrei',
                  role: 'subject',
                  explanation: 'Condizionale of volere for polite request'
                },
                {
                  arabicText: 'una tazza di caffè per favore',
                  englishText: 'a cup of coffee please',
                  sourceText: isAr ? 'فنجان قهوة لو سمحت' : 'a cup of coffee please',
                  targetText: 'una tazza di caffè per favore',
                  role: 'object',
                  explanation: 'Noun phrase + politeness marker'
                }
              ],
              habitHint: isAr
                ? 'استخدم Vorrei بدلاً من Voglio للطلب بأسلوب مهذب.'
                : 'Use Vorrei instead of Voglio for polite requests.'
            },
            {
              id: 'it-ex-3-2-2',
              arabicThought: 'هل يمكنك مساعدتي في هذا الملف؟',
              englishTarget: 'Potrebbe aiutarmi con questo fascicolo?',
              sourceThought: sourceThought(source, 'هل يمكنك مساعدتي في هذا الملف؟', 'Could you help me with this file?'),
              targetSentence: 'Potrebbe aiutarmi con questo fascicolo?',
              acceptableAlternatives: ['Potresti aiutarmi con questo fascicolo?'],
              wordChips: ['Potrebbe', 'aiutarmi', 'con', 'questo', 'fascicolo', '?', 'puoi'],
              breakdownChunks: [
                {
                  arabicText: 'Potrebbe aiutarmi',
                  englishText: 'Could you help me',
                  sourceText: isAr ? 'هل يمكنك مساعدتي' : 'Could you help me',
                  targetText: 'Potrebbe aiutarmi',
                  role: 'verb',
                  explanation: 'Formal condizionale of potere (potrebbe) + verb with enclitic pronoun'
                },
                {
                  arabicText: 'con questo fascicolo',
                  englishText: 'with this file',
                  sourceText: isAr ? 'في هذا الملف' : 'with this file',
                  targetText: 'con questo fascicolo',
                  role: 'modifier',
                  explanation: 'Preposition con + demonstrative + noun'
                }
              ],
              habitHint: isAr
                ? 'Potrebbe هي الصيغة الرسمية للطلب المهذب.'
                : 'Potrebbe is the formal polite condizionale form.'
            },
            {
              id: 'it-ex-3-2-3',
              arabicThought: 'أفضل أن نلتقي الأسبوع القادم',
              englishTarget: 'Preferirei che ci incontrassimo la prossima settimana',
              sourceThought: sourceThought(source, 'أفضل أن نلتقي الأسبوع القادم', 'I would prefer that we meet next week'),
              targetSentence: 'Preferirei che ci incontrassimo la prossima settimana',
              acceptableAlternatives: ['Preferirei incontrarci la prossima settimana'],
              wordChips: ['Preferirei', 'vorrei' /* distractor */, 'che', 'ci', 'incontrassimo', 'la', 'prossima', 'settimana', 'voglio'],
              breakdownChunks: [
                {
                  arabicText: 'Preferirei che',
                  englishText: 'I would prefer that',
                  sourceText: isAr ? 'أفضل أن' : 'I would prefer that',
                  targetText: 'Preferirei che',
                  role: 'subject',
                  explanation: 'Condizionale of preferire + che'
                },
                {
                  arabicText: 'ci incontrassimo la prossima settimana',
                  englishText: 'we meet next week',
                  sourceText: isAr ? 'نلتقي الأسبوع القادم' : 'we meet next week',
                  targetText: 'ci incontrassimo la prossima settimana',
                  role: 'connector',
                  explanation: 'Reflexive congiuntivo imperfetto + time phrase'
                }
              ],
              habitHint: isAr
                ? 'Preferirei أسلوب راقٍ لتقديم المقترحات المهنية.'
                : 'Preferirei is a refined way to propose corporate choices.'
            }
          ]
        },
        {
          id: 'it-p3-l3',
          phaseId: 3,
          phaseTitle: 'Padronanza e Comunicazione Professionnelle',
          phaseLevel: 'B1 – B2',
          number: 3,
          title: 'Relative Pronouns: che, cui, il quale',
          titleAr: 'الضمائر الموصولة (che, cui, il quale)',
          transferConcept: isAr
            ? 'che تُستخدم للفاعل والمفعول المباشر، و cui مع حروف الجر (di cui, in cui, con cui).'
            : 'che is used for subject and direct object, while cui is used after prepositions (di cui, in cui).',
          transferConceptAr: 'che للفاعل والمفعول المباشر، و cui للمسبوق بحرف جر.',
          weakSpotTag: 'relative-pronouns',
          exercises: [
            {
              id: 'it-ex-3-3-1',
              arabicThought: 'الكتاب الذي قرأته كان مفيداً جداً',
              englishTarget: 'Il libro che ho letto era molto utile',
              sourceThought: sourceThought(source, 'الكتاب الذي قرأته كان مفيداً جداً', 'The book that I read was very useful'),
              targetSentence: 'Il libro che ho letto era molto utile',
              acceptableAlternatives: ['Il libro che ho letto è stato molto utile'],
              wordChips: ['Il', 'libro', 'che', 'ho', 'letto', 'era', 'molto', 'utile', 'cui'],
              breakdownChunks: [
                {
                  arabicText: 'Il libro che ho letto',
                  englishText: 'The book that I read',
                  sourceText: isAr ? 'الكتاب الذي قرأته' : 'The book that I read',
                  targetText: 'Il libro che ho letto',
                  role: 'subject',
                  explanation: 'che relative pronoun for direct object'
                },
                {
                  arabicText: 'era molto utile',
                  englishText: 'was very useful',
                  sourceText: isAr ? 'كان مفيداً جداً' : 'was very useful',
                  targetText: 'era molto utile',
                  role: 'verb',
                  explanation: 'imperfetto of essere + adverb + adjective'
                }
              ],
              habitHint: isAr
                ? 'استخدم che كضمير موصول للمفعول المباشر.'
                : 'Use che as the relative pronoun for direct objects.'
            },
            {
              id: 'it-ex-3-3-2',
              arabicThought: 'الرجل الذي تحدث إليك هو مديرنا',
              englishTarget: 'L’uomo che ti ha parlato è il nostro direttore',
              sourceThought: sourceThought(source, 'الرجل الذي تحدث إليك هو مديرنا', 'The man who spoke to you is our director'),
              targetSentence: 'L’uomo che ti ha parlato è il nostro direttore',
              acceptableAlternatives: ['L’uomo che le ha parlato è il nostro direttore'],
              wordChips: ['L’uomo', 'che', 'ti', 'ha', 'parlato', 'è', 'il', 'nostro', 'direttore', 'un', 'cui' /* distractor */],
              breakdownChunks: [
                {
                  arabicText: 'L’uomo che ti ha parlato',
                  englishText: 'The man who spoke to you',
                  sourceText: isAr ? 'الرجل الذي تحدث إليك' : 'The man who spoke to you',
                  targetText: 'L’uomo che ti ha parlato',
                  role: 'subject',
                  explanation: 'che functioning as relative subject'
                },
                {
                  arabicText: 'è il nostro direttore',
                  englishText: 'is our director',
                  sourceText: isAr ? 'هو مديرنا' : 'is our director',
                  targetText: 'è il nostro direttore',
                  role: 'verb',
                  explanation: 'essere + article il + possessive nostro + direttore'
                }
              ],
              habitHint: isAr
                ? 'che تُستخدم أيضاً كضمير موصول للفاعل.'
                : 'che is also used for relative subject clauses.'
            },
            {
              id: 'it-ex-3-3-3',
              arabicThought: 'الاجتماع الذي تحدثنا عنه كان ناجحاً',
              englishTarget: 'La riunione di cui abbiamo parlato è stata un successo',
              sourceThought: sourceThought(source, 'الاجتماع الذي تحدثنا عنه كان ناجحاً', 'The meeting we spoke about was a success'),
              targetSentence: 'La riunione di cui abbiamo parlato è stata un successo',
              acceptableAlternatives: ['La riunione di cui abbiamo parlato era riuscita'],
              wordChips: ['La', 'riunione', 'di', 'cui', 'abbiamo', 'parlato', 'è', 'stata', 'un', 'successo', 'molto'],
              breakdownChunks: [
                {
                  arabicText: 'La riunione di cui abbiamo parlato',
                  englishText: 'The meeting we spoke about',
                  sourceText: isAr ? 'الاجتماع الذي تحدثنا عنه' : 'The meeting we spoke about',
                  targetText: 'La riunione di cui abbiamo parlato',
                  role: 'subject',
                  explanation: 'di cui replaces parlare di'
                },
                {
                  arabicText: 'è stata un successo',
                  englishText: 'was a success',
                  sourceText: isAr ? 'كان ناجحاً' : 'was a success',
                  targetText: 'è stata un successo',
                  role: 'verb',
                  explanation: 'passato prossimo of essere + noun phrase'
                }
              ],
              habitHint: isAr
                ? 'بعد حرف الجر (di) استخدم cui بدلاً من che: di cui.'
                : 'After a preposition (di), use cui instead of che: di cui.'
            }
          ]
        },
        {
          id: 'it-p3-l4',
          phaseId: 3,
          phaseTitle: 'Padronanza e Comunicazione Professionnelle',
          phaseLevel: 'B1 – B2',
          number: 4,
          title: 'Connectors & Complex Argumentation',
          titleAr: 'أدوات الربط والمحاجة المعقدة (tuttavia, sebbene)',
          transferConcept: isAr
            ? 'تستخدم sebbene مع الـ congiuntivo للتعبير عن التناقض، و tuttavia للربط الفصيح بين الجمل.'
            : 'sebbene requires congiuntivo for concession, while tuttavia connects contrasting arguments.',
          transferConceptAr: 'sebbene + congiuntivo للتناقض، و tuttavia للربط بين الجمل.',
          weakSpotTag: 'complex-connectors',
          exercises: [
            {
              id: 'it-ex-3-4-1',
              arabicThought: 'على الرغم من أن الوقت متأخر، إلا أنني أواصل العمل',
              englishTarget: 'Sebbene sia tardi, continuo a lavorare',
              sourceThought: sourceThought(source, 'على الرغم من أن الوقت متأخر، إلا أنني أواصل العمل', 'Although it is late, I continue to work'),
              targetSentence: 'Sebbene sia tardi, continuo a lavorare',
              acceptableAlternatives: ['Benché sia tardi, continuo a lavorare'],
              wordChips: ['Sebbene', 'sia', 'tardi', 'continuo', 'a', 'lavorare', 'è', 'ma'],
              breakdownChunks: [
                {
                  arabicText: 'Sebbene sia tardi',
                  englishText: 'Although it is late',
                  sourceText: isAr ? 'على الرغم من أن الوقت متأخر' : 'Although it is late',
                  targetText: 'Sebbene sia tardi',
                  role: 'connector',
                  explanation: 'sebbene + congiuntivo of essere (sia)'
                },
                {
                  arabicText: 'continuo a lavorare',
                  englishText: 'I continue to work',
                  sourceText: isAr ? 'أواصل العمل' : 'I continue to work',
                  targetText: 'continuo a lavorare',
                  role: 'connector',
                  explanation: 'continuare a + infinitive'
                }
              ],
              habitHint: isAr
                ? 'الرابط sebbene يتبعه دائماً congiuntivo: sia.'
                : 'The connector sebbene is always followed by congiuntivo: sia.'
            },
            {
              id: 'it-ex-3-4-2',
              arabicThought: 'المشروع صعب، ومع ذلك سنحققه',
              englishTarget: 'Il progetto è difficile, tuttavia lo realizzeremo',
              sourceThought: sourceThought(source, 'المشروع صعب، ومع ذلك سنحققه', 'The project is difficult, however we will achieve it'),
              targetSentence: 'Il progetto è difficile, tuttavia lo realizzeremo',
              acceptableAlternatives: ['Il progetto è difficile, ciò nonostante lo realizzeremo'],
              wordChips: ['Il', 'progetto', 'è', 'difficile', 'tuttavia', 'lo', 'realizzeremo', 'sempre'],
              breakdownChunks: [
                {
                  arabicText: 'Il progetto è difficile',
                  englishText: 'The project is difficult',
                  sourceText: isAr ? 'المشروع صعب' : 'The project is difficult',
                  targetText: 'Il progetto è difficile',
                  role: 'connector',
                  explanation: 'First clause'
                },
                {
                  arabicText: 'tuttavia lo realizzeremo',
                  englishText: 'however we will achieve it',
                  sourceText: isAr ? 'ومع ذلك سنحققه' : 'however we will achieve it',
                  targetText: 'tuttavia lo realizzeremo',
                  role: 'connector',
                  explanation: 'tuttavia (however) + direct pronoun lo + future verb'
                }
              ],
              habitHint: isAr
                ? 'tuttavia رابط فصيح يعبر عن الاستدراك (مع ذلك).'
                : 'tuttavia is a formal connector meaning however.'
            },
            {
              id: 'it-ex-3-4-3',
              arabicThought: 'بناءً على ذلك، سنعقد اجتماعاً طارئاً',
              englishTarget: 'Di conseguenza, terremo una riunione urgente',
              sourceThought: sourceThought(source, 'بناءً على ذلك، سنعقد اجتماعاً طارئاً', 'Consequently, we will hold an urgent meeting'),
              targetSentence: 'Di conseguenza, terremo una riunione urgente',
              acceptableAlternatives: ['Pertanto, terremo una riunione urgente'],
              wordChips: ['Di conseguenza', 'terremo', 'una', 'riunione', 'urgente', 'perché'],
              breakdownChunks: [
                {
                  arabicText: 'Di conseguenza',
                  englishText: 'Consequently',
                  sourceText: isAr ? 'بناءً على ذلك' : 'Consequently',
                  targetText: 'Di conseguenza',
                  role: 'connector',
                  explanation: 'Formal logical connector'
                },
                {
                  arabicText: 'terremo una riunione urgente',
                  englishText: 'we will hold an urgent meeting',
                  sourceText: isAr ? 'سنعقد اجتماعاً طارئاً' : 'we will hold an urgent meeting',
                  targetText: 'terremo una riunione urgente',
                  role: 'connector',
                  explanation: 'tenere in futuro semplice (terremo) + noun phrase'
                }
              ],
              habitHint: isAr
                ? 'Di conseguenza رابط مهني معتمد لبيان النتيجة.'
                : 'Di conseguenza is a standard corporate result connector.'
            }
          ]
        },
        {
          id: 'it-p3-l5',
          phaseId: 3,
          phaseTitle: 'Padronanza e Comunicazione Professionnelle',
          phaseLevel: 'B1 – B2',
          number: 5,
          title: 'Professional Email & Corporate Etiquette',
          titleAr: 'المراسلات الرسمية وإتيكيت الشركات الإيطالية',
          transferConcept: isAr
            ? 'تُفتتح الإيميلات الرسمية بـ Gentile Signore/Signora وتُختتم بـ Cordiali saluti.'
            : 'Formal Italian emails open with Gentile Signore/Signora and conclude with Cordiali saluti.',
          transferConceptAr: 'افتتاح المراسلات بـ Gentile Signore/Signora والختام بـ Cordiali saluti.',
          weakSpotTag: 'business-etiquette',
          exercises: [
            {
              id: 'it-ex-3-5-1',
              arabicThought: 'سيدي/سيدتي العزيز/ة، تجدون المرفق في الإيميل',
              englishTarget: 'Gentile Signore, trova in allegato il documento',
              sourceThought: sourceThought(source, 'سيدي/سيدتي العزيز/ة، تجدون المرفق في الإيميل', 'Dear Sir, please find attached the document'),
              targetSentence: 'Gentile Signore, trova in allegato il documento',
              acceptableAlternatives: ['Gentile Signora, trova in allegato il documento'],
              wordChips: ['Gentile', 'Signore', 'trova', 'in', 'allegato', 'il', 'documento', 'domani'],
              breakdownChunks: [
                {
                  arabicText: 'Gentile Signore',
                  englishText: 'Dear Sir',
                  sourceText: isAr ? 'سيدي العزيز' : 'Dear Sir',
                  targetText: 'Gentile Signore',
                  role: 'connector',
                  explanation: 'Formal salutation'
                },
                {
                  arabicText: 'trova in allegato il documento',
                  englishText: 'find attached the document',
                  sourceText: isAr ? 'تجدون المرفق' : 'find attached the document',
                  targetText: 'trova in allegato il documento',
                  role: 'connector',
                  explanation: 'Formal Lei form + in allegato phrase'
                }
              ],
              habitHint: isAr
                ? 'العبارة المعيارية للمرفقات: in allegato.'
                : 'Standard Italian formula for email attachments: in allegato.'
            },
            {
              id: 'it-ex-3-5-2',
              arabicThought: 'مع أطيب التحيات والتقدير الفائق',
              englishTarget: 'Voglia gradire i miei più cordiali saluti',
              sourceThought: sourceThought(source, 'مع أطيب التحيات والتقدير الفائق', 'Please accept my most cordial greetings'),
              targetSentence: 'Voglia gradire i miei più cordiali saluti',
              acceptableAlternatives: ['Distinti saluti'],
              wordChips: ['Voglia', 'gradire', 'i', 'miei', 'più', 'cordiali', 'saluti', 'per'],
              breakdownChunks: [
                {
                  arabicText: 'Voglia gradire',
                  englishText: 'Please accept',
                  sourceText: isAr ? 'يرجى تقبل' : 'Please accept',
                  targetText: 'Voglia gradire',
                  role: 'verb',
                  explanation: 'Formal congiuntivo imperative'
                },
                {
                  arabicText: 'i miei più cordiali saluti',
                  englishText: 'my most cordial greetings',
                  sourceText: isAr ? 'أطيب تحياتي' : 'my most cordial greetings',
                  targetText: 'i miei più cordiali saluti',
                  role: 'object',
                  explanation: 'Traditional Italian formal closing'
                }
              ],
              habitHint: isAr
                ? 'الختام الرسمي الفاخر المعتمد في الخطابات الإيطالية.'
                : 'Traditional high-register Italian corporate closing.'
            },
            {
              id: 'it-ex-3-5-3',
              arabicThought: 'مع خالص التحيات المهنية',
              englishTarget: 'Cordiali saluti, il team di direzione',
              sourceThought: sourceThought(source, 'مع خالص التحيات المهنية', 'Cordially, the management team'),
              targetSentence: 'Cordiali saluti, il team di direzione',
              acceptableAlternatives: ['Un cordiale saluto, il team di direzione'],
              wordChips: ['Cordiali', 'saluti', 'il', 'team', 'di', 'direzione', 'grazie'],
              breakdownChunks: [
                {
                  arabicText: 'Cordiali saluti',
                  englishText: 'Kind regards',
                  sourceText: isAr ? 'مع خالص التحيات' : 'Kind regards',
                  targetText: 'Cordiali saluti',
                  role: 'connector',
                  explanation: 'Standard everyday corporate closing'
                },
                {
                  arabicText: 'il team di direzione',
                  englishText: 'the management team',
                  sourceText: isAr ? 'فريق الإدارة' : 'the management team',
                  targetText: 'il team di direzione',
                  role: 'subject',
                  explanation: 'Department title'
                }
              ],
              habitHint: isAr
                ? 'Cordiali saluti هي العبارة الأكثر استخداماً وخفة في بيئة العمل اليومية.'
                : 'Cordiali saluti is the most standard everyday Italian business closing.'
            }
          ]
        }
      ]
    }
  ];
}
