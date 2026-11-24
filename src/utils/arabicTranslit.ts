// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

/**
 * Lightweight, zero-dependency Arabic -> Latin phonetic transliterator
 * for weak-Arabic / IGCSE / international / diaspora learners in English-Guided mode.
 */

const CURATED_PHRASE_TRANSLIT: Record<string, string> = {
  'أنا جاهز': 'Ana gahez',
  'أنا مهندس': 'Ana mohandes',
  'هو طالب': 'Howa taleb',
  'هي جاهزة': 'Heya gahza',
  'أنا موافق معاك': "Ana mowafeq ma'ak",
  'هو ماراحش الشغل': 'Howa marahsh el-shoghl',
  'افتح النور من فضلك': 'Eftah el-noor men fadlak',
  'عندي 22 سنة': 'Andi 22 sana',
  'هي دكتورة في المستشفى': 'Heya doktora fel-mostashfa',
  'هي متجوزة من مهندس': 'Heya metgaweza men mohandes',
  'روحت البيت بدري': 'Roht el-beit badri',
  'أنا مستنيك بره': 'Ana mestanneek barra',
  'هو قال لي الحقيقة': "Howa al-li el-ha'ee'a",
  'الأخبار حلوة جداً': 'El-akhbar helwa geddan',
  'أحمد أطول من علي': 'Ahmed atwal men Ali',
  'أنا عايش في إسكندرية': 'Ana ayesh fe Eskendereya',
  'ممكن تقفل المروحة؟': "Momken te'fel el-marwaha?",
  'أنا ماشفتوش امبارح': 'Ana mashoftosh embareh',
  'أخويا عنده شغل جديد': 'Akhoya ando shoghl gedeed',
};

const ARABIC_CHAR_MAP: Record<string, string> = {
  ا: 'a',
  أ: 'a',
  إ: 'e',
  آ: 'aa',
  ب: 'b',
  ت: 't',
  ث: 'th',
  ج: 'g',
  ح: 'h',
  خ: 'kh',
  د: 'd',
  ذ: 'z',
  ر: 'r',
  ز: 'z',
  س: 's',
  ش: 'sh',
  ص: 's',
  ض: 'd',
  ط: 't',
  ظ: 'z',
  ع: 'a',
  غ: 'gh',
  ف: 'f',
  ق: 'q',
  ك: 'k',
  ل: 'l',
  م: 'm',
  ن: 'n',
  ه: 'h',
  ة: 'a',
  و: 'o',
  ي: 'y',
  ى: 'a',
  ئ: 'e',
  ؤ: 'o',
  ء: "'",
  '\u064E': 'a', // fatha
  '\u064F': 'o', // damma
  '\u0650': 'e', // kasra
  '\u064B': 'an', // tanwin fath
  '\u064C': 'on', // tanwin damm
  '\u064D': 'en', // tanwin kasr
  '\u0652': '', // sukun
  '\u0651': '', // shadda
  '\u0640': '', // tatweel
};

const ARABIC_REGEX = /[\u0600-\u06FF]/;

export function hasArabicScript(text: string): boolean {
  return ARABIC_REGEX.test(text);
}

/**
 * Converts an Arabic phrase to a readable Latin phonetic transliteration.
 * Uses curated Egyptian/MSA phonetics for known phrases, with a deterministic
 * character-level fallback for arbitrary dictionary or lesson phrases.
 */
export function transliterateArabicToLatin(text: string): string {
  const trimmed = (text || '').trim();
  if (!trimmed || !hasArabicScript(trimmed)) return trimmed;

  const exact = CURATED_PHRASE_TRANSLIT[trimmed];
  if (exact) return exact;

  const words = trimmed.split(/\s+/).map((word) => {
    if (!hasArabicScript(word)) return word;
    let prefix = '';
    let body = word;
    if (body.startsWith('ال') && body.length > 2) {
      prefix = 'el-';
      body = body.slice(2);
    }
    let out = '';
    for (const ch of body) {
      out += ARABIC_CHAR_MAP[ch] ?? ch;
    }
    return prefix + out;
  });

  const joined = words.join(' ').replace(/\s+/g, ' ').trim();
  if (!joined) return trimmed;
  return joined.charAt(0).toUpperCase() + joined.slice(1);
}
