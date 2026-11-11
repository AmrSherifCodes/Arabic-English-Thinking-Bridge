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
            // Save to localStorage
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
        }
    }, [diagnosis, selectedSkill]);

    if (!selectedSkill) {
        return (
            <div className="max-w-xl md:max-w-3xl lg:max-w-4xl mx-auto space-y-3">
                {!isNative && (
                    <div className="mx-4 p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs font-bold text-teal-300 flex items-center justify-between">
                        <span>🤖 المدرب الذكي متاح على تطبيق الأندرويد فقط</span>
                        <span className="opacity-75">AI coach is Android-only</span>
                    </div>
                )}
                <SkillPicker onSelect={(skill, t) => {
                    setSelectedSkill(skill);
                    setTopic(t);
                }} />
            </div>
        );
    }

    const lastAssistantMsg = messages.filter(m => m.role === 'assistant').pop()?.content || '';

    return (
        <div className="max-w-xl md:max-w-3xl lg:max-w-4xl mx-auto p-4 md:p-6">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => setSelectedSkill(null)} className="text-muted hover:text-text text-sm font-bold">
                    ← {isNative ? 'اختر مهارة أخرى' : 'Back to Skills'}
                </button>
                <div className="text-sm font-bold">
                    {isNative ? (
                        modelAvailable === true ? (
                            <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                                🤖 مدرب محلي · Local AI Coach
                            </span>
                        ) : modelAvailable === false ? (
                            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                🤖 مدرب محلي (أسئلة جاهزة)
                            </span>
                        ) : (
                            <span className="px-3 py-1 rounded-full bg-surface text-muted animate-pulse">
                                جاري تجهيز المدرب...
                            </span>
                        )
                    ) : (
                        <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            📚 أسئلة جاهزة · Guided Questions
                        </span>
                    )}
                </div>
            </div>

            {!isNative && (
                <p className="text-[11px] text-muted text-center mb-3">
                    🤖 المدرب الذكي (AI Coach) متاح على تطبيق الأندرويد فقط · Web uses guided questions
                </p>
            )}

            {diagnosis ? (
                <DiagnosisCard diagnosis={diagnosis} onClose={() => setSelectedSkill(null)} />
            ) : (
                <>
                    <div className="text-center my-2 text-xs font-bold text-muted">
                        السؤال {turnCount + 1} من 4 · Turn {turnCount + 1} of 4
                    </div>
                    {messages.map((m, idx) => {
                        if (m.role === 'system') return null;
                        return (
                            <div key={idx} className={`my-2 p-3.5 rounded-2xl ${m.role === 'user' ? 'bg-teal-500/10 text-right text-teal-300 border border-teal-500/20' : 'bg-surface text-left text-text border border-border'}`}>
                                <p className="text-[10px] font-black uppercase opacity-70 mb-1">{m.role === 'user' ? 'You (أنت)' : (isNative && modelAvailable ? 'Coach (المدرب)' : 'Guided Coach (الأسئلة)')}</p>
                                <p className="text-sm font-medium leading-relaxed">{m.content}</p>
                            </div>
                        );
                    })}
                    {loading && <div className="text-center text-muted animate-pulse text-xs py-2">جاري التفكير... Thinking...</div>}
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

