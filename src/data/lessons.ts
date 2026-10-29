import { Phase } from '../types';

export const PHASES_DATA: Phase[] = [
  {
    id: 1,
    title: 'Foundations & The Skeleton',
    titleAr: 'الأساسات والهيكل البنائي',
    level: 'A1+ – A2',
    tagline: 'Master the core mechanics: linking verbs, possession, articles, and English sentence grammar.',
    lessons: [
      {
        id: 'p1-l1',
        phaseId: 1,
        phaseTitle: 'Foundations & The Skeleton',
        phaseLevel: 'A1+ – A2',
        number: 1,
        title: 'The Hidden Copula (Nominal Sentences)',
        titleAr: 'رابطة الكينونة الخفية (الجملة الاسمية)',
        transferConcept: 'Arabic creates complete present statements with zero verbs (مبتدأ وخبر: هو طبيب). English grammar strictly forbids verbless sentences; an overt linking verb ("am / is / are") must serve as the structural backbone.',
        transferConceptAr: 'في العربية، الجملة الاسمية تكتفي بالمبتدأ والخبر دون فعل في المضارع (هو طبيب). أما في الإنجليزية، فالجملة لا تكتمل أبداً بدون فعل رابط (am / is / are).',
        weakSpotTag: 'copula-omission',
        exercises: [
          {
            id: 'ex-1-1-1',
            arabicThought: 'هو مهندس معماري',
            englishTarget: 'He is an architect',
            acceptableAlternatives: ["He's an architect"],
            wordChips: ['He', 'is', 'an', 'architect', 'a', 'engineer', 'are'],
            breakdownChunks: [
              { arabicText: 'هو', englishText: 'He', role: 'subject', explanation: 'Subject pronoun' },
              { arabicText: '— (غير منطوق في العربية)', englishText: 'is', role: 'verb', explanation: 'Required copula verb in English' },
              { arabicText: 'مهندس معماري', englishText: 'an architect', role: 'object', explanation: 'Indefinite singular noun taking "an"' }
            ],
            habitHint: 'In Arabic, you say "هو مهندس" without any verb. In English, you cannot leave the verb implicit. Which form of "to be" must bridge the subject and the noun?',
            specificMisconceptions: [
              { pattern: '^he architect|^he an architect', diagnosis: 'Notice how you omitted "is". In English, verbless sentences do not exist in the present tense.' }
            ]
          },
          {
            id: 'ex-1-1-2',
            arabicThought: 'الطقس بارد جداً اليوم',
            englishTarget: 'The weather is very cold today',
            acceptableAlternatives: ["The weather's very cold today", 'Today the weather is very cold'],
            wordChips: ['The', 'weather', 'is', 'very', 'cold', 'today', 'are', 'has'],
            breakdownChunks: [
              { arabicText: 'الطقس', englishText: 'The weather', role: 'subject', explanation: 'Definite subject' },
              { arabicText: '— (فعل الكينونة المحذوف)', englishText: 'is', role: 'verb', explanation: 'Required linking verb' },
              { arabicText: 'بارد جداً', englishText: 'very cold', role: 'modifier', explanation: 'Adjective phrase complement' },
              { arabicText: 'اليوم', englishText: 'today', role: 'connector', explanation: 'Time adverbial' }
            ],
            habitHint: 'Arabic connects the weather directly to the adjective (الطقس بارد). English requires the copula "is" to hold the adjective to the subject.'
          },
          {
            id: 'ex-1-1-3',
            arabicThought: 'نحن جاهزون للمقابلة',
            englishTarget: 'We are ready for the interview',
            acceptableAlternatives: ["We're ready for the interview"],
            wordChips: ['We', 'are', 'ready', 'for', 'the', 'interview', 'is', 'to'],
            breakdownChunks: [
              { arabicText: 'نحن', englishText: 'We', role: 'subject', explanation: 'Plural subject' },
              { arabicText: '— (رابطة محذوفة)', englishText: 'are', role: 'verb', explanation: 'Plural copula verb' },
              { arabicText: 'جاهزون', englishText: 'ready', role: 'modifier', explanation: 'Predicate adjective' },
              { arabicText: 'للمقابلة', englishText: 'for the interview', role: 'object', explanation: 'Prepositional complement' }
            ],
            habitHint: 'Plural subject "We" needs the plural linking verb "are".'
          }
        ]
      },
      {
        id: 'p1-l2',
        phaseId: 1,
        phaseTitle: 'Foundations & The Skeleton',
        phaseLevel: 'A1+ – A2',
        number: 2,
        title: 'Articles & The Zero-Article Trap',
        titleAr: 'أدوات التنكير والتعريف وفخ الاسم العام',
        transferConcept: 'Arabic uses "الـ" for both specific items and generic categories (أحب الموسيقى = I like music). In English, generic mass nouns and plural general concepts take NO article (Zero Article), while singular countable nouns require "a/an".',
        transferConceptAr: 'في العربية نضع "الـ" في العموميات (أحب الطبيعة). في الإنجليزية، المفاهيم العامة والأسماء غير المعدودة لا تأخذ أداة أبداً (I like nature)، بينما المفرد المعدود يحتاج "a/an".',
        weakSpotTag: 'article-interference',
        exercises: [
          {
            id: 'ex-1-2-1',
            arabicThought: 'أنا أحب القهوة الساخنة (بشكل عام)',
            englishTarget: 'I like hot coffee',
            acceptableAlternatives: ['I love hot coffee'],
            wordChips: ['I', 'like', 'hot', 'coffee', 'the', 'a', 'hot coffee'],
            breakdownChunks: [
              { arabicText: 'أنا', englishText: 'I', role: 'subject', explanation: 'Subject' },
              { arabicText: 'أحب', englishText: 'like', role: 'verb', explanation: 'Active preference verb' },
              { arabicText: 'القهوة الساخنة', englishText: 'hot coffee', role: 'object', explanation: 'Generic uncountable noun: NO "the"!' }
            ],
            habitHint: 'Arabic says "أحب القهوة" with "الـ" for generic coffee. In English, talking about coffee in general takes ZERO article—never say "the coffee" unless pointing to a specific cup!'
          },
          {
            id: 'ex-1-2-2',
            arabicThought: 'هو اشترى دراجة جديدة',
            englishTarget: 'He bought a new bicycle',
            acceptableAlternatives: ['He bought a new bike'],
            wordChips: ['He', 'bought', 'a', 'new', 'bicycle', 'the', 'an', 'bike'],
            breakdownChunks: [
              { arabicText: 'هو', englishText: 'He', role: 'subject', explanation: 'Subject' },
              { arabicText: 'اشترى', englishText: 'bought', role: 'verb', explanation: 'Past action' },
              { arabicText: 'دراجة جديدة', englishText: 'a new bicycle', role: 'object', explanation: 'Singular countable noun requires indefinite "a"' }
            ],
            habitHint: 'Arabic relies on tanween for indefiniteness. English demands the discrete word "a" before a singular countable noun.'
          },
          {
            id: 'ex-1-2-3',
            arabicThought: 'الموسيقى تجعلني سعيداً (الموسيقى كفكرة عامة)',
            englishTarget: 'Music makes me happy',
            acceptableAlternatives: ['Music makes me feel happy'],
            wordChips: ['Music', 'makes', 'me', 'happy', 'The', 'is', 'make'],
            breakdownChunks: [
              { arabicText: 'الموسيقى (عامة)', englishText: 'Music', role: 'subject', explanation: 'Zero-article generic concept' },
              { arabicText: 'تجعلني', englishText: 'makes me', role: 'verb', explanation: 'Causative verb with object pronoun' },
              { arabicText: 'سعيداً', englishText: 'happy', role: 'modifier', explanation: 'Resultant state adjective' }
            ],
            habitHint: 'Do not transfer the Arabic "الـ" onto general abstract nouns like Music, Life, or Love in English.'
          }
        ]
      },
      {
        id: 'p1-l3',
        phaseId: 1,
        phaseTitle: 'Foundations & The Skeleton',
        phaseLevel: 'A1+ – A2',
        number: 3,
        title: 'Possession: "Have" vs عندي / لدي',
        titleAr: 'الملكية: I have مقابل عندي ولدي',
        transferConcept: 'In Arabic, possession is expressed through a prepositional phrase of location (عندي / معي = "at/with me"). In English, the human is the active grammatical subject performing the verb "to have".',
        transferConceptAr: 'العربية تعبر عن الملكية بشبه جملة مكانية (عندي / لدي). في الإنجليزية، الشخص نفسه هو الفاعل المباشر الذي يملك الفعل: I have.',
        weakSpotTag: 'possession-transfer',
        exercises: [
          {
            id: 'ex-1-3-1',
            arabicThought: 'عندي سؤال مهم',
            englishTarget: 'I have an important question',
            acceptableAlternatives: ["I've an important question", "I've got an important question", 'I have got an important question'],
            wordChips: ['I', 'have', 'an', 'important', 'question', 'with', 'at', 'a'],
            breakdownChunks: [
              { arabicText: 'عندي (الفاعل المستتر: أنا)', englishText: 'I', role: 'subject', explanation: 'The possessor becomes subject' },
              { arabicText: 'عند', englishText: 'have', role: 'verb', explanation: 'Active possession verb' },
              { arabicText: 'سؤال مهم', englishText: 'an important question', role: 'object', explanation: 'Modifier preceding noun with "an"' }
            ],
            habitHint: 'Avoid literal preposition translation like "with me" or "at me". Shift the thought so "I" is the active possessor with "have".'
          },
          {
            id: 'ex-1-3-2',
            arabicThought: 'عنده سيارة كهربائية',
            englishTarget: 'He has an electric car',
            acceptableAlternatives: ["He's got an electric car", 'He has got an electric car'],
            wordChips: ['He', 'has', 'an', 'electric', 'car', 'have', 'with', 'a'],
            breakdownChunks: [
              { arabicText: 'هو (من "عنده")', englishText: 'He', role: 'subject', explanation: 'Third person singular' },
              { arabicText: 'عند', englishText: 'has', role: 'verb', explanation: 'Conjugated form of "have"' },
              { arabicText: 'سيارة كهربائية', englishText: 'an electric car', role: 'object', explanation: 'Adjective before noun with "an"' }
            ],
            habitHint: 'For "he/she/it", the verb "have" shifts to "has".'
          },
          {
            id: 'ex-1-3-3',
            arabicThought: 'ليس لدي وقت كافٍ',
            englishTarget: "I do not have enough time",
            acceptableAlternatives: ["I don't have enough time", "I have no time", "I haven't got enough time"],
            wordChips: ['I', 'do', 'not', 'have', 'enough', 'time', "don't", 'no', 'with'],
            breakdownChunks: [
              { arabicText: 'أنا', englishText: 'I', role: 'subject', explanation: 'Subject' },
              { arabicText: 'ليس', englishText: 'do not', role: 'auxiliary', explanation: 'Negative auxiliary do + not' },
              { arabicText: 'لدي', englishText: 'have', role: 'verb', explanation: 'Base verb of possession' },
              { arabicText: 'وقت كافٍ', englishText: 'enough time', role: 'object', explanation: 'Determiner + mass noun' }
            ],
            habitHint: 'To negate possession, English deploys the auxiliary "do not have", not "not have" alone.'
          }
        ]
      },
      {
        id: 'p1-l4',
        phaseId: 1,
        phaseTitle: 'Foundations & The Skeleton',
        phaseLevel: 'A1+ – A2',
        number: 4,
        title: 'Basic Negation with Do / Don\'t',
        titleAr: 'النفي الأساسي بواسطة Do و Don\'t',
        transferConcept: 'Arabic places negative particles (لا / ما) directly in front of any conjugated verb (أنا لا أدخن). English cannot attach "not" directly to a lexical verb; it must recruit the helper dummy "do/does" to bear the negation (I do not smoke).',
        transferConceptAr: 'العربية تنفي الفعل مباشرة بـ (لا / ما). الإنجليزية تعجز عن نفي الفعل المعجمي مباشرة بدون استدعاء الفعل المساعد (do/does) ليحمل أداة النفي not.',
        weakSpotTag: 'negation-auxiliary',
        exercises: [
          {
            id: 'ex-1-4-1',
            arabicThought: 'أنا لا أشرب الشاي الأخضر',
            englishTarget: 'I do not drink green tea',
            acceptableAlternatives: ["I don't drink green tea"],
            wordChips: ['I', 'do', 'not', 'drink', 'green', 'tea', "don't", 'no', 'the'],
            breakdownChunks: [
              { arabicText: 'أنا', englishText: 'I', role: 'subject', explanation: 'Subject' },
              { arabicText: 'لا', englishText: 'do not', role: 'auxiliary', explanation: 'Auxiliary dummy "do" + negative marker "not"' },
              { arabicText: 'أشرب', englishText: 'drink', role: 'verb', explanation: 'Bare infinitive verb' },
              { arabicText: 'الشاي الأخضر', englishText: 'green tea', role: 'object', explanation: 'Adjective first, generic mass noun' }
            ],
            habitHint: 'Never say "I not drink" or "I no drink". English requires the auxiliary verb "do" to host the word "not".'
          },
          {
            id: 'ex-1-4-2',
            arabicThought: 'سارة لا تعمل في عطلة نهاية الأسبوع',
            englishTarget: 'Sarah does not work on the weekend',
            acceptableAlternatives: ["Sarah doesn't work on the weekend", "Sarah doesn't work on weekends", 'Sarah does not work on weekends'],
            wordChips: ['Sarah', 'does', 'not', 'work', 'on', 'the', 'weekend', "doesn't", 'works', 'in'],
            breakdownChunks: [
              { arabicText: 'سارة', englishText: 'Sarah', role: 'subject', explanation: 'Third-person singular subject' },
              { arabicText: 'لا', englishText: 'does not', role: 'auxiliary', explanation: '"Does" carries the 3rd person -s and "not"' },
              { arabicText: 'تعمل', englishText: 'work', role: 'verb', explanation: 'Reverts to base form without -s' },
              { arabicText: 'في عطلة نهاية الأسبوع', englishText: 'on the weekend', role: 'connector', explanation: 'Preposition of specific occasion' }
            ],
            habitHint: 'For third person (Sarah), "does" takes the third-person -s. Notice that "work" drops its -s!'
          },
          {
            id: 'ex-1-4-3',
            arabicThought: 'هم لا يعيشون هنا بعد الآن',
            englishTarget: 'They do not live here anymore',
            acceptableAlternatives: ["They don't live here anymore"],
            wordChips: ['They', 'do', 'not', 'live', 'here', 'anymore', "don't", 'are', 'not'],
            breakdownChunks: [
              { arabicText: 'هم', englishText: 'They', role: 'subject', explanation: 'Subject pronoun' },
              { arabicText: 'لا', englishText: 'do not', role: 'auxiliary', explanation: 'Negative operator' },
              { arabicText: 'يعيشون', englishText: 'live', role: 'verb', explanation: 'Base verb' },
              { arabicText: 'هنا بعد الآن', englishText: 'here anymore', role: 'modifier', explanation: 'Locative and temporal modifier' }
            ],
            habitHint: 'Use "do not" (or "don\'t") before the base verb.'
          }
        ]
      },
      {
        id: 'p1-l5',
        phaseId: 1,
        phaseTitle: 'Foundations & The Skeleton',
        phaseLevel: 'A1+ – A2',
        number: 5,
        title: 'Questions with Do / Does',
        titleAr: 'تكوين السؤال بواسطة Do و Does',
        transferConcept: 'Arabic turns any statement into a yes/no question by simply prefixing "هل" without altering the sentence syntax. English reshuffles structure: it must place the auxiliary "Do / Does" at the front of the sentence.',
        transferConceptAr: 'العربية تحول الجملة إلى سؤال بوضع "هل" في البداية دون المساس ببناء الجملة. الإنجليزية تقلب التركيب وتضع الفعل المساعد Do/Does في المقدمة متبوعاً بالفاعل ثم الفعل المجرد.',
        weakSpotTag: 'question-inversion',
        exercises: [
          {
            id: 'ex-1-5-1',
            arabicThought: 'هل تتحدث الإنجليزية بطلاقة؟',
            englishTarget: 'Do you speak English fluently',
            acceptableAlternatives: ['Do you speak fluent English'],
            wordChips: ['Do', 'you', 'speak', 'English', 'fluently', 'Are', 'fluent', 'does'],
            breakdownChunks: [
              { arabicText: 'هل', englishText: 'Do', role: 'auxiliary', explanation: 'Fronted auxiliary question marker' },
              { arabicText: 'أنت (في "تتحدث")', englishText: 'you', role: 'subject', explanation: 'Second person subject' },
              { arabicText: 'تتحدث', englishText: 'speak', role: 'verb', explanation: 'Base lexical verb' },
              { arabicText: 'الإنجليزية', englishText: 'English', role: 'object', explanation: 'Direct language object' },
              { arabicText: 'بطلاقة', englishText: 'fluently', role: 'modifier', explanation: 'Manner adverb' }
            ],
            habitHint: 'Never say "Are you speak...". When asking about regular actions, the sentence must open with "Do" or "Does".'
          },
          {
            id: 'ex-1-5-2',
            arabicThought: 'هل يعيش أخوك في لندن؟',
            englishTarget: 'Does your brother live in London',
            acceptableAlternatives: ['Does your brother stay in London'],
            wordChips: ['Does', 'your', 'brother', 'live', 'in', 'London', 'Do', 'lives', 'at'],
            breakdownChunks: [
              { arabicText: 'هل', englishText: 'Does', role: 'auxiliary', explanation: '3rd person singular question opener' },
              { arabicText: 'أخوك', englishText: 'your brother', role: 'subject', explanation: 'Singular noun phrase' },
              { arabicText: 'يعيش', englishText: 'live', role: 'verb', explanation: 'Base verb (the -s is on Does)' },
              { arabicText: 'في لندن', englishText: 'in London', role: 'connector', explanation: 'City preposition phrase' }
            ],
            habitHint: 'Since "your brother" is third-person singular (he), start with "Does", and use "live" without -s.'
          },
          {
            id: 'ex-1-5-3',
            arabicThought: 'هل تحتاج إلى أي مساعدة الآن؟',
            englishTarget: 'Do you need any help now',
            acceptableAlternatives: ['Do you need some help now', 'Do you require any help now'],
            wordChips: ['Do', 'you', 'need', 'any', 'help', 'now', 'Are', 'needed', 'to'],
            breakdownChunks: [
              { arabicText: 'هل', englishText: 'Do', role: 'auxiliary', explanation: 'Fronted auxiliary' },
              { arabicText: 'أنت', englishText: 'you', role: 'subject', explanation: 'Subject' },
              { arabicText: 'تحتاج', englishText: 'need', role: 'verb', explanation: 'Stative verb of need' },
              { arabicText: 'أي مساعدة', englishText: 'any help', role: 'object', explanation: 'Quantifier for interrogatives + mass noun' },
              { arabicText: 'الآن', englishText: 'now', role: 'connector', explanation: 'Time adverb' }
            ],
            habitHint: 'In English questions, we use "any" with uncountable nouns like "help", preceded by "Do you need".'
          }
        ]
      },
      {
        id: 'p1-l6',
        phaseId: 1,
        phaseTitle: 'Foundations & The Skeleton',
        phaseLevel: 'A1+ – A2',
        number: 6,
        title: 'Modals: Can / Want to / Need to',
        titleAr: 'أفعال الرغبة والقدرة: Can و Want to و Need to',
        transferConcept: 'In Arabic, expressions of intent take "أن" + subjunctive verb (أريد أن أذهب, أستطيع أن أفعل). In English, "can" takes a bare infinitive without "to", while "want" and "need" require the infinitive particle "to".',
        transferConceptAr: 'في العربية نستخدم "أن" المصدرية بعد أفعال الإرادة والقدرة (أريد أن أذهب / أستطيع أن أساعد). في الإنجليزية، Can تأتي بدون to، بينما Want و Need تتطلبان to دائماً.',
        weakSpotTag: 'infinitive-particle',
        exercises: [
          {
            id: 'ex-1-6-1',
            arabicThought: 'أستطيع مساعدتك في هذا المشروع',
            englishTarget: 'I can help you with this project',
            acceptableAlternatives: ['I can assist you with this project'],
            wordChips: ['I', 'can', 'help', 'you', 'with', 'this', 'project', 'to', 'helping', 'in'],
            breakdownChunks: [
              { arabicText: 'أنا', englishText: 'I', role: 'subject', explanation: 'Subject' },
              { arabicText: 'أستطيع', englishText: 'can', role: 'auxiliary', explanation: 'Modal of ability (never takes "to")' },
              { arabicText: 'مساعدتك', englishText: 'help you', role: 'verb', explanation: 'Bare infinitive verb + pronoun' },
              { arabicText: 'في هذا المشروع', englishText: 'with this project', role: 'connector', explanation: 'Collocation: help with something' }
            ],
            habitHint: 'Watch out: modal "can" NEVER takes "to" in English. Say "I can help", not "I can to help".'
          },
          {
            id: 'ex-1-6-2',
            arabicThought: 'أريد أن أتعلم لغة جديدة',
            englishTarget: 'I want to learn a new language',
            acceptableAlternatives: ['I wish to learn a new language'],
            wordChips: ['I', 'want', 'to', 'learn', 'a', 'new', 'language', 'can', 'learning', 'the'],
            breakdownChunks: [
              { arabicText: 'أنا', englishText: 'I', role: 'subject', explanation: 'Subject' },
              { arabicText: 'أريد', englishText: 'want', role: 'verb', explanation: 'Verb of desire' },
              { arabicText: 'أن أتعلم', englishText: 'to learn', role: 'verb', explanation: 'Full infinitive with "to"' },
              { arabicText: 'لغة جديدة', englishText: 'a new language', role: 'object', explanation: 'Modifier before countable noun' }
            ],
            habitHint: '"Want" always links to another verb with "to": "want to learn".'
          },
          {
            id: 'ex-1-6-3',
            arabicThought: 'نحن بحاجة إلى مغادرة المكان الآن',
            englishTarget: 'We need to leave the place now',
            acceptableAlternatives: ['We need to leave now'],
            wordChips: ['We', 'need', 'to', 'leave', 'the', 'place', 'now', 'leaving', 'must', 'of'],
            breakdownChunks: [
              { arabicText: 'نحن', englishText: 'We', role: 'subject', explanation: 'Subject' },
              { arabicText: 'بحاجة إلى', englishText: 'need to', role: 'verb', explanation: 'Semi-modal verb + infinitive particle' },
              { arabicText: 'مغادرة', englishText: 'leave', role: 'verb', explanation: 'Base verb' },
              { arabicText: 'المكان الآن', englishText: 'the place now', role: 'object', explanation: 'Object noun phrase and adverb' }
            ],
            habitHint: 'Link "need" to the verb with "to": "We need to leave".'
          }
        ]
      },
      {
        id: 'p1-l7',
        phaseId: 1,
        phaseTitle: 'Foundations & The Skeleton',
        phaseLevel: 'A1+ – A2',
        number: 7,
        title: 'Adjective Placement: Modifier Before Noun',
        titleAr: 'موقع الصفة: الوصف يسبق الموصوف دائماً',
        transferConcept: 'In Arabic, the adjective strictly follows the noun (سيارة سريعة, فكرة ذكية). English grammar inverts this cognitive lens: the modifier must always precede the head noun (a fast car, a clever idea).',
        transferConceptAr: 'في العربية، النعت يتبع المنعوت دائماً (سيارة سريعة). في الإنجليزية ينعكس الترتيب الذهني: الصفة تسبق الاسم دائماً (a fast car).',
        weakSpotTag: 'adjective-order',
        exercises: [
          {
            id: 'ex-1-7-1',
            arabicThought: 'هذا بيت كبير وجميل',
            englishTarget: 'This is a big and beautiful house',
            acceptableAlternatives: ['This is a beautiful and big house', 'This is a big beautiful house'],
            wordChips: ['This', 'is', 'a', 'big', 'and', 'beautiful', 'house', 'house big', 'the'],
            breakdownChunks: [
              { arabicText: 'هذا', englishText: 'This', role: 'subject', explanation: 'Demonstrative pronoun' },
              { arabicText: '—', englishText: 'is', role: 'verb', explanation: 'Copula' },
              { arabicText: 'كبير وجميل', englishText: 'a big and beautiful', role: 'modifier', explanation: 'Adjectives positioned BEFORE the noun' },
              { arabicText: 'بيت', englishText: 'house', role: 'object', explanation: 'Head noun' }
            ],
            habitHint: 'Do not transfer Arabic word order "house big". The adjective paints the picture before the noun arrives: "big beautiful house".'
          },
          {
            id: 'ex-1-7-2',
            arabicThought: 'قابلت صديقاً قديماً من الجامعة',
            englishTarget: 'I met an old friend from university',
            acceptableAlternatives: ['I met an old friend from college'],
            wordChips: ['I', 'met', 'an', 'old', 'friend', 'from', 'university', 'a', 'friend old', 'the'],
            breakdownChunks: [
              { arabicText: 'قابلت (أنا)', englishText: 'I met', role: 'verb', explanation: 'Subject + simple past verb' },
              { arabicText: 'صديقاً قديماً', englishText: 'an old friend', role: 'object', explanation: 'Article + adjective + head noun' },
              { arabicText: 'من الجامعة', englishText: 'from university', role: 'connector', explanation: 'Origin prepositional phrase' }
            ],
            habitHint: '"Old" comes before "friend", and takes the article "an" because "old" begins with a vowel sound.'
          },
          {
            id: 'ex-1-7-3',
            arabicThought: 'لديهم خطة ذكية جداً',
            englishTarget: 'They have a very clever plan',
            acceptableAlternatives: ['They have a very smart plan'],
            wordChips: ['They', 'have', 'a', 'very', 'clever', 'plan', 'smart', 'plan clever', 'an'],
            breakdownChunks: [
              { arabicText: 'لديهم', englishText: 'They have', role: 'subject', explanation: 'Active subject + verb' },
              { arabicText: 'خطة ذكية جداً', englishText: 'a very clever plan', role: 'object', explanation: 'Intensifier + adjective + noun' }
            ],
            habitHint: 'The entire descriptive cluster ("very clever") sits right before the noun "plan".'
          }
        ]
      },
      {
        id: 'p1-l8',
        phaseId: 1,
        phaseTitle: 'Foundations & The Skeleton',
        phaseLevel: 'A1+ – A2',
        number: 8,
        title: 'Spatial & Temporal Prepositions: In, On, At',
        titleAr: 'حروف الجر المكانية والزمانية: In و On و At',
        transferConcept: 'Arabic over-relies on "في" for spaces, institutions, and time periods (في العمل, في الجمعة, في الليل). English divides spatial and temporal realms into a strict pyramid: AT (precise points/institutions), ON (surfaces & specific days), IN (enclosed volumes & broad periods).',
        transferConceptAr: 'العربية تستخدم "في" لمعظم الظروف المكانية والزمانية (في العمل، في الصباح، في يوم الجمعة). الإنجليزية تقسمها لهرم صارم: At للنقاط المحددة والمؤسسات، On للسطوح والأيام، In للأوعية المغلقة والفترات الطويلة.',
        weakSpotTag: 'preposition-pyramid',
        exercises: [
          {
            id: 'ex-1-8-1',
            arabicThought: 'أنا في العمل الآن وسأتصل بك لاحقاً',
            englishTarget: 'I am at work now and I will call you later',
            acceptableAlternatives: ["I'm at work now and I will call you later", "I'm at work now and will call you later"],
            wordChips: ['I', 'am', 'at', 'work', 'now', 'and', 'will', 'call', 'you', 'later', 'in', 'the'],
            breakdownChunks: [
              { arabicText: 'أنا في العمل', englishText: 'I am at work', role: 'subject', explanation: 'Institutional location uses "at work", not "in work"' },
              { arabicText: 'الآن', englishText: 'now', role: 'modifier', explanation: 'Time adverb' },
              { arabicText: 'وسأتصل بك لاحقاً', englishText: 'and I will call you later', role: 'connector', explanation: 'Future clause' }
            ],
            habitHint: 'Arabic says "في العمل", but institutional states in English take "at": at work, at school, at home.'
          },
          {
            id: 'ex-1-8-2',
            arabicThought: 'لدينا اجتماع مهم في يوم الاثنين',
            englishTarget: 'We have an important meeting on Monday',
            acceptableAlternatives: ["We've an important meeting on Monday"],
            wordChips: ['We', 'have', 'an', 'important', 'meeting', 'on', 'Monday', 'in', 'at', 'a'],
            breakdownChunks: [
              { arabicText: 'لدينا', englishText: 'We have', role: 'verb', explanation: 'Possession' },
              { arabicText: 'اجتماع مهم', englishText: 'an important meeting', role: 'object', explanation: 'Noun phrase' },
              { arabicText: 'في يوم الاثنين', englishText: 'on Monday', role: 'connector', explanation: 'Specific calendar days take ON' }
            ],
            habitHint: 'For calendar days and dates (Monday, Friday), English strictly uses "on", never "in".'
          },
          {
            id: 'ex-1-8-3',
            arabicThought: 'هو يستيقظ مبكراً في الصباح',
            englishTarget: 'He wakes up early in the morning',
            acceptableAlternatives: ['He gets up early in the morning'],
            wordChips: ['He', 'wakes', 'up', 'early', 'in', 'the', 'morning', 'at', 'on', 'wake'],
            breakdownChunks: [
              { arabicText: 'هو يستيقظ', englishText: 'He wakes up', role: 'verb', explanation: 'Phrasal verb with 3rd person -s' },
              { arabicText: 'مبكراً', englishText: 'early', role: 'modifier', explanation: 'Manner/time adverb' },
              { arabicText: 'في الصباح', englishText: 'in the morning', role: 'connector', explanation: 'Time chunk taking "in the"' }
            ],
            habitHint: 'Broad periods of the day take "in the" (in the morning, in the evening), while "at night" is the exception.'
          }
        ]
      }
    ]
  },
  {
    id: 2,
    title: 'Flow & Nuance',
    titleAr: 'الانسيابية والدقة التركيبية',
    level: 'B1 – B2',
    tagline: 'Connect thoughts seamlessly: perfect aspect vs لقد, relative clauses, conditionals, and phrasal logic.',
    lessons: [
      {
        id: 'p2-l1',
        phaseId: 2,
        phaseTitle: 'Flow & Nuance',
        phaseLevel: 'B1 – B2',
        number: 9,
        title: 'Past Simple vs Present Perfect (The "قد" Paradigm)',
        titleAr: 'الماضي البسيط مقابل المضارع التام (فلسفة قد ولقد)',
        transferConcept: 'Arabic speakers often translate "لقد / قد" indiscriminately into the past tense or assume "have + V3" refers to old history. In English, Present Perfect connects the past action directly to present consequences, while Past Simple locks the action in a closed historical time frame.',
        transferConceptAr: 'المتحدث بالعربية يترجم "لقد" أحياناً كماضٍ عادي. في الإنجليزية، المضارع التام (have + V3) يربط أثر الفعل باللحظة الحالية (النتيجة حية الآن)، بينما الماضي البسيط يغلق الحدث في زمن ماضٍ منقطع.',
        weakSpotTag: 'aspect-confusion',
        exercises: [
          {
            id: 'ex-2-1-1',
            arabicThought: 'لقد فقدت مفاتيحي (وما زلت أبحث عنها ولا أستطيع الدخول الآن)',
            englishTarget: 'I have lost my keys',
            acceptableAlternatives: ["I've lost my keys"],
            wordChips: ['I', 'have', 'lost', 'my', 'keys', 'did', 'lose', 'had'],
            breakdownChunks: [
              { arabicText: 'لقد (أثر حاضر)', englishText: 'have', role: 'auxiliary', explanation: 'Present bridge auxiliary' },
              { arabicText: 'فقدت', englishText: 'lost', role: 'verb', explanation: 'Past participle with active consequence' },
              { arabicText: 'مفاتيحي', englishText: 'my keys', role: 'object', explanation: 'Possessive + plural noun' }
            ],
            habitHint: 'Because the consequence is alive right now (you cannot open the door), English views this not as finished history, but as Present Perfect: "I have lost".'
          },
          {
            id: 'ex-2-1-2',
            arabicThought: 'لقد اشتريت هذه الساعة أمس',
            englishTarget: 'I bought this watch yesterday',
            acceptableAlternatives: ['Yesterday I bought this watch'],
            wordChips: ['I', 'bought', 'this', 'watch', 'yesterday', 'have', 'bought', 'had'],
            breakdownChunks: [
              { arabicText: 'اشتريت (أمس)', englishText: 'bought', role: 'verb', explanation: 'Simple past: the time anchor "yesterday" closed the door' },
              { arabicText: 'هذه الساعة', englishText: 'this watch', role: 'object', explanation: 'Demonstrative + noun' },
              { arabicText: 'أمس', englishText: 'yesterday', role: 'connector', explanation: 'Specific past time anchor (forbids Present Perfect!)' }
            ],
            habitHint: 'Even if Arabic uses "لقد", mentioning a specific finished time word ("yesterday", "last year") strictly forces Past Simple: "I bought", NOT "I have bought".'
          },
          {
            id: 'ex-2-1-3',
            arabicThought: 'هل سبق لك أن زرت اليابان؟',
            englishTarget: 'Have you ever visited Japan',
            acceptableAlternatives: ['Have you ever been to Japan'],
            wordChips: ['Have', 'you', 'ever', 'visited', 'Japan', 'Did', 'visit', 'were'],
            breakdownChunks: [
              { arabicText: 'هل (في تجربة حياتك كلها)', englishText: 'Have you ever', role: 'auxiliary', explanation: 'Life experience question formula' },
              { arabicText: 'زرت', englishText: 'visited', role: 'verb', explanation: 'Past participle' },
              { arabicText: 'اليابان', englishText: 'Japan', role: 'object', explanation: 'Proper noun' }
            ],
            habitHint: 'When asking whether an experience occurred at any point in a living person\'s life, English uses "Have you ever...".'
          }
        ]
      },
      {
        id: 'p2-l2',
        phaseId: 2,
        phaseTitle: 'Flow & Nuance',
        phaseLevel: 'B1 – B2',
        number: 10,
        title: 'Zero Relative Clauses & The Ghost Pronoun (ضمير العائد)',
        titleAr: 'صلة الموصول وحذف ضمير العائد (The Ghost Pronoun)',
        transferConcept: 'Arabic requires a resumptive pronoun referring back to the head noun in relative clauses (الرجل الذي رأيته = "the man that I saw HIM"). English strictly bans this redundant ghost pronoun when the relative pronoun serves as the direct object.',
        transferConceptAr: 'العربية تتطلب وجود ضمير العائد على الاسم الموصول (الفيلم الذي شاهدتـه). الإنجليزية تحظر تكرار هذا الضمير منعاً باتاً: تقول "the movie I watched" وليس "the movie I watched it".',
        weakSpotTag: 'resumptive-pronoun',
        exercises: [
          {
            id: 'ex-2-2-1',
            arabicThought: 'الكتاب الذي استعرته مفيد جداً',
            englishTarget: 'The book I borrowed is very useful',
            acceptableAlternatives: [
              'The book that I borrowed is very useful',
              'The book which I borrowed is very useful'
            ],
            wordChips: ['The', 'book', 'I', 'borrowed', 'is', 'very', 'useful', 'it', 'him', 'was'],
            breakdownChunks: [
              { arabicText: 'الكتاب', englishText: 'The book', role: 'subject', explanation: 'Head noun' },
              { arabicText: 'الذي استعرته (بدون "ـه")', englishText: 'I borrowed', role: 'modifier', explanation: 'Reduced relative clause (NO "it"!)' },
              { arabicText: 'هو', englishText: 'is', role: 'verb', explanation: 'Main clause copula' },
              { arabicText: 'مفيد جداً', englishText: 'very useful', role: 'modifier', explanation: 'Adjective complement' }
            ],
            habitHint: 'Delete the Arabic resumptive pronoun "ـه". Say "The book I borrowed", NOT "The book I borrowed it".'
          },
          {
            id: 'ex-2-2-2',
            arabicThought: 'هذا هو المهندس الذي تحدثت معه أمس',
            englishTarget: 'This is the engineer I spoke with yesterday',
            acceptableAlternatives: [
              'This is the engineer that I spoke with yesterday',
              'This is the engineer whom I spoke with yesterday'
            ],
            wordChips: ['This', 'is', 'the', 'engineer', 'I', 'spoke', 'with', 'yesterday', 'him', 'spoke him'],
            breakdownChunks: [
              { arabicText: 'هذا هو المهندس', englishText: 'This is the engineer', role: 'subject', explanation: 'Main clause' },
              { arabicText: 'الذي تحدثت معه', englishText: 'I spoke with', role: 'modifier', explanation: 'Relative clause with stranded preposition' },
              { arabicText: 'أمس', englishText: 'yesterday', role: 'connector', explanation: 'Time adverb' }
            ],
            habitHint: 'The preposition "with" stays, but discard "him" at the end: "the engineer I spoke with".'
          },
          {
            id: 'ex-2-2-3',
            arabicThought: 'المكان الذي زرناه كان مذهلاً',
            englishTarget: 'The place we visited was amazing',
            acceptableAlternatives: [
              'The place that we visited was amazing',
              'The place which we visited was amazing'
            ],
            wordChips: ['The', 'place', 'we', 'visited', 'was', 'amazing', 'it', 'there', 'is'],
            breakdownChunks: [
              { arabicText: 'المكان', englishText: 'The place', role: 'subject', explanation: 'Head noun' },
              { arabicText: 'الذي زرناه (بدون "ـه")', englishText: 'we visited', role: 'modifier', explanation: 'Relative clause with zero ghost pronoun' },
              { arabicText: 'كان', englishText: 'was', role: 'verb', explanation: 'Past copula' },
              { arabicText: 'مذهلاً', englishText: 'amazing', role: 'modifier', explanation: 'Predicate adjective' }
            ],
            habitHint: 'Drop "it" after "visited": "The place we visited was amazing".'
          }
        ]
      },
      {
        id: 'p2-l3',
        phaseId: 2,
        phaseTitle: 'Flow & Nuance',
        phaseLevel: 'B1 – B2',
        number: 11,
        title: 'Hypothetical Conditionals (لو vs إذا)',
        titleAr: 'الجمل الشرطية والافتراض الذهني (لو مقابل إذا)',
        transferConcept: 'Arabic distinguishes real conditions (إذا / إن) from hypothetical unreal conditions (لو). English mirrors this by stepping tense back into the past ("If I had / If I were") and pairing it with modal "would" in the result clause.',
        transferConceptAr: 'العربية تفرق بين إذا الواقعية ولو الامتناعية. في الإنجليزية يقابل "لو" الرجوع خطوة زمنية للماضي (If I were / had) مع استخدام "would" في جواب الشرط.',
        weakSpotTag: 'conditional-backshift',
        exercises: [
          {
            id: 'ex-2-3-1',
            arabicThought: 'لو كنت مكانك لقبلت ذلك العرض',
            englishTarget: 'If I were you I would accept that offer',
            acceptableAlternatives: [
              "If I were you I'd accept that offer",
              'If I was you I would accept that offer',
              "If I was you I'd accept that offer"
            ],
            wordChips: ['If', 'I', 'were', 'you', 'would', 'accept', 'that', 'offer', 'will', 'am', 'accepted'],
            breakdownChunks: [
              { arabicText: 'لو كنت مكانك', englishText: 'If I were you', role: 'connector', explanation: 'Hypothetical condition (subjunctive were)' },
              { arabicText: 'أنا', englishText: 'I', role: 'subject', explanation: 'Subject' },
              { arabicText: 'لقبلت (لـ)', englishText: 'would accept', role: 'verb', explanation: 'Modal conditional verb phrase' },
              { arabicText: 'ذلك العرض', englishText: 'that offer', role: 'object', explanation: 'Demonstrative phrase' }
            ],
            habitHint: 'Hypothetical advice takes the subjunctive: "If I were you, I would...". Never say "If I am you I will".'
          },
          {
            id: 'ex-2-3-2',
            arabicThought: 'لو كان لدي المزيد من الوقت لسافرت أكثر',
            englishTarget: 'If I had more time I would travel more',
            acceptableAlternatives: ["If I had more time I'd travel more"],
            wordChips: ['If', 'I', 'had', 'more', 'time', 'would', 'travel', 'will', 'have', 'traveled'],
            breakdownChunks: [
              { arabicText: 'لو كان لدي وقت أكثر', englishText: 'If I had more time', role: 'connector', explanation: 'Past form expressing present unreality' },
              { arabicText: 'لسافرت أكثر', englishText: 'I would travel more', role: 'verb', explanation: 'Modal result' }
            ],
            habitHint: 'Unreal present conditions shift the condition verb to the past ("If I had"), followed by "would travel".'
          },
          {
            id: 'ex-2-3-3',
            arabicThought: 'إذا أمطرت غداً سنلغي الرحلة',
            englishTarget: 'If it rains tomorrow we will cancel the trip',
            acceptableAlternatives: ["If it rains tomorrow we'll cancel the trip"],
            wordChips: ['If', 'it', 'rains', 'tomorrow', 'we', 'will', 'cancel', 'the', 'trip', 'would', 'rained'],
            breakdownChunks: [
              { arabicText: 'إذا أمطرت غداً (واقعي)', englishText: 'If it rains tomorrow', role: 'connector', explanation: 'Real first conditional (present tense)' },
              { arabicText: 'سنلغي الرحلة', englishText: 'we will cancel the trip', role: 'verb', explanation: 'Future real consequence with "will"' }
            ],
            habitHint: 'For real possibilities in the future, use the present tense after "if" ("If it rains"), and "will" in the result.'
          }
        ]
      },
      {
        id: 'p2-l4',
        phaseId: 2,
        phaseTitle: 'Flow & Nuance',
        phaseLevel: 'B1 – B2',
        number: 12,
        title: 'Contrast & Cause: Although, Because, and So',
        titleAr: 'السببية والتعارض: Although و Because و So',
        transferConcept: 'Arabic frequently doubles contrast markers (على الرغم من... لكنه / بسبب... لذلك). In English, a subordinating conjunction (Although / Because) binds the clauses on its own; inserting "but" or "so" creates an ungrammatical double-connector.',
        transferConceptAr: 'العربية تجمع بين أداتي الربط معاً (بالرغم من كذا... لكنه كذا / بسبب كذا... لذلك كذا). الإنجليزية تمنع الازدواج: استخدم إما Although وحدها، أو But وحدها.',
        weakSpotTag: 'double-connector',
        exercises: [
          {
            id: 'ex-2-2-12',
            arabicThought: 'على الرغم من أنه كان متعباً، إلا أنه أنهى التقرير',
            englishTarget: 'Although he was tired he finished the report',
            acceptableAlternatives: [
              'Even though he was tired he finished the report',
              'He finished the report although he was tired'
            ],
            wordChips: ['Although', 'he', 'was', 'tired', 'finished', 'the', 'report', 'but', 'so', 'however'],
            breakdownChunks: [
              { arabicText: 'على الرغم من أنه كان متعباً', englishText: 'Although he was tired', role: 'connector', explanation: 'Subordinate clause of concession' },
              { arabicText: 'إلا أنه (محظور وضع but!)', englishText: 'he', role: 'subject', explanation: 'Main clause subject' },
              { arabicText: 'أنهى', englishText: 'finished', role: 'verb', explanation: 'Past verb' },
              { arabicText: 'التقرير', englishText: 'the report', role: 'object', explanation: 'Direct object' }
            ],
            habitHint: 'Never pair "Although" with "but". One connector controls the entire relationship.'
          },
          {
            id: 'ex-2-4-2',
            arabicThought: 'لأنه كان مريضاً، لم يتمكن من حضور الحفل',
            englishTarget: 'Because he was sick he could not attend the party',
            acceptableAlternatives: [
              "Because he was sick he couldn't attend the party",
              'He could not attend the party because he was sick'
            ],
            wordChips: ['Because', 'he', 'was', 'sick', 'could', 'not', 'attend', 'the', 'party', 'so', 'therefore'],
            breakdownChunks: [
              { arabicText: 'لأنه كان مريضاً', englishText: 'Because he was sick', role: 'connector', explanation: 'Causal subordinate clause' },
              { arabicText: 'لم يتمكن من حضور الحفل', englishText: 'he could not attend the party', role: 'verb', explanation: 'Main clause (do not add "so"!)' }
            ],
            habitHint: 'If you start with "Because", never put "so" in the middle of the sentence.'
          },
          {
            id: 'ex-2-4-3',
            arabicThought: 'فاتني القطار، ولذلك وصلت متأخراً',
            englishTarget: 'I missed the train so I arrived late',
            acceptableAlternatives: ['I missed the train and so I arrived late'],
            wordChips: ['I', 'missed', 'the', 'train', 'so', 'arrived', 'late', 'because', 'although'],
            breakdownChunks: [
              { arabicText: 'فاتني القطار', englishText: 'I missed the train', role: 'subject', explanation: 'Cause' },
              { arabicText: 'ولذلك', englishText: 'so', role: 'connector', explanation: 'Coordinating conjunction of result' },
              { arabicText: 'وصلت متأخراً', englishText: 'I arrived late', role: 'verb', explanation: 'Effect' }
            ],
            habitHint: 'When connecting independent cause and effect, "so" stands cleanly between the two clauses.'
          }
        ]
      },
      {
        id: 'p2-l5',
        phaseId: 2,
        phaseTitle: 'Flow & Nuance',
        phaseLevel: 'B1 – B2',
        number: 13,
        title: 'Phrasal Verbs & Spatial Particle Logic',
        titleAr: 'الأفعال المركبة (Phrasal Verbs) والمنطق الحركي',
        transferConcept: 'Arabic verbs usually carry their semantic shift through internal morphological patterns (أطفأ vs انطفأ). English shifts meaning by snapping spatial prepositions/particles onto simple base verbs (turn + off, give + up, run + out of).',
        transferConceptAr: 'العربية تشتق المعاني من أوزان الأفعال الصرفية (أطفأ، استسلم). الإنجليزية تعتمد على دمج الفعل الأساسي مع حرف مكان يغير المعنى بالكامل: turn off (يطفئ)، give up (يستسلم).',
        weakSpotTag: 'phrasal-verbs',
        exercises: [
          {
            id: 'ex-2-5-1',
            arabicThought: 'رجاءً أطفئ الأنوار قبل أن تغادر',
            englishTarget: 'Please turn off the lights before you leave',
            acceptableAlternatives: [
              'Please switch off the lights before you leave',
              'Turn off the lights please before you leave'
            ],
            wordChips: ['Please', 'turn', 'off', 'the', 'lights', 'before', 'you', 'leave', 'close', 'shut', 'out'],
            breakdownChunks: [
              { arabicText: 'رجاءً', englishText: 'Please', role: 'modifier', explanation: 'Politeness marker' },
              { arabicText: 'أطفئ', englishText: 'turn off', role: 'verb', explanation: 'Phrasal verb (never "close the lights"!)' },
              { arabicText: 'الأنوار', englishText: 'the lights', role: 'object', explanation: 'Direct object' },
              { arabicText: 'قبل أن تغادر', englishText: 'before you leave', role: 'connector', explanation: 'Time clause' }
            ],
            habitHint: 'In Arabic, speakers often say "أغلق النور" and translate it literally as "close the lights". In English, devices and electricity take "turn off" or "switch off".'
          },
          {
            id: 'ex-2-5-2',
            arabicThought: 'لقد نفد منا البنزين في منتصف الطريق',
            englishTarget: 'We ran out of gas in the middle of the road',
            acceptableAlternatives: [
              'We ran out of petrol in the middle of the road',
              'We have run out of gas in the middle of the road'
            ],
            wordChips: ['We', 'ran', 'out', 'of', 'gas', 'in', 'the', 'middle', 'road', 'finished', 'petrol'],
            breakdownChunks: [
              { arabicText: 'نفد منا', englishText: 'We ran out of', role: 'verb', explanation: 'Three-part phrasal verb meaning depletion' },
              { arabicText: 'البنزين', englishText: 'gas', role: 'object', explanation: 'Depleted resource' },
              { arabicText: 'في منتصف الطريق', englishText: 'in the middle of the road', role: 'connector', explanation: 'Locational idiom' }
            ],
            habitHint: 'To say something was depleted, use the phrasal verb "run out of", not "gas finished from us".'
          },
          {
            id: 'ex-2-5-3',
            arabicThought: 'لا تستسلم أبداً مهما كانت الصعوبات',
            englishTarget: 'Never give up no matter the difficulties',
            acceptableAlternatives: [
              'Do not ever give up no matter the difficulties',
              'Never give up whatever the difficulties'
            ],
            wordChips: ['Never', 'give', 'up', 'no', 'matter', 'the', 'difficulties', 'surrender', 'down', 'in'],
            breakdownChunks: [
              { arabicText: 'لا ... أبداً', englishText: 'Never', role: 'modifier', explanation: 'Emphatic negative frequency adverb' },
              { arabicText: 'تستسلم', englishText: 'give up', role: 'verb', explanation: 'Idiomatic phrasal verb' },
              { arabicText: 'مهما كانت الصعوبات', englishText: 'no matter the difficulties', role: 'connector', explanation: 'Concessive adverbial phrase' }
            ],
            habitHint: 'The everyday natural English expression for "استسلم" is the phrasal verb "give up".'
          }
        ]
      },
      {
        id: 'p2-l6',
        phaseId: 2,
        phaseTitle: 'Flow & Nuance',
        phaseLevel: 'B1 – B2',
        number: 14,
        title: 'Countable vs Uncountable Mass Nouns',
        titleAr: 'الأسماء المعدودة وغير المعدودة وفخ الجمع (نصائح، معلومات)',
        transferConcept: 'In Arabic, words like "معلومات", "نصائح", and "أثاث" are plural countable nouns. In English, information, advice, furniture, luggage, and homework are strictly singular uncountable mass nouns (they never take an -s or "a").',
        transferConceptAr: 'العربية تجمع كلمات مثل "نصائح" و"معلومات" و"أثاث". في الإنجليزية، هذه الكلمات أسماء غير معدودة مصمتة (Mass Nouns): لا تُجمع بإضافة s ولا تأخذ أداة a بمفردها.',
        weakSpotTag: 'uncountable-nouns',
        exercises: [
          {
            id: 'ex-2-6-1',
            arabicThought: 'أعطاني المدير بعض النصائح المفيدة',
            englishTarget: 'The manager gave me some useful advice',
            acceptableAlternatives: [
              'The boss gave me some useful advice',
              'The manager provided me with some useful advice'
            ],
            wordChips: ['The', 'manager', 'gave', 'me', 'some', 'useful', 'advice', 'advices', 'an', 'tips'],
            breakdownChunks: [
              { arabicText: 'المدير', englishText: 'The manager', role: 'subject', explanation: 'Subject' },
              { arabicText: 'أعطاني', englishText: 'gave me', role: 'verb', explanation: 'Ditransitive verb' },
              { arabicText: 'بعض النصائح المفيدة', englishText: 'some useful advice', role: 'object', explanation: 'Uncountable noun: NEVER "advices"!' }
            ],
            habitHint: '"Advice" in English is always uncountable. Never say "an advice" or "advices". Use "some advice" or "a piece of advice".'
          },
          {
            id: 'ex-2-6-2',
            arabicThought: 'هذه المعلومات سرية للغاية',
            englishTarget: 'This information is strictly confidential',
            acceptableAlternatives: [
              'This information is very confidential',
              'This information is highly confidential'
            ],
            wordChips: ['This', 'information', 'is', 'strictly', 'confidential', 'These', 'are', 'informations'],
            breakdownChunks: [
              { arabicText: 'هذه المعلومات', englishText: 'This information', role: 'subject', explanation: 'Singular demonstrative "This" with mass noun' },
              { arabicText: 'تكون', englishText: 'is', role: 'verb', explanation: 'Singular copula "is" (NOT "are"!)' },
              { arabicText: 'سرية للغاية', englishText: 'strictly confidential', role: 'modifier', explanation: 'Collocation adverb + adjective' }
            ],
            habitHint: 'Even though Arabic says "هذه المعلومات" (plural thought), English treats "information" as singular: say "This information IS", never "These informations are".'
          },
          {
            id: 'ex-2-6-3',
            arabicThought: 'اشترينا أثاثاً جديداً لغرفة المعيشة',
            englishTarget: 'We bought new furniture for the living room',
            acceptableAlternatives: ['We bought some new furniture for the living room'],
            wordChips: ['We', 'bought', 'new', 'furniture', 'for', 'the', 'living', 'room', 'furnitures', 'a'],
            breakdownChunks: [
              { arabicText: 'نحن اشترينا', englishText: 'We bought', role: 'verb', explanation: 'Subject and action' },
              { arabicText: 'أثاثاً جديداً', englishText: 'new furniture', role: 'object', explanation: 'Mass noun with no plural suffix' },
              { arabicText: 'لغرفة المعيشة', englishText: 'for the living room', role: 'connector', explanation: 'Prepositional phrase' }
            ],
            habitHint: '"Furniture" represents the whole collection as a mass. Never write "furnitures".'
          }
        ]
      },
      {
        id: 'p2-l7',
        phaseId: 2,
        phaseTitle: 'Flow & Nuance',
        phaseLevel: 'B1 – B2',
        number: 15,
        title: 'Gerunds vs Infinitives After Prepositions',
        titleAr: 'اسم الفاعل (Gerund) والمصدر بعد حروف الجر',
        transferConcept: 'In Arabic, prepositions can easily be followed by verbal nouns (المصدر الصريح) or "أن" + verb. In English, ANY verb immediately following ANY preposition must take the -ing form (gerund), including expressions like "look forward to".',
        transferConceptAr: 'في العربية يمكن وضع المصدر بعد حروف الجر بسهولة. في الإنجليزية، أي فعل يقع مباشرة بعد حرف جر يجب حتماً أن ينتهي بـ -ing (Gerund)، حتى في عبارات مثل look forward to.',
        weakSpotTag: 'gerund-preposition',
        exercises: [
          {
            id: 'ex-2-7-1',
            arabicThought: 'أنا أتطلع بشوق إلى لقائك قريباً',
            englishTarget: 'I look forward to meeting you soon',
            acceptableAlternatives: [
              "I'm looking forward to meeting you soon",
              'I look forward to seeing you soon'
            ],
            wordChips: ['I', 'look', 'forward', 'to', 'meeting', 'you', 'soon', 'meet', 'to meet', 'see'],
            breakdownChunks: [
              { arabicText: 'أنا أتطلع بشوق إلى', englishText: 'I look forward to', role: 'verb', explanation: '"to" here is a preposition, NOT an infinitive marker!' },
              { arabicText: 'لقائك', englishText: 'meeting you', role: 'object', explanation: 'Gerund (-ing) required after the preposition' },
              { arabicText: 'قريباً', englishText: 'soon', role: 'modifier', explanation: 'Adverb' }
            ],
            habitHint: 'In "look forward to", the word "to" is a preposition! Therefore, the following verb MUST take -ing: "meeting you", NOT "meet you".'
          },
          {
            id: 'ex-2-7-2',
            arabicThought: 'هو مهتم بتعلم لغات جديدة',
            englishTarget: 'He is interested in learning new languages',
            acceptableAlternatives: ["He's interested in learning new languages"],
            wordChips: ['He', 'is', 'interested', 'in', 'learning', 'new', 'languages', 'to', 'learn', 'at'],
            breakdownChunks: [
              { arabicText: 'هو مهتم بـ', englishText: 'He is interested in', role: 'verb', explanation: 'Adjective + preposition collocation' },
              { arabicText: 'تعلم', englishText: 'learning', role: 'object', explanation: 'Verb after "in" takes -ing' },
              { arabicText: 'لغات جديدة', englishText: 'new languages', role: 'object', explanation: 'Modifier + plural noun' }
            ],
            habitHint: 'Any verb right after the preposition "in" must end in -ing ("learning").'
          },
          {
            id: 'ex-2-7-3',
            arabicThought: 'شكراً لمساعدتي في هذه المشكلة',
            englishTarget: 'Thank you for helping me with this problem',
            acceptableAlternatives: ['Thanks for helping me with this problem'],
            wordChips: ['Thank', 'you', 'for', 'helping', 'me', 'with', 'this', 'problem', 'help', 'to', 'in'],
            breakdownChunks: [
              { arabicText: 'شكراً لك', englishText: 'Thank you', role: 'verb', explanation: 'Formulaic thanks' },
              { arabicText: 'على مساعدتي', englishText: 'for helping me', role: 'connector', explanation: 'Preposition "for" + gerund "helping"' },
              { arabicText: 'في هذه المشكلة', englishText: 'with this problem', role: 'modifier', explanation: 'Prepositional complement' }
            ],
            habitHint: 'After "for", the verb takes -ing: "for helping me".'
          }
        ]
      },
      {
        id: 'p2-l8',
        phaseId: 2,
        phaseTitle: 'Flow & Nuance',
        phaseLevel: 'B1 – B2',
        number: 16,
        title: 'Passive Voice & Agent Demotion (المبني للمجهول)',
        titleAr: 'المبني للمجهول وتغيير بؤرة الاهتمام في الجملة',
        transferConcept: 'Arabic builds passive voice primarily through internal vowel shifting (كُتِبَ / يُكْتَبُ) without extra auxiliary verbs. English builds the passive with two distinct moving parts: an explicit form of "to be" + Past Participle (was written / is being built).',
        transferConceptAr: 'العربية تصوغ المبني للمجهول بحركات الحروف وتغيير البنية الصرفية (كُسِرَ، أُغلِقَ). الإنجليزية تتطلب تركيباً مركباً: تصريف مناسب لفعل to be + التصريف الثالث (was broken).',
        weakSpotTag: 'passive-construction',
        exercises: [
          {
            id: 'ex-2-8-1',
            arabicThought: 'كُسرت النافذة أثناء العاصفة الليلة الماضية',
            englishTarget: 'The window was broken during the storm last night',
            acceptableAlternatives: ['During the storm last night the window was broken'],
            wordChips: ['The', 'window', 'was', 'broken', 'during', 'the', 'storm', 'last', 'night', 'is', 'broke'],
            breakdownChunks: [
              { arabicText: 'النافذة', englishText: 'The window', role: 'subject', explanation: 'Patient promoted to subject' },
              { arabicText: 'كُسرت (مبني للمجهول)', englishText: 'was broken', role: 'verb', explanation: 'Past copula "was" + past participle "broken"' },
              { arabicText: 'أثناء العاصفة الليلة الماضية', englishText: 'during the storm last night', role: 'connector', explanation: 'Time and event prepositional phrase' }
            ],
            habitHint: 'Arabic changes the vowels (كُسِرت). English requires the past auxiliary "was" plus the participle "broken".'
          },
          {
            id: 'ex-2-8-2',
            arabicThought: 'يتم بناء هذا الجسر في الوقت الحالي',
            englishTarget: 'This bridge is being built right now',
            acceptableAlternatives: ['This bridge is being built currently'],
            wordChips: ['This', 'bridge', 'is', 'being', 'built', 'right', 'now', 'is building', 'builded', 'at'],
            breakdownChunks: [
              { arabicText: 'هذا الجسر', englishText: 'This bridge', role: 'subject', explanation: 'Subject' },
              { arabicText: 'يتم بناؤه حالياً', englishText: 'is being built', role: 'verb', explanation: 'Present continuous passive: is + being + V3' },
              { arabicText: 'في الوقت الحالي', englishText: 'right now', role: 'connector', explanation: 'Time anchor' }
            ],
            habitHint: 'For continuous passive, English pairs "is being" with the participle "built".'
          },
          {
            id: 'ex-2-8-3',
            arabicThought: 'أُرسلت الرسالة عن طريق الخطأ',
            englishTarget: 'The message was sent by mistake',
            acceptableAlternatives: [
              'The email was sent by mistake',
              'The letter was sent by mistake'
            ],
            wordChips: ['The', 'message', 'was', 'sent', 'by', 'mistake', 'is', 'send', 'with'],
            breakdownChunks: [
              { arabicText: 'الرسالة', englishText: 'The message', role: 'subject', explanation: 'Subject' },
              { arabicText: 'أُرسلت', englishText: 'was sent', role: 'verb', explanation: 'Past passive verb phrase' },
              { arabicText: 'عن طريق الخطأ', englishText: 'by mistake', role: 'connector', explanation: 'Prepositional idiom of manner' }
            ],
            habitHint: 'Past passive takes "was sent", followed by the idiom "by mistake".'
          }
        ]
      }
    ]
  },
  {
    id: 3,
    title: 'Mastery & Register',
    titleAr: 'الإتقان والأسلوب الرفيع',
    level: 'B2+ – C1',
    tagline: 'Refine high-register rhetoric: syntactic inversion, backshifting, clefting, and nuanced collocations.',
    lessons: [
      {
        id: 'p3-l1',
        phaseId: 3,
        phaseTitle: 'Mastery & Register',
        phaseLevel: 'B2+ – C1',
        number: 17,
        title: 'Negative & Limiting Inversion for Rhetorical Emphasis',
        titleAr: 'التقديم والتأخير البلاغي (Inversion) بعد أدوات الحصر والنفي',
        transferConcept: 'When a formal English sentence opens with a restrictive or negative adverb (Seldom, Rarely, Never, Scarcely), the subject and auxiliary invert just like in a question (Seldom do we see...). Arabic speakers tend to retain standard SVO word order.',
        transferConceptAr: 'عندما تبدأ الجملة الإنجليزية بظرف نفي أو تقييد بلاغي (Seldom, Rarely, Under no circumstances)، ينقلب الفاعل مع الفعل المساعد تماماً كما في السؤال. المتحدث بالعربية يميل للحفاظ على الترتيب العادي.',
        weakSpotTag: 'inversion-syntax',
        exercises: [
          {
            id: 'ex-3-1-1',
            arabicThought: 'نادراً ما نرى مثل هذا الالتزام الرائع',
            englishTarget: 'Seldom do we see such extraordinary dedication',
            acceptableAlternatives: [
              'Rarely do we see such extraordinary dedication',
              'Seldom do we see such remarkable commitment',
              'Rarely do we see such great commitment'
            ],
            wordChips: ['Seldom', 'do', 'we', 'see', 'such', 'extraordinary', 'dedication', 'we see', 'are', 'did'],
            breakdownChunks: [
              { arabicText: 'نادراً ما (تقديم بلاغي)', englishText: 'Seldom', role: 'modifier', explanation: 'Fronted negative adverbial requiring inversion' },
              { arabicText: 'نرى', englishText: 'do we see', role: 'verb', explanation: 'Inverted auxiliary "do" + subject "we" + base verb "see"' },
              { arabicText: 'مثل هذا الالتزام الرائع', englishText: 'such extraordinary dedication', role: 'object', explanation: 'Intensifier + adjective + abstract noun' }
            ],
            habitHint: 'Starting with "Seldom" forces question-style inversion: "Seldom do we see...", NOT "Seldom we see".'
          },
          {
            id: 'ex-3-1-2',
            arabicThought: 'لم أكن أعلم قط أن الحقيقة ستتكشف بهذا الشكل',
            englishTarget: 'Little did I know that the truth would unfold like this',
            acceptableAlternatives: [
              'Little did I know that the truth would be revealed like this'
            ],
            wordChips: ['Little', 'did', 'I', 'know', 'that', 'the', 'truth', 'would', 'unfold', 'like', 'this', 'I knew'],
            breakdownChunks: [
              { arabicText: 'لم أكن أعلم قط', englishText: 'Little did I know', role: 'auxiliary', explanation: 'Formal idiomatic inversion formula' },
              { arabicText: 'أن الحقيقة ستتكشف بهذا الشكل', englishText: 'that the truth would unfold like this', role: 'object', explanation: 'Noun clause with backshifted modal' }
            ],
            habitHint: 'Opening with "Little" triggers inversion with past auxiliary: "Little did I know", not "Little I knew".'
          },
          {
            id: 'ex-3-1-3',
            arabicThought: 'لا ينبغي تحت أي ظرف من الظروف انتهاك هذه السياسة',
            englishTarget: 'Under no circumstances should this policy be violated',
            acceptableAlternatives: [
              'Under no circumstances must this policy be violated'
            ],
            wordChips: ['Under', 'no', 'circumstances', 'should', 'this', 'policy', 'be', 'violated', 'this policy should', 'not'],
            breakdownChunks: [
              { arabicText: 'تحت أي ظرف من الظروف (نفي مطلق)', englishText: 'Under no circumstances', role: 'connector', explanation: 'Fronted negative prepositional phrase' },
              { arabicText: 'لا ينبغي انتهاك هذه السياسة', englishText: 'should this policy be violated', role: 'verb', explanation: 'Inverted modal + subject + passive infinitive' }
            ],
            habitHint: 'After "Under no circumstances", invert the modal: "should this policy be violated".'
          }
        ]
      },
      {
        id: 'p3-l2',
        phaseId: 3,
        phaseTitle: 'Mastery & Register',
        phaseLevel: 'B2+ – C1',
        number: 18,
        title: 'Reported Speech & Tense Backshifting (تطابق الأزمنة)',
        titleAr: 'الكلام المنقول والتراجع الزمني (Backshifting)',
        transferConcept: 'In Arabic, reported speech often keeps the direct tense intact (قال إنه مشغول الآن = "He said he IS busy"). In standard English, if the reporting verb is in the past ("He said"), all subordinate verbs must backshift into past harmony (He said he WAS busy).',
        transferConceptAr: 'في العربية، يحتفظ الكلام المنقول بزمنه الأصلي (قال إنه مسافر غداً). في الإنجليزية، إذا كان فعل القول ماضياً (He said)، يجب إرجاع زمن الجملة التابعة خطوة للماضي لتحقيق التناغم الزمني (He said he was traveling).',
        weakSpotTag: 'backshifting-error',
        exercises: [
          {
            id: 'ex-3-2-1',
            arabicThought: 'أخبرني أنه مشغول جداً بمشروع جديد',
            englishTarget: 'He told me that he was very busy with a new project',
            acceptableAlternatives: [
              'He told me he was very busy with a new project'
            ],
            wordChips: ['He', 'told', 'me', 'that', 'he', 'was', 'very', 'busy', 'with', 'a', 'new', 'project', 'is'],
            breakdownChunks: [
              { arabicText: 'أخبرني', englishText: 'He told me', role: 'verb', explanation: 'Reporting clause in past tense' },
              { arabicText: 'أنه مشغول (تراجع زمني)', englishText: 'that he was very busy', role: 'subject', explanation: 'Backshifted copula: "is" becomes "was"' },
              { arabicText: 'بمشروع جديد', englishText: 'with a new project', role: 'connector', explanation: 'Prepositional phrase' }
            ],
            habitHint: 'Arabic preserves "مشغول" in the present, but because the reporting verb is "told" (past), English requires backshifting: "he was busy", NOT "he is busy".'
          },
          {
            id: 'ex-3-2-2',
            arabicThought: 'قالت إنها ستنهي المهمة قبل الموعد النهائي',
            englishTarget: 'She said she would finish the task before the deadline',
            acceptableAlternatives: [
              'She said that she would finish the task before the deadline'
            ],
            wordChips: ['She', 'said', 'she', 'would', 'finish', 'the', 'task', 'before', 'deadline', 'will', 'that'],
            breakdownChunks: [
              { arabicText: 'قالت', englishText: 'She said', role: 'verb', explanation: 'Past reporting verb' },
              { arabicText: 'إنها ستنهي', englishText: 'she would finish', role: 'verb', explanation: 'Future in the past: "will" backshifts to "would"' },
              { arabicText: 'المهمة قبل الموعد النهائي', englishText: 'the task before the deadline', role: 'object', explanation: 'Object phrase and temporal limit' }
            ],
            habitHint: 'After "said", "will" must backshift to "would".'
          },
          {
            id: 'ex-3-2-3',
            arabicThought: 'أكدوا أنهم قد استلموا جميع المستندات المطلوبة',
            englishTarget: 'They confirmed that they had received all the required documents',
            acceptableAlternatives: [
              'They confirmed they had received all required documents'
            ],
            wordChips: ['They', 'confirmed', 'that', 'they', 'had', 'received', 'all', 'the', 'required', 'documents', 'have'],
            breakdownChunks: [
              { arabicText: 'أكدوا', englishText: 'They confirmed', role: 'verb', explanation: 'Reporting verb' },
              { arabicText: 'أنهم قد استلموا', englishText: 'that they had received', role: 'verb', explanation: 'Past perfect backshift from have received' },
              { arabicText: 'جميع المستندات المطلوبة', englishText: 'all the required documents', role: 'object', explanation: 'Noun phrase' }
            ],
            habitHint: 'Present perfect ("have received") backshifts to Past Perfect ("had received") following the past reporting verb "confirmed".'
          }
        ]
      },
      {
        id: 'p3-l3',
        phaseId: 3,
        phaseTitle: 'Mastery & Register',
        phaseLevel: 'B2+ – C1',
        number: 19,
        title: 'Nuanced Modals: Deduction & Regret (Past Modals)',
        titleAr: 'أفعال الاستنتاج والندم في الماضي (Should have / Must have)',
        transferConcept: 'Arabic speakers often express past regret or deduction by prefixing "كان يجب" or "لا بد أنه" followed by a present verb. In English, modal deduction in the past demands the formula: Modal + have + Past Participle (should have called, must have known).',
        transferConceptAr: 'العربية تصوغ الندم أو الاستنتاج الماضي بتركيب "كان يجب أن" متبوعاً بفعل مضارع. الإنجليزية تتبع صيغة ثابتة لا تتغير: Modal + have + V3 (مثل should have called / must have known).',
        weakSpotTag: 'past-modals',
        exercises: [
          {
            id: 'ex-3-19-1',
            arabicThought: 'كان يجب أن تخبرني عن التغيير في وقت سابق',
            englishTarget: 'You should have told me about the change earlier',
            acceptableAlternatives: [
              "You should've told me about the change earlier",
              'You ought to have told me about the change earlier'
            ],
            wordChips: ['You', 'should', 'have', 'told', 'me', 'about', 'the', 'change', 'earlier', 'must', 'tell', 'had'],
            breakdownChunks: [
              { arabicText: 'أنت', englishText: 'You', role: 'subject', explanation: 'Subject' },
              { arabicText: 'كان يجب أن تخبرني', englishText: 'should have told me', role: 'verb', explanation: 'Modal of past regret: should + have + V3 + pronoun' },
              { arabicText: 'عن التغيير', englishText: 'about the change', role: 'object', explanation: 'Topic' },
              { arabicText: 'في وقت سابق', englishText: 'earlier', role: 'modifier', explanation: 'Comparative adverb' }
            ],
            habitHint: 'To express "كان يجب أن تفعل", the English blueprint is strictly "should have + past participle" ("should have told").'
          },
          {
            id: 'ex-3-19-2',
            arabicThought: 'لا بد أنه قد نسي موعد الاجتماع',
            englishTarget: 'He must have forgotten the meeting appointment',
            acceptableAlternatives: [
              'He must have forgotten about the meeting',
              "He must've forgotten about the meeting"
            ],
            wordChips: ['He', 'must', 'have', 'forgotten', 'the', 'meeting', 'appointment', 'about', 'forgot', 'had'],
            breakdownChunks: [
              { arabicText: 'هو', englishText: 'He', role: 'subject', explanation: 'Subject' },
              { arabicText: 'لا بد أنه نسي (استنتاج شبه يقيني)', englishText: 'must have forgotten', role: 'verb', explanation: 'Modal of past deduction: must + have + V3' },
              { arabicText: 'موعد الاجتماع', englishText: 'the meeting appointment', role: 'object', explanation: 'Noun adjunct phrase' }
            ],
            habitHint: 'Past logical deduction ("لا بد أنه فعل") translates to "must have + V3" ("must have forgotten").'
          },
          {
            id: 'ex-3-19-3',
            arabicThought: 'لم يكن بإمكانه توقع مثل هذا التطور المفاجئ',
            englishTarget: 'He could not have anticipated such a sudden development',
            acceptableAlternatives: [
              "He couldn't have anticipated such a sudden development",
              'He could not have foreseen such a sudden development'
            ],
            wordChips: ['He', 'could', 'not', 'have', 'anticipated', 'such', 'a', 'sudden', 'development', 'anticipate', 'can'],
            breakdownChunks: [
              { arabicText: 'لم يكن بإمكانه', englishText: 'He could not have', role: 'auxiliary', explanation: 'Negative past modal capability' },
              { arabicText: 'توقع', englishText: 'anticipated', role: 'verb', explanation: 'Past participle of formal verb' },
              { arabicText: 'مثل هذا التطور المفاجئ', englishText: 'such a sudden development', role: 'object', explanation: 'Intensifier + noun phrase' }
            ],
            habitHint: 'Negative past impossibility uses "could not have + past participle".'
          }
        ]
      },
      {
        id: 'p3-l4',
        phaseId: 3,
        phaseTitle: 'Mastery & Register',
        phaseLevel: 'B2+ – C1',
        number: 20,
        title: 'Cleft Sentences & Structural Highlighting',
        titleAr: 'الجمل المشطورة (Cleft Sentences) وتركيز الضوء الدلالي',
        transferConcept: 'Arabic highlights information by foregrounding or using particles like "إنما" or "الذي... هو". In advanced English, we construct "wh-clefts" (What I need is...) or "it-clefts" (It was his honesty that saved him) to spotlight key information.',
        transferConceptAr: 'العربية تركز على المعلومة بأسلوب القصر أو الحصر (إنما، ما يقلقني هو...). الإنجليزية الأكاديمية تصوغ الجمل المشطورة (What concerns me is... أو It was X that...) لتركيز الضوء الدلالي على الفكرة الجوهرية.',
        weakSpotTag: 'cleft-structure',
        exercises: [
          {
            id: 'ex-3-20-1',
            arabicThought: 'ما يقلقني حقاً هو الافتقار إلى الشفافية',
            englishTarget: 'What truly worries me is the lack of transparency',
            acceptableAlternatives: [
              'What really concerns me is the lack of transparency',
              'What truly concerns me is the lack of transparency'
            ],
            wordChips: ['What', 'truly', 'worries', 'me', 'is', 'the', 'lack', 'of', 'transparency', 'Which', 'are', 'that'],
            breakdownChunks: [
              { arabicText: 'ما يقلقني حقاً', englishText: 'What truly worries me', role: 'subject', explanation: 'Wh-clause acting as complete subject' },
              { arabicText: 'هو', englishText: 'is', role: 'verb', explanation: 'Singular copula bridge' },
              { arabicText: 'الافتقار إلى الشفافية', englishText: 'the lack of transparency', role: 'object', explanation: 'Focused predicate noun phrase' }
            ],
            habitHint: 'A wh-cleft begins with "What [verb] me is...". Do not use "Which" or "The thing which".'
          },
          {
            id: 'ex-3-20-2',
            arabicThought: 'شغفه المستمر هو ما أثار إعجابي به',
            englishTarget: 'It was his continuous passion that impressed me',
            acceptableAlternatives: [
              'It was his relentless passion that impressed me',
              'What impressed me was his continuous passion'
            ],
            wordChips: ['It', 'was', 'his', 'continuous', 'passion', 'that', 'impressed', 'me', 'Which', 'is', 'he'],
            breakdownChunks: [
              { arabicText: 'هو (تركيب إبراز)', englishText: 'It was', role: 'subject', explanation: 'Dummy "it" cleft opener' },
              { arabicText: 'شغفه المستمر', englishText: 'his continuous passion', role: 'object', explanation: 'Highlighted focal entity' },
              { arabicText: 'ما أثار إعجابي به', englishText: 'that impressed me', role: 'modifier', explanation: 'Relative focal clause' }
            ],
            habitHint: 'An It-cleft puts the spotlight squarely on the cause: "It was [X] that impressed me".'
          },
          {
            id: 'ex-3-20-3',
            arabicThought: 'كل ما نحتاجه الآن هو قرار حاسم',
            englishTarget: 'All we need now is a decisive decision',
            acceptableAlternatives: [
              'All that we need now is a decisive decision',
              'What we need now is a decisive decision'
            ],
            wordChips: ['All', 'we', 'need', 'now', 'is', 'a', 'decisive', 'decision', 'are', 'the', 'What'],
            breakdownChunks: [
              { arabicText: 'كل ما نحتاجه الآن', englishText: 'All we need now', role: 'subject', explanation: 'Restrictive focus subject phrase' },
              { arabicText: 'هو', englishText: 'is', role: 'verb', explanation: 'Singular linking verb' },
              { arabicText: 'قرار حاسم', englishText: 'a decisive decision', role: 'object', explanation: 'Focused complement' }
            ],
            habitHint: 'Use "All we need now is..." to spotlight a single necessity.'
          }
        ]
      },
      {
        id: 'p3-l5',
        phaseId: 3,
        phaseTitle: 'Mastery & Register',
        phaseLevel: 'B2+ – C1',
        number: 21,
        title: 'The Subjunctive & Formal Directives',
        titleAr: 'صيغة الإلزام والاقتراح الرسمي (The Mandative Subjunctive)',
        transferConcept: 'In formal administrative English after verbs of demand or recommendation (recommend, insist, propose, demand), the that-clause uses the base verb with NO third-person -s and NO modal (I suggest that he BE present, not "is present" or "should be").',
        transferConceptAr: 'في الإنجليزية الرسمية الرفيعة بعد أفعال الاقتراح والطلب (suggest, recommend, insist)، الفعل التابع يأتي مجرداً تماماً حتى مع he/she دون إضافة s وبدون to (نقول: I suggest that he attend وليس attends).',
        weakSpotTag: 'mandative-subjunctive',
        exercises: [
          {
            id: 'ex-3-21-1',
            arabicThought: 'أقترح أن يحضر الاجتماع شخصياً',
            englishTarget: 'I suggest that he attend the meeting in person',
            acceptableAlternatives: [
              'I recommend that he attend the meeting in person',
              'I suggest he attend the meeting in person'
            ],
            wordChips: ['I', 'suggest', 'that', 'he', 'attend', 'the', 'meeting', 'in', 'person', 'attends', 'should', 'to'],
            breakdownChunks: [
              { arabicText: 'أقترح', englishText: 'I suggest', role: 'verb', explanation: 'Mandative verb' },
              { arabicText: 'أن يحضر هو (صيغة الإلزام)', englishText: 'that he attend', role: 'subject', explanation: 'Subjunctive base form without third-person -s!' },
              { arabicText: 'الاجتماع', englishText: 'the meeting', role: 'object', explanation: 'Direct object' },
              { arabicText: 'شخصياً', englishText: 'in person', role: 'modifier', explanation: 'Idiomatic prepositional phrase' }
            ],
            habitHint: 'In the formal mandative subjunctive, "attend" does NOT take an -s even after "he": "that he attend".'
          },
          {
            id: 'ex-3-21-2',
            arabicThought: 'من الضروري أن تكون التقارير دقيقة',
            englishTarget: 'It is essential that the reports be accurate',
            acceptableAlternatives: [
              'It is vital that the reports be accurate',
              'It is essential that the reports should be accurate'
            ],
            wordChips: ['It', 'is', 'essential', 'that', 'the', 'reports', 'be', 'accurate', 'are', 'must', 'were'],
            breakdownChunks: [
              { arabicText: 'من الضروري', englishText: 'It is essential', role: 'modifier', explanation: 'Impersonal adjective of necessity' },
              { arabicText: 'أن تكون التقارير', englishText: 'that the reports be', role: 'verb', explanation: 'Subjunctive base "be" instead of "are"' },
              { arabicText: 'دقيقة', englishText: 'accurate', role: 'object', explanation: 'Predicate adjective' }
            ],
            habitHint: 'After "essential that", use the bare copula "be", not "are": "that the reports be accurate".'
          },
          {
            id: 'ex-3-21-3',
            arabicThought: 'أصرت اللجنة على أن يستقيل المدير على الفور',
            englishTarget: 'The committee insisted that the manager resign immediately',
            acceptableAlternatives: [
              'The committee insisted that the director resign immediately'
            ],
            wordChips: ['The', 'committee', 'insisted', 'that', 'the', 'manager', 'resign', 'immediately', 'resigns', 'resigned'],
            breakdownChunks: [
              { arabicText: 'أصرت اللجنة', englishText: 'The committee insisted', role: 'subject', explanation: 'Main clause' },
              { arabicText: 'على أن يستقيل المدير', englishText: 'that the manager resign', role: 'verb', explanation: 'Subjunctive base verb "resign"' },
              { arabicText: 'على الفور', englishText: 'immediately', role: 'modifier', explanation: 'Adverb of immediacy' }
            ],
            habitHint: 'After "insisted that", use the base verb "resign" without -s or past tense.'
          }
        ]
      },
      {
        id: 'p3-l6',
        phaseId: 3,
        phaseTitle: 'Mastery & Register',
        phaseLevel: 'B2+ – C1',
        number: 22,
        title: 'Discourse Markers & Transition in High Register',
        titleAr: 'أدوات الربط والمناقلة في الخطاب الرفيع (Furthermore, Nonetheless)',
        transferConcept: 'Arabic links flowing paragraphs with "وعلاوة على ذلك" or "ومن ناحية أخرى". In high-register English, discourse markers (Furthermore, Moreover, Nonetheless, In contrast) set the logical cadence and are set off by mandatory commas.',
        transferConceptAr: 'العربية تربط الفقرات بسلاسة باستخدام الواو وعلاوة على ذلك. في الإنجليزية الأكاديمية والمهنية، أدوات مثل Furthermore و Nonetheless هي بوصلة المنطق وتُتبع بفاصلة حاسمة.',
        weakSpotTag: 'discourse-markers',
        exercises: [
          {
            id: 'ex-3-22-1',
            arabicThought: 'علاوة على ذلك، فإن النتائج الأولية غير حاسمة',
            englishTarget: 'Furthermore the preliminary results are inconclusive',
            acceptableAlternatives: [
              'Moreover the preliminary results are inconclusive',
              'Additionally the preliminary results are inconclusive'
            ],
            wordChips: ['Furthermore', 'the', 'preliminary', 'results', 'are', 'inconclusive', 'Moreover', 'is', 'conclusive', 'also'],
            breakdownChunks: [
              { arabicText: 'علاوة على ذلك', englishText: 'Furthermore', role: 'connector', explanation: 'Formal additive discourse marker' },
              { arabicText: 'النتائج الأولية', englishText: 'the preliminary results', role: 'subject', explanation: 'Plural subject noun phrase' },
              { arabicText: 'تكون', englishText: 'are', role: 'verb', explanation: 'Plural copula' },
              { arabicText: 'غير حاسمة', englishText: 'inconclusive', role: 'object', explanation: 'High-register negative prefix adjective' }
            ],
            habitHint: 'Elevate your register from simple "also" or "and" to "Furthermore" or "Moreover" when opening an argumentative point.'
          },
          {
            id: 'ex-3-22-2',
            arabicThought: 'ومع ذلك، لا تزال هناك عقبات رئيسية يجب التغلب عليها',
            englishTarget: 'Nonetheless there remain significant obstacles to overcome',
            acceptableAlternatives: [
              'Nevertheless there remain significant obstacles to overcome',
              'Nonetheless there are still major obstacles to overcome'
            ],
            wordChips: ['Nonetheless', 'there', 'remain', 'significant', 'obstacles', 'to', 'overcome', 'However', 'is', 'obstacle'],
            breakdownChunks: [
              { arabicText: 'ومع ذلك', englishText: 'Nonetheless', role: 'connector', explanation: 'Concessive transition' },
              { arabicText: 'لا تزال هناك', englishText: 'there remain', role: 'verb', explanation: 'Elevated existential verb replacing "there are"' },
              { arabicText: 'عقبات رئيسية', englishText: 'significant obstacles', role: 'subject', explanation: 'Formal adjective + noun' },
              { arabicText: 'يجب التغلب عليها', englishText: 'to overcome', role: 'modifier', explanation: 'Infinitive modifier' }
            ],
            habitHint: '"Nonetheless" or "Nevertheless" provides a nuanced, professional counterpoint.'
          },
          {
            id: 'ex-3-22-3',
            arabicThought: 'وبالتالي، يتعين علينا مراجعة استراتيجيتنا بالكامل',
            englishTarget: 'Consequently we must review our strategy completely',
            acceptableAlternatives: [
              'Therefore we must review our strategy completely',
              'Consequently we have to reconsider our entire strategy'
            ],
            wordChips: ['Consequently', 'we', 'must', 'review', 'our', 'strategy', 'completely', 'So', 'Therefore', 'to'],
            breakdownChunks: [
              { arabicText: 'وبالتالي', englishText: 'Consequently', role: 'connector', explanation: 'Formal illative cause-and-effect marker' },
              { arabicText: 'يتعين علينا مراجعة', englishText: 'we must review', role: 'verb', explanation: 'Modal + transitive verb' },
              { arabicText: 'استراتيجيتنا بالكامل', englishText: 'our strategy completely', role: 'object', explanation: 'Direct object + adverb' }
            ],
            habitHint: 'Replace colloquial "so" with "Consequently" or "Therefore" for executive-level impact.'
          }
        ]
      },
      {
        id: 'p3-l7',
        phaseId: 3,
        phaseTitle: 'Mastery & Register',
        phaseLevel: 'B2+ – C1',
        number: 23,
        title: 'False Friends & Cognitive False Cognates',
        titleAr: 'الأصدقاء الخادعون (False Friends) والأوهام اللغوية',
        transferConcept: 'Arabic speakers often get tricked by deceptive vocabulary pairs: translating "actually" as حالياً (it actually means في الحقيقة), "sympathetic" as لطيف (it means متعاطف), or "eventually" as في النهاية (often confused with احتمالاً).',
        transferConceptAr: 'يقع المتعلم في فخ كلمات خادعة: "actually" لا تعني حالياً بل "في الواقع"، و"sympathetic" لا تعني لطيف بل "متعاطف"، و"eventually" تعني "في نهاية المطاف".',
        weakSpotTag: 'false-friends',
        exercises: [
          {
            id: 'ex-3-23-1',
            arabicThought: 'في الواقع، لست متفقاً تماماً مع هذا المقترح',
            englishTarget: 'Actually I do not entirely agree with this proposal',
            acceptableAlternatives: [
              "Actually I don't entirely agree with this proposal",
              'In reality I do not entirely agree with this proposal'
            ],
            wordChips: ['Actually', 'I', 'do', 'not', 'entirely', 'agree', 'with', 'this', 'proposal', 'Currently', 'am', 'agreeing'],
            breakdownChunks: [
              { arabicText: 'في الواقع', englishText: 'Actually', role: 'connector', explanation: 'Meaning "as a matter of fact" (NOT currently!)' },
              { arabicText: 'لست متفقاً تماماً', englishText: 'I do not entirely agree', role: 'verb', explanation: 'Negative verb + degree adverb' },
              { arabicText: 'مع هذا المقترح', englishText: 'with this proposal', role: 'object', explanation: 'Prepositional object' }
            ],
            habitHint: '"Actually" means "in reality / truth". If you mean "حالياً", you must use "currently" or "presently".'
          },
          {
            id: 'ex-3-23-2',
            arabicThought: 'أنا أعيش حالياً في مدريد (ليس في الواقع بل الآن)',
            englishTarget: 'I am currently living in Madrid',
            acceptableAlternatives: [
              'Currently I live in Madrid',
              "I'm currently living in Madrid",
              'I currently live in Madrid'
            ],
            wordChips: ['I', 'am', 'currently', 'living', 'in', 'Madrid', 'actually', 'live', 'at', 'now'],
            breakdownChunks: [
              { arabicText: 'أنا', englishText: 'I', role: 'subject', explanation: 'Subject' },
              { arabicText: 'حالياً', englishText: 'currently', role: 'modifier', explanation: 'Temporal adverb for "at present" (NEVER "actually"!)' },
              { arabicText: 'أعيش في مدريد', englishText: 'am living in Madrid', role: 'verb', explanation: 'Continuous aspect for present situation' }
            ],
            habitHint: 'For "حالياً" (nowadays / at the moment), use "currently", NEVER "actually".'
          },
          {
            id: 'ex-3-23-3',
            arabicThought: 'أبدى الفريق تعاطفاً كبيراً مع موقفنا',
            englishTarget: 'The team was very sympathetic to our situation',
            acceptableAlternatives: [
              'The team was very sympathetic towards our situation',
              'The team showed great sympathy for our situation'
            ],
            wordChips: ['The', 'team', 'was', 'very', 'sympathetic', 'to', 'our', 'situation', 'friendly', 'kind', 'with'],
            breakdownChunks: [
              { arabicText: 'الفريق', englishText: 'The team', role: 'subject', explanation: 'Collective noun' },
              { arabicText: 'كان', englishText: 'was', role: 'verb', explanation: 'Copula' },
              { arabicText: 'متعاطفاً جداً مع موقفنا', englishText: 'very sympathetic to our situation', role: 'modifier', explanation: 'Showing compassion/understanding' }
            ],
            habitHint: '"Sympathetic" specifically means showing compassion (متعاطف), not merely friendly or pleasant.'
          }
        ]
      },
      {
        id: 'p3-l8',
        phaseId: 3,
        phaseTitle: 'Mastery & Register',
        phaseLevel: 'B2+ – C1',
        number: 24,
        title: 'High-Register Collocations & Metaphorical Transfer',
        titleAr: 'المتلازمات اللفظية الرفيعة (Collocations) والنقل المجازي',
        transferConcept: 'Arabic speakers often translate figurative verbs literally (e.g. "عملنا قرار" = made a decision, "لعب دوراً" = played a role, "اتخاذ تدابير" = take measures). Mastering native C1 verb-noun collocations bridges the final gap to effortless native proficiency.',
        transferConceptAr: 'كثير من المتلازمات في العربية تتطلب مقابلاً دقيقاً في الإنجليزية: اتخاذ تدابير (take measures / implement steps)، ولعب دوراً محورياً (play a pivotal role)، واتخاذ قرار (make a decision).',
        weakSpotTag: 'advanced-collocations',
        exercises: [
          {
            id: 'ex-3-24-1',
            arabicThought: 'يجب أن نتخذ إجراءات حاسمة لمعالجة هذه الأزمة',
            englishTarget: 'We must take decisive measures to address this crisis',
            acceptableAlternatives: [
              'We must take decisive action to address this crisis',
              'We have to take decisive measures to handle this crisis'
            ],
            wordChips: ['We', 'must', 'take', 'decisive', 'measures', 'to', 'address', 'this', 'crisis', 'make', 'do', 'solve'],
            breakdownChunks: [
              { arabicText: 'يجب علينا', englishText: 'We must', role: 'auxiliary', explanation: 'Obligation modal' },
              { arabicText: 'نتخذ إجراءات حاسمة', englishText: 'take decisive measures', role: 'verb', explanation: 'Standard high-register collocation: TAKE measures (not "make" or "do")' },
              { arabicText: 'لمعالجة هذه الأزمة', englishText: 'to address this crisis', role: 'object', explanation: 'Purpose infinitive with "address"' }
            ],
            habitHint: 'In English, you "take measures" or "take action", you never "make measures" or "do measures".'
          },
          {
            id: 'ex-3-24-2',
            arabicThought: 'لعبت التكنولوجيا دوراً محورياً في هذا التحول',
            englishTarget: 'Technology played a pivotal role in this transformation',
            acceptableAlternatives: [
              'Technology has played a pivotal role in this transformation',
              'Technology played a crucial role in this transformation'
            ],
            wordChips: ['Technology', 'played', 'a', 'pivotal', 'role', 'in', 'this', 'transformation', 'made', 'did', 'the'],
            breakdownChunks: [
              { arabicText: 'التكنولوجيا (عامة)', englishText: 'Technology', role: 'subject', explanation: 'Zero-article generic concept' },
              { arabicText: 'لعبت دوراً محورياً', englishText: 'played a pivotal role', role: 'verb', explanation: 'Collocation: play a pivotal role' },
              { arabicText: 'في هذا التحول', englishText: 'in this transformation', role: 'connector', explanation: 'Domain prepositional phrase' }
            ],
            habitHint: 'Pair "play" with "a pivotal role" (or "a crucial role") for natural C1 elegance.'
          },
          {
            id: 'ex-3-24-3',
            arabicThought: 'توصل الطرفان أخيراً إلى تسوية مقبولة للطرفين',
            englishTarget: 'The two parties finally reached a mutually acceptable compromise',
            acceptableAlternatives: [
              'Both parties finally reached a mutually acceptable compromise',
              'The two parties finally reached a mutually acceptable agreement'
            ],
            wordChips: ['The', 'two', 'parties', 'finally', 'reached', 'a', 'mutually', 'acceptable', 'compromise', 'arrived', 'made', 'to'],
            breakdownChunks: [
              { arabicText: 'الطرفان', englishText: 'The two parties', role: 'subject', explanation: 'Subject' },
              { arabicText: 'توصلا أخيراً', englishText: 'finally reached', role: 'verb', explanation: 'Collocation: reach a compromise (NOT "arrive to")' },
              { arabicText: 'إلى تسوية مقبولة للطرفين', englishText: 'a mutually acceptable compromise', role: 'object', explanation: 'Adverb + adjective + noun complement' }
            ],
            habitHint: 'In English, you "reach an agreement" or "reach a compromise", not "arrive to a compromise".'
          }
        ]
      }
    ]
  }
];

export const INITIAL_BROADCASTS = [
  {
    id: 'bc-amr-sherif',
    title: 'Crafted with Hours of Effort by Amr Sherif — God Willing, You Will Succeed!',
    titleAr: 'ثمرة ساعات من الجهد المتواصل من عمرو شريف — بإذن الله ستنجح وتتفوق!',
    content: 'This entire platform is the result of hours of dedicated effort by Amr Sherif to help you think in English naturally, step by step, without stress. Trust the process and take it one sentence at a time — God willing (إن شاء الله), you will succeed!',
    contentAr: 'هذا التطبيق ثمرة ساعات طويلة من الجهد المخلص من عمرو شريف لمساعدتك على التفكير بالإنجليزية ببساطة وبدون تعقيد. خذها خطوة بخطوة — وبإذن الله ستنجح وتتفوق!',
    targetHabit: 'encouragement-dedication',
    date: '2026-10-28'
  },
  {
    id: 'bc-2',
    title: 'Ghost Pronouns (ضمير العائد): The Relic You Must Drop',
    titleAr: 'ضمير العائد: الأثر اللغوي الذي يجب أن تتخلص منه',
    content: 'In Arabic, you say "الكتاب الذي قرأته" where "ـه" refers back to the book. In English, relative pronouns like "that" or "which" already embody the object role. Repeating "it" (e.g. "the book I read it") is one of the most identifiable Arabic interference patterns. Drop the phantom pronoun!',
    contentAr: 'في العربية نقول "الفيلم الذي شاهدتـه" مستخدمين ضمير العائد. في الإنجليزية، اسم الموصول يؤدي الدور كاملاً بذاته. تكرار الضمير (the movie I watched it) هو أشهر عثرات النقل اللغوي. تخلص من هذا الضمير الوهمي فوراً!',
    targetHabit: 'resumptive-pronoun',
    date: '2026-10-27'
  },
  {
    id: 'bc-3',
    title: 'Stop Saying "Actually" When You Mean "Currently"',
    titleAr: 'توقف عن استخدام Actually عندما تقصد حالياً',
    content: 'A classic false friend for Arabic learners: "Actually" translates to "في الحقيقة / في الواقع". When describing ongoing situations in the present moment, always use "currently", "at present", or "nowadays".',
    contentAr: 'خطأ شائع للغاية: كلمة actually لا تعني "حالياً" بل "في الواقع والحقيقة". إذا كنت تقصد الوضع الراهن، استخدم always currently أو at present.',
    targetHabit: 'false-friends',
    date: '2026-10-26'
  }
];

export const INITIAL_MENTOR_QUESTIONS = [
  {
    id: 'mq-1',
    studentName: 'Tariq Al-Mansoor',
    lessonId: 'p1-l1',
    lessonTitle: 'The Hidden Copula (Nominal Sentences)',
    category: 'Sentence Structure',
    questionText: 'Why do we say "He is happy" with "is", but in past tense we say "He was happy"? Why can\'t we just say "He happy" if the context is obvious?',
    createdAt: '2026-10-28T10:15:00Z',
    replies: [
      {
        id: 'mr-1',
        author: 'Mentor Sarah',
        replyText: 'Great question, Tariq! In English, tense is not inferred from context—it is structurally carried by the finite verb. Without "is" or "was", the sentence is grammatically dead in English because there is no engine to hold the tense in time.',
        createdAt: '2026-10-28T11:00:00Z'
      }
    ]
  },
  {
    id: 'mq-2',
    studentName: 'Layla K.',
    lessonId: 'p2-l2',
    lessonTitle: 'Zero Relative Clauses & The Ghost Pronoun',
    category: 'Pronouns & Clauses',
    questionText: 'When I speak fast, my tongue automatically adds "it" at the end of relative sentences: "The present that he gave me it". Any mental trick to prevent this?',
    createdAt: '2026-10-28T12:30:00Z',
    replies: [
      {
        id: 'mr-2',
        author: 'Mentor Omar',
        replyText: 'Imagine that "The present" leaves an empty slot at the end of the clause. Picture that slot already occupied by the opening noun. Say the verb firmly ("gave me") and snap your mouth shut!',
        createdAt: '2026-10-28T13:10:00Z'
      }
    ]
  }
];
