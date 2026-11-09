import soundCues from './audio-cues.json';

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
  lessonCount: 900,
  wordCount: 960,
  freeClaim: 1020,
  offlineClaim: 1080,
  spacedReviewClaim: 1140,
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

export const SOUND_CUES = soundCues;

