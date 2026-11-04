import { useEffect, useState, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import { BTN_PRIMARY, CARD_CLASS } from './uiConstants';

interface LocalMessage {
  id: string;
  message: string;
  createdAt: string;
}

const LOCAL_MESSAGES_KEY = 'tb.localMessages';

function isLocalMessage(value: unknown): value is LocalMessage {
  if (!value || typeof value !== 'object') return false;
  const message = value as Record<string, unknown>;
  return typeof message.id === 'string' &&
    typeof message.message === 'string' &&
    typeof message.createdAt === 'string';
}

export function MessagesView() {
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_MESSAGES_KEY);
      if (!saved) return;
      const parsed: unknown = JSON.parse(saved);
      if (!Array.isArray(parsed) || !parsed.every(isLocalMessage)) {
        throw new Error('Saved local messages have an unexpected format.');
      }
      setMessages(parsed);
    } catch (loadError) {
      console.warn('Could not load messages saved on this device.', loadError);
      setError('Could not read the local message history.');
    }
  }, []);

  const saveMessages = (next: LocalMessage[]) => {
    try {
      localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(next));
      setMessages(next);
      setError('');
    } catch (saveError) {
      console.error('Could not save this message on the device.', saveError);
      setError('Could not save this message. Check available device storage.');
    }
  };

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = messageText.trim();
    if (!message) {
      setError('Write a message before saving.');
      return;
    }

    saveMessages([
      { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, message, createdAt: new Date().toISOString() },
      ...messages,
    ]);
    setMessageText('');
  };

  return (
    <section className="mx-auto max-w-2xl space-y-4" aria-labelledby="messages-heading">
      <header>
        <h1 id="messages-heading" className="text-2xl font-bold text-slate-900 dark:text-white">
          Contact notes
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Notes are stored only on this device and are not sent or synced.
        </p>
      </header>

      {error && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-200">{error}</p>}

      <form onSubmit={sendMessage} className={`${CARD_CLASS} space-y-3`}>
        <label htmlFor="local-contact-note" className="block text-sm font-semibold">Your note</label>
        <textarea
          id="local-contact-note"
          value={messageText}
          onChange={(event) => setMessageText(event.target.value)}
          maxLength={2000}
          rows={4}
          className="w-full rounded-xl border border-stone-300 bg-transparent p-3 dark:border-stone-600"
        />
        <button type="submit" className={BTN_PRIMARY}>Save on this device</button>
      </form>

      <div className="space-y-2">
        {messages.map((message) => (
          <article key={message.id} className={`${CARD_CLASS} flex items-start justify-between gap-3`}>
            <div className="min-w-0">
              <p className="whitespace-pre-wrap break-words text-sm">{message.message}</p>
              <time className="mt-2 block text-xs text-stone-500" dateTime={message.createdAt}>
                {new Date(message.createdAt).toLocaleString()}
              </time>
            </div>
            <button
              type="button"
              onClick={() => saveMessages(messages.filter((entry) => entry.id !== message.id))}
              aria-label="Delete note"
              className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-red-600 dark:hover:bg-stone-800"
            >
              <Trash2 size={16} />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
