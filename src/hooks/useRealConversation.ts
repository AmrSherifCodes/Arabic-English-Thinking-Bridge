import { useCallback, useMemo, useRef, useState } from 'react';

export interface ConversationMessage {
  id: number;
  role: 'user' | 'assistant';
  text: string;
}

export function useRealConversation() {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const nextId = useRef(0);

  const addMessage = useCallback((role: ConversationMessage['role'], text: string) => {
    setMessages(current => [...current, { id: nextId.current++, role, text }]);
  }, []);

  const history = useMemo(
    () =>
      messages
        .slice(-4)
        .map(message => `${message.role === 'user' ? 'Learner' : 'Tutor'}: ${message.text}`),
    [messages]
  );

  const clearConversation = useCallback(() => setMessages([]), []);

  return { messages, history, addMessage, clearConversation };
}
