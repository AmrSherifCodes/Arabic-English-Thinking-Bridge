/**
 * Franco-Arabic to Egyptian Arabic Converter
 * Detects numbers (3, 7, 2, 5, etc.) and common Franco Egyptian words
 */

const FRANCO_MAP: Record<string, string> = {
  '3': 'ع',
  '7': 'ح',
  '2': 'أ',
  '5': 'خ',
  '8': 'غ',
  '6': 'ط',
  '9': 'ق',
};

const COMMON_FRANCO_WORDS: Record<string, string> = {
  mesh: 'مش',
  msh: 'مش',
  mosh: 'مش',
  el: 'الـ',
  ya: 'يا',
  basha: 'باشا',
  feen: 'فين',
  fen: 'فين',
  keda: 'كده',
  kda: 'كده',
  delwa2ty: 'دلوقتي',
  delwaty: 'دلوقتي',
  leih: 'ليه',
  leh: 'ليه',
  meen: 'مين',
  ezayak: 'إزيك',
  ezyak: 'إزيك',
  tamam: 'تمام',
  shokran: 'شكراً',
  shokrn: 'شكراً',
  '3ameel': 'عميل',
  '3amel': 'عميل',
  sho8l: 'شغل',
  shoghl: 'شغل',
  shogl: 'شغل',
  keteer: 'كتير',
  kter: 'كتير',
  ma3lesh: 'معلش',
  m3lesh: 'معلش',
  '3ayez': 'عايز',
  '3awez': 'عايز',
  yalla: 'يلا',
  wallahy: 'والله',
  walahy: 'والله',
};

export function isFranco(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  // If it already has Arabic letters, not pure Franco
  if (/[\u0600-\u06FF]/.test(text)) return false;

  // Check for Franco number markers (3, 7, 2, 5, 8) attached to English letters
  const hasFrancoNumbers = /[a-zA-Z][235789]|[235789][a-zA-Z]/.test(text);
  if (hasFrancoNumbers) return true;

  // Check for common Franco words
  const words = text.toLowerCase().split(/\s+/);
  return words.some((w) => COMMON_FRANCO_WORDS[w] !== undefined);
}

export function francoToArabic(text: string): string {
  if (!text) return '';

  const words = text.split(/\s+/);
  const convertedWords = words.map((w) => {
    const clean = w.toLowerCase().replace(/[^\w]/g, '');
    if (COMMON_FRANCO_WORDS[clean]) {
      return COMMON_FRANCO_WORDS[clean];
    }

    // Replace Franco numbers with Arabic letters
    let result = '';
    for (const char of w) {
      if (FRANCO_MAP[char]) {
        result += FRANCO_MAP[char];
      } else {
        result += char;
      }
    }
    return result;
  });

  return convertedWords.join(' ');
}
