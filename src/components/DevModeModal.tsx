import React, { useEffect, useState } from 'react';
import { X, Copy, Check, ExternalLink, Terminal, Wrench, Share2 } from 'lucide-react';
import {
  DEFAULT_APP_URL,
  PLATFORM_CHAR_LIMITS,
  SOCIAL_PRESETS,
  buildSocialShareUrls,
} from '../utils/socialAutoPoster';
import { setDevModeEnabled } from '../utils/cvEasterEgg';

export interface DevModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvClickCount?: number;
  onTriggerPoemClick?: () => void;
}

function readSafeStorageItem(key: string): string {
  try {
    return window.localStorage.getItem(key) || '(unset)';
  } catch {
    return '(unavailable)';
  }
}

export function DevModeModal({
  isOpen,
  onClose,
  cvClickCount = 0,
  onTriggerPoemClick,
}: DevModeModalProps) {
  const [activeTab, setActiveTab] = useState<'poster' | 'diagnostics'>('poster');
  const [selectedPresetId, setSelectedPresetId] = useState(SOCIAL_PRESETS[0].id);
  const [postText, setPostText] = useState(SOCIAL_PRESETS[0].text);
  const [shareUrl, setShareUrl] = useState(DEFAULT_APP_URL);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activePreset = SOCIAL_PRESETS.find((p) => p.id === selectedPresetId) || SOCIAL_PRESETS[0];
  const shareLinks = buildSocialShareUrls(postText, shareUrl, activePreset.title);

  const handleSelectPreset = (presetId: string) => {
    const preset = SOCIAL_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setSelectedPresetId(presetId);
    setPostText(preset.text);
    setShareUrl(preset.url);
  };

  const handleCopy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      setStatusNote('Copy unavailable in this context — select text manually.');
    }
  };

  const handleDifficultyOverride = (level: 'Easy' | 'Medium' | 'Hard') => {
    try {
      const raw = window.localStorage.getItem('tb.cognitiveProfile');
      const parsed = raw ? JSON.parse(raw) : {};
      window.localStorage.setItem(
        'tb.cognitiveProfile',
        JSON.stringify({ ...parsed, difficultyLevel: level })
      );
      setStatusNote(`Set cognitive difficulty to ${level}.`);
    } catch {
      setStatusNote('Could not update tb.cognitiveProfile.');
    }
  };

  const handleResetSupporterPopup = () => {
    try {
      window.localStorage.removeItem('tb.yt_nudge_dismissed_v1');
      setStatusNote('Reset YouTube supporter popup state (tb.yt_nudge_dismissed_v1).');
    } catch {
      setStatusNote('Could not reset popup key.');
    }
  };

  const socialButtons: Array<{ label: string; href: string; tone: string }> = [
    { label: 'X / Twitter', href: shareLinks.x, tone: 'border-sky-500/40 bg-sky-500/10 text-sky-200 hover:bg-sky-500/20' },
    { label: 'LinkedIn', href: shareLinks.linkedin, tone: 'border-blue-500/40 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20' },
    { label: 'WhatsApp', href: shareLinks.whatsapp, tone: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20' },
    { label: 'Telegram', href: shareLinks.telegram, tone: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20' },
    { label: 'Facebook', href: shareLinks.facebook, tone: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-200 hover:bg-indigo-500/20' },
    { label: 'Reddit', href: shareLinks.reddit, tone: 'border-orange-500/40 bg-orange-500/10 text-orange-200 hover:bg-orange-500/20' },
    { label: 'Bluesky', href: shareLinks.bluesky, tone: 'border-blue-400/40 bg-blue-400/10 text-blue-200 hover:bg-blue-400/20' },
    { label: 'Threads', href: shareLinks.threads, tone: 'border-stone-500/40 bg-stone-500/15 text-stone-200 hover:bg-stone-500/25' },
    { label: 'YouTube Post', href: shareLinks.youtubeCommunity, tone: 'border-rose-500/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20' },
  ];

  const charLen = postText.length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dev-mode-title"
      data-dev-modal="true"
      data-testid="dev-mode-modal"
      className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-5 bg-[#04080F]/92 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl max-h-[92dvh] overflow-y-auto rounded-3xl border border-cyan-500/40 bg-[#0A1320] text-slate-100 shadow-2xl p-5 sm:p-6 space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/20 pb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 shrink-0">
              <Wrench size={18} />
            </span>
            <div>
              <h2 id="dev-mode-title" className="text-base sm:text-lg font-black text-white">
                Developer Mode · V6 (v6.0.0)
              </h2>
              <p className="text-[11px] text-cyan-300 font-mono">
                All-Socials Auto-Poster + Offline Diagnostics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cvClickCount === 110 && onTriggerPoemClick && (
              <button
                type="button"
                data-testid="dev-to-poem-btn"
                onClick={onTriggerPoemClick}
                className="px-3 py-2 min-h-[44px] rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs cursor-pointer"
              >
                Click #111 → Poem
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Developer Mode"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-200 hover:text-white cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('poster')}
            className={`flex-1 min-h-[44px] px-3 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 border cursor-pointer ${
              activeTab === 'poster'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                : 'bg-[#070E18] text-slate-300 border-slate-700'
            }`}
          >
            <Share2 size={15} />
            <span>All-Socials Auto-Poster</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('diagnostics')}
            className={`flex-1 min-h-[44px] px-3 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 border cursor-pointer ${
              activeTab === 'diagnostics'
                ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                : 'bg-[#070E18] text-slate-300 border-slate-700'
            }`}
          >
            <Terminal size={15} />
            <span>Dev Diagnostics</span>
          </button>
        </div>

        {activeTab === 'poster' && (
          <div className="space-y-4">
            {/* Presets */}
            <div className="flex flex-wrap gap-1.5">
              {SOCIAL_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-bold border cursor-pointer ${
                    selectedPresetId === preset.id
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                      : 'bg-[#070E18] border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Post Textarea & URL */}
            <div className="space-y-2">
              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                rows={6}
                dir="auto"
                className="w-full rounded-2xl border border-slate-700 bg-[#060C14] p-3 text-xs sm:text-sm text-slate-100 leading-relaxed focus:border-cyan-400 focus:outline-none"
              />
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
                <span>
                  Chars: <strong className="text-white">{charLen}</strong> · X max {PLATFORM_CHAR_LIMITS.x} (
                  {charLen <= PLATFORM_CHAR_LIMITS.x ? 'fits' : 'auto-trimmed'}) · Bsky max {PLATFORM_CHAR_LIMITS.bluesky}
                </span>
                <button
                  type="button"
                  onClick={() => void handleCopy('post', postText)}
                  className="px-3 py-1.5 min-h-[36px] rounded-xl border border-cyan-500/40 bg-cyan-500/15 text-cyan-200 font-sans font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === 'post' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedKey === 'post' ? 'Copied!' : 'Copy Post'}</span>
                </button>
              </div>
              <input
                type="url"
                value={shareUrl}
                onChange={(e) => setShareUrl(e.target.value)}
                aria-label="Target share URL"
                className="w-full rounded-xl border border-slate-700 bg-[#060C14] px-3 py-2 text-xs font-mono text-emerald-300 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {/* 1-Click All-Socials Launch Grid */}
            <div className="space-y-2">
              <span className="text-xs font-black text-amber-300 block">
                1-Click Pre-Filled Launch Links (Zero API Setup Required):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {socialButtons.map((btn) => (
                  <a
                    key={btn.label}
                    href={btn.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`min-h-[42px] px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-between gap-1.5 transition ${btn.tone}`}
                  >
                    <span>{btn.label}</span>
                    <ExternalLink size={13} />
                  </a>
                ))}
              </div>
            </div>

            {/* Hands-Free CLI Auto-Poster Commands */}
            <div className="rounded-2xl border border-slate-700 bg-[#060C14] p-3.5 space-y-2">
              <span className="text-xs font-black text-cyan-300 block">
                Hands-Free CLI Auto-Poster (X, LinkedIn, FB, Telegram, Discord, Bluesky, Mastodon, Reddit):
              </span>
              <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => void handleCopy('cli-dry', `npm run social:dry -- --preset ${selectedPresetId}`)}
                  className="px-2.5 py-1.5 min-h-[36px] rounded-lg border border-slate-700 bg-slate-900 text-slate-200 hover:border-cyan-400 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy size={12} />
                  <span>npm run social:dry -- --preset {selectedPresetId}</span>
                </button>
                <button
                  type="button"
                  onClick={() => void handleCopy('cli-live', `npm run social:post -- --preset ${selectedPresetId}`)}
                  className="px-2.5 py-1.5 min-h-[36px] rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-200 hover:border-emerald-400 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy size={12} />
                  <span>npm run social:post -- --preset {selectedPresetId}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'diagnostics' && (
          <div className="space-y-4 text-xs">
            <div className="rounded-2xl border border-slate-700 bg-[#060C14] p-4 space-y-2 font-mono">
              <div><span className="text-slate-400">tb.devMode:</span> <span className="text-emerald-300">{readSafeStorageItem('tb.devMode')}</span></div>
              <div><span className="text-slate-400">tb.yt_nudge_dismissed_v1:</span> <span className="text-cyan-300">{readSafeStorageItem('tb.yt_nudge_dismissed_v1')}</span></div>
              <div><span className="text-slate-400">tb.ui_mode:</span> <span className="text-cyan-300">{readSafeStorageItem('tb.ui_mode')}</span></div>
              <div className="truncate"><span className="text-slate-400">tb.cognitiveProfile:</span> <span className="text-amber-300">{readSafeStorageItem('tb.cognitiveProfile')}</span></div>
            </div>

            <div className="flex flex-wrap gap-2">
              {(['Easy', 'Medium', 'Hard'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => handleDifficultyOverride(lvl)}
                  className="px-3 py-2 min-h-[42px] rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-200 font-bold cursor-pointer"
                >
                  Difficulty: {lvl}
                </button>
              ))}
              <button
                type="button"
                onClick={handleResetSupporterPopup}
                className="px-3 py-2 min-h-[42px] rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 font-bold cursor-pointer"
              >
                Reset YT Popup
              </button>
              <button
                type="button"
                onClick={() => {
                  setDevModeEnabled(false);
                  onClose();
                }}
                className="px-3 py-2 min-h-[42px] rounded-xl border border-rose-500/40 bg-rose-500/15 text-rose-200 font-bold cursor-pointer"
              >
                Exit Dev Mode
              </button>
            </div>
          </div>
        )}

        {statusNote && (
          <div className="text-xs font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2">
            {statusNote}
          </div>
        )}
      </div>
    </div>
  );
}
