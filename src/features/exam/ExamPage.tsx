/**
 * CC0 1.0 Universal - Public Domain
 * Pedagogy inspired by Mihalis Eleftheriou & Language Transfer. Built in Alexandria. CC0.
 */

import React, { useState } from 'react';
import { TargetLang } from './types';
import { useSupporterMode } from './hooks/useSupporterMode';
import { ExamStartScreen } from './ExamStartScreen';
import { SupportCard } from './components/SupportCard';
import { ExamSession } from './ExamSession';

interface ExamPageProps {
  onBack?: () => void;
}

export const ExamPage: React.FC<ExamPageProps> = ({ onBack }) => {
  const { supporterMode, setSupporterMode } = useSupporterMode();
  const [step, setStep] = useState<'start' | 'support_card' | 'session'>('start');
  const [selectedLang, setSelectedLang] = useState<TargetLang>('en');
  const [isPlacementMode, setIsPlacementMode] = useState<boolean>(true);

  const handleStartSession = (lang: TargetLang, isPlacement: boolean) => {
    setSelectedLang(lang);
    setIsPlacementMode(isPlacement);

    // Show SupportCard once per session prior to starting questions
    setStep('support_card');
  };

  const handleProceedToSession = () => {
    setStep('session');
  };

  return (
    <div className="min-h-[100dvh] bg-[#0A0E13] text-[#EEF2F5] py-8 px-4 pt-safe pb-safe flex flex-col items-center justify-center font-arabic">
      {step === 'start' && (
        <ExamStartScreen
          onStartSession={handleStartSession}
          supporterMode={supporterMode}
          onToggleSupporterMode={setSupporterMode}
          onBack={onBack}
        />
      )}

      {step === 'support_card' && (
        <SupportCard
          onEnableSupporterMode={() => setSupporterMode(true)}
          onProceed={handleProceedToSession}
        />
      )}

      {step === 'session' && (
        <ExamSession
          targetLang={selectedLang}
          isPlacementMode={isPlacementMode}
          supporterMode={supporterMode}
          onExit={() => setStep('start')}
        />
      )}
    </div>
  );
};
