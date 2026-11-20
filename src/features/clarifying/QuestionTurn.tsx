import React, { useState } from 'react';
import { useSpeech } from '../../hooks/useSpeech';
import { DualSpeedAudio } from '../../components/DualSpeedAudio';

interface Props {
    assistantMessage: string;
    onRespond: (text: string) => void;
    loading: boolean;
    skill: string;
}

export const QuestionTurn: React.FC<Props> = ({ assistantMessage, onRespond, loading, skill }) => {
    const [input, setInput] = useState('');
    const { isListening, startListening, stopListening } = useSpeech();

    const displayMsg = assistantMessage || 'ما هي فكرتك أو إجابتك بالإنجليزية؟ (How would you express this?)';

    const handleVoiceClick = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening('en-US');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !loading) {
            onRespond(input);
            setInput('');
        }
    };

    return (
        <div className="space-y-4 my-4" dir="rtl">
            <div className="bg-stone-900 p-4 rounded-2xl border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-teal-400">المدرب التفاعلي (GUIDED COACH):</span>
                    <DualSpeedAudio text={displayMsg} showLabels={true} />
                </div>
                <p className="text-white text-sm font-semibold leading-relaxed text-start" dir="ltr">{displayMsg}</p>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="اكتب إجابتك هنا... / Write your answer..."
                    className="flex-1 bg-stone-900 border border-stone-800 rounded-2xl p-4 text-white text-sm font-bold placeholder:text-stone-500 outline-none focus:border-teal-400"
                    disabled={loading}
                    dir="ltr"
                />
                {skill === 'speaking' && (
                    <button
                        type="button"
                        onClick={handleVoiceClick}
                        className={`p-4 rounded-2xl border ${isListening ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-stone-900 border-stone-800 text-white'}`}
                        title="سجل صوتك"
                    >
                        🎙️
                    </button>
                )}
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="bg-emerald-500 text-slate-950 font-black px-6 py-4 rounded-2xl hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-300 disabled:cursor-not-allowed transition shadow-lg cursor-pointer text-sm shrink-0"
                >
                    إرسال · Send
                </button>
            </form>
        </div>
    );
};
