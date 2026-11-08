export const FPS = 30;
export const DURATION_SECONDS = 60;
export const DURATION_FRAMES = DURATION_SECONDS * FPS;

// Beat boundaries and key frame events are shared by every aspect ratio.
export const BEATS = {
  coldOpenStart: 0,
  coldOpenEnd: 240,
  tutorTaxStart: 240,
  tutorTaxEnd: 660,
  silenceStart: 660,
  silenceEnd: 690,
  silenceBeatEnd: 780,
  gameStart: 780,
  gameWordsIn: 800,
  gameWordsOut: 900,
  progressStart: 920,
  progressComplete: 1200,
  revealStart: 1320,
  revealLineSwap: 1365,
  revealEnd: 1560,
  endCardStart: 1560,
  wordmarkIn: 1570,
  subtitleIn: 1600,
  end: 1800,
} as const;

export const COLD_OPEN = {
  questionIn: 6,
  counterFadeIn: 60,
  counterClimbStart: 90,
  counterClimbEnd: 210,
} as const;

export const TAX = {
  ratePunch: 240,
  hourAfterHour: 270,
  runningTotal: 360,
  dollarAfterDollar: 420,
  finalTotal: 480,
  settleFrames: 8,
} as const;

export const SILENCE = { pianoNote: 705 } as const;

export const GAME = {
  wordStagger: 8,
  progressComplete: 1200,
  chime: 1200,
  majorShift: 920,
} as const;

export const MOTION = {
  swooshInFrames: 14,
  swooshInOpacityFrames: 8,
  swooshInOffsetPx: 14,
  swooshInEase: 'cubic-bezier(0.16,1,0.3,1)',
  swooshOutFrames: 10,
  swooshOutOffsetPx: 8,
  swooshOutEase: 'cubic-bezier(0.7,0,0.84,0)',
} as const;
