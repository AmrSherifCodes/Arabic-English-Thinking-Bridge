import { Exercise } from '../types';
import { PHASES_DATA } from '../data/lessons';

export interface ArabicLexiconEntry {
  en: string;
  grammar: string;
  tip: string;
}

/**
 * Diacritic-insensitive normalizer:
 * Removes Arabic vowel marks (tashkeel), tatweel, and punctuation,
 * and normalizes Alef hamza variants to 'أ' for deterministic lookup.
 */
export function stripTashkeel(rawWord: string): string {
  return String(rawWord || '')
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '') // Strip diacritics & tatweel
    .replace(/[،؛؟.,!?;:"'’‘()\[\]{}«»—\-]/g, '') // Strip punctuation
    .replace(/[أإآ]/g, 'أ') // Normalize Alef hamza variants
    .trim();
}

export const normalizeArabicWord = stripTashkeel;

/**
 * Complete, teacher-verified Arabic-to-English Word Lexicon
 * Covers all words from the reference prompt and all 24 lessons (72 exercises).
 * Note: All keys are normalized through stripTashkeel (Alef variants -> 'أ', no tashkeel).
 */
const RAW_LEXICON: Record<string, ArabicLexiconEntry> = {
  // Reference Prompt + Phase 1 Foundations
  'أنا': {
    en: 'I',
    grammar: 'Subject pronoun (ضمير متكلم)',
    tip: 'Must be followed by “am” or an active verb in English.'
  },
  'طبيب': {
    en: 'a doctor',
    grammar: 'Singular countable noun',
    tip: 'Add the indefinite article “a” before singular jobs in English.'
  },
  'في': {
    en: 'in / at / on',
    grammar: 'Preposition (حرف جر)',
    tip: 'Maps to “in” for cities/rooms, “on” for days, and “at” for exact times or institutions (“at work”).'
  },
  'الإسكندرية': {
    en: 'Alexandria',
    grammar: 'Proper noun (اسم علم)',
    tip: 'No “the” before city names in English.'
  },
  'هو': {
    en: 'He / is',
    grammar: '3rd-person singular pronoun',
    tip: 'Needs “is” in nominal sentences (“He is…”) or takes “-s / does” in the present simple.'
  },
  'مهندس': {
    en: 'an engineer / architect',
    grammar: 'Singular countable noun (اسم مفرد معدود)',
    tip: 'Requires “an” before a vowel sound (“an engineer / an architect”).'
  },
  'معماري': {
    en: 'architect (architectural)',
    grammar: 'Modifying noun/adjective',
    tip: '“مهندس معماري” compresses into the single English noun “an architect”.'
  },
  'الطقس': {
    en: 'The weather',
    grammar: 'Definite subject noun',
    tip: 'Singular uncountable noun — takes the linking verb “is”.'
  },
  'بارد': {
    en: 'cold',
    grammar: 'Adjective (صفة)',
    tip: 'Needs a linking verb (“is cold”) in English.'
  },
  'جدا': {
    en: 'very',
    grammar: 'Adverb of degree',
    tip: 'Placed BEFORE the adjective in English (“very cold”), unlike Arabic.'
  },
  'اليوم': {
    en: 'today',
    grammar: 'Time adverb (ظرف زمان)',
    tip: 'Placed at the end or very beginning of the English sentence.'
  },
  'نحن': {
    en: 'We',
    grammar: '1st-person plural pronoun',
    tip: 'Pairs with the plural linking verb “are” (“We are…”).'
  },
  'جاهزون': {
    en: 'ready',
    grammar: 'Predicate adjective (خبر)',
    tip: 'English adjectives never take a plural suffix — just “ready”, preceded by “are”.'
  },
  'للمقابلة': {
    en: 'for the interview',
    grammar: 'Preposition (لـ) + definite noun',
    tip: '“Ready” collocates with “for” in English (“ready for the interview”).'
  },
  'أحب': {
    en: 'like / love',
    grammar: 'Present active verb',
    tip: 'Follows the subject “I” directly (“I like…”).'
  },
  'القهوة': {
    en: 'coffee',
    grammar: 'Uncountable mass noun',
    tip: 'Drop Arabic “الـ” when talking about coffee in general (“I like hot coffee”).'
  },
  'الساخنة': {
    en: 'hot',
    grammar: 'Adjective (صفة)',
    tip: 'Put the adjective BEFORE the noun without “the” (“hot coffee”).'
  },
  'بشكل': {
    en: 'in a way / generally',
    grammar: 'Adverbial phrase helper',
    tip: 'Signals that the noun is generic and takes Zero Article in English.'
  },
  'عام': {
    en: 'general (in general)',
    grammar: 'Adjective',
    tip: 'In English, general concepts drop “the”.'
  },
  'اشترى': {
    en: 'bought',
    grammar: 'Past simple verb',
    tip: 'Irregular past form of “buy” (“He bought”).'
  },
  'دراجة': {
    en: 'a bicycle / a bike',
    grammar: 'Singular countable noun',
    tip: 'Must have the indefinite article “a” (“a new bicycle”).'
  },
  'جديدة': {
    en: 'new',
    grammar: 'Adjective (صفة)',
    tip: 'Placed between “a” and the noun (“a new bicycle / a new language”).'
  },
  'الموسيقى': {
    en: 'Music',
    grammar: 'Abstract uncountable noun',
    tip: 'Generic concepts take Zero Article in English (“Music makes me happy”, not “The music”).'
  },
  'تجعلني': {
    en: 'makes me',
    grammar: 'Causative verb + object suffix (ـني)',
    tip: '“Music” is singular uncountable, so the verb takes “-s” (“makes me”).'
  },
  'سعيدا': {
    en: 'happy',
    grammar: 'Adjective complement',
    tip: '“Makes me + adjective” (“makes me happy”).'
  },
  'كفكرة': {
    en: 'as a concept',
    grammar: 'Prepositional gloss',
    tip: 'Reminds you that abstract concepts omit “the” in English.'
  },
  'عامة': {
    en: 'general',
    grammar: 'Adjective',
    tip: 'General categories omit “the”.'
  },
  'عندي': {
    en: 'I have',
    grammar: 'Preposition + suffix (شبه جملة للملكية)',
    tip: 'Literal: “at me”. English uses the active verb “I have” instead.'
  },
  'محاضرة': {
    en: 'a lecture',
    grammar: 'Singular countable noun',
    tip: 'Requires “a” (“a chemistry lecture”).'
  },
  'كيمياء': {
    en: 'chemistry',
    grammar: 'Noun adjunct (مضاف إليه)',
    tip: 'Placed BEFORE “lecture” in English (“chemistry lecture”).'
  },
  'غدا': {
    en: 'tomorrow',
    grammar: 'Time adverb',
    tip: 'No preposition needed before “tomorrow”.'
  },
  'سؤال': {
    en: 'a question',
    grammar: 'Singular countable noun',
    tip: 'Requires “a/an” in the singular (“an important question”).'
  },
  'مهم': {
    en: 'important',
    grammar: 'Adjective',
    tip: 'Starts with a vowel sound, so it takes “an” (“an important question / meeting”).'
  },
  'عنده': {
    en: 'He has',
    grammar: 'Preposition + 3rd-person suffix (ـه)',
    tip: 'Literal: “at him”. Shift to active subject + conjugated verb: “He has”.'
  },
  'سيارة': {
    en: 'a car',
    grammar: 'Singular countable noun',
    tip: 'Preceded by its adjective (“an electric car”).'
  },
  'كهربائية': {
    en: 'electric',
    grammar: 'Adjective',
    tip: 'Starts with a vowel sound, triggering “an” (“an electric car”).'
  },
  'ليس': {
    en: 'do not / is not',
    grammar: 'Negative particle (أداة نفي)',
    tip: 'With “عندي / لدي”, negate using “do not have” in English.'
  },
  'لدي': {
    en: 'have (I have)',
    grammar: 'Possession structure',
    tip: 'After “do not”, use the base verb “have” (“I do not have”).'
  },
  'وقت': {
    en: 'time',
    grammar: 'Uncountable noun',
    tip: 'Paired with “enough” (“enough time”).'
  },
  'كاف': {
    en: 'enough / sufficient',
    grammar: 'Determiner / Adjective',
    tip: 'Put “enough” BEFORE nouns (“enough time”), but after adjectives.'
  },
  'الآن': {
    en: 'now',
    grammar: 'Time adverb',
    tip: 'Usually placed at the end of the clause.'
  },
  'لا': {
    en: 'do not / does not / not',
    grammar: 'Present negation particle',
    tip: 'Summons helper verb “do/does not” before the base verb.'
  },
  'أشرب': {
    en: 'drink',
    grammar: 'Present verb',
    tip: 'Used in base form after “do not” (“I do not drink”).'
  },
  'الشاي': {
    en: 'tea',
    grammar: 'Uncountable mass noun',
    tip: 'Generic preference drops “the” (“green tea”).'
  },
  'الأخضر': {
    en: 'green',
    grammar: 'Adjective',
    tip: 'Placed before “tea” without “the” (“green tea”).'
  },
  'سارة': {
    en: 'Sarah',
    grammar: 'Proper noun (3rd-person singular)',
    tip: 'Takes the helper “does not” in present negation.'
  },
  'تعمل': {
    en: 'work',
    grammar: 'Present verb',
    tip: 'Drops the “-s” after “does not” (“Sarah does not work”).'
  },
  'عطلة': {
    en: 'weekend / holiday',
    grammar: 'Time noun',
    tip: 'Part of “عطلة نهاية الأسبوع” → “the weekend”.'
  },
  'نهاية': {
    en: 'end (weekend)',
    grammar: 'Noun construct',
    tip: 'Combined with “الأسبوع” to mean “weekend”.'
  },
  'الأسبوع': {
    en: 'the week (weekend)',
    grammar: 'Definite noun',
    tip: 'Use “on the weekend” or “on weekends”.'
  },
  'يعمل': {
    en: 'work / works',
    grammar: 'Present verb',
    tip: 'Drop the “-s” after “does not” → “does not work”.'
  },
  'يوم': {
    en: 'on (day of)',
    grammar: 'Time noun',
    tip: 'English uses the preposition “on” before days of the week (“on Monday / on Friday”).'
  },
  'الجمعة': {
    en: 'Friday',
    grammar: 'Day of the week',
    tip: 'Always capitalized in English (“on Friday”).'
  },
  'هم': {
    en: 'They',
    grammar: '3rd-person plural pronoun',
    tip: 'Takes “do not” in present negation (“They do not live”).'
  },
  'يعيشون': {
    en: 'live',
    grammar: 'Present verb',
    tip: 'Base form after “do not” (“They do not live”).'
  },
  'هنا': {
    en: 'here',
    grammar: 'Place adverb',
    tip: 'Placed directly after the verb (“live here”).'
  },
  'بعد': {
    en: 'anymore (with الآن)',
    grammar: 'Temporal particle',
    tip: '“بعد الآن” in a negative sentence translates to “anymore”.'
  },
  'هل': {
    en: 'Do / Does / Have (Question Opener)',
    grammar: 'Interrogative particle (حرف استفهام)',
    tip: 'English has no single word for “هل” — invert the helper verb (“Do / Does / Have”) to the start!'
  },
  'تتحدث': {
    en: 'you speak',
    grammar: 'Present verb (2nd-person)',
    tip: 'Split into subject + base verb after “Do” (“Do you speak…?”).'
  },
  'الإنجليزية': {
    en: 'English',
    grammar: 'Proper language noun',
    tip: 'Always capitalized and takes no “the” (“speak English”).'
  },
  'بطلاقة': {
    en: 'fluently',
    grammar: 'Adverb of manner',
    tip: 'Placed after the object (“speak English fluently”).'
  },
  'يعيش': {
    en: 'live',
    grammar: 'Present verb',
    tip: 'After “Does”, strip the “-s” back to base form “live”.'
  },
  'أخوك': {
    en: 'your brother',
    grammar: 'Noun + possessive suffix (ـك)',
    tip: 'In English, the possessive “your” comes BEFORE “brother”.'
  },
  'لندن': {
    en: 'London',
    grammar: 'Proper city noun',
    tip: 'Cities take the preposition “in” (“in London”).'
  },
  'تحتاج': {
    en: 'you need',
    grammar: 'Present verb',
    tip: 'With “هل”, form “Do you need…?”.'
  },
  'إلى': {
    en: 'to (or omitted after need)',
    grammar: 'Preposition',
    tip: '“Need” takes a direct object without “to” (“need any help”), or “to + verb”.'
  },
  'أي': {
    en: 'any',
    grammar: 'Interrogative/Negative quantifier',
    tip: 'Used in questions and negatives (“any help”).'
  },
  'مساعدة': {
    en: 'help',
    grammar: 'Uncountable noun',
    tip: 'Uncountable in English — never pluralized.'
  },
  'أستطيع': {
    en: 'I can',
    grammar: '1st-person modal verb',
    tip: '“Can” is followed immediately by a bare verb WITHOUT “to” (“I can help”).'
  },
  'مساعدتك': {
    en: 'help you',
    grammar: 'Verbal noun + object suffix (ـك)',
    tip: 'After “can”, use the base verb + pronoun: “help you”.'
  },
  'هذا': {
    en: 'this',
    grammar: 'Singular demonstrative',
    tip: 'Drop Arabic “الـ” on the noun that follows (“this project”, never “this the project”).'
  },
  'المشروع': {
    en: 'project',
    grammar: 'Singular countable noun',
    tip: 'Collocates with “with” after “help” (“help you with this project”).'
  },
  'أريد': {
    en: 'I want',
    grammar: 'Present verb of desire',
    tip: 'Followed by “to + base verb” (“I want to learn”).'
  },
  'أن': {
    en: 'to (infinitive marker) / that',
    grammar: 'Subjunctive particle (حرف مصدري)',
    tip: 'Maps to “to” between two verbs (“want to learn”) or “that” after reporting/mandative verbs.'
  },
  'أتعلم': {
    en: 'learn',
    grammar: 'Subjunctive verb',
    tip: 'After “want to”, use the base verb “learn”.'
  },
  'لغة': {
    en: 'a language',
    grammar: 'Singular countable noun',
    tip: 'Requires “a” (“a new language”).'
  },
  'بحاجة': {
    en: 'need (in need of)',
    grammar: 'Prepositional phrase of necessity',
    tip: 'Expressed as the active verb “need to” in English (“We need to leave”).'
  },
  'مغادرة': {
    en: 'leave',
    grammar: 'Verbal noun (مصدر)',
    tip: 'After “need to”, translate the Arabic verbal noun as a base verb (“to leave”).'
  },
  'المكان': {
    en: 'the place',
    grammar: 'Definite noun',
    tip: 'Direct object of “leave” (“leave the place”).'
  },
  'بيت': {
    en: 'house',
    grammar: 'Singular countable noun',
    tip: 'Comes AFTER its adjectives (“a big and beautiful house”).'
  },
  'كبير': {
    en: 'big',
    grammar: 'Adjective',
    tip: 'Placed before the noun in English.'
  },
  'وجميل': {
    en: 'and beautiful',
    grammar: 'Conjunction + adjective',
    tip: 'Placed before the noun (“a big and beautiful house”).'
  },
  'قابلت': {
    en: 'I met',
    grammar: 'Past verb + 1st-person suffix (ـتُ)',
    tip: 'Includes both subject “I” and past verb “met”.'
  },
  'صديقا': {
    en: 'a friend',
    grammar: 'Singular countable noun',
    tip: 'Preceded by “an old” (“an old friend”).'
  },
  'قديما': {
    en: 'old',
    grammar: 'Adjective',
    tip: 'Starts with a vowel sound, so it takes “an” (“an old friend”).'
  },
  'من': {
    en: 'from / of',
    grammar: 'Preposition',
    tip: '“from university”.'
  },
  'الجامعة': {
    en: 'university / college',
    grammar: 'Institutional noun',
    tip: 'Often used without “the” when referring to studying (“from university”).'
  },
  'لديهم': {
    en: 'They have',
    grammar: 'Preposition + plural pronoun suffix (ـهم)',
    tip: 'Turn the possessor into the subject: “They have”.'
  },
  'خطة': {
    en: 'a plan',
    grammar: 'Singular countable noun',
    tip: 'Comes at the end of the adjective cluster (“a very clever plan”).'
  },
  'ذكية': {
    en: 'clever / smart',
    grammar: 'Adjective',
    tip: 'Placed before “plan” (“a very clever plan”).'
  },
  'العمل': {
    en: 'work',
    grammar: 'Institutional noun',
    tip: 'Use “at work” (never “in the work”) for being at your workplace.'
  },
  'وسأتصل': {
    en: 'and I will call',
    grammar: 'Conjunction (و) + future prefix (سـ) + verb',
    tip: 'Unpacks into 4 English words: “and I will call”.'
  },
  'بك': {
    en: 'you',
    grammar: 'Preposition (بـ) + pronoun (ـك)',
    tip: 'English “call” is transitive — no preposition needed (“call you”, not “call with you”).'
  },
  'لاحقا': {
    en: 'later',
    grammar: 'Time adverb',
    tip: 'Placed at the end (“call you later”).'
  },
  'لدينا': {
    en: 'We have',
    grammar: 'Possession structure (ـنا = we)',
    tip: 'Translates to active subject + verb: “We have”.'
  },
  'اجتماع': {
    en: 'a meeting',
    grammar: 'Singular countable noun',
    tip: '“an important meeting”.'
  },
  'الاثنين': {
    en: 'Monday',
    grammar: 'Day of the week',
    tip: 'Days of the week always take “on” and a capital letter (“on Monday”).'
  },
  'يستيقظ': {
    en: 'wakes up / gets up',
    grammar: 'Present verb (3rd-person singular)',
    tip: 'Phrasal verb with “-s” for “He” (“He wakes up”).'
  },
  'مبكرا': {
    en: 'early',
    grammar: 'Adverb',
    tip: 'Placed after “wakes up” (“wakes up early”).'
  },
  'الصباح': {
    en: 'the morning',
    grammar: 'Time period noun',
    tip: 'Parts of the day take “in the” (“in the morning”).'
  },

  // Phase 2 Flow & Nuance
  'لقد': {
    en: 'have / has (indeed)',
    grammar: 'Confirmative particle (حرف تحقيق)',
    tip: 'Signals Present Perfect (“have + past participle”) when no closed past time is named.'
  },
  'أرسلت': {
    en: 'I sent / have sent',
    grammar: 'Past verb + subject suffix (ـتُ)',
    tip: 'With “لقد”, translate as “I have sent”.'
  },
  'التقرير': {
    en: 'the report',
    grammar: 'Definite noun',
    tip: 'Direct object placed after the verb.'
  },
  'بالفعل': {
    en: 'already',
    grammar: 'Adverb',
    tip: 'Often placed between “have” and the past participle (“have already sent”).'
  },
  'أدرس': {
    en: 'I study / have been studying',
    grammar: 'Present verb',
    tip: 'When paired with “منذ” (duration), shift to “I have been studying”.'
  },
  'اللغة': {
    en: 'the language (omitted before German)',
    grammar: 'Definite noun',
    tip: 'In English, just say “German” instead of “the German language”.'
  },
  'الألمانية': {
    en: 'German',
    grammar: 'Proper language noun',
    tip: 'Capitalize language names in English without “the”.'
  },
  'منذ': {
    en: 'for / since',
    grammar: 'Duration preposition',
    tip: 'Use “for” with a counted span (“for two months”) and “since” with a starting point.'
  },
  'شهرين': {
    en: 'two months',
    grammar: 'Dual noun (مثنى)',
    tip: 'English uses the number “two” + plural noun “months”.'
  },
  'فقدت': {
    en: 'I have lost',
    grammar: 'Past verb + 1st-person suffix',
    tip: 'Because the keys are still missing now, use Present Perfect: “I have lost”.'
  },
  'مفاتيحي': {
    en: 'my keys',
    grammar: 'Plural noun + possessive suffix (ـي)',
    tip: 'Possessive “my” comes before “keys”.'
  },
  'وما': {
    en: 'and still',
    grammar: 'Contextual clue',
    tip: 'Shows the result is still active in the present.'
  },
  'زلت': {
    en: 'I am still',
    grammar: 'Aspectual verb',
    tip: 'Confirms present relevance for Present Perfect.'
  },
  'أبحث': {
    en: 'looking / searching',
    grammar: 'Present verb',
    tip: 'Collocates with “for” (“looking for them”).'
  },
  'عنها': {
    en: 'for them',
    grammar: 'Preposition + pronoun',
    tip: '“Keys” is plural in English, so it takes “them”.'
  },
  'ولا': {
    en: 'and cannot',
    grammar: 'Negative conjunction',
    tip: 'Shows present consequence.'
  },
  'الدخول': {
    en: 'enter / get in',
    grammar: 'Verbal noun',
    tip: 'Present result of losing the keys.'
  },
  'اشتريت': {
    en: 'I bought',
    grammar: 'Past verb + subject suffix (ـتُ)',
    tip: 'Because “أمس” (yesterday) is present, use Past Simple “I bought” (never “have bought”).'
  },
  'هذه': {
    en: 'this',
    grammar: 'Demonstrative pronoun/determiner',
    tip: 'Singular demonstrative (“this watch / this information”).'
  },
  'الساعة': {
    en: 'watch',
    grammar: 'Singular noun',
    tip: 'Drop “الـ” after “this” → “this watch”.'
  },
  'أمس': {
    en: 'yesterday',
    grammar: 'Past time adverb',
    tip: 'Locks the action in a closed past timeframe — requires Past Simple!'
  },
  'سبق': {
    en: 'ever (previously)',
    grammar: 'Experiential verb',
    tip: '“هل سبق لك أن...” maps to the English life-experience formula “Have you ever + V3?”.'
  },
  'لك': {
    en: 'you (for you)',
    grammar: 'Preposition + pronoun',
    tip: 'Becomes the subject “you” in “Have you ever…?”.'
  },
  'زرت': {
    en: 'visited',
    grammar: 'Past participle (التصريف الثالث)',
    tip: 'After “Have you ever”, use the past participle “visited”.'
  },
  'اليابان': {
    en: 'Japan',
    grammar: 'Proper country noun',
    tip: 'No “the” before Japan.'
  },
  'هي': {
    en: 'is',
    grammar: 'Pronoun of separation (ضمير الفصل)',
    tip: 'Acts as the verb bridge “is” in English.'
  },
  'التجربة': {
    en: 'the experiment',
    grammar: 'Definite noun',
    tip: 'Antecedent noun for the relative clause.'
  },
  'التي': {
    en: 'that / which',
    grammar: 'Relative pronoun (اسم موصول)',
    tip: 'Replaces the object completely — do not repeat “it” later!'
  },
  'شرحها': {
    en: 'explained (lit. explained-it)',
    grammar: 'Verb + returning pronoun (ـها)',
    tip: 'Drop the Arabic shadow pronoun “ـها” in English: just “explained”.'
  },
  'الأستاذ': {
    en: 'the professor',
    grammar: 'Subject of relative clause',
    tip: 'In English relative clauses, put the subject BEFORE the verb (“the professor explained”).'
  },
  'الكتاب': {
    en: 'The book',
    grammar: 'Definite head noun',
    tip: 'Followed directly by the relative clause “(that) I borrowed”.'
  },
  'الذي': {
    en: 'that / which / whom (or omitted)',
    grammar: 'Relative pronoun (اسم موصول)',
    tip: 'Can be omitted when followed by a subject + verb (“The book I borrowed”).'
  },
  'استعرته': {
    en: 'I borrowed (drop ـه!)',
    grammar: 'Past verb + subject + ghost pronoun (ـه)',
    tip: 'Never translate “ـه” as “it”! Say “The book I borrowed”, not “borrowed it”.'
  },
  'مفيد': {
    en: 'useful',
    grammar: 'Predicate adjective',
    tip: 'Requires the linking verb “is” before “very useful”.'
  },
  'المهندس': {
    en: 'the engineer',
    grammar: 'Definite noun',
    tip: 'Head noun of the relative clause.'
  },
  'تحدثت': {
    en: 'I spoke',
    grammar: 'Past verb + 1st-person suffix',
    tip: '“I spoke with”.'
  },
  'معه': {
    en: 'with (drop ـه!)',
    grammar: 'Preposition + ghost pronoun (ـه)',
    tip: 'Keep the preposition “with”, but delete the returning pronoun “him”!'
  },
  'زرناه': {
    en: 'we visited (drop ـه!)',
    grammar: 'Past verb + “we” + ghost pronoun (ـه)',
    tip: 'Drop the returning pronoun “ـه” — say “The place we visited”, never “visited it”.'
  },
  'كان': {
    en: 'was / had',
    grammar: 'Past copula verb',
    tip: '“was” with adjectives (“was amazing / was tired”), or “had” with possession (“كان لدي”).'
  },
  'مذهلا': {
    en: 'amazing',
    grammar: 'Adjective',
    tip: 'Follows “was” (“was amazing”).'
  },
  'لو': {
    en: 'If (unreal condition)',
    grammar: 'Hypothetical conditional particle',
    tip: 'Triggers Second Conditional: “If + past simple, … would + base verb”.'
  },
  'كنت': {
    en: 'I were / I was',
    grammar: 'Past copula in conditional',
    tip: 'In hypothetical advice, English prefers the subjunctive “If I were you”.'
  },
  'مكانك': {
    en: 'you (lit. in your place)',
    grammar: 'Idiomatic conditional phrase',
    tip: '“لو كنت مكانك” is idiomatically “If I were you” in English.'
  },
  'لقبلت': {
    en: 'I would accept',
    grammar: 'Result prefix (لـ) + verb + subject',
    tip: 'The Arabic “لـ” maps to “I would + base verb” (“I would accept”).'
  },
  'ذلك': {
    en: 'that',
    grammar: 'Distant demonstrative',
    tip: '“that offer”.'
  },
  'العرض': {
    en: 'offer',
    grammar: 'Singular noun',
    tip: 'Drops “الـ” after “that” (“that offer”).'
  },
  'المزيد': {
    en: 'more',
    grammar: 'Comparative quantifier',
    tip: '“المزيد من الوقت” → “more time”.'
  },
  'الوقت': {
    en: 'time',
    grammar: 'Uncountable noun',
    tip: '“more time”.'
  },
  'لسافرت': {
    en: 'I would travel',
    grammar: 'Result prefix (لـ) + verb + subject',
    tip: 'The Arabic “لـ” maps to the modal “would” in English.'
  },
  'إضافي': {
    en: 'extra / additional',
    grammar: 'Adjective',
    tip: 'Placed before the noun: “extra time”.'
  },
  'برلين': {
    en: 'Berlin',
    grammar: 'Proper noun (City)',
    tip: 'Capitalized, no article.'
  },
  'أكثر': {
    en: 'more',
    grammar: 'Adverb',
    tip: 'Placed after the verb (“travel more”).'
  },
  'أذا': {
    en: 'If (real condition)',
    grammar: 'Real conditional particle (إذا)',
    tip: 'Takes Present Simple in the “if” clause and “will” in the result clause.'
  },
  'أمطرت': {
    en: 'it rains',
    grammar: 'Conditional verb',
    tip: 'English needs the weather dummy subject “it” + Present Simple “rains” after “If”.'
  },
  'سنلغي': {
    en: 'we will cancel',
    grammar: 'Future prefix (سـ) + 1st-person plural verb',
    tip: 'Unpacks into “we will cancel”.'
  },
  'الرحلة': {
    en: 'the trip',
    grammar: 'Definite noun',
    tip: 'Direct object of “cancel”.'
  },
  'على': {
    en: 'on / although (in على الرغم من)',
    grammar: 'Preposition / Conjunction part',
    tip: 'With “الرغم من أنه”, translates to “Although”.'
  },
  'الرغم': {
    en: 'Although / Even though',
    grammar: 'Concessive marker',
    tip: 'Never put “but” in the second clause when you start with “Although”!'
  },
  'أنه': {
    en: 'he (that he)',
    grammar: 'Particle + pronoun suffix',
    tip: 'Becomes the subject “he” after “Although” or “that he” in reported speech.'
  },
  'متعبا': {
    en: 'tired',
    grammar: 'Adjective',
    tip: 'Follows “was” (“Although he was tired”).'
  },
  'ألا': {
    en: '(omit “but” after Although!)',
    grammar: 'Arabic correlative linker (إلا أنه)',
    tip: 'Arabic says “على الرغم... إلا أنه”, but English strictly forbids “Although… but”!'
  },
  'أنهى': {
    en: 'finished',
    grammar: 'Past simple verb',
    tip: '“he finished the report”.'
  },
  'لأنه': {
    en: 'Because he',
    grammar: 'Causal conjunction (لأن) + pronoun (ـه)',
    tip: 'Never put “so” in the second clause when you start with “Because”!'
  },
  'مريضا': {
    en: 'sick / ill',
    grammar: 'Adjective',
    tip: '“Because he was sick”.'
  },
  'لم': {
    en: 'did not / could not',
    grammar: 'Past negation particle',
    tip: 'Negates the past verb that follows.'
  },
  'يتمكن': {
    en: 'could (was able to)',
    grammar: 'Verb of ability',
    tip: '“لم يتمكن من” translates cleanly to “could not + base verb”.'
  },
  'حضور': {
    en: 'attend',
    grammar: 'Verbal noun',
    tip: 'After “could not”, use the base verb “attend”.'
  },
  'الحفل': {
    en: 'the party / ceremony',
    grammar: 'Definite noun',
    tip: 'Direct object of “attend” (no preposition needed).'
  },
  'فاتني': {
    en: 'I missed',
    grammar: 'Past verb + object suffix (ـني)',
    tip: 'Literal: “passed me”. In English, the person is the subject: “I missed the train”.'
  },
  'القطار': {
    en: 'the train',
    grammar: 'Definite noun',
    tip: 'Direct object of “missed”.'
  },
  'ولذلك': {
    en: 'so',
    grammar: 'Result conjunction',
    tip: 'Connects cause and effect when “Because” was not used at the start.'
  },
  'وصلت': {
    en: 'I arrived',
    grammar: 'Past verb + 1st-person suffix',
    tip: '“so I arrived late”.'
  },
  'متأخرا': {
    en: 'late',
    grammar: 'Adverb',
    tip: '“arrived late”.'
  },
  'رجاء': {
    en: 'Please',
    grammar: 'Politeness marker',
    tip: 'Placed at the start of an imperative request.'
  },
  'أطفئ': {
    en: 'turn off / switch off',
    grammar: 'Imperative phrasal verb',
    tip: 'Use the phrasal verb “turn off” for lights/devices — never say “close the lights”!'
  },
  'الأنوار': {
    en: 'the lights',
    grammar: 'Definite plural noun',
    tip: '“turn off the lights”.'
  },
  'قبل': {
    en: 'before',
    grammar: 'Time conjunction',
    tip: 'Followed by subject + present verb (“before you leave”).'
  },
  'تغادر': {
    en: 'you leave',
    grammar: 'Present verb',
    tip: '“before you leave” (drop Arabic “أن”).'
  },
  'نفد': {
    en: 'ran out of',
    grammar: 'Depletion verb',
    tip: 'English flips the subject to the people: “We ran out of gas”.'
  },
  'منا': {
    en: 'We (from us)',
    grammar: 'Preposition + pronoun',
    tip: 'Becomes the subject “We” in “We ran out of gas”.'
  },
  'البنزين': {
    en: 'gas / petrol',
    grammar: 'Uncountable noun',
    tip: 'Object of “ran out of” (no “the”).'
  },
  'منتصف': {
    en: 'the middle of',
    grammar: 'Spatial noun',
    tip: '“in the middle of the road”.'
  },
  'الطريق': {
    en: 'the road',
    grammar: 'Definite noun',
    tip: '“in the middle of the road”.'
  },
  'تستسلم': {
    en: 'give up',
    grammar: 'Phrasal verb',
    tip: 'Natural English uses the phrasal verb “give up” for “تستسلم”.'
  },
  'أبدا': {
    en: 'Never / ever',
    grammar: 'Emphatic negative adverb',
    tip: '“لا تستسلم أبداً” starts with “Never give up”.'
  },
  'مهما': {
    en: 'no matter / whatever',
    grammar: 'Concessive expression',
    tip: '“no matter the difficulties”.'
  },
  'كانت': {
    en: '(were / are — omitted in “no matter the…”)',
    grammar: 'Copula verb',
    tip: '“no matter the difficulties” is concise and natural.'
  },
  'الصعوبات': {
    en: 'the difficulties',
    grammar: 'Definite plural noun',
    tip: '“no matter the difficulties”.'
  },
  'أعطاني': {
    en: 'gave me',
    grammar: 'Past verb + indirect object suffix (ـني)',
    tip: 'Placed AFTER the subject (“The manager gave me…”).'
  },
  'المدير': {
    en: 'The manager',
    grammar: 'Definite subject noun',
    tip: 'In English SVO order, put “The manager” at the start before “gave me”.'
  },
  'بعض': {
    en: 'some',
    grammar: 'Quantifier',
    tip: 'Pairs with uncountable nouns like “some useful advice”.'
  },
  'النصائح': {
    en: 'advice (uncountable!)',
    grammar: 'Uncountable mass noun in English',
    tip: 'Trap alert: “نصائح” is plural in Arabic, but “advice” NEVER takes “-s” in English!'
  },
  'المفيدة': {
    en: 'useful',
    grammar: 'Adjective',
    tip: 'Placed before “advice” (“some useful advice”).'
  },
  'المعلومات': {
    en: 'information (singular uncountable!)',
    grammar: 'Uncountable mass noun in English',
    tip: 'Takes singular “This” and singular “is” (“This information is…”, never “are”).'
  },
  'سرية': {
    en: 'confidential',
    grammar: 'Predicate adjective',
    tip: 'Needs the singular linking verb “is” (“is strictly confidential”).'
  },
  'للغاية': {
    en: 'strictly / very / highly',
    grammar: 'Adverb of degree',
    tip: 'Collocates as “strictly confidential”.'
  },
  'اشترينا': {
    en: 'We bought',
    grammar: 'Past verb + 1st-person plural suffix (ـنا)',
    tip: 'Includes subject “We” and past verb “bought”.'
  },
  'أثاثا': {
    en: 'furniture (uncountable!)',
    grammar: 'Uncountable mass noun',
    tip: 'Never say “a furniture” or “furnitures” — just “new furniture”.'
  },
  'جديدا': {
    en: 'new',
    grammar: 'Adjective',
    tip: 'Placed before “furniture” (“new furniture”).'
  },
  'لغرفة': {
    en: 'for the … room',
    grammar: 'Preposition (لـ) + noun',
    tip: '“for the living room”.'
  },
  'المعيشة': {
    en: 'living (living room)',
    grammar: 'Noun adjunct',
    tip: 'Placed before “room” (“the living room”).'
  },
  'أتطلع': {
    en: 'look forward',
    grammar: 'Phrasal verb',
    tip: 'In “look forward to”, “to” is a preposition — the next verb MUST end in “-ing”!'
  },
  'بشوق': {
    en: '(built into “look forward to”)',
    grammar: 'Adverbial intensifier',
    tip: '“look forward to” already carries the meaning of eager anticipation.'
  },
  'لقائك': {
    en: 'meeting you',
    grammar: 'Gerund (-ing) + object pronoun',
    tip: 'Because “to” in “look forward to” is a preposition, use “meeting you” (not “meet”).'
  },
  'قريبا': {
    en: 'soon',
    grammar: 'Time adverb',
    tip: 'Placed at the end of the clause.'
  },
  'مهتم': {
    en: 'interested',
    grammar: 'Adjective',
    tip: 'Collocates with “in” (“is interested in”) followed by an “-ing” verb.'
  },
  'بتعلم': {
    en: 'in learning',
    grammar: 'Preposition + gerund (-ing)',
    tip: 'Any verb right after a preposition (“in”) must take “-ing” (“in learning”).'
  },
  'لغات': {
    en: 'languages',
    grammar: 'Plural countable noun',
    tip: 'Preceded by its adjective (“new languages”).'
  },
  'شكرا': {
    en: 'Thank you / Thanks',
    grammar: 'Expression of gratitude',
    tip: 'Followed by the preposition “for” + “-ing” verb.'
  },
  'لمساعدتي': {
    en: 'for helping me',
    grammar: 'Preposition + gerund + object pronoun',
    tip: 'Use “for helping me” (never “for help me”).'
  },
  'المشكلة': {
    en: 'problem',
    grammar: 'Singular noun',
    tip: '“with this problem”.'
  },
  'كسرت': {
    en: 'was broken',
    grammar: 'Past passive verb (كُسِرَت)',
    tip: 'English builds the passive with “was/were + past participle” (“was broken”).'
  },
  'النافذة': {
    en: 'The window',
    grammar: 'Definite subject noun',
    tip: 'Comes FIRST before “was broken” in English.'
  },
  'أثناء': {
    en: 'during',
    grammar: 'Preposition',
    tip: '“during the storm”.'
  },
  'العاصفة': {
    en: 'the storm',
    grammar: 'Definite noun',
    tip: '“during the storm”.'
  },
  'الليلة': {
    en: 'night (last night)',
    grammar: 'Time noun',
    tip: 'No “the” in “last night”.'
  },
  'الماضية': {
    en: 'last',
    grammar: 'Adjective',
    tip: 'Placed before “night” without “the” (“last night”).'
  },
  'يتم': {
    en: 'is being (continuous passive)',
    grammar: 'Passive helper verb',
    tip: '“يتم بناء” right now maps to Present Continuous Passive: “is being built”.'
  },
  'بناء': {
    en: 'built',
    grammar: 'Past participle in passive',
    tip: '“is being built”.'
  },
  'الجسر': {
    en: 'bridge',
    grammar: 'Singular noun',
    tip: '“This bridge” comes first as the subject.'
  },
  'الحالي': {
    en: 'right now / currently',
    grammar: 'Time phrase (في الوقت الحالي)',
    tip: 'Signals an action in progress right now (“is being built right now”).'
  },
  'الرسالة': {
    en: 'The message',
    grammar: 'Definite subject noun',
    tip: 'Comes before the passive verb “was sent”.'
  },
  'عن': {
    en: 'by (in عن طريق الخطأ) / about',
    grammar: 'Preposition',
    tip: '“عن طريق الخطأ” is the fixed English idiom “by mistake”.'
  },
  'طريق': {
    en: 'way (by mistake)',
    grammar: 'Idiom component',
    tip: 'Part of “عن طريق الخطأ” → “by mistake”.'
  },
  'الخطأ': {
    en: 'mistake (by mistake)',
    grammar: 'Idiom noun',
    tip: 'Say “by mistake” (no “the”).'
  },

  // Phase 3 Mastery & Register
  'فحصت': {
    en: 'were tested',
    grammar: 'Passive past verb (فُحِصَت)',
    tip: 'English builds passive with “was/were + past participle”.'
  },
  'عينات': {
    en: 'samples',
    grammar: 'Plural noun (جمع مؤنث سالم)',
    tip: 'Plural subject → takes plural passive helper “were”.'
  },
  'المياه': {
    en: 'water',
    grammar: 'Noun adjunct (مضاف إليه)',
    tip: 'Acts as a modifier before “samples” → “The water samples”.'
  },
  'المختبر': {
    en: 'the laboratory (the lab)',
    grammar: 'Definite place noun',
    tip: '“in the laboratory”.'
  },
  'قالت': {
    en: 'said',
    grammar: 'Past reporting verb',
    tip: 'Triggers tense backshift in the clause that follows.'
  },
  'الباحثة': {
    en: 'The researcher',
    grammar: 'Subject noun',
    tip: 'Placed before the verb “said” in English SVO order.'
  },
  'أنها': {
    en: 'that she / she',
    grammar: 'Particle (إنّ/أنّ) + pronoun (ـها)',
    tip: 'Introduces the reported clause (“that she…”).'
  },
  'ستنشر': {
    en: 'would publish (lit. will publish)',
    grammar: 'Future prefix (سـ) + verb',
    tip: 'Backshifts from “will” to “would” after past reporting verb “said”.'
  },
  'النتائج': {
    en: 'the results',
    grammar: 'Definite plural noun',
    tip: 'Direct object or plural subject.'
  },
  'يوفر': {
    en: 'save / saves',
    grammar: 'Present verb',
    tip: 'With fronted “Not only”, use “does … save”.'
  },
  'النظام': {
    en: 'system',
    grammar: 'Singular noun',
    tip: 'Drops “الـ” when preceded by “this” in English (“this system”, never “this the system”).'
  },
  'الطاقة': {
    en: 'energy',
    grammar: 'Uncountable noun',
    tip: 'General uncountable noun — drops “the” in English.'
  },
  'فحسب': {
    en: 'only (Not only…)',
    grammar: 'Restrictive particle',
    tip: 'Pairs with “لا” to form fronted “Not only does…”.'
  },
  'بل': {
    en: 'but',
    grammar: 'Correlative conjunction',
    tip: 'Introduces the second half: “but it also…”.'
  },
  'يقلل': {
    en: 'reduces',
    grammar: 'Present verb (3rd-person singular)',
    tip: 'Agrees with “it” → “reduces”.'
  },
  'التلوث': {
    en: 'pollution',
    grammar: 'Uncountable noun',
    tip: 'Drops “the” when speaking about pollution in general.'
  },
  'أيضا': {
    en: 'also / too',
    grammar: 'Additive adverb',
    tip: 'Placed before the main verb (“also reduces”) or at the very end (“too”).'
  },
  'نادرا': {
    en: 'Seldom / Rarely',
    grammar: 'Fronted negative adverb',
    tip: 'Triggers question-style inversion: “Seldom do we see…” (not “Seldom we see”).'
  },
  'ما': {
    en: 'What (cleft) / particle',
    grammar: 'Relative or adverbial particle',
    tip: 'At the start of a cleft sentence (“ما يقلقني”), translates to “What…”.'
  },
  'نرى': {
    en: 'do we see',
    grammar: 'Inverted verb after Seldom',
    tip: 'Because “Seldom” is at the front, invert helper + subject: “do we see”.'
  },
  'مثل': {
    en: 'such',
    grammar: 'Predeterminer',
    tip: '“such extraordinary dedication” / “such a sudden development”.'
  },
  'الالتزام': {
    en: 'dedication / commitment',
    grammar: 'Uncountable abstract noun',
    tip: 'Preceded by “such extraordinary” (“such extraordinary dedication”).'
  },
  'الرائع': {
    en: 'extraordinary / remarkable',
    grammar: 'Adjective',
    tip: 'Placed before “dedication”.'
  },
  'أكن': {
    en: 'did I (in لم أكن أعلم قط)',
    grammar: 'Inverted past auxiliary',
    tip: '“لم أكن أعلم قط” maps to the C1 inverted idiom “Little did I know”.'
  },
  'أعلم': {
    en: 'know',
    grammar: 'Base verb after did',
    tip: '“Little did I know”.'
  },
  'قط': {
    en: 'Little (never at all)',
    grammar: 'Emphatic negative adverb',
    tip: 'Fronted as “Little did I know…”.'
  },
  'الحقيقة': {
    en: 'the truth',
    grammar: 'Definite noun',
    tip: '“that the truth would unfold”.'
  },
  'ستتكشف': {
    en: 'would unfold',
    grammar: 'Future-in-the-past verb',
    tip: 'Backshifts from “will” to “would” after “Little did I know”.'
  },
  'بهذا': {
    en: 'like this',
    grammar: 'Manner phrase (بهذا الشكل)',
    tip: '“بهذا الشكل” translates naturally to “like this”.'
  },
  'الشكل': {
    en: 'way / manner (like this)',
    grammar: 'Noun',
    tip: 'Combined in “بهذا الشكل” → “like this”.'
  },
  'ينبغي': {
    en: 'should',
    grammar: 'Modal of obligation',
    tip: 'Inverted before the subject after “Under no circumstances” (“should this policy be…”).'
  },
  'تحت': {
    en: 'Under',
    grammar: 'Preposition',
    tip: 'Opens “Under no circumstances”.'
  },
  'ظرف': {
    en: 'circumstances',
    grammar: 'Plural noun in English idiom',
    tip: '“تحت أي ظرف من الظروف” is the fixed C1 phrase “Under no circumstances”.'
  },
  'الظروف': {
    en: 'circumstances',
    grammar: 'Plural noun',
    tip: ' triggers inversion: “Under no circumstances should…”.'
  },
  'انتهاك': {
    en: 'be violated',
    grammar: 'Passive infinitive',
    tip: '“should this policy be violated”.'
  },
  'السياسة': {
    en: 'policy',
    grammar: 'Singular noun',
    tip: '“this policy”.'
  },
  'أخبرني': {
    en: 'He told me',
    grammar: 'Past reporting verb + object suffix',
    tip: 'Because “told” is past, backshift the next verb (“he was very busy”).'
  },
  'مشغول': {
    en: 'busy',
    grammar: 'Adjective',
    tip: 'Needs the backshifted linking verb “was” (“that he was very busy”).'
  },
  'بمشروع': {
    en: 'with a … project',
    grammar: 'Preposition + noun',
    tip: '“busy” collocates with “with” (“busy with a new project”).'
  },
  'جديد': {
    en: 'new',
    grammar: 'Adjective',
    tip: '“with a new project”.'
  },
  'ستنهي': {
    en: 'would finish',
    grammar: 'Backshifted future verb',
    tip: 'After “She said”, backshift “will finish” to “would finish”.'
  },
  'المهمة': {
    en: 'the task',
    grammar: 'Definite noun',
    tip: 'Direct object of “finish”.'
  },
  'الموعد': {
    en: 'the deadline / appointment',
    grammar: 'Definite noun',
    tip: '“الموعد النهائي” = “the deadline”; “موعد الاجتماع” = “the meeting appointment”.'
  },
  'النهائي': {
    en: 'deadline (final)',
    grammar: 'Adjective',
    tip: '“الموعد النهائي” translates to the single compound noun “the deadline”.'
  },
  'أكدوا': {
    en: 'They confirmed',
    grammar: 'Past reporting verb (3rd-person plural)',
    tip: 'Triggers Past Perfect backshift (“that they had received”).'
  },
  'أنهم': {
    en: 'that they',
    grammar: 'Conjunction + plural pronoun',
    tip: '“that they had received”.'
  },
  'قد': {
    en: 'had / have',
    grammar: 'Perfect aspect particle',
    tip: 'After past “confirmed”, shifts to Past Perfect “had received”.'
  },
  'استلموا': {
    en: 'had received',
    grammar: 'Past perfect verb',
    tip: 'Backshifted from “have received” to “had received”.'
  },
  'جميع': {
    en: 'all',
    grammar: 'Universal quantifier',
    tip: '“all the required documents”.'
  },
  'المستندات': {
    en: 'the … documents',
    grammar: 'Definite plural noun',
    tip: 'Preceded by “required” (“all the required documents”).'
  },
  'المطلوبة': {
    en: 'required',
    grammar: 'Participle adjective',
    tip: 'Placed before “documents” (“the required documents”).'
  },
  'يجب': {
    en: 'should / must',
    grammar: 'Modal of obligation',
    tip: '“كان يجب أن” = past regret “should have + V3”; “يجب أن” in present = “must”.'
  },
  'تخبرني': {
    en: 'have told me',
    grammar: 'Past modal complement',
    tip: 'After “should”, use “have told me” for past regret.'
  },
  'التغيير': {
    en: 'the change',
    grammar: 'Definite noun',
    tip: '“about the change”.'
  },
  'سابق': {
    en: 'earlier',
    grammar: 'Comparative time adverb (في وقت سابق)',
    tip: '“في وقت سابق” condenses into the single adverb “earlier”.'
  },
  'بد': {
    en: 'must (in لا بد أنه)',
    grammar: 'Modal of strong deduction',
    tip: '“لا بد أنه قد...” in the past uses “must have + past participle”.'
  },
  'نسي': {
    en: 'have forgotten',
    grammar: 'Past participle after must have',
    tip: '“He must have forgotten”.'
  },
  'موعد': {
    en: 'appointment',
    grammar: 'Noun',
    tip: '“the meeting appointment”.'
  },
  'الاجتماع': {
    en: 'the meeting',
    grammar: 'Definite noun',
    tip: 'Acts as a modifier in “the meeting appointment” or object in “attend the meeting”.'
  },
  'يكن': {
    en: 'could (in لم يكن بإمكانه)',
    grammar: 'Past modal auxiliary',
    tip: '“لم يكن بإمكانه” + past event = “He could not have + V3”.'
  },
  'بأمكانه': {
    en: 'could (capable of)',
    grammar: 'Capability noun + suffix',
    tip: '“He could not have anticipated”.'
  },
  'توقع': {
    en: 'anticipated / foreseen',
    grammar: 'Past participle',
    tip: '“could not have anticipated”.'
  },
  'التطور': {
    en: 'development',
    grammar: 'Singular noun',
    tip: '“such a sudden development”.'
  },
  'المفاجئ': {
    en: 'sudden',
    grammar: 'Adjective',
    tip: 'Placed before “development” (“such a sudden development”).'
  },
  'يقلقني': {
    en: 'worries me',
    grammar: 'Present verb + object suffix',
    tip: 'In the wh-cleft “What truly worries me is…”, takes singular “is”.'
  },
  'حقا': {
    en: 'truly / really',
    grammar: 'Adverb',
    tip: 'Placed before the verb (“What truly worries me”).'
  },
  'الافتقار': {
    en: 'the lack',
    grammar: 'Definite abstract noun',
    tip: 'Collocates with “of” (“the lack of transparency”).'
  },
  'الشفافية': {
    en: 'transparency',
    grammar: 'Uncountable abstract noun',
    tip: '“the lack of transparency” (no “the” before transparency).'
  },
  'شغفه': {
    en: 'his … passion',
    grammar: 'Noun + possessive suffix (ـه)',
    tip: 'Spotlighted in an It-cleft: “It was his continuous passion that…”.'
  },
  'المستمر': {
    en: 'continuous',
    grammar: 'Adjective',
    tip: 'Placed between “his” and “passion” (“his continuous passion”).'
  },
  'أثار': {
    en: 'impressed (aroused admiration)',
    grammar: 'Past verb',
    tip: '“أثار إعجابي به” condenses into “impressed me”.'
  },
  'أعجابي': {
    en: 'impressed me',
    grammar: 'Idiom component',
    tip: 'Part of “أثار إعجابي” → “impressed me”.'
  },
  'به': {
    en: '(included in “impressed me”)',
    grammar: 'Preposition + pronoun',
    tip: 'Omitted in English because “his passion” is already the subject of “impressed”.'
  },
  'كل': {
    en: 'All',
    grammar: 'Quantifier (cleft opener)',
    tip: '“All we need now is…”.'
  },
  'نحتاجه': {
    en: 'we need (drop ـه!)',
    grammar: 'Present verb + ghost pronoun',
    tip: 'Say “All we need now”, without repeating “it”.'
  },
  'قرار': {
    en: 'a … decision',
    grammar: 'Singular countable noun',
    tip: '“a decisive decision”.'
  },
  'حاسم': {
    en: 'decisive',
    grammar: 'Adjective',
    tip: 'Placed before “decision” (“a decisive decision”).'
  },
  'أقترح': {
    en: 'I suggest',
    grammar: 'Mandative verb',
    tip: 'Triggers the formal subjunctive: the next verb stays in base form (“that he attend”).'
  },
  'يحضر': {
    en: 'attend (base subjunctive!)',
    grammar: 'Subjunctive verb',
    tip: 'Do NOT add “-s” after “I suggest that he…” → “that he attend”.'
  },
  'شخصيا': {
    en: 'in person',
    grammar: 'Adverbial phrase',
    tip: '“شخصياً” at a meeting translates to “in person”.'
  },
  'الضروري': {
    en: 'It is essential',
    grammar: 'Mandative adjective (من الضروري)',
    tip: 'Triggers the bare subjunctive “be” (“It is essential that the reports be accurate”).'
  },
  'تكون': {
    en: 'be (subjunctive!)',
    grammar: 'Subjunctive copula',
    tip: 'After “It is essential that…”, use bare “be” instead of “are”!'
  },
  'التقارير': {
    en: 'the reports',
    grammar: 'Definite plural noun',
    tip: '“that the reports be accurate”.'
  },
  'دقيقة': {
    en: 'accurate',
    grammar: 'Adjective',
    tip: '“be accurate”.'
  },
  'أصرت': {
    en: 'insisted',
    grammar: 'Past mandative verb',
    tip: 'Followed by “that + subject + base verb” (“insisted that the manager resign”).'
  },
  'اللجنة': {
    en: 'The committee',
    grammar: 'Definite subject noun',
    tip: 'Placed before “insisted” (“The committee insisted”).'
  },
  'يستقيل': {
    en: 'resign (base subjunctive!)',
    grammar: 'Subjunctive verb',
    tip: 'Stay in base form without “-s” or “-ed” after “insisted that”: “that the manager resign”.'
  },
  'الفور': {
    en: 'immediately (على الفور)',
    grammar: 'Adverbial idiom',
    tip: '“على الفور” translates to “immediately”.'
  },
  'علاوة': {
    en: 'Furthermore / Moreover',
    grammar: 'Formal additive discourse marker (علاوة على ذلك)',
    tip: 'Replaces whole phrase “علاوة على ذلك” at the start of a formal sentence.'
  },
  'فأن': {
    en: '(structural linker — omitted in English)',
    grammar: 'Arabic discourse particle (فإنّ)',
    tip: 'After “Furthermore”, start directly with the English subject (“the preliminary results”).'
  },
  'الأولية': {
    en: 'preliminary',
    grammar: 'Adjective',
    tip: 'Placed before “results” (“the preliminary results”).'
  },
  'غير': {
    en: 'in- / un- (negative prefix)',
    grammar: 'Negation noun',
    tip: '“غير حاسمة” maps to the single prefixed adjective “inconclusive”.'
  },
  'حاسمة': {
    en: 'conclusive / decisive',
    grammar: 'Adjective',
    tip: 'With “غير”, becomes “inconclusive”; with “إجراءات”, becomes “decisive measures”.'
  },
  'ومع': {
    en: 'Nonetheless / Nevertheless (ومع ذلك)',
    grammar: 'Concessive discourse marker',
    tip: '“ومع ذلك” at C1 register translates to “Nonetheless”.'
  },
  'تزال': {
    en: 'remain (لا تزال هناك)',
    grammar: 'Existential persistence verb',
    tip: '“لا تزال هناك” elevates to “there remain” in formal English.'
  },
  'هناك': {
    en: 'there',
    grammar: 'Existential dummy subject',
    tip: '“there remain significant obstacles”.'
  },
  'عقبات': {
    en: 'obstacles',
    grammar: 'Plural countable noun',
    tip: '“significant obstacles”.'
  },
  'رئيسية': {
    en: 'significant / major',
    grammar: 'Adjective',
    tip: 'Placed before “obstacles”.'
  },
  'التغلب': {
    en: 'to overcome',
    grammar: 'Infinitive modifier',
    tip: '“obstacles to overcome” (do not repeat “them” at the end!).'
  },
  'عليها': {
    en: '(drop returning pronoun in “to overcome”!)',
    grammar: 'Preposition + returning pronoun',
    tip: 'Say “obstacles to overcome”, never “obstacles to overcome them”.'
  },
  'وبالتالي': {
    en: 'Consequently / Therefore',
    grammar: 'Formal result discourse marker',
    tip: 'High-register replacement for “so”.'
  },
  'يتعين': {
    en: 'must (يتعين علينا)',
    grammar: 'Obligation verb',
    tip: '“يتعين علينا” translates to “we must”.'
  },
  'علينا': {
    en: 'we (upon us)',
    grammar: 'Preposition + pronoun',
    tip: 'Becomes the active subject “we” in “we must review”.'
  },
  'مراجعة': {
    en: 'review',
    grammar: 'Base verb after must',
    tip: '“we must review”.'
  },
  'استراتيجيتنا': {
    en: 'our strategy',
    grammar: 'Noun + possessive suffix (ـنا)',
    tip: '“our strategy”.'
  },
  'بالكامل': {
    en: 'completely / entirely',
    grammar: 'Adverb of degree',
    tip: 'Placed at the end (“review our strategy completely”).'
  },
  'الواقع': {
    en: 'Actually / In reality (في الواقع)',
    grammar: 'Discourse marker',
    tip: '“في الواقع” is the true meaning of “Actually” (whereas “حالياً” is “currently”).'
  },
  'لست': {
    en: 'I do not / I am not',
    grammar: '1st-person negative verb',
    tip: 'Because “agree” is an action verb in English, say “I do not agree” ( NEVER “I am not agree”)!'
  },
  'متفقا': {
    en: 'agree',
    grammar: 'Verb in English (participle in Arabic)',
    tip: 'Arabic uses an adjective (“متفق”), but English uses the verb “agree” with “do not”!'
  },
  'تماما': {
    en: 'entirely / completely',
    grammar: 'Adverb',
    tip: 'Placed before “agree” (“do not entirely agree”).'
  },
  'مع': {
    en: 'with',
    grammar: 'Preposition',
    tip: '“agree with this proposal”.'
  },
  'المقترح': {
    en: 'proposal',
    grammar: 'Singular noun',
    tip: '“this proposal”.'
  },
  'أعيش': {
    en: 'am living / live',
    grammar: '1st-person verb',
    tip: 'With “حالياً”, use Present Continuous: “I am currently living”.'
  },
  'حاليا': {
    en: 'currently (NOT actually!)',
    grammar: 'Present time adverb',
    tip: 'False friend alert: “حالياً” is “currently” — never translate it as “actually”!'
  },
  'مدريد': {
    en: 'Madrid',
    grammar: 'Proper city noun',
    tip: '“in Madrid”.'
  },
  'أبدى': {
    en: 'was / showed',
    grammar: 'Past verb',
    tip: '“أبدى الفريق تعاطفاً” maps to “The team was very sympathetic”.'
  },
  'الفريق': {
    en: 'The team',
    grammar: 'Definite subject noun',
    tip: 'Comes first before “was”.'
  },
  'تعاطفا': {
    en: 'sympathetic (compassionate)',
    grammar: 'Adjective/Noun',
    tip: '“Sympathetic” means showing compassion (متعاطف), not just “nice/friendly”.'
  },
  'كبيرا': {
    en: 'very / great',
    grammar: 'Intensifier',
    tip: '“very sympathetic”.'
  },
  'موقفنا': {
    en: 'our situation',
    grammar: 'Noun + possessive suffix (ـنا)',
    tip: '“sympathetic to our situation”.'
  },
  'نتخذ': {
    en: 'we take (collocation!)',
    grammar: 'Collocation verb',
    tip: 'In English, you “TAKE measures” (never “make measures” or “do measures”).'
  },
  'أجراءات': {
    en: 'measures / action',
    grammar: 'Plural noun',
    tip: 'Collocates with “take”: “take decisive measures”.'
  },
  'لمعالجة': {
    en: 'to address',
    grammar: 'Purpose infinitive',
    tip: 'In high register, use “to address this crisis”.'
  },
  'الأزمة': {
    en: 'crisis',
    grammar: 'Singular noun',
    tip: '“this crisis”.'
  },
  'لعبت': {
    en: 'played',
    grammar: 'Past verb',
    tip: 'Collocates with “role”: “played a pivotal role”.'
  },
  'التكنولوجيا': {
    en: 'Technology',
    grammar: 'Generic uncountable noun',
    tip: 'Drops “the” when talking about technology in general.'
  },
  'دورا': {
    en: 'a … role',
    grammar: 'Singular countable noun',
    tip: '“played a pivotal role”.'
  },
  'محوريا': {
    en: 'pivotal / crucial',
    grammar: 'C1 Adjective',
    tip: 'Placed before “role” (“a pivotal role”).'
  },
  'التحول': {
    en: 'transformation',
    grammar: 'Singular noun',
    tip: '“in this transformation”.'
  },
  'توصل': {
    en: 'reached',
    grammar: 'Past collocation verb',
    tip: 'In English, you “REACH a compromise/agreement” (never “arrive to”!).'
  },
  'الطرفان': {
    en: 'The two parties',
    grammar: 'Dual subject noun',
    tip: 'Placed first: “The two parties finally reached…”.'
  },
  'أخيرا': {
    en: 'finally',
    grammar: 'Adverb',
    tip: 'Placed before the main verb (“finally reached”).'
  },
  'تسوية': {
    en: 'a … compromise',
    grammar: 'Singular countable noun',
    tip: '“reached a mutually acceptable compromise”.'
  },
  'مقبولة': {
    en: 'acceptable',
    grammar: 'Adjective',
    tip: '“mutually acceptable compromise”.'
  },
  'للطرفين': {
    en: 'mutually (for both parties)',
    grammar: 'Adverbial modifier',
    tip: 'Condenses into the adverb “mutually” before “acceptable” (“mutually acceptable”).'
  }
};

// Build normalized dictionary index
export const ARABIC_WORD_LEXICON: Record<string, ArabicLexiconEntry> = {};
for (const [k, v] of Object.entries(RAW_LEXICON)) {
  ARABIC_WORD_LEXICON[stripTashkeel(k)] = v;
}

/**
 * Deterministic offline Arabic word lookup.
 * 1. Normalizes diacritics/punctuation via stripTashkeel.
 * 2. Checks the curated ARABIC_WORD_LEXICON (including common clitic prefixes like و / ف / ب / ل / ال).
 * 3. If an exercise or curriculum chunk matches the word, enriches with the exact chunk mapping.
 */
export function lookupArabicWord(
  rawArabicToken: string,
  currentExercise?: Exercise
): ArabicLexiconEntry {
  const cleanKey = stripTashkeel(rawArabicToken);
  if (!cleanKey) {
    return {
      en: 'Select an Arabic word',
      grammar: 'Arabic Token',
      tip: 'Double-tap any Arabic word to inspect its English transfer logic.'
    };
  }

  // 1. Direct match in curated lexicon
  if (ARABIC_WORD_LEXICON[cleanKey]) {
    return ARABIC_WORD_LEXICON[cleanKey];
  }

  // 2. Try stripping common single-letter Arabic prefixes (و، ف، ب، ل، ك) or definite article (ال)
  const prefixes = ['و', 'ف', 'ب', 'ل', 'ك', 'ال', 'وال', 'بال', 'لل'];
  for (const pre of prefixes) {
    if (cleanKey.startsWith(pre) && cleanKey.length > pre.length + 1) {
      const stem = cleanKey.slice(pre.length);
      if (ARABIC_WORD_LEXICON[stem]) {
        return ARABIC_WORD_LEXICON[stem];
      }
      const withAl = 'ال' + stem;
      if (ARABIC_WORD_LEXICON[withAl]) {
        return ARABIC_WORD_LEXICON[withAl];
      }
    }
  }

  // 3. Search current exercise breakdownChunks (or all lessons' breakdownChunks) for a deterministic match
  const exercisesToSearch: Exercise[] = currentExercise
    ? [currentExercise, ...PHASES_DATA.flatMap(p => p.lessons.flatMap(l => l.exercises))]
    : PHASES_DATA.flatMap(p => p.lessons.flatMap(l => l.exercises));

  for (const ex of exercisesToSearch) {
    for (const chunk of ex.breakdownChunks) {
      const chunkWords = chunk.arabicText.split(/\s+/).map(stripTashkeel).filter(Boolean);
      if (chunkWords.includes(cleanKey)) {
        return {
          en: chunk.englishText,
          grammar: `${chunk.role.toUpperCase()} Chunk`,
          tip: chunk.explanation
        };
      }
    }
  }

  return {
    en: 'Check chunk breakdown below',
    grammar: 'Arabic Vocabulary Token',
    tip: 'Compare how this word maps into the English sentence skeleton.'
  };
}

/**
 * Optional free fallback translation fetch (MyMemory API) with strict 2500ms AbortController timeout.
 * Only used if a custom non-curriculum Arabic word is ever queried.
 */
export async function fetchFallbackArabicWordTranslation(
  rawArabicWord: string
): Promise<ArabicLexiconEntry | null> {
  const cleanWord = stripTashkeel(rawArabicWord);
  if (!cleanWord || typeof window === 'undefined' || typeof fetch === 'undefined') {
    return null;
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 2500);

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      cleanWord
    )}&langpair=ar|en`;
    const res = await fetch(url, { signal: controller.signal });
    window.clearTimeout(timeoutId);
    if (!res.ok) return null;
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    if (typeof translated === 'string' && translated.trim()) {
      return {
        en: translated.trim(),
        grammar: 'Arabic Vocabulary Token',
        tip: 'Compare how this word fits into the English Subject → Verb → Object skeleton.'
      };
    }
    return null;
  } catch {
    window.clearTimeout(timeoutId);
    return null;
  }
}
