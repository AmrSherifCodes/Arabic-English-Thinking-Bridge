import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {BEATS, COLD_OPEN, GAME, MOTION, TAX} from './timeline';

const BLACK = '#000000';
const WHITE = '#FFFFFF';
const AMBER = '#F5B942';
const LATIN = "'Readex Pro', 'Inter', system-ui, sans-serif";
const ARABIC = "'Cairo', 'Readex Pro', 'Inter', sans-serif";

const centered: React.CSSProperties = {
  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
  justifyContent: 'center', textAlign: 'center', padding: '7.5%', boxSizing: 'border-box',
};

const showAfter = (frame: number, start: number, end: number) => frame >= start && frame < end;

const swooshIn = (frame: number, start: number, axis: 'x' | 'y' = 'y') => {
  const p = interpolate(frame - start, [0, MOTION.swooshInFrames], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const opacity = interpolate(frame - start, [0, MOTION.swooshInOpacityFrames], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return {opacity, transform: `translate${axis.toUpperCase()}(${(1 - p) * MOTION.swooshInOffsetPx}px) scale(${0.97 + p * 0.03})`};
};

const swooshOut = (frame: number, start: number, axis: 'x' | 'y' = 'y') => {
  const p = interpolate(frame - start, [0, MOTION.swooshOutFrames], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.7, 0, 0.84, 0),
  });
  return {opacity: 1 - p, transform: `translate${axis.toUpperCase()}(${-p * MOTION.swooshOutOffsetPx}px)`};
};

export const TutorTax: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const unit = Math.min(width, height);
  const bodySize = Math.max(28, Math.round(unit * 0.07));
  const amountSize = Math.round(unit * 0.19);
  const titleSize = Math.round(unit * 0.12);
  const background = frame >= BEATS.revealStart && frame < BEATS.revealEnd ? AMBER : BLACK;
  const foreground = background === AMBER ? BLACK : WHITE;

  const climbing = interpolate(frame, [COLD_OPEN.counterClimbStart, COLD_OPEN.counterClimbEnd], [0, 40], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const amount = Math.floor(climbing / 10) * 10;
  const counterOpacity = interpolate(frame, [COLD_OPEN.counterFadeIn, COLD_OPEN.counterFadeIn + 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const progress = interpolate(frame, [GAME.majorShift, GAME.progressComplete], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const xp = Math.floor(progress * 240);
  const settle = frame >= TAX.finalTotal && frame < TAX.finalTotal + TAX.settleFrames
    ? interpolate(frame - TAX.finalTotal, [0, 2, 5, 8], [1.03, 0.995, 0.995, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : 1;

  return (
    <AbsoluteFill style={{backgroundColor: background, color: foreground, fontFamily: LATIN, overflow: 'hidden'}}>
      {showAfter(frame, COLD_OPEN.questionIn, COLD_OPEN.counterClimbStart) && (
        <div style={{...centered, fontSize: titleSize, fontWeight: 600, ...swooshIn(frame, COLD_OPEN.questionIn)}}>
          Want to learn a language?
        </div>
      )}

      {showAfter(frame, COLD_OPEN.counterFadeIn, BEATS.coldOpenEnd) && frame < BEATS.tutorTaxStart && (
        <div style={{position: 'absolute', left: 0, right: 0, bottom: '16%', textAlign: 'center', fontSize: bodySize, opacity: counterOpacity, fontVariantNumeric: 'tabular-nums'}}>
          {frame < COLD_OPEN.counterClimbStart ? '$0' : amount === 40 ? '$40/hr' : `$${amount}/hr`}
        </div>
      )}

      {showAfter(frame, TAX.ratePunch, TAX.finalTotal) && (
        <div style={{...centered, flexDirection: 'column', gap: '1.6vh'}}>
          <div style={{fontSize: amountSize, lineHeight: 1.05, fontWeight: 700}}>$40/hr</div>
          {showAfter(frame, TAX.hourAfterHour, TAX.finalTotal) && <div style={{fontSize: bodySize, fontWeight: 400}}>Hour after hour.</div>}
          {showAfter(frame, TAX.dollarAfterDollar, TAX.finalTotal) && <div style={{fontSize: bodySize, fontWeight: 400}}>Dollar after dollar.</div>}
          {showAfter(frame, TAX.runningTotal, TAX.finalTotal) && <div style={{fontSize: bodySize * 0.72, opacity: 0.85}}>$40/hr → $2,000</div>}
        </div>
      )}

      {showAfter(frame, TAX.finalTotal, BEATS.silenceStart) && (
        <div style={{...centered, fontSize: amountSize, fontWeight: 700, transform: `scale(${settle})`, fontVariantNumeric: 'tabular-nums'}}>$8,000</div>
      )}

      {showAfter(frame, BEATS.silenceEnd, BEATS.silenceBeatEnd) && (
        <div style={{...centered, fontSize: bodySize * 0.72, lineHeight: 1.6, opacity: interpolate(frame, [BEATS.silenceEnd, BEATS.silenceEnd + 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
          What if the lesson didn't feel like a lesson?
        </div>
      )}

      {showAfter(frame, BEATS.gameStart, BEATS.gameWordsIn) && (
        <div style={{...centered, ...swooshOut(frame, BEATS.gameStart)}}>What if the lesson didn't feel like a lesson?</div>
      )}

      {frame >= BEATS.gameWordsIn && frame < BEATS.gameWordsOut + MOTION.swooshOutFrames && (
        <div style={{position: 'absolute', left: '13%', top: '30%', right: '8%', display: 'flex', flexDirection: 'column', gap: '1.1vh', fontSize: titleSize, fontWeight: 700, lineHeight: 1.1}}>
          {['STREAK.', 'PROGRESS.', 'LEVEL UP.'].map((word, i) => {
            const start = BEATS.gameWordsIn + i * GAME.wordStagger;
            if (frame < start) return null;
            const style = frame < BEATS.gameWordsOut ? swooshIn(frame, start, 'x') : swooshOut(frame, BEATS.gameWordsOut, 'x');
            return <div key={word} style={style}>{word}</div>;
          })}
        </div>
      )}

      {showAfter(frame, BEATS.progressStart, BEATS.revealStart) && (
        <div style={{...centered, flexDirection: 'column', gap: '2.2vh'}}>
          <div style={{width: '78%', display: 'flex', alignItems: 'center', gap: '4%', fontSize: bodySize * 0.66, fontVariantNumeric: 'tabular-nums'}}>
            <div style={{height: Math.max(7, unit * 0.009), flex: 1, backgroundColor: WHITE, position: 'relative'}}>
              <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${progress * 100}%`, backgroundColor: AMBER}} />
            </div>
            <span>XP {xp}</span>
          </div>
          {frame >= GAME.progressComplete && <div style={{fontSize: bodySize * 0.62}}>unlocked.</div>}
        </div>
      )}

      {showAfter(frame, BEATS.revealStart, BEATS.revealLineSwap) && (
        <div style={{...centered, fontSize: bodySize, fontWeight: 600}}>It's not a curriculum.</div>
      )}
      {showAfter(frame, BEATS.revealLineSwap, BEATS.revealEnd) && (
        <div style={{...centered, fontSize: titleSize * 1.3, fontWeight: 700}}>It's a game.</div>
      )}

      {showAfter(frame, BEATS.wordmarkIn, BEATS.end) && (
        <div style={{...centered, flexDirection: 'column', gap: '2.4vh'}}>
          <div style={{fontSize: bodySize * 0.75, fontWeight: 700, lineHeight: 1.7}}>
            <div>Thinking Bridge</div>
            <div dir="rtl" style={{fontFamily: ARABIC, lineHeight: 1.7}}>جسر التفكير</div>
          </div>
          {frame >= BEATS.subtitleIn && <div dir="rtl" style={{fontFamily: ARABIC, fontSize: bodySize * 0.38, lineHeight: 1.7}}>
            ٢٧ درس · مجاني ١٠٠٪ · بدون إنترنت
          </div>}
          {frame >= BEATS.subtitleIn + 16 && <div style={{fontSize: bodySize * 0.32, opacity: 0.82}}>@sciamrsherif · YouTube</div>}
        </div>
      )}
    </AbsoluteFill>
  );
};
