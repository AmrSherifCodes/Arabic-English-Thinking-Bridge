import { useState, useEffect } from 'react';
import { loadModel, generateResponse } from './modelClient';
import { getFallbackQuestion, generateFallbackDiagnosis } from './fallbackQuestions';

export type ClarifyingSkill = 'writing' | 'speaking' | 'listening' | 'reading';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export function useLocalModel(skill: ClarifyingSkill, topic: string) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [modelAvailable, setModelAvailable] = useState<boolean | null>(null);
    const [diagnosis, setDiagnosis] = useState<any>(null);
    const [turnCount, setTurnCount] = useState(0);

    useEffect(() => {
        let isMounted = true;
        const init = async () => {
            const available = await loadModel();
            if (!isMounted) return;
            setModelAvailable(available);

            // Start the conversation
            const systemPrompt = "You are a Socratic English coach for Egyptian Arabic speakers. Ask ONE clarifying question per turn, in the learner's dialect. Max 2 sentences. Never lecture. Never translate. Push the learner to elaborate, give examples, or rephrase. Track which skill is being trained: writing, speaking, listening, or reading. After 4 turns, output the JSON diagnosis schema.";

            let initialAssistantMsg = "";
            if (skill === 'writing') initialAssistantMsg = `اكتب جملتين عن ${topic}. بعدين هسألك ليه.`;
            if (skill === 'speaking') initialAssistantMsg = `اتكلم عن ${topic} لمدة 30 ثانية. سمعني.`;
            if (skill === 'listening') initialAssistantMsg = `هقولك جملة مرة واحدة عن ${topic}. قولي سمعت إيه.`;
            if (skill === 'reading') initialAssistantMsg = `اقرا الفقرة دي وقولي الفكرة الرئيسية في جملة واحدة عن ${topic}.`;

            setMessages([
                { role: 'system', content: systemPrompt },
                { role: 'assistant', content: initialAssistantMsg }
            ]);
        };
        init();
        return () => {
            isMounted = false;
        };
    }, [skill, topic]);

    const sendLearnerResponse = async (text: string) => {
        if (!text.trim()) return;

        const newMessages: Message[] = [...messages, { role: 'user', content: text }];
        setMessages(newMessages);
        setLoading(true);

        const currentTurn = turnCount + 1;
        setTurnCount(currentTurn);

        if (currentTurn >= 4) {
            // Generate diagnosis
            if (modelAvailable) {
                try {
                    const prompt = [...newMessages, { role: 'user', content: "Generate the JSON diagnosis schema based on the last 4 turns." } as Message];
                    const response = await generateResponse(prompt);
                    try {
                        const jsonStr = response.substring(response.indexOf('{'), response.lastIndexOf('}') + 1);
                        setDiagnosis(JSON.parse(jsonStr));
                    } catch (e) {
                        setDiagnosis(generateFallbackDiagnosis(skill, newMessages));
                    }
                } catch (e) {
                    setDiagnosis(generateFallbackDiagnosis(skill, newMessages));
                }
            } else {
                setDiagnosis(generateFallbackDiagnosis(skill, newMessages));
            }
            setLoading(false);
            return;
        }

        if (modelAvailable) {
            try {
                const response = await generateResponse(newMessages);
                setMessages([...newMessages, { role: 'assistant', content: response }]);
            } catch (err) {
                console.error(err);
                setMessages([...newMessages, { role: 'assistant', content: getFallbackQuestion(skill, currentTurn) }]);
            }
            setLoading(false);
        } else {
            // Rule-based fallback (Web or missing model on Android)
            setTimeout(() => {
                setMessages([...newMessages, { role: 'assistant', content: getFallbackQuestion(skill, currentTurn) }]);
                setLoading(false);
            }, 300);
        }
    };

    return {
        messages,
        loading,
        modelAvailable,
        sendLearnerResponse,
        diagnosis,
        turnCount
    };
}

