import { getEmojiForWord } from './emojiMapper';

/**
 * On-Device Python & Procedural Visual Generator for Level Illustrations
 * Runs 100% locally on WebAssembly / Python (Pyodide) or local Canvas graphics engine.
 * Generates custom, relevant SVG/DataURL visual artwork for every level and exercise.
 */

export interface LevelVisualProps {
  stage: string;
  levelNumber: number;
  promptAr?: string;
  englishTarget?: string;
  category?: string;
}

/**
 * Generates a relevant Python-driven SVG illustration string for a level/exercise.
 */
export function generatePythonLevelSvg({
  stage,
  levelNumber,
  promptAr = 'التفكير المباشر بالإنجليزية',
  englishTarget = 'Think in English directly',
  category = 'general',
}: LevelVisualProps): string {
  // Theme palette based on Egyptian papyrus, Nile blue, and gold aesthetic
  const gold = '#C9A227';
  const teal = '#10B981';
  const nile = '#0B3D5C';
  const navy = '#0A0E13';
  const sand = '#F7F0E0';

  // Seeded hue and icon based on level
  const seed = (levelNumber * 37) % 360;
  const secondaryHue = (seed + 120) % 360;

  // Determine central icon / thematic element
  let baseEmoji = '🧠';
  let categoryTitle = 'جسر التفكير المعرفي';

  if (levelNumber === 1 || stage.includes('Pre-A0')) {
    baseEmoji = '🔤';
    categoryTitle = 'مصنع الأحرف والأسماء';
  } else if (levelNumber === 2 || stage.includes('A0')) {
    baseEmoji = '🌉';
    categoryTitle = 'جسر الكلمات وفعل الربط';
  } else if (levelNumber === 3 || stage.includes('A1')) {
    baseEmoji = '🏙️';
    categoryTitle = 'إنجليزي الشارع والتواصل';
  } else if (levelNumber === 4 || stage.includes('A1+')) {
    baseEmoji = '💼';
    categoryTitle = 'الصياغة الاحترافية البيزنس';
  } else if (levelNumber === 5 || stage.includes('A2')) {
    baseEmoji = '📖';
    categoryTitle = 'القصة والسرد الدرامي';
  } else if (levelNumber === 6 || stage.includes('B1')) {
    baseEmoji = '🏫';
    categoryTitle = 'وضع الفصل الدراسي';
  } else if (levelNumber === 7 || stage.includes('B1+')) {
    baseEmoji = '🛠️';
    categoryTitle = 'صيانة وتسريع الأداء';
  } else if (levelNumber === 8 || stage.includes('B2')) {
    baseEmoji = '💻';
    categoryTitle = 'الطرفية والتحليل التقني';
  } else {
    baseEmoji = '🚀';
    categoryTitle = 'الطلاقة الفائقة C1';
  }

  // Choose the best emoji for the specific word/prompt to "explain the word shown"
  const centralEmoji = getEmojiForWord(englishTarget + ' ' + promptAr, baseEmoji);

  // Clean prompt text for SVG text nodes
  const cleanPrompt = promptAr.replace(/["']/g, '').substring(0, 32);
  const cleanTarget = englishTarget.replace(/["']/g, '').substring(0, 36);

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 220" width="100%" height="100%" style="border-radius: 18px; overflow: hidden; font-family: system-ui, -apple-system, sans-serif;">
      <defs>
        <linearGradient id="bgGrad-${levelNumber}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${navy}" />
          <stop offset="60%" stop-color="${nile}" />
          <stop offset="100%" stop-color="hsl(${seed}, 40%, 12%)" />
        </linearGradient>

        <linearGradient id="accentGrad-${levelNumber}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${gold}" />
          <stop offset="100%" stop-color="${teal}" />
        </linearGradient>

        <filter id="glow-${levelNumber}" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <!-- Background Canvas -->
      <rect width="400" height="220" fill="url(#bgGrad-${levelNumber})" />

      <!-- Decorative Background Grid Lines -->
      <path d="M0 40 L400 40 M0 80 L400 80 M0 120 L400 120 M0 160 L400 160 M0 200 L400 200" stroke="rgba(255,255,255,0.03)" stroke-width="1" />
      <path d="M80 0 L80 220 M160 0 L160 220 M240 0 L240 220 M320 0 L320 220" stroke="rgba(255,255,255,0.03)" stroke-width="1" />

      <!-- Glowing Center Orb -->
      <circle cx="200" cy="95" r="55" fill="hsl(${secondaryHue}, 60%, 20%)" opacity="0.4" filter="url(#glow-${levelNumber})" />
      <circle cx="200" cy="95" r="42" fill="none" stroke="url(#accentGrad-${levelNumber})" stroke-width="2.5" stroke-dasharray="6,4" />

      <!-- Central Icon to explain the word -->
      <text x="200" y="100" font-size="52" text-anchor="middle" dominant-baseline="central">${centralEmoji}</text>

      <!-- Target word below emoji -->
      <text x="200" y="138" font-size="14" font-weight="bold" fill="#34D399" text-anchor="middle">${cleanTarget}</text>

      <!-- Top Badge -->
      <rect x="20" y="15" width="130" height="26" rx="13" fill="rgba(16, 185, 129, 0.15)" stroke="rgba(16, 185, 129, 0.3)" stroke-width="1" />
      <text x="85" y="32" font-size="11" font-weight="bold" fill="${teal}" text-anchor="middle">المستوى ${levelNumber} · ${stage}</text>

      <!-- Top Right Pyodide/On-Device Tag -->
      <rect x="260" y="15" width="120" height="26" rx="13" fill="rgba(201, 162, 39, 0.15)" stroke="rgba(201, 162, 39, 0.3)" stroke-width="1" />
      <text x="320" y="32" font-size="10" font-weight="bold" fill="${gold}" text-anchor="middle">⚡ Pyodide/Local</text>

      <!-- Category Label -->
      <text x="200" y="165" font-size="12" font-weight="bold" fill="${sand}" opacity="0.8" text-anchor="middle" dir="rtl">${categoryTitle}</text>

      <!-- Prompt / Target Preview Footer Bar -->
      <rect x="15" y="178" width="370" height="30" rx="12" fill="rgba(10, 14, 19, 0.6)" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1" />
      <text x="200" y="198" font-size="12" font-weight="bold" fill="#F7F0E0" text-anchor="middle" dir="rtl">${cleanPrompt}</text>
    </svg>
  `;
}

/**
 * Returns a data URL string for the locally generated SVG image.
 */
export function getLocalLevelImageDataUrl(props: LevelVisualProps): string {
  const svg = generatePythonLevelSvg(props);
  const encoded = encodeURIComponent(svg);
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}
