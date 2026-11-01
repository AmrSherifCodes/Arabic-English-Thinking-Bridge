import { ConceptNode } from '../types';

export const SEED_CONCEPTS: ConceptNode[] = [
  {
    id: 'copula.present',
    family: 'copula',
    source_pattern: 'مبتدأ + خبر (بدون فعل رابط)',
    target_pattern: 'Subject + BE (am / is / are) + Complement',
    contrast_note: 'Arabic does not require a linking verb in the present tense (الجملة الاسمية). In English, every declarative sentence requires an explicit finite verb (e.g., am/is/are).',
    examples: [
      {
        source: 'أنا طالب',
        target: 'I am a student',
        blocks: ['I', 'am', 'a', 'student', 'he']
      },
      {
        source: 'هو طبيب',
        target: 'He is a doctor',
        blocks: ['He', 'is', 'a', 'doctor', 'they']
      }
    ],
    common_errors: ['copula_omitted', 'article_missing'],
    prerequisites: [],
    cefr_band: 'A1+',
    transfer_weight: 0.95,
    tracks: ['general', 'academic']
  },
  {
    id: 'articles.indefinite',
    family: 'articles',
    source_pattern: 'اسم نكرة منون',
    target_pattern: 'a / an + singular countable noun',
    contrast_note: 'Arabic marks indefiniteness with nunation (تنوين), not a separate preceding article. English strictly requires "a" or "an" before singular countable nouns.',
    examples: [
      {
        source: 'عندي سيارة',
        target: 'I have a car',
        blocks: ['I', 'have', 'a', 'car', 'the']
      },
      {
        source: 'هو اشترى كتاباً',
        target: 'He bought a book',
        blocks: ['He', 'bought', 'a', 'book', 'the']
      }
    ],
    common_errors: ['article_missing'],
    prerequisites: ['copula.present'],
    cefr_band: 'A1+',
    transfer_weight: 0.9,
    tracks: ['general', 'academic']
  },
  {
    id: 'pronoun.subject_explicit',
    family: 'pronouns',
    source_pattern: 'ضمير مستتر تقديره أنا/هو/نحن',
    target_pattern: 'Explicit Subject Pronoun (I, you, he, she, it, we, they)',
    contrast_note: 'Arabic is a pro-drop language where verb morphology encodes the subject. English non-imperative sentences strictly demand an overt subject pronoun.',
    examples: [
      {
        source: 'أذهب إلى العمل كل يوم',
        target: 'I go to work every day',
        blocks: ['I', 'go', 'to', 'work', 'every', 'day', 'he']
      }
    ],
    common_errors: ['pronoun_dropped'],
    prerequisites: ['copula.present'],
    cefr_band: 'A1+',
    transfer_weight: 0.85,
    tracks: ['general']
  },
  {
    id: 'word_order.svo',
    family: 'syntax',
    source_pattern: 'فعل + فاعل + مفعول (جملة فعلية VSO)',
    target_pattern: 'Subject + Verb + Object (SVO)',
    contrast_note: 'Arabic sentences routinely begin with the verb (VSO order). Standard English unmarked word order is strictly Subject-Verb-Object (SVO).',
    examples: [
      {
        source: 'قرأ الطالب التقرير',
        target: 'The student read the report',
        blocks: ['The', 'student', 'read', 'the', 'report', 'readed']
      }
    ],
    common_errors: ['word_order_vso'],
    prerequisites: ['copula.present', 'articles.indefinite'],
    cefr_band: 'A2',
    transfer_weight: 0.88,
    tracks: ['general', 'academic']
  },
  {
    id: 'plural.irregular',
    family: 'morphology',
    source_pattern: 'جمع تكسير لا ينتهي بـ ون / ات',
    target_pattern: 'Irregular English Plural (children, men, women, feet, teeth)',
    contrast_note: 'Unlike regular English plurals that add -s, irregular forms undergo stem vowel shifts (akin to Arabic جمع التكسير). Avoid adding regular -s.',
    examples: [
      {
        source: 'رأيت أطفالاً في الحديقة',
        target: 'I saw children in the park',
        blocks: ['I', 'saw', 'children', 'childs', 'in', 'the', 'park']
      }
    ],
    common_errors: ['plural_irregular'],
    prerequisites: ['articles.indefinite'],
    cefr_band: 'A2',
    transfer_weight: 0.7,
    tracks: ['general']
  },
  {
    id: 'articles.spurious_the',
    family: 'articles',
    source_pattern: 'الـ التعريف مع الأسماء العامة أو المجردة',
    target_pattern: 'Zero Article with Uncountable / Generic Nouns',
    contrast_note: 'Arabic prefixes "الـ" to generic and abstract nouns (e.g. التعليم، الصحة). English uses zero article when speaking generally.',
    examples: [
      {
        source: 'التعليم مهم للجميع',
        target: 'Education is important for everyone',
        blocks: ['Education', 'The', 'education', 'is', 'important', 'for', 'everyone']
      }
    ],
    common_errors: ['article_spurious'],
    prerequisites: ['articles.indefinite', 'copula.present'],
    cefr_band: 'B1',
    transfer_weight: 0.82,
    tracks: ['general', 'academic', 'sustainability']
  },
  {
    id: 'aspect.stative_vs_continuous',
    family: 'aspect',
    source_pattern: 'فعل مضارع يدل على حالة أو إدراك',
    target_pattern: 'Simple Present (Stative Verbs) without -ing',
    contrast_note: 'Arabic uses the imperfect tense (مضارع) uniformly. English stative verbs (know, believe, understand) express states and reject the continuous aspect.',
    examples: [
      {
        source: 'أنا أفهم الفكرة الآن',
        target: 'I understand the idea now',
        blocks: ['I', 'understand', 'am', 'understanding', 'the', 'idea', 'now']
      }
    ],
    common_errors: ['aspect_confused'],
    prerequisites: ['word_order.svo'],
    cefr_band: 'B1',
    transfer_weight: 0.78,
    tracks: ['general', 'academic']
  },
  {
    id: 'prepositions.transfer',
    family: 'prepositions',
    source_pattern: 'حرف جر مقترن بالفعل عربياً (خائف من، متزوج من)',
    target_pattern: 'Fixed English Collocation (afraid of, married to)',
    contrast_note: 'Translating Arabic prepositions directly causes transfer errors (e.g. "afraid from" -> "afraid of"; "married from" -> "married to").',
    examples: [
      {
        source: 'هو خائف من الظلام',
        target: 'He is afraid of the dark',
        blocks: ['He', 'is', 'afraid', 'of', 'from', 'the', 'dark']
      }
    ],
    common_errors: ['preposition_transfer'],
    prerequisites: ['copula.present'],
    cefr_band: 'B1',
    transfer_weight: 0.85,
    tracks: ['general']
  },
  {
    id: 'passive.present_simple',
    family: 'voice',
    source_pattern: 'فعل مبني للمجهول (كُتب، يُناقش، تُعاد تدوير)',
    target_pattern: 'Subject + BE + Past Participle',
    contrast_note: 'Arabic marks passive voice internally by vowel patterns (فُعِل / يُفْعَل). English constructs it periphrastically using auxiliary BE + past participle.',
    examples: [
      {
        source: 'كُتب التقرير',
        target: 'The report was written',
        blocks: ['The', 'report', 'was', 'written', 'wrote', 'by']
      },
      {
        source: 'تُعاد تدوير النفايات',
        target: 'Waste is recycled',
        blocks: ['Waste', 'is', 'recycled', 'recycle', 'was']
      }
    ],
    common_errors: ['copula_omitted', 'aspect_confused'],
    prerequisites: ['word_order.svo', 'articles.spurious_the'],
    cefr_band: 'B2',
    transfer_weight: 0.88,
    tracks: ['academic', 'sustainability']
  },
  {
    id: 'inversion.negative',
    family: 'inversion',
    source_pattern: 'تقديم أداة النفي دون تغيير ترتيب الجملة',
    target_pattern: 'Negative Adverb + Auxiliary + Subject + Main Verb',
    contrast_note: 'Fronting negative or restrictive adverbials (Seldom, Rarely, Never) requires subject-auxiliary inversion in English, unlike Arabic.',
    examples: [
      {
        source: 'نادراً ما نرى هذا',
        target: 'Seldom do we see this',
        blocks: ['Seldom', 'do', 'we', 'see', 'this', 'we', 'saw']
      },
      {
        source: 'نادراً ما تحدث مثل هذه الكوارث',
        target: 'Rarely do such disasters happen',
        blocks: ['Rarely', 'do', 'such', 'disasters', 'happen', 'happens']
      }
    ],
    common_errors: ['word_order_vso', 'aspect_confused'],
    prerequisites: ['passive.present_simple'],
    cefr_band: 'C1',
    transfer_weight: 0.92,
    tracks: ['academic', 'sustainability', 'general']
  }
];
