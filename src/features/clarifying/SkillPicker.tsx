import React from 'react';
import { ClarifyingSkill } from './useLocalModel';

interface Props {
    onSelect: (skill: ClarifyingSkill, topic: string) => void;
}

export const SkillPicker: React.FC<Props> = ({ onSelect }) => {
    return (
        <div className="p-4 space-y-4" dir="rtl">
            <h2 className="text-xl font-black text-white">اختار المهارة اللي عايز تتمرن عليها (Choose a Skill to Practice)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onClick={() => onSelect('writing', 'Your daily routine')} className="p-4 bg-stone-900 border border-stone-800 rounded-2xl hover:border-teal-400 text-start text-white font-bold transition">
                    ✍️ الكتابة (Writing) — يومك وروتينك اليومي
                </button>
                <button onClick={() => onSelect('speaking', 'Your favorite movie')} className="p-4 bg-stone-900 border border-stone-800 rounded-2xl hover:border-teal-400 text-start text-white font-bold transition">
                    🗣️ التحدث (Speaking) — فيلمك المفضل
                </button>
                <button onClick={() => onSelect('listening', 'A short story')} className="p-4 bg-stone-900 border border-stone-800 rounded-2xl hover:border-teal-400 text-start text-white font-bold transition">
                    🎧 الاستماع (Listening) — قصة قصيرة
                </button>
                <button onClick={() => onSelect('reading', 'A news article')} className="p-4 bg-stone-900 border border-stone-800 rounded-2xl hover:border-teal-400 text-start text-white font-bold transition">
                    📖 القراءة (Reading) — مقال إخباري مبسط
                </button>
            </div>
        </div>
    );
};
