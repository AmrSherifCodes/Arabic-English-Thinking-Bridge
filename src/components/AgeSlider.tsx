import React from 'react';
import { useAgeSliderStore, AgeGroup } from '../store/useAgeSliderStore';

const ageGroups: AgeGroup[] = ['KG', 'Elementary', 'Middle', 'High', 'College', 'Adult'];

const labels: Record<AgeGroup, { ar: string; en: string }> = {
  KG: { ar: 'روضة', en: 'Kindergarten' },
  Elementary: { ar: 'ابتدائي', en: 'Elementary' },
  Middle: { ar: 'إعدادي', en: 'Middle' },
  High: { ar: 'ثانوي', en: 'High School' },
  College: { ar: 'جامعة', en: 'College' },
  Adult: { ar: 'بالغ', en: 'Adult' },
};

export const AgeSlider: React.FC<{ isArabic?: boolean }> = ({ isArabic = true }) => {
  const { ageGroup, setAgeGroup } = useAgeSliderStore();

  const currentIndex = ageGroups.indexOf(ageGroup);

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-surface rounded-2xl shadow-sm border border-border">
      <div className="flex justify-between mb-2">
        <h3 className="text-lg font-bold text-text">
          {isArabic ? 'المرحلة العمرية' : 'Age Group'}
        </h3>
        <span className="text-primary font-bold">
          {labels[ageGroup][isArabic ? 'ar' : 'en']}
        </span>
      </div>

      <input
        type="range"
        min="0"
        max={ageGroups.length - 1}
        step="1"
        value={currentIndex}
        onChange={(e) => setAgeGroup(ageGroups[parseInt(e.target.value, 10)])}
        className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
        aria-label={isArabic ? 'اختر المرحلة العمرية' : 'Select Age Group'}
      />

      <div className="flex justify-between mt-3 text-xs font-bold text-muted px-1">
        <span>{labels['KG'][isArabic ? 'ar' : 'en']}</span>
        <span>{labels['Adult'][isArabic ? 'ar' : 'en']}</span>
      </div>
    </div>
  );
};
