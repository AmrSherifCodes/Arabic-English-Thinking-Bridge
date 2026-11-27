// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  FEATURED_SURAH_NUMBERS,
  JUZ_AMMA_RANGE,
  QURAN_HIFZ_STORAGE_KEY,
  QURAN_RECITERS,
  QuranAyah,
  SURAH_INDEX,
  WIRD_LADDER_DAYS,
  advanceEchoShadowing,
  buildAyahAudioUrls,
  buildAyahBridgeChain,
  chunkAyahs,
  computeNextWirdSchedule,
  computeWordMask,
  createInitialHifzState,
  fetchSurahWithCache,
  getDueWirdItems,
  getPinnedSurahs,
  loadHifzState,
  recordWirdReview,
  saveHifzState,
  searchSurahs,
  toggleBookmark,
  tokenizeAyahWords,
} from './hifzEngine';
import { HIFZ_PSYCHOLOGY_TIPS, getTipOfTheDay } from './hifzPsychologyTips';
import { clearLocalLearningDataPreservingEntitlement } from '../../services/entitlementService';

function createMemoryStorage(initial: Record<string, string> = {}): Storage {
  const map = new Map<string, string>(Object.entries(initial));
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.has(key) ? map.get(key)! : null;
    },
    key(index: number) {
      return Array.from(map.keys())[index] ?? null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    },
  };
}

function makeSyntheticAyah(numberInSurah: number, textUthmani: string): QuranAyah {
  return {
    number: numberInSurah,
    numberInSurah,
    juz: 30,
    page: 600,
    textUthmani,
    audioUrl: `https://cdn.islamic.network/quran/audio/128/ar.husary/${numberInSurah}.mp3`,
    audioFallbackUrl: null,
    tafsirMuyassar: `تفسير تجريبي رقم ${numberInSurah}`,
    translationEn: `Synthetic meaning ${numberInSurah}`,
    transliterationEn: `Kalimah ${numberInSurah}`,
  };
}

test('1. Method 1 — 4-Stage Progressive Word Fade-Out masking is deterministic and monotonic', () => {
  const words = tokenizeAyahWords('كلمة أولى ثانية ثالثة رابعة خامسة سادسة سابعة ثامنة عاشرة');
  assert.equal(words.length, 10);

  const stage0 = computeWordMask(words, 0, 42);
  assert.equal(stage0.filter((w) => w.isMaskedByStage).length, 0);

  const stage30A = computeWordMask(words, 30, 42);
  const stage30B = computeWordMask(words, 30, 42);
  assert.equal(stage30A.filter((w) => w.isMaskedByStage).length, 3);
  assert.deepEqual(
    stage30A.map((w) => w.isMaskedByStage),
    stage30B.map((w) => w.isMaskedByStage)
  );

  const stage70 = computeWordMask(words, 70, 42);
  assert.equal(stage70.filter((w) => w.isMaskedByStage).length, 7);

  // Monotonic superset: every word masked at 30% must also be masked at 70%
  for (let i = 0; i < words.length; i += 1) {
    if (stage30A[i].isMaskedByStage) {
      assert.equal(stage70[i].isMaskedByStage, true);
    }
  }

  const stage100 = computeWordMask(words, 100, 42);
  assert.equal(stage100.filter((w) => w.isHidden).length, 10);

  // 2-second tap-to-reveal override
  const revealed = new Set<number>([stage100[2].index]);
  const withPeek = computeWordMask(words, 100, 42, revealed);
  assert.equal(withPeek[2].isMaskedByStage, true);
  assert.equal(withPeek[2].temporarilyRevealed, true);
  assert.equal(withPeek[2].isHidden, false);

  // Empty edge case
  assert.deepEqual(computeWordMask([], 70, 42), []);
});

test('2. Method 2 — Ayah-Bridge Chain extracts tail-to-head word links across consecutive ayahs', () => {
  const ayahs = [
    makeSyntheticAyah(1, 'بداية أولى وسط نهاية_أولى ختام_أول'),
    makeSyntheticAyah(2, 'رأس_ثان كلمة_ثانية وسط_ثان نهاية_ثانية ختام_ثان'),
    makeSyntheticAyah(3, 'مفردة'),
  ];

  const links = buildAyahBridgeChain(ayahs, 2);
  assert.equal(links.length, 2);
  assert.equal(links[0].fromAyahNumber, 1);
  assert.equal(links[0].toAyahNumber, 2);
  assert.deepEqual(links[0].tailWords, ['نهاية_أولى', 'ختام_أول']);
  assert.deepEqual(links[0].headWords, ['رأس_ثان', 'كلمة_ثانية']);

  assert.equal(links[1].fromAyahNumber, 2);
  assert.equal(links[1].toAyahNumber, 3);
  assert.deepEqual(links[1].tailWords, ['نهاية_ثانية', 'ختام_ثان']);
  assert.deepEqual(links[1].headWords, ['مفردة']);

  assert.deepEqual(buildAyahBridgeChain([ayahs[0]], 2), []);
  assert.deepEqual(buildAyahBridgeChain([], 2), []);

  const chunks = chunkAyahs(ayahs, 3, 1);
  assert.equal(chunks.length, 1);
  assert.equal(chunks[0].chunkKey, '1:1-3');
});

test('3. Method 3 — 3-3-3 Echo-Shadowing transitions respect 1x/3x/5x repeats and 0s/3s/5s gaps', () => {
  // Repeat 1 of 3 with 3s pause -> pauses then replays same ayah
  const step1 = advanceEchoShadowing(0, 0, 2, 3, 3);
  assert.deepEqual(step1, {
    action: 'pause_then_replay',
    nextAyahIndex: 0,
    nextRepeatIndex: 1,
    pauseMs: 3000,
  });

  // Final repeat of ayah 0 -> pauses 5s then advances to ayah 1
  const step2 = advanceEchoShadowing(0, 2, 2, 3, 5);
  assert.deepEqual(step2, {
    action: 'pause_then_next',
    nextAyahIndex: 1,
    nextRepeatIndex: 0,
    pauseMs: 5000,
  });

  // No pause gap (0s) -> immediate replay or next
  const stepNoGap = advanceEchoShadowing(0, 0, 2, 5, 0);
  assert.deepEqual(stepNoGap, {
    action: 'replay_same',
    nextAyahIndex: 0,
    nextRepeatIndex: 1,
    pauseMs: 0,
  });

  // Final repeat of final ayah -> complete
  const stepEnd = advanceEchoShadowing(1, 0, 2, 1, 3);
  assert.deepEqual(stepEnd, {
    action: 'complete',
    nextAyahIndex: 1,
    nextRepeatIndex: 0,
    pauseMs: 3000,
  });
});

test('4. Method 5 — Daily Wird SM-2 follows 1->3->7->21 day ladder and persists across reset', () => {
  assert.deepEqual(Array.from(WIRD_LADDER_DAYS), [1, 3, 7, 21]);

  let rep = 0;
  let interval = 1;
  let ease = 2.5;
  const intervals: number[] = [];

  for (let i = 0; i < 4; i += 1) {
    const res = computeNextWirdSchedule({ repetitions: rep, intervalDays: interval, easeFactor: ease }, 'good');
    intervals.push(res.nextIntervalDays);
    rep = res.nextRepetitions;
    interval = res.nextIntervalDays;
    ease = res.nextEaseFactor;
  }
  assert.deepEqual(intervals, [1, 3, 7, 21]);

  // Hard resets to 1 day
  const hardRes = computeNextWirdSchedule({ repetitions: 3, intervalDays: 21, easeFactor: 2.5 }, 'hard');
  assert.equal(hardRes.nextRepetitions, 0);
  assert.equal(hardRes.nextIntervalDays, 1);

  const storage = createMemoryStorage({
    'tb.progressionState': '{"xp":200}',
  });
  const now = Date.parse('2026-11-24T06:00:00.000Z');
  let state = createInitialHifzState();
  state = recordWirdReview(
    state,
    {
      chunkKey: '112:1-4',
      surahNumber: 112,
      surahNameAr: 'الإخلاص',
      surahNameEn: 'Al-Ikhlas',
      startAyah: 1,
      endAyah: 4,
      quality: 'good',
    },
    now
  );
  saveHifzState(state, storage);
  assert.notEqual(storage.getItem(QURAN_HIFZ_STORAGE_KEY), null);

  // Due check 2 days later
  const due = getDueWirdItems(loadHifzState(storage), now + 2 * 86_400_000);
  assert.equal(due.length, 1);
  assert.equal(due[0].chunkKey, '112:1-4');

  // Preserve tb.quranHifz.v1 when clearing local learning data
  clearLocalLearningDataPreservingEntitlement(storage);
  assert.equal(storage.getItem('tb.progressionState'), null);
  assert.notEqual(storage.getItem(QURAN_HIFZ_STORAGE_KEY), null);
});

test('5. 114-Surah index, Quick-Start curation, and Arabic/English search', () => {
  assert.equal(SURAH_INDEX.length, 114);
  const { featured, juzAmma } = getPinnedSurahs();
  assert.deepEqual(
    featured.map((s) => s.number),
    Array.from(FEATURED_SURAH_NUMBERS)
  );
  assert.equal(juzAmma[0].number, JUZ_AMMA_RANGE.start);
  assert.equal(juzAmma[juzAmma.length - 1].number, JUZ_AMMA_RANGE.end);
  assert.equal(juzAmma.length, 37);

  assert.equal(searchSurahs('الكهف').some((s) => s.number === 18), true);
  assert.equal(searchSurahs('mulk').some((s) => s.number === 67), true);
  assert.equal(searchSurahs('114').some((s) => s.number === 114), true);
});

test('6. Guardrails — 5 Psychological tips present, zero Web Speech TTS & zero monetization inside Sanctuary', () => {
  assert.equal(HIFZ_PSYCHOLOGY_TIPS.length, 5);
  assert.ok(getTipOfTheDay(0).titleAr.length > 0);

  const quranDir = path.resolve(process.cwd(), 'src/features/quran');
  const files = fs
    .readdirSync(quranDir)
    .filter((name) => (name.endsWith('.ts') || name.endsWith('.tsx')) && !name.endsWith('.test.ts'));

  for (const file of files) {
    const content = fs.readFileSync(path.join(quranDir, file), 'utf8');
    assert.equal(content.includes('speechSynthesis'), false, `${file} must never use browser TTS`);
    assert.equal(content.includes('TextToSpeech'), false, `${file} must never use Capacitor TTS`);
    assert.equal(content.includes('DualSpeedAudio'), false, `${file} must never use DualSpeedAudio`);
    assert.equal(content.includes('offlineTts'), false, `${file} must never use offlineTts`);
    assert.equal(content.includes('Bridge Coins'), false, `${file} must never include Bridge Coins`);
    assert.equal(content.includes('SupporterGate'), false, `${file} must never include paywalls`);
    assert.equal(content.includes('ProArcade'), false, `${file} must never include Pro locks`);
  }
});

test('7. Offline 114-Surah Mushaf bundle integrity (6,236 ayahs, Tafsir, Sahih EN & audio URLs)', () => {
  const quranDataDir = path.resolve(process.cwd(), 'public/data/quran');
  assert.ok(fs.existsSync(quranDataDir), 'public/data/quran directory must exist');

  let totalAyahs = 0;
  for (let s = 1; s <= 114; s += 1) {
    const filePath = path.join(quranDataDir, `${s}.json`);
    assert.ok(fs.existsSync(filePath), `Missing offline surah file ${s}.json`);
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8')) as {
      number: number;
      ayahs: QuranAyah[];
    };
    assert.equal(parsed.number, s);
    assert.ok(Array.isArray(parsed.ayahs) && parsed.ayahs.length > 0, `Surah ${s} must have ayahs`);
    for (const a of parsed.ayahs) {
      assert.ok(a.textUthmani.trim().length > 0, `Surah ${s}:${a.numberInSurah} empty Uthmani text`);
      assert.ok(a.number >= 1 && a.number <= 6236, `Invalid global ayah number ${a.number}`);
      assert.ok(a.audioUrl && a.audioUrl.startsWith('https://cdn.islamic.network/'));
    }
    totalAyahs += parsed.ayahs.length;
  }
  assert.equal(totalAyahs, 6236);
});

test('8. Reciter audio URL builder, bookmarks persistence, and 4-layer offline fetch fallback', async () => {
  assert.ok(QURAN_RECITERS.length >= 4);
  for (const reciter of QURAN_RECITERS) {
    const urls = buildAyahAudioUrls(1, reciter.id);
    assert.equal(urls.primary, `https://cdn.islamic.network/quran/audio/128/${reciter.id}/1.mp3`);
    assert.equal(urls.fallback, `https://cdn.islamic.network/quran/audio/64/${reciter.id}/1.mp3`);
  }
  assert.deepEqual(buildAyahAudioUrls(0, 'ar.husary'), { primary: null, fallback: null });

  const storage = createMemoryStorage();
  let state = createInitialHifzState();
  const res1 = toggleBookmark(state, {
    surahNumber: 18,
    ayahNumber: 10,
    surahNameAr: 'الكهف',
    surahNameEn: 'Al-Kahf',
    textUthmani: 'إِذْ أَوَى ٱلْفِتْيَةُ إِلَى ٱلْكَهْفِ',
  });
  assert.equal(res1.added, true);
  state = res1.nextState;
  saveHifzState(state, storage);
  const reloaded = loadHifzState(storage);
  assert.ok(reloaded.bookmarks['18:10']);

  const res2 = toggleBookmark(reloaded, {
    surahNumber: 18,
    ayahNumber: 10,
    surahNameAr: 'الكهف',
    surahNameEn: 'Al-Kahf',
    textUthmani: 'إِذْ أَوَى ٱلْفِتْيَةُ إِلَى ٱلْكَهْفِ',
  });
  assert.equal(res2.added, false);
  assert.equal(res2.nextState.bookmarks['18:10'], undefined);

  // Verify bundled local JSON layer resolves even when remote endpoints fail
  const surah1Raw = fs.readFileSync(path.resolve(process.cwd(), 'public/data/quran/1.json'), 'utf8');
  const fetched = await fetchSurahWithCache(1, {
    forceRefresh: true,
    apiBaseUrl: 'https://invalid.example',
    fetchImpl: (async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('data/quran/1.json')) {
        return new Response(surah1Raw, { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      throw new Error('OFFLINE');
    }) as typeof fetch,
  });
  assert.equal(fetched.data.number, 1);
  assert.equal(fetched.data.ayahs.length, 7);
});
