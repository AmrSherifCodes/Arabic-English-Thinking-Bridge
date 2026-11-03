import { Exercise } from '../types';
import { PHASES_DATA } from '../data/lessons';

export interface ArabicLexiconEntry {
  en: string;
  grammar: string;
  grammarAr?: string;
  tip: string;
  tipAr?: string;
  phonetic?: string;
  root?: string;
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
    grammarAr: 'ضمير متكلم',
    tip: 'Must be followed by “am” or an active verb in English.',
    tipAr: 'لازم تيجي بعدها am أو فعل في الإنجليزي.'
  },
  'طبيب': {
    en: 'a doctor',
    grammar: 'Singular countable noun',
    grammarAr: 'Singular countable noun',
    tip: 'Add the indefinite article “a” before singular jobs in English.',
    tipAr: 'زوّد \'a\' قبل أسماء الوظايف المفردة في الإنجليزي.'
  },
  'في': {
    en: 'in / at / on',
    grammar: 'Preposition (حرف جر)',
    grammarAr: 'حرف جر',
    tip: 'Maps to “in” for cities/rooms, “on” for days, and “at” for exact times or institutions (“at work”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الإسكندرية': {
    en: 'Alexandria',
    grammar: 'Proper noun (اسم علم)',
    grammarAr: 'اسم علم',
    tip: 'No “the” before city names in English.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'هو': {
    en: 'He / is',
    grammar: '3rd-person singular pronoun',
    grammarAr: '3rd-person singular pronoun',
    tip: 'Needs “is” in nominal sentences (“He is…”) or takes “-s / does” in the present simple.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'مهندس': {
    en: 'an engineer / architect',
    grammar: 'Singular countable noun (اسم مفرد معدود)',
    grammarAr: 'اسم مفرد معدود',
    tip: 'Requires “an” before a vowel sound (“an engineer / an architect”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'معماري': {
    en: 'architect (architectural)',
    grammar: 'Modifying noun/adjective',
    grammarAr: 'Modifying noun/adjective',
    tip: '“مهندس معماري” compresses into the single English noun “an architect”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الطقس': {
    en: 'The weather',
    grammar: 'Definite subject noun',
    grammarAr: 'Definite subject noun',
    tip: 'Singular uncountable noun — takes the linking verb “is”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'بارد': {
    en: 'cold',
    grammar: 'Adjective (صفة)',
    grammarAr: 'صفة',
    tip: 'Needs a linking verb (“is cold”) in English.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'جدا': {
    en: 'very',
    grammar: 'Adverb of degree',
    grammarAr: 'Adverb of degree',
    tip: 'Placed BEFORE the adjective in English (“very cold”), unlike Arabic.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'اليوم': {
    en: 'today',
    grammar: 'Time adverb (ظرف زمان)',
    grammarAr: 'ظرف زمان',
    tip: 'Placed at the end or very beginning of the English sentence.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'نحن': {
    en: 'We',
    grammar: '1st-person plural pronoun',
    grammarAr: '1st-person plural pronoun',
    tip: 'Pairs with the plural linking verb “are” (“We are…”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'جاهزون': {
    en: 'ready',
    grammar: 'Predicate adjective (خبر)',
    grammarAr: 'خبر',
    tip: 'English adjectives never take a plural suffix — just “ready”, preceded by “are”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'للمقابلة': {
    en: 'for the interview',
    grammar: 'Preposition (لـ) + definite noun',
    grammarAr: 'لـ',
    tip: '“Ready” collocates with “for” in English (“ready for the interview”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'أحب': {
    en: 'like / love',
    grammar: 'Present active verb',
    grammarAr: 'Present active verb',
    tip: 'Follows the subject “I” directly (“I like…”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'القهوة': {
    en: 'coffee',
    grammar: 'Uncountable mass noun',
    grammarAr: 'Uncountable mass noun',
    tip: 'Drop Arabic “الـ” when talking about coffee in general (“I like hot coffee”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الساخنة': {
    en: 'hot',
    grammar: 'Adjective (صفة)',
    grammarAr: 'صفة',
    tip: 'Put the adjective BEFORE the noun without “the” (“hot coffee”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'بشكل': {
    en: 'in a way / generally',
    grammar: 'Adverbial phrase helper',
    grammarAr: 'Adverbial phrase helper',
    tip: 'Signals that the noun is generic and takes Zero Article in English.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'عام': {
    en: 'general (in general)',
    grammar: 'Adjective',
    grammarAr: 'Adjective',
    tip: 'In English, general concepts drop “the”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'اشترى': {
    en: 'bought',
    grammar: 'Past simple verb',
    grammarAr: 'Past simple verb',
    tip: 'Irregular past form of “buy” (“He bought”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'دراجة': {
    en: 'a bicycle / a bike',
    grammar: 'Singular countable noun',
    grammarAr: 'Singular countable noun',
    tip: 'Must have the indefinite article “a” (“a new bicycle”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'جديدة': {
    en: 'new',
    grammar: 'Adjective (صفة)',
    grammarAr: 'صفة',
    tip: 'Placed between “a” and the noun (“a new bicycle / a new language”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الموسيقى': {
    en: 'Music',
    grammar: 'Abstract uncountable noun',
    grammarAr: 'Abstract uncountable noun',
    tip: 'Generic concepts take Zero Article in English (“Music makes me happy”, not “The music”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'تجعلني': {
    en: 'makes me',
    grammar: 'Causative verb + object suffix (ـني)',
    grammarAr: 'ـني',
    tip: '“Music” is singular uncountable, so the verb takes “-s” (“makes me”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'سعيدا': {
    en: 'happy',
    grammar: 'Adjective complement',
    grammarAr: 'Adjective complement',
    tip: '“Makes me + adjective” (“makes me happy”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'كفكرة': {
    en: 'as a concept',
    grammar: 'Prepositional gloss',
    grammarAr: 'Prepositional gloss',
    tip: 'Reminds you that abstract concepts omit “the” in English.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'عامة': {
    en: 'general',
    grammar: 'Adjective',
    grammarAr: 'Adjective',
    tip: 'General categories omit “the”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'عندي': {
    en: 'I have',
    grammar: 'Preposition + suffix (شبه جملة للملكية)',
    grammarAr: 'شبه جملة للملكية',
    tip: 'Literal: “at me”. English uses the active verb “I have” instead.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'محاضرة': {
    en: 'a lecture',
    grammar: 'Singular countable noun',
    grammarAr: 'Singular countable noun',
    tip: 'Requires “a” (“a chemistry lecture”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'كيمياء': {
    en: 'chemistry',
    grammar: 'Noun adjunct (مضاف إليه)',
    grammarAr: 'مضاف إليه',
    tip: 'Placed BEFORE “lecture” in English (“chemistry lecture”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'غدا': {
    en: 'tomorrow',
    grammar: 'Time adverb',
    grammarAr: 'Time adverb',
    tip: 'No preposition needed before “tomorrow”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'سؤال': {
    en: 'a question',
    grammar: 'Singular countable noun',
    grammarAr: 'Singular countable noun',
    tip: 'Requires “a/an” in the singular (“an important question”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'مهم': {
    en: 'important',
    grammar: 'Adjective',
    grammarAr: 'Adjective',
    tip: 'Starts with a vowel sound, so it takes “an” (“an important question / meeting”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'عنده': {
    en: 'He has',
    grammar: 'Preposition + 3rd-person suffix (ـه)',
    grammarAr: 'ـه',
    tip: 'Literal: “at him”. Shift to active subject + conjugated verb: “He has”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'سيارة': {
    en: 'a car',
    grammar: 'Singular countable noun',
    grammarAr: 'Singular countable noun',
    tip: 'Preceded by its adjective (“an electric car”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'كهربائية': {
    en: 'electric',
    grammar: 'Adjective',
    grammarAr: 'Adjective',
    tip: 'Starts with a vowel sound, triggering “an” (“an electric car”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'ليس': {
    en: 'do not / is not',
    grammar: 'Negative particle (أداة نفي)',
    grammarAr: 'أداة نفي',
    tip: 'With “عندي / لدي”, negate using “do not have” in English.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'لدي': {
    en: 'have (I have)',
    grammar: 'Possession structure',
    grammarAr: 'Possession structure',
    tip: 'After “do not”, use the base verb “have” (“I do not have”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'وقت': {
    en: 'time',
    grammar: 'Uncountable noun',
    grammarAr: 'Uncountable noun',
    tip: 'Paired with “enough” (“enough time”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'كاف': {
    en: 'enough / sufficient',
    grammar: 'Determiner / Adjective',
    grammarAr: 'Determiner / Adjective',
    tip: 'Put “enough” BEFORE nouns (“enough time”), but after adjectives.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الآن': {
    en: 'now',
    grammar: 'Time adverb',
    grammarAr: 'Time adverb',
    tip: 'Usually placed at the end of the clause.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'لا': {
    en: 'do not / does not / not',
    grammar: 'Present negation particle',
    grammarAr: 'Present negation particle',
    tip: 'Summons helper verb “do/does not” before the base verb.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'أشرب': {
    en: 'drink',
    grammar: 'Present verb',
    grammarAr: 'Present verb',
    tip: 'Used in base form after “do not” (“I do not drink”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الشاي': {
    en: 'tea',
    grammar: 'Uncountable mass noun',
    grammarAr: 'Uncountable mass noun',
    tip: 'Generic preference drops “the” (“green tea”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الأخضر': {
    en: 'green',
    grammar: 'Adjective',
    grammarAr: 'Adjective',
    tip: 'Placed before “tea” without “the” (“green tea”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'سارة': {
    en: 'Sarah',
    grammar: 'Proper noun (3rd-person singular)',
    grammarAr: '3rd-person singular',
    tip: 'Takes the helper “does not” in present negation.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'تعمل': {
    en: 'work',
    grammar: 'Present verb',
    grammarAr: 'Present verb',
    tip: 'Drops the “-s” after “does not” (“Sarah does not work”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'عطلة': {
    en: 'weekend / holiday',
    grammar: 'Time noun',
    grammarAr: 'Time noun',
    tip: 'Part of “عطلة نهاية الأسبوع” → “the weekend”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'نهاية': {
    en: 'end (weekend)',
    grammar: 'Noun construct',
    grammarAr: 'Noun construct',
    tip: 'Combined with “الأسبوع” to mean “weekend”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الأسبوع': {
    en: 'the week (weekend)',
    grammar: 'Definite noun',
    grammarAr: 'Definite noun',
    tip: 'Use “on the weekend” or “on weekends”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'يعمل': {
    en: 'work / works',
    grammar: 'Present verb',
    grammarAr: 'Present verb',
    tip: 'Drop the “-s” after “does not” → “does not work”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'يوم': {
    en: 'on (day of)',
    grammar: 'Time noun',
    grammarAr: 'Time noun',
    tip: 'English uses the preposition “on” before days of the week (“on Monday / on Friday”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الجمعة': {
    en: 'Friday',
    grammar: 'Day of the week',
    grammarAr: 'Day of the week',
    tip: 'Always capitalized in English (“on Friday”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'هم': {
    en: 'They',
    grammar: '3rd-person plural pronoun',
    grammarAr: '3rd-person plural pronoun',
    tip: 'Takes “do not” in present negation (“They do not live”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'يعيشون': {
    en: 'live',
    grammar: 'Present verb',
    grammarAr: 'Present verb',
    tip: 'Base form after “do not” (“They do not live”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'هنا': {
    en: 'here',
    grammar: 'Place adverb',
    grammarAr: 'Place adverb',
    tip: 'Placed directly after the verb (“live here”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'بعد': {
    en: 'anymore (with الآن)',
    grammar: 'Temporal particle',
    grammarAr: 'Temporal particle',
    tip: '“بعد الآن” in a negative sentence translates to “anymore”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'هل': {
    en: 'Do / Does / Have (Question Opener)',
    grammar: 'Interrogative particle (حرف استفهام)',
    grammarAr: 'حرف استفهام',
    tip: 'English has no single word for “هل” — invert the helper verb (“Do / Does / Have”) to the start!',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'تتحدث': {
    en: 'you speak',
    grammar: 'Present verb (2nd-person)',
    grammarAr: '2nd-person',
    tip: 'Split into subject + base verb after “Do” (“Do you speak…?”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الإنجليزية': {
    en: 'English',
    grammar: 'Proper language noun',
    grammarAr: 'Proper language noun',
    tip: 'Always capitalized and takes no “the” (“speak English”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'بطلاقة': {
    en: 'fluently',
    grammar: 'Adverb of manner',
    grammarAr: 'Adverb of manner',
    tip: 'Placed after the object (“speak English fluently”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'يعيش': {
    en: 'live',
    grammar: 'Present verb',
    grammarAr: 'Present verb',
    tip: 'After “Does”, strip the “-s” back to base form “live”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'أخوك': {
    en: 'your brother',
    grammar: 'Noun + possessive suffix (ـك)',
    grammarAr: 'ـك',
    tip: 'In English, the possessive “your” comes BEFORE “brother”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'لندن': {
    en: 'London',
    grammar: 'Proper city noun',
    grammarAr: 'Proper city noun',
    tip: 'Cities take the preposition “in” (“in London”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'تحتاج': {
    en: 'you need',
    grammar: 'Present verb',
    grammarAr: 'Present verb',
    tip: 'With “هل”, form “Do you need…?”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'إلى': {
    en: 'to (or omitted after need)',
    grammar: 'Preposition',
    grammarAr: 'Preposition',
    tip: '“Need” takes a direct object without “to” (“need any help”), or “to + verb”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'أي': {
    en: 'any',
    grammar: 'Interrogative/Negative quantifier',
    grammarAr: 'Interrogative/Negative quantifier',
    tip: 'Used in questions and negatives (“any help”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'مساعدة': {
    en: 'help',
    grammar: 'Uncountable noun',
    grammarAr: 'Uncountable noun',
    tip: 'Uncountable in English — never pluralized.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'أستطيع': {
    en: 'I can',
    grammar: '1st-person modal verb',
    grammarAr: '1st-person modal verb',
    tip: '“Can” is followed immediately by a bare verb WITHOUT “to” (“I can help”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'مساعدتك': {
    en: 'help you',
    grammar: 'Verbal noun + object suffix (ـك)',
    grammarAr: 'ـك',
    tip: 'After “can”, use the base verb + pronoun: “help you”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'هذا': {
    en: 'this',
    grammar: 'Singular demonstrative',
    grammarAr: 'Singular demonstrative',
    tip: 'Drop Arabic “الـ” on the noun that follows (“this project”, never “this the project”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'المشروع': {
    en: 'project',
    grammar: 'Singular countable noun',
    grammarAr: 'Singular countable noun',
    tip: 'Collocates with “with” after “help” (“help you with this project”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'أريد': {
    en: 'I want',
    grammar: 'Present verb of desire',
    grammarAr: 'Present verb of desire',
    tip: 'Followed by “to + base verb” (“I want to learn”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'أن': {
    en: 'to (infinitive marker) / that',
    grammar: 'Subjunctive particle (حرف مصدري)',
    grammarAr: 'حرف مصدري',
    tip: 'Maps to “to” between two verbs (“want to learn”) or “that” after reporting/mandative verbs.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'أتعلم': {
    en: 'learn',
    grammar: 'Subjunctive verb',
    grammarAr: 'Subjunctive verb',
    tip: 'After “want to”, use the base verb “learn”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'لغة': {
    en: 'a language',
    grammar: 'Singular countable noun',
    grammarAr: 'Singular countable noun',
    tip: 'Requires “a” (“a new language”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'بحاجة': {
    en: 'need (in need of)',
    grammar: 'Prepositional phrase of necessity',
    grammarAr: 'Prepositional phrase of necessity',
    tip: 'Expressed as the active verb “need to” in English (“We need to leave”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'مغادرة': {
    en: 'leave',
    grammar: 'Verbal noun (مصدر)',
    grammarAr: 'مصدر',
    tip: 'After “need to”, translate the Arabic verbal noun as a base verb (“to leave”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'المكان': {
    en: 'the place',
    grammar: 'Definite noun',
    grammarAr: 'Definite noun',
    tip: 'Direct object of “leave” (“leave the place”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'بيت': {
    en: 'house',
    grammar: 'Singular countable noun',
    grammarAr: 'Singular countable noun',
    tip: 'Comes AFTER its adjectives (“a big and beautiful house”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'كبير': {
    en: 'big',
    grammar: 'Adjective',
    grammarAr: 'Adjective',
    tip: 'Placed before the noun in English.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'وجميل': {
    en: 'and beautiful',
    grammar: 'Conjunction + adjective',
    grammarAr: 'Conjunction + adjective',
    tip: 'Placed before the noun (“a big and beautiful house”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'قابلت': {
    en: 'I met',
    grammar: 'Past verb + 1st-person suffix (ـتُ)',
    grammarAr: 'ـتُ',
    tip: 'Includes both subject “I” and past verb “met”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'صديقا': {
    en: 'a friend',
    grammar: 'Singular countable noun',
    grammarAr: 'Singular countable noun',
    tip: 'Preceded by “an old” (“an old friend”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'قديما': {
    en: 'old',
    grammar: 'Adjective',
    grammarAr: 'Adjective',
    tip: 'Starts with a vowel sound, so it takes “an” (“an old friend”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'من': {
    en: 'from / of',
    grammar: 'Preposition',
    grammarAr: 'Preposition',
    tip: '“from university”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الجامعة': {
    en: 'university / college',
    grammar: 'Institutional noun',
    grammarAr: 'Institutional noun',
    tip: 'Often used without “the” when referring to studying (“from university”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'لديهم': {
    en: 'They have',
    grammar: 'Preposition + plural pronoun suffix (ـهم)',
    grammarAr: 'ـهم',
    tip: 'Turn the possessor into the subject: “They have”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'خطة': {
    en: 'a plan',
    grammar: 'Singular countable noun',
    grammarAr: 'Singular countable noun',
    tip: 'Comes at the end of the adjective cluster (“a very clever plan”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'ذكية': {
    en: 'clever / smart',
    grammar: 'Adjective',
    grammarAr: 'Adjective',
    tip: 'Placed before “plan” (“a very clever plan”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'العمل': {
    en: 'work',
    grammar: 'Institutional noun',
    grammarAr: 'Institutional noun',
    tip: 'Use “at work” (never “in the work”) for being at your workplace.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'وسأتصل': {
    en: 'and I will call',
    grammar: 'Conjunction (و) + future prefix (سـ) + verb',
    grammarAr: 'و',
    tip: 'Unpacks into 4 English words: “and I will call”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'بك': {
    en: 'you',
    grammar: 'Preposition (بـ) + pronoun (ـك)',
    grammarAr: 'بـ',
    tip: 'English “call” is transitive — no preposition needed (“call you”, not “call with you”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'لاحقا': {
    en: 'later',
    grammar: 'Time adverb',
    grammarAr: 'Time adverb',
    tip: 'Placed at the end (“call you later”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'لدينا': {
    en: 'We have',
    grammar: 'Possession structure (ـنا = we)',
    grammarAr: 'ـنا = we',
    tip: 'Translates to active subject + verb: “We have”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'اجتماع': {
    en: 'a meeting',
    grammar: 'Singular countable noun',
    grammarAr: 'Singular countable noun',
    tip: '“an important meeting”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الاثنين': {
    en: 'Monday',
    grammar: 'Day of the week',
    grammarAr: 'Day of the week',
    tip: 'Days of the week always take “on” and a capital letter (“on Monday”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'يستيقظ': {
    en: 'wakes up / gets up',
    grammar: 'Present verb (3rd-person singular)',
    grammarAr: '3rd-person singular',
    tip: 'Phrasal verb with “-s” for “He” (“He wakes up”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'مبكرا': {
    en: 'early',
    grammar: 'Adverb',
    grammarAr: 'Adverb',
    tip: 'Placed after “wakes up” (“wakes up early”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الصباح': {
    en: 'the morning',
    grammar: 'Time period noun',
    grammarAr: 'Time period noun',
    tip: 'Parts of the day take “in the” (“in the morning”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },

  // Phase 2 Flow & Nuance
  'لقد': {
    en: 'have / has (indeed)',
    grammar: 'Confirmative particle (حرف تحقيق)',
    grammarAr: 'حرف تحقيق',
    tip: 'Signals Present Perfect (“have + past participle”) when no closed past time is named.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'أرسلت': {
    en: 'I sent / have sent',
    grammar: 'Past verb + subject suffix (ـتُ)',
    grammarAr: 'ـتُ',
    tip: 'With “لقد”, translate as “I have sent”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'التقرير': {
    en: 'the report',
    grammar: 'Definite noun',
    grammarAr: 'Definite noun',
    tip: 'Direct object placed after the verb.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'بالفعل': {
    en: 'already',
    grammar: 'Adverb',
    grammarAr: 'Adverb',
    tip: 'Often placed between “have” and the past participle (“have already sent”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'أدرس': {
    en: 'I study / have been studying',
    grammar: 'Present verb',
    grammarAr: 'Present verb',
    tip: 'When paired with “منذ” (duration), shift to “I have been studying”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'اللغة': {
    en: 'the language (omitted before German)',
    grammar: 'Definite noun',
    grammarAr: 'Definite noun',
    tip: 'In English, just say “German” instead of “the German language”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الألمانية': {
    en: 'German',
    grammar: 'Proper language noun',
    grammarAr: 'Proper language noun',
    tip: 'Capitalize language names in English without “the”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'منذ': {
    en: 'for / since',
    grammar: 'Duration preposition',
    grammarAr: 'Duration preposition',
    tip: 'Use “for” with a counted span (“for two months”) and “since” with a starting point.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'شهرين': {
    en: 'two months',
    grammar: 'Dual noun (مثنى)',
    grammarAr: 'مثنى',
    tip: 'English uses the number “two” + plural noun “months”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'فقدت': {
    en: 'I have lost',
    grammar: 'Past verb + 1st-person suffix',
    grammarAr: 'Past verb + 1st-person suffix',
    tip: 'Because the keys are still missing now, use Present Perfect: “I have lost”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'مفاتيحي': {
    en: 'my keys',
    grammar: 'Plural noun + possessive suffix (ـي)',
    grammarAr: 'ـي',
    tip: 'Possessive “my” comes before “keys”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'وما': {
    en: 'and still',
    grammar: 'Contextual clue',
    grammarAr: 'Contextual clue',
    tip: 'Shows the result is still active in the present.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'زلت': {
    en: 'I am still',
    grammar: 'Aspectual verb',
    grammarAr: 'Aspectual verb',
    tip: 'Confirms present relevance for Present Perfect.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'أبحث': {
    en: 'looking / searching',
    grammar: 'Present verb',
    grammarAr: 'Present verb',
    tip: 'Collocates with “for” (“looking for them”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'عنها': {
    en: 'for them',
    grammar: 'Preposition + pronoun',
    grammarAr: 'Preposition + pronoun',
    tip: '“Keys” is plural in English, so it takes “them”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'ولا': {
    en: 'and cannot',
    grammar: 'Negative conjunction',
    grammarAr: 'Negative conjunction',
    tip: 'Shows present consequence.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الدخول': {
    en: 'enter / get in',
    grammar: 'Verbal noun',
    grammarAr: 'Verbal noun',
    tip: 'Present result of losing the keys.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'اشتريت': {
    en: 'I bought',
    grammar: 'Past verb + subject suffix (ـتُ)',
    grammarAr: 'ـتُ',
    tip: 'Because “أمس” (yesterday) is present, use Past Simple “I bought” (never “have bought”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'هذه': {
    en: 'this',
    grammar: 'Demonstrative pronoun/determiner',
    grammarAr: 'Demonstrative pronoun/determiner',
    tip: 'Singular demonstrative (“this watch / this information”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الساعة': {
    en: 'watch',
    grammar: 'Singular noun',
    grammarAr: 'Singular noun',
    tip: 'Drop “الـ” after “this” → “this watch”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'أمس': {
    en: 'yesterday',
    grammar: 'Past time adverb',
    grammarAr: 'Past time adverb',
    tip: 'Locks the action in a closed past timeframe — requires Past Simple!',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'سبق': {
    en: 'ever (previously)',
    grammar: 'Experiential verb',
    grammarAr: 'Experiential verb',
    tip: '“هل سبق لك أن...” maps to the English life-experience formula “Have you ever + V3?”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'لك': {
    en: 'you (for you)',
    grammar: 'Preposition + pronoun',
    grammarAr: 'Preposition + pronoun',
    tip: 'Becomes the subject “you” in “Have you ever…?”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'زرت': {
    en: 'visited',
    grammar: 'Past participle (التصريف الثالث)',
    grammarAr: 'التصريف الثالث',
    tip: 'After “Have you ever”, use the past participle “visited”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'اليابان': {
    en: 'Japan',
    grammar: 'Proper country noun',
    grammarAr: 'Proper country noun',
    tip: 'No “the” before Japan.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'هي': {
    en: 'is',
    grammar: 'Pronoun of separation (ضمير الفصل)',
    grammarAr: 'ضمير الفصل',
    tip: 'Acts as the verb bridge “is” in English.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'التجربة': {
    en: 'the experiment',
    grammar: 'Definite noun',
    grammarAr: 'Definite noun',
    tip: 'Antecedent noun for the relative clause.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'التي': {
    en: 'that / which',
    grammar: 'Relative pronoun (اسم موصول)',
    grammarAr: 'اسم موصول',
    tip: 'Replaces the object completely — do not repeat “it” later!',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'شرحها': {
    en: 'explained (lit. explained-it)',
    grammar: 'Verb + returning pronoun (ـها)',
    grammarAr: 'ـها',
    tip: 'Drop the Arabic shadow pronoun “ـها” in English: just “explained”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الأستاذ': {
    en: 'the professor',
    grammar: 'Subject of relative clause',
    grammarAr: 'Subject of relative clause',
    tip: 'In English relative clauses, put the subject BEFORE the verb (“the professor explained”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الكتاب': {
    en: 'The book',
    grammar: 'Definite head noun',
    grammarAr: 'Definite head noun',
    tip: 'Followed directly by the relative clause “(that) I borrowed”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الذي': {
    en: 'that / which / whom (or omitted)',
    grammar: 'Relative pronoun (اسم موصول)',
    grammarAr: 'اسم موصول',
    tip: 'Can be omitted when followed by a subject + verb (“The book I borrowed”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'استعرته': {
    en: 'I borrowed (drop ـه!)',
    grammar: 'Past verb + subject + ghost pronoun (ـه)',
    grammarAr: 'ـه',
    tip: 'Never translate “ـه” as “it”! Say “The book I borrowed”, not “borrowed it”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'مفيد': {
    en: 'useful',
    grammar: 'Predicate adjective',
    grammarAr: 'Predicate adjective',
    tip: 'Requires the linking verb “is” before “very useful”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'المهندس': {
    en: 'the engineer',
    grammar: 'Definite noun',
    grammarAr: 'Definite noun',
    tip: 'Head noun of the relative clause.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'تحدثت': {
    en: 'I spoke',
    grammar: 'Past verb + 1st-person suffix',
    grammarAr: 'Past verb + 1st-person suffix',
    tip: '“I spoke with”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'معه': {
    en: 'with (drop ـه!)',
    grammar: 'Preposition + ghost pronoun (ـه)',
    grammarAr: 'ـه',
    tip: 'Keep the preposition “with”, but delete the returning pronoun “him”!',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'زرناه': {
    en: 'we visited (drop ـه!)',
    grammar: 'Past verb + “we” + ghost pronoun (ـه)',
    grammarAr: 'ـه',
    tip: 'Drop the returning pronoun “ـه” — say “The place we visited”, never “visited it”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'كان': {
    en: 'was / had',
    grammar: 'Past copula verb',
    grammarAr: 'Past copula verb',
    tip: '“was” with adjectives (“was amazing / was tired”), or “had” with possession (“كان لدي”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'مذهلا': {
    en: 'amazing',
    grammar: 'Adjective',
    grammarAr: 'Adjective',
    tip: 'Follows “was” (“was amazing”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'لو': {
    en: 'If (unreal condition)',
    grammar: 'Hypothetical conditional particle',
    grammarAr: 'Hypothetical conditional particle',
    tip: 'Triggers Second Conditional: “If + past simple, … would + base verb”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'كنت': {
    en: 'I were / I was',
    grammar: 'Past copula in conditional',
    grammarAr: 'Past copula in conditional',
    tip: 'In hypothetical advice, English prefers the subjunctive “If I were you”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'مكانك': {
    en: 'you (lit. in your place)',
    grammar: 'Idiomatic conditional phrase',
    grammarAr: 'Idiomatic conditional phrase',
    tip: '“لو كنت مكانك” is idiomatically “If I were you” in English.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'لقبلت': {
    en: 'I would accept',
    grammar: 'Result prefix (لـ) + verb + subject',
    grammarAr: 'لـ',
    tip: 'The Arabic “لـ” maps to “I would + base verb” (“I would accept”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'ذلك': {
    en: 'that',
    grammar: 'Distant demonstrative',
    grammarAr: 'Distant demonstrative',
    tip: '“that offer”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'العرض': {
    en: 'offer',
    grammar: 'Singular noun',
    grammarAr: 'Singular noun',
    tip: 'Drops “الـ” after “that” (“that offer”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'المزيد': {
    en: 'more',
    grammar: 'Comparative quantifier',
    grammarAr: 'Comparative quantifier',
    tip: '“المزيد من الوقت” → “more time”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الوقت': {
    en: 'time',
    grammar: 'Uncountable noun',
    grammarAr: 'Uncountable noun',
    tip: '“more time”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'لسافرت': {
    en: 'I would travel',
    grammar: 'Result prefix (لـ) + verb + subject',
    grammarAr: 'لـ',
    tip: 'The Arabic “لـ” maps to the modal “would” in English.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'إضافي': {
    en: 'extra / additional',
    grammar: 'Adjective',
    grammarAr: 'Adjective',
    tip: 'Placed before the noun: “extra time”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'برلين': {
    en: 'Berlin',
    grammar: 'Proper noun (City)',
    grammarAr: 'City',
    tip: 'Capitalized, no article.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'أكثر': {
    en: 'more',
    grammar: 'Adverb',
    grammarAr: 'Adverb',
    tip: 'Placed after the verb (“travel more”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'أذا': {
    en: 'If (real condition)',
    grammar: 'Real conditional particle (إذا)',
    grammarAr: 'إذا',
    tip: 'Takes Present Simple in the “if” clause and “will” in the result clause.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'أمطرت': {
    en: 'it rains',
    grammar: 'Conditional verb',
    grammarAr: 'Conditional verb',
    tip: 'English needs the weather dummy subject “it” + Present Simple “rains” after “If”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'سنلغي': {
    en: 'we will cancel',
    grammar: 'Future prefix (سـ) + 1st-person plural verb',
    grammarAr: 'سـ',
    tip: 'Unpacks into “we will cancel”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الرحلة': {
    en: 'the trip',
    grammar: 'Definite noun',
    grammarAr: 'Definite noun',
    tip: 'Direct object of “cancel”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'على': {
    en: 'on / although (in على الرغم من)',
    grammar: 'Preposition / Conjunction part',
    grammarAr: 'Preposition / Conjunction part',
    tip: 'With “الرغم من أنه”, translates to “Although”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الرغم': {
    en: 'Although / Even though',
    grammar: 'Concessive marker',
    grammarAr: 'Concessive marker',
    tip: 'Never put “but” in the second clause when you start with “Although”!',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'أنه': {
    en: 'he (that he)',
    grammar: 'Particle + pronoun suffix',
    grammarAr: 'Particle + pronoun suffix',
    tip: 'Becomes the subject “he” after “Although” or “that he” in reported speech.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'متعبا': {
    en: 'tired',
    grammar: 'Adjective',
    grammarAr: 'Adjective',
    tip: 'Follows “was” (“Although he was tired”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'ألا': {
    en: '(omit “but” after Although!)',
    grammar: 'Arabic correlative linker (إلا أنه)',
    grammarAr: 'إلا أنه',
    tip: 'Arabic says “على الرغم... إلا أنه”, but English strictly forbids “Although… but”!',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'أنهى': {
    en: 'finished',
    grammar: 'Past simple verb',
    grammarAr: 'Past simple verb',
    tip: '“he finished the report”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'لأنه': {
    en: 'Because he',
    grammar: 'Causal conjunction (لأن) + pronoun (ـه)',
    grammarAr: 'لأن',
    tip: 'Never put “so” in the second clause when you start with “Because”!',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'مريضا': {
    en: 'sick / ill',
    grammar: 'Adjective',
    grammarAr: 'Adjective',
    tip: '“Because he was sick”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'لم': {
    en: 'did not / could not',
    grammar: 'Past negation particle',
    grammarAr: 'Past negation particle',
    tip: 'Negates the past verb that follows.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'يتمكن': {
    en: 'could (was able to)',
    grammar: 'Verb of ability',
    grammarAr: 'Verb of ability',
    tip: '“لم يتمكن من” translates cleanly to “could not + base verb”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'حضور': {
    en: 'attend',
    grammar: 'Verbal noun',
    grammarAr: 'Verbal noun',
    tip: 'After “could not”, use the base verb “attend”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الحفل': {
    en: 'the party / ceremony',
    grammar: 'Definite noun',
    grammarAr: 'Definite noun',
    tip: 'Direct object of “attend” (no preposition needed).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'فاتني': {
    en: 'I missed',
    grammar: 'Past verb + object suffix (ـني)',
    grammarAr: 'ـني',
    tip: 'Literal: “passed me”. In English, the person is the subject: “I missed the train”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'القطار': {
    en: 'the train',
    grammar: 'Definite noun',
    grammarAr: 'Definite noun',
    tip: 'Direct object of “missed”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'ولذلك': {
    en: 'so',
    grammar: 'Result conjunction',
    grammarAr: 'Result conjunction',
    tip: 'Connects cause and effect when “Because” was not used at the start.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'وصلت': {
    en: 'I arrived',
    grammar: 'Past verb + 1st-person suffix',
    grammarAr: 'Past verb + 1st-person suffix',
    tip: '“so I arrived late”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'متأخرا': {
    en: 'late',
    grammar: 'Adverb',
    grammarAr: 'Adverb',
    tip: '“arrived late”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'رجاء': {
    en: 'Please',
    grammar: 'Politeness marker',
    grammarAr: 'Politeness marker',
    tip: 'Placed at the start of an imperative request.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'أطفئ': {
    en: 'turn off / switch off',
    grammar: 'Imperative phrasal verb',
    grammarAr: 'Imperative phrasal verb',
    tip: 'Use the phrasal verb “turn off” for lights/devices — never say “close the lights”!',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الأنوار': {
    en: 'the lights',
    grammar: 'Definite plural noun',
    grammarAr: 'Definite plural noun',
    tip: '“turn off the lights”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'قبل': {
    en: 'before',
    grammar: 'Time conjunction',
    grammarAr: 'Time conjunction',
    tip: 'Followed by subject + present verb (“before you leave”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'تغادر': {
    en: 'you leave',
    grammar: 'Present verb',
    grammarAr: 'Present verb',
    tip: '“before you leave” (drop Arabic “أن”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'نفد': {
    en: 'ran out of',
    grammar: 'Depletion verb',
    grammarAr: 'Depletion verb',
    tip: 'English flips the subject to the people: “We ran out of gas”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'منا': {
    en: 'We (from us)',
    grammar: 'Preposition + pronoun',
    grammarAr: 'Preposition + pronoun',
    tip: 'Becomes the subject “We” in “We ran out of gas”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'البنزين': {
    en: 'gas / petrol',
    grammar: 'Uncountable noun',
    grammarAr: 'Uncountable noun',
    tip: 'Object of “ran out of” (no “the”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'منتصف': {
    en: 'the middle of',
    grammar: 'Spatial noun',
    grammarAr: 'Spatial noun',
    tip: '“in the middle of the road”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الطريق': {
    en: 'the road',
    grammar: 'Definite noun',
    grammarAr: 'Definite noun',
    tip: '“in the middle of the road”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'تستسلم': {
    en: 'give up',
    grammar: 'Phrasal verb',
    grammarAr: 'Phrasal verb',
    tip: 'Natural English uses the phrasal verb “give up” for “تستسلم”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'أبدا': {
    en: 'Never / ever',
    grammar: 'Emphatic negative adverb',
    grammarAr: 'Emphatic negative adverb',
    tip: '“لا تستسلم أبداً” starts with “Never give up”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'مهما': {
    en: 'no matter / whatever',
    grammar: 'Concessive expression',
    grammarAr: 'Concessive expression',
    tip: '“no matter the difficulties”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'كانت': {
    en: '(were / are — omitted in “no matter the…”)',
    grammar: 'Copula verb',
    grammarAr: 'Copula verb',
    tip: '“no matter the difficulties” is concise and natural.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الصعوبات': {
    en: 'the difficulties',
    grammar: 'Definite plural noun',
    grammarAr: 'Definite plural noun',
    tip: '“no matter the difficulties”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'أعطاني': {
    en: 'gave me',
    grammar: 'Past verb + indirect object suffix (ـني)',
    grammarAr: 'ـني',
    tip: 'Placed AFTER the subject (“The manager gave me…”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'المدير': {
    en: 'The manager',
    grammar: 'Definite subject noun',
    grammarAr: 'Definite subject noun',
    tip: 'In English SVO order, put “The manager” at the start before “gave me”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'بعض': {
    en: 'some',
    grammar: 'Quantifier',
    grammarAr: 'Quantifier',
    tip: 'Pairs with uncountable nouns like “some useful advice”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'النصائح': {
    en: 'advice (uncountable!)',
    grammar: 'Uncountable mass noun in English',
    grammarAr: 'Uncountable mass noun in English',
    tip: 'Trap alert: “نصائح” is plural in Arabic, but “advice” NEVER takes “-s” in English!',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'المفيدة': {
    en: 'useful',
    grammar: 'Adjective',
    grammarAr: 'Adjective',
    tip: 'Placed before “advice” (“some useful advice”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'المعلومات': {
    en: 'information (singular uncountable!)',
    grammar: 'Uncountable mass noun in English',
    grammarAr: 'Uncountable mass noun in English',
    tip: 'Takes singular “This” and singular “is” (“This information is…”, never “are”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'سرية': {
    en: 'confidential',
    grammar: 'Predicate adjective',
    grammarAr: 'Predicate adjective',
    tip: 'Needs the singular linking verb “is” (“is strictly confidential”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'للغاية': {
    en: 'strictly / very / highly',
    grammar: 'Adverb of degree',
    grammarAr: 'Adverb of degree',
    tip: 'Collocates as “strictly confidential”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'اشترينا': {
    en: 'We bought',
    grammar: 'Past verb + 1st-person plural suffix (ـنا)',
    grammarAr: 'ـنا',
    tip: 'Includes subject “We” and past verb “bought”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'أثاثا': {
    en: 'furniture (uncountable!)',
    grammar: 'Uncountable mass noun',
    grammarAr: 'Uncountable mass noun',
    tip: 'Never say “a furniture” or “furnitures” — just “new furniture”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'جديدا': {
    en: 'new',
    grammar: 'Adjective',
    grammarAr: 'Adjective',
    tip: 'Placed before “furniture” (“new furniture”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'لغرفة': {
    en: 'for the … room',
    grammar: 'Preposition (لـ) + noun',
    grammarAr: 'لـ',
    tip: '“for the living room”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'المعيشة': {
    en: 'living (living room)',
    grammar: 'Noun adjunct',
    grammarAr: 'Noun adjunct',
    tip: 'Placed before “room” (“the living room”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'أتطلع': {
    en: 'look forward',
    grammar: 'Phrasal verb',
    grammarAr: 'Phrasal verb',
    tip: 'In “look forward to”, “to” is a preposition — the next verb MUST end in “-ing”!',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'بشوق': {
    en: '(built into “look forward to”)',
    grammar: 'Adverbial intensifier',
    grammarAr: 'Adverbial intensifier',
    tip: '“look forward to” already carries the meaning of eager anticipation.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'لقائك': {
    en: 'meeting you',
    grammar: 'Gerund (-ing) + object pronoun',
    grammarAr: '-ing',
    tip: 'Because “to” in “look forward to” is a preposition, use “meeting you” (not “meet”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'قريبا': {
    en: 'soon',
    grammar: 'Time adverb',
    grammarAr: 'Time adverb',
    tip: 'Placed at the end of the clause.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'مهتم': {
    en: 'interested',
    grammar: 'Adjective',
    grammarAr: 'Adjective',
    tip: 'Collocates with “in” (“is interested in”) followed by an “-ing” verb.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'بتعلم': {
    en: 'in learning',
    grammar: 'Preposition + gerund (-ing)',
    grammarAr: '-ing',
    tip: 'Any verb right after a preposition (“in”) must take “-ing” (“in learning”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'لغات': {
    en: 'languages',
    grammar: 'Plural countable noun',
    grammarAr: 'Plural countable noun',
    tip: 'Preceded by its adjective (“new languages”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'شكرا': {
    en: 'Thank you / Thanks',
    grammar: 'Expression of gratitude',
    grammarAr: 'Expression of gratitude',
    tip: 'Followed by the preposition “for” + “-ing” verb.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'لمساعدتي': {
    en: 'for helping me',
    grammar: 'Preposition + gerund + object pronoun',
    grammarAr: 'Preposition + gerund + object pronoun',
    tip: 'Use “for helping me” (never “for help me”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'المشكلة': {
    en: 'problem',
    grammar: 'Singular noun',
    grammarAr: 'Singular noun',
    tip: '“with this problem”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'كسرت': {
    en: 'was broken',
    grammar: 'Past passive verb (كُسِرَت)',
    grammarAr: 'كُسِرَت',
    tip: 'English builds the passive with “was/were + past participle” (“was broken”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'النافذة': {
    en: 'The window',
    grammar: 'Definite subject noun',
    grammarAr: 'Definite subject noun',
    tip: 'Comes FIRST before “was broken” in English.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'أثناء': {
    en: 'during',
    grammar: 'Preposition',
    grammarAr: 'Preposition',
    tip: '“during the storm”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'العاصفة': {
    en: 'the storm',
    grammar: 'Definite noun',
    grammarAr: 'Definite noun',
    tip: '“during the storm”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الليلة': {
    en: 'night (last night)',
    grammar: 'Time noun',
    grammarAr: 'Time noun',
    tip: 'No “the” in “last night”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الماضية': {
    en: 'last',
    grammar: 'Adjective',
    grammarAr: 'Adjective',
    tip: 'Placed before “night” without “the” (“last night”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'يتم': {
    en: 'is being (continuous passive)',
    grammar: 'Passive helper verb',
    grammarAr: 'Passive helper verb',
    tip: '“يتم بناء” right now maps to Present Continuous Passive: “is being built”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'بناء': {
    en: 'built',
    grammar: 'Past participle in passive',
    grammarAr: 'Past participle in passive',
    tip: '“is being built”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الجسر': {
    en: 'bridge',
    grammar: 'Singular noun',
    grammarAr: 'Singular noun',
    tip: '“This bridge” comes first as the subject.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الحالي': {
    en: 'right now / currently',
    grammar: 'Time phrase (في الوقت الحالي)',
    grammarAr: 'في الوقت الحالي',
    tip: 'Signals an action in progress right now (“is being built right now”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الرسالة': {
    en: 'The message',
    grammar: 'Definite subject noun',
    grammarAr: 'Definite subject noun',
    tip: 'Comes before the passive verb “was sent”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'عن': {
    en: 'by (in عن طريق الخطأ) / about',
    grammar: 'Preposition',
    grammarAr: 'Preposition',
    tip: '“عن طريق الخطأ” is the fixed English idiom “by mistake”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'طريق': {
    en: 'way (by mistake)',
    grammar: 'Idiom component',
    grammarAr: 'Idiom component',
    tip: 'Part of “عن طريق الخطأ” → “by mistake”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الخطأ': {
    en: 'mistake (by mistake)',
    grammar: 'Idiom noun',
    grammarAr: 'Idiom noun',
    tip: 'Say “by mistake” (no “the”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },

  // Phase 3 Mastery & Register
  'فحصت': {
    en: 'were tested',
    grammar: 'Passive past verb (فُحِصَت)',
    grammarAr: 'فُحِصَت',
    tip: 'English builds passive with “was/were + past participle”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'عينات': {
    en: 'samples',
    grammar: 'Plural noun (جمع مؤنث سالم)',
    grammarAr: 'جمع مؤنث سالم',
    tip: 'Plural subject → takes plural passive helper “were”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'المياه': {
    en: 'water',
    grammar: 'Noun adjunct (مضاف إليه)',
    grammarAr: 'مضاف إليه',
    tip: 'Acts as a modifier before “samples” → “The water samples”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'المختبر': {
    en: 'the laboratory (the lab)',
    grammar: 'Definite place noun',
    grammarAr: 'Definite place noun',
    tip: '“in the laboratory”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'قالت': {
    en: 'said',
    grammar: 'Past reporting verb',
    grammarAr: 'Past reporting verb',
    tip: 'Triggers tense backshift in the clause that follows.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الباحثة': {
    en: 'The researcher',
    grammar: 'Subject noun',
    grammarAr: 'Subject noun',
    tip: 'Placed before the verb “said” in English SVO order.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'أنها': {
    en: 'that she / she',
    grammar: 'Particle (إنّ/أنّ) + pronoun (ـها)',
    grammarAr: 'إنّ/أنّ',
    tip: 'Introduces the reported clause (“that she…”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'ستنشر': {
    en: 'would publish (lit. will publish)',
    grammar: 'Future prefix (سـ) + verb',
    grammarAr: 'سـ',
    tip: 'Backshifts from “will” to “would” after past reporting verb “said”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'النتائج': {
    en: 'the results',
    grammar: 'Definite plural noun',
    grammarAr: 'Definite plural noun',
    tip: 'Direct object or plural subject.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'يوفر': {
    en: 'save / saves',
    grammar: 'Present verb',
    grammarAr: 'Present verb',
    tip: 'With fronted “Not only”, use “does … save”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'النظام': {
    en: 'system',
    grammar: 'Singular noun',
    grammarAr: 'Singular noun',
    tip: 'Drops “الـ” when preceded by “this” in English (“this system”, never “this the system”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الطاقة': {
    en: 'energy',
    grammar: 'Uncountable noun',
    grammarAr: 'Uncountable noun',
    tip: 'General uncountable noun — drops “the” in English.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'فحسب': {
    en: 'only (Not only…)',
    grammar: 'Restrictive particle',
    grammarAr: 'Restrictive particle',
    tip: 'Pairs with “لا” to form fronted “Not only does…”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'بل': {
    en: 'but',
    grammar: 'Correlative conjunction',
    grammarAr: 'Correlative conjunction',
    tip: 'Introduces the second half: “but it also…”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'يقلل': {
    en: 'reduces',
    grammar: 'Present verb (3rd-person singular)',
    grammarAr: '3rd-person singular',
    tip: 'Agrees with “it” → “reduces”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'التلوث': {
    en: 'pollution',
    grammar: 'Uncountable noun',
    grammarAr: 'Uncountable noun',
    tip: 'Drops “the” when speaking about pollution in general.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'أيضا': {
    en: 'also / too',
    grammar: 'Additive adverb',
    grammarAr: 'Additive adverb',
    tip: 'Placed before the main verb (“also reduces”) or at the very end (“too”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'نادرا': {
    en: 'Seldom / Rarely',
    grammar: 'Fronted negative adverb',
    grammarAr: 'Fronted negative adverb',
    tip: 'Triggers question-style inversion: “Seldom do we see…” (not “Seldom we see”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'ما': {
    en: 'What (cleft) / particle',
    grammar: 'Relative or adverbial particle',
    grammarAr: 'Relative or adverbial particle',
    tip: 'At the start of a cleft sentence (“ما يقلقني”), translates to “What…”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'نرى': {
    en: 'do we see',
    grammar: 'Inverted verb after Seldom',
    grammarAr: 'Inverted verb after Seldom',
    tip: 'Because “Seldom” is at the front, invert helper + subject: “do we see”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'مثل': {
    en: 'such',
    grammar: 'Predeterminer',
    grammarAr: 'Predeterminer',
    tip: '“such extraordinary dedication” / “such a sudden development”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الالتزام': {
    en: 'dedication / commitment',
    grammar: 'Uncountable abstract noun',
    grammarAr: 'Uncountable abstract noun',
    tip: 'Preceded by “such extraordinary” (“such extraordinary dedication”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الرائع': {
    en: 'extraordinary / remarkable',
    grammar: 'Adjective',
    grammarAr: 'Adjective',
    tip: 'Placed before “dedication”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'أكن': {
    en: 'did I (in لم أكن أعلم قط)',
    grammar: 'Inverted past auxiliary',
    grammarAr: 'Inverted past auxiliary',
    tip: '“لم أكن أعلم قط” maps to the C1 inverted idiom “Little did I know”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'أعلم': {
    en: 'know',
    grammar: 'Base verb after did',
    grammarAr: 'Base verb after did',
    tip: '“Little did I know”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'قط': {
    en: 'Little (never at all)',
    grammar: 'Emphatic negative adverb',
    grammarAr: 'Emphatic negative adverb',
    tip: 'Fronted as “Little did I know…”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الحقيقة': {
    en: 'the truth',
    grammar: 'Definite noun',
    grammarAr: 'Definite noun',
    tip: '“that the truth would unfold”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'ستتكشف': {
    en: 'would unfold',
    grammar: 'Future-in-the-past verb',
    grammarAr: 'Future-in-the-past verb',
    tip: 'Backshifts from “will” to “would” after “Little did I know”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'بهذا': {
    en: 'like this',
    grammar: 'Manner phrase (بهذا الشكل)',
    grammarAr: 'بهذا الشكل',
    tip: '“بهذا الشكل” translates naturally to “like this”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الشكل': {
    en: 'way / manner (like this)',
    grammar: 'Noun',
    grammarAr: 'Noun',
    tip: 'Combined in “بهذا الشكل” → “like this”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'ينبغي': {
    en: 'should',
    grammar: 'Modal of obligation',
    grammarAr: 'Modal of obligation',
    tip: 'Inverted before the subject after “Under no circumstances” (“should this policy be…”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'تحت': {
    en: 'Under',
    grammar: 'Preposition',
    grammarAr: 'Preposition',
    tip: 'Opens “Under no circumstances”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'ظرف': {
    en: 'circumstances',
    grammar: 'Plural noun in English idiom',
    grammarAr: 'Plural noun in English idiom',
    tip: '“تحت أي ظرف من الظروف” is the fixed C1 phrase “Under no circumstances”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الظروف': {
    en: 'circumstances',
    grammar: 'Plural noun',
    grammarAr: 'Plural noun',
    tip: ' triggers inversion: “Under no circumstances should…”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'انتهاك': {
    en: 'be violated',
    grammar: 'Passive infinitive',
    grammarAr: 'Passive infinitive',
    tip: '“should this policy be violated”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'السياسة': {
    en: 'policy',
    grammar: 'Singular noun',
    grammarAr: 'Singular noun',
    tip: '“this policy”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'أخبرني': {
    en: 'He told me',
    grammar: 'Past reporting verb + object suffix',
    grammarAr: 'Past reporting verb + object suffix',
    tip: 'Because “told” is past, backshift the next verb (“he was very busy”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'مشغول': {
    en: 'busy',
    grammar: 'Adjective',
    grammarAr: 'Adjective',
    tip: 'Needs the backshifted linking verb “was” (“that he was very busy”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'بمشروع': {
    en: 'with a … project',
    grammar: 'Preposition + noun',
    grammarAr: 'Preposition + noun',
    tip: '“busy” collocates with “with” (“busy with a new project”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'جديد': {
    en: 'new',
    grammar: 'Adjective',
    grammarAr: 'Adjective',
    tip: '“with a new project”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'ستنهي': {
    en: 'would finish',
    grammar: 'Backshifted future verb',
    grammarAr: 'Backshifted future verb',
    tip: 'After “She said”, backshift “will finish” to “would finish”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'المهمة': {
    en: 'the task',
    grammar: 'Definite noun',
    grammarAr: 'Definite noun',
    tip: 'Direct object of “finish”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الموعد': {
    en: 'the deadline / appointment',
    grammar: 'Definite noun',
    grammarAr: 'Definite noun',
    tip: '“الموعد النهائي” = “the deadline”; “موعد الاجتماع” = “the meeting appointment”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'النهائي': {
    en: 'deadline (final)',
    grammar: 'Adjective',
    grammarAr: 'Adjective',
    tip: '“الموعد النهائي” translates to the single compound noun “the deadline”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'أكدوا': {
    en: 'They confirmed',
    grammar: 'Past reporting verb (3rd-person plural)',
    grammarAr: '3rd-person plural',
    tip: 'Triggers Past Perfect backshift (“that they had received”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'أنهم': {
    en: 'that they',
    grammar: 'Conjunction + plural pronoun',
    grammarAr: 'Conjunction + plural pronoun',
    tip: '“that they had received”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'قد': {
    en: 'had / have',
    grammar: 'Perfect aspect particle',
    grammarAr: 'Perfect aspect particle',
    tip: 'After past “confirmed”, shifts to Past Perfect “had received”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'استلموا': {
    en: 'had received',
    grammar: 'Past perfect verb',
    grammarAr: 'Past perfect verb',
    tip: 'Backshifted from “have received” to “had received”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'جميع': {
    en: 'all',
    grammar: 'Universal quantifier',
    grammarAr: 'Universal quantifier',
    tip: '“all the required documents”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'المستندات': {
    en: 'the … documents',
    grammar: 'Definite plural noun',
    grammarAr: 'Definite plural noun',
    tip: 'Preceded by “required” (“all the required documents”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'المطلوبة': {
    en: 'required',
    grammar: 'Participle adjective',
    grammarAr: 'Participle adjective',
    tip: 'Placed before “documents” (“the required documents”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'يجب': {
    en: 'should / must',
    grammar: 'Modal of obligation',
    grammarAr: 'Modal of obligation',
    tip: '“كان يجب أن” = past regret “should have + V3”; “يجب أن” in present = “must”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'تخبرني': {
    en: 'have told me',
    grammar: 'Past modal complement',
    grammarAr: 'Past modal complement',
    tip: 'After “should”, use “have told me” for past regret.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'التغيير': {
    en: 'the change',
    grammar: 'Definite noun',
    grammarAr: 'Definite noun',
    tip: '“about the change”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'سابق': {
    en: 'earlier',
    grammar: 'Comparative time adverb (في وقت سابق)',
    grammarAr: 'في وقت سابق',
    tip: '“في وقت سابق” condenses into the single adverb “earlier”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'بد': {
    en: 'must (in لا بد أنه)',
    grammar: 'Modal of strong deduction',
    grammarAr: 'Modal of strong deduction',
    tip: '“لا بد أنه قد...” in the past uses “must have + past participle”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'نسي': {
    en: 'have forgotten',
    grammar: 'Past participle after must have',
    grammarAr: 'Past participle after must have',
    tip: '“He must have forgotten”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'موعد': {
    en: 'appointment',
    grammar: 'Noun',
    grammarAr: 'Noun',
    tip: '“the meeting appointment”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الاجتماع': {
    en: 'the meeting',
    grammar: 'Definite noun',
    grammarAr: 'Definite noun',
    tip: 'Acts as a modifier in “the meeting appointment” or object in “attend the meeting”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'يكن': {
    en: 'could (in لم يكن بإمكانه)',
    grammar: 'Past modal auxiliary',
    grammarAr: 'Past modal auxiliary',
    tip: '“لم يكن بإمكانه” + past event = “He could not have + V3”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'بأمكانه': {
    en: 'could (capable of)',
    grammar: 'Capability noun + suffix',
    grammarAr: 'Capability noun + suffix',
    tip: '“He could not have anticipated”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'توقع': {
    en: 'anticipated / foreseen',
    grammar: 'Past participle',
    grammarAr: 'Past participle',
    tip: '“could not have anticipated”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'التطور': {
    en: 'development',
    grammar: 'Singular noun',
    grammarAr: 'Singular noun',
    tip: '“such a sudden development”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'المفاجئ': {
    en: 'sudden',
    grammar: 'Adjective',
    grammarAr: 'Adjective',
    tip: 'Placed before “development” (“such a sudden development”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'يقلقني': {
    en: 'worries me',
    grammar: 'Present verb + object suffix',
    grammarAr: 'Present verb + object suffix',
    tip: 'In the wh-cleft “What truly worries me is…”, takes singular “is”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'حقا': {
    en: 'truly / really',
    grammar: 'Adverb',
    grammarAr: 'Adverb',
    tip: 'Placed before the verb (“What truly worries me”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الافتقار': {
    en: 'the lack',
    grammar: 'Definite abstract noun',
    grammarAr: 'Definite abstract noun',
    tip: 'Collocates with “of” (“the lack of transparency”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الشفافية': {
    en: 'transparency',
    grammar: 'Uncountable abstract noun',
    grammarAr: 'Uncountable abstract noun',
    tip: '“the lack of transparency” (no “the” before transparency).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'شغفه': {
    en: 'his … passion',
    grammar: 'Noun + possessive suffix (ـه)',
    grammarAr: 'ـه',
    tip: 'Spotlighted in an It-cleft: “It was his continuous passion that…”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'المستمر': {
    en: 'continuous',
    grammar: 'Adjective',
    grammarAr: 'Adjective',
    tip: 'Placed between “his” and “passion” (“his continuous passion”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'أثار': {
    en: 'impressed (aroused admiration)',
    grammar: 'Past verb',
    grammarAr: 'Past verb',
    tip: '“أثار إعجابي به” condenses into “impressed me”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'أعجابي': {
    en: 'impressed me',
    grammar: 'Idiom component',
    grammarAr: 'Idiom component',
    tip: 'Part of “أثار إعجابي” → “impressed me”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'به': {
    en: '(included in “impressed me”)',
    grammar: 'Preposition + pronoun',
    grammarAr: 'Preposition + pronoun',
    tip: 'Omitted in English because “his passion” is already the subject of “impressed”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'كل': {
    en: 'All',
    grammar: 'Quantifier (cleft opener)',
    grammarAr: 'cleft opener',
    tip: '“All we need now is…”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'نحتاجه': {
    en: 'we need (drop ـه!)',
    grammar: 'Present verb + ghost pronoun',
    grammarAr: 'Present verb + ghost pronoun',
    tip: 'Say “All we need now”, without repeating “it”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'قرار': {
    en: 'a … decision',
    grammar: 'Singular countable noun',
    grammarAr: 'Singular countable noun',
    tip: '“a decisive decision”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'حاسم': {
    en: 'decisive',
    grammar: 'Adjective',
    grammarAr: 'Adjective',
    tip: 'Placed before “decision” (“a decisive decision”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'أقترح': {
    en: 'I suggest',
    grammar: 'Mandative verb',
    grammarAr: 'Mandative verb',
    tip: 'Triggers the formal subjunctive: the next verb stays in base form (“that he attend”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'يحضر': {
    en: 'attend (base subjunctive!)',
    grammar: 'Subjunctive verb',
    grammarAr: 'Subjunctive verb',
    tip: 'Do NOT add “-s” after “I suggest that he…” → “that he attend”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'شخصيا': {
    en: 'in person',
    grammar: 'Adverbial phrase',
    grammarAr: 'Adverbial phrase',
    tip: '“شخصياً” at a meeting translates to “in person”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الضروري': {
    en: 'It is essential',
    grammar: 'Mandative adjective (من الضروري)',
    grammarAr: 'من الضروري',
    tip: 'Triggers the bare subjunctive “be” (“It is essential that the reports be accurate”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'تكون': {
    en: 'be (subjunctive!)',
    grammar: 'Subjunctive copula',
    grammarAr: 'Subjunctive copula',
    tip: 'After “It is essential that…”, use bare “be” instead of “are”!',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'التقارير': {
    en: 'the reports',
    grammar: 'Definite plural noun',
    grammarAr: 'Definite plural noun',
    tip: '“that the reports be accurate”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'دقيقة': {
    en: 'accurate',
    grammar: 'Adjective',
    grammarAr: 'Adjective',
    tip: '“be accurate”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'أصرت': {
    en: 'insisted',
    grammar: 'Past mandative verb',
    grammarAr: 'Past mandative verb',
    tip: 'Followed by “that + subject + base verb” (“insisted that the manager resign”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'اللجنة': {
    en: 'The committee',
    grammar: 'Definite subject noun',
    grammarAr: 'Definite subject noun',
    tip: 'Placed before “insisted” (“The committee insisted”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'يستقيل': {
    en: 'resign (base subjunctive!)',
    grammar: 'Subjunctive verb',
    grammarAr: 'Subjunctive verb',
    tip: 'Stay in base form without “-s” or “-ed” after “insisted that”: “that the manager resign”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الفور': {
    en: 'immediately (على الفور)',
    grammar: 'Adverbial idiom',
    grammarAr: 'Adverbial idiom',
    tip: '“على الفور” translates to “immediately”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'علاوة': {
    en: 'Furthermore / Moreover',
    grammar: 'Formal additive discourse marker (علاوة على ذلك)',
    grammarAr: 'علاوة على ذلك',
    tip: 'Replaces whole phrase “علاوة على ذلك” at the start of a formal sentence.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'فأن': {
    en: '(structural linker — omitted in English)',
    grammar: 'Arabic discourse particle (فإنّ)',
    grammarAr: 'فإنّ',
    tip: 'After “Furthermore”, start directly with the English subject (“the preliminary results”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الأولية': {
    en: 'preliminary / initial',
    grammar: 'Adjective',
    grammarAr: 'Adjective',
    tip: 'Scientific hedge: “The preliminary findings appear to support…”. Placed before noun: “the preliminary results”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'غير': {
    en: 'in- / un- (negative prefix)',
    grammar: 'Negation noun',
    grammarAr: 'Negation noun',
    tip: '“غير حاسمة” maps to the single prefixed adjective “inconclusive”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'حاسمة': {
    en: 'conclusive / decisive',
    grammar: 'Adjective',
    grammarAr: 'Adjective',
    tip: 'With “غير”, becomes “inconclusive”; with “إجراءات”, becomes “decisive measures”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'ومع': {
    en: 'Nonetheless / Nevertheless (ومع ذلك)',
    grammar: 'Concessive discourse marker',
    grammarAr: 'Concessive discourse marker',
    tip: '“ومع ذلك” at C1 register translates to “Nonetheless”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'تزال': {
    en: 'remain (لا تزال هناك)',
    grammar: 'Existential persistence verb',
    grammarAr: 'Existential persistence verb',
    tip: '“لا تزال هناك” elevates to “there remain” in formal English.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'هناك': {
    en: 'there',
    grammar: 'Existential dummy subject',
    grammarAr: 'Existential dummy subject',
    tip: '“there remain significant obstacles”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'عقبات': {
    en: 'obstacles',
    grammar: 'Plural countable noun',
    grammarAr: 'Plural countable noun',
    tip: '“significant obstacles”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'رئيسية': {
    en: 'significant / major',
    grammar: 'Adjective',
    grammarAr: 'Adjective',
    tip: 'Placed before “obstacles”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'التغلب': {
    en: 'to overcome',
    grammar: 'Infinitive modifier',
    grammarAr: 'Infinitive modifier',
    tip: '“obstacles to overcome” (do not repeat “them” at the end!).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'عليها': {
    en: '(drop returning pronoun in “to overcome”!)',
    grammar: 'Preposition + returning pronoun',
    grammarAr: 'Preposition + returning pronoun',
    tip: 'Say “obstacles to overcome”, never “obstacles to overcome them”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'وبالتالي': {
    en: 'Consequently / Therefore',
    grammar: 'Formal result discourse marker',
    grammarAr: 'Formal result discourse marker',
    tip: 'High-register replacement for “so”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'يتعين': {
    en: 'must (يتعين علينا)',
    grammar: 'Obligation verb',
    grammarAr: 'Obligation verb',
    tip: '“يتعين علينا” translates to “we must”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'علينا': {
    en: 'we (upon us)',
    grammar: 'Preposition + pronoun',
    grammarAr: 'Preposition + pronoun',
    tip: 'Becomes the active subject “we” in “we must review”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'مراجعة': {
    en: 'review',
    grammar: 'Base verb after must',
    grammarAr: 'Base verb after must',
    tip: '“we must review”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'استراتيجيتنا': {
    en: 'our strategy',
    grammar: 'Noun + possessive suffix (ـنا)',
    grammarAr: 'ـنا',
    tip: '“our strategy”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'بالكامل': {
    en: 'completely / entirely',
    grammar: 'Adverb of degree',
    grammarAr: 'Adverb of degree',
    tip: 'Placed at the end (“review our strategy completely”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الواقع': {
    en: 'Actually / In reality (في الواقع)',
    grammar: 'Discourse marker',
    grammarAr: 'Discourse marker',
    tip: '“في الواقع” is the true meaning of “Actually” (whereas “حالياً” is “currently”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'لست': {
    en: 'I do not / I am not',
    grammar: '1st-person negative verb',
    grammarAr: '1st-person negative verb',
    tip: 'Because “agree” is an action verb in English, say “I do not agree” ( NEVER “I am not agree”)!',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'متفقا': {
    en: 'agree',
    grammar: 'Verb in English (participle in Arabic)',
    grammarAr: 'participle in Arabic',
    tip: 'Arabic uses an adjective (“متفق”), but English uses the verb “agree” with “do not”!',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'تماما': {
    en: 'entirely / completely',
    grammar: 'Adverb',
    grammarAr: 'Adverb',
    tip: 'Placed before “agree” (“do not entirely agree”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'مع': {
    en: 'with',
    grammar: 'Preposition',
    grammarAr: 'Preposition',
    tip: '“agree with this proposal”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'المقترح': {
    en: 'proposal',
    grammar: 'Singular noun',
    grammarAr: 'Singular noun',
    tip: '“this proposal”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'أعيش': {
    en: 'am living / live',
    grammar: '1st-person verb',
    grammarAr: '1st-person verb',
    tip: 'With “حالياً”, use Present Continuous: “I am currently living”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'حاليا': {
    en: 'currently (NOT actually!)',
    grammar: 'Present time adverb',
    grammarAr: 'Present time adverb',
    tip: 'False friend alert: “حالياً” is “currently” — never translate it as “actually”!',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'مدريد': {
    en: 'Madrid',
    grammar: 'Proper city noun',
    grammarAr: 'Proper city noun',
    tip: '“in Madrid”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'أبدى': {
    en: 'was / showed',
    grammar: 'Past verb',
    grammarAr: 'Past verb',
    tip: '“أبدى الفريق تعاطفاً” maps to “The team was very sympathetic”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الفريق': {
    en: 'The team',
    grammar: 'Definite subject noun',
    grammarAr: 'Definite subject noun',
    tip: 'Comes first before “was”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'تعاطفا': {
    en: 'sympathetic (compassionate)',
    grammar: 'Adjective/Noun',
    grammarAr: 'Adjective/Noun',
    tip: '“Sympathetic” means showing compassion (متعاطف), not just “nice/friendly”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'كبيرا': {
    en: 'very / great',
    grammar: 'Intensifier',
    grammarAr: 'Intensifier',
    tip: '“very sympathetic”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'موقفنا': {
    en: 'our situation',
    grammar: 'Noun + possessive suffix (ـنا)',
    grammarAr: 'ـنا',
    tip: '“sympathetic to our situation”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'نتخذ': {
    en: 'we take (collocation!)',
    grammar: 'Collocation verb',
    grammarAr: 'Collocation verb',
    tip: 'In English, you “TAKE measures” (never “make measures” or “do measures”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'أجراءات': {
    en: 'measures / action',
    grammar: 'Plural noun',
    grammarAr: 'Plural noun',
    tip: 'Collocates with “take”: “take decisive measures”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'لمعالجة': {
    en: 'to address',
    grammar: 'Purpose infinitive',
    grammarAr: 'Purpose infinitive',
    tip: 'In high register, use “to address this crisis”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الأزمة': {
    en: 'crisis',
    grammar: 'Singular noun',
    grammarAr: 'Singular noun',
    tip: '“this crisis”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'لعبت': {
    en: 'played',
    grammar: 'Past verb',
    grammarAr: 'Past verb',
    tip: 'Collocates with “role”: “played a pivotal role”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'التكنولوجيا': {
    en: 'Technology',
    grammar: 'Generic uncountable noun',
    grammarAr: 'Generic uncountable noun',
    tip: 'Drops “the” when talking about technology in general.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'دورا': {
    en: 'a … role',
    grammar: 'Singular countable noun',
    grammarAr: 'Singular countable noun',
    tip: '“played a pivotal role”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'محوريا': {
    en: 'pivotal / crucial',
    grammar: 'C1 Adjective',
    grammarAr: 'C1 Adjective',
    tip: 'Placed before “role” (“a pivotal role”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'التحول': {
    en: 'transformation',
    grammar: 'Singular noun',
    grammarAr: 'Singular noun',
    tip: '“in this transformation”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'توصل': {
    en: 'reached',
    grammar: 'Past collocation verb',
    grammarAr: 'Past collocation verb',
    tip: 'In English, you “REACH a compromise/agreement” (never “arrive to”!).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الطرفان': {
    en: 'The two parties',
    grammar: 'Dual subject noun',
    grammarAr: 'Dual subject noun',
    tip: 'Placed first: “The two parties finally reached…”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'أخيرا': {
    en: 'finally',
    grammar: 'Adverb',
    grammarAr: 'Adverb',
    tip: 'Placed before the main verb (“finally reached”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'تسوية': {
    en: 'a … compromise',
    grammar: 'Singular countable noun',
    grammarAr: 'Singular countable noun',
    tip: '“reached a mutually acceptable compromise”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'مقبولة': {
    en: 'acceptable',
    grammar: 'Adjective',
    grammarAr: 'Adjective',
    tip: '“mutually acceptable compromise”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'للطرفين': {
    en: 'mutually (for both parties)',
    grammar: 'Adverbial modifier',
    grammarAr: 'Adverbial modifier',
    tip: 'Condenses into the adverb “mutually” before “acceptable” (“mutually acceptable”).',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  // Phase 3 Deep Dives (Lessons 25, 26, 27)
  'الاختبار': {
    en: 'exam / test',
    grammar: 'Countable noun',
    grammarAr: 'Countable noun',
    tip: 'Demonstrative subject: “This exam…”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'سهلا': {
    en: 'easy / a piece of cake',
    grammar: 'Predicate adjective / idiom',
    grammarAr: 'Predicate adjective / idiom',
    tip: 'In native English idioms, very easy tasks are “a piece of cake”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'شربة': {
    en: 'drink / piece of',
    grammar: 'Noun in idiom',
    grammarAr: 'Noun in idiom',
    tip: 'Arabic “مثل شربة ماء” translates idiomatically to “a piece of cake”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'ماء': {
    en: 'water / cake (in idiom)',
    grammar: 'Mass noun',
    grammarAr: 'Mass noun',
    tip: 'Do not translate literally; say “a piece of cake”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'بمزحة': {
    en: 'with a joke',
    grammar: 'Preposition + noun',
    grammarAr: 'Preposition + noun',
    tip: '“started the interview with a joke”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'مزحة': {
    en: 'a joke',
    grammar: 'Countable noun',
    grammarAr: 'Countable noun',
    tip: 'Requires indefinite article: “a joke”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'لطيفة': {
    en: 'nice / pleasant',
    grammar: 'Adjective',
    grammarAr: 'Adjective',
    tip: 'Placed before noun: “a nice joke”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'لكسر': {
    en: 'to break',
    grammar: 'Purpose infinitive',
    grammarAr: 'Purpose infinitive',
    tip: 'Infinitive phrase: “to break the ice”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الجليد': {
    en: 'the ice',
    grammar: 'Noun in idiom',
    grammarAr: 'Noun in idiom',
    tip: '“break the ice” means relieving social or professional tension.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'تمنى': {
    en: 'wished / told',
    grammar: 'Past reporting verb',
    grammarAr: 'Past reporting verb',
    tip: '“He told her to break a leg before the show”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الحظ': {
    en: 'luck',
    grammar: 'Noun',
    grammarAr: 'Noun',
    tip: 'English theatrical idiom uses “break a leg” to wish good luck.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'السعيد': {
    en: 'good / happy',
    grammar: 'Adjective',
    grammarAr: 'Adjective',
    tip: 'Modifies luck: “good luck”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'صعودها': {
    en: 'her going up / before the show',
    grammar: 'Noun / gerund phrase',
    grammarAr: 'Noun / gerund phrase',
    tip: 'Translated idiomatically to “before the show” or “before going on stage”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'لها': {
    en: 'her / to her',
    grammar: 'Preposition + pronoun',
    grammarAr: 'Preposition + pronoun',
    tip: 'Object pronoun: “told her”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'حقق': {
    en: 'achieved / succeeded',
    grammar: 'Past verb',
    grammarAr: 'Past verb',
    tip: '“the team succeeded”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'نجاحا': {
    en: 'success',
    grammar: 'Accusative noun',
    grammarAr: 'Accusative noun',
    tip: '“succeeded / achieved success”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'تعديل': {
    en: 'adjust / modify',
    grammar: 'Verbal noun',
    grammarAr: 'Verbal noun',
    tip: '“adjusted its prices”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'يتبع': {
    en: 'follows',
    grammar: 'Present verb',
    grammarAr: 'Present verb',
    tip: '“follows a different pathway”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'المسرح': {
    en: 'the stage / the show',
    grammar: 'Noun',
    grammarAr: 'Noun',
    tip: '“the show” or “the stage”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'صعوبات': {
    en: 'challenges / difficulties',
    grammar: 'Plural noun',
    grammarAr: 'Plural noun',
    tip: 'Collocation: “technical challenges”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'تقنية': {
    en: 'technical',
    grammar: 'Adjective',
    grammarAr: 'Adjective',
    tip: 'Placed before noun: “technical challenges”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'باهرا': {
    en: 'great / outstanding',
    grammar: 'Adjective',
    grammarAr: 'Adjective',
    tip: '“succeeded greatly / achieved outstanding success”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'ارتفعت': {
    en: 'increased / rose',
    grammar: 'Past verb',
    grammarAr: 'Past verb',
    tip: '“Production costs increased”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'تكاليف': {
    en: 'costs',
    grammar: 'Plural noun',
    grammarAr: 'Plural noun',
    tip: '“Production costs”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الإنتاج': {
    en: 'production',
    grammar: 'Noun adjunct',
    grammarAr: 'Noun adjunct',
    tip: '“Production costs”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'وبناء': {
    en: 'consequently / accordingly',
    grammar: 'Causal conjunctive adverb',
    grammarAr: 'Causal conjunctive adverb',
    tip: 'High-register causal connector: “consequently,”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'اضطرت': {
    en: 'was forced to / had to',
    grammar: 'Past verb',
    grammarAr: 'Past verb',
    tip: '“the company adjusted its prices”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'أسعارها': {
    en: 'its prices',
    grammar: 'Plural noun + possessive',
    grammarAr: 'Plural noun + possessive',
    tip: 'Inanimate possessive: “its prices”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الدراسة': {
    en: 'The study',
    grammar: 'Subject noun',
    grammarAr: 'Subject noun',
    tip: '“The study is comprehensive”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'شاملة': {
    en: 'comprehensive',
    grammar: 'Predicate adjective',
    grammarAr: 'Predicate adjective',
    tip: 'Follows linking verb: “is comprehensive”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'وعلاوة': {
    en: 'furthermore / moreover',
    grammar: 'Additive conjunctive adverb',
    grammarAr: 'Additive conjunctive adverb',
    tip: 'Formal academic connector: “furthermore,”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'توصيات': {
    en: 'recommendations',
    grammar: 'Plural noun',
    grammarAr: 'Plural noun',
    tip: '“actionable recommendations”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'عملية': {
    en: 'actionable / practical',
    grammar: 'Adjective',
    grammarAr: 'Adjective',
    tip: '“actionable recommendations”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'قابلة': {
    en: 'actionable / practical',
    grammar: 'Adjective',
    grammarAr: 'Adjective',
    tip: 'Part of “actionable recommendations”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'للتطبيق': {
    en: 'applicable / actionable',
    grammar: 'Preposition + noun',
    grammarAr: 'Preposition + noun',
    tip: 'Condenses into the adjective “actionable”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'المعتقد': {
    en: 'believed',
    grammar: 'Passive participle hedge',
    grammarAr: 'Passive participle hedge',
    tip: 'Impersonal hedge: “It is widely believed that…”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'نطاق': {
    en: 'scale / widely',
    grammar: 'Noun in adverbial phrase',
    grammarAr: 'Noun in adverbial phrase',
    tip: '“على نطاق واسع” maps to the adverb “widely”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'واسع': {
    en: 'widely',
    grammar: 'Adverbial modifier',
    grammarAr: 'Adverbial modifier',
    tip: '“widely believed”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'درجة': {
    en: 'temperature',
    grammar: 'Noun',
    grammarAr: 'Noun',
    tip: '“temperature affects…”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الحرارة': {
    en: 'heat / temperature',
    grammar: 'Scientific noun',
    grammarAr: 'Scientific noun',
    tip: 'Zero-article in thermodynamics: “temperature affects the reaction rate”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'معدل': {
    en: 'rate',
    grammar: 'Noun',
    grammarAr: 'Noun',
    tip: '“reaction rate”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'سرعة': {
    en: 'rate / speed',
    grammar: 'Noun',
    grammarAr: 'Noun',
    tip: '“reaction rate” in chemical kinetics.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'الفرضية': {
    en: 'hypothesis',
    grammar: 'Countable scientific noun',
    grammarAr: 'Countable scientific noun',
    tip: '“this hypothesis”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'مسارا': {
    en: 'pathway / mechanism',
    grammar: 'Countable noun',
    grammarAr: 'Countable noun',
    tip: 'Takes indefinite article: “a different pathway”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
  },
  'مختلفا': {
    en: 'different',
    grammar: 'Adjective',
    grammarAr: 'Adjective',
    tip: 'Placed before noun: “a different pathway”.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
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
    grammarAr: 'Arabic Token',
    tip: 'Double-tap any Arabic word to inspect its English transfer logic.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
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
    grammarAr: 'Arabic Vocabulary Token',
    tip: 'Compare how this word maps into the English sentence skeleton.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
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
    grammarAr: 'Arabic Vocabulary Token',
    tip: 'Compare how this word fits into the English Subject → Verb → Object skeleton.',
    tipAr: 'قارن الكلمة دي بجملة الإنجليزي عشان تشوف مكانها.'
      };
    }
    return null;
  } catch {
    window.clearTimeout(timeoutId);
    return null;
  }
}
