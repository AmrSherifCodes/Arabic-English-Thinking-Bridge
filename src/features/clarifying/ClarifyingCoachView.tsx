import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { SkillPicker } from './SkillPicker';
import { QuestionTurn } from './QuestionTurn';
import { DiagnosisCard } from './DiagnosisCard';
import { useLocalModel, ClarifyingSkill } from './useLocalModel';

interface Props {
    onClose?: () => void;
}

export const ClarifyingCoachView: React.FC<Props> = ({ onClose }) => {
    const [selectedSkill, setSelectedSkill] = useState<ClarifyingSkill | null>(null);
    const [topic, setTopic] = useState('');
    const isNative = Capacitor.isNativePlatform();

    const { messages, loading, modelAvailable, sendLearnerResponse, diagnosis, turnCount } =
        useLocalModel(selectedSkill || 'writing', topic);

    useEffect(() => {
        if (diagnosis && selectedSkill) {
            const savedLevels = JSON.parse(localStorage.getItem('tb.skillLevels') || '{}');
            savedLevels[selectedSkill] = diagnosis.estimated_level;
            localStorage.setItem('tb.skillLevels', JSON.stringify(savedLevels));

            const lastDiag = {
                skill: selectedSkill,
                level: diagnosis.estimated_level,
                gaps: diagnosis.gaps,
                timestamp: Date.now()
            };
            localStorage.setItem('tb.lastDiagnosis', JSON.stringify(lastDiag));

            try {
                const profileRaw = localStorage.getItem('tb.activeProfileConfig');
                const profile = profileRaw ? JSON.parse(profileRaw) : {};
                profile.cefrLevel = diagnosis.estimated_level;
                profile.estimated_level = diagnosis.estimated_level;
                localStorage.setItem('tb.activeProfileConfig', JSON.stringify(profile));
            } catch (e) {
                console.warn('Failed to update activeProfileConfig:', e);
            }
        }
    }, [diagnosis, selectedSkill]);

    if (!selectedSkill) {
        return (
            <div className="max-w-xl md:max-w-3xl lg:max-w-4xl mx-auto space-y-3" dir="rtl">
                <div className="mx-4 p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-xs font-bold text-teal-300 flex items-center justify-between shadow-sm">
                    <span>💡 الوضع التفاعلي يعمل بدون إنترنت — والمدرب الصوتي الكامل متاح أيضاً على تطبيق الأندرويد</span>
                    <span className="opacity-75 hidden sm:inline">100% Offline AI Bridge</span>
                </div>
                <SkillPicker onSelect={(skill, t) => {
                    setSelectedSkill(skill);
                    setTopic(t);
                }} />
            </div>
        );
    }

    return (
        <div className="max-w-xl md:max-w-3xl lg:max-w-4xl mx-auto p-4 md:p-6" dir="rtl">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => setSelectedSkill(null)} className="text-stone-400 hover:text-white text-xs font-bold px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 transition">
                    ← رجوع للمهارات (Back to Skills)
                </button>
                <div className="text-xs font-bold">
                    <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        🤖 المدرب التفاعلي (Guided Coach)
                    </span>
                </div>
            </div>

            {diagnosis ? (
                <DiagnosisCard diagnosis={diagnosis} onClose={() => setSelectedSkill(null)} />
            ) : (
                <>
                    <div className="text-center my-3 text-xs font-black text-amber-400">
                        السؤال {turnCount + 1} من 3 · Turn {turnCount + 1} of 3
                    </div>
                    {messages.map((m, idx) => {
                        if (m.role === 'system') return null;
                        return (
                            <div key={idx} className={`my-3 p-4 rounded-2xl ${m.role === 'user' ? 'bg-teal-950/50 text-right text-teal-300 border border-teal-500/30' : 'bg-stone-900 text-left text-white border border-stone-800'}`}>
                                <p className="text-[10px] font-black uppercase opacity-70 mb-1 text-start">{m.role === 'user' ? 'أنت (You)' : 'المدرب (Coach)'}</p>
                                <p className="text-sm font-semibold leading-relaxed text-start" dir="auto">{m.content}</p>
                            </div>
                        );
                    })}
                    {loading && <div className="text-center text-stone-400 animate-pulse text-xs py-3">جاري التفكير... Thinking...</div>}
                    {!loading && (
                        <QuestionTurn
                            assistantMessage=""
                            onRespond={sendLearnerResponse}
                            loading={loading}
                            skill={selectedSkill}
                        />
                    )}
                </>
            )}
        </div>
    );
};
