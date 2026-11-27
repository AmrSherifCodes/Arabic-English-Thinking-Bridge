// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import { useState, useEffect } from 'react';
import { TARGET_LANGUAGE_META } from '../data/languages';
import { DualSpeedAudio } from '../components/DualSpeedAudio';
import { ArabicPhraseAssist } from '../components/ArabicPhraseAssist';

const DICTIONARY_STARTER_CATEGORIES = [
  { id: 'greetings', ar: '👋 تحيات', en: '👋 Greetings', query: 'hello' },
  { id: 'water', ar: '💧 طعام وشراب', en: '💧 Food & Drink', query: 'water' },
  { id: 'travel', ar: '✈️ سفر', en: '✈️ Travel', query: 'airport' },
  { id: 'work', ar: '💼 بيئة العمل', en: '💼 Work', query: 'meeting' },
  { id: 'daily', ar: '🏠 يوميات', en: '🏠 Daily', query: 'time' },
];

export interface DictionaryViewProps {
  onBack: () => void;
  isArabic: boolean;
  targetLang: string;
}

/**
 * Offline-first deduplicated Talking Dictionary with starter category chips,
 * recent query persistence, and dual-speed audio (1.0x + 🐢 0.75x).
 */
export function DictionaryView({ onBack, isArabic, targetLang }: DictionaryViewProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentQueries, setRecentQueries] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('tb.recentDictQueries.v10');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.slice(0, 6) : ['hello', 'thank', 'water'];
    } catch {
      return ['hello', 'thank', 'water'];
    }
  });

  useEffect(() => {
    let active = true;
    import('../data/dictionaries')
      .then(({ getTargetDictionaryAsync }) => getTargetDictionaryAsync(targetLang))
      .catch(() => {
        if (active) setResults([]);
      });
    return () => {
      active = false;
    };
  }, [targetLang]);

  useEffect(() => {
    let active = true;
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = window.setTimeout(() => {
      import('../data/dictionaries')
        .then(({ searchTargetDictionaryAsync }) =>
          searchTargetDictionaryAsync(trimmed, targetLang as any, 'ar', 30).then((res) => {
            if (!active) return;
            // Deduplicate by normalized display word so "hello" never appears multiple times
            const seen = new Set<string>();
            const deduped: any[] = [];
            for (const entry of res) {
              const rawWord = (entry.word || entry.term || entry.germanWord || entry.arabicWord || '').trim();
              const normKey = rawWord.toLowerCase().replace(/[.,!?;:()]/g, '').trim();
              if (!normKey || seen.has(normKey)) continue;
              seen.add(normKey);
              deduped.push(entry);
              if (deduped.length >= 15) break;
            }
            setResults(deduped);
            setLoading(false);
            if (deduped.length > 0 && trimmed.length >= 2) {
              setRecentQueries((prev) => {
                const next = [trimmed, ...prev.filter((q) => q.toLowerCase() !== trimmed.toLowerCase())].slice(0, 6);
                try {
                  localStorage.setItem('tb.recentDictQueries.v10', JSON.stringify(next));
                } catch {
                  // Ignore storage errors
                }
                return next;
              });
            }
          })
        )
        .catch(() => {
          if (active) {
            setResults([]);
            setLoading(false);
          }
        });
    }, 150);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query, targetLang]);

  return (
    <div
      className="min-h-[100dvh] pb-safe"
      style={{ backgroundColor: 'var(--bg)', color: 'var(--ink)' }}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <header
        className="sticky top-0 z-40 backdrop-blur-md border-b px-4 sm:px-6 pb-3 pt-safe"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
          <button
            onClick={onBack}
            className="px-4 py-2 min-h-[52px] rounded-2xl border text-[#22D3EE] font-black text-sm cursor-pointer shrink-0 whitespace-nowrap"
            style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
          >
            {isArabic ? '→ رجوع' : '← Back'}
          </button>
          <h2 className="text-base font-black text-[#F8FAFC] leading-snug break-words">
            {isArabic ? '📖 القاموس الناطق' : 'Talking Dictionary'}
          </h2>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-5">
        {/* Live Search Bar */}
        <div
          className="p-4 rounded-3xl border space-y-3 shadow-xl"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <label className="text-xs font-bold text-[#CBD5E1] block">
            {isArabic
              ? `ابحث عن أي كلمة (${TARGET_LANGUAGE_META[targetLang as keyof typeof TARGET_LANGUAGE_META]?.nameAr || targetLang} أو عربي) بدون إنترنت:`
              : 'Search offline dictionary (instant, zero internet):'}
          </label>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isArabic ? 'اكتب كلمة للبحث (مثل: hello, water, سلام)...' : 'Type to search...'}
              className="w-full px-4 py-3 rounded-2xl border text-[#F8FAFC] placeholder:text-[#CBD5E1]/60 text-sm focus:outline-none focus:ring-2 focus:ring-[#22D3EE]"
              style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label={isArabic ? 'مسح البحث' : 'Clear search'}
                className="absolute end-1 top-1/2 -translate-y-1/2 min-h-[48px] min-w-[48px] flex items-center justify-center text-[#CBD5E1] hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Results List or Quick-Tap Starter Categories & Recent Words */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-[#22D3EE] font-bold text-sm">
              {isArabic ? 'جاري البحث في القاموس المحلي...' : 'Searching offline dictionary...'}
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {results.map((entry, idx) => {
                const rawWord = (entry.word || entry.term || entry.germanWord || entry.arabicWord || '').trim();
                const arMeaning = (entry.arabicWord || entry.translationAr || entry.translation || entry.englishTranslation || '').trim();
                const enMeaning = (entry.englishTranslation || entry.translation || entry.arabicWord || '').trim();
                const translation = isArabic ? arMeaning : enMeaning;
                const rawPhonetic = (entry.phoneticAr || entry.phonetic || entry.reading || entry.romaji || '').trim();
                const wLower = rawWord.toLowerCase();
                const pLower = rawPhonetic.toLowerCase();
                const phonetic =
                  rawPhonetic &&
                  pLower !== wLower &&
                  pLower !== `[${wLower}]` &&
                  pLower !== `(${wLower})` &&
                  pLower !== `([${wLower}])`
                    ? rawPhonetic
                    : '';
                const isWordArabic = /[\u0600-\u06FF]/.test(rawWord);
                const audioText =
                  targetLang === 'en' && isWordArabic && enMeaning
                    ? enMeaning.split(/[;,()]/)[0].replace(/^to\s+/i, '').trim() || rawWord
                    : rawWord.replace(/\s*\([^)]*\)/g, '').trim();
                const displayWord = targetLang === 'en' && isWordArabic ? audioText : rawWord;

                return (
                  <div
                    key={`${displayWord}-${idx}`}
                    className="p-4 rounded-2xl border shadow-md flex items-center justify-between gap-4"
                    style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                  >
                    <div className="space-y-1 text-start min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-base text-[#22D3EE] font-sans" dir="ltr">
                          {displayWord}
                        </span>
                        {phonetic && <span className="text-xs text-[#FBBF24] font-medium">({phonetic})</span>}
                      </div>
                      <p className="text-sm text-[#F8FAFC] font-bold leading-relaxed">{translation}</p>
                      {!isArabic && translation && <ArabicPhraseAssist phrase={translation} compact />}
                    </div>
                    <div className="shrink-0">
                      <DualSpeedAudio text={audioText} showLabels={false} targetLang={targetLang} isArabic={isArabic} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : query.trim() ? (
            <div
              className="p-6 rounded-3xl border text-center space-y-2"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'rgba(245, 158, 11, 0.4)' }}
            >
              <span className="text-2xl">🔍</span>
              <p className="text-sm font-bold text-[#FBBF24]">
                {isArabic
                  ? 'مش لاقي الكلمة دي في القاموس المحلي حالياً — جرّب كلمة أبسط أو بدون تشكيل'
                  : 'No local match found — try a simpler root word.'}
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Starter Categories */}
              <div
                className="p-4 rounded-3xl border space-y-3 text-start"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <h3 className="text-xs font-black text-[#CBD5E1]">
                  {isArabic ? '✨ تصنيفات سريعة للبدء' : '✨ Starter Categories'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {DICTIONARY_STARTER_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setQuery(cat.query)}
                      className="min-h-[48px] px-4 py-2.5 rounded-2xl border text-xs font-black text-[#F8FAFC] cursor-pointer transition active:scale-95 hover:border-[#10B981]"
                      style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
                    >
                      {isArabic ? cat.ar : cat.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Words Chips */}
              {recentQueries.length > 0 && (
                <div
                  className="p-4 rounded-3xl border space-y-3 text-start"
                  style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                >
                  <h3 className="text-xs font-black text-[#CBD5E1]">
                    {isArabic ? '🕒 كلمات بحثت عنها مؤخراً' : '🕒 Recent Words'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {recentQueries.map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setQuery(w)}
                        className="min-h-[48px] px-4 py-2 rounded-xl border text-xs font-bold text-[#22D3EE] cursor-pointer transition active:scale-95"
                        style={{ backgroundColor: 'var(--bg)', borderColor: 'rgba(34, 211, 238, 0.35)' }}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
