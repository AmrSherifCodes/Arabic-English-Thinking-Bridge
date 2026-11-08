import React, { useState } from 'react';
import { ArrowLeft, Copy, Check, Volume2, Sparkles, Mic, Send, Briefcase } from 'lucide-react';
import { RTLIcon } from '../../components/RTLIcon';
import { API_BASE_URL } from '../../utils/api';
import { useNativeSpeech } from '../voice/useNativeSpeech';
import { isFranco, francoToArabic } from '../../utils/franco';
import { speakWithRate } from '../../utils/audio';
import { getUserGeminiKey } from '../../services/geminiLexicon';
import { consumeDailyApiQuota } from '../../utils/apiQuota';
import { buildCorporateBridgeOffline } from '../../services/corporateBridgeOffline';
import { isOnline } from '../../utils/connectivity';
import './corporate.css';

interface ToneOption {
  label: string;
  english: string;
  context: string;
}

interface CorporateBridgeResult {
  originalThought: string;
  thinkingShift: string;
  tones: {
    polite: ToneOption;
    assertive: ToneOption;
    executive: ToneOption;
  };
}

interface CorporateBridgeViewProps {
  onBack: () => void;
  onToast?: (msg: string) => void;
  preferredVoice?: string;
}

const PRESETS = [
  'العميل مأخر الداتا وبيماطل في الرد',
  'معلش كنت في ميتنج ومشوفتش إيميلك',
  'يا ريت نراجع الحسابات دي عشان في غلطة',
  'محتاجين نخلّص قبل آخر الأسبوع ضروري',
  'الميزانية دي مش مكفية الشغل المطلوب',
];

export function CorporateBridgeView({ onBack, onToast, preferredVoice }: CorporateBridgeViewProps) {
  const [inputThought, setInputThought] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CorporateBridgeResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { isListening, startListening, stopListening } = useNativeSpeech({
    onSpeechEnd: (transcribed) => {
      setInputThought(transcribed);
      triggerTransform(transcribed);
    },
  });

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening('ar-EG');
    }
  };

  const detectedFranco = isFranco(inputThought);
  const convertedFromFranco = detectedFranco ? francoToArabic(inputThought) : '';

  const triggerTransform = async (thoughtToUse?: string) => {
    const raw = (thoughtToUse || inputThought).trim();
    if (!raw) return;

    const finalThought = isFranco(raw) ? francoToArabic(raw) : raw;

    // Always produce a deterministic offline result first: it renders instantly
    // and guarantees the screen is never empty, with or without a network.
    const offlineResult = buildCorporateBridgeOffline(finalThought);
    setResult(offlineResult);

    if (!isOnline()) {
      setLoading(false);
      onToast?.('وضع أوفلاين — تم توليد الصياغة محلياً بالكامل');
      return;
    }

    const userKey = getUserGeminiKey();
    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(`${API_BASE_URL}/api/gemini`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(userKey && {
            'x-user-api-key': userKey,
            'X-User-Gemini-Key': userKey,
          }),
        },
        body: JSON.stringify({
          operation: 'corporate-bridge',
          thought: finalThought,
        }),
      });

      if (!response.ok) {
        throw new Error(`API returned HTTP ${response.status}`);
      }

      const resJson = await response.json();
      if (resJson.data) {
        setResult(resJson.data);
        consumeDailyApiQuota();
      }
    } catch (err: any) {
      console.warn('[CorporateBridge] Cloud unavailable, keeping offline bridge:', err);
      onToast?.('الذكاء الاصطناعي غير متاح — تم استخدام المحرك المباشر');
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    onToast?.('تم النسخ إلى الحافظة!');
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handleSpeak = (text: string) => {
    speakWithRate(text, 1, preferredVoice);
  };

  return (
    <div className="corporate" dir="rtl">
      {/* Header */}
      <header className="corporate__header">
        <button type="button" className="corporate__back-btn" onClick={onBack} aria-label="رجوع">
          <RTLIcon icon={ArrowLeft} size={18} />
        </button>
        <div className="corporate__title-group">
          <h1 className="corporate__title">من البلدي لـ Corporate 💼</h1>
          <p className="corporate__subtitle">حوّل أفكارك بالعامية لصياغة إنجليزية احترافية</p>
        </div>
        <div style={{ width: 40 }} />
      </header>

      {/* Input Card */}
      <div className="corporate__card">
        <textarea
          className="corporate__textarea"
          value={inputThought}
          onChange={(e) => setInputThought(e.target.value)}
          placeholder="اكتب فكرتك بالبلدي أو الفرانكو... (مثال: العميل مش راضي يبعت الداتا وبيماطل)"
          rows={3}
        />

        {detectedFranco && (
          <div className="corporate__franco-pill">
            <Sparkles size={13} />
            <span>رصد فرانكو: "{convertedFromFranco}"</span>
          </div>
        )}

        <div className="corporate__presets-title">⚡ مواقف شائعة في الشغل:</div>
        <div className="corporate__presets">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              className="corporate__preset-chip"
              onClick={() => {
                setInputThought(preset);
                triggerTransform(preset);
              }}
            >
              {preset}
            </button>
          ))}
        </div>

        <div className="corporate__actions">
          <button
            type="button"
            className="corporate__submit-btn"
            onClick={() => triggerTransform()}
            disabled={loading || !inputThought.trim()}
          >
            {loading ? (
              <span>جاري التحويل الاحترافي...</span>
            ) : (
              <>
                <Send size={16} />
                <span>صياغة بـ ٣ نبرات احترافية</span>
              </>
            )}
          </button>
          <button
            type="button"
            className={`corporate__mic-btn ${isListening ? 'corporate__mic-btn--active' : ''}`}
            onClick={handleMicToggle}
            aria-label={isListening ? 'إيقاف التسجيل' : 'تحدث بالعامية'}
            title="تحدث بفكرتك صوتياً"
          >
            <Mic size={20} />
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="corporate__results animate-fade-in">
          {/* Thinking Shift */}
          <div className="corporate__shift-box">
            <div className="corporate__shift-title">
              <Sparkles size={16} />
              <span>طريقة التفكير (The Thinking Shift)</span>
            </div>
            <p className="corporate__shift-text">{result.thinkingShift}</p>
          </div>

          {/* 3 Tone Cards */}
          <div className="corporate__tones-grid">
            {/* 1. Polite */}
            <div className="corporate__tone-card corporate__tone-card--polite">
              <div className="corporate__tone-header">
                <span className="corporate__tone-badge corporate__tone-badge--polite">
                  🤝 {result.tones.polite.label}
                </span>
                <div className="corporate__tone-controls">
                  <button
                    type="button"
                    className="corporate__tone-btn"
                    onClick={() => handleSpeak(result.tones.polite.english)}
                    aria-label="استمع للنطق"
                  >
                    <Volume2 size={14} />
                    <span>استمع</span>
                  </button>
                  <button
                    type="button"
                    className={`corporate__tone-btn ${copiedKey === 'polite' ? 'corporate__tone-btn--copied' : ''}`}
                    onClick={() => handleCopy(result.tones.polite.english, 'polite')}
                  >
                    {copiedKey === 'polite' ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedKey === 'polite' ? 'تم النسخ!' : 'نسخ'}</span>
                  </button>
                </div>
              </div>
              <p className="corporate__tone-english" dir="ltr">
                {result.tones.polite.english}
              </p>
              <p className="corporate__tone-context">{result.tones.polite.context}</p>
            </div>

            {/* 2. Assertive */}
            <div className="corporate__tone-card corporate__tone-card--assertive">
              <div className="corporate__tone-header">
                <span className="corporate__tone-badge corporate__tone-badge--assertive">
                  ⚡ {result.tones.assertive.label}
                </span>
                <div className="corporate__tone-controls">
                  <button
                    type="button"
                    className="corporate__tone-btn"
                    onClick={() => handleSpeak(result.tones.assertive.english)}
                    aria-label="استمع للنطق"
                  >
                    <Volume2 size={14} />
                    <span>استمع</span>
                  </button>
                  <button
                    type="button"
                    className={`corporate__tone-btn ${copiedKey === 'assertive' ? 'corporate__tone-btn--copied' : ''}`}
                    onClick={() => handleCopy(result.tones.assertive.english, 'assertive')}
                  >
                    {copiedKey === 'assertive' ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedKey === 'assertive' ? 'تم النسخ!' : 'نسخ'}</span>
                  </button>
                </div>
              </div>
              <p className="corporate__tone-english" dir="ltr">
                {result.tones.assertive.english}
              </p>
              <p className="corporate__tone-context">{result.tones.assertive.context}</p>
            </div>

            {/* 3. Executive */}
            <div className="corporate__tone-card corporate__tone-card--executive">
              <div className="corporate__tone-header">
                <span className="corporate__tone-badge corporate__tone-badge--executive">
                  👔 {result.tones.executive.label}
                </span>
                <div className="corporate__tone-controls">
                  <button
                    type="button"
                    className="corporate__tone-btn"
                    onClick={() => handleSpeak(result.tones.executive.english)}
                    aria-label="استمع للنطق"
                  >
                    <Volume2 size={14} />
                    <span>استمع</span>
                  </button>
                  <button
                    type="button"
                    className={`corporate__tone-btn ${copiedKey === 'executive' ? 'corporate__tone-btn--copied' : ''}`}
                    onClick={() => handleCopy(result.tones.executive.english, 'executive')}
                  >
                    {copiedKey === 'executive' ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedKey === 'executive' ? 'تم النسخ!' : 'نسخ'}</span>
                  </button>
                </div>
              </div>
              <p className="corporate__tone-english" dir="ltr">
                {result.tones.executive.english}
              </p>
              <p className="corporate__tone-context">{result.tones.executive.context}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
