import React, { Suspense } from 'react';
import type { LanguageCode } from '../../types/story';

const StoryEngine = React.lazy(() =>
  import('./StoryEngine').then((m) => ({ default: m.StoryEngine }))
);
const chapterPromise = import('../../data/storyData');

export const StoryEngineLoader: React.FC<{
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  onComplete: () => void;
  onBack: () => void;
}> = (props) => {
  const [chapter, setChapter] = React.useState<any>(null);

  React.useEffect(() => {
    chapterPromise.then((m) => setChapter(m.chapter1));
  }, []);

  if (!chapter) return null;

  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-[#0A0E13] text-[#EEF2F5] flex items-center justify-center">جاري تحميل القصة...</div>}>
      <StoryEngine {...props} chapter={chapter} />
    </Suspense>
  );
};
