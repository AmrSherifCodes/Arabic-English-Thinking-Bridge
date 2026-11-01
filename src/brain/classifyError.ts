import { ErrorType } from './types';

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?'"’]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

const COPULA_FORMS = new Set(['am', 'is', 'are', 'was', 'were']);
const SUBJECT_PRONOUNS = new Set(['i', 'you', 'he', 'she', 'it', 'we', 'they']);
const IRREGULAR_PLURAL_REGULARIZATIONS: Record<string, string[]> = {
  children: ['childs', 'childrens'],
  men: ['mans'],
  women: ['womans'],
  teeth: ['tooths'],
  feet: ['foots'],
  people: ['persons']
};

/**
 * Classifies structural L1 Arabic -> English transfer errors deterministically.
 * Returns ErrorType if a known error pattern matches, otherwise null.
 */
export function classifyError(submitted: string, target: string): ErrorType | null {
  const subTokens = tokenize(submitted);
  const targetTokens = tokenize(target);

  // If identical, no error
  if (subTokens.join(' ') === targetTokens.join(' ')) {
    return null;
  }

  const subSet = new Set(subTokens);
  const subString = subTokens.join(' ');
  const targetString = targetTokens.join(' ');

  // 1. Copula Omission (أنا طالب -> I student)
  // Target has BE verb (am/is/are/was/were), but submitted has no form of BE
  const targetCopula = targetTokens.find((t) => COPULA_FORMS.has(t));
  const subHasCopula = subTokens.some((t) => COPULA_FORMS.has(t));
  if (targetCopula && !subHasCopula) {
    return 'copula_omitted';
  }

  // 2. Pronoun Dropping (Pro-drop transfer: أذهب -> Go to work)
  if (
    targetTokens.length > 0 &&
    SUBJECT_PRONOUNS.has(targetTokens[0]) &&
    subTokens.length > 0 &&
    !SUBJECT_PRONOUNS.has(subTokens[0]) &&
    subTokens[0] === targetTokens[1]
  ) {
    return 'pronoun_dropped';
  }

  // 3. Preposition Transfer (afraid from -> afraid of, married from -> married to)
  if (
    (targetString.includes('afraid of') && subString.includes('afraid from')) ||
    (targetString.includes('married to') && subString.includes('married from')) ||
    (targetString.includes('angry with') && subString.includes('angry from'))
  ) {
    return 'preposition_transfer';
  }

  // 4. Irregular Plural Over-regularization (childs -> children)
  for (const [canonicalPlural, wrongForms] of Object.entries(IRREGULAR_PLURAL_REGULARIZATIONS)) {
    if (targetSetHas(targetTokens, canonicalPlural) && wrongForms.some((w) => subSet.has(w))) {
      return 'plural_irregular';
    }
  }

  // 5. Spurious Article "the" (Generic noun over-specification: The education -> Education)
  if (
    subTokens.length > 0 &&
    subTokens[0] === 'the' &&
    targetTokens.length > 0 &&
    targetTokens[0] !== 'the' &&
    subTokens.slice(1).join(' ') === targetString
  ) {
    return 'article_spurious';
  }

  // 6. Indefinite Article Missing (I have car -> I have a car)
  const targetArticles = targetTokens.filter((t) => t === 'a' || t === 'an');
  const subArticles = subTokens.filter((t) => t === 'a' || t === 'an');
  if (targetArticles.length > subArticles.length) {
    return 'article_missing';
  }

  // 7. Word Order VSO (فعل + فاعل: read the student -> the student read)
  if (
    targetTokens.length >= 3 &&
    subTokens.length >= 3 &&
    subTokens[0] === targetTokens[2] && // verb first
    subTokens[1] === targetTokens[0] && // subject second
    subTokens[2] === targetTokens[1]
  ) {
    return 'word_order_vso';
  }

  // Negative Inversion failure (Seldom we see -> Seldom do we see)
  if (
    (targetString.startsWith('seldom do we') && subString.startsWith('seldom we')) ||
    (targetString.startsWith('rarely do') && !subString.includes('do'))
  ) {
    return 'word_order_vso';
  }

  // 8. Aspect Confusion (Stative verb with -ing, or uninflected passive verb)
  if (
    subTokens.some((t) => t.endsWith('ing') && !targetTokens.includes(t)) ||
    (targetString.includes('was written') && subString.includes('was wrote')) ||
    (targetString.includes('is recycled') && subString.includes('is recycle'))
  ) {
    return 'aspect_confused';
  }

  return null;
}

function targetSetHas(tokens: string[], word: string): boolean {
  return tokens.includes(word);
}
