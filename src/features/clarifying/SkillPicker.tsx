import React from 'react';
import { ClarifyingSkill } from './useLocalModel';

interface Props {
    onSelect: (skill: ClarifyingSkill, topic: string) => void;
}

export const SkillPicker: React.FC<Props> = ({ onSelect }) => {
    return (
        <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold text-text">Choose a Skill to Practice</h2>
            <div className="grid grid-cols-2 gap-4">
                <button onClick={() => onSelect('writing', 'Your daily routine')} className="p-4 bg-surface border border-border rounded-xl hover:border-accent-teal">
                    ✍️ Writing (الكتابة)
                </button>
                <button onClick={() => onSelect('speaking', 'Your favorite movie')} className="p-4 bg-surface border border-border rounded-xl hover:border-accent-teal">
                    🗣️ Speaking (التحدث)
                </button>
                <button onClick={() => onSelect('listening', 'A short story')} className="p-4 bg-surface border border-border rounded-xl hover:border-accent-teal">
                    🎧 Listening (الاستماع)
                </button>
                <button onClick={() => onSelect('reading', 'A news article')} className="p-4 bg-surface border border-border rounded-xl hover:border-accent-teal">
                    📖 Reading (القراءة)
                </button>
            </div>
        </div>
    );
};
