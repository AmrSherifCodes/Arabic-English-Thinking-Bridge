// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import type { VercelRequest, VercelResponse } from '@vercel/node';

interface AlQuranEditionAyah {
  number?: number;
  numberInSurah?: number;
  juz?: number;
  page?: number;
  text?: string;
  audio?: string;
  audioSecondary?: string[];
}

interface AlQuranEditionData {
  number?: number;
  name?: string;
  englishName?: string;
  englishNameTranslation?: string;
  revelationType?: string;
  numberOfAyahs?: number;
  ayahs?: AlQuranEditionAyah[];
  edition?: {
    identifier?: string;
  };
}

interface AlQuranMultiEditionResponse {
  code?: number;
  status?: string;
  data?: AlQuranEditionData[];
}

const ALLOWED_AUDIO_PREFIXES = [
  'https://cdn.islamic.network/',
  'https://cdn.alquran.cloud/',
] as const;

function sendJson(res: VercelResponse, statusCode: number, payload: unknown): void {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    res.status(statusCode).json(payload);
    return;
  }
  res.statusCode = statusCode;
  if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
  }
  res.end(JSON.stringify(payload));
}

function sendEmpty(res: VercelResponse, statusCode: number): void {
  if (typeof res.status === 'function') {
    res.status(statusCode).end();
    return;
  }
  res.statusCode = statusCode;
  res.end();
}

function parseSurahNumber(req: VercelRequest): number | null {
  let raw: string | undefined;
  const queryVal = req?.query?.number;
  if (typeof queryVal === 'string') {
    raw = queryVal;
  } else if (Array.isArray(queryVal) && typeof queryVal[0] === 'string') {
    raw = queryVal[0];
  } else if (typeof req?.url === 'string') {
    try {
      const parsed = new URL(req.url, 'https://localhost');
      raw = parsed.searchParams.get('number') ?? undefined;
    } catch {
      raw = undefined;
    }
  }

  if (!raw || !/^\d{1,3}$/.test(raw.trim())) {
    return null;
  }
  const num = Number.parseInt(raw.trim(), 10);
  if (!Number.isInteger(num) || num < 1 || num > 114) {
    return null;
  }
  return num;
}

function sanitizeAudioUrl(url: unknown): string | null {
  if (typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (ALLOWED_AUDIO_PREFIXES.some((prefix) => trimmed.startsWith(prefix))) {
    return trimmed;
  }
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (typeof res.setHeader === 'function') {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
  }

  const method = req?.method || 'GET';
  if (method !== 'GET' && method !== 'HEAD') {
    if (typeof res.setHeader === 'function') {
      res.setHeader('Allow', 'GET, HEAD');
      res.setHeader('Cache-Control', 'no-store');
    }
    sendJson(res, 405, { ok: false, error: 'METHOD_NOT_ALLOWED' });
    return;
  }

  const surahNumber = parseSurahNumber(req);
  if (surahNumber === null) {
    if (typeof res.setHeader === 'function') {
      res.setHeader('Cache-Control', 'no-store');
    }
    sendJson(res, 400, { ok: false, error: 'INVALID_SURAH_NUMBER' });
    return;
  }

  if (method === 'HEAD') {
    if (typeof res.setHeader === 'function') {
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800');
    }
    sendEmpty(res, 200);
    return;
  }

  const upstreamUrl = `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,ar.husary,en.sahih,ar.muyassar,en.transliteration`;

  try {
    const upstreamRes = await fetch(upstreamUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(12000),
    });

    if (!upstreamRes.ok) {
      if (typeof res.setHeader === 'function') {
        res.setHeader('Cache-Control', 'no-store');
      }
      sendJson(res, 502, { ok: false, error: 'UPSTREAM_UNAVAILABLE' });
      return;
    }

    const payload = (await upstreamRes.json().catch(() => null)) as AlQuranMultiEditionResponse | null;
    if (!payload || payload.code !== 200 || !Array.isArray(payload.data)) {
      if (typeof res.setHeader === 'function') {
        res.setHeader('Cache-Control', 'no-store');
      }
      sendJson(res, 502, { ok: false, error: 'UPSTREAM_UNAVAILABLE' });
      return;
    }

    const editions = new Map<string, AlQuranEditionData>();
    for (const item of payload.data) {
      const id = item?.edition?.identifier;
      if (typeof id === 'string' && id) {
        editions.set(id, item);
      }
    }

    const uthmani = editions.get('quran-uthmani');
    if (!uthmani || !Array.isArray(uthmani.ayahs) || uthmani.ayahs.length === 0) {
      if (typeof res.setHeader === 'function') {
        res.setHeader('Cache-Control', 'no-store');
      }
      sendJson(res, 502, { ok: false, error: 'UPSTREAM_UNAVAILABLE' });
      return;
    }

    const husaryByAyah = new Map<number, AlQuranEditionAyah>();
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

    const ayahs = uthmani.ayahs.map((ayah, idx) => {
      const numberInSurah = typeof ayah.numberInSurah === 'number' ? ayah.numberInSurah : idx + 1;
      const husary = husaryByAyah.get(numberInSurah);
      const primaryAudio = sanitizeAudioUrl(husary?.audio);
      const secondaryAudio = Array.isArray(husary?.audioSecondary)
        ? husary.audioSecondary.map(sanitizeAudioUrl).find((u): u is string => u !== null) ?? null
        : null;
      const audioUrl = primaryAudio ?? secondaryAudio;
      const audioFallbackUrl = secondaryAudio && secondaryAudio !== audioUrl ? secondaryAudio : null;

      return {
        number: typeof ayah.number === 'number' ? ayah.number : numberInSurah,
        numberInSurah,
        juz: typeof ayah.juz === 'number' ? ayah.juz : 1,
        page: typeof ayah.page === 'number' ? ayah.page : 1,
        textUthmani: typeof ayah.text === 'string' ? ayah.text.trim() : '',
        audioUrl,
        audioFallbackUrl,
        tafsirMuyassar: muyassarByAyah.get(numberInSurah) ?? '',
        translationEn: sahihByAyah.get(numberInSurah) ?? '',
        transliterationEn: translitByAyah.get(numberInSurah) ?? '',
      };
    });

    if (typeof res.setHeader === 'function') {
      res.setHeader(
        'Cache-Control',
        'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800'
      );
    }

    sendJson(res, 200, {
      ok: true,
      source: 'api.alquran.cloud/v1',
      reciter: {
        identifier: 'ar.husary',
        nameAr: 'الشيخ محمود خليل الحصري',
        nameEn: 'Sheikh Mahmoud Khalil Al-Husary',
      },
      surah: {
        number: uthmani.number ?? surahNumber,
        name: uthmani.name ?? '',
        englishName: uthmani.englishName ?? '',
        englishNameTranslation: uthmani.englishNameTranslation ?? '',
        revelationType: uthmani.revelationType ?? 'Meccan',
        numberOfAyahs: uthmani.numberOfAyahs ?? ayahs.length,
        ayahs,
      },
    });
  } catch {
    if (typeof res.setHeader === 'function') {
      res.setHeader('Cache-Control', 'no-store');
    }
    sendJson(res, 502, { ok: false, error: 'UPSTREAM_UNAVAILABLE' });
  }
}
