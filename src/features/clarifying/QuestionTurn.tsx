import React, { useState } from 'react';
import { useSpeech } from '../../hooks/useSpeech';

interface Props {
    assistantMessage: string;
    onRespond: (text: string) => void;
    loading: boolean;
    skill: string;
}

export const QuestionTurn: React.FC<Props> = ({ assistantMessage, onRespond, loading, skill }) => {
    const [input, setInput] = useState('');
    const { isListening, startListening, stopListening } = useSpeech();

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
        <div className="space-y-4 my-4">
            <div className="bg-surface p-4 rounded-xl border border-border">
                <p className="text-accent-teal font-semibold">Coach:</p>
                <p className="text-text mt-1">{assistantMessage}</p>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Write your answer..."
                    className="flex-1 bg-surface border border-border rounded-xl p-3 text-text"
                    disabled={loading}
                />
                {skill === 'speaking' && (
                    <button
                        type="button"
                        onClick={handleVoiceClick}
                        className={`p-3 rounded-xl border ${isListening ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-surface border-border text-text'}`}
                    >
                        🎙️
                    </button>
                )}
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="bg-accent-teal text-bg font-bold px-4 py-3 rounded-xl disabled:opacity-50"
                >
                    Send
                </button>
            </form>
        </div>
    );
};
