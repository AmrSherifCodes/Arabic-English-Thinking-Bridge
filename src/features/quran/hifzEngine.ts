// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import { QURAN_HIFZ_STORAGE_KEY } from '../../types/entitlement';
import { API_BASE_URL } from '../../utils/api';

export { QURAN_HIFZ_STORAGE_KEY };

export type RevelationType = 'Meccan' | 'Medinan';

export interface SurahMeta {
  number: number;
  nameAr: string;
  nameEn: string;
  ayahCount: number;
  revelationType: RevelationType;
}

export interface QuranAyah {
  number: number;
  numberInSurah: number;
  juz: number;
  page: number;
  textUthmani: string;
  audioUrl: string | null;
  audioFallbackUrl: string | null;
  tafsirMuyassar: string;
  translationEn: string;
  transliterationEn: string;
}

export interface QuranSurahData {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
  ayahs: QuranAyah[];
}

export interface AyahChunk {
  chunkKey: string;
  startAyah: number;
  endAyah: number;
  ayahs: QuranAyah[];
}

export type FadeStage = 0 | 30 | 70 | 100;

export interface MaskedWord {
  index: number;
  word: string;
  isMaskedByStage: boolean;
  temporarilyRevealed: boolean;
  isHidden: boolean;
}

export interface AyahBridgeLink {
  fromAyahNumber: number;
  toAyahNumber: number;
  tailWords: string[];
  headWords: string[];
  fromAudioUrl: string | null;
  toAudioUrl: string | null;
}

export type EchoRepeatCount = 1 | 3 | 5;
export type EchoPauseSeconds = 0 | 3 | 5;

export interface EchoStepResult {
  action: 'replay_same' | 'pause_then_replay' | 'next_ayah' | 'pause_then_next' | 'complete';
  nextAyahIndex: number;
  nextRepeatIndex: number;
  pauseMs: number;
}

export type WirdQuality = 'hard' | 'good' | 'easy';

export interface QuranWirdEntry {
  chunkKey: string;
  surahNumber: number;
  surahNameAr: string;
  surahNameEn: string;
  startAyah: number;
  endAyah: number;
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  lastReviewedAt: number;
  nextReviewAt: number;
}

export type MushafFontSize = 'sm' | 'md' | 'lg';
export type MushafThemeMode = 'light' | 'dark';

export type QuranReciterId =
  | 'ar.husary'
  | 'ar.minshawi'
  | 'ar.alafasy';

export interface QuranReciterMeta {
  id: QuranReciterId;
  nameAr: string;
  nameEn: string;
  styleAr: string;
  styleEn: string;
}

export const QURAN_RECITERS: ReadonlyArray<QuranReciterMeta> = [
  {
    id: 'ar.husary',
    nameAr: 'الشيخ محمود خليل الحصري (المعلم)',
    nameEn: 'Sheikh Mahmoud Khalil Al-Husary (Teacher)',
    styleAr: 'معلّم · مرتّل واضح',
    styleEn: 'Teacher · Clear Murattal',
  },
  {
    id: 'ar.minshawi',
    nameAr: 'الشيخ محمد صديق المنشاوي',
    nameEn: 'Sheikh Muhammad Siddiq Al-Minshawi',
    styleAr: 'خاشع · مرتّل',
    styleEn: 'Reverent · Murattal',
  },
  {
    id: 'ar.alafasy',
    nameAr: 'الشيخ مشاري راشد العفاسي',
    nameEn: 'Sheikh Mishary Rashid Alafasy',
    styleAr: 'نقي وحديث',
    styleEn: 'Crisp & Clear',
  },
];

export interface QuranBookmark {
  key: string;
  surahNumber: number;
  ayahNumber: number;
  surahNameAr: string;
  surahNameEn: string;
  excerpt: string;
  savedAt: number;
}

export interface QuranHifzStoreState {
  version: 1;
  lastSurahNumber: number;
  lastAyahNumber: number;
  fontSize: MushafFontSize;
  fontScale: number;
  mushafTheme: MushafThemeMode;
  reciterId: QuranReciterId;
  bookmarks: Record<string, QuranBookmark>;
  wirdEntries: Record<string, QuranWirdEntry>;
}

export const FEATURED_SURAH_NUMBERS = [1, 18, 36, 67] as const;
export const JUZ_AMMA_RANGE = { start: 78, end: 114 } as const;
export const WIRD_LADDER_DAYS = [1, 3, 7, 21] as const;
export const DAY_MS = 86_400_000;

const SURAH_CACHE_DB = 'tb-quran-sanctuary-v1';
const SURAH_CACHE_STORE = 'surahs';
const SURAH_CACHE_LS_PREFIX = 'tb.quranSurahCache.v1.';

export const SURAH_INDEX: ReadonlyArray<SurahMeta> = [
  { number: 1, nameAr: 'الفاتحة', nameEn: 'Al-Fatihah', ayahCount: 7, revelationType: 'Meccan' },
  { number: 2, nameAr: 'البقرة', nameEn: 'Al-Baqarah', ayahCount: 286, revelationType: 'Medinan' },
  { number: 3, nameAr: 'آل عمران', nameEn: "Ali 'Imran", ayahCount: 200, revelationType: 'Medinan' },
  { number: 4, nameAr: 'النساء', nameEn: 'An-Nisa', ayahCount: 176, revelationType: 'Medinan' },
  { number: 5, nameAr: 'المائدة', nameEn: "Al-Ma'idah", ayahCount: 120, revelationType: 'Medinan' },
  { number: 6, nameAr: 'الأنعام', nameEn: "Al-An'am", ayahCount: 165, revelationType: 'Meccan' },
  { number: 7, nameAr: 'الأعراف', nameEn: "Al-A'raf", ayahCount: 206, revelationType: 'Meccan' },
  { number: 8, nameAr: 'الأنفال', nameEn: 'Al-Anfal', ayahCount: 75, revelationType: 'Medinan' },
  { number: 9, nameAr: 'التوبة', nameEn: 'At-Tawbah', ayahCount: 129, revelationType: 'Medinan' },
  { number: 10, nameAr: 'يونس', nameEn: 'Yunus', ayahCount: 109, revelationType: 'Meccan' },
  { number: 11, nameAr: 'هود', nameEn: 'Hud', ayahCount: 123, revelationType: 'Meccan' },
  { number: 12, nameAr: 'يوسف', nameEn: 'Yusuf', ayahCount: 111, revelationType: 'Meccan' },
  { number: 13, nameAr: 'الرعد', nameEn: "Ar-Ra'd", ayahCount: 43, revelationType: 'Medinan' },
  { number: 14, nameAr: 'إبراهيم', nameEn: 'Ibrahim', ayahCount: 52, revelationType: 'Meccan' },
  { number: 15, nameAr: 'الحجر', nameEn: 'Al-Hijr', ayahCount: 99, revelationType: 'Meccan' },
  { number: 16, nameAr: 'النحل', nameEn: 'An-Nahl', ayahCount: 128, revelationType: 'Meccan' },
  { number: 17, nameAr: 'الإسراء', nameEn: 'Al-Isra', ayahCount: 111, revelationType: 'Meccan' },
  { number: 18, nameAr: 'الكهف', nameEn: 'Al-Kahf', ayahCount: 110, revelationType: 'Meccan' },
  { number: 19, nameAr: 'مريم', nameEn: 'Maryam', ayahCount: 98, revelationType: 'Meccan' },
  { number: 20, nameAr: 'طه', nameEn: 'Taha', ayahCount: 135, revelationType: 'Meccan' },
  { number: 21, nameAr: 'الأنبياء', nameEn: 'Al-Anbya', ayahCount: 112, revelationType: 'Meccan' },
  { number: 22, nameAr: 'الحج', nameEn: 'Al-Hajj', ayahCount: 78, revelationType: 'Medinan' },
  { number: 23, nameAr: 'المؤمنون', nameEn: "Al-Mu'minun", ayahCount: 118, revelationType: 'Meccan' },
  { number: 24, nameAr: 'النور', nameEn: 'An-Nur', ayahCount: 64, revelationType: 'Medinan' },
  { number: 25, nameAr: 'الفرقان', nameEn: 'Al-Furqan', ayahCount: 77, revelationType: 'Meccan' },
  { number: 26, nameAr: 'الشعراء', nameEn: "Ash-Shu'ara", ayahCount: 227, revelationType: 'Meccan' },
  { number: 27, nameAr: 'النمل', nameEn: 'An-Naml', ayahCount: 93, revelationType: 'Meccan' },
  { number: 28, nameAr: 'القصص', nameEn: 'Al-Qasas', ayahCount: 88, revelationType: 'Meccan' },
  { number: 29, nameAr: 'العنكبوت', nameEn: "Al-'Ankabut", ayahCount: 69, revelationType: 'Meccan' },
  { number: 30, nameAr: 'الروم', nameEn: 'Ar-Rum', ayahCount: 60, revelationType: 'Meccan' },
  { number: 31, nameAr: 'لقمان', nameEn: 'Luqman', ayahCount: 34, revelationType: 'Meccan' },
  { number: 32, nameAr: 'السجدة', nameEn: 'As-Sajdah', ayahCount: 30, revelationType: 'Meccan' },
  { number: 33, nameAr: 'الأحزاب', nameEn: 'Al-Ahzab', ayahCount: 73, revelationType: 'Medinan' },
  { number: 34, nameAr: 'سبأ', nameEn: 'Saba', ayahCount: 54, revelationType: 'Meccan' },
  { number: 35, nameAr: 'فاطر', nameEn: 'Fatir', ayahCount: 45, revelationType: 'Meccan' },
  { number: 36, nameAr: 'يس', nameEn: 'Ya-Sin', ayahCount: 83, revelationType: 'Meccan' },
  { number: 37, nameAr: 'الصافات', nameEn: 'As-Saffat', ayahCount: 182, revelationType: 'Meccan' },
  { number: 38, nameAr: 'ص', nameEn: 'Sad', ayahCount: 88, revelationType: 'Meccan' },
  { number: 39, nameAr: 'الزمر', nameEn: 'Az-Zumar', ayahCount: 75, revelationType: 'Meccan' },
  { number: 40, nameAr: 'غافر', nameEn: 'Ghafir', ayahCount: 85, revelationType: 'Meccan' },
  { number: 41, nameAr: 'فصلت', nameEn: 'Fussilat', ayahCount: 54, revelationType: 'Meccan' },
  { number: 42, nameAr: 'الشورى', nameEn: 'Ash-Shuraa', ayahCount: 53, revelationType: 'Meccan' },
  { number: 43, nameAr: 'الزخرف', nameEn: 'Az-Zukhruf', ayahCount: 89, revelationType: 'Meccan' },
  { number: 44, nameAr: 'الدخان', nameEn: 'Ad-Dukhan', ayahCount: 59, revelationType: 'Meccan' },
  { number: 45, nameAr: 'الجاثية', nameEn: 'Al-Jathiyah', ayahCount: 37, revelationType: 'Meccan' },
  { number: 46, nameAr: 'الأحقاف', nameEn: 'Al-Ahqaf', ayahCount: 35, revelationType: 'Meccan' },
  { number: 47, nameAr: 'محمد', nameEn: 'Muhammad', ayahCount: 38, revelationType: 'Medinan' },
  { number: 48, nameAr: 'الفتح', nameEn: 'Al-Fath', ayahCount: 29, revelationType: 'Medinan' },
  { number: 49, nameAr: 'الحجرات', nameEn: 'Al-Hujurat', ayahCount: 18, revelationType: 'Medinan' },
  { number: 50, nameAr: 'ق', nameEn: 'Qaf', ayahCount: 45, revelationType: 'Meccan' },
  { number: 51, nameAr: 'الذاريات', nameEn: 'Adh-Dhariyat', ayahCount: 60, revelationType: 'Meccan' },
  { number: 52, nameAr: 'الطور', nameEn: 'At-Tur', ayahCount: 49, revelationType: 'Meccan' },
  { number: 53, nameAr: 'النجم', nameEn: 'An-Najm', ayahCount: 62, revelationType: 'Meccan' },
  { number: 54, nameAr: 'القمر', nameEn: 'Al-Qamar', ayahCount: 55, revelationType: 'Meccan' },
  { number: 55, nameAr: 'الرحمن', nameEn: 'Ar-Rahman', ayahCount: 78, revelationType: 'Medinan' },
  { number: 56, nameAr: 'الواقعة', nameEn: "Al-Waqi'ah", ayahCount: 96, revelationType: 'Meccan' },
  { number: 57, nameAr: 'الحديد', nameEn: 'Al-Hadid', ayahCount: 29, revelationType: 'Medinan' },
  { number: 58, nameAr: 'المجادلة', nameEn: 'Al-Mujadila', ayahCount: 22, revelationType: 'Medinan' },
  { number: 59, nameAr: 'الحشر', nameEn: 'Al-Hashr', ayahCount: 24, revelationType: 'Medinan' },
  { number: 60, nameAr: 'الممتحنة', nameEn: 'Al-Mumtahanah', ayahCount: 13, revelationType: 'Medinan' },
  { number: 61, nameAr: 'الصف', nameEn: 'As-Saf', ayahCount: 14, revelationType: 'Medinan' },
  { number: 62, nameAr: 'الجمعة', nameEn: "Al-Jumu'ah", ayahCount: 11, revelationType: 'Medinan' },
  { number: 63, nameAr: 'المنافقون', nameEn: 'Al-Munafiqun', ayahCount: 11, revelationType: 'Medinan' },
  { number: 64, nameAr: 'التغابن', nameEn: 'At-Taghabun', ayahCount: 18, revelationType: 'Medinan' },
  { number: 65, nameAr: 'الطلاق', nameEn: 'At-Talaq', ayahCount: 12, revelationType: 'Medinan' },
  { number: 66, nameAr: 'التحريم', nameEn: 'At-Tahrim', ayahCount: 12, revelationType: 'Medinan' },
  { number: 67, nameAr: 'الملك', nameEn: 'Al-Mulk', ayahCount: 30, revelationType: 'Meccan' },
  { number: 68, nameAr: 'القلم', nameEn: 'Al-Qalam', ayahCount: 52, revelationType: 'Meccan' },
  { number: 69, nameAr: 'الحاقة', nameEn: 'Al-Haqqah', ayahCount: 52, revelationType: 'Meccan' },
  { number: 70, nameAr: 'المعارج', nameEn: "Al-Ma'arij", ayahCount: 44, revelationType: 'Meccan' },
  { number: 71, nameAr: 'نوح', nameEn: 'Nuh', ayahCount: 28, revelationType: 'Meccan' },
  { number: 72, nameAr: 'الجن', nameEn: 'Al-Jinn', ayahCount: 28, revelationType: 'Meccan' },
  { number: 73, nameAr: 'المزمل', nameEn: 'Al-Muzzammil', ayahCount: 20, revelationType: 'Meccan' },
  { number: 74, nameAr: 'المدثر', nameEn: 'Al-Muddaththir', ayahCount: 56, revelationType: 'Meccan' },
  { number: 75, nameAr: 'القيامة', nameEn: 'Al-Qiyamah', ayahCount: 40, revelationType: 'Meccan' },
  { number: 76, nameAr: 'الإنسان', nameEn: 'Al-Insan', ayahCount: 31, revelationType: 'Medinan' },
  { number: 77, nameAr: 'المرسلات', nameEn: 'Al-Mursalat', ayahCount: 50, revelationType: 'Meccan' },
  { number: 78, nameAr: 'النبأ', nameEn: 'An-Naba', ayahCount: 40, revelationType: 'Meccan' },
  { number: 79, nameAr: 'النازعات', nameEn: "An-Nazi'at", ayahCount: 46, revelationType: 'Meccan' },
  { number: 80, nameAr: 'عبس', nameEn: "'Abasa", ayahCount: 42, revelationType: 'Meccan' },
  { number: 81, nameAr: 'التكوير', nameEn: 'At-Takwir', ayahCount: 29, revelationType: 'Meccan' },
  { number: 82, nameAr: 'الانفطار', nameEn: 'Al-Infitar', ayahCount: 19, revelationType: 'Meccan' },
  { number: 83, nameAr: 'المطففين', nameEn: 'Al-Mutaffifin', ayahCount: 36, revelationType: 'Meccan' },
  { number: 84, nameAr: 'الانشقاق', nameEn: 'Al-Inshiqaq', ayahCount: 25, revelationType: 'Meccan' },
  { number: 85, nameAr: 'البروج', nameEn: 'Al-Buruj', ayahCount: 22, revelationType: 'Meccan' },
  { number: 86, nameAr: 'الطارق', nameEn: 'At-Tariq', ayahCount: 17, revelationType: 'Meccan' },
  { number: 87, nameAr: 'الأعلى', nameEn: "Al-A'la", ayahCount: 19, revelationType: 'Meccan' },
  { number: 88, nameAr: 'الغاشية', nameEn: 'Al-Ghashiyah', ayahCount: 26, revelationType: 'Meccan' },
  { number: 89, nameAr: 'الفجر', nameEn: 'Al-Fajr', ayahCount: 30, revelationType: 'Meccan' },
  { number: 90, nameAr: 'البلد', nameEn: 'Al-Balad', ayahCount: 20, revelationType: 'Meccan' },
  { number: 91, nameAr: 'الشمس', nameEn: 'Ash-Shams', ayahCount: 15, revelationType: 'Meccan' },
  { number: 92, nameAr: 'الليل', nameEn: 'Al-Layl', ayahCount: 21, revelationType: 'Meccan' },
  { number: 93, nameAr: 'الضحى', nameEn: 'Ad-Duhaa', ayahCount: 11, revelationType: 'Meccan' },
  { number: 94, nameAr: 'الشرح', nameEn: 'Ash-Sharh', ayahCount: 8, revelationType: 'Meccan' },
  { number: 95, nameAr: 'التين', nameEn: 'At-Tin', ayahCount: 8, revelationType: 'Meccan' },
  { number: 96, nameAr: 'العلق', nameEn: "Al-'Alaq", ayahCount: 19, revelationType: 'Meccan' },
  { number: 97, nameAr: 'القدر', nameEn: 'Al-Qadr', ayahCount: 5, revelationType: 'Meccan' },
  { number: 98, nameAr: 'البينة', nameEn: 'Al-Bayyinah', ayahCount: 8, revelationType: 'Medinan' },
  { number: 99, nameAr: 'الزلزلة', nameEn: 'Az-Zalzalah', ayahCount: 8, revelationType: 'Medinan' },
  { number: 100, nameAr: 'العاديات', nameEn: "Al-'Adiyat", ayahCount: 11, revelationType: 'Meccan' },
  { number: 101, nameAr: 'القارعة', nameEn: "Al-Qari'ah", ayahCount: 11, revelationType: 'Meccan' },
  { number: 102, nameAr: 'التكاثر', nameEn: 'At-Takathur', ayahCount: 8, revelationType: 'Meccan' },
  { number: 103, nameAr: 'العصر', nameEn: "Al-'Asr", ayahCount: 3, revelationType: 'Meccan' },
  { number: 104, nameAr: 'الهمزة', nameEn: 'Al-Humazah', ayahCount: 9, revelationType: 'Meccan' },
  { number: 105, nameAr: 'الفيل', nameEn: 'Al-Fil', ayahCount: 5, revelationType: 'Meccan' },
  { number: 106, nameAr: 'قريش', nameEn: 'Quraysh', ayahCount: 4, revelationType: 'Meccan' },
  { number: 107, nameAr: 'الماعون', nameEn: "Al-Ma'un", ayahCount: 7, revelationType: 'Meccan' },
  { number: 108, nameAr: 'الكوثر', nameEn: 'Al-Kawthar', ayahCount: 3, revelationType: 'Meccan' },
  { number: 109, nameAr: 'الكافرون', nameEn: 'Al-Kafirun', ayahCount: 6, revelationType: 'Meccan' },
  { number: 110, nameAr: 'النصر', nameEn: 'An-Nasr', ayahCount: 3, revelationType: 'Medinan' },
  { number: 111, nameAr: 'المسد', nameEn: 'Al-Masad', ayahCount: 5, revelationType: 'Meccan' },
  { number: 112, nameAr: 'الإخلاص', nameEn: 'Al-Ikhlas', ayahCount: 4, revelationType: 'Meccan' },
  { number: 113, nameAr: 'الفلق', nameEn: 'Al-Falaq', ayahCount: 5, revelationType: 'Meccan' },
  { number: 114, nameAr: 'الناس', nameEn: 'An-Nas', ayahCount: 6, revelationType: 'Meccan' },
];

export function getSurahMeta(surahNumber: number): SurahMeta | undefined {
  return SURAH_INDEX.find((s) => s.number === surahNumber);
}

export function getPinnedSurahs(): { featured: SurahMeta[]; juzAmma: SurahMeta[] } {
  const featured = FEATURED_SURAH_NUMBERS.map((num) => SURAH_INDEX.find((s) => s.number === num)).filter(
    (s): s is SurahMeta => Boolean(s)
  );
  const juzAmma = SURAH_INDEX.filter(
    (s) => s.number >= JUZ_AMMA_RANGE.start && s.number <= JUZ_AMMA_RANGE.end
  );
  return { featured, juzAmma };
}

export interface JuzMeta {
  juz: number;
  startSurah: number;
  startAyah: number;
  surahNameAr: string;
  surahNameEn: string;
}

export const JUZ_INDEX: ReadonlyArray<JuzMeta> = [
  { juz: 1, startSurah: 1, startAyah: 1, surahNameAr: 'الفاتحة', surahNameEn: 'Al-Fatihah' },
  { juz: 2, startSurah: 2, startAyah: 142, surahNameAr: 'البقرة', surahNameEn: 'Al-Baqarah' },
  { juz: 3, startSurah: 2, startAyah: 253, surahNameAr: 'البقرة', surahNameEn: 'Al-Baqarah' },
  { juz: 4, startSurah: 3, startAyah: 93, surahNameAr: 'آل عمران', surahNameEn: "Ali 'Imran" },
  { juz: 5, startSurah: 4, startAyah: 24, surahNameAr: 'النساء', surahNameEn: 'An-Nisa' },
  { juz: 6, startSurah: 4, startAyah: 148, surahNameAr: 'النساء', surahNameEn: 'An-Nisa' },
  { juz: 7, startSurah: 5, startAyah: 82, surahNameAr: 'المائدة', surahNameEn: "Al-Ma'idah" },
  { juz: 8, startSurah: 6, startAyah: 111, surahNameAr: 'الأنعام', surahNameEn: "Al-An'am" },
  { juz: 9, startSurah: 7, startAyah: 88, surahNameAr: 'الأعراف', surahNameEn: "Al-A'raf" },
  { juz: 10, startSurah: 8, startAyah: 41, surahNameAr: 'الأنفال', surahNameEn: 'Al-Anfal' },
  { juz: 11, startSurah: 9, startAyah: 93, surahNameAr: 'التوبة', surahNameEn: 'At-Tawbah' },
  { juz: 12, startSurah: 11, startAyah: 6, surahNameAr: 'هود', surahNameEn: 'Hud' },
  { juz: 13, startSurah: 12, startAyah: 53, surahNameAr: 'يوسف', surahNameEn: 'Yusuf' },
  { juz: 14, startSurah: 15, startAyah: 1, surahNameAr: 'الحجر', surahNameEn: 'Al-Hijr' },
  { juz: 15, startSurah: 17, startAyah: 1, surahNameAr: 'الإسراء', surahNameEn: 'Al-Isra' },
  { juz: 16, startSurah: 18, startAyah: 75, surahNameAr: 'الكهف', surahNameEn: 'Al-Kahf' },
  { juz: 17, startSurah: 21, startAyah: 1, surahNameAr: 'الأنبياء', surahNameEn: 'Al-Anbya' },
  { juz: 18, startSurah: 23, startAyah: 1, surahNameAr: 'المؤمنون', surahNameEn: "Al-Mu'minun" },
  { juz: 19, startSurah: 25, startAyah: 21, surahNameAr: 'الفرقان', surahNameEn: 'Al-Furqan' },
  { juz: 20, startSurah: 27, startAyah: 56, surahNameAr: 'النمل', surahNameEn: 'An-Naml' },
  { juz: 21, startSurah: 29, startAyah: 46, surahNameAr: 'العنكبوت', surahNameEn: "Al-'Ankabut" },
  { juz: 22, startSurah: 33, startAyah: 31, surahNameAr: 'الأحزاب', surahNameEn: 'Al-Ahzab' },
  { juz: 23, startSurah: 36, startAyah: 28, surahNameAr: 'يس', surahNameEn: 'Ya-Sin' },
  { juz: 24, startSurah: 39, startAyah: 32, surahNameAr: 'الزمر', surahNameEn: 'Az-Zumar' },
  { juz: 25, startSurah: 41, startAyah: 47, surahNameAr: 'فصلت', surahNameEn: 'Fussilat' },
  { juz: 26, startSurah: 46, startAyah: 1, surahNameAr: 'الأحقاف', surahNameEn: 'Al-Ahqaf' },
  { juz: 27, startSurah: 51, startAyah: 31, surahNameAr: 'الذاريات', surahNameEn: 'Adh-Dhariyat' },
  { juz: 28, startSurah: 58, startAyah: 1, surahNameAr: 'المجادلة', surahNameEn: 'Al-Mujadila' },
  { juz: 29, startSurah: 67, startAyah: 1, surahNameAr: 'الملك', surahNameEn: 'Al-Mulk' },
  { juz: 30, startSurah: 78, startAyah: 1, surahNameAr: 'النبأ', surahNameEn: 'An-Naba' },
];

export function stripBismillahPrefix(
  surahNumber: number,
  ayahNumberInSurah: number,
  textUthmani: string
): string {
  if (!textUthmani || surahNumber === 1 || surahNumber === 9 || ayahNumberInSurah !== 1) {
    return textUthmani;
  }
  const stripped = textUthmani
    .replace(/^بِسْمِ\s+ٱللَّهِ\s+ٱلرَّحْمَٰنِ\s+ٱلرَّحِيمِ\s*/u, '')
    .trim();
  return stripped.length > 0 ? stripped : textUthmani;
}

export function normalizeArabicSearch(input: string): string {
  return input
    .trim()
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function searchSurahs(query: string): SurahMeta[] {
  const trimmed = query.trim();
  if (!trimmed) return [...SURAH_INDEX];

  const normalizedQuery = normalizeArabicSearch(trimmed);
  const numericQuery = /^\d{1,3}$/.test(trimmed) ? Number.parseInt(trimmed, 10) : null;

  return SURAH_INDEX.filter((surah) => {
    if (numericQuery !== null && surah.number === numericQuery) return true;
    if (String(surah.number).includes(trimmed)) return true;
    if (normalizeArabicSearch(surah.nameAr).includes(normalizedQuery)) return true;
    if (surah.nameEn.toLowerCase().includes(trimmed.toLowerCase())) return true;
    return false;
  });
}

export function chunkAyahs(
  ayahs: QuranAyah[],
  chunkSize: 1 | 3,
  surahNumber = 0
): AyahChunk[] {
  if (!Array.isArray(ayahs) || ayahs.length === 0) return [];
  const chunks: AyahChunk[] = [];
  for (let i = 0; i < ayahs.length; i += chunkSize) {
    const slice = ayahs.slice(i, i + chunkSize);
    const startAyah = slice[0].numberInSurah;
    const endAyah = slice[slice.length - 1].numberInSurah;
    chunks.push({
      chunkKey: `${surahNumber}:${startAyah}-${endAyah}`,
      startAyah,
      endAyah,
      ayahs: slice,
    });
  }
  return chunks;
}

export function tokenizeAyahWords(text: string): string[] {
  if (!text) return [];
  return text
    .trim()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
}

function createSeededRandom(seed: number): () => number {
  let state = (Math.trunc(seed) >>> 0) || 1;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Method 1: 4-Stage Progressive Word Fade-Out (0% -> 30% -> 70% -> 100%).
 * Deterministic per seed so stage 70% is always a strict superset of stage 30%.
 */
export function computeWordMask(
  words: string[],
  stage: FadeStage,
  seed: number,
  revealedIndices?: ReadonlySet<number>
): MaskedWord[] {
  const count = words.length;
  if (count === 0) return [];

  let maskCount = 0;
  if (stage === 30) {
    maskCount = Math.min(count, Math.max(1, Math.round(count * 0.3)));
  } else if (stage === 70) {
    maskCount = Math.min(count, Math.max(1, Math.round(count * 0.7)));
  } else if (stage === 100) {
    maskCount = count;
  }

  const indices = Array.from({ length: count }, (_, idx) => idx);
  const rand = createSeededRandom(seed);
  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = indices[i];
    indices[i] = indices[j];
    indices[j] = tmp;
  }

  const maskedSet = new Set<number>(indices.slice(0, maskCount));

  return words.map((word, index) => {
    const isMaskedByStage = maskedSet.has(index);
    const temporarilyRevealed = Boolean(revealedIndices?.has(index));
    return {
      index,
      word,
      isMaskedByStage,
      temporarilyRevealed,
      isHidden: isMaskedByStage && !temporarilyRevealed,
    };
  });
}

/**
 * Method 2: The Ayah-Bridge Chain (Last N words of Ayah K -> First N words of Ayah K+1).
 */
export function buildAyahBridgeChain(ayahs: QuranAyah[], wordsPerSide = 2): AyahBridgeLink[] {
  if (!Array.isArray(ayahs) || ayahs.length < 2) return [];
  const safeCount = Math.max(1, Math.trunc(wordsPerSide));
  const links: AyahBridgeLink[] = [];

  for (let i = 0; i < ayahs.length - 1; i += 1) {
    const current = ayahs[i];
    const next = ayahs[i + 1];
    const currentTokens = tokenizeAyahWords(current.textUthmani);
    const nextTokens = tokenizeAyahWords(next.textUthmani);

    links.push({
      fromAyahNumber: current.numberInSurah,
      toAyahNumber: next.numberInSurah,
      tailWords: currentTokens.slice(-safeCount),
      headWords: nextTokens.slice(0, safeCount),
      fromAudioUrl: current.audioUrl,
      toAudioUrl: next.audioUrl,
    });
  }

  return links;
}

/**
 * Method 3: 3-3-3 Echo-Shadowing Loop state transition.
 */
export function advanceEchoShadowing(
  currentAyahIndex: number,
  currentRepeatIndex: number,
  totalAyahs: number,
  repeatCount: EchoRepeatCount,
  pauseSeconds: EchoPauseSeconds
): EchoStepResult {
  if (totalAyahs <= 0) {
    return {
      action: 'complete',
      nextAyahIndex: 0,
      nextRepeatIndex: 0,
      pauseMs: 0,
    };
  }

  const pauseMs = pauseSeconds * 1000;

  if (currentRepeatIndex + 1 < repeatCount) {
    return {
      action: pauseSeconds > 0 ? 'pause_then_replay' : 'replay_same',
      nextAyahIndex: currentAyahIndex,
      nextRepeatIndex: currentRepeatIndex + 1,
      pauseMs,
    };
  }

  if (currentAyahIndex + 1 < totalAyahs) {
    return {
      action: pauseSeconds > 0 ? 'pause_then_next' : 'next_ayah',
      nextAyahIndex: currentAyahIndex + 1,
      nextRepeatIndex: 0,
      pauseMs,
    };
  }

  return {
    action: 'complete',
    nextAyahIndex: currentAyahIndex,
    nextRepeatIndex: currentRepeatIndex,
    pauseMs,
  };
}

/**
 * Method 5: SM-2 Daily Wird Scheduler (1 -> 3 -> 7 -> 21 days ladder).
 */
export function computeNextWirdSchedule(
  prev: { repetitions: number; intervalDays: number; easeFactor: number },
  quality: WirdQuality
): { nextRepetitions: number; nextIntervalDays: number; nextEaseFactor: number } {
  const safeEase = Number.isFinite(prev.easeFactor) ? Math.max(1.3, prev.easeFactor) : 2.5;
  const safeRep = Number.isFinite(prev.repetitions) ? Math.max(0, Math.trunc(prev.repetitions)) : 0;
  const safeInterval = Number.isFinite(prev.intervalDays) ? Math.max(1, prev.intervalDays) : 1;

  if (quality === 'hard') {
    return {
      nextRepetitions: 0,
      nextIntervalDays: 1,
      nextEaseFactor: Math.max(1.3, Number((safeEase - 0.2).toFixed(2))),
    };
  }

  if (quality === 'good') {
    const nextIntervalDays =
      safeRep < WIRD_LADDER_DAYS.length
        ? WIRD_LADDER_DAYS[safeRep]
        : Math.max(21, Math.round(safeInterval * safeEase));
    return {
      nextRepetitions: safeRep + 1,
      nextIntervalDays,
      nextEaseFactor: Number(safeEase.toFixed(2)),
    };
  }

  // quality === 'easy'
  const nextEaseFactor = Math.min(3.0, Number((safeEase + 0.15).toFixed(2)));
  const easyIndex = Math.min(safeRep + 1, WIRD_LADDER_DAYS.length - 1);
  const nextIntervalDays =
    safeRep < WIRD_LADDER_DAYS.length - 1
      ? WIRD_LADDER_DAYS[easyIndex]
      : Math.max(21, Math.round(safeInterval * nextEaseFactor * 1.15));

  return {
    nextRepetitions: safeRep + 1,
    nextIntervalDays,
    nextEaseFactor,
  };
}

export function isValidReciterId(value: unknown): value is QuranReciterId {
  return value === 'ar.husary' || value === 'ar.minshawi' || value === 'ar.alafasy';
}

export function buildAyahAudioUrls(
  globalAyahNumber: number,
  reciterId: QuranReciterId = 'ar.husary'
): { primary: string | null; fallback: string | null } {
  if (!Number.isInteger(globalAyahNumber) || globalAyahNumber < 1 || globalAyahNumber > 6236) {
    return { primary: null, fallback: null };
  }
  const safeReciter: QuranReciterId = isValidReciterId(reciterId) ? reciterId : 'ar.husary';
  return {
    primary: `https://cdn.islamic.network/quran/audio/128/${safeReciter}/${globalAyahNumber}.mp3`,
    fallback: `https://cdn.islamic.network/quran/audio/64/${safeReciter}/${globalAyahNumber}.mp3`,
  };
}

const EVERY_AYAH_RECITER_FOLDERS: Record<QuranReciterId, string> = {
  'ar.husary': 'Husary_128kbps',
  'ar.minshawi': 'Minshawy_Murattal_128kbps',
  'ar.alafasy': 'Alafasy_128kbps',
};

export function buildEveryAyahUrl(
  surahNumber: number,
  ayahNumberInSurah: number,
  reciterId: QuranReciterId = 'ar.husary'
): string | null {
  if (
    !Number.isInteger(surahNumber) ||
    surahNumber < 1 ||
    surahNumber > 114 ||
    !Number.isInteger(ayahNumberInSurah) ||
    ayahNumberInSurah < 1 ||
    ayahNumberInSurah > 286
  ) {
    return null;
  }
  const safeReciter: QuranReciterId = isValidReciterId(reciterId) ? reciterId : 'ar.husary';
  const folder = EVERY_AYAH_RECITER_FOLDERS[safeReciter];
  const sss = String(surahNumber).padStart(3, '0');
  const aaa = String(ayahNumberInSurah).padStart(3, '0');
  return `https://everyayah.com/data/${folder}/${sss}${aaa}.mp3`;
}

export function buildAyahAudioFallbackChain(
  surahNumber: number,
  ayah: Pick<QuranAyah, 'number' | 'numberInSurah' | 'audioUrl' | 'audioFallbackUrl'>,
  reciterId: QuranReciterId = 'ar.husary'
): string[] {
  const urls: string[] = [];
  const pushUnique = (u: string | null | undefined) => {
    if (typeof u === 'string' && u.startsWith('https://') && !urls.includes(u)) {
      urls.push(u);
    }
  };

  const built = buildAyahAudioUrls(ayah.number, reciterId);
  pushUnique(built.primary);
  pushUnique(buildEveryAyahUrl(surahNumber, ayah.numberInSurah, reciterId));
  pushUnique(built.fallback);
  if (reciterId === 'ar.husary') {
    pushUnique(ayah.audioUrl);
    pushUnique(ayah.audioFallbackUrl);
  }
  return urls;
}

export function clampFontScale(value: unknown): number {
  const num = typeof value === 'number' && Number.isFinite(value) ? value : 1.0;
  return Math.max(1.0, Math.min(1.8, Math.round(num * 100) / 100));
}

export function createInitialHifzState(): QuranHifzStoreState {
  return {
    version: 1,
    lastSurahNumber: 1,
    lastAyahNumber: 1,
    fontSize: 'md',
    fontScale: 1.0,
    mushafTheme: 'dark',
    reciterId: 'ar.husary',
    bookmarks: {},
    wirdEntries: {},
  };
}

function getStorage(storageOverride?: Storage | null): Storage | null {
  if (storageOverride !== undefined) return storageOverride;
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

export function loadHifzState(storageOverride?: Storage | null): QuranHifzStoreState {
  const storage = getStorage(storageOverride);
  if (!storage) return createInitialHifzState();
  try {
    const raw = storage.getItem(QURAN_HIFZ_STORAGE_KEY);
    if (!raw) return createInitialHifzState();
    const parsed = JSON.parse(raw) as Partial<QuranHifzStoreState> | null;
    if (!parsed || typeof parsed !== 'object') return createInitialHifzState();
    return {
      version: 1,
      lastSurahNumber:
        typeof parsed.lastSurahNumber === 'number' &&
        parsed.lastSurahNumber >= 1 &&
        parsed.lastSurahNumber <= 114
          ? parsed.lastSurahNumber
          : 1,
      lastAyahNumber:
        typeof parsed.lastAyahNumber === 'number' &&
        parsed.lastAyahNumber >= 1 &&
        parsed.lastAyahNumber <= 286
          ? Math.floor(parsed.lastAyahNumber)
          : 1,
      fontSize:
        parsed.fontSize === 'sm' || parsed.fontSize === 'md' || parsed.fontSize === 'lg'
          ? parsed.fontSize
          : 'md',
      fontScale: clampFontScale(parsed.fontScale),
      mushafTheme: parsed.mushafTheme === 'light' ? 'light' : 'dark',
      reciterId: isValidReciterId(parsed.reciterId) ? parsed.reciterId : 'ar.husary',
      bookmarks:
        parsed.bookmarks && typeof parsed.bookmarks === 'object' ? parsed.bookmarks : {},
      wirdEntries:
        parsed.wirdEntries && typeof parsed.wirdEntries === 'object' ? parsed.wirdEntries : {},
    };
  } catch {
    return createInitialHifzState();
  }
}

export function toggleBookmark(
  state: QuranHifzStoreState,
  params: {
    surahNumber: number;
    ayahNumber: number;
    surahNameAr: string;
    surahNameEn: string;
    textUthmani: string;
  },
  nowMs = Date.now()
): { nextState: QuranHifzStoreState; added: boolean } {
  const key = `${params.surahNumber}:${params.ayahNumber}`;
  const currentBookmarks = state.bookmarks || {};
  if (currentBookmarks[key]) {
    const rest = { ...currentBookmarks };
    delete rest[key];
    return {
      added: false,
      nextState: {
        ...state,
        bookmarks: rest,
      },
    };
  }
  const excerpt = tokenizeAyahWords(params.textUthmani).slice(0, 6).join(' ');
  return {
    added: true,
    nextState: {
      ...state,
      bookmarks: {
        ...currentBookmarks,
        [key]: {
          key,
          surahNumber: params.surahNumber,
          ayahNumber: params.ayahNumber,
          surahNameAr: params.surahNameAr,
          surahNameEn: params.surahNameEn,
          excerpt,
          savedAt: nowMs,
        },
      },
    },
  };
}

export function saveHifzState(
  state: QuranHifzStoreState,
  storageOverride?: Storage | null
): void {
  const storage = getStorage(storageOverride);
  if (!storage) return;
  try {
    storage.setItem(QURAN_HIFZ_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors
  }
}

export function recordWirdReview(
  state: QuranHifzStoreState,
  params: {
    chunkKey: string;
    surahNumber: number;
    surahNameAr: string;
    surahNameEn: string;
    startAyah: number;
    endAyah: number;
    quality: WirdQuality;
  },
  nowMs = Date.now()
): QuranHifzStoreState {
  const existing = state.wirdEntries[params.chunkKey];
  const schedule = computeNextWirdSchedule(
    existing
      ? {
          repetitions: existing.repetitions,
          intervalDays: existing.intervalDays,
          easeFactor: existing.easeFactor,
        }
      : { repetitions: 0, intervalDays: 1, easeFactor: 2.5 },
    params.quality
  );

  const updatedEntry: QuranWirdEntry = {
    chunkKey: params.chunkKey,
    surahNumber: params.surahNumber,
    surahNameAr: params.surahNameAr,
    surahNameEn: params.surahNameEn,
    startAyah: params.startAyah,
    endAyah: params.endAyah,
    repetitions: schedule.nextRepetitions,
    intervalDays: schedule.nextIntervalDays,
    easeFactor: schedule.nextEaseFactor,
    lastReviewedAt: nowMs,
    nextReviewAt: nowMs + schedule.nextIntervalDays * DAY_MS,
  };

  return {
    ...state,
    lastSurahNumber: params.surahNumber,
    wirdEntries: {
      ...state.wirdEntries,
      [params.chunkKey]: updatedEntry,
    },
  };
}

export function getDueWirdItems(
  state: QuranHifzStoreState,
  nowMs = Date.now()
): QuranWirdEntry[] {
  return Object.values(state.wirdEntries)
    .filter((entry) => entry.nextReviewAt <= nowMs)
    .sort((a, b) => a.nextReviewAt - b.nextReviewAt);
}

function openSurahDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') {
      resolve(null);
      return;
    }
    try {
      const request = indexedDB.open(SURAH_CACHE_DB, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(SURAH_CACHE_STORE)) {
          db.createObjectStore(SURAH_CACHE_STORE, { keyPath: 'number' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function readCachedSurah(surahNumber: number): Promise<QuranSurahData | null> {
  const db = await openSurahDb();
  if (db) {
    const fromIdb = await new Promise<QuranSurahData | null>((resolve) => {
      try {
        const tx = db.transaction(SURAH_CACHE_STORE, 'readonly');
        const store = tx.objectStore(SURAH_CACHE_STORE);
        const req = store.get(surahNumber);
        req.onsuccess = () => {
          const val = req.result as QuranSurahData | undefined;
          resolve(val && Array.isArray(val.ayahs) && val.ayahs.length > 0 ? val : null);
        };
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
    if (fromIdb) return fromIdb;
  }

  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(`${SURAH_CACHE_LS_PREFIX}${surahNumber}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as QuranSurahData | null;
    return parsed && Array.isArray(parsed.ayahs) && parsed.ayahs.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export async function writeCachedSurah(surah: QuranSurahData): Promise<void> {
  const db = await openSurahDb();
  if (db) {
    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(SURAH_CACHE_STORE, 'readwrite');
        tx.objectStore(SURAH_CACHE_STORE).put(surah);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  const storage = getStorage();
  if (storage) {
    try {
      storage.setItem(`${SURAH_CACHE_LS_PREFIX}${surah.number}`, JSON.stringify(surah));
    } catch {
      // Ignore quota exceeded; IndexedDB remains primary cache
    }
  }
}

export async function listCachedSurahNumbers(): Promise<number[]> {
  const nums = new Set<number>();
  const db = await openSurahDb();
  if (db) {
    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(SURAH_CACHE_STORE, 'readonly');
        const req = tx.objectStore(SURAH_CACHE_STORE).getAllKeys();
        req.onsuccess = () => {
          if (Array.isArray(req.result)) {
            for (const key of req.result) {
              if (typeof key === 'number') nums.add(key);
            }
          }
          resolve();
        };
        req.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  const storage = getStorage();
  if (storage) {
    try {
      for (let i = 0; i < storage.length; i += 1) {
        const key = storage.key(i);
        if (key && key.startsWith(SURAH_CACHE_LS_PREFIX)) {
          const n = Number.parseInt(key.slice(SURAH_CACHE_LS_PREFIX.length), 10);
          if (Number.isInteger(n) && n >= 1 && n <= 114) nums.add(n);
        }
      }
    } catch {
      // Ignore
    }
  }

  return Array.from(nums).sort((a, b) => a - b);
}

interface AlQuranEditionAyahRaw {
  number?: number;
  numberInSurah?: number;
  juz?: number;
  page?: number;
  text?: string;
  audio?: string;
  audioSecondary?: string[];
}

interface AlQuranEditionDataRaw {
  number?: number;
  name?: string;
  englishName?: string;
  englishNameTranslation?: string;
  revelationType?: string;
  numberOfAyahs?: number;
  ayahs?: AlQuranEditionAyahRaw[];
  edition?: {
    identifier?: string;
  };
}

export function parseAlQuranMultiEditionResponse(
  payload: unknown,
  surahNumber: number
): QuranSurahData | null {
  if (!payload || typeof payload !== 'object') return null;
  const typed = payload as { code?: number; data?: AlQuranEditionDataRaw[] };
  if (typed.code !== 200 || !Array.isArray(typed.data)) return null;

  const editions = new Map<string, AlQuranEditionDataRaw>();
  for (const item of typed.data) {
    const id = item?.edition?.identifier;
    if (typeof id === 'string' && id) {
      editions.set(id, item);
    }
  }

  const uthmani = editions.get('quran-uthmani');
  if (!uthmani || !Array.isArray(uthmani.ayahs) || uthmani.ayahs.length === 0) {
    return null;
  }

  const husaryByAyah = new Map<number, AlQuranEditionAyahRaw>();
  for (const a of editions.get('ar.husary')?.ayahs ?? []) {
    if (typeof a.numberInSurah === 'number') husaryByAyah.set(a.numberInSurah, a);
  }

  const sahihByAyah = new Map<number, string>();
  for (const a of editions.get('en.sahih')?.ayahs ?? []) {
    if (typeof a.numberInSurah === 'number' && typeof a.text === 'string') {
      sahihByAyah.set(a.numberInSurah, a.text.trim());
    }
  }

  const muyassarByAyah = new Map<number, string>();
  for (const a of editions.get('ar.muyassar')?.ayahs ?? []) {
    if (typeof a.numberInSurah === 'number' && typeof a.text === 'string') {
      muyassarByAyah.set(a.numberInSurah, a.text.trim());
    }
  }

  const translitByAyah = new Map<number, string>();
  for (const a of editions.get('en.transliteration')?.ayahs ?? []) {
    if (typeof a.numberInSurah === 'number' && typeof a.text === 'string') {
      translitByAyah.set(a.numberInSurah, a.text.trim());
    }
  }

  const ayahs: QuranAyah[] = uthmani.ayahs.map((ayah, idx) => {
    const numberInSurah = typeof ayah.numberInSurah === 'number' ? ayah.numberInSurah : idx + 1;
    const globalNumber = typeof ayah.number === 'number' ? ayah.number : numberInSurah;
    const husary = husaryByAyah.get(numberInSurah);
    const defaultUrls = buildAyahAudioUrls(globalNumber, 'ar.husary');
    const primaryAudio =
      typeof husary?.audio === 'string' && husary.audio.startsWith('https://')
        ? husary.audio.trim()
        : defaultUrls.primary;
    const secondaryAudio = Array.isArray(husary?.audioSecondary)
      ? husary.audioSecondary.find((u) => typeof u === 'string' && u.startsWith('https://')) ??
        defaultUrls.fallback
      : defaultUrls.fallback;

    return {
      number: globalNumber,
      numberInSurah,
      juz: typeof ayah.juz === 'number' ? ayah.juz : 1,
      page: typeof ayah.page === 'number' ? ayah.page : 1,
      textUthmani: typeof ayah.text === 'string' ? ayah.text.trim() : '',
      audioUrl: primaryAudio,
      audioFallbackUrl: secondaryAudio && secondaryAudio !== primaryAudio ? secondaryAudio : defaultUrls.fallback,
      tafsirMuyassar: muyassarByAyah.get(numberInSurah) ?? '',
      translationEn: sahihByAyah.get(numberInSurah) ?? '',
      transliterationEn: translitByAyah.get(numberInSurah) ?? '',
    };
  });

  return {
    number: uthmani.number ?? surahNumber,
    name: uthmani.name ?? '',
    englishName: uthmani.englishName ?? '',
    englishNameTranslation: uthmani.englishNameTranslation ?? '',
    revelationType: uthmani.revelationType ?? 'Meccan',
    numberOfAyahs: uthmani.numberOfAyahs ?? ayahs.length,
    ayahs,
  };
}

function getBundledSurahUrl(surahNumber: number): string {
  if (typeof window !== 'undefined' && window.location) {
    const protocol = window.location.protocol;
    if (protocol === 'http:' || protocol === 'https:') {
      return `${window.location.origin}/data/quran/${surahNumber}.json`;
    }
  }
  if (typeof document !== 'undefined' && typeof document.baseURI === 'string') {
    try {
      return new URL(`data/quran/${surahNumber}.json`, document.baseURI).toString();
    } catch {
      // Fall through
    }
  }
  return `/data/quran/${surahNumber}.json`;
}

export async function fetchSurahWithCache(
  surahNumber: number,
  options?: {
    apiBaseUrl?: string;
    fetchImpl?: typeof fetch;
    forceRefresh?: boolean;
  }
): Promise<{ data: QuranSurahData; fromCache: boolean }> {
  if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) {
    throw new Error('INVALID_SURAH_NUMBER');
  }

  // Layer 1: Local IndexedDB / localStorage cache
  if (!options?.forceRefresh) {
    const cached = await readCachedSurah(surahNumber);
    if (cached) {
      return { data: cached, fromCache: true };
    }
  }

  const fetchFn = options?.fetchImpl ?? (typeof fetch !== 'undefined' ? fetch : null);
  if (!fetchFn) {
    throw new Error('FETCH_UNAVAILABLE');
  }

  // Layer 2: Bundled 100%-offline local Mushaf JSON (public/data/quran/<n>.json)
  if (!options?.forceRefresh) {
    try {
      const localRes = await fetchFn(getBundledSurahUrl(surahNumber), {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      if (localRes.ok) {
        const localSurah = (await localRes.json().catch(() => null)) as QuranSurahData | null;
        if (localSurah && Array.isArray(localSurah.ayahs) && localSurah.ayahs.length > 0) {
          await writeCachedSurah(localSurah);
          return { data: localSurah, fromCache: true };
        }
      }
    } catch {
      // Fall through to remote proxy / direct API
    }
  }

  // Layer 3: App Vercel API proxy (never use relative '/api/quran/surah' — always absolute API_BASE_URL)
  const base = (options?.apiBaseUrl ?? API_BASE_URL).replace(/\/+$/, '');
  if (base) {
    try {
      const endpoint = `${base}/api/quran/surah?surah=${surahNumber}`;
      const response = await fetchFn(endpoint, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      if (response.ok) {
        const json = (await response.json().catch(() => null)) as {
          ok?: boolean;
          surah?: QuranSurahData;
        } | null;
        if (json?.ok && json.surah && Array.isArray(json.surah.ayahs) && json.surah.ayahs.length > 0) {
          await writeCachedSurah(json.surah);
          return { data: json.surah, fromCache: false };
        }
      }
    } catch {
      // Fall through to direct AlQuran.cloud API
    }
  }

  // Layer 4: Direct AlQuran.cloud multi-edition fallback
  try {
    const directUrl = `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,ar.husary,en.sahih,ar.muyassar,en.transliteration`;
    const directRes = await fetchFn(directUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (directRes.ok) {
      const directJson = await directRes.json().catch(() => null);
      const parsed = parseAlQuranMultiEditionResponse(directJson, surahNumber);
      if (parsed && parsed.ayahs.length > 0) {
        await writeCachedSurah(parsed);
        return { data: parsed, fromCache: false };
      }
    }
  } catch {
    // Fall through to final local/cache fallback
  }

  // Last-resort offline fallback even when forceRefresh was true
  try {
    const localRes = await fetchFn(getBundledSurahUrl(surahNumber), {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (localRes.ok) {
      const localSurah = (await localRes.json().catch(() => null)) as QuranSurahData | null;
      if (localSurah && Array.isArray(localSurah.ayahs) && localSurah.ayahs.length > 0) {
        await writeCachedSurah(localSurah);
        return { data: localSurah, fromCache: true };
      }
    }
  } catch {
    // Ignore
  }

  throw new Error('SURAH_UNAVAILABLE');
}

export interface QuranVerseSearchHit {
  surahNumber: number;
  surahNameAr: string;
  surahNameEn: string;
  ayahNumber: number;
  textUthmani: string;
}

interface IndexedSearchVerse {
  surahNumber: number;
  ayahNumber: number;
  textUthmani: string;
  normalized: string;
}

let verseSearchCorpusPromise: Promise<IndexedSearchVerse[]> | null = null;
let verseSearchCorpusCache: IndexedSearchVerse[] | null = null;

export function resetVerseSearchCorpusCache(): void {
  verseSearchCorpusPromise = null;
  verseSearchCorpusCache = null;
}

async function loadVerseSearchCorpus(fetchImpl?: typeof fetch): Promise<IndexedSearchVerse[]> {
  if (verseSearchCorpusCache) return verseSearchCorpusCache;
  if (verseSearchCorpusPromise && !fetchImpl) return verseSearchCorpusPromise;

  const fetchFn = fetchImpl ?? (typeof fetch !== 'undefined' ? fetch : null);
  if (!fetchFn) return [];

  const loader = (async () => {
    const entries: IndexedSearchVerse[] = [];
    const batchSize = 12;
    for (let start = 1; start <= 114; start += batchSize) {
      const end = Math.min(114, start + batchSize - 1);
      const batchNums: number[] = [];
      for (let s = start; s <= end; s += 1) batchNums.push(s);

      const results = await Promise.all(
        batchNums.map(async (surahNum) => {
          try {
            const res = await fetchFn(getBundledSurahUrl(surahNum), {
              method: 'GET',
              headers: { Accept: 'application/json' },
            });
            if (!res.ok) return null;
            const parsed = (await res.json().catch(() => null)) as QuranSurahData | null;
            return parsed && Array.isArray(parsed.ayahs) ? parsed : null;
          } catch {
            return null;
          }
        })
      );

      for (const surah of results) {
        if (!surah) continue;
        for (const ayah of surah.ayahs) {
          const cleanText = stripBismillahPrefix(surah.number, ayah.numberInSurah, ayah.textUthmani);
          entries.push({
            surahNumber: surah.number,
            ayahNumber: ayah.numberInSurah,
            textUthmani: cleanText,
            normalized: normalizeArabicSearch(cleanText),
          });
        }
      }
    }

    if (entries.length > 0 && !fetchImpl) {
      verseSearchCorpusCache = entries;
    }
    return entries;
  })();

  if (!fetchImpl) {
    verseSearchCorpusPromise = loader;
  }
  return loader;
}

export async function searchQuranVersesOffline(
  query: string,
  options?: { limit?: number; fetchImpl?: typeof fetch }
): Promise<QuranVerseSearchHit[]> {
  const normalizedQuery = normalizeArabicSearch(query);
  if (normalizedQuery.length < 2) return [];
  if (/^\d+$/.test(normalizedQuery)) return [];

  const limit = options?.limit ?? 30;
  const corpus = await loadVerseSearchCorpus(options?.fetchImpl);
  const hits: QuranVerseSearchHit[] = [];

  for (const item of corpus) {
    if (item.normalized.includes(normalizedQuery)) {
      const meta = getSurahMeta(item.surahNumber);
      hits.push({
        surahNumber: item.surahNumber,
        surahNameAr: meta?.nameAr ?? String(item.surahNumber),
        surahNameEn: meta?.nameEn ?? `Surah ${item.surahNumber}`,
        ayahNumber: item.ayahNumber,
        textUthmani: item.textUthmani,
      });
      if (hits.length >= limit) break;
    }
  }

  return hits;
}
