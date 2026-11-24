import { getSceneContextForExercise } from './emojiMapper';

/**
 * On-Device Procedural Visual Generator for Level & Exercise Artwork
 * Runs 100% locally with zero network overhead.
 * Generates topic-aware 3D vector SVG artwork for exercises while preventing
 * target-answer leakage when `revealTarget` is false.
 */

export interface LevelVisualProps {
  stage: string;
  levelNumber: number;
  promptAr?: string;
  englishTarget?: string;
  category?: string;
  revealTarget?: boolean;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates a relevant SVG illustration string for any level/exercise based on L1/L2 topic keywords.
 * Never embeds the target answer text unless `revealTarget` is explicitly true.
 */
export function generatePythonLevelSvg({
  stage,
  levelNumber,
  promptAr = 'التفكير المباشر بالإنجليزية',
  englishTarget = 'Think in English directly',
  revealTarget = false,
}: LevelVisualProps): string {
  // Resolve rich topic scene context without leaking target sentence text
  const scene = getSceneContextForExercise(englishTarget, promptAr, stage, levelNumber);

  const cleanPrompt = escapeXml(promptAr.replace(/["']/g, '').substring(0, 36));
  const cleanTarget = revealTarget
    ? escapeXml((englishTarget || '').replace(/["']/g, '').substring(0, 42))
    : '';
  const categoryTitleAr = escapeXml(scene.categoryTitleAr);
  const categoryTitleEn = escapeXml(scene.categoryTitleEn);
  const grammarTag = escapeXml(scene.grammarTag);
  const stageEscaped = escapeXml(stage);
  const idSeed = `${levelNumber}-${stage.replace(/[^a-zA-Z0-9]/g, '')}-${englishTarget.length}`;

  const middleBannerMarkup = revealTarget && cleanTarget
    ? `
      <!-- Target Sentence Highlight Bar (revealed only after answering) -->
      <text x="200" y="140" font-size="14" font-weight="900" fill="${scene.theme.accentColor}" text-anchor="middle">${cleanTarget}</text>
      <!-- Category / Topic Title -->
      <text x="200" y="160" font-size="11" font-weight="700" fill="#E2E8F0" opacity="0.9" text-anchor="middle" dir="rtl">${categoryTitleAr} · ${categoryTitleEn}</text>
    `
    : `
      <!-- Category / Topic Title (zero answer leak during quiz) -->
      <text x="200" y="150" font-size="12" font-weight="800" fill="#E2E8F0" opacity="0.95" text-anchor="middle" dir="rtl">${categoryTitleAr} · ${categoryTitleEn}</text>
    `;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="220" viewBox="0 0 400 220" preserveAspectRatio="xMidYMid meet" style="display: block; font-family: system-ui, -apple-system, sans-serif;">
      <defs>
        <linearGradient id="bgGrad-${idSeed}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${scene.theme.primaryBg}" />
          <stop offset="70%" stop-color="${scene.theme.secondaryBg}" />
          <stop offset="100%" stop-color="#000000" />
        </linearGradient>

        <linearGradient id="accentGrad-${idSeed}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${scene.theme.accentColor}" />
          <stop offset="100%" stop-color="#FACC15" />
        </linearGradient>

        <filter id="glow-${idSeed}" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <!-- Background Canvas -->
      <rect width="400" height="220" rx="18" fill="url(#bgGrad-${idSeed})" />

      <!-- Background Grid & Perspective Rays -->
      <path d="M0 35 L400 35 M0 70 L400 70 M0 105 L400 105 M0 140 L400 140 M0 175 L400 175" stroke="rgba(255,255,255,0.04)" stroke-width="1" />
      <path d="M60 0 L60 220 M130 0 L130 220 M200 0 L200 220 M270 0 L270 220 M340 0 L340 220" stroke="rgba(255,255,255,0.04)" stroke-width="1" />

      <!-- Connecting Energy Beam -->
      <line x1="110" y1="86" x2="290" y2="86" stroke="${scene.theme.accentColor}" stroke-width="2" stroke-dasharray="4,4" opacity="0.6" />

      <!-- Left Contextual Badge -->
      <circle cx="110" cy="86" r="24" fill="rgba(255,255,255,0.08)" stroke="${scene.theme.accentColor}" stroke-width="1.5" />
      <text x="110" y="90" font-size="22" text-anchor="middle" dominant-baseline="central">${scene.leftEmoji}</text>

      <!-- Central Hero Orb with Glow Filter -->
      <circle cx="200" cy="86" r="44" fill="${scene.theme.glowColor}" filter="url(#glow-${idSeed})" opacity="0.6" />
      <circle cx="200" cy="86" r="36" fill="rgba(0,0,0,0.6)" stroke="url(#accentGrad-${idSeed})" stroke-width="3" />
      <text x="200" y="90" font-size="40" text-anchor="middle" dominant-baseline="central">${scene.mainEmoji}</text>

      <!-- Right Contextual Badge -->
      <circle cx="290" cy="86" r="24" fill="rgba(255,255,255,0.08)" stroke="${scene.theme.accentColor}" stroke-width="1.5" />
      <text x="290" y="90" font-size="22" text-anchor="middle" dominant-baseline="central">${scene.rightEmoji}</text>

      ${middleBannerMarkup}

      <!-- Top Bar Badges -->
      <rect x="12" y="10" width="100" height="22" rx="11" fill="${scene.theme.badgeBg}" stroke="${scene.theme.accentColor}" stroke-width="0.8" />
      <text x="62" y="24" font-size="10" font-weight="800" fill="${scene.theme.badgeText}" text-anchor="middle">المستوى ${levelNumber} · ${stageEscaped}</text>

      <rect x="122" y="10" width="156" height="22" rx="11" fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.15)" stroke-width="0.8" />
      <text x="200" y="24" font-size="9" font-weight="700" fill="#94A3B8" text-anchor="middle">${grammarTag}</text>

      <rect x="288" y="10" width="100" height="22" rx="11" fill="rgba(201, 162, 39, 0.15)" stroke="rgba(201, 162, 39, 0.3)" stroke-width="0.8" />
      <text x="338" y="24" font-size="9" font-weight="800" fill="#FACC15" text-anchor="middle">⚡ Offline Ready</text>

      <!-- Prompt Footer Bar -->
      <rect x="12" y="176" width="376" height="32" rx="12" fill="rgba(0,0,0,0.72)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1" />
      <text x="200" y="196" font-size="12" font-weight="800" fill="#F7F0E0" text-anchor="middle" dir="rtl">"${cleanPrompt}"</text>
    </svg>
  `;
}

/**
 * Returns a UTF-8 data URL string for the locally generated SVG image.
 */
export function getLocalLevelImageDataUrl(props: LevelVisualProps): string {
  const svg = generatePythonLevelSvg(props);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
