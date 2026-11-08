import { Phase, SourceLanguage } from '../../types';

function sourceThought(source: SourceLanguage, ar: string, en: string): string {
  return source === 'ar' ? ar : en;
}

export function getPortuguesePhases(source: SourceLanguage = 'ar'): Phase[] {
  const isAr = source === 'ar';

  return [
    {
      id: 1,
      title: 'Fundamentos do Português · Portuguese Foundations',
      titleAr: 'الأساسات البرتغالية: أدوات التعريف والأفعال ser/estar/ter',
      level: 'A1 – A2',
      tagline: isAr
        ? 'أتقن أدوات التعريف (o/a)، توافق الصفة، والأفعال الأساسية ser و estar و ter والنفي بـ não.'
        : 'Master definite articles (o/a), adjective agreement, core verbs ser/estar/ter, and negation with não.',
      lessons: [
        {
          id: 'pt-p1-l1',
          phaseId: 1,
          phaseTitle: 'Fundamentos do Português · Portuguese Foundations',
          phaseLevel: 'A1 – A2',
          number: 1,
          title: 'Definite Articles & Adjective Agreement',
          titleAr: 'أدوات التعريف (o/a) وتوافق الصفة',
          transferConcept: isAr
            ? 'في البرتغالية، الاسم المذكر يأخذ o والمؤنث a، والصفة تتبع الاسم في الجنس والعدد: a casa branca é grande (البيت الأبيض كبير).'
            : 'In Portuguese, masculine nouns take o, feminine take a, and adjectives agree in gender/number: a casa branca é grande.',
          transferConceptAr: 'الاسم المذكر يأخذ o والمؤنث a، والصفة تطابق جنس الاسم.',
          weakSpotTag: 'gender-agreement',
          exercises: [
            {
              id: 'pt-ex-1-1-1',
              arabicThought: 'البيت الأبيض كبير',
              englishTarget: 'A casa branca é grande',
              sourceThought: sourceThought(source, 'البيت الأبيض كبير', 'The white house is big'),
              targetSentence: 'A casa branca é grande',
              acceptableAlternatives: ['A casa grande é branca'],
              wordChips: ['A', 'casa', 'branca', 'é', 'grande', 'o', 'branco'],
              breakdownChunks: [
                {
                  arabicText: 'A casa',
                  englishText: 'The house',
                  sourceText: isAr ? 'البيت' : 'The house',
                  targetText: 'A casa',
                  role: 'subject',
                  explanation: 'Feminine noun with article a'
                },
                {
                  arabicText: 'branca',
                  englishText: 'white',
                  sourceText: isAr ? 'أبيض' : 'white',
                  targetText: 'branca',
                  role: 'modifier',
                  explanation: 'Feminine adjective ending in -a'
                },
                {
                  arabicText: 'é grande',
                  englishText: 'is big',
                  sourceText: isAr ? 'كبير' : 'is big',
                  targetText: 'é grande',
                  role: 'verb',
                  explanation: 'ser 3rd person singular é + adjective'
                }
              ],
              habitHint: isAr
                ? 'casa مؤنث، لذا الصفة branca (وليس branco).'
                : 'casa is feminine, so use branca (not branco).'
            },
            {
              id: 'pt-ex-1-1-2',
              arabicThought: 'الولد الصغير يلعب في الحديقة',
              englishTarget: 'O menino pequeno joga no parque',
              sourceThought: sourceThought(source, 'الولد الصغير يلعب في الحديقة', 'The small boy plays in the park'),
              targetSentence: 'O menino pequeno joga no parque',
              acceptableAlternatives: ['O garoto pequeno joga no parque', 'O menino pequeno brinca no parque'],
              wordChips: ['O', 'menino', 'pequeno', 'joga', 'no', 'parque', 'a', 'pequena'],
              breakdownChunks: [
                {
                  arabicText: 'O menino pequeno',
                  englishText: 'The small boy',
                  sourceText: isAr ? 'الولد الصغير' : 'The small boy',
                  targetText: 'O menino pequeno',
                  role: 'subject',
                  explanation: 'Masculine noun with article o + adjective'
                },
                {
                  arabicText: 'joga',
                  englishText: 'plays',
                  sourceText: isAr ? 'يلعب' : 'plays',
                  targetText: 'joga',
                  role: 'verb',
                  explanation: 'jogar 3rd person singular'
                },
                {
                  arabicText: 'no parque',
                  englishText: 'in the park',
                  sourceText: isAr ? 'في الحديقة' : 'in the park',
                  targetText: 'no parque',
                  role: 'modifier',
                  explanation: 'contraction em + o -> no'
                }
              ],
              habitHint: isAr
                ? 'menino مذكر ومعه أداة o، و em + o تصبح no.'
                : 'menino is masculine (o), and em + o contracts to no.'
            },
            {
              id: 'pt-ex-1-1-3',
              arabicThought: 'السيارة الحمراء سريعة جداً',
              englishTarget: 'O carro vermelho é muito rápido',
              sourceThought: sourceThought(source, 'السيارة الحمراء سريعة جداً', 'The red car is very fast'),
              targetSentence: 'O carro vermelho é muito rápido',
              acceptableAlternatives: ['A viatura vermelha é muito rápida'],
              wordChips: ['O', 'carro', 'vermelho', 'é', 'muito', 'rápido', 'a', 'vermelha'],
              breakdownChunks: [
                {
                  arabicText: 'O carro',
                  englishText: 'The car',
                  sourceText: isAr ? 'السيارة' : 'The car',
                  targetText: 'O carro',
                  role: 'subject',
                  explanation: 'Masculine noun in Portuguese (o carro)'
                },
                {
                  arabicText: 'vermelho',
                  englishText: 'red',
                  sourceText: isAr ? 'حمراء' : 'red',
                  targetText: 'vermelho',
                  role: 'modifier',
                  explanation: 'Masculine color adjective'
                },
                {
                  arabicText: 'é muito rápido',
                  englishText: 'is very fast',
                  sourceText: isAr ? 'سريعة جداً' : 'is very fast',
                  targetText: 'é muito rápido',
                  role: 'verb',
                  explanation: 'ser + adverb muito + adjective'
                }
              ],
              habitHint: isAr
                ? 'انتبه: كلمة carro مذكر في البرتغالية وتأخذ o (وليس a).'
                : 'Note: carro is masculine in Portuguese, so use o carro.'
            }
          ]
        },
        {
          id: 'pt-p1-l2',
          phaseId: 1,
          phaseTitle: 'Fundamentos do Português · Portuguese Foundations',
          phaseLevel: 'A1 – A2',
          number: 2,
          title: 'Core Verbs: ser, estar & ter',
          titleAr: 'الأفعال الأساسية: ser (الكينونة الدائمة)، estar (الحالة)، ter (الملكية)',
          transferConcept: isAr
            ? 'استخدم ser للهوية والوظيفة (sou estudante)، و estar للحالة والمكان (estou cansado)، و ter للملكية (tenho um carro).'
            : 'Use ser for identity/profession (sou estudante), estar for state/location (estou cansado), and ter for possession (tenho um carro).',
          transferConceptAr: 'ser للهوية، estar للحالة المؤقتة، و ter للملكية.',
          weakSpotTag: 'auxiliary-verbs',
          exercises: [
            {
              id: 'pt-ex-1-2-1',
              arabicThought: 'أنا طالب في الجامعة',
              englishTarget: 'Sou estudante na universidade',
              sourceThought: sourceThought(source, 'أنا طالب في الجامعة', 'I am a student at the university'),
              targetSentence: 'Sou estudante na universidade',
              acceptableAlternatives: ['Eu sou estudante na universidade', 'Sou um estudante na universidade'],
              wordChips: ['Sou', 'estudante', 'na', 'universidade', 'tenho', 'estou'],
              breakdownChunks: [
                {
                  arabicText: 'Sou',
                  englishText: 'I am',
                  sourceText: isAr ? 'أنا أكون' : 'I am',
                  targetText: 'Sou',
                  role: 'subject',
                  explanation: '1st person singular of ser (permanent identity)'
                },
                {
                  arabicText: 'estudante',
                  englishText: 'student',
                  sourceText: isAr ? 'طالب' : 'student',
                  targetText: 'estudante',
                  role: 'modifier',
                  explanation: 'Profession noun without indefinite article'
                },
                {
                  arabicText: 'na universidade',
                  englishText: 'at the university',
                  sourceText: isAr ? 'في الجامعة' : 'at the university',
                  targetText: 'na universidade',
                  role: 'modifier',
                  explanation: 'contraction em + a -> na'
                }
              ],
              habitHint: isAr
                ? 'اترك الضمير eu واستخدم Sou مباشرة للهوية.'
                : 'Drop pronoun eu in natural speech: Sou estudante.'
            },
            {
              id: 'pt-ex-1-2-2',
              arabicThought: 'هو أستاذ في المدرسة',
              englishTarget: 'Ele é professor na escola',
              sourceThought: sourceThought(source, 'هو أستاذ في المدرسة', 'He is a teacher at school'),
              targetSentence: 'Ele é professor na escola',
              acceptableAlternatives: ['É professor na escola'],
              wordChips: ['Ele', 'é', 'professor', 'na', 'escola', 'tem', 'está'],
              breakdownChunks: [
                {
                  arabicText: 'Ele é',
                  englishText: 'He is',
                  sourceText: isAr ? 'هو يكون' : 'He is',
                  targetText: 'Ele é',
                  role: 'subject',
                  explanation: '3rd person singular of ser (é with acute accent)'
                },
                {
                  arabicText: 'professor',
                  englishText: 'teacher',
                  sourceText: isAr ? 'أستاذ' : 'teacher',
                  targetText: 'professor',
                  role: 'modifier',
                  explanation: 'Profession'
                },
                {
                  arabicText: 'na escola',
                  englishText: 'at school',
                  sourceText: isAr ? 'في المدرسة' : 'at school',
                  targetText: 'na escola',
                  role: 'modifier',
                  explanation: 'contraction em + a escola -> na escola'
                }
              ],
              habitHint: isAr
                ? 'فعل الكينونة é يُكتب بنبرة حادة (é) تمييزاً له عن حرف العطف e (و).'
                : 'The verb é carries an acute accent to distinguish from conjunction e (and).'
            },
            {
              id: 'pt-ex-1-2-3',
              arabicThought: 'عندي سيارة جديدة وكتاب جميل',
              englishTarget: 'Tenho um carro novo e um bom livro',
              sourceThought: sourceThought(source, 'عندي سيارة جديدة وكتاب جميل', 'I have a new car and a good book'),
              targetSentence: 'Tenho um carro novo e um bom livro',
              acceptableAlternatives: ['Eu tenho um carro novo e um bom livro'],
              wordChips: ['Tenho', 'uma' /* distractor */, 'um', 'carro', 'novo', 'e', 'um', 'bom', 'livro', 'sou', 'tem'],
              breakdownChunks: [
                {
                  arabicText: 'Tenho',
                  englishText: 'I have',
                  sourceText: isAr ? 'عندي' : 'I have',
                  targetText: 'Tenho',
                  role: 'subject',
                  explanation: '1st person singular of ter (possession)'
                },
                {
                  arabicText: 'um carro novo',
                  englishText: 'a new car',
                  sourceText: isAr ? 'سيارة جديدة' : 'a new car',
                  targetText: 'um carro novo',
                  role: 'object',
                  explanation: 'Masculine object phrase'
                },
                {
                  arabicText: 'e um bom livro',
                  englishText: 'and a good book',
                  sourceText: isAr ? 'وكتاب جميل' : 'and a good book',
                  targetText: 'e um bom livro',
                  role: 'object',
                  explanation: 'Conjunction e + object phrase'
                }
              ],
              habitHint: isAr
                ? 'فعل الملكية الشائع في البرتغالية هو ter: Tenho um carro.'
                : 'In Portuguese, ter is the standard verb for possession: Tenho um carro.'
            }
          ]
        },
        {
          id: 'pt-p1-l3',
          phaseId: 1,
          phaseTitle: 'Fundamentos do Português · Portuguese Foundations',
          phaseLevel: 'A1 – A2',
          number: 3,
          title: 'Regular -ar Verbs in Present Tense',
          titleAr: 'أفعال المجموعة الأولى (-ar) في المضارع',
          transferConcept: isAr
            ? 'الأفعال المنتهية بـ -ar تحذف النهاية وتضيف: -o, -as, -a, -amos, -am: falo, falas, fala, falamos, falam.'
            : 'Regular -ar verbs drop -ar and add endings -o, -as, -a, -amos, -am: falo, falas, fala, falamos, falam.',
          transferConceptAr: 'احذف -ar وأضف نهايات المضارع (-o, -as, -a, -amos, -am).',
          weakSpotTag: 'ar-verb-conjugation',
          exercises: [
            {
              id: 'pt-ex-1-3-1',
              arabicThought: 'أنا أتحدث البرتغالية كل يوم',
              englishTarget: 'Falo português todos os dias',
              sourceThought: sourceThought(source, 'أنا أتحدث البرتغالية كل يوم', 'I speak Portuguese every day'),
              targetSentence: 'Falo português todos os dias',
              acceptableAlternatives: ['Eu falo português todos os dias'],
              wordChips: ['Falo', 'português', 'todos', 'os', 'dias', 'fala', 'falar'],
              breakdownChunks: [
                {
                  arabicText: 'Falo',
                  englishText: 'I speak',
                  sourceText: isAr ? 'أتحدث' : 'I speak',
                  targetText: 'Falo',
                  role: 'subject',
                  explanation: 'falar conjugated in 1st person (-o)'
                },
                {
                  arabicText: 'português',
                  englishText: 'Portuguese',
                  sourceText: isAr ? 'البرتغالية' : 'Portuguese',
                  targetText: 'português',
                  role: 'object',
                  explanation: 'Language name with circumflex accent'
                },
                {
                  arabicText: 'todos os dias',
                  englishText: 'every day',
                  sourceText: isAr ? 'كل يوم' : 'every day',
                  targetText: 'todos os dias',
                  role: 'modifier',
                  explanation: 'Time phrase'
                }
              ],
              habitHint: isAr
                ? 'português يُكتب بنبرة دائرة (ê).'
                : 'português takes a circumflex accent on ê.'
            },
            {
              id: 'pt-ex-1-3-2',
              arabicThought: 'نحن نعيش في لشبونة وندرس هناك',
              englishTarget: 'Moramos em Lisboa e estudamos lá',
              sourceThought: sourceThought(source, 'نحن نعيش في لشبونة وندرس هناك', 'We live in Lisbon and study there'),
              targetSentence: 'Moramos em Lisboa e estudamos lá',
              acceptableAlternatives: ['Nós moramos em Lisboa e estudamos lá'],
              wordChips: ['Moramos', 'em', 'Lisboa', 'e', 'estudamos', 'lá', 'mora'],
              breakdownChunks: [
                {
                  arabicText: 'Moramos',
                  englishText: 'We live',
                  sourceText: isAr ? 'نعيش' : 'We live',
                  targetText: 'Moramos',
                  role: 'subject',
                  explanation: 'morar conjugated in 1st person plural (-amos)'
                },
                {
                  arabicText: 'em Lisboa',
                  englishText: 'in Lisbon',
                  sourceText: isAr ? 'في لشبونة' : 'in Lisbon',
                  targetText: 'em Lisboa',
                  role: 'modifier',
                  explanation: 'Preposition em before city names'
                },
                {
                  arabicText: 'e estudamos lá',
                  englishText: 'and study there',
                  sourceText: isAr ? 'وندريس هناك' : 'and study there',
                  targetText: 'e estudamos lá',
                  role: 'connector',
                  explanation: 'estudar in 1st person plural + adverb lá'
                }
              ],
              habitHint: isAr
                ? 'قبل المدن نستخدم حرف الجر em: em Lisboa.'
                : 'Use preposition em before cities: em Lisboa.'
            },
            {
              id: 'pt-ex-1-3-3',
              arabicThought: 'هم يعملون في مكتب كبير بوسط المدينة',
              englishTarget: 'Eles trabalham num grande escritório no centro',
              sourceThought: sourceThought(source, 'هم يعملون في مكتب كبير بوسط المدينة', 'They work in a big office downtown'),
              targetSentence: 'Eles trabalham num grande escritório no centro',
              acceptableAlternatives: ['Eles trabalham em um grande escritório no centro'],
              wordChips: ['Eles', 'trabalham', 'num', 'grande', 'escritório', 'no', 'centro', 'trabalhar'],
              breakdownChunks: [
                {
                  arabicText: 'Eles trabalham',
                  englishText: 'They work',
                  sourceText: isAr ? 'هم يعملون' : 'They work',
                  targetText: 'Eles trabalham',
                  role: 'subject',
                  explanation: 'trabalhar in 3rd person plural (-am)'
                },
                {
                  arabicText: 'num grande escritório',
                  englishText: 'in a big office',
                  sourceText: isAr ? 'في مكتب كبير' : 'in a big office',
                  targetText: 'num grande escritório',
                  role: 'modifier',
                  explanation: 'contraction em + um -> num'
                },
                {
                  arabicText: 'no centro',
                  englishText: 'downtown',
                  sourceText: isAr ? 'في وسط المدينة' : 'downtown',
                  targetText: 'no centro',
                  role: 'modifier',
                  explanation: 'contraction em + o -> no'
                }
              ],
              habitHint: isAr
                ? 'الدمج em + um يصبح num، والجمع الغائب ينتهي بـ -am: trabalham.'
                : 'em + um contracts to num, and 3rd person plural ends in -am: trabalham.'
            }
          ]
        },
        {
          id: 'pt-p1-l4',
          phaseId: 1,
          phaseTitle: 'Fundamentos do Português · Portuguese Foundations',
          phaseLevel: 'A1 – A2',
          number: 4,
          title: 'Negation with não',
          titleAr: 'النفي باستخدام não',
          transferConcept: isAr
            ? 'النفي في البرتغالية يتم بوضع كلمة não قبل الفعل مباشرة: Não falo espanhol (لا أتحدث الإسبانية).'
            : 'Portuguese negation places não directly before the verb: Não falo espanhol.',
          transferConceptAr: 'ضع não قبل الفعل المصرف مباشرة لنفي الجملة.',
          weakSpotTag: 'negation-pattern',
          exercises: [
            {
              id: 'pt-ex-1-4-1',
              arabicThought: 'أنا لا أتحدث الإسبانية',
              englishTarget: 'Não falo espanhol',
              sourceThought: sourceThought(source, 'أنا لا أتحدث الإسبانية', 'I do not speak Spanish'),
              targetSentence: 'Não falo espanhol',
              acceptableAlternatives: ['Eu não falo espanhol'],
              wordChips: ['Não', 'falo', 'espanhol', 'nunca', 'fala'],
              breakdownChunks: [
                {
                  arabicText: 'Não falo',
                  englishText: 'I do not speak',
                  sourceText: isAr ? 'لا أتحدث' : 'I do not speak',
                  targetText: 'Não falo',
                  role: 'subject',
                  explanation: 'Negation não before verb falo'
                },
                {
                  arabicText: 'espanhol',
                  englishText: 'Spanish',
                  sourceText: isAr ? 'الإسبانية' : 'Spanish',
                  targetText: 'espanhol',
                  role: 'object',
                  explanation: 'Language object'
                }
              ],
              habitHint: isAr
                ? 'ضع não قبل الفعل مباشرة: Não falo.'
                : 'Place não directly before the verb.'
            },
            {
              id: 'pt-ex-1-4-2',
              arabicThought: 'هو ليس متعباً اليوم',
              englishTarget: 'Ele não está cansado hoje',
              sourceThought: sourceThought(source, 'هو ليس متعباً اليوم', 'He is not tired today'),
              targetSentence: 'Ele não está cansado hoje',
              acceptableAlternatives: ['Não está cansado hoje'],
              wordChips: ['Ele', 'não', 'está', 'cansado', 'hoje', 'é'],
              breakdownChunks: [
                {
                  arabicText: 'Ele não está',
                  englishText: 'He is not',
                  sourceText: isAr ? 'هو ليس' : 'He is not',
                  targetText: 'Ele não está',
                  role: 'subject',
                  explanation: 'não + verb estar (temporary state)'
                },
                {
                  arabicText: 'cansado hoje',
                  englishText: 'tired today',
                  sourceText: isAr ? 'متعباً اليوم' : 'tired today',
                  targetText: 'cansado hoje',
                  role: 'modifier',
                  explanation: 'Adjective + time adverb'
                }
              ],
              habitHint: isAr
                ? 'التعب حالة مؤقتة لذا نستخدم está وليس é.'
                : 'Tiredness is temporary, so use está (from estar) not é.'
            },
            {
              id: 'pt-ex-1-4-3',
              arabicThought: 'ليس لدينا سيارة في هذه المدينة',
              englishTarget: 'Não temos um carro nesta cidade',
              sourceThought: sourceThought(source, 'ليس لدينا سيارة في هذه المدينة', 'We do not have a car in this city'),
              targetSentence: 'Não temos um carro nesta cidade',
              acceptableAlternatives: ['Nós não temos um carro nesta cidade'],
              wordChips: ['Não', 'temos', 'um', 'carro', 'nesta', 'cidade', 'em'],
              breakdownChunks: [
                {
                  arabicText: 'Não temos',
                  englishText: 'We do not have',
                  sourceText: isAr ? 'ليس لدينا' : 'We do not have',
                  targetText: 'Não temos',
                  role: 'subject',
                  explanation: 'Negation não + ter in 1st person plural'
                },
                {
                  arabicText: 'um carro',
                  englishText: 'a car',
                  sourceText: isAr ? 'سيارة' : 'a car',
                  targetText: 'um carro',
                  role: 'object',
                  explanation: 'Object phrase'
                },
                {
                  arabicText: 'nesta cidade',
                  englishText: 'in this city',
                  sourceText: isAr ? 'في هذه المدينة' : 'in this city',
                  targetText: 'nesta cidade',
                  role: 'modifier',
                  explanation: 'contraction em + esta -> nesta'
                }
              ],
              habitHint: isAr
                ? 'الدمج em + esta يصبح nesta.'
                : 'em + esta contracts to nesta.'
            }
          ]
        },
        {
          id: 'pt-p1-l5',
          phaseId: 1,
          phaseTitle: 'Fundamentos do Português · Portuguese Foundations',
          phaseLevel: 'A1 – A2',
          number: 5,
          title: 'Question Formation & Interrogatives',
          titleAr: 'صياغة الأسئلة وأدوات الاستفهام (Onde, Como, Por que)',
          transferConcept: isAr
            ? 'تُصاغ الأسئلة بالنبرة أو الأدوات: Onde (أين)، Como (كيف)، Por que (لماذا).'
            : 'Questions use rising intonation or question words: Onde (where), Como (how), Por que (why).',
          transferConceptAr: 'ارفع نبرة الصوت أو استخدم أدوات الاستفهام Onde/Como/Por que.',
          weakSpotTag: 'question-formation',
          exercises: [
            {
              id: 'pt-ex-1-5-1',
              arabicThought: 'أين تسكن أنت؟',
              englishTarget: 'Onde você mora?',
              sourceThought: sourceThought(source, 'أين تسكن أنت؟', 'Where do you live?'),
              targetSentence: 'Onde você mora?',
              acceptableAlternatives: ['Onde moras?', 'Você mora onde?'],
              wordChips: ['Onde', 'você', 'mora', '?', 'moras'],
              breakdownChunks: [
                {
                  arabicText: 'Onde',
                  englishText: 'Where',
                  sourceText: isAr ? 'أين' : 'Where',
                  targetText: 'Onde',
                  role: 'connector',
                  explanation: 'Interrogative adverb'
                },
                {
                  arabicText: 'você mora',
                  englishText: 'you live',
                  sourceText: isAr ? 'تسكن أنت' : 'you live',
                  targetText: 'você mora',
                  role: 'verb',
                  explanation: 'você + 3rd person singular verb form mora'
                }
              ],
              habitHint: isAr
                ? 'você يرافقه الفعل في صيغة المفرد الغائب: você mora.'
                : 'você takes 3rd person singular verb forms: você mora.'
            },
            {
              id: 'pt-ex-1-5-2',
              arabicThought: 'ما اسمك؟ (كيف تسمى؟)',
              englishTarget: 'Como você se chama?',
              sourceThought: sourceThought(source, 'ما اسمك؟ (كيف تسمى؟)', 'What is your name?'),
              targetSentence: 'Como você se chama?',
              acceptableAlternatives: ['Como te chamas?'],
              wordChips: ['Como', 'você', 'se', 'chama', '?', 'me'],
              breakdownChunks: [
                {
                  arabicText: 'Como',
                  englishText: 'How',
                  sourceText: isAr ? 'كيف' : 'How',
                  targetText: 'Como',
                  role: 'connector',
                  explanation: 'Interrogative adverb'
                },
                {
                  arabicText: 'você se chama',
                  englishText: 'are you called',
                  sourceText: isAr ? 'تسمى' : 'are you called',
                  targetText: 'você se chama',
                  role: 'verb',
                  explanation: 'Reflexive verb chamar-se with você'
                }
              ],
              habitHint: isAr
                ? 'الضمير المنعكس se يوضع قبل الفعل مع você.'
                : 'Reflexive pronoun se precedes the verb with você.'
            },
            {
              id: 'pt-ex-1-5-3',
              arabicThought: 'لماذا تدرس اللغة البرتغالية؟',
              englishTarget: 'Por que você estuda português?',
              sourceThought: sourceThought(source, 'لماذا تدرس اللغة البرتغالية؟', 'Why do you study Portuguese?'),
              targetSentence: 'Por que você estuda português?',
              acceptableAlternatives: ['Por que estuda português?'],
              wordChips: ['Por que', 'você', 'estuda', 'português', '?', 'porque'],
              breakdownChunks: [
                {
                  arabicText: 'Por que',
                  englishText: 'Why',
                  sourceText: isAr ? 'لماذا' : 'Why',
                  targetText: 'Por que',
                  role: 'connector',
                  explanation: 'Interrogative phrase Por que (separated)'
                },
                {
                  arabicText: 'você estuda português',
                  englishText: 'do you study Portuguese',
                  sourceText: isAr ? 'تدرس البرتغالية' : 'do you study Portuguese',
                  targetText: 'você estuda português',
                  role: 'connector',
                  explanation: 'você + estuda + language'
                }
              ],
              habitHint: isAr
                ? 'في السؤال نكتب Por que منفصلة (وفي الجواب porque متصلة).'
                : 'In questions, write Por que separated (and porque together in answers).'
            }
          ]
        }
      ]
    },
    {
      id: 2,
      title: 'Transição Intermediária · Intermediate Portuguese Dynamics',
      titleAr: 'المرحلة الانتقالية: الماضي والضمائر والمستقبل',
      level: 'A2 – B1',
      tagline: isAr
        ? 'أتقن الماضي البسيط (pretérito perfeito)، الوصف (imperfeito)، الضمائر المباشرة وغير المباشرة، والمستقبل.'
        : 'Master Pretérito Perfeito, Imperfeito, direct/indirect pronouns, and future tenses.',
      lessons: [
        {
          id: 'pt-p2-l1',
          phaseId: 2,
          phaseTitle: 'Transição Intermediária · Intermediate Portuguese Dynamics',
          phaseLevel: 'A2 – B1',
          number: 1,
          title: 'Past Tense with Pretérito Perfeito',
          titleAr: 'الماضي البسيط المكتمل (Pretérito Perfeito)',
          transferConcept: isAr
            ? 'يُعبر Pretérito Perfeito عن الأحداث المكتملة في الماضي: comprei um livro / fomos ao cinema.'
            : 'Pretérito Perfeito expresses completed past events: comprei um livro / fomos ao cinema.',
          transferConceptAr: 'استخدم Pretérito Perfeito لبيان حدث مكتمل في الماضي.',
          weakSpotTag: 'preterito-perfeito',
          exercises: [
            {
              id: 'pt-ex-2-1-1',
              arabicThought: 'اشتريت كتاباً جديداً أمس',
              englishTarget: 'Comprei um livro novo ontem',
              sourceThought: sourceThought(source, 'اشتريت كتاباً جديداً أمس', 'I bought a new book yesterday'),
              targetSentence: 'Comprei um livro novo ontem',
              acceptableAlternatives: ['Ontem comprei um livro novo'],
              wordChips: ['Comprei', 'um', 'livro', 'novo', 'ontem', 'compro'],
              breakdownChunks: [
                {
                  arabicText: 'Comprei',
                  englishText: 'I bought',
                  sourceText: isAr ? 'اشتريت' : 'I bought',
                  targetText: 'Comprei',
                  role: 'subject',
                  explanation: 'comprar in pretérito perfeito 1st person (-ei)'
                },
                {
                  arabicText: 'um livro novo',
                  englishText: 'a new book',
                  sourceText: isAr ? 'كتاباً جديداً' : 'a new book',
                  targetText: 'um livro novo',
                  role: 'object',
                  explanation: 'Masculine object phrase'
                },
                {
                  arabicText: 'ontem',
                  englishText: 'yesterday',
                  sourceText: isAr ? 'أمس' : 'yesterday',
                  targetText: 'ontem',
                  role: 'modifier',
                  explanation: 'Time adverb'
                }
              ],
              habitHint: isAr
                ? 'نهاية المتكلم في الماضي البسيط لأفعال -ar هي -ei: Comprei.'
                : 'First-person past ending for -ar verbs is -ei: Comprei.'
            },
            {
              id: 'pt-ex-2-1-2',
              arabicThought: 'هو أنهى عمله في الوقت المناسب',
              englishTarget: 'Ele terminou o seu trabalho a tempo',
              sourceThought: sourceThought(source, 'هو أنهى عمله في الوقت المناسب', 'He finished his work on time'),
              targetSentence: 'Ele terminou o seu trabalho a tempo',
              acceptableAlternatives: ['Ele terminou o seu trabalho a tempo'],
              wordChips: ['Ele', 'terminou', 'o', 'seu', 'trabalho', 'a', 'tempo', 'termina'],
              breakdownChunks: [
                {
                  arabicText: 'Ele terminou',
                  englishText: 'He finished',
                  sourceText: isAr ? 'هو أنهى' : 'He finished',
                  targetText: 'Ele terminou',
                  role: 'subject',
                  explanation: 'terminar in 3rd person past (-ou)'
                },
                {
                  arabicText: 'o seu trabalho',
                  englishText: 'his work',
                  sourceText: isAr ? 'عمله' : 'his work',
                  targetText: 'o seu trabalho',
                  role: 'object',
                  explanation: 'Possessive phrase with article'
                },
                {
                  arabicText: 'a tempo',
                  englishText: 'on time',
                  sourceText: isAr ? 'في الوقت المناسب' : 'on time',
                  targetText: 'a tempo',
                  role: 'modifier',
                  explanation: 'Time expression'
                }
              ],
              habitHint: isAr
                ? 'نهاية الغائب في الماضي هي -ou: terminou.'
                : 'Third-person singular past ending is -ou: terminou.'
            },
            {
              id: 'pt-ex-2-1-3',
              arabicThought: 'ذهبت إلى السينما مع أصدقائي',
              englishTarget: 'Fui ao cinema com os meus amigos',
              sourceThought: sourceThought(source, 'ذهبت إلى السينما مع أصدقائي', 'I went to the cinema with my friends'),
              targetSentence: 'Fui ao cinema com os meus amigos',
              acceptableAlternatives: ['Eu fui ao cinema com os meus amigos'],
              wordChips: ['Fui', 'ao', 'cinema', 'com', 'os', 'meus', 'amigos', 'vou'],
              breakdownChunks: [
                {
                  arabicText: 'Fui',
                  englishText: 'I went',
                  sourceText: isAr ? 'ذهبت' : 'I went',
                  targetText: 'Fui',
                  role: 'subject',
                  explanation: 'ir in pretérito perfeito 1st person'
                },
                {
                  arabicText: 'ao cinema',
                  englishText: 'to the cinema',
                  sourceText: isAr ? 'إلى السينما' : 'to the cinema',
                  targetText: 'ao cinema',
                  role: 'modifier',
                  explanation: 'contraction a + o -> ao'
                },
                {
                  arabicText: 'com os meus amigos',
                  englishText: 'with my friends',
                  sourceText: isAr ? 'مع أصدقائي' : 'with my friends',
                  targetText: 'com os meus amigos',
                  role: 'modifier',
                  explanation: 'com + article os + possessive meus + amigos'
                }
              ],
              habitHint: isAr
                ? 'ماضي فعل الذهاب ir في المتكلم هو Fui.'
                : 'First-person past form of ir is Fui.'
            }
          ]
        },
        {
          id: 'pt-p2-l2',
          phaseId: 2,
          phaseTitle: 'Transição Intermediária · Intermediate Portuguese Dynamics',
          phaseLevel: 'A2 – B1',
          number: 2,
          title: 'Imperfect Tense (Pretérito Imperfeito)',
          titleAr: 'زمن الوصف والعادات (Pretérito Imperfeito)',
          transferConcept: isAr
            ? 'تستخدم Imperfeito للوصف والعادات والظروف المستمرة في الماضي: Quando eu era jovem, jogava muito.'
            : 'Use Imperfeito for descriptions, past habits, and ongoing background actions: Quando eu era jovem, jogava muito.',
          transferConceptAr: 'Imperfeito للوصف والعادات المستمرة في الماضي.',
          weakSpotTag: 'imperfeito-usage',
          exercises: [
            {
              id: 'pt-ex-2-2-1',
              arabicThought: 'عندما كنت صغيراً، كنت ألعاب كثيراً',
              englishTarget: 'Quando eu era jovem, jogava muito',
              sourceThought: sourceThought(source, 'عندما كنت صغيراً، كنت ألعاب كثيراً', 'When I was young, I used to play a lot'),
              targetSentence: 'Quando eu era jovem, jogava muito',
              acceptableAlternatives: ['Jogava muito quando eu era jovem'],
              wordChips: ['Quando', 'eu', 'era', 'jovem', 'jogava', 'muito', 'fui'],
              breakdownChunks: [
                {
                  arabicText: 'Quando eu era jovem',
                  englishText: 'When I was young',
                  sourceText: isAr ? 'عندما كنت صغيراً' : 'When I was young',
                  targetText: 'Quando eu era jovem',
                  role: 'connector',
                  explanation: 'imperfeito of ser (era) for past state'
                },
                {
                  arabicText: 'jogava muito',
                  englishText: 'I used to play a lot',
                  sourceText: isAr ? 'كنت ألعاب كثيراً' : 'I used to play a lot',
                  targetText: 'jogava muito',
                  role: 'connector',
                  explanation: 'imperfeito of jogar (jogava) for past habit'
                }
              ],
              habitHint: isAr
                ? 'للوصف والعادات في الماضي استخدم Imperfeito: era, jogava.'
                : 'For past states and habits, use Imperfeito.'
            },
            {
              id: 'pt-ex-2-2-2',
              arabicThought: 'كان الطقس جميلاً عندما خرجنا',
              englishTarget: 'Fazia bom tempo quando saímos',
              sourceThought: sourceThought(source, 'كان الطقس جميلاً عندما خرجنا', 'The weather was good when we went out'),
              targetSentence: 'Fazia bom tempo quando saímos',
              acceptableAlternatives: ['Quando saímos, fazia bom tempo'],
              wordChips: ['Fazia', 'bom', 'tempo', 'quando', 'saímos', 'fez'],
              breakdownChunks: [
                {
                  arabicText: 'Fazia bom tempo',
                  englishText: 'The weather was good',
                  sourceText: isAr ? 'كان الطقس جميلاً' : 'The weather was good',
                  targetText: 'Fazia bom tempo',
                  role: 'connector',
                  explanation: 'imperfeito of fazer for weather description'
                },
                {
                  arabicText: 'quando saímos',
                  englishText: 'when we went out',
                  sourceText: isAr ? 'عندما خرجنا' : 'when we went out',
                  targetText: 'quando saímos',
                  role: 'connector',
                  explanation: 'pretérito perfeito of sair for completed event'
                }
              ],
              habitHint: isAr
                ? 'الوصف بـ Imperfeito (fazia) والحدث القاطع بـ Perfeito (saímos).'
                : 'Background description uses Imperfeito; completed event uses Perfeito.'
            },
            {
              id: 'pt-ex-2-2-3',
              arabicThought: 'بينما كنت أدرس، اتصل بي صديقي',
              englishTarget: 'Enquanto eu estudava, o meu amigo ligou-me',
              sourceThought: sourceThought(source, 'بينما كنت أدرس، اتصل بي صديقي', 'While I was studying, my friend called me'),
              targetSentence: 'Enquanto eu estudava, o meu amigo ligou-me',
              acceptableAlternatives: ['Enquanto eu estudava, o meu amigo me ligou'],
              wordChips: ['Enquanto', 'eu', 'estudava', 'o', 'meu', 'amigo', 'ligou-me', 'estudei' /* distractor: pretérito perfeito vs imperfeito */],
              breakdownChunks: [
                {
                  arabicText: 'Enquanto eu estudava',
                  englishText: 'While I was studying',
                  sourceText: isAr ? 'بينما كنت أدرس' : 'While I was studying',
                  targetText: 'Enquanto eu estudava',
                  role: 'connector',
                  explanation: 'enquanto + imperfeito for ongoing past action'
                },
                {
                  arabicText: 'o meu amigo ligou-me',
                  englishText: 'my friend called me',
                  sourceText: isAr ? 'اتصل بي صديقي' : 'my friend called me',
                  targetText: 'o meu amigo ligou-me',
                  role: 'connector',
                  explanation: 'pretérito perfeito for interrupting event'
                }
              ],
              habitHint: isAr
                ? 'رابط الزمان enquanto يأخذ Imperfeito للحدث المستمر.'
                : 'Time connector enquanto takes Imperfeito for ongoing past actions.'
            }
          ]
        },
        {
          id: 'pt-p2-l3',
          phaseId: 2,
          phaseTitle: 'Transição Intermediária · Intermediate Portuguese Dynamics',
          phaseLevel: 'A2 – B1',
          number: 3,
          title: 'Direct & Indirect Object Pronouns',
          titleAr: 'ضمائر المفعول المباشر وغير المباشر (o/a/os/as, lhe/lhes)',
          transferConcept: isAr
            ? 'ضمير المفعول يوضع قبل الفعل أو بعده بشريطة حسب اللهجة والإعراب: Vejo-o / Eu o vejo.'
            : 'Object pronouns precede or follow verbs with hyphens depending on register: Vejo-o / Eu o vejo.',
          transferConceptAr: 'استخدم الضمائر المباشرة o/a والغير مباشرة lhe مع الأفعال.',
          weakSpotTag: 'object-pronouns',
          exercises: [
            {
              id: 'pt-ex-2-3-1',
              arabicThought: 'أنا أراه كل صباح في القطار',
              englishTarget: 'Vejo-o todas as manhãs no comboio',
              sourceThought: sourceThought(source, 'أنا أراه كل صباح في القطار', 'I see him every morning on the train'),
              targetSentence: 'Vejo-o todas as manhãs no comboio',
              acceptableAlternatives: ['Eu o vejo todas as manhãs no trem'],
              wordChips: ['Vejo-o', 'todas', 'as', 'manhãs', 'no', 'comboio', 'lhe'],
              breakdownChunks: [
                {
                  arabicText: 'Vejo-o',
                  englishText: 'I see him',
                  sourceText: isAr ? 'أراه' : 'I see him',
                  targetText: 'Vejo-o',
                  role: 'subject',
                  explanation: 'ver + direct object pronoun -o with hyphen'
                },
                {
                  arabicText: 'todas as manhãs no comboio',
                  englishText: 'every morning on the train',
                  sourceText: isAr ? 'كل صباح في القطار' : 'every morning on the train',
                  targetText: 'todas as manhãs no comboio',
                  role: 'modifier',
                  explanation: 'Time and location phrase'
                }
              ],
              habitHint: isAr
                ? 'في بداية الجملة يوضع الضمير المباشر بعد الفعل بشريطة: Vejo-o.'
                : 'At sentence start, direct pronoun attaches with a hyphen: Vejo-o.'
            },
            {
              id: 'pt-ex-2-3-2',
              arabicThought: 'تحدثت إليه البارحة بخصوص المشروع',
              englishTarget: 'Falei-lhe ontem sobre o projeto',
              sourceThought: sourceThought(source, 'تحدثت إليه البارحة بخصوص المشروع', 'I spoke to him yesterday about the project'),
              targetSentence: 'Falei-lhe ontem sobre o projeto',
              acceptableAlternatives: ['Falei com ele ontem sobre o projeto'],
              wordChips: ['Falei-lhe', 'ontem', 'sobre', 'o', 'projeto', 'o'],
              breakdownChunks: [
                {
                  arabicText: 'Falei-lhe',
                  englishText: 'I spoke to him',
                  sourceText: isAr ? 'تحدثت إليه' : 'I spoke to him',
                  targetText: 'Falei-lhe',
                  role: 'subject',
                  explanation: 'falar + indirect pronoun -lhe'
                },
                {
                  arabicText: 'ontem sobre o projeto',
                  englishText: 'yesterday about the project',
                  sourceText: isAr ? 'أمس بخصوص المشروع' : 'yesterday about the project',
                  targetText: 'ontem sobre o projeto',
                  role: 'modifier',
                  explanation: 'Time adverb + prepositional phrase'
                }
              ],
              habitHint: isAr
                ? 'الضمير غير المباشر للمفرد هو lhe (إليه/إليها).'
                : 'Indirect singular pronoun is lhe (to him/her).'
            },
            {
              id: 'pt-ex-2-3-3',
              arabicThought: 'أرسلت لهم التقرير بالبريد الإلكتروني',
              englishTarget: 'Enviei-lhes o relatório por e-mail',
              sourceThought: sourceThought(source, 'أرسلت لهم التقرير بالبريد الإلكتروني', 'I sent them the report by email'),
              targetSentence: 'Enviei-lhes o relatório por e-mail',
              acceptableAlternatives: ['Mandei-lhes o relatório por e-mail'],
              wordChips: ['Enviei-lhes', 'o', 'relatório', 'por', 'e-mail', 'lhes'],
              breakdownChunks: [
                {
                  arabicText: 'Enviei-lhes',
                  englishText: 'I sent them',
                  sourceText: isAr ? 'أرسلت لهم' : 'I sent them',
                  targetText: 'Enviei-lhes',
                  role: 'subject',
                  explanation: 'enviar + indirect plural pronoun -lhes'
                },
                {
                  arabicText: 'o relatório por e-mail',
                  englishText: 'the report by email',
                  sourceText: isAr ? 'التقرير بالبريد الإلكتروني' : 'the report by email',
                  targetText: 'o relatório por e-mail',
                  role: 'object',
                  explanation: 'Direct object phrase + means'
                }
              ],
              habitHint: isAr
                ? 'الضمير غير المباشر للجمع هو lhes (لهم/لهن).'
                : 'Indirect plural pronoun is lhes (to them).'
            }
          ]
        },
        {
          id: 'pt-p2-l4',
          phaseId: 2,
          phaseTitle: 'Transição Intermediária · Intermediate Portuguese Dynamics',
          phaseLevel: 'A2 – B1',
          number: 4,
          title: 'Future Tenses: Ir + Infinitive & Futuro do Presente',
          titleAr: 'أزمنة المستقبل: ir + المصدر والمستقبل البسيط',
          transferConcept: isAr
            ? 'المستقبل القريب الشائع جداً يتكون من ir + المصدر: vou ligar. والمستقبل البسيط يضيف النهاية للمصدر: ligarei.'
            : 'Informal future uses ir + infinitive (vou ligar). Formal future adds endings to infinitive (ligarei).',
          transferConceptAr: 'vou + المصدر للمستقبل القريب، والنهايات المضافة للمصدر للمستقبل البسيط.',
          weakSpotTag: 'future-tenses',
          exercises: [
            {
              id: 'pt-ex-2-4-1',
              arabicThought: 'سأتصل بك غداً صباحاً',
              englishTarget: 'Vou ligar para você amanhã de manhã',
              sourceThought: sourceThought(source, 'سأتصل بك غداً صباحاً', 'I am going to call you tomorrow morning'),
              targetSentence: 'Vou ligar para você amanhã de manhã',
              acceptableAlternatives: ['Ligar-lhe-ei amanhã de manhã'],
              wordChips: ['Vou', 'ligar', 'para', 'você', 'amanhã', 'de', 'manhã', 'ligo'],
              breakdownChunks: [
                {
                  arabicText: 'Vou ligar para você',
                  englishText: 'I am going to call you',
                  sourceText: isAr ? 'سأتصل بك' : 'I am going to call you',
                  targetText: 'Vou ligar para você',
                  role: 'subject',
                  explanation: 'ir (vou) + infinitive ligar + preposition'
                },
                {
                  arabicText: 'amanhã de manhã',
                  englishText: 'tomorrow morning',
                  sourceText: isAr ? 'غداً صباحاً' : 'tomorrow morning',
                  targetText: 'amanhã de manhã',
                  role: 'modifier',
                  explanation: 'Time phrase'
                }
              ],
              habitHint: isAr
                ? 'تركيب ir + المصدر هو الأكثر شيوعاً في المحادثة البرتغالية.'
                : 'The ir + infinitive construction is most common in spoken Portuguese.'
            },
            {
              id: 'pt-ex-2-4-2',
              arabicThought: 'سأكون هناك في تمام الساعة العاشرة',
              englishTarget: 'Estarei lá às dez horas em ponto',
              sourceThought: sourceThought(source, 'سأكون هناك في تمام الساعة العاشرة', 'I will be there at ten o’clock sharp'),
              targetSentence: 'Estarei lá às dez horas em ponto',
              acceptableAlternatives: ['Vou estar lá às dez horas em ponto'],
              wordChips: ['Estarei', 'lá', 'às', 'dez', 'horas', 'em', 'ponto', 'estou'],
              breakdownChunks: [
                {
                  arabicText: 'Estarei',
                  englishText: 'I will be',
                  sourceText: isAr ? 'سأكون' : 'I will be',
                  targetText: 'Estarei',
                  role: 'subject',
                  explanation: 'estar in futuro do presente (-ei)'
                },
                {
                  arabicText: 'lá às dez horas em ponto',
                  englishText: 'there at ten o’clock sharp',
                  sourceText: isAr ? 'هناك في تمام العاشرة' : 'there at ten o’clock sharp',
                  targetText: 'lá às dez horas em ponto',
                  role: 'modifier',
                  explanation: 'Adverb + articulated time phrase'
                }
              ],
              habitHint: isAr
                ? 'المستقبل البسيط من estar في المتكلم هو Estarei.'
                : 'Futuro do presente 1st person form of estar is Estarei.'
            },
            {
              id: 'pt-ex-2-4-3',
              arabicThought: 'السنة القادمة سنزور البرتغال',
              englishTarget: 'No próximo ano vamos visitar Portugal',
              sourceThought: sourceThought(source, 'السنة القادمة سنزور البرتغال', 'Next year we are going to visit Portugal'),
              targetSentence: 'No próximo ano vamos visitar Portugal',
              acceptableAlternatives: ['No ano que vem visitaremos Portugal'],
              wordChips: ['No', 'próximo', 'ano', 'vamos', 'visitar', 'Portugal', 'visitamos'],
              breakdownChunks: [
                {
                  arabicText: 'No próximo ano',
                  englishText: 'Next year',
                  sourceText: isAr ? 'السنة القادمة' : 'Next year',
                  targetText: 'No próximo ano',
                  role: 'modifier',
                  explanation: 'Time expression (em + o -> no)'
                },
                {
                  arabicText: 'vamos visitar Portugal',
                  englishText: 'we are going to visit Portugal',
                  sourceText: isAr ? 'سنزور البرتغال' : 'we are going to visit Portugal',
                  targetText: 'vamos visitar Portugal',
                  role: 'connector',
                  explanation: 'ir (vamos) + infinitive visitar + country name'
                }
              ],
              habitHint: isAr
                ? 'اسم الدولة Portugal يوضع بدون أداة مع فعل visitar.'
                : 'Country name Portugal is used without article after visitar.'
            }
          ]
        },
        {
          id: 'pt-p2-l5',
          phaseId: 2,
          phaseTitle: 'Transição Intermediária · Intermediate Portuguese Dynamics',
          phaseLevel: 'A2 – B1',
          number: 5,
          title: 'Expressing Cause & Reason (porque, como, já que)',
          titleAr: 'التعبير عن السبب والعلة (porque, como, já que)',
          transferConcept: isAr
            ? 'تستخدم porque للسبب في وسط الجملة، و como عند بدء الجملة بالسبب.'
            : 'Use porque mid-sentence, and como when beginning with cause.',
          transferConceptAr: 'porque بعد الجملة الرئيسية، و como في بداية الجملة.',
          weakSpotTag: 'causal-connectors',
          exercises: [
            {
              id: 'pt-ex-2-5-1',
              arabicThought: 'أتعلم البرتغالية لأنني أعيش في البرتغال',
              englishTarget: 'Aprendo português porque moro em Portugal',
              sourceThought: sourceThought(source, 'أتعلم البرتغالية لأنني أعيش في البرتغال', 'I learn Portuguese because I live in Portugal'),
              targetSentence: 'Aprendo português porque moro em Portugal',
              acceptableAlternatives: ['Estudo português porque vivo em Portugal'],
              wordChips: ['Aprendo', 'português', 'porque', 'moro', 'em', 'Portugal', 'como'],
              breakdownChunks: [
                {
                  arabicText: 'Aprendo português',
                  englishText: 'I learn Portuguese',
                  sourceText: isAr ? 'أتعلم البرتغالية' : 'I learn Portuguese',
                  targetText: 'Aprendo português',
                  role: 'connector',
                  explanation: 'aprender present tense'
                },
                {
                  arabicText: 'porque moro em Portugal',
                  englishText: 'because I live in Portugal',
                  sourceText: isAr ? 'لأنني أعيش في البرتغال' : 'because I live in Portugal',
                  targetText: 'porque moro em Portugal',
                  role: 'connector',
                  explanation: 'Causal connector porque + clause'
                }
              ],
              habitHint: isAr
                ? 'porque متصلة في كلمة واحدة عند بيان السبب.'
                : 'porque is written as one word when giving reasons.'
            },
            {
              id: 'pt-ex-2-5-2',
              arabicThought: 'بما أنها تمطر، سنبقى في المنزل',
              englishTarget: 'Como está a chover, ficamos em casa',
              sourceThought: sourceThought(source, 'بما أنها تمطر، سنبقى في المنزل', 'Since it is raining, we stay at home'),
              targetSentence: 'Como está a chover, ficamos em casa',
              acceptableAlternatives: ['Como está chovendo, ficamos em casa'],
              wordChips: ['Como', 'está', 'a', 'chover', 'ficamos', 'em', 'casa', 'porque'],
              breakdownChunks: [
                {
                  arabicText: 'Como está a chover',
                  englishText: 'Since it is raining',
                  sourceText: isAr ? 'بما أنها تمطر' : 'Since it is raining',
                  targetText: 'Como está a chover',
                  role: 'connector',
                  explanation: 'Initial causal connector Como'
                },
                {
                  arabicText: 'ficamos em casa',
                  englishText: 'we stay at home',
                  sourceText: isAr ? 'سنبقى في المنزل' : 'we stay at home',
                  targetText: 'ficamos em casa',
                  role: 'connector',
                  explanation: 'ficar present tense + location'
                }
              ],
              habitHint: isAr
                ? 'عند بدء الجملة بالسبب استخدم Como.'
                : 'When starting a sentence with cause, use Como.'
            },
            {
              id: 'pt-ex-2-5-3',
              arabicThought: 'نفضل القطار لأنه أسرع من الحافلة',
              englishTarget: 'Preferimos o comboio porque é mais rápido do que o autocarro',
              sourceThought: sourceThought(source, 'نفضل القطار لأنه أسرع من الحافلة', 'We prefer the train because it is faster than the bus'),
              targetSentence: 'Preferimos o comboio porque é mais rápido do que o autocarro',
              acceptableAlternatives: ['Preferimos o trem porque é mais rápido do que o ônibus'],
              wordChips: ['Preferimos', 'o', 'comboio', 'porque', 'é', 'mais', 'rápido', 'do que', 'o', 'autocarro', 'muito', 'menos' /* distractor */],
              breakdownChunks: [
                {
                  arabicText: 'Preferimos o comboio',
                  englishText: 'We prefer the train',
                  sourceText: isAr ? 'نفضل القطار' : 'We prefer the train',
                  targetText: 'Preferimos o comboio',
                  role: 'connector',
                  explanation: 'preferir in 1st person plural'
                },
                {
                  arabicText: 'porque é mais rápido do que o autocarro',
                  englishText: 'because it is faster than the bus',
                  sourceText: isAr ? 'لأنه أسرع من الحافلة' : 'because it is faster than the bus',
                  targetText: 'porque é mais rápido do que o autocarro',
                  role: 'connector',
                  explanation: 'porque + comparative mais ... do que'
                }
              ],
              habitHint: isAr
                ? 'المقارنة بالزيادة: mais + صفة + do que.'
                : 'Comparative pattern in Portuguese: mais + adjective + do que.'
            }
          ]
        }
      ]
    },
    {
      id: 3,
      title: 'Domínio e Comunicação Profissional',
      titleAr: 'التمكن والتواصل المهني: الشك والشرط والأسلوب الرسمي',
      level: 'B1 – B2',
      tagline: isAr
        ? 'أتقن صيغة الشك (subjuntivo)، الشرط (condicional)، الضمائر الموصولة، والمراسلات الرسمية.'
        : 'Master Subjuntivo, Condicional for politeness, complex relative pronouns, and corporate etiquette.',
      lessons: [
        {
          id: 'pt-p3-l1',
          phaseId: 3,
          phaseTitle: 'Domínio e Comunicação Profissional',
          phaseLevel: 'B1 – B2',
          number: 1,
          title: 'Subjunctive Mood (Subjuntivo) in Necessity & Emotion',
          titleAr: 'صيغة الشك والالتزام (Subjuntivo بعد é necessário que)',
          transferConcept: isAr
            ? 'تستخدم صيغة subjuntivo بعد أفعال الشك والضرورة والمشاعر: É necessário que você venha / Estou feliz que você esteja aqui.'
            : 'Subjuntivo is required after expressions of necessity, doubt, and emotion: É necessário que você venha.',
          transferConceptAr: 'استخدم subjuntivo بعد أفعال الضرورة والمشاعر والشك.',
          weakSpotTag: 'subjunctive-mood',
          exercises: [
            {
              id: 'pt-ex-3-1-1',
              arabicThought: 'يجب أن تأتي إلى الاجتماع في الوقت المحدد',
              englishTarget: 'É necessário que você venha à reunião a tempo',
              sourceThought: sourceThought(source, 'يجب أن تأتي إلى الاجتماع في الوقت المحدد', 'It is necessary that you come to the meeting on time'),
              targetSentence: 'É necessário que você venha à reunião a tempo',
              acceptableAlternatives: ['É preciso que você venha à reunião a tempo'],
              wordChips: ['É necessário que', 'você', 'venha', 'à', 'reunião', 'a', 'tempo', 'vem'],
              breakdownChunks: [
                {
                  arabicText: 'É necessário que você venha',
                  englishText: 'It is necessary that you come',
                  sourceText: isAr ? 'يجب أن تأتي' : 'It is necessary that you come',
                  targetText: 'É necessário que você venha',
                  role: 'subject',
                  explanation: 'necessity clause triggering subjuntivo of vir (venha)'
                },
                {
                  arabicText: 'à reunião a tempo',
                  englishText: 'to the meeting on time',
                  sourceText: isAr ? 'إلى الاجتماع في الموعد' : 'to the meeting on time',
                  targetText: 'à reunião a tempo',
                  role: 'modifier',
                  explanation: 'Location + time phrase (a + a -> à)'
                }
              ],
              habitHint: isAr
                ? 'بعد É necessário que يكون الفعل في الـ subjuntivo: venha.'
                : 'After É necessário que, use subjuntivo form venha.'
            },
            {
              id: 'pt-ex-3-1-2',
              arabicThought: 'يسعدني كثيراً أن تكون هنا معنا',
              englishTarget: 'Estou muito feliz que você esteja aqui conosco',
              sourceThought: sourceThought(source, 'يسعدني كثيراً أن تكون هنا معنا', 'I am very happy that you are here with us'),
              targetSentence: 'Estou muito feliz que você esteja aqui conosco',
              acceptableAlternatives: ['Fico muito contente que esteja aqui conosco'],
              wordChips: ['Estou', 'muito', 'feliz', 'que', 'você', 'esteja', 'aqui', 'conosco', 'está'],
              breakdownChunks: [
                {
                  arabicText: 'Estou muito feliz que',
                  englishText: 'I am very happy that',
                  sourceText: isAr ? 'يسعدني كثيراً أن' : 'I am very happy that',
                  targetText: 'Estou muito feliz que',
                  role: 'connector',
                  explanation: 'Emotion triggering subjuntivo'
                },
                {
                  arabicText: 'você esteja aqui conosco',
                  englishText: 'you are here with us',
                  sourceText: isAr ? 'تكون هنا معنا' : 'you are here with us',
                  targetText: 'você esteja aqui conosco',
                  role: 'connector',
                  explanation: 'subjuntivo of estar (esteja)'
                }
              ],
              habitHint: isAr
                ? 'صيغة الـ subjuntivo لـ estar هي esteja.'
                : 'Subjuntivo of estar is esteja.'
            },
            {
              id: 'pt-ex-3-1-3',
              arabicThought: 'أريد أن تنهي هذا التقرير قبل المساء',
              englishTarget: 'Quero que você termine este relatório antes de hoje à noite',
              sourceThought: sourceThought(source, 'أريد أن تنهي هذا التقرير قبل المساء', 'I want you to finish this report before tonight'),
              targetSentence: 'Quero que você termine este relatório antes de hoje à noite',
              acceptableAlternatives: ['Quero que termine este relatório antes desta noite'],
              wordChips: ['Quero', 'que', 'você', 'termine', 'este', 'relatório', 'antes', 'de', 'hoje', 'à', 'noite', 'termina'],
              breakdownChunks: [
                {
                  arabicText: 'Quero que você termine',
                  englishText: 'I want you to finish',
                  sourceText: isAr ? 'أريد أن تنهي' : 'I want you to finish',
                  targetText: 'Quero que você termine',
                  role: 'subject',
                  explanation: 'querer que + subjuntivo of terminar (termine)'
                },
                {
                  arabicText: 'este relatório antes de hoje à noite',
                  englishText: 'this report before tonight',
                  sourceText: isAr ? 'هذا التقرير قبل المساء' : 'this report before tonight',
                  targetText: 'este relatório antes de hoje à noite',
                  role: 'object',
                  explanation: 'Object phrase'
                }
              ],
              habitHint: isAr
                ? 'فعل الرغبة querer que يتطلب subjuntivo: termine.'
                : 'querer que requires subjuntivo: termine.'
            }
          ]
        },
        {
          id: 'pt-p3-l2',
          phaseId: 3,
          phaseTitle: 'Domínio e Comunicação Profissional',
          phaseLevel: 'B1 – B2',
          number: 2,
          title: 'Conditional for Polite Requests (Condicional)',
          titleAr: 'صيغة الشرط والطلب المهذب (gostaria, poderia)',
          transferConcept: isAr
            ? 'في الطلبات المهذبة استخدم الشرط: Gostaria de um café (أود قهوة)، Poderia me ajudar? (هل يمكنك مساعدتي؟).'
            : 'For polite requests, use Condicional: Gostaria (I would like) or Poderia (Could you).',
          transferConceptAr: 'استخدم Condicional للطلب المهذب لتجنب الأسلوب المباشر.',
          weakSpotTag: 'polite-requests',
          exercises: [
            {
              id: 'pt-ex-3-2-1',
              arabicThought: 'أود الحصول على فنجان قهوة لو سمحت',
              englishTarget: 'Gostaria de uma chávena de café por favor',
              sourceThought: sourceThought(source, 'أود الحصول على فنجان قهوة لو سمحت', 'I would like a cup of coffee please'),
              targetSentence: 'Gostaria de uma chávena de café por favor',
              acceptableAlternatives: ['Gostaria de um café por favor', 'Gostaria de uma xícara de café por favor'],
              wordChips: ['Gostaria', 'de', 'uma', 'chávena', 'de', 'café', 'por', 'favor', 'quero'],
              breakdownChunks: [
                {
                  arabicText: 'Gostaria de',
                  englishText: 'I would like',
                  sourceText: isAr ? 'أود' : 'I would like',
                  targetText: 'Gostaria de',
                  role: 'subject',
                  explanation: 'Condicional of gostar de for polite request'
                },
                {
                  arabicText: 'uma chávena de café por favor',
                  englishText: 'a cup of coffee please',
                  sourceText: isAr ? 'فنجان قهوة لو سمحت' : 'a cup of coffee please',
                  targetText: 'uma chávena de café por favor',
                  role: 'object',
                  explanation: 'Object phrase + politeness marker'
                }
              ],
              habitHint: isAr
                ? 'استخدم Gostaria de بدلاً من Quero للطلب بأسلوب مهذب.'
                : 'Use Gostaria de instead of Quero for polite requests.'
            },
            {
              id: 'pt-ex-3-2-2',
              arabicThought: 'هل يمكنك مساعدتي في هذا الملف؟',
              englishTarget: 'Poderia me ajudar com este dossier?',
              sourceThought: sourceThought(source, 'هل يمكنك مساعدتي في هذا الملف؟', 'Could you help me with this file?'),
              targetSentence: 'Poderia me ajudar com este dossier?',
              acceptableAlternatives: ['Poderia ajudar-me com este arquivo?'],
              wordChips: ['Poderia', 'me', 'ajudar', 'com', 'este', 'dossier', '?', 'pode'],
              breakdownChunks: [
                {
                  arabicText: 'Poderia me ajudar',
                  englishText: 'Could you help me',
                  sourceText: isAr ? 'هل يمكنك مساعدتي' : 'Could you help me',
                  targetText: 'Poderia me ajudar',
                  role: 'verb',
                  explanation: 'Condicional of poder (poderia) + pronoun me + infinitive'
                },
                {
                  arabicText: 'com este dossier',
                  englishText: 'with this file',
                  sourceText: isAr ? 'في هذا الملف' : 'with this file',
                  targetText: 'com este dossier',
                  role: 'modifier',
                  explanation: 'Preposition com + demonstrative + noun'
                }
              ],
              habitHint: isAr
                ? 'Poderia هي الصيغة البرتغالية المعتمدة للطلب المهذب.'
                : 'Poderia is the formal polite conditional form.'
            },
            {
              id: 'pt-ex-3-2-3',
              arabicThought: 'أفضل أن نلتقي الأسبوع القادم',
              englishTarget: 'Preferiria que nos encontrássemos na próxima semana',
              sourceThought: sourceThought(source, 'أفضل أن نلتقي الأسبوع القادم', 'I would prefer that we meet next week'),
              targetSentence: 'Preferiria que nos encontrássemos na próxima semana',
              acceptableAlternatives: ['Gostaria mais que nos encontrássemos na próxima semana'],
              wordChips: ['Preferiria', 'que', 'nos', 'encontrássemos', 'na', 'próxima', 'semana', 'hoje'],
              breakdownChunks: [
                {
                  arabicText: 'Preferiria que',
                  englishText: 'I would prefer that',
                  sourceText: isAr ? 'أفضل أن' : 'I would prefer that',
                  targetText: 'Preferiria que',
                  role: 'subject',
                  explanation: 'Condicional of preferir + que'
                },
                {
                  arabicText: 'nos encontrássemos na próxima semana',
                  englishText: 'we meet next week',
                  sourceText: isAr ? 'نلتقي الأسبوع القادم' : 'we meet next week',
                  targetText: 'nos encontrássemos na próxima semana',
                  role: 'connector',
                  explanation: 'Reflexive subjuntivo imperfeito + time phrase'
                }
              ],
              habitHint: isAr
                ? 'Preferiria أسلوب راقٍ لتقديم المقترحات المهنية.'
                : 'Preferiria is a refined way to propose choices in corporate contexts.'
            }
          ]
        },
        {
          id: 'pt-p3-l3',
          phaseId: 3,
          phaseTitle: 'Domínio e Comunicação Profissional',
          phaseLevel: 'B1 – B2',
          number: 3,
          title: 'Relative Pronouns: que, cujo, o qual, onde',
          titleAr: 'الضمائر الموصولة (que, cujo, o qual, onde)',
          transferConcept: isAr
            ? 'que تُستخدم للفاعل والمفعول، و cujo للملكية (الذي له/لها)، و onde للمكان.'
            : 'que is used for subject/object, cujo for possessive (whose), and onde for location.',
          transferConceptAr: 'que للفاعل والمفعول، cujo للملكية، و onde للمكان.',
          weakSpotTag: 'relative-pronouns',
          exercises: [
            {
              id: 'pt-ex-3-3-1',
              arabicThought: 'الكتاب الذي قرأته كان مفيداً جداً',
              englishTarget: 'O livro que li foi muito útil',
              sourceThought: sourceThought(source, 'الكتاب الذي قرأته كان مفيداً جداً', 'The book that I read was very useful'),
              targetSentence: 'O livro que li foi muito útil',
              acceptableAlternatives: ['O livro que eu li era muito útil'],
              wordChips: ['O', 'livro', 'que', 'li', 'foi', 'muito', 'útil', 'cujo'],
              breakdownChunks: [
                {
                  arabicText: 'O livro que li',
                  englishText: 'The book that I read',
                  sourceText: isAr ? 'الكتاب الذي قرأته' : 'The book that I read',
                  targetText: 'O livro que li',
                  role: 'subject',
                  explanation: 'que relative pronoun for direct object'
                },
                {
                  arabicText: 'foi muito útil',
                  englishText: 'was very useful',
                  sourceText: isAr ? 'كان مفيداً جداً' : 'was very useful',
                  targetText: 'foi muito útil',
                  role: 'verb',
                  explanation: 'ser in pretérito perfeito + adverb + adjective'
                }
              ],
              habitHint: isAr
                ? 'استخدم que كضمير موصول للمفعول المباشر.'
                : 'Use que as the relative pronoun for direct objects.'
            },
            {
              id: 'pt-ex-3-3-2',
              arabicThought: 'الرجل الذي تحدث إليك هو مديرنا',
              englishTarget: 'O homem que falou com você é o nosso diretor',
              sourceThought: sourceThought(source, 'الرجل الذي تحدث إليك هو مديرنا', 'The man who spoke to you is our director'),
              targetSentence: 'O homem que falou com você é o nosso diretor',
              acceptableAlternatives: ['O homem que lhe falou é o nosso diretor'],
              wordChips: ['O', 'homem', 'que', 'falou', 'com', 'você', 'é', 'o', 'nosso', 'diretor', 'sempre'],
              breakdownChunks: [
                {
                  arabicText: 'O homem que falou com você',
                  englishText: 'The man who spoke to you',
                  sourceText: isAr ? 'الرجل الذي تحدث إليك' : 'The man who spoke to you',
                  targetText: 'O homem que falou com você',
                  role: 'subject',
                  explanation: 'que functioning as relative subject'
                },
                {
                  arabicText: 'é o nosso diretor',
                  englishText: 'is our director',
                  sourceText: isAr ? 'هو مديرنا' : 'is our director',
                  targetText: 'é o nosso diretor',
                  role: 'verb',
                  explanation: 'ser + article o + possessive nosso + diretor'
                }
              ],
              habitHint: isAr
                ? 'que تُستخدم أيضاً كضمير موصول للفاعل.'
                : 'que is also used for relative subject clauses.'
            },
            {
              id: 'pt-ex-3-3-3',
              arabicThought: 'الاجتماع الذي تحدثنا عنه كان ناجحاً',
              englishTarget: 'A reunião de que falamos foi um sucesso',
              sourceThought: sourceThought(source, 'الاجتماع الذي تحدثنا عنه كان ناجحاً', 'The meeting we spoke about was a success'),
              targetSentence: 'A reunião de que falamos foi um sucesso',
              acceptableAlternatives: ['A reunião da qual falamos foi um sucesso'],
              wordChips: ['A', 'reunião', 'de', 'que', 'falamos', 'foi', 'um', 'sucesso', 'cujo'],
              breakdownChunks: [
                {
                  arabicText: 'A reunião de que falamos',
                  englishText: 'The meeting we spoke about',
                  sourceText: isAr ? 'الاجتماع الذي تحدثنا عنه' : 'The meeting we spoke about',
                  targetText: 'A reunião de que falamos',
                  role: 'subject',
                  explanation: 'de que replaces falar de'
                },
                {
                  arabicText: 'foi um sucesso',
                  englishText: 'was a success',
                  sourceText: isAr ? 'كان ناجحاً' : 'was a success',
                  targetText: 'foi um sucesso',
                  role: 'verb',
                  explanation: 'ser in pretérito perfeito + noun phrase'
                }
              ],
              habitHint: isAr
                ? 'بعد حرف الجر de استخدم de que أو da qual.'
                : 'After preposition de, use de que or da qual.'
            }
          ]
        },
        {
          id: 'pt-p3-l4',
          phaseId: 3,
          phaseTitle: 'Domínio e Comunicação Profissional',
          phaseLevel: 'B1 – B2',
          number: 4,
          title: 'Connectors & Complex Argumentation',
          titleAr: 'أدوات الربط والمحاجة المعقدة (no entanto, embora)',
          transferConcept: isAr
            ? 'تستخدم embora مع الـ subjuntivo للتعبير عن التناقض، و no entanto للربط بين الجمل المستقلة.'
            : 'embora requires subjuntivo for concession, while no entanto links independent clauses.',
          transferConceptAr: 'embora + subjuntivo للتناقض، و no entanto للربط بين الجمل.',
          weakSpotTag: 'complex-connectors',
          exercises: [
            {
              id: 'pt-ex-3-4-1',
              arabicThought: 'على الرغم من أن الوقت متأخر، إلا أنني أواصل العمل',
              englishTarget: 'Embora seja tarde, continuo a trabalhar',
              sourceThought: sourceThought(source, 'على الرغم من أن الوقت متأخر، إلا أنني أواصل العمل', 'Although it is late, I continue to work'),
              targetSentence: 'Embora seja tarde, continuo a trabalhar',
              acceptableAlternatives: ['Embora seja tarde, continuo trabalhando'],
              wordChips: ['Embora', 'seja', 'tarde', 'continuo', 'a', 'trabalhar', 'é', 'mas'],
              breakdownChunks: [
                {
                  arabicText: 'Embora seja tarde',
                  englishText: 'Although it is late',
                  sourceText: isAr ? 'على الرغم من أن الوقت متأخر' : 'Although it is late',
                  targetText: 'Embora seja tarde',
                  role: 'connector',
                  explanation: 'embora + subjuntivo of ser (seja)'
                },
                {
                  arabicText: 'continuo a trabalhar',
                  englishText: 'I continue to work',
                  sourceText: isAr ? 'أواصل العمل' : 'I continue to work',
                  targetText: 'continuo a trabalhar',
                  role: 'connector',
                  explanation: 'continuar a + infinitive'
                }
              ],
              habitHint: isAr
                ? 'الرابط embora يتبعه دائماً subjuntivo: seja.'
                : 'The connector embora is always followed by subjuntivo: seja.'
            },
            {
              id: 'pt-ex-3-4-2',
              arabicThought: 'المشروع صعب، ومع ذلك سنحققه',
              englishTarget: 'O projeto é difícil, no entanto vamos realizá-lo',
              sourceThought: sourceThought(source, 'المشروع صعب، ومع ذلك سنحققه', 'The project is difficult, however we will achieve it'),
              targetSentence: 'O projeto é difícil, no entanto vamos realizá-lo',
              acceptableAlternatives: ['O projeto é difícil, todavia vamos realizá-lo'],
              wordChips: ['O', 'projeto', 'é', 'difícil', 'no entanto', 'vamos', 'realizá-lo', 'sempre'],
              breakdownChunks: [
                {
                  arabicText: 'O projeto é difícil',
                  englishText: 'The project is difficult',
                  sourceText: isAr ? 'المشروع صعب' : 'The project is difficult',
                  targetText: 'O projeto é difícil',
                  role: 'connector',
                  explanation: 'First clause'
                },
                {
                  arabicText: 'no entanto vamos realizá-lo',
                  englishText: 'however we will achieve it',
                  sourceText: isAr ? 'ومع ذلك سنحققه' : 'however we will achieve it',
                  targetText: 'no entanto vamos realizá-lo',
                  role: 'connector',
                  explanation: 'no entanto (however) + verb phrase'
                }
              ],
              habitHint: isAr
                ? 'no entanto رابط رسمي يعبر عن الاستدراك (مع ذلك).'
                : 'no entanto is a formal connector meaning however.'
            },
            {
              id: 'pt-ex-3-4-3',
              arabicThought: 'بناءً على ذلك، سنعقد اجتماعاً طارئاً',
              englishTarget: 'Portanto, realizaremos uma reunião urgente',
              sourceThought: sourceThought(source, 'بناءً على ذلك، سنعقد اجتماعاً طارئاً', 'Consequently, we will hold an urgent meeting'),
              targetSentence: 'Portanto, realizaremos uma reunião urgente',
              acceptableAlternatives: ['Por conseguinte, realizaremos uma reunião urgente'],
              wordChips: ['Portanto', 'realizaremos', 'uma', 'reunião', 'urgente', 'porque'],
              breakdownChunks: [
                {
                  arabicText: 'Portanto',
                  englishText: 'Consequently',
                  sourceText: isAr ? 'بناءً على ذلك' : 'Consequently',
                  targetText: 'Portanto',
                  role: 'connector',
                  explanation: 'Formal logical connector'
                },
                {
                  arabicText: 'realizaremos uma reunião urgente',
                  englishText: 'we will hold an urgent meeting',
                  sourceText: isAr ? 'سنعقد اجتماعاً طارئاً' : 'we will hold an urgent meeting',
                  targetText: 'realizaremos uma reunião urgente',
                  role: 'connector',
                  explanation: 'realizar in futuro + noun phrase'
                }
              ],
              habitHint: isAr
                ? 'Portanto رابط مهني معتمد لبيان النتيجة.'
                : 'Portanto is a standard corporate result connector.'
            }
          ]
        },
        {
          id: 'pt-p3-l5',
          phaseId: 3,
          phaseTitle: 'Domínio e Comunicação Profissional',
          phaseLevel: 'B1 – B2',
          number: 5,
          title: 'Professional Email & Corporate Etiquette',
          titleAr: 'المراسلات الرسمية وإتيكيت الشركات البرتغالية',
          transferConcept: isAr
            ? 'تُفتتح الإيميلات الرسمية بـ Prezado/a Senhor/a وتُختتم بـ Atenciosamente.'
            : 'Formal Portuguese emails open with Prezado/a Senhor/a and conclude with Atenciosamente.',
          transferConceptAr: 'افتتاح المراسلات بـ Prezado/a Senhor/a والختام بـ Atenciosamente.',
          weakSpotTag: 'business-etiquette',
          exercises: [
            {
              id: 'pt-ex-3-5-1',
              arabicThought: 'سيدي/سيدتي العزيز/ة، تجدون المرفق في الإيميل',
              englishTarget: 'Prezado Senhor, segue em anexo o documento',
              sourceThought: sourceThought(source, 'سيدي/سيدتي العزيز/ة، تجدون المرفق في الإيميل', 'Dear Sir, please find attached the document'),
              targetSentence: 'Prezado Senhor, segue em anexo o documento',
              acceptableAlternatives: ['Prezada Senhora, segue em anexo o documento'],
              wordChips: ['Prezado', 'Senhor', 'segue', 'em', 'anexo', 'o', 'documento', 'amanhã'],
              breakdownChunks: [
                {
                  arabicText: 'Prezado Senhor',
                  englishText: 'Dear Sir',
                  sourceText: isAr ? 'سيدي العزيز' : 'Dear Sir',
                  targetText: 'Prezado Senhor',
                  role: 'connector',
                  explanation: 'Formal salutation'
                },
                {
                  arabicText: 'segue em anexo o documento',
                  englishText: 'please find attached the document',
                  sourceText: isAr ? 'تجدون المرفق' : 'please find attached the document',
                  targetText: 'segue em anexo o documento',
                  role: 'connector',
                  explanation: 'Standard attachment phrase segue em anexo'
                }
              ],
              habitHint: isAr
                ? 'العبارة المعيارية للمرفقات: segue em anexo.'
                : 'Standard Portuguese formula for attachments: segue em anexo.'
            },
            {
              id: 'pt-ex-3-5-2',
              arabicThought: 'مع أطيب التحيات والتقدير الفائق',
              englishTarget: 'Subscrevo-me com a mais elevada consideração',
              sourceThought: sourceThought(source, 'مع أطيب التحيات والتقدير الفائق', 'I remain with the highest consideration'),
              targetSentence: 'Subscrevo-me com a mais elevada consideração',
              acceptableAlternatives: ['Com os melhores cumprimentos'],
              wordChips: ['Subscrevo-me', 'com', 'a', 'mais', 'elevada', 'consideração', 'por'],
              breakdownChunks: [
                {
                  arabicText: 'Subscrevo-me',
                  englishText: 'I remain',
                  sourceText: isAr ? 'أبقى لك' : 'I remain',
                  targetText: 'Subscrevo-me',
                  role: 'verb',
                  explanation: 'High formal closing formula'
                },
                {
                  arabicText: 'com a mais elevada consideração',
                  englishText: 'with the highest consideration',
                  sourceText: isAr ? 'مع التقدير الفائق' : 'with the highest consideration',
                  targetText: 'com a mais elevada consideração',
                  role: 'object',
                  explanation: 'Traditional Portuguese formal closing'
                }
              ],
              habitHint: isAr
                ? 'الختام الرسمي الفاخر المعتمد في الرسائل البرتغالية الرسمية.'
                : 'Traditional high-register Portuguese corporate closing.'
            },
            {
              id: 'pt-ex-3-5-3',
              arabicThought: 'مع خالص التحيات المهنية',
              englishTarget: 'Atenciosamente, a equipa de direção',
              sourceThought: sourceThought(source, 'مع خالص التحيات المهنية', 'Sincerely, the management team'),
              targetSentence: 'Atenciosamente, a equipa de direção',
              acceptableAlternatives: ['Com os melhores cumprimentos, a equipe de direção'],
              wordChips: ['Atenciosamente', 'a', 'equipa', 'de', 'direção', 'obrigado'],
              breakdownChunks: [
                {
                  arabicText: 'Atenciosamente',
                  englishText: 'Sincerely',
                  sourceText: isAr ? 'مع خالص التحيات' : 'Sincerely',
                  targetText: 'Atenciosamente',
                  role: 'connector',
                  explanation: 'Standard corporate closing'
                },
                {
                  arabicText: 'a equipa de direção',
                  englishText: 'the management team',
                  sourceText: isAr ? 'فريق الإدارة' : 'the management team',
                  targetText: 'a equipa de direção',
                  role: 'subject',
                  explanation: 'Department title'
                }
              ],
              habitHint: isAr
                ? 'Atenciosamente هي الكلمة الأكثر شيوعاً في ختام الإيميلات المهنية.'
                : 'Atenciosamente is the most standard Portuguese corporate sign-off.'
            }
          ]
        }
      ]
    }
  ];
}
