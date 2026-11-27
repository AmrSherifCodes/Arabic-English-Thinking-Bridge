// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import React from 'react';
import { Compass, Globe, X, Check, Crown, Flame } from 'lucide-react';
import { CefrLevelId, CefrStage, PhaseId } from '../progression/types';

export interface LevelSwitcherSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: string;
  currentStage?: string;
  isArabic?: boolean;
  onSelectLevel: (level: CefrLevelId, stage: CefrStage, phaseId?: PhaseId) => void;
  onOpenPlacementTest: () => void;
  onOpenLanguageSelector: () => void;
}

export interface CefrTierItem {
  id: CefrLevelId;
  stage: CefrStage;
  phaseId: PhaseId;
  badge: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  accent?: string;
  isNew?: boolean;
  isBoss?: boolean;
}

export const CEFR_7_TIERS: CefrTierItem[] = [
  {
    id: 'A1',
    stage: 'Pre-A0',
    phaseId: 'A1.1',
    badge: 'Pre-A0',
    titleAr: 'Pre-A0 · الاتصال الأول',
    titleEn: 'Pre-A0 · First Contact',
    descAr: 'الأصوات والحروف، مصنع الاسم، وأهم كلمات النجاة',
    descEn: 'Script & sounds, Name Forge, essential survival words',
  },
  {
    id: 'A1',
    stage: 'A0',
    phaseId: 'A1.1',
    badge: 'A0',
    titleAr: 'A0 · بداية الشارع',
    titleEn: 'A0 · Street Starter',
    descAr: 'التحيات، الأرقام، الذوقيات، طلب الماء والطعام والمساعدة',
    descEn: 'Greetings, numbers, politeness, ordering food & asking for help',
  },
  {
    id: 'A1',
    stage: 'A1',
    phaseId: 'A1.2',
    badge: 'A1',
    titleAr: 'A1 · النجاة في المطار والمدينة',
    titleEn: 'A1 · Airport & City Survival',
    descAr: 'الجوازات، التاكسي والمترو، الفندق، الكافيهات، والاتجاهات',
    descEn: 'Immigration, taxis/metro, hotel check-in, cafes & directions',
  },
  {
    id: 'A2',
    stage: 'A2',
    phaseId: 'A2.1',
    badge: 'A2',
    titleAr: 'A2 · الحياة اليومية والتواصل',
    titleEn: 'A2 · Daily Life & Social Flow',
    descAr: 'تكوين صداقات، التسوق والخصم، الطبيب والصيدلية، والمكالمات',
    descEn: 'Making friends, shopping, doctor/pharmacy, calls & plans',
  },
  {
    id: 'B1',
    stage: 'B1',
    phaseId: 'B1.1',
    badge: 'B1',
    titleAr: 'B1 · المحادثة المستقلة',
    titleEn: 'B1 · Independent Conversation',
    descAr: 'حكي القصص، الجامعة والعمل، التعبير عن الرأي وحل مشاكل السفر',
    descEn: 'Storytelling, university/workplace, opinions & travel problems',
  },
  {
    id: 'B2',
    stage: 'B2',
    phaseId: 'B2.1',
    badge: 'B2',
    titleAr: 'B2 · طلاقة أهل اللغة والفروق الدقيقة',
    titleEn: 'B2 · Native Fluency & Nuance',
    descAr: 'تعبيرات الشارع والأمثال، الإقناع والاختلاف بلباقة، والروابط المتقدمة',
    descEn: 'Colloquial idioms, polite persuasion, nuance, connectors & fast listening',
    accent: '#22D3EE',
    isNew: true,
  },
  {
    id: 'C1',
    stage: 'C1',
    phaseId: 'C1.1',
    badge: 'C1',
    titleAr: 'C1 · الإتقان المتقدم · ⚔️ بوابة الأسطورة',
    titleEn: 'C1 · Sophisticated Native Mastery',
    descAr: 'المناظرات، خطاب العلوم والأعمال، الدعابة وتبديل الأسلوب الرسمي والودي',
    descEn: 'Abstract debates, science/business rhetoric, humor, register & Boss Gate C1',
    accent: '#F59E0B',
    isNew: true,
    isBoss: true,
  },
];

export const LevelSwitcherSheet: React.FC<LevelSwitcherSheetProps> = ({
  isOpen,
  onClose,
  currentLevel,
  currentStage,
  isArabic = true,
  onSelectLevel,
  onOpenPlacementTest,
  onOpenLanguageSelector,
}) => {
  if (!isOpen) return null;

  const effectiveActive = currentStage || currentLevel;

  return (
    <div
      data-testid="level-switcher-sheet"
      className="fixed inset-0 z-[75] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      dir={isArabic ? 'rtl' : 'ltr'}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md max-h-[88dvh] flex flex-col rounded-t-3xl sm:rounded-3xl border shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 flex items-center justify-between gap-2 px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h2 className="text-base font-black text-[#F8FAFC]">
              {isArabic ? 'سُلّم الإتقان الكامل (Pre-A0 → C1)' : '7-Tier Mastery Ladder (Pre-A0 → C1)'}
            </h2>
            <p className="text-[11px] font-bold text-[#CBD5E1]">
              {isArabic ? 'كل المستويات مفتوحة 100% مجاناً وبدون إنترنت' : 'All 7 CEFR tiers unlocked — 100% free & offline'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={isArabic ? 'إغلاق' : 'Close'}
            className="min-h-[48px] min-w-[48px] rounded-xl flex items-center justify-center text-[#CBD5E1] cursor-pointer shrink-0"
            style={{ backgroundColor: 'var(--surface-2)' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 space-y-2">
          {CEFR_7_TIERS.map((lvl) => {
            const active =
              effectiveActive === lvl.stage ||
              (lvl.stage === 'A1' && currentLevel === 'A1' && effectiveActive !== 'Pre-A0' && effectiveActive !== 'A0') ||
              (lvl.id === currentLevel && (lvl.id === 'A2' || lvl.id === 'B1' || lvl.id === 'B2' || lvl.id === 'C1'));

            return (
              <button
                key={`${lvl.id}-${lvl.stage}`}
                type="button"
                data-testid={`level-tier-${lvl.stage}`}
                onClick={() => {
                  onSelectLevel(lvl.id, lvl.stage, lvl.phaseId);
                  onClose();
                }}
                className="w-full p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-start cursor-pointer transition active:scale-[0.99]"
                style={{
                  backgroundColor: active ? 'rgba(16, 185, 129, 0.16)' : 'var(--bg)',
                  borderColor: active ? '#10B981' : lvl.accent ? `${lvl.accent}55` : 'var(--border)',
                }}
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-black text-[#F8FAFC]">
                      {isArabic ? lvl.titleAr : lvl.titleEn}
                    </span>
                    {lvl.isBoss ? (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-[#F59E0B]/20 text-[#FBBF24] border border-[#F59E0B]/40">
                        <Crown size={10} />
                        <span>C1</span>
                      </span>
                    ) : lvl.isNew ? (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-[#22D3EE]/20 text-[#22D3EE] border border-[#22D3EE]/40">
                        <Flame size={10} />
                        <span>{isArabic ? 'جديد' : 'NEW'}</span>
                      </span>
                    ) : null}
                  </div>
                  <div className="text-xs text-[#CBD5E1] leading-snug">
                    {isArabic ? lvl.descAr : lvl.descEn}
                  </div>
                </div>
                {active && <Check size={18} className="text-[#10B981] shrink-0" />}
              </button>
            );
          })}
        </div>

        <div className="shrink-0 grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-4 border-t" style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenPlacementTest();
            }}
            className="min-h-[48px] px-3.5 py-2.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 cursor-pointer tb-btn-3d tb-btn-emerald"
          >
            <Compass size={16} />
            <span>{isArabic ? 'اختبار تحديد المستوى (60ث)' : '60s Placement Test'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenLanguageSelector();
            }}
            className="min-h-[48px] px-3.5 py-2.5 rounded-2xl border font-black text-xs text-[#F8FAFC] flex items-center justify-center gap-2 cursor-pointer"
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
          >
            <Globe size={16} className="text-[#22D3EE]" />
            <span>{isArabic ? 'تغيير اللغة' : 'Change Language'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
