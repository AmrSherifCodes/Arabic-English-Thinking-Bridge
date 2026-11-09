import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BEATS, COUNTDOWN} from './timeline';

const BLACK = '#000000';
const WHITE = '#FFFFFF';
const TEAL = '#2DD4BF';
const AMBER = '#F5B942';
const LATIN = "'Readex Pro', 'Inter', system-ui, sans-serif";
const ARABIC = "'Cairo', Tahoma, 'Segoe UI', sans-serif";
const CMD = "Consolas, 'Courier New', monospace";

const inRange = (frame: number, start: number, end: number) => frame >= start && frame < end;
const clamped = (frame: number, from: number, to: number, start: number, end: number, easing = Easing.inOut(Easing.cubic)) =>
  interpolate(frame, [from, to], [start, end], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

const ArabicLine: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div dir="rtl" lang="ar" style={{fontFamily: ARABIC, lineHeight: 1.75, textAlign: 'center', unicodeBidi: 'plaintext', ...style}}>{children}</div>
);

const StickFigure: React.FC<{size: number; happy: boolean; sad: boolean; enter: number; frame: number}> = ({size, happy, sad, enter, frame}) => {
  const bob = happy ? Math.sin((frame - BEATS.openBridgeReveal) / 7) * 4 : Math.sin(frame / 11) * (sad ? 2 : 4);
  const headAngle = sad ? 12 : happy ? -5 : 0;
  const armAngle = happy ? clamped(frame, BEATS.openBridgeReveal, BEATS.openBridgeReveal + 18, 0, -34) : sad ? 22 : 0;
  const opacity = clamped(frame, enter, enter + 18, 0, 1, Easing.out(Easing.cubic));
  return (
    <svg width={size * 0.62} height={size} viewBox="0 0 300 480" style={{overflow: 'visible', opacity, transform: `translateY(${bob}px)`}} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round">
        <g transform={`rotate(${headAngle} 150 82)`}>
          <circle cx="150" cy="82" r="43" />
          <path d={happy ? 'M132 96 Q150 113 169 96' : sad ? 'M133 106 Q151 91 169 106' : 'M136 105 L164 105'} strokeWidth="8" />
          <circle cx="137" cy="77" r="4" fill="currentColor" stroke="none" />
          <circle cx="163" cy="77" r="4" fill="currentColor" stroke="none" />
        </g>
        <path d="M150 128 L150 300" />
        <path d={happy ? `M150 173 L82 125 L48 ${105 + armAngle}` : sad ? 'M150 174 L95 226 L78 280' : 'M150 174 L88 221 L76 265'} />
        <path d={happy ? `M150 173 L214 128 L250 ${98 + armAngle}` : sad ? 'M150 174 L207 231 L224 281' : 'M150 174 L212 220 L225 265'} />
        <path d={happy ? 'M150 300 L104 378 L74 448' : sad ? 'M150 300 L124 382 L117 449' : 'M150 300 L119 380 L112 450'} />
        <path d={happy ? 'M150 300 L197 372 L222 446' : sad ? 'M150 300 L184 382 L198 449' : 'M150 300 L183 380 L196 450'} />
        {sad && <g strokeWidth="9"><path d="M224 281 L240 294 L252 288" /><rect x="223" y="294" width="58" height="38" rx="8" /></g>}
      </g>
    </svg>
  );
};

export const TutorTax: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const unit = Math.min(width, height);
  const wide = width > height;
  const small = unit * 0.044;
  const medium = unit * 0.067;
  const large = unit * 0.115;
  const bg = frame >= BEATS.endCardStart ? BLACK
    : frame >= BEATS.giftLine && frame < BEATS.endCardStart ? AMBER
      : frame >= BEATS.openBridgeReveal && frame < BEATS.giftLine ? TEAL
        : frame >= BEATS.silenceStart && frame < BEATS.openBridgeReveal ? BLACK
          : frame >= BEATS.storyStart && frame < BEATS.silenceStart ? AMBER : BLACK;
  const fg = bg === BLACK ? WHITE : BLACK;
  const showHandle = !inRange(frame, BEATS.silenceStart, BEATS.silenceEnd);

  let camera = 1;
  if (inRange(frame, BEATS.storyStart, BEATS.silenceStart)) {
    camera = frame < BEATS.paywallAppears
      ? clamped(frame, BEATS.storyStart, BEATS.paywallAppears, 0.94, 1.08)
      : frame < BEATS.studentSinks
        ? clamped(frame, BEATS.paywallAppears, BEATS.studentSinks, 1.08, 1.15)
        : clamped(frame, BEATS.studentSinks, BEATS.silenceStart, 1.15, 0.96);
  } else if (inRange(frame, BEATS.questionAfterSilence, BEATS.openBridgeReveal)) {
    camera = clamped(frame, BEATS.questionAfterSilence, BEATS.openBridgeReveal, 0.96, 1.08);
  } else if (inRange(frame, BEATS.openBridgeReveal, BEATS.giftLine)) {
    camera = clamped(frame, BEATS.openBridgeReveal, BEATS.giftLine, 1.12, 0.98);
  } else if (inRange(frame, BEATS.giftLine, BEATS.endCardStart)) {
    camera = clamped(frame, BEATS.giftLine, BEATS.endCardStart, 1.12, 1);
  }

  const cursorOn = Math.floor(frame / 16) % 2 === 0;
  const copy = 'My gift for Humanity...';
  const typed = copy.slice(0, Math.max(0, Math.min(copy.length, Math.floor((frame - BEATS.typingStart) / 5))));
  const count = COUNTDOWN.find(({frame: start}, index) => frame >= start && frame < (COUNTDOWN[index + 1]?.frame ?? BEATS.storyStart));
  const countScale = count ? clamped(frame, count.frame, count.frame + 9, 1.48, 1, Easing.out(Easing.back(1.25))) : 1;
  const happy = frame >= BEATS.openBridgeReveal && frame < BEATS.endCardStart;
  const storyVisible = inRange(frame, BEATS.studentEnters, BEATS.silenceStart);
  const studentSize = unit * (wide ? 0.43 : 0.36);
  const studentStyle: React.CSSProperties = wide
    ? {position: 'absolute', left: '7%', top: '25%', width: studentSize * 0.62, height: studentSize}
    : {position: 'absolute', left: '11%', top: '52%', width: studentSize * 0.62, height: studentSize};

  const statItems = [
    {start: BEATS.lessonCount, end: BEATS.wordCount, ar: '٢٧ درسًا', en: 'LESSONS'},
    {start: BEATS.wordCount, end: BEATS.freeClaim, ar: '١٠٬٠٠٠+ كلمة', en: 'WORDS'},
    {start: BEATS.freeClaim, end: BEATS.offlineClaim, ar: 'مجاني ١٠٠٪', en: 'NO PAYWALL'},
    {start: BEATS.offlineClaim, end: BEATS.spacedReviewClaim, ar: 'يعمل بدون إنترنت', en: 'WORKS OFFLINE'},
    {start: BEATS.spacedReviewClaim, end: BEATS.giftLine, ar: 'مراجعة ذكية بتكرار متباعد', en: 'SM-2 SPACED REVIEW'},
  ];
  const stat = statItems.find((item) => inRange(frame, item.start, item.end));

  return (
    <AbsoluteFill style={{backgroundColor: bg, color: fg, fontFamily: LATIN, overflow: 'hidden'}}>
      <Audio src={staticFile('audio/tutor-tax-sfx.wav')} />

      <AbsoluteFill style={{transform: `scale(${camera})`, transformOrigin: '50% 50%'}}>
        {inRange(frame, BEATS.terminalStart, BEATS.countdownStart) && (
          <div style={{position: 'absolute', left: '8%', right: '8%', top: wide ? '33%' : '30%', fontFamily: CMD, textAlign: 'left'}}>
            <div style={{fontSize: unit * 0.022, color: TEAL, letterSpacing: '0.09em', marginBottom: '1.2em'}}>C:\THINKING_BRIDGE\GIFT.EXE</div>
            <div style={{fontSize: unit * 0.053, lineHeight: 1.55, whiteSpace: 'nowrap'}}>
              <span style={{color: AMBER}}>&gt; </span>{typed}
              {frame < BEATS.typingComplete && cursorOn && <span style={{color: TEAL}}>▌</span>}
            </div>
          </div>
        )}

        {count && (
          <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{fontSize: unit * 0.44, lineHeight: 0.9, fontWeight: 800, transform: `scale(${countScale})`, fontVariantNumeric: 'tabular-nums'}}>{count.label}</div>
            <div style={{fontFamily: CMD, fontSize: unit * 0.022, letterSpacing: '0.14em', marginTop: '3vh', color: TEAL}}>READY_</div>
          </div>
        )}

        {storyVisible && (
          <>
            <div style={studentStyle}>
              <StickFigure size={studentSize} happy={false} sad={frame >= BEATS.studentSinks} enter={BEATS.studentEnters} frame={frame} />
            </div>

            {frame < BEATS.paywallAppears && (
              <div style={{position: 'absolute', left: wide ? '43%' : '10%', right: wide ? '8%' : '10%', top: wide ? '38%' : '14%', textAlign: 'center'}}>
                <ArabicLine style={{fontSize: medium, fontWeight: 700}}>{frame < BEATS.courseFound ? 'تفتح دورة جديدة...' : 'وأخيرًا، دورة مناسبة!'}</ArabicLine>
                <div style={{fontFamily: CMD, fontSize: small * 0.58, marginTop: '1.5vh', opacity: 0.72}}>COURSE FOUND</div>
              </div>
            )}

            {frame >= BEATS.paywallAppears && (
              <div style={{
                position: 'absolute', left: wide ? '43%' : '8%', right: wide ? '8%' : '8%',
                top: wide ? '24%' : '12%', minHeight: wide ? '48%' : '38%',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                backgroundColor: BLACK, color: WHITE, padding: '4%', boxSizing: 'border-box',
                borderRadius: unit * 0.025, textAlign: 'center',
              }}>
                <svg width={unit * 0.11} height={unit * 0.11} viewBox="0 0 100 100" aria-hidden="true">
                  <path d="M28 44V30a22 22 0 0 1 44 0v14" fill="none" stroke={AMBER} strokeWidth="9" strokeLinecap="round" />
                  <rect x="18" y="42" width="64" height="48" rx="9" fill={AMBER} />
                  <circle cx="50" cy="63" r="5" fill={BLACK} />
                  <path d="M50 67v9" stroke={BLACK} strokeWidth="5" strokeLinecap="round" />
                </svg>
                <ArabicLine style={{fontSize: medium * 0.84, fontWeight: 700, marginTop: '1.4vh'}}>الدورة مقفولة</ArabicLine>
                <ArabicLine style={{fontSize: small * 0.84, marginTop: '0.8vh', color: AMBER}}>ادفع لفتحها</ArabicLine>
                <div style={{marginTop: '2vh', padding: '0.65em 1.2em', border: `2px solid ${AMBER}`, color: AMBER, fontSize: small * 0.52, fontFamily: CMD, letterSpacing: '0.08em'}}>PAY TO UNLOCK</div>
                {frame >= BEATS.studentSinks && <ArabicLine style={{fontSize: small * 0.72, marginTop: '2vh'}}>كان نفسه يبدأ... لكن الدفع وقفه.</ArabicLine>}
              </div>
            )}
          </>
        )}

        {inRange(frame, BEATS.questionAfterSilence, BEATS.openBridgeReveal) && (
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10%'}}>
            <ArabicLine style={{fontSize: medium, fontWeight: 650}}>ماذا لو كان التعلّم متاحًا للجميع؟</ArabicLine>
          </div>
        )}

        {inRange(frame, BEATS.openBridgeReveal, BEATS.lessonCount) && (
          <>
            <div style={{position: 'absolute', top: wide ? '17%' : '9%', left: wide ? '43%' : '8%', right: '8%'}}>
              <ArabicLine style={{fontSize: medium * 1.12, fontWeight: 800}}>التعلّم بلا حواجز.</ArabicLine>
            </div>
            <div style={wide
              ? {position: 'absolute', left: '7%', top: '25%', width: studentSize * 0.62, height: studentSize}
              : {position: 'absolute', left: '35%', top: '34%', width: studentSize * 0.62, height: studentSize}}>
              <StickFigure size={studentSize} happy frame={frame} sad={false} enter={BEATS.openBridgeReveal} />
            </div>
            <div style={{position: 'absolute', left: wide ? '43%' : '10%', right: wide ? '8%' : '10%', bottom: wide ? '16%' : '10%', textAlign: 'center', fontFamily: CMD, fontSize: small * 0.54, letterSpacing: '0.1em'}}>OPEN  ·  FREE  ·  OFFLINE</div>
          </>
        )}

        {stat && (
          <>
            <div style={wide
              ? {position: 'absolute', left: '7%', top: '25%', width: studentSize * 0.62, height: studentSize}
              : {position: 'absolute', right: '9%', top: '10%', width: studentSize * 0.62, height: studentSize}}>
              <StickFigure size={studentSize} happy frame={frame} sad={false} enter={BEATS.openBridgeReveal} />
            </div>
            <div style={{position: 'absolute', left: wide ? '37%' : '8%', right: wide ? '6%' : '8%', top: wide ? '30%' : '48%', textAlign: 'center'}}>
              <ArabicLine style={{fontSize: large, fontWeight: 800, lineHeight: 1.65}}>{stat.ar}</ArabicLine>
              <div style={{fontFamily: CMD, fontSize: small * 0.6, letterSpacing: '0.12em', marginTop: '1.5vh'}}>{stat.en}</div>
            </div>
            <div style={{position: 'absolute', bottom: '12%', left: '8%', right: '8%', display: 'flex', justifyContent: 'center', gap: unit * 0.025}}>
              {statItems.map((item, i) => <div key={item.en} style={{width: unit * 0.018, height: unit * 0.018, borderRadius: '50%', backgroundColor: i === statItems.indexOf(stat) ? BLACK : 'rgba(0,0,0,.25)'}} />)}
            </div>
          </>
        )}

        {inRange(frame, BEATS.giftLine, BEATS.endCardStart) && (
          <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '9%', textAlign: 'center'}}>
            {frame < BEATS.brandReveal
              ? <ArabicLine style={{fontSize: medium * 0.9}}>هديتي للإنسانية...</ArabicLine>
              : <div style={{transform: `scale(${clamped(frame, BEATS.brandReveal, BEATS.brandReveal + 12, 1.18, 1, Easing.out(Easing.cubic))})`}}>
                  <div style={{fontSize: Math.min(large * 1.17, width * 0.1), fontWeight: 800, letterSpacing: '-0.045em'}}>Thinking Bridge</div>
                  <ArabicLine style={{fontSize: medium * 0.82, fontWeight: 700, marginTop: '1.1vh'}}>جسر التفكير</ArabicLine>
                </div>}
          </div>
        )}

        {inRange(frame, BEATS.endCardWordmark, BEATS.end) && (
          <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: wide ? '7%' : '9%', textAlign: 'center'}}>
            <div style={{fontSize: large * 0.9, fontWeight: 800, letterSpacing: '-0.04em'}}>Thinking Bridge</div>
            <ArabicLine style={{fontSize: medium * 0.9, fontWeight: 700, marginTop: '0.7vh'}}>جسر التفكير</ArabicLine>
            {frame >= BEATS.endCardDetails && <>
              <ArabicLine style={{fontSize: small * 0.64, marginTop: '2.1vh'}}>٢٧ درسًا · ١٠٬٠٠٠+ كلمة · مجاني ١٠٠٪</ArabicLine>
              <ArabicLine style={{fontSize: small * 0.64}}>يعمل بدون إنترنت · مراجعة ذكية <bdi dir="ltr">SM-2</bdi></ArabicLine>
            </>}
            {frame >= BEATS.endCardCta && <ArabicLine style={{fontSize: small * 0.74, fontWeight: 700, marginTop: '2.4vh', color: TEAL}}>ابدأ رحلتك اليوم</ArabicLine>}
          </div>
        )}
      </AbsoluteFill>

      {showHandle && <div style={{position: 'absolute', bottom: '3.5%', left: '4%', zIndex: 10, fontFamily: CMD, fontSize: unit * 0.018, letterSpacing: '0.04em', color: fg, opacity: 0.92}}>@SciAmrSherif</div>}
    </AbsoluteFill>
  );
};
