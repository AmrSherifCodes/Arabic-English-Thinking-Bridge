import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AgeGroup = 'KG' | 'Elementary' | 'Middle' | 'High' | 'College' | 'Adult';

interface AgeSliderState {
  ageGroup: AgeGroup;
  setAgeGroup: (group: AgeGroup) => void;
}

export const useAgeSliderStore = create<AgeSliderState>()(
  persist(
    (set) => ({
      ageGroup: 'Adult', // Default to adult
      setAgeGroup: (group) => set({ ageGroup: group }),
    }),
    {
      name: 'tb-age-slider-storage', // key in local storage
    }
  )
);
