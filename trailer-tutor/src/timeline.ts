export const FPS = 30;
export const DURATION_SECONDS = 60;
export const DURATION_FRAMES = FPS * DURATION_SECONDS;

export const BEATS = {
  terminalStart: 0,
  typingStart: 8,
  typingComplete: 128,
  countdownStart: 132,
  countdownThree: 138,
  countdownTwo: 168,
  countdownOne: 198,
  storyStart: 225,
  studentEnters: 240,
  courseFound: 300,
  paywallAppears: 360,
  paywallRead: 390,
  studentSinks: 465,
  studentReact: 510,
  silenceStart: 660,
  silenceEnd: 690,
  questionAfterSilence: 690,
  openBridgeReveal: 780,
  lessonCount: 930,
  wordCount: 1000,
  freeClaim: 1070,
  offlineClaim: 1140,
  spacedReviewClaim: 1210,
  giftLine: 1320,
  brandReveal: 1365,
  endCardStart: 1560,
  endCardWordmark: 1570,
  endCardDetails: 1600,
  endCardCta: 1680,
  end: DURATION_FRAMES,
} as const;

export const COUNTDOWN = [
  {label: '3', frame: BEATS.countdownThree},
  {label: '2', frame: BEATS.countdownTwo},
  {label: '1', frame: BEATS.countdownOne},
] as const;

export const SOUND_CUES = {
  terminalKeyFrames: [16, 38, 60, 82, 104],
  countdownFrames: [BEATS.countdownThree, BEATS.countdownTwo, BEATS.countdownOne],
  lockThud: BEATS.paywallAppears,
  discouragedTap: BEATS.studentReact,
  brightReveal: BEATS.openBridgeReveal,
  featureChime: BEATS.spacedReviewClaim,
} as const;
