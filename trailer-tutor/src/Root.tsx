import React from 'react';
import {Composition} from 'remotion';
import {TutorTax} from './TutorTax';
import {DURATION_FRAMES, FPS} from './timeline';

export const Root: React.FC = () => (
  <>
    <Composition id="TutorTax-9x16" component={TutorTax} durationInFrames={DURATION_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="TutorTax-1x1" component={TutorTax} durationInFrames={DURATION_FRAMES} fps={FPS} width={1080} height={1080} />
    <Composition id="TutorTax-16x9" component={TutorTax} durationInFrames={DURATION_FRAMES} fps={FPS} width={1920} height={1080} />
  </>
);
