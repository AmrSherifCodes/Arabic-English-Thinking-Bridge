import { Phase, SourceLanguage } from '../../types';

function sourceThought(source: SourceLanguage, ar: string, en: string): string {
  return source === 'ar' ? ar : en;
}

export function getFrenchPhases(source: SourceLanguage = 'ar'): Phase[] {
  const isAr = source === 'ar';

  return [
    {
      id: 1,
      title: 'Les Fondations · French Foundations',
      titleAr: 'الأساسات الفرنسية: أدوات التعريف والأفعال être/avoir',
      level: 'A1 – A2',
      tagline: isAr
        ? 'أتقن أدوات التعريف (le/la/l’)، توافق الصفة، والأفعال الأساسية être و avoir والنفى ne...pas.'
        : 'Master definite articles (le/la/l’), adjective agreement, core verbs être/avoir, and negation ne...pas.',
      lessons: [
        {
          id: 'fr-p1-l1',
          phaseId: 1,
          phaseTitle: 'Les Fondations · French Foundations',
          phaseLevel: 'A1 – A2',
          number: 1,
          title: 'Definite Articles & Adjective Agreement',
          titleAr: 'أدوات التعريف (le/la/l’) وتوافق الصفة',
          transferConcept: isAr
            ? 'في الفرنسية، الاسم المذكر يأخذ le والمؤنث la وقبل الحرف المتحرك l’، والصفة تتبع الاسم تذكيراً وتأنيثاً: la maison blanche (البيت الأبيض).'
            : 'In French, masculine nouns take le, feminine take la, and vowel starts take l’. Adjectives agree in gender and number: la maison blanche.',
          transferConceptAr: 'الاسم المذكر يأخذ le والمؤنث la، وقبل Vowel تأخذ l’، والصفة تتبع الاسم.',
          weakSpotTag: 'gender-agreement',
          exercises: [
            {
              id: 'fr-ex-1-1-1',
              arabicThought: 'البيت الأبيض كبير',
              englishTarget: 'La maison blanche est grande',
              sourceThought: sourceThought(source, 'البيت الأبيض كبير', 'The white house is big'),
              targetSentence: 'La maison blanche est grande',
              acceptableAlternatives: ['La grande maison est blanche'],
              wordChips: ['La', 'maison', 'blanche', 'est', 'grande', 'le', 'grand'],
              breakdownChunks: [
                {
                  arabicText: 'La maison',
                  englishText: 'The house',
                  sourceText: isAr ? 'البيت' : 'The house',
                  targetText: 'La maison',
                  role: 'subject',
                  explanation: 'Feminine noun with article la'
                },
                {
                  arabicText: 'blanche',
                  englishText: 'white',
                  sourceText: isAr ? 'أبيض' : 'white',
                  targetText: 'blanche',
                  role: 'modifier',
                  explanation: 'Adjective agrees with feminine noun: blanc -> blanche'
                },
                {
                  arabicText: 'est grande',
                  englishText: 'is big',
                  sourceText: isAr ? 'كبير' : 'is big',
                  targetText: 'est grande',
                  role: 'verb',
                  explanation: 'être + feminine adjective grande'
                }
              ],
              habitHint: isAr
                ? 'maison مؤنث، لذا La والصفات blanche و grande (وليس blanc/grand).'
                : 'maison is feminine, so use La, blanche, and grande.'
            },
            {
              id: 'fr-ex-1-1-2',
              arabicThought: 'الولد الصغير يلعب في الحديقة',
              englishTarget: 'Le petit garçon joue dans le parc',
              sourceThought: sourceThought(source, 'الولد الصغير يلعب في الحديقة', 'The small boy plays in the park'),
              targetSentence: 'Le petit garçon joue dans le parc',
              acceptableAlternatives: ['Le petit garçon joue au parc'],
              wordChips: ['Le', 'petit', 'garçon', 'joue', 'dans', 'le', 'parc', 'la', 'petite'],
              breakdownChunks: [
                {
                  arabicText: 'Le petit garçon',
                  englishText: 'The little boy',
                  sourceText: isAr ? 'الولد الصغير' : 'The little boy',
                  targetText: 'Le petit garçon',
                  role: 'subject',
                  explanation: 'Masculine noun with pre-posed adjective petit'
                },
                {
                  arabicText: 'joue',
                  englishText: 'plays',
                  sourceText: isAr ? 'يلعب' : 'plays',
                  targetText: 'joue',
                  role: 'verb',
                  explanation: 'Present tense of jouer (3rd person singular)'
                },
                {
                  arabicText: 'dans le parc',
                  englishText: 'in the park',
                  sourceText: isAr ? 'في الحديقة' : 'in the park',
                  targetText: 'dans le parc',
                  role: 'modifier',
                  explanation: 'Preposition dans + masculine noun le parc'
                }
              ],
              habitHint: isAr
                ? 'garçon مذكر، فالأداة Le والصفة petit قبل الاسم.'
                : 'garçon is masculine, so use Le and place petit before the noun.'
            },
            {
              id: 'fr-ex-1-1-3',
              arabicThought: 'السيارة الحمراء سريعة جداً',
              englishTarget: 'La voiture rouge est très rapide',
              sourceThought: sourceThought(source, 'السيارة الحمراء سريعة جداً', 'The red car is very fast'),
              targetSentence: 'La voiture rouge est très rapide',
              acceptableAlternatives: ['La voiture rouge est très vite'],
              wordChips: ['La', 'voiture', 'rouge', 'est', 'très', 'rapide', 'le', 'petit'],
              breakdownChunks: [
                {
                  arabicText: 'La voiture',
                  englishText: 'The car',
                  sourceText: isAr ? 'السيارة' : 'The car',
                  targetText: 'La voiture',
                  role: 'subject',
                  explanation: 'Feminine noun with article la'
                },
                {
                  arabicText: 'rouge',
                  englishText: 'red',
                  sourceText: isAr ? 'حمراء' : 'red',
                  targetText: 'rouge',
                  role: 'modifier',
                  explanation: 'Color adjective placed after the noun'
                },
                {
                  arabicText: 'est très rapide',
                  englishText: 'is very fast',
                  sourceText: isAr ? 'سريعة جداً' : 'is very fast',
                  targetText: 'est très rapide',
                  role: 'verb',
                  explanation: 'être + adverb très + adjective rapide'
                }
              ],
              habitHint: isAr
                ? 'voiture مؤنث تأخذ La، وصفات الألوان تأتي بعد الاسم: voiture rouge.'
                : 'voiture is feminine (La), and color adjectives follow the noun.'
            }
          ]
        },
        {
          id: 'fr-p1-l2',
          phaseId: 1,
          phaseTitle: 'Les Fondations · French Foundations',
          phaseLevel: 'A1 – A2',
          number: 2,
          title: 'Core Verbs: être (To Be) & avoir (To Have)',
          titleAr: 'الأفعال الأساسية: être (يكون) و avoir (يملك)',
          transferConcept: isAr
            ? 'في الفرنسية لا يمكن حذف فعل الكينونة (être): Je suis étudiant. واستخدم avoir للتعبير عن الملكية والعمر: J’ai un livre / J’ai 25 ans.'
            : 'French requires explicit être for identity (Je suis étudiant) and avoir for possession/age (J’ai un livre / J’ai 25 ans).',
          transferConceptAr: 'لا تحذف être في الجملة الاسمية، واستخدم avoir للملكية والعمر.',
          weakSpotTag: 'auxiliary-verbs',
          exercises: [
            {
              id: 'fr-ex-1-2-1',
              arabicThought: 'أنا طالب في الجامعة',
              englishTarget: 'Je suis étudiant à l’université',
              sourceThought: sourceThought(source, 'أنا طالب في الجامعة', 'I am a student at the university'),
              targetSentence: 'Je suis étudiant à l’université',
              acceptableAlternatives: ['Je suis un étudiant à l’université'],
              wordChips: ['Je', 'suis', 'étudiant', 'à', 'l’université', 'ai', 'sont'],
              breakdownChunks: [
                {
                  arabicText: 'Je suis',
                  englishText: 'I am',
                  sourceText: isAr ? 'أنا أكون' : 'I am',
                  targetText: 'Je suis',
                  role: 'subject',
                  explanation: 'Frist person singular of être'
                },
                {
                  arabicText: 'étudiant',
                  englishText: 'student',
                  sourceText: isAr ? 'طالب' : 'student',
                  targetText: 'étudiant',
                  role: 'modifier',
                  explanation: 'Profession/status without indefinite article in French'
                },
                {
                  arabicText: 'à l’université',
                  englishText: 'at the university',
                  sourceText: isAr ? 'في الجامعة' : 'at the university',
                  targetText: 'à l’université',
                  role: 'modifier',
                  explanation: 'Preposition à + elided article l’ before vowel'
                }
              ],
              habitHint: isAr
                ? 'لا تقل Je étudiant بل Je suis étudiant (فعل être إجباري).'
                : 'Do not omit être: say Je suis étudiant.'
            },
            {
              id: 'fr-ex-1-2-2',
              arabicThought: 'هو أستاذ في المدرسة',
              englishTarget: 'Il est professeur à l’école',
              sourceThought: sourceThought(source, 'هو أستاذ في المدرسة', 'He is a teacher at the school'),
              targetSentence: 'Il est professeur à l’école',
              acceptableAlternatives: ['Il est un professeur à l’école'],
              wordChips: ['Il', 'est', 'professeur', 'à', 'l’école', 'a', 'sont'],
              breakdownChunks: [
                {
                  arabicText: 'Il est',
                  englishText: 'He is',
                  sourceText: isAr ? 'هو يكون' : 'He is',
                  targetText: 'Il est',
                  role: 'subject',
                  explanation: '3rd person singular of être'
                },
                {
                  arabicText: 'professeur',
                  englishText: 'teacher',
                  sourceText: isAr ? 'أستاذ' : 'teacher',
                  targetText: 'professeur',
                  role: 'modifier',
                  explanation: 'Profession noun'
                },
                {
                  arabicText: 'à l’école',
                  englishText: 'at school',
                  sourceText: isAr ? 'في المدرسة' : 'at school',
                  targetText: 'à l’école',
                  role: 'modifier',
                  explanation: 'Preposition à + l’école (vowel start)'
                }
              ],
              habitHint: isAr
                ? 'Il est وليس Il a للوظائف والهويات.'
                : 'Use Il est (not Il a) for occupations and status.'
            },
            {
              id: 'fr-ex-1-2-3',
              arabicThought: 'عندي سيارة جديدة وكتاب جميل',
              englishTarget: 'J’ai une nouvelle voiture et un beau livre',
              sourceThought: sourceThought(source, 'عندي سيارة جديدة وكتاب جميل', 'I have a new car and a nice book'),
              targetSentence: 'J’ai une nouvelle voiture et un beau livre',
              acceptableAlternatives: ['J’ai une voiture neuve et un beau livre'],
              wordChips: ['J’ai', 'une', 'nouvelle', 'voiture', 'et', 'un', 'beau', 'livre', 'suis'],
              breakdownChunks: [
                {
                  arabicText: 'J’ai',
                  englishText: 'I have',
                  sourceText: isAr ? 'عندي' : 'I have',
                  targetText: 'J’ai',
                  role: 'subject',
                  explanation: 'Je + ai elided to J’ai'
                },
                {
                  arabicText: 'une nouvelle voiture',
                  englishText: 'a new car',
                  sourceText: isAr ? 'سيارة جديدة' : 'a new car',
                  targetText: 'une nouvelle voiture',
                  role: 'object',
                  explanation: 'Indefinite article une + pre-posed adjective nouvelle + noun'
                },
                {
                  arabicText: 'et un beau livre',
                  englishText: 'and a nice book',
                  sourceText: isAr ? 'وكتاب جميل' : 'and a nice book',
                  targetText: 'et un beau livre',
                  role: 'object',
                  explanation: 'Conjunction et + masculine indefinite noun phrase'
                }
              ],
              habitHint: isAr
                ? 'عند الملكية استخدم avoir: J’ai (Je + ai تُختصر إلى J’ai).'
                : 'For possession, use avoir (J’ai = Je + ai).'
            }
          ]
        },
        {
          id: 'fr-p1-l3',
          phaseId: 1,
          phaseTitle: 'Les Fondations · French Foundations',
          phaseLevel: 'A1 – A2',
          number: 3,
          title: 'Regular -er Verbs in the Present Tense',
          titleAr: 'أفعال المجموعة الأولى (-er) في المضارع',
          transferConcept: isAr
            ? 'الأفعال المنتهية بـ -er تحذف النهاية وتضيف: -e, -es, -e, -ons, -ez, -ent: je parle, tu parles, nous parlons.'
            : 'Regular -er verbs drop -er and add endings -e, -es, -e, -ons, -ez, -ent: je parle, tu parles, nous parlons.',
          transferConceptAr: 'احذف -er وأضف نهايات المضارع (-e, -es, -e, -ons, -ez, -ent).',
          weakSpotTag: 'er-verb-conjugation',
          exercises: [
            {
              id: 'fr-ex-1-3-1',
              arabicThought: 'أنا أتكلم الفرنسية كل يوم',
              englishTarget: 'Je parle français tous les jours',
              sourceThought: sourceThought(source, 'أنا أتكلم الفرنسية كل يوم', 'I speak French every day'),
              targetSentence: 'Je parle français tous les jours',
              acceptableAlternatives: ['Chaque jour je parle français'],
              wordChips: ['Je', 'parle', 'français', 'tous', 'les', 'jours', 'parles', 'parler'],
              breakdownChunks: [
                {
                  arabicText: 'Je parle',
                  englishText: 'I speak',
                  sourceText: isAr ? 'أتكلم' : 'I speak',
                  targetText: 'Je parle',
                  role: 'subject',
                  explanation: 'parler conjugated with je (-e)'
                },
                {
                  arabicText: 'français',
                  englishText: 'French',
                  sourceText: isAr ? 'الفرنسية' : 'French',
                  targetText: 'français',
                  role: 'object',
                  explanation: 'Language name without article after parler'
                },
                {
                  arabicText: 'tous les jours',
                  englishText: 'every day',
                  sourceText: isAr ? 'كل يوم' : 'every day',
                  targetText: 'tous les jours',
                  role: 'modifier',
                  explanation: 'Time expression meaning every day'
                }
              ],
              habitHint: isAr
                ? 'مع je نهاية الفعل هى -e: Je parle (وليس parles أو parler).'
                : 'With je, ending is -e: Je parle.'
            },
            {
              id: 'fr-ex-1-3-2',
              arabicThought: 'نحن نعيش في باريس وندرس هناك',
              englishTarget: 'Nous habitons à Paris et nous étudions là-bas',
              sourceThought: sourceThought(source, 'نحن نعيش في باريس وندرس هناك', 'We live in Paris and we study there'),
              targetSentence: 'Nous habitons à Paris et nous étudions là-bas',
              acceptableAlternatives: ['Nous habitons à Paris et étudions là-bas'],
              wordChips: ['Nous', 'habitons', 'à', 'Paris', 'et', 'étudions', 'là-bas', 'habite'],
              breakdownChunks: [
                {
                  arabicText: 'Nous habitons',
                  englishText: 'We live',
                  sourceText: isAr ? 'نحن نعيش' : 'We live',
                  targetText: 'Nous habitons',
                  role: 'subject',
                  explanation: 'habiter conjugated with nous (-ons)'
                },
                {
                  arabicText: 'à Paris',
                  englishText: 'in Paris',
                  sourceText: isAr ? 'في باريس' : 'in Paris',
                  targetText: 'à Paris',
                  role: 'modifier',
                  explanation: 'Preposition à before city names'
                },
                {
                  arabicText: 'et nous étudions là-bas',
                  englishText: 'and we study there',
                  sourceText: isAr ? 'وندرس هناك' : 'and we study there',
                  targetText: 'et nous étudions là-bas',
                  role: 'connector',
                  explanation: 'étudier with nous (-ons) + adverb là-bas'
                }
              ],
              habitHint: isAr
                ? 'مع nous النهاية دائماً -ons: habitons, étudions. وللمدن استخدم حرف الجر à.'
                : 'With nous, ending is always -ons: habitons. Use à before cities.'
            },
            {
              id: 'fr-ex-1-3-3',
              arabicThought: 'هم يعملون في مكتب كبير بوسط المدينة',
              englishTarget: 'Ils travaillent dans un grand bureau au centre-ville',
              sourceThought: sourceThought(source, 'هم يعملون في مكتب كبير بوسط المدينة', 'They work in a big office downtown'),
              targetSentence: 'Ils travaillent dans un grand bureau au centre-ville',
              acceptableAlternatives: ['Elles travaillent dans un grand bureau au centre-ville'],
              wordChips: ['Ils', 'travaillent', 'dans', 'un', 'grand', 'bureau', 'au', 'centre-ville', 'travailler'],
              breakdownChunks: [
                {
                  arabicText: 'Ils travaillent',
                  englishText: 'They work',
                  sourceText: isAr ? 'هم يعملون' : 'They work',
                  targetText: 'Ils travaillent',
                  role: 'subject',
                  explanation: 'travailler conjugated with ils (-ent silent)'
                },
                {
                  arabicText: 'dans un grand bureau',
                  englishText: 'in a big office',
                  sourceText: isAr ? 'في مكتب كبير' : 'in a big office',
                  targetText: 'dans un grand bureau',
                  role: 'modifier',
                  explanation: 'dans + article un + adjective grand + noun bureau'
                },
                {
                  arabicText: 'au centre-ville',
                  englishText: 'downtown',
                  sourceText: isAr ? 'في وسط المدينة' : 'downtown',
                  targetText: 'au centre-ville',
                  role: 'modifier',
                  explanation: 'au (à + le) + centre-ville'
                }
              ],
              habitHint: isAr
                ? 'مع ils تكون النهاية -ent ولكنها صامتة في النطق: Ils travaillent.'
                : 'With ils, ending is -ent (silent in pronunciation).'
            }
          ]
        },
        {
          id: 'fr-p1-l4',
          phaseId: 1,
          phaseTitle: 'Les Fondations · French Foundations',
          phaseLevel: 'A1 – A2',
          number: 4,
          title: 'Negation with ne ... pas',
          titleAr: 'النفي باستخدام ne ... pas',
          transferConcept: isAr
            ? 'النفي يغلف الفعل المصرف بـ ne قبل الفعل و pas بعده: Je ne parle pas. وقبل المتحرك تحول ne إلى n’: Il n’est pas fatigué.'
            : 'French negation wraps the conjugated verb with ne before and pas after: Je ne parle pas. Before a vowel, ne becomes n’.',
          transferConceptAr: 'ضع ne قبل الفعل و pas بعده (أو n’ قبل الحرف المتحرك).',
          weakSpotTag: 'negation-pattern',
          exercises: [
            {
              id: 'fr-ex-1-4-1',
              arabicThought: 'أنا لا أتكلم الإسبانية',
              englishTarget: 'Je ne parle pas espagnol',
              sourceThought: sourceThought(source, 'أنا لا أتكلم الإسبانية', 'I do not speak Spanish'),
              targetSentence: 'Je ne parle pas espagnol',
              acceptableAlternatives: ['Je ne parle pas l’espagnol'],
              wordChips: ['Je', 'ne', 'parle', 'pas', 'espagnol', 'non', 'pas de'],
              breakdownChunks: [
                {
                  arabicText: 'Je ne parle pas',
                  englishText: 'I do not speak',
                  sourceText: isAr ? 'أنا لا أتكلم' : 'I do not speak',
                  targetText: 'Je ne parle pas',
                  role: 'subject',
                  explanation: 'Negation structure ne + verb parle + pas'
                },
                {
                  arabicText: 'espagnol',
                  englishText: 'Spanish',
                  sourceText: isAr ? 'الإسبانية' : 'Spanish',
                  targetText: 'espagnol',
                  role: 'object',
                  explanation: 'Language object'
                }
              ],
              habitHint: isAr
                ? 'ضع ne قبل الفعل المصرف و pas بعده مباشرة: Je ne parle pas.'
                : 'Place ne before the conjugated verb and pas directly after.'
            },
            {
              id: 'fr-ex-1-4-2',
              arabicThought: 'هو ليس متعباً اليوم',
              englishTarget: 'Il n’est pas fatigué aujourd’hui',
              sourceThought: sourceThought(source, 'هو ليس متعباً اليوم', 'He is not tired today'),
              targetSentence: 'Il n’est pas fatigué aujourd’hui',
              acceptableAlternatives: ['Aujourd’hui il n’est pas fatigué'],
              wordChips: ['Il', 'n’est', 'pas', 'fatigué', 'aujourd’hui', 'ne est', 'non'],
              breakdownChunks: [
                {
                  arabicText: 'Il n’est pas',
                  englishText: 'He is not',
                  sourceText: isAr ? 'هو ليس' : 'He is not',
                  targetText: 'Il n’est pas',
                  role: 'subject',
                  explanation: 'n’ before vowel (est) + pas'
                },
                {
                  arabicText: 'fatigué',
                  englishText: 'tired',
                  sourceText: isAr ? 'متعب' : 'tired',
                  targetText: 'fatigué',
                  role: 'modifier',
                  explanation: 'Masculine adjective fatigué'
                },
                {
                  arabicText: 'aujourd’hui',
                  englishText: 'today',
                  sourceText: isAr ? 'اليوم' : 'today',
                  targetText: 'aujourd’hui',
                  role: 'modifier',
                  explanation: 'Time adverb'
                }
              ],
              habitHint: isAr
                ? 'قبل الفعل المبدوء بمتحرك (est)، اختصر ne إلى n’: Il n’est pas.'
                : 'Before a vowel-starting verb (est), shorten ne to n’.'
            },
            {
              id: 'fr-ex-1-4-3',
              arabicThought: 'ليس لدينا سيارة في هذه المدينة',
              englishTarget: 'Nous n’avons pas de voiture dans cette ville',
              sourceThought: sourceThought(source, 'ليس لدينا سيارة في هذه المدينة', 'We do not have a car in this city'),
              targetSentence: 'Nous n’avons pas de voiture dans cette ville',
              acceptableAlternatives: ['Nous n’avons pas une voiture dans cette ville'],
              wordChips: ['Nous', 'n’avons', 'pas', 'de', 'voiture', 'dans', 'cette', 'ville', 'une'],
              breakdownChunks: [
                {
                  arabicText: 'Nous n’avons pas',
                  englishText: 'We do not have',
                  sourceText: isAr ? 'ليس لدينا' : 'We do not have',
                  targetText: 'Nous n’avons pas',
                  role: 'subject',
                  explanation: 'n’ + avons + pas negation'
                },
                {
                  arabicText: 'de voiture',
                  englishText: 'any car',
                  sourceText: isAr ? 'سيارة' : 'any car',
                  targetText: 'de voiture',
                  role: 'object',
                  explanation: 'Indefinite article une changes to de after negation'
                },
                {
                  arabicText: 'dans cette ville',
                  englishText: 'in this city',
                  sourceText: isAr ? 'في هذه المدينة' : 'in this city',
                  targetText: 'dans cette ville',
                  role: 'modifier',
                  explanation: 'dans + demonstrative cette + feminine noun ville'
                }
              ],
              habitHint: isAr
                ? 'بعد النفي pas، تتحول أدوات التنكير (un/une/des) إلى de: pas de voiture.'
                : 'After pas, indefinite articles un/une/des change to de.'
            }
          ]
        },
        {
          id: 'fr-p1-l5',
          phaseId: 1,
          phaseTitle: 'Les Fondations · French Foundations',
          phaseLevel: 'A1 – A2',
          number: 5,
          title: 'Question Formation & Interrogatives',
          titleAr: 'صياغة الأسئلة وأدوات الاستفهام (Où, Comment, Pourquoi)',
          transferConcept: isAr
            ? 'يمكنك السؤال باستخدام où (أين)، comment (كيف)، pourquoi (لماذا)، إما باستخدام est-ce que أو التقديم والتأخير.'
            : 'Form questions using où (where), comment (how), pourquoi (why), either with est-ce que or subject-verb inversion.',
          transferConceptAr: 'استخدم أدوات الاستفهام Où/Comment/Pourquoi مع est-ce que أو تقديم الفعل.',
          weakSpotTag: 'question-formation',
          exercises: [
            {
              id: 'fr-ex-1-5-1',
              arabicThought: 'أين تسكن أنت؟',
              englishTarget: 'Où habites-tu ?',
              sourceThought: sourceThought(source, 'أين تسكن أنت؟', 'Where do you live?'),
              targetSentence: 'Où habites-tu ?',
              acceptableAlternatives: ['Où est-ce que tu habites ?', 'Tu habites où ?'],
              wordChips: ['Où', 'habites-tu', '?', 'est-ce que', 'tu', 'habite'],
              breakdownChunks: [
                {
                  arabicText: 'Où',
                  englishText: 'Where',
                  sourceText: isAr ? 'أين' : 'Where',
                  targetText: 'Où',
                  role: 'connector',
                  explanation: 'Interrogative adverb for place'
                },
                {
                  arabicText: 'habites-tu',
                  englishText: 'do you live',
                  sourceText: isAr ? 'تسكن أنت' : 'do you live',
                  targetText: 'habites-tu',
                  role: 'verb',
                  explanation: 'Subject-verb inversion connected with a hyphen'
                }
              ],
              habitHint: isAr
                ? 'عند تقديم الفعل على الفاعل نضع شريطة بينهما: habites-tu.'
                : 'Inversion requires a hyphen between verb and pronoun: habites-tu.'
            },
            {
              id: 'fr-ex-1-5-2',
              arabicThought: 'ما اسمك؟ (كيف تسمى حضرتك؟)',
              englishTarget: 'Comment vous appelez-vous ?',
              sourceThought: sourceThought(source, 'ما اسمك؟ (كيف تسمى حضرتك؟)', 'What is your name? (Formal)'),
              targetSentence: 'Comment vous appelez-vous ?',
              acceptableAlternatives: ['Comment est-ce que vous vous appelez ?'],
              wordChips: ['Comment', 'vous', 'appelez-vous', '?', 'tu', 't’appelles'],
              breakdownChunks: [
                {
                  arabicText: 'Comment',
                  englishText: 'How',
                  sourceText: isAr ? 'كيف' : 'How',
                  targetText: 'Comment',
                  role: 'connector',
                  explanation: 'Interrogative adverb for manner/name'
                },
                {
                  arabicText: 'vous appelez-vous',
                  englishText: 'are you called',
                  sourceText: isAr ? 'تسمى حضرتك' : 'are you called',
                  targetText: 'vous appelez-vous',
                  role: 'verb',
                  explanation: 'Reflexive verb s’appeler with formal inversion'
                }
              ],
              habitHint: isAr
                ? 'للصيغة الرسمية استخدم vous مع التقديم: Comment vous appelez-vous ?'
                : 'For formal register, use vous with inversion.'
            },
            {
              id: 'fr-ex-1-5-3',
              arabicThought: 'لماذا تدرس اللغة الفرنسية؟',
              englishTarget: 'Pourquoi étudies-tu le français ?',
              sourceThought: sourceThought(source, 'لماذا تدرس اللغة الفرنسية؟', 'Why do you study French?'),
              targetSentence: 'Pourquoi étudies-tu le français ?',
              acceptableAlternatives: ['Pourquoi est-ce que tu étudies le français ?'],
              wordChips: ['Pourquoi', 'étudies-tu', 'le', 'français', '?', 'est-ce que', 'car'],
              breakdownChunks: [
                {
                  arabicText: 'Pourquoi',
                  englishText: 'Why',
                  sourceText: isAr ? 'لماذا' : 'Why',
                  targetText: 'Pourquoi',
                  role: 'connector',
                  explanation: 'Interrogative adverb for cause'
                },
                {
                  arabicText: 'étudies-tu',
                  englishText: 'do you study',
                  sourceText: isAr ? 'تدرس أنت' : 'do you study',
                  targetText: 'étudies-tu',
                  role: 'verb',
                  explanation: 'Inverted verb-pronoun'
                },
                {
                  arabicText: 'le français',
                  englishText: 'French',
                  sourceText: isAr ? 'الفرنسية' : 'French',
                  targetText: 'le français',
                  role: 'object',
                  explanation: 'Masculine article le + language name'
                }
              ],
              habitHint: isAr
                ? 'السؤال بـ Pourquoi يتطلب إما التقديم (étudies-tu) أو est-ce que.'
                : 'Pourquoi requires inversion or est-ce que.'
            }
          ]
        }
      ]
    },
    {
      id: 2,
      title: 'Transition Majeure · Intermediate French Dynamics',
      titleAr: 'المرحلة الانتقالية: الماضي المركب والمستقبل والضمائر',
      level: 'A2 – B1',
      tagline: isAr
        ? 'أتقن الماضي المركب (passé composé)، الاستمرار في الماضي (imparfait)، والضمائر المباشرة وغير المباشرة.'
        : 'Master Passé Composé, Imparfait, Direct/Indirect object pronouns, and future tenses.',
      lessons: [
        {
          id: 'fr-p2-l1',
          phaseId: 2,
          phaseTitle: 'Transition Majeure · Intermediate French Dynamics',
          phaseLevel: 'A2 – B1',
          number: 1,
          title: 'Past Tense with Passé Composé',
          titleAr: 'الماضي المركب (Passé Composé)',
          transferConcept: isAr
            ? 'الماضي المركب يتكون من avoir/être في المضارع + اسم المفعول (participe passé): J’ai acheté un livre / Je suis allé.'
            : 'Passé composé uses present avoir/être + past participle (participe passé): J’ai acheté un livre / Je suis allé.',
          transferConceptAr: 'avoir/être في المضارع + participe passé لبيان حدث مكتمل.',
          weakSpotTag: 'passe-compose',
          exercises: [
            {
              id: 'fr-ex-2-1-1',
              arabicThought: 'اشتريت كتاباً جديداً أمس',
              englishTarget: 'J’ai acheté un nouveau livre hier',
              sourceThought: sourceThought(source, 'اشتريت كتاباً جديداً أمس', 'I bought a new book yesterday'),
              targetSentence: 'J’ai acheté un nouveau livre hier',
              acceptableAlternatives: ['Hier j’ai acheté un nouveau livre'],
              wordChips: ['J’ai', 'acheté', 'un', 'nouveau', 'livre', 'hier', 'suis', 'achète'],
              breakdownChunks: [
                {
                  arabicText: 'J’ai acheté',
                  englishText: 'I bought',
                  sourceText: isAr ? 'اشتريت' : 'I bought',
                  targetText: 'J’ai acheté',
                  role: 'subject',
                  explanation: 'avoir (ai) + participe passé (acheté)'
                },
                {
                  arabicText: 'un nouveau livre',
                  englishText: 'a new book',
                  sourceText: isAr ? 'كتاباً جديداً' : 'a new book',
                  targetText: 'un nouveau livre',
                  role: 'object',
                  explanation: 'un + pre-posed adjective nouveau + livre'
                },
                {
                  arabicText: 'hier',
                  englishText: 'yesterday',
                  sourceText: isAr ? 'أمس' : 'yesterday',
                  targetText: 'hier',
                  role: 'modifier',
                  explanation: 'Past time adverb'
                }
              ],
              habitHint: isAr
                ? 'فعل acheter يأخذ المساعد avoir: J’ai acheté.'
                : 'The verb acheter uses auxiliary avoir: J’ai acheté.'
            },
            {
              id: 'fr-ex-2-1-2',
              arabicThought: 'هو أنهى عمله في الوقت المناسب',
              englishTarget: 'Il a fini son travail à temps',
              sourceThought: sourceThought(source, 'هو أنهى عمله في الوقت المناسب', 'He finished his work on time'),
              targetSentence: 'Il a fini son travail à temps',
              acceptableAlternatives: ['Il a terminé son travail à temps'],
              wordChips: ['Il', 'a', 'fini', 'son', 'travail', 'à', 'temps', 'est', 'finir'],
              breakdownChunks: [
                {
                  arabicText: 'Il a fini',
                  englishText: 'He finished',
                  sourceText: isAr ? 'هو أنهى' : 'He finished',
                  targetText: 'Il a fini',
                  role: 'subject',
                  explanation: 'avoir (a) + participe passé of finir (fini)'
                },
                {
                  arabicText: 'son travail',
                  englishText: 'his work',
                  sourceText: isAr ? 'عمله' : 'his work',
                  targetText: 'son travail',
                  role: 'object',
                  explanation: 'Possessive adjective son + masculine noun'
                },
                {
                  arabicText: 'à temps',
                  englishText: 'on time',
                  sourceText: isAr ? 'في الوقت المناسب' : 'on time',
                  targetText: 'à temps',
                  role: 'modifier',
                  explanation: 'Idiomatic prepositional phrase meaning on time'
                }
              ],
              habitHint: isAr
                ? 'أفعال المجموعة الثانية (-ir) مثل finir يكون اسم المفعول منها -i: fini.'
                : 'Second group (-ir) verbs like finir form past participle in -i: fini.'
            },
            {
              id: 'fr-ex-2-1-3',
              arabicThought: 'ذهبت إلى السينما مع أصدقائي',
              englishTarget: 'Je suis allé au cinéma avec mes amis',
              sourceThought: sourceThought(source, 'ذهبت إلى السينما مع أصدقائي', 'I went to the cinema with my friends'),
              targetSentence: 'Je suis allé au cinéma avec mes amis',
              acceptableAlternatives: ['Je suis allée au cinéma avec mes amis'],
              wordChips: ['Je', 'suis', 'allé', 'au', 'cinéma', 'avec', 'mes', 'amis', 'ai'],
              breakdownChunks: [
                {
                  arabicText: 'Je suis allé',
                  englishText: 'I went',
                  sourceText: isAr ? 'ذهبت' : 'I went',
                  targetText: 'Je suis allé',
                  role: 'subject',
                  explanation: 'aller uses être auxiliary: suis + allé'
                },
                {
                  arabicText: 'au cinéma',
                  englishText: 'to the cinema',
                  sourceText: isAr ? 'إلى السينما' : 'to the cinema',
                  targetText: 'au cinéma',
                  role: 'modifier',
                  explanation: 'au = à + le'
                },
                {
                  arabicText: 'avec mes amis',
                  englishText: 'with my friends',
                  sourceText: isAr ? 'مع أصدقائي' : 'with my friends',
                  targetText: 'avec mes amis',
                  role: 'modifier',
                  explanation: 'avec + plural possessive mes + amis'
                }
              ],
              habitHint: isAr
                ? 'فعل الحركة aller يأخذ المساعد être: Je suis allé (وليس J’ai allé).'
                : 'Motion verb aller takes auxiliary être: Je suis allé.'
            }
          ]
        },
        {
          id: 'fr-p2-l2',
          phaseId: 2,
          phaseTitle: 'Transition Majeure · Intermediate French Dynamics',
          phaseLevel: 'A2 – B1',
          number: 2,
          title: 'Imperfect Tense (Imparfait) vs Passé Composé',
          titleAr: 'زمن الماضي المستمر/الوصف (Imparfait) مقارنة بالماضي المركب',
          transferConcept: isAr
            ? 'تستخدم Imparfait للوصف والعادات والظروف المستمرة في الماضي: Quand j’étais jeune, je jouais souvent.'
            : 'Use Imparfait for descriptions, states, and repeated actions in the past: Quand j’étais jeune, je jouais souvent.',
          transferConceptAr: 'Imparfait للوصف والعادات المستمرة في الماضي (نهايات -ais, -ais, -ait, -ions, -iez, -aient).',
          weakSpotTag: 'imparfait-usage',
          exercises: [
            {
              id: 'fr-ex-2-2-1',
              arabicThought: 'عندما كنت صغيراً، كنت ألعاب كثيراً',
              englishTarget: 'Quand j’étais jeune, je jouais souvent',
              sourceThought: sourceThought(source, 'عندما كنت صغيراً، كنت ألعاب كثيراً', 'When I was young, I used to play often'),
              targetSentence: 'Quand j’étais jeune, je jouais souvent',
              acceptableAlternatives: ['Je jouais souvent quand j’étais jeune'],
              wordChips: ['Quand', 'j’étais', 'jeune', 'je', 'jouais', 'souvent', 'suis', 'ai joué'],
              breakdownChunks: [
                {
                  arabicText: 'Quand j’étais jeune',
                  englishText: 'When I was young',
                  sourceText: isAr ? 'عندما كنت صغيراً' : 'When I was young',
                  targetText: 'Quand j’étais jeune',
                  role: 'connector',
                  explanation: 'imparfait of être (étais) for state in past'
                },
                {
                  arabicText: 'je jouais souvent',
                  englishText: 'I used to play often',
                  sourceText: isAr ? 'كنت ألعاب كثيراً' : 'I used to play often',
                  targetText: 'je jouais souvent',
                  role: 'connector',
                  explanation: 'imparfait of jouer (-ais) for habitual action'
                }
              ],
              habitHint: isAr
                ? 'للوصف والعادات في الماضي استخدم Imparfait: j’étais, je jouais.'
                : 'For past states and habits, use Imparfait.'
            },
            {
              id: 'fr-ex-2-2-2',
              arabicThought: 'كان الطقس جميلاً عندما خرجنا',
              englishTarget: 'Il faisait beau quand nous sommes sortis',
              sourceThought: sourceThought(source, 'كان الطقس جميلاً عندما خرجنا', 'The weather was nice when we went out'),
              targetSentence: 'Il faisait beau quand nous sommes sortis',
              acceptableAlternatives: ['Quand nous sommes sortis, il faisait beau'],
              wordChips: ['Il', 'faisait', 'beau', 'quand', 'nous', 'sommes', 'sortis', 'a fait'],
              breakdownChunks: [
                {
                  arabicText: 'Il faisait beau',
                  englishText: 'The weather was nice',
                  sourceText: isAr ? 'كان الطقس جميلاً' : 'The weather was nice',
                  targetText: 'Il faisait beau',
                  role: 'connector',
                  explanation: 'imparfait of faire for background weather description'
                },
                {
                  arabicText: 'quand nous sommes sortis',
                  englishText: 'when we went out',
                  sourceText: isAr ? 'عندما خرجنا' : 'when we went out',
                  targetText: 'quand nous sommes sortis',
                  role: 'connector',
                  explanation: 'passé composé of sortir for specific completed action'
                }
              ],
              habitHint: isAr
                ? 'الوصف خلفية الحدث بـ Imparfait (il faisait) والحدث القاطع بـ Passé composé (sommes sortis).'
                : 'Background description uses Imparfait; interrupted completed action uses Passé composé.'
            },
            {
              id: 'fr-ex-2-2-3',
              arabicThought: 'بينما كنت أدرس، اتصل بي صديقي',
              englishTarget: 'Pendant que j’étudiais, mon ami m’a téléphoné',
              sourceThought: sourceThought(source, 'بينما كنت أدرس، اتصل بي صديقي', 'While I was studying, my friend called me'),
              targetSentence: 'Pendant que j’étudiais, mon ami m’a téléphoné',
              acceptableAlternatives: ['Mon ami m’a téléphoné pendant que j’étudiais'],
              wordChips: ['Pendant que', 'j’étudiais', 'mon', 'ami', 'm’a', 'téléphoné', 'ai étudié'],
              breakdownChunks: [
                {
                  arabicText: 'Pendant que j’étudiais',
                  englishText: 'While I was studying',
                  sourceText: isAr ? 'بينما كنت أدرس' : 'While I was studying',
                  targetText: 'Pendant que j’étudiais',
                  role: 'connector',
                  explanation: 'pendant que + imparfait for ongoing past activity'
                },
                {
                  arabicText: 'mon ami m’a téléphoné',
                  englishText: 'my friend called me',
                  sourceText: isAr ? 'اتصل بي صديقي' : 'my friend called me',
                  targetText: 'mon ami m’a téléphoné',
                  role: 'connector',
                  explanation: 'passé composé for punctual interrupting event'
                }
              ],
              habitHint: isAr
                ? 'pendant que يأخذ عادة imparfait للحدث المستمر.'
                : 'pendant que introduces an ongoing action in imparfait.'
            }
          ]
        },
        {
          id: 'fr-p2-l3',
          phaseId: 2,
          phaseTitle: 'Transition Majeure · Intermediate French Dynamics',
          phaseLevel: 'A2 – B1',
          number: 3,
          title: 'Direct & Indirect Object Pronouns (le/la/les, lui/leur)',
          titleAr: 'ضمائر المفعول المباشر وغير المباشر (le/la/les, lui/leur)',
          transferConcept: isAr
            ? 'ضمير المفعول يوضع قبل الفعل المصرف: Je le vois (أراه)، Je lui ai parlé (تحدثت إليه).'
            : 'Object pronouns are placed directly before the conjugated verb: Je le vois / Je lui ai parlé.',
          transferConceptAr: 'ضع ضمير المفعول (le/la/les أو lui/leur) قبل الفعل المصرف.',
          weakSpotTag: 'object-pronouns',
          exercises: [
            {
              id: 'fr-ex-2-3-1',
              arabicThought: 'أنا أراه كل صباح في القطار',
              englishTarget: 'Je le vois tous les matins dans le train',
              sourceThought: sourceThought(source, 'أنا أراه كل صباح في القطار', 'I see him every morning on the train'),
              targetSentence: 'Je le vois tous les matins dans le train',
              acceptableAlternatives: ['Tous les matins je le vois dans le train'],
              wordChips: ['Je', 'le', 'vois', 'tous', 'les', 'matins', 'dans', 'le', 'train', 'lui'],
              breakdownChunks: [
                {
                  arabicText: 'Je le vois',
                  englishText: 'I see him',
                  sourceText: isAr ? 'أنا أراه' : 'I see him',
                  targetText: 'Je le vois',
                  role: 'subject',
                  explanation: 'Direct object pronoun le placed before verb vois'
                },
                {
                  arabicText: 'tous les matins',
                  englishText: 'every morning',
                  sourceText: isAr ? 'كل صباح' : 'every morning',
                  targetText: 'tous les matins',
                  role: 'modifier',
                  explanation: 'Habitual time phrase'
                },
                {
                  arabicText: 'dans le train',
                  englishText: 'on the train',
                  sourceText: isAr ? 'في القطار' : 'on the train',
                  targetText: 'dans le train',
                  role: 'modifier',
                  explanation: 'Preposition dans + masculine noun le train'
                }
              ],
              habitHint: isAr
                ? 'الضمير le يحل محل المفعول المباشر المذكر ويوضع قبل الفعل: Je le vois.'
                : 'Direct pronoun le replaces masculine object and precedes the verb.'
            },
            {
              id: 'fr-ex-2-3-2',
              arabicThought: 'تحدثت إليه البارحة بخصوص المشروع',
              englishTarget: 'Je lui ai parlé hier concernant le projet',
              sourceThought: sourceThought(source, 'تحدثت إليه البارحة بخصوص المشروع', 'I spoke to him yesterday regarding the project'),
              targetSentence: 'Je lui ai parlé hier concernant le projet',
              acceptableAlternatives: ['Je lui ai parlé hier du projet'],
              wordChips: ['Je', 'lui', 'ai', 'parlé', 'hier', 'concernant', 'le', 'projet', 'le'],
              breakdownChunks: [
                {
                  arabicText: 'Je lui ai parlé',
                  englishText: 'I spoke to him',
                  sourceText: isAr ? 'تحدثت إليه' : 'I spoke to him',
                  targetText: 'Je lui ai parlé',
                  role: 'subject',
                  explanation: 'Indirect pronoun lui placed before auxiliary ai'
                },
                {
                  arabicText: 'hier concernant le projet',
                  englishText: 'yesterday regarding the project',
                  sourceText: isAr ? 'أمس بخصوص المشروع' : 'yesterday regarding the project',
                  targetText: 'hier concernant le projet',
                  role: 'modifier',
                  explanation: 'Time adverb + preposition + noun phrase'
                }
              ],
              habitHint: isAr
                ? 'فعل parler à يأخذ مفعول غير مباشر، فالضمير lui (إليه/إليها) يوضع قبل المساعد ai.'
                : 'parler à takes indirect pronoun lui (to him/her) before the auxiliary.'
            },
            {
              id: 'fr-ex-2-3-3',
              arabicThought: 'أرسلت لهم التقرير بالبريد الإلكتروني',
              englishTarget: 'Je leur ai envoyé le rapport par e-mail',
              sourceThought: sourceThought(source, 'أرسلت لهم التقرير بالبريد الإلكتروني', 'I sent them the report by email'),
              targetSentence: 'Je leur ai envoyé le rapport par e-mail',
              acceptableAlternatives: ['Je leur ai envoyé le rapport par courriel'],
              wordChips: ['Je', 'leur', 'ai', 'envoyé', 'le', 'rapport', 'par', 'e-mail', 'les'],
              breakdownChunks: [
                {
                  arabicText: 'Je leur ai envoyé',
                  englishText: 'I sent them',
                  sourceText: isAr ? 'أرسلت لهم' : 'I sent them',
                  targetText: 'Je leur ai envoyé',
                  role: 'subject',
                  explanation: 'Indirect plural pronoun leur before auxiliary ai'
                },
                {
                  arabicText: 'le rapport par e-mail',
                  englishText: 'the report by email',
                  sourceText: isAr ? 'التقرير بالبريد الإلكتروني' : 'the report by email',
                  targetText: 'le rapport par e-mail',
                  role: 'object',
                  explanation: 'Direct object le rapport + prepositional phrase par e-mail'
                }
              ],
              habitHint: isAr
                ? 'الضمير غير المباشر للجمع هو leur (لهم/لهن) ويوضع قبل الفعل.'
                : 'Plural indirect pronoun is leur (to them) placed before the verb.'
            }
          ]
        },
        {
          id: 'fr-p2-l4',
          phaseId: 2,
          phaseTitle: 'Transition Majeure · Intermediate French Dynamics',
          phaseLevel: 'A2 – B1',
          number: 4,
          title: 'Future Tenses: Futur Proche & Futur Simple',
          titleAr: 'أزمنة المستقبل: المستقبل القريب والمستقبل البسيط',
          transferConcept: isAr
            ? 'المستقبل القريب يتكون من aller + المصدر: Je vais téléphoner. والمستقبل البسيط يضيف نهايات (-ai, -as, -a...) للمصدر.'
            : 'Futur Proche uses aller + infinitive (Je vais téléphoner). Futur Simple adds endings (-ai, -as, -a, -ons, -ez, -ont) to infinitive.',
          transferConceptAr: 'aller + المصدر للمستقبل القريب، وأضف نهايات المستقبل للمصدر للمستقبل البسيط.',
          weakSpotTag: 'future-tenses',
          exercises: [
            {
              id: 'fr-ex-2-4-1',
              arabicThought: 'سأتصل بك غداً صباحاً',
              englishTarget: 'Je vais te téléphoner demain matin',
              sourceThought: sourceThought(source, 'سأتصل بك غداً صباحاً', 'I am going to call you tomorrow morning'),
              targetSentence: 'Je vais te téléphoner demain matin',
              acceptableAlternatives: ['Je te téléphonerai demain matin'],
              wordChips: ['Je', 'vais', 'te', 'téléphoner', 'demain', 'matin', 'téléphone', 'serai'],
              breakdownChunks: [
                {
                  arabicText: 'Je vais te téléphoner',
                  englishText: 'I am going to call you',
                  sourceText: isAr ? 'سأتصل بك' : 'I am going to call you',
                  targetText: 'Je vais te téléphoner',
                  role: 'subject',
                  explanation: 'Futur proche: vais + object pronoun te + infinitive téléphoner'
                },
                {
                  arabicText: 'demain matin',
                  englishText: 'tomorrow morning',
                  sourceText: isAr ? 'غداً صباحاً' : 'tomorrow morning',
                  targetText: 'demain matin',
                  role: 'modifier',
                  explanation: 'Time phrase for near future'
                }
              ],
              habitHint: isAr
                ? 'الضمير te يوضع بين فعل aller المصرف والمصدر: Je vais te téléphoner.'
                : 'Object pronoun te is placed between conjugated aller and infinitive.'
            },
            {
              id: 'fr-ex-2-4-2',
              arabicThought: 'سأكون هناك في تمام الساعة العاشرة',
              englishTarget: 'Je serai là-bas à dix heures précises',
              sourceThought: sourceThought(source, 'سأكون هناك في تمام الساعة العاشرة', 'I will be there at ten o’clock sharp'),
              targetSentence: 'Je serai là-bas à dix heures précises',
              acceptableAlternatives: ['Je serai là à dix heures précises'],
              wordChips: ['Je', 'serai', 'là-bas', 'à', 'dix', 'heures', 'précises', 'suis'],
              breakdownChunks: [
                {
                  arabicText: 'Je serai',
                  englishText: 'I will be',
                  sourceText: isAr ? 'سأكون' : 'I will be',
                  targetText: 'Je serai',
                  role: 'subject',
                  explanation: 'Futur simple of être (stem ser- + ending -ai)'
                },
                {
                  arabicText: 'là-bas à dix heures précises',
                  englishText: 'there at ten o’clock sharp',
                  sourceText: isAr ? 'هناك في تمام العاشرة' : 'there at ten o’clock sharp',
                  targetText: 'là-bas à dix heures précises',
                  role: 'modifier',
                  explanation: 'Adverb + time phrase'
                }
              ],
              habitHint: isAr
                ? 'جذر فعل être في المستقبل البسيط هو ser- فتصبح: Je serai.'
                : 'Futur simple stem of être is ser-: Je serai.'
            },
            {
              id: 'fr-ex-2-4-3',
              arabicThought: 'السنة القادمة سنزور فرنسا',
              englishTarget: 'L’année prochaine nous visiterons la France',
              sourceThought: sourceThought(source, 'السنة القادمة سنزور فرنسا', 'Next year we will visit France'),
              targetSentence: 'L’année prochaine nous visiterons la France',
              acceptableAlternatives: ['Nous visiterons la France l’année prochaine'],
              wordChips: ['L’année', 'prochaine', 'nous', 'visiterons', 'la', 'France', 'visitons'],
              breakdownChunks: [
                {
                  arabicText: 'L’année prochaine',
                  englishText: 'Next year',
                  sourceText: isAr ? 'السنة القادمة' : 'Next year',
                  targetText: 'L’année prochaine',
                  role: 'modifier',
                  explanation: 'Time expression'
                },
                {
                  arabicText: 'nous visiterons la France',
                  englishText: 'we will visit France',
                  sourceText: isAr ? 'سنزور فرنسا' : 'we will visit France',
                  targetText: 'nous visiterons la France',
                  role: 'connector',
                  explanation: 'visiter in futur simple + feminine country la France'
                }
              ],
              habitHint: isAr
                ? 'مع أسماء الدول المؤنثة مثل France استخدم أداة التعريف la.'
                : 'Use article la before feminine country names like la France.'
            }
          ]
        },
        {
          id: 'fr-p2-l5',
          phaseId: 2,
          phaseTitle: 'Transition Majeure · Intermediate French Dynamics',
          phaseLevel: 'A2 – B1',
          number: 5,
          title: 'Expressing Cause & Reason (parce que, car, comme)',
          titleAr: 'التعبير عن السبب والعلة (parce que, car, comme)',
          transferConcept: isAr
            ? 'تخدم parce que للسبب بعد الجملة، بينما comme تأتي في بداية الجملة: Comme il pleut, nous restons à la maison.'
            : 'Use parce que after the main clause, and comme at the sentence beginning: Comme il pleut, nous restons.',
          transferConceptAr: 'parce que تأتي بعد الجملة، و comme تأتي في بداية الجملة لبيان السبب.',
          weakSpotTag: 'causal-connectors',
          exercises: [
            {
              id: 'fr-ex-2-5-1',
              arabicThought: 'أتعلم الفرنسية لأنني أعيش في فرنسا',
              englishTarget: 'J’apprends le français parce que j’habite en France',
              sourceThought: sourceThought(source, 'أتعلم الفرنسية لأنني أعيش في فرنسا', 'I am learning French because I live in France'),
              targetSentence: 'J’apprends le français parce que j’habite en France',
              acceptableAlternatives: ['J’apprends le français car j’habite en France'],
              wordChips: ['J’apprends', 'le', 'français', 'parce que', 'j’habite', 'en', 'France', 'pourquoi'],
              breakdownChunks: [
                {
                  arabicText: 'J’apprends le français',
                  englishText: 'I learn French',
                  sourceText: isAr ? 'أتعلم الفرنسية' : 'I learn French',
                  targetText: 'J’apprends le français',
                  role: 'connector',
                  explanation: 'apprendre present tense'
                },
                {
                  arabicText: 'parce que j’habite en France',
                  englishText: 'because I live in France',
                  sourceText: isAr ? 'لأنني أعيش في فرنسا' : 'because I live in France',
                  targetText: 'parce que j’habite en France',
                  role: 'connector',
                  explanation: 'Causal connector parce que + clause'
                }
              ],
              habitHint: isAr
                ? 'استخدم en قبل أسماء الدول المؤنثة: en France.'
                : 'Use preposition en before feminine countries: en France.'
            },
            {
              id: 'fr-ex-2-5-2',
              arabicThought: 'بما أنها تمطر، سنبقى في المنزل',
              englishTarget: 'Comme il pleut, nous restons à la maison',
              sourceThought: sourceThought(source, 'بما أنها تمطر، سنبقى في المنزل', 'Since it is raining, we stay at home'),
              targetSentence: 'Comme il pleut, nous restons à la maison',
              acceptableAlternatives: ['Nous restons à la maison parce qu’il pleut'],
              wordChips: ['Comme', 'il', 'pleut', 'nous', 'restons', 'à', 'la', 'maison', 'parce que'],
              breakdownChunks: [
                {
                  arabicText: 'Comme il pleut',
                  englishText: 'Since it is raining',
                  sourceText: isAr ? 'بما أنها تمطر' : 'Since it is raining',
                  targetText: 'Comme il pleut',
                  role: 'connector',
                  explanation: 'comme placed at sentence start for cause'
                },
                {
                  arabicText: 'nous restons à la maison',
                  englishText: 'we stay at home',
                  sourceText: isAr ? 'سنبقى في المنزل' : 'we stay at home',
                  targetText: 'nous restons à la maison',
                  role: 'connector',
                  explanation: 'rester present tense + location phrase'
                }
              ],
              habitHint: isAr
                ? 'عند بدء الجملة بالسبب استخدم comme وليس parce que.'
                : 'When starting sentence with cause, use comme (not parce que).'
            },
            {
              id: 'fr-ex-2-5-3',
              arabicThought: 'نفضل القطار لأنه أسرع من الحافلة',
              englishTarget: 'Nous préférons le train car il est plus rapide que l’autobus',
              sourceThought: sourceThought(source, 'نفضل القطار لأنه أسرع من الحافلة', 'We prefer the train for it is faster than the bus'),
              targetSentence: 'Nous préférons le train car il est plus rapide que l’autobus',
              acceptableAlternatives: ['Nous préférons le train parce qu’il est plus rapide que le bus'],
              wordChips: ['Nous', 'préférons', 'le', 'train', 'car', 'il', 'est', 'plus', 'rapide', 'que', 'l’autobus'],
              breakdownChunks: [
                {
                  arabicText: 'Nous préférons le train',
                  englishText: 'We prefer the train',
                  sourceText: isAr ? 'نفضل القطار' : 'We prefer the train',
                  targetText: 'Nous préférons le train',
                  role: 'connector',
                  explanation: 'préférer present tense with accent shift'
                },
                {
                  arabicText: 'car il est plus rapide que l’autobus',
                  englishText: 'for it is faster than the bus',
                  sourceText: isAr ? 'لأنه أسرع من الحافلة' : 'for it is faster than the bus',
                  targetText: 'car il est plus rapide que l’autobus',
                  role: 'connector',
                  explanation: 'car + comparative plus... que'
                }
              ],
              habitHint: isAr
                ? 'المقارنة بالزيادة تكون بتركيب: plus + صفة + que.'
                : 'Superiority comparison uses: plus + adjective + que.'
            }
          ]
        }
      ]
    },
    {
      id: 3,
      title: 'Maîtrise & Communication Professionnelle',
      titleAr: 'التمكن والتواصل المهني: الشك والشرط والأسلوب الرسمي',
      level: 'B1 – B2',
      tagline: isAr
        ? 'أتقن صيغة الشك (subjonctif)، الشرط (conditionnel)، الموصول المتقدم، وأساليب المراسلات الرسمية.'
        : 'Master Subjonctif, Conditionnel for politeness, complex relative pronouns, and corporate etiquette.',
      lessons: [
        {
          id: 'fr-p3-l1',
          phaseId: 3,
          phaseTitle: 'Maîtrise & Communication Professionnelle',
          phaseLevel: 'B1 – B2',
          number: 1,
          title: 'Subjunctive Mood (Subjonctif) in Necessity & Emotion',
          titleAr: 'صيغة الشك والالتزام (Subjonctif بعد il faut que)',
          transferConcept: isAr
            ? 'تستخدم صيغة subjonctif بعد التعبيرات الدالة على الضرورة (il faut que) أو المشاعر: Il faut que tu viennes.'
            : 'Subjonctif is required after expressions of necessity (il faut que), desire, or emotion: Il faut que tu viennes.',
          transferConceptAr: 'استخدم subjonctif بعد il faut que والتعبير عن الرغبة والشك.',
          weakSpotTag: 'subjunctive-mood',
          exercises: [
            {
              id: 'fr-ex-3-1-1',
              arabicThought: 'يجب أن تأتي إلى الاجتماع في الوقت المحدد',
              englishTarget: 'Il faut que tu viennes à la réunion à l’heure',
              sourceThought: sourceThought(source, 'يجب أن تأتي إلى الاجتماع في الوقت المحدد', 'You must come to the meeting on time'),
              targetSentence: 'Il faut que tu viennes à la réunion à l’heure',
              acceptableAlternatives: ['Il faut que vous veniez à la réunion à l’heure'],
              wordChips: ['Il faut que', 'tu', 'viennes', 'à', 'la', 'réunion', 'à', 'l’heure', 'viens'],
              breakdownChunks: [
                {
                  arabicText: 'Il faut que tu viennes',
                  englishText: 'You must come',
                  sourceText: isAr ? 'يجب أن تأتي' : 'You must come',
                  targetText: 'Il faut que tu viennes',
                  role: 'subject',
                  explanation: 'il faut que + subjonctif of venir (viennes)'
                },
                {
                  arabicText: 'à la réunion à l’heure',
                  englishText: 'to the meeting on time',
                  sourceText: isAr ? 'إلى الاجتماع في الوقت المحدد' : 'to the meeting on time',
                  targetText: 'à la réunion à l’heure',
                  role: 'modifier',
                  explanation: 'Location and time phrases'
                }
              ],
              habitHint: isAr
                ? 'بعد il faut que يكون الفعل في الـ subjonctif: viennes (وليس viens).'
                : 'After il faut que, use subjonctif form viennes.'
            },
            {
              id: 'fr-ex-3-1-2',
              arabicThought: 'يسعدني كثيراً أن تكون هنا معنا',
              englishTarget: 'Je suis très heureux que tu sois là avec nous',
              sourceThought: sourceThought(source, 'يسعدني كثيراً أن تكون هنا معنا', 'I am very happy that you are here with us'),
              targetSentence: 'Je suis très heureux que tu sois là avec nous',
              acceptableAlternatives: ['Je suis ravi que tu sois là avec nous'],
              wordChips: ['Je', 'suis', 'très', 'heureux', 'que', 'tu', 'sois', 'là', 'avec', 'nous', 'es'],
              breakdownChunks: [
                {
                  arabicText: 'Je suis très heureux que',
                  englishText: 'I am very happy that',
                  sourceText: isAr ? 'يسعدني كثيراً أن' : 'I am very happy that',
                  targetText: 'Je suis très heureux que',
                  role: 'connector',
                  explanation: 'Expression of emotion triggering subjonctif'
                },
                {
                  arabicText: 'tu sois là avec nous',
                  englishText: 'you are here with us',
                  sourceText: isAr ? 'تكون هنا معنا' : 'you are here with us',
                  targetText: 'tu sois là avec nous',
                  role: 'connector',
                  explanation: 'subjonctif of être (sois)'
                }
              ],
              habitHint: isAr
                ? 'صيغة الـ subjonctif لـ être مع tu هي sois (وليس es).'
                : 'Subjonctif of être for tu is sois (not es).'
            },
            {
              id: 'fr-ex-3-1-3',
              arabicThought: 'أريد أن تنهي هذا التقرير قبل المساء',
              englishTarget: 'Je veux que tu finisses ce rapport avant ce soir',
              sourceThought: sourceThought(source, 'أريد أن تنهي هذا التقرير قبل المساء', 'I want you to finish this report before this evening'),
              targetSentence: 'Je veux que tu finisses ce rapport avant ce soir',
              acceptableAlternatives: ['Je souhaite que tu finisses ce rapport avant ce soir'],
              wordChips: ['Je', 'veux', 'que', 'tu', 'finisses', 'ce', 'rapport', 'avant', 'ce', 'soir', 'finis'],
              breakdownChunks: [
                {
                  arabicText: 'Je veux que tu finisses',
                  englishText: 'I want you to finish',
                  sourceText: isAr ? 'أريد أن تنهي' : 'I want you to finish',
                  targetText: 'Je veux que tu finisses',
                  role: 'subject',
                  explanation: 'vouloir que + subjonctif of finir (finisses)'
                },
                {
                  arabicText: 'ce rapport avant ce soir',
                  englishText: 'this report before this evening',
                  sourceText: isAr ? 'هذا التقرير قبل المساء' : 'this report before this evening',
                  targetText: 'ce rapport avant ce soir',
                  role: 'object',
                  explanation: 'Demonstrative ce + noun + time preposition'
                }
              ],
              habitHint: isAr
                ? 'فعل الرغبة vouloir que يتطلب subjonctif: finisses.'
                : 'vouloir que requires subjonctif: finisses.'
            }
          ]
        },
        {
          id: 'fr-p3-l2',
          phaseId: 3,
          phaseTitle: 'Maîtrise & Communication Professionnelle',
          phaseLevel: 'B1 – B2',
          number: 2,
          title: 'Conditional for Polite Requests (Conditionnel Présent)',
          titleAr: 'صيغة الشرط والطلب المهذب (je voudrais, pourriez-vous)',
          transferConcept: isAr
            ? 'في الطلبات المهذبة استخدم الشرط: Je voudrais un café (أود قهوة)، Pourriez-vous m’aider ? (هل يمكنك مساعدتي؟).'
            : 'For polite requests, use Conditionnel Présent: Je voudrais (I would like) or Pourriez-vous (Could you).',
          transferConceptAr: 'استخدم Conditionnel للطلب المهذب لتجنب الأسلوب المباشر القاسي.',
          weakSpotTag: 'polite-requests',
          exercises: [
            {
              id: 'fr-ex-3-2-1',
              arabicThought: 'أود الحصول على فنجان قهوة لو سمحت',
              englishTarget: 'Je voudrais une tasse de café s’il vous plaît',
              sourceThought: sourceThought(source, 'أود الحصول على فنجان قهوة لو سمحت', 'I would like a cup of coffee please'),
              targetSentence: 'Je voudrais une tasse de café s’il vous plaît',
              acceptableAlternatives: ['Je voudrais un café s’il vous plaît'],
              wordChips: ['Je', 'voudrais', 'une', 'tasse', 'de', 'café', 's’il vous plaît', 'veux'],
              breakdownChunks: [
                {
                  arabicText: 'Je voudrais',
                  englishText: 'I would like',
                  sourceText: isAr ? 'أود' : 'I would like',
                  targetText: 'Je voudrais',
                  role: 'subject',
                  explanation: 'Conditionnel présent of vouloir for polite request'
                },
                {
                  arabicText: 'une tasse de café s’il vous plaît',
                  englishText: 'a cup of coffee please',
                  sourceText: isAr ? 'فنجان قهوة لو سمحت' : 'a cup of coffee please',
                  targetText: 'une tasse de café s’il vous plaît',
                  role: 'object',
                  explanation: 'Noun phrase + formal courtesy phrase'
                }
              ],
              habitHint: isAr
                ? 'استخدم Je voudrais بدلاً من Je veux لطلب أشياء بأسلوب راقٍ.'
                : 'Use Je voudrais instead of Je veux for polite requests.'
            },
            {
              id: 'fr-ex-3-2-2',
              arabicThought: 'هل يمكنك مساعدتي في هذا الملف؟',
              englishTarget: 'Pourriez-vous m’aider avec ce dossier ?',
              sourceThought: sourceThought(source, 'هل يمكنك مساعدتي في هذا الملف؟', 'Could you help me with this file?'),
              targetSentence: 'Pourriez-vous m’aider avec ce dossier ?',
              acceptableAlternatives: ['Pourrais-tu m’aider avec ce dossier ?'],
              wordChips: ['Pourriez-vous', 'm’aider', 'avec', 'ce', 'dossier', '?', 'pouvez-vous'],
              breakdownChunks: [
                {
                  arabicText: 'Pourriez-vous m’aider',
                  englishText: 'Could you help me',
                  sourceText: isAr ? 'هل يمكنك مساعدتي' : 'Could you help me',
                  targetText: 'Pourriez-vous m’aider',
                  role: 'verb',
                  explanation: 'Conditionnel of pouvoir (pourriez) + reflexive pronoun m’ + infinitive aider'
                },
                {
                  arabicText: 'avec ce dossier',
                  englishText: 'with this file',
                  sourceText: isAr ? 'في هذا الملف' : 'with this file',
                  targetText: 'avec ce dossier',
                  role: 'modifier',
                  explanation: 'avec + demonstrative ce + dossier'
                }
              ],
              habitHint: isAr
                ? 'التقديم بالشرط Pourriez-vous أعلى درجة في اللباقة من Pouvez-vous.'
                : 'Conditionnel inversion Pourriez-vous is much more polite than Pouvez-vous.'
            },
            {
              id: 'fr-ex-3-2-3',
              arabicThought: 'أفضل أن نلتقي الأسبوع القادم',
              englishTarget: 'J’aimerais que nous nous rencontrions la semaine prochaine',
              sourceThought: sourceThought(source, 'أفضل أن نلتقي الأسبوع القادم', 'I would prefer that we meet next week'),
              targetSentence: 'J’aimerais que nous nous rencontrions la semaine prochaine',
              acceptableAlternatives: ['J’aimerais mieux qu’on se rencontre la semaine prochaine'],
              wordChips: ['J’aimerais', 'que', 'nous', 'nous', 'rencontrions', 'la', 'semaine', 'prochaine'],
              breakdownChunks: [
                {
                  arabicText: 'J’aimerais que',
                  englishText: 'I would like that',
                  sourceText: isAr ? 'أفضل أن' : 'I would like that',
                  targetText: 'J’aimerais que',
                  role: 'subject',
                  explanation: 'Conditionnel of aimer + conjunction que'
                },
                {
                  arabicText: 'nous nous rencontrions la semaine prochaine',
                  englishText: 'we meet next week',
                  sourceText: isAr ? 'نلتقي الأسبوع القادم' : 'we meet next week',
                  targetText: 'nous nous rencontrions la semaine prochaine',
                  role: 'connector',
                  explanation: 'Reflexive subjonctif verb + time phrase'
                }
              ],
              habitHint: isAr
                ? 'J’aimerais طريقة لطيفة للتعبير عن الاقتراحات والتفضيلات.'
                : 'J’aimerais is a smooth way to express proposals and preferences.'
            }
          ]
        },
        {
          id: 'fr-p3-l3',
          phaseId: 3,
          phaseTitle: 'Maîtrise & Communication Professionnelle',
          phaseLevel: 'B1 – B2',
          number: 3,
          title: 'Relative Pronouns: qui, que, dont, où',
          titleAr: 'ضمائر الموصول المتقدمة (qui, que, dont, où)',
          transferConcept: isAr
            ? 'qui يحل محل الفاعل، que يحل محل المفعول المباشر، dont للمملوك أو مع de، و où للمكان والزمان.'
            : 'qui replaces subject, que replaces direct object, dont replaces de + noun, and où is for place/time.',
          transferConceptAr: 'qui للفاعل، que للمفعول، dont للمسبوق بـ de، و où للمكان والزمان.',
          weakSpotTag: 'relative-pronouns',
          exercises: [
            {
              id: 'fr-ex-3-3-1',
              arabicThought: 'الكتاب الذي قرأته كان مفيداً جداً',
              englishTarget: 'Le livre que j’ai lu était très utile',
              sourceThought: sourceThought(source, 'الكتاب الذي قرأته كان مفيداً جداً', 'The book that I read was very useful'),
              targetSentence: 'Le livre que j’ai lu était très utile',
              acceptableAlternatives: ['Le livre que j’ai lu a été très utile'],
              wordChips: ['Le', 'livre', 'que', 'j’ai', 'lu', 'était', 'très', 'utile', 'qui'],
              breakdownChunks: [
                {
                  arabicText: 'Le livre que j’ai lu',
                  englishText: 'The book that I read',
                  sourceText: isAr ? 'الكتاب الذي قرأته' : 'The book that I read',
                  targetText: 'Le livre que j’ai lu',
                  role: 'subject',
                  explanation: 'que relative pronoun for direct object'
                },
                {
                  arabicText: 'était très utile',
                  englishText: 'was very useful',
                  sourceText: isAr ? 'كان مفيداً جداً' : 'was very useful',
                  targetText: 'était très utile',
                  role: 'verb',
                  explanation: 'imparfait of être + adverb + adjective'
                }
              ],
              habitHint: isAr
                ? 'لأن الكتاب مفعول به للفعل lu، نستخدم que وليس qui.'
                : 'Since book is the object of read, use que (not qui).'
            },
            {
              id: 'fr-ex-3-3-2',
              arabicThought: 'الرجل الذي تحدث إليك هو مديرنا',
              englishTarget: 'L’homme qui t’a parlé est notre directeur',
              sourceThought: sourceThought(source, 'الرجل الذي تحدث إليك هو مديرنا', 'The man who spoke to you is our director'),
              targetSentence: 'L’homme qui t’a parlé est notre directeur',
              acceptableAlternatives: ['L’homme qui vous a parlé est notre directeur'],
              wordChips: ['L’homme', 'qui', 't’a', 'parlé', 'est', 'notre', 'directeur', 'que'],
              breakdownChunks: [
                {
                  arabicText: 'L’homme qui t’a parlé',
                  englishText: 'The man who spoke to you',
                  sourceText: isAr ? 'الرجل الذي تحدث إليك' : 'The man who spoke to you',
                  targetText: 'L’homme qui t’a parlé',
                  role: 'subject',
                  explanation: 'qui relative pronoun functioning as subject'
                },
                {
                  arabicText: 'est notre directeur',
                  englishText: 'is our director',
                  sourceText: isAr ? 'هو مديرنا' : 'is our director',
                  targetText: 'est notre directeur',
                  role: 'verb',
                  explanation: 'être + possessive notre + directeur'
                }
              ],
              habitHint: isAr
                ? 'عندما يكون الضمير هو فاعل الفعل التالي استخدم qui.'
                : 'When the relative pronoun is the subject of the next verb, use qui.'
            },
            {
              id: 'fr-ex-3-3-3',
              arabicThought: 'الاجتماع الذي تحدثنا عنه كان ناجحاً',
              englishTarget: 'La réunion dont nous avons parlé était réussie',
              sourceThought: sourceThought(source, 'الاجتماع الذي تحدثنا عنه كان ناجحاً', 'The meeting we spoke about was successful'),
              targetSentence: 'La réunion dont nous avons parlé était réussie',
              acceptableAlternatives: ['La réunion dont on a parlé était réussie'],
              wordChips: ['La', 'réunion', 'dont', 'nous', 'avons', 'parlé', 'était', 'réussie', 'que'],
              breakdownChunks: [
                {
                  arabicText: 'La réunion dont nous avons parlé',
                  englishText: 'The meeting we spoke about',
                  sourceText: isAr ? 'الاجتماع الذي تحدثنا عنه' : 'The meeting we spoke about',
                  targetText: 'La réunion dont nous avons parlé',
                  role: 'subject',
                  explanation: 'dont replaces parler de'
                },
                {
                  arabicText: 'était réussie',
                  englishText: 'was successful',
                  sourceText: isAr ? 'كان ناجحاً' : 'was successful',
                  targetText: 'était réussie',
                  role: 'verb',
                  explanation: 'imparfait + feminine adjective réussie'
                }
              ],
              habitHint: isAr
                ? 'لأن الفعل هو parler de، نستخدم dont بدلاً من que.'
                : 'Because the verb is parler de, use dont.'
            }
          ]
        },
        {
          id: 'fr-p3-l4',
          phaseId: 3,
          phaseTitle: 'Maîtrise & Communication Professionnelle',
          phaseLevel: 'B1 – B2',
          number: 4,
          title: 'Connectors & Complex Argumentation',
          titleAr: 'أدوات الربط والمحاجة المعقدة (cependant, bien que)',
          transferConcept: isAr
            ? 'تستخدم bien que مع الـ subjonctif للتعبير عن التناقض، و cependant للربط بين الجمل.'
            : 'bien que requires subjonctif for concession, while cependant links contrasting clauses.',
          transferConceptAr: 'bien que + subjonctif للتناقض، و cependant للتناقض بين الجمل.',
          weakSpotTag: 'complex-connectors',
          exercises: [
            {
              id: 'fr-ex-3-4-1',
              arabicThought: 'على الرغم من أن الوقت متأخر، إلا أنني أواصل العمل',
              englishTarget: 'Bien qu’il soit tard, je continue à travailler',
              sourceThought: sourceThought(source, 'على الرغم من أن الوقت متأخر، إلا أنني أواصل العمل', 'Although it is late, I continue to work'),
              targetSentence: 'Bien qu’il soit tard, je continue à travailler',
              acceptableAlternatives: ['Bien qu’il soit tard, je continue de travailler'],
              wordChips: ['Bien qu’il', 'soit', 'tard', 'je', 'continue', 'à', 'travailler', 'est', 'mais'],
              breakdownChunks: [
                {
                  arabicText: 'Bien qu’il soit tard',
                  englishText: 'Although it is late',
                  sourceText: isAr ? 'على الرغم من أن الوقت متأخر' : 'Although it is late',
                  targetText: 'Bien qu’il soit tard',
                  role: 'connector',
                  explanation: 'bien que + subjonctif of être (soit)'
                },
                {
                  arabicText: 'je continue à travailler',
                  englishText: 'I continue to work',
                  sourceText: isAr ? 'أواصل العمل' : 'I continue to work',
                  targetText: 'je continue à travailler',
                  role: 'connector',
                  explanation: 'continuer à + infinitive'
                }
              ],
              habitHint: isAr
                ? 'تركيب bien que يستوجب دائماً subjonctif: soit.'
                : 'bien que always requires subjonctif: soit.'
            },
            {
              id: 'fr-ex-3-4-2',
              arabicThought: 'المشروع صعب، ومع ذلك سنحققه',
              englishTarget: 'Le projet est difficile, cependant nous le réussirons',
              sourceThought: sourceThought(source, 'المشروع صعب، ومع ذلك سنحققه', 'The project is difficult, however we will succeed at it'),
              targetSentence: 'Le projet est difficile, cependant nous le réussirons',
              acceptableAlternatives: ['Le projet est difficile, toutefois nous allons le réussir'],
              wordChips: ['Le', 'projet', 'est', 'difficile', 'cependant', 'nous', 'le', 'réussirons'],
              breakdownChunks: [
                {
                  arabicText: 'Le projet est difficile',
                  englishText: 'The project is difficult',
                  sourceText: isAr ? 'المشروع صعب' : 'The project is difficult',
                  targetText: 'Le projet est difficile',
                  role: 'connector',
                  explanation: 'First independent clause'
                },
                {
                  arabicText: 'cependant nous le réussirons',
                  englishText: 'however we will succeed at it',
                  sourceText: isAr ? 'ومع ذلك سنحققه' : 'however we will succeed at it',
                  targetText: 'cependant nous le réussirons',
                  role: 'connector',
                  explanation: 'Adversative connector cependant + futur simple clause'
                }
              ],
              habitHint: isAr
                ? 'cependant كلمة ربط رسمية تعني "مع ذلك/غير أن".'
                : 'cependant is a formal connector meaning however.'
            },
            {
              id: 'fr-ex-3-4-3',
              arabicThought: 'بناءً على ذلك، سنعقد اجتماعاً طارئاً',
              englishTarget: 'Par conséquent, nous tiendrons une réunion urgente',
              sourceThought: sourceThought(source, 'بناءً على ذلك، سنعقد اجتماعاً طارئاً', 'Consequently, we will hold an urgent meeting'),
              targetSentence: 'Par conséquent, nous tiendrons une réunion urgente',
              acceptableAlternatives: ['C’est pourquoi nous allons tenir une réunion urgente'],
              wordChips: ['Par conséquent', 'nous', 'tiendrons', 'une', 'réunion', 'urgente', 'parce que'],
              breakdownChunks: [
                {
                  arabicText: 'Par conséquent',
                  englishText: 'Consequently',
                  sourceText: isAr ? 'بناءً على ذلك' : 'Consequently',
                  targetText: 'Par conséquent',
                  role: 'connector',
                  explanation: 'Formal logical connector'
                },
                {
                  arabicText: 'nous tiendrons une réunion urgente',
                  englishText: 'we will hold an urgent meeting',
                  sourceText: isAr ? 'سنعقد اجتماعاً طارئاً' : 'we will hold an urgent meeting',
                  targetText: 'nous tiendrons une réunion urgente',
                  role: 'connector',
                  explanation: 'tenir in futur simple + noun phrase'
                }
              ],
              habitHint: isAr
                ? 'Par conséquent رابط رسمي للنتيجة في الخطاب المهني.'
                : 'Par conséquent is a formal result connector in corporate discourse.'
            }
          ]
        },
        {
          id: 'fr-p3-l5',
          phaseId: 3,
          phaseTitle: 'Maîtrise & Communication Professionnelle',
          phaseLevel: 'B1 – B2',
          number: 5,
          title: 'Professional Email & Corporate Etiquette',
          titleAr: 'المراسلات الرسمية وإتيكيت الشركات الفرنسية',
          transferConcept: isAr
            ? 'تُفتتح الإيميلات الرسمية بـ Madame, Monsieur وتُختتم بـ Veuillez agréer... أو Cordialement.'
            : 'Formal emails open with Madame, Monsieur and conclude with Veuillez agréer... or Cordialement.',
          transferConceptAr: 'افتتاح المراسلات الرسمية بـ Madame, Monsieur والختام بـ Cordialement.',
          weakSpotTag: 'business-etiquette',
          exercises: [
            {
              id: 'fr-ex-3-5-1',
              arabicThought: 'سيدي/سيدتي، يرجى الاطلاع على المرفق',
              englishTarget: 'Madame, Monsieur, veuillez trouver ci-joint le document',
              sourceThought: sourceThought(source, 'سيدي/سيدتي، يرجى الاطلاع على المرفق', 'Dear Sir/Madam, please find attached the document'),
              targetSentence: 'Madame, Monsieur, veuillez trouver ci-joint le document',
              acceptableAlternatives: ['Madame, Monsieur, veuillez trouver en pièce jointe le document'],
              wordChips: ['Madame', 'Monsieur', 'veuillez', 'trouver', 'ci-joint', 'le', 'document'],
              breakdownChunks: [
                {
                  arabicText: 'Madame, Monsieur',
                  englishText: 'Dear Sir/Madam',
                  sourceText: isAr ? 'سيدي/سيدتي' : 'Dear Sir/Madam',
                  targetText: 'Madame, Monsieur',
                  role: 'connector',
                  explanation: 'Standard formal salutation'
                },
                {
                  arabicText: 'veuillez trouver ci-joint le document',
                  englishText: 'please find attached the document',
                  sourceText: isAr ? 'يرجى تجد المرفق' : 'please find attached the document',
                  targetText: 'veuillez trouver ci-joint le document',
                  role: 'connector',
                  explanation: 'veuillez (polite vouloir) + trouver ci-joint'
                }
              ],
              habitHint: isAr
                ? 'الصيغة المعيارية للمرفقات: veuillez trouver ci-joint.'
                : 'Standard formula for attachments: veuillez trouver ci-joint.'
            },
            {
              id: 'fr-ex-3-5-2',
              arabicThought: 'مع أطيب التحيات والتقدير الفائق',
              englishTarget: 'Veuillez agréer l’expression de mes salutations distinguées',
              sourceThought: sourceThought(source, 'مع أطيب التحيات والتقدير الفائق', 'Please accept my distinguished greetings'),
              targetSentence: 'Veuillez agréer l’expression de mes salutations distinguées',
              acceptableAlternatives: ['Veuillez agréer mes salutations distinguées'],
              wordChips: ['Veuillez', 'agréer', 'l’expression', 'de', 'mes', 'salutations', 'distinguées'],
              breakdownChunks: [
                {
                  arabicText: 'Veuillez agréer',
                  englishText: 'Please accept',
                  sourceText: isAr ? 'يرجى تقبل' : 'Please accept',
                  targetText: 'Veuillez agréer',
                  role: 'verb',
                  explanation: 'Formal sign-off imperative phrase'
                },
                {
                  arabicText: 'l’expression de mes salutations distinguées',
                  englishText: 'the expression of my distinguished greetings',
                  sourceText: isAr ? 'أطيب تحياتي والتقدير' : 'my distinguished greetings',
                  targetText: 'l’expression de mes salutations distinguées',
                  role: 'object',
                  explanation: 'Traditional French corporate closing phrase'
                }
              ],
              habitHint: isAr
                ? 'الختام الرسمي الأرقى في الإيميلات الرسمية الفرنسية.'
                : 'Highest level formal closing formula for corporate emails in French.'
            },
            {
              id: 'fr-ex-3-5-3',
              arabicThought: 'مع خالص التحيات المهنية',
              englishTarget: 'Bien cordialement, l’équipe de direction',
              sourceThought: sourceThought(source, 'مع خالص التحيات المهنية', 'Best regards, the management team'),
              targetSentence: 'Bien cordialement, l’équipe de direction',
              acceptableAlternatives: ['Cordialement, l’équipe de direction'],
              wordChips: ['Bien', 'cordialement', 'l’équipe', 'de', 'direction'],
              breakdownChunks: [
                {
                  arabicText: 'Bien cordialement',
                  englishText: 'Best regards',
                  sourceText: isAr ? 'مع خالص التحيات' : 'Best regards',
                  targetText: 'Bien cordialement',
                  role: 'connector',
                  explanation: 'Modern semi-formal corporate closing'
                },
                {
                  arabicText: 'l’équipe de direction',
                  englishText: 'the management team',
                  sourceText: isAr ? 'فريق الإدارة' : 'the management team',
                  targetText: 'l’équipe de direction',
                  role: 'subject',
                  explanation: 'Corporate department title'
                }
              ],
              habitHint: isAr
                ? 'Cordialement أو Bien cordialement هي الأكثر شيوعاً في بيئة العمل اليومية.'
                : 'Cordialement or Bien cordialement is the most standard everyday corporate closing.'
            }
          ]
        }
      ]
    }
  ];
}
