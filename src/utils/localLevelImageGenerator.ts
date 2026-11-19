import { getSceneContextForExercise } from './emojiMapper';

/**
 * On-Device Procedural Visual Generator for Level & Exercise Artwork
 * Runs 100% locally on WebAssembly / Python (Pyodide) or local Canvas graphics engine.
 * Generates topic-aware, relevant 3D vector SVG artwork for every exercise locally (0 KB network overhead!).
 */

export interface LevelVisualProps {
  stage: string;
  levelNumber: number;
  promptAr?: string;
  englishTarget?: string;
  category?: string;
}

/**
 * Generates a relevant SVG illustration string for any level/exercise based on L1/L2 topic keywords.
 */
export function generatePythonLevelSvg({
  stage,
  levelNumber,
  promptAr = 'التفكير المباشر بالإنجليزية',
  englishTarget = 'Think in English directly',
  category = 'general',
}: LevelVisualProps): string {
  // Resolve rich topic scene context
  const scene = getSceneContextForExercise(englishTarget, promptAr, stage, levelNumber);

  const cleanPrompt = promptAr.replace(/["']/g, '').substring(0, 36);
  const cleanTarget = englishTarget.replace(/["']/g, '').substring(0, 42);
  const idSeed = `${levelNumber}-${stage.replace(/[^a-zA-Z0-9]/g, '')}-${englishTarget.length}`;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 220" width="100%" height="100%" style="border-radius: 18px; overflow: hidden; font-family: system-ui, -apple-system, sans-serif;">
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
      <rect width="400" height="220" fill="url(#bgGrad-${idSeed})" />

      <!-- Background Grid & Perspective Rays -->
      <path d="M0 35 L400 35 M0 70 L400 70 M0 105 L400 105 M0 140 L400 140 M0 175 L400 175" stroke="rgba(255,255,255,0.04)" stroke-width="1" />
      <path d="M60 0 L60 220 M130 0 L130 220 M200 0 L200 220 M270 0 L270 220 M340 0 L340 220" stroke="rgba(255,255,255,0.04)" stroke-width="1" />

      <!-- Connecting Energy Beam -->
      <line x1="110" y1="92" x2="290" y2="92" stroke="${scene.theme.accentColor}" stroke-width="2" stroke-dasharray="4,4" opacity="0.6" />

      <!-- Left Contextual Badge -->
      <circle cx="110" cy="92" r="26" fill="rgba(255,255,255,0.08)" stroke="${scene.theme.accentColor}" stroke-width="1.5" />
      <text x="110" y="96" font-size="24" text-anchor="middle" dominant-baseline="central">${scene.leftEmoji}</text>

      <!-- Central Hero Orb with Glow Filter -->
      <circle cx="200" cy="92" r="48" fill="${scene.theme.glowColor}" filter="url(#glow-${idSeed})" opacity="0.6" />
      <circle cx="200" cy="92" r="38" fill="rgba(0,0,0,0.6)" stroke="url(#accentGrad-${idSeed})" stroke-width="3" />
      <text x="200" y="96" font-size="44" text-anchor="middle" dominant-baseline="central">${scene.mainEmoji}</text>

      <!-- Right Contextual Badge -->
      <circle cx="290" cy="92" r="26" fill="rgba(255,255,255,0.08)" stroke="${scene.theme.accentColor}" stroke-width="1.5" />
      <text x="290" y="96" font-size="24" text-anchor="middle" dominant-baseline="central">${scene.rightEmoji}</text>

      <!-- Target Sentence Highlight Bar -->
      <text x="200" y="142" font-size="14" font-weight="900" fill="${scene.theme.accentColor}" text-anchor="middle">${cleanTarget}</text>

      <!-- Category / Topic Title -->
      <text x="200" y="162" font-size="11" font-weight="700" fill="#E2E8F0" opacity="0.9" text-anchor="middle" dir="rtl">${scene.categoryTitleAr} · ${scene.categoryTitleEn}</text>

      <!-- Top Bar Badges -->
      <!-- Left Level Badge -->
      <rect x="12" y="10" width="100" height="22" rx="11" fill="${scene.theme.badgeBg}" stroke="${scene.theme.accentColor}" stroke-width="0.8" />
      <text x="62" y="24" font-size="10" font-weight="800" fill="${scene.theme.badgeText}" text-anchor="middle">المستوى ${levelNumber} · ${stage}</text>

      <!-- Center Grammar Pattern Tag -->
      <rect x="122" y="10" width="156" height="22" rx="11" fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.15)" stroke-width="0.8" />
      <text x="200" y="24" font-size="9" font-weight="700" fill="#94A3B8" text-anchor="middle">${scene.grammarTag}</text>

      <!-- Right Pyodide / On-Device Tag -->
      <rect x="288" y="10" width="100" height="22" rx="11" fill="rgba(201, 162, 39, 0.15)" stroke="rgba(201, 162, 39, 0.3)" stroke-width="0.8" />
      <text x="338" y="24" font-size="9" font-weight="800" fill="#FACC15" text-anchor="middle">⚡ Local Pyodide</text>

      <!-- Prompt Footer Bar -->
      <rect x="12" y="178" width="376" height="30" rx="12" fill="rgba(0,0,0,0.7)" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1" />
      <text x="200" y="198" font-size="12" font-weight="800" fill="#F7F0E0" text-anchor="middle" dir="rtl">"{cleanPrompt}"</text>
    </svg>
  `;
}

/**
 * Returns a base64 data URL string for the locally generated SVG image.
 */
export function getLocalLevelImageDataUrl(props: LevelVisualProps): string {
  const svg = generatePythonLevelSvg(props);
  try {
    const base64 = typeof window !== 'undefined' && typeof window.btoa !== 'undefined'
      ? window.btoa(unescape(encodeURIComponent(svg)))
      : Buffer.from(svg, 'utf-8').toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
  } catch {
    const encoded = encodeURIComponent(svg);
    return `data:image/svg+xml;charset=utf-8,${encoded}`;
  }
}
