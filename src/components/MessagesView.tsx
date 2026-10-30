import { useEffect, useState, type FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import { BouncyButton } from './BouncyButton';
import { BTN_GHOST, BTN_PRIMARY, CARD_CLASS } from './uiConstants';
import { getSupabaseClient, supabase, supabaseAdminEmail } from '../services/supabase';

interface AdminMessage {
  id: number | string;
  message: string;
  created_at: string;
}

function isAdminMessage(value: unknown): value is AdminMessage {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    ((typeof record.id === 'number' && Number.isSafeInteger(record.id)) ||
      (typeof record.id === 'string' && record.id.length > 0)) &&
    typeof record.message === 'string' &&
    typeof record.created_at === 'string'
  );
}

function getSessionEmail(session: Session | null): string | null {
  return session?.user.email?.trim().toLowerCase() ?? null;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  try {
    return JSON.stringify(error) || 'Unknown error';
  } catch {
    return 'Unknown error';
  }
}

export function MessagesView() {
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const isAdmin = Boolean(
    userEmail && supabaseAdminEmail && userEmail === supabaseAdminEmail
  );

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return;
    }

    let active = true;
    void supabase.auth.getSession().then(
      ({ data, error: sessionError }) => {
        if (!active) return;
        if (sessionError) {
          console.error('Could not restore the Supabase session.', sessionError);
          setError('Could not restore your sign-in session.');
        }
        setUserEmail(getSessionEmail(data.session));
        setAuthReady(true);
      },
      sessionError => {
        if (!active) return;
        console.error('Could not restore the Supabase session.', sessionError);
        setError('Could not restore your sign-in session.');
        setAuthReady(true);
      }
    );

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(getSessionEmail(session));
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setMessages([]);
      return;
    }

    let active = true;
    setIsLoading(true);
    setError('');
    void (async () => {
      try {
        const { data, error: queryError } = await getSupabaseClient()
          .from('messages')
          .select('id, message, created_at')
          .order('created_at', { ascending: false });
        if (!active) return;
        if (queryError) throw queryError;
        if (!Array.isArray(data) || !data.every(isAdminMessage)) {
          throw new Error('The messages table returned rows with an unexpected format.');
        }
        setMessages(data);
      } catch (loadError) {
        if (!active) return;
        console.error('Could not load messages from Supabase.', loadError);
        setError('Could not load the inbox. Check the messages table and its SELECT policy.');
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [isAdmin]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = messageText.trim();
    if (!content) {
      setError('Write a message before sending.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const { error: insertError } = await getSupabaseClient()
        .from('messages')
        .insert({ message: content });
      if (insertError) throw insertError;

      setMessageText('');
      setToast('Message sent to Admin!');
    } catch (sendError) {
      console.error('Could not send message to Supabase.', sendError);
      setError(getErrorMessage(sendError));
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!supabaseAdminEmail) {
      setError('Set VITE_SUPABASE_ADMIN_EMAIL to enable admin sign-in.');
      return;
    }
    if (loginEmail.trim().toLowerCase() !== supabaseAdminEmail) {
      setError('Incorrect admin email or password.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error: loginError } = await getSupabaseClient().auth.signInWithPassword({
        email: loginEmail.trim(),
        password
      });
      if (loginError) throw loginError;
      if (getSessionEmail(data.session) !== supabaseAdminEmail) {
        await getSupabaseClient().auth.signOut();
        throw new Error('The signed-in account is not the configured admin account.');
      }
      setUserEmail(supabaseAdminEmail);
      setPassword('');
      setShowLogin(false);
    } catch (loginError) {
      console.error('Supabase admin sign-in failed.', loginError);
      setError('Incorrect admin email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { error: signOutError } = await getSupabaseClient().auth.signOut();
      if (signOutError) throw signOutError;
      setUserEmail(null);
      setMessages([]);
    } catch (signOutError) {
      console.error('Could not sign out of Supabase.', signOutError);
      setError('Could not sign out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMessage = async (id: number | string) => {
    setIsLoading(true);
    setError('');
    try {
      const { error: deleteError } = await getSupabaseClient()
        .from('messages')
        .delete()
        .eq('id', id);
      if (deleteError) throw deleteError;
      setMessages(current => current.filter(item => item.id !== id));
    } catch (deleteError) {
      console.error('Could not delete message from Supabase.', deleteError);
      setError('Could not delete the message. Check the messages table and its DELETE policy.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section aria-labelledby="messages-heading" className="space-y-4">
      <header>
        <h1 id="messages-heading" className="text-2xl font-bold text-slate-900 dark:text-white">
          {isAdmin ? 'Admin Inbox' : 'Contact Admin'}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {isAdmin ? 'Messages received from app users.' : 'Share feedback or ask a question.'}
        </p>
      </header>

      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      )}

      {!isAdmin ? (
        <>
          <form onSubmit={sendMessage} className={`${CARD_CLASS} space-y-3`}>
            <label htmlFor="admin-message" className="block text-sm font-semibold">
              Your message
            </label>
            <textarea
              id="admin-message"
              value={messageText}
              onChange={event => setMessageText(event.target.value)}
              rows={5}
              maxLength={2000}
              placeholder="Write your feedback here..."
              className="w-full resize-y rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {messageText.length}/2000
              </span>
              <BouncyButton type="submit" className={BTN_PRIMARY} disabled={isLoading}>
                {isLoading ? 'Sending…' : 'Send Message'}
              </BouncyButton>
            </div>
          </form>

          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setError('');
                setShowLogin(true);
              }}
              disabled={!authReady || isLoading}
              className="text-xs text-slate-500 underline hover:text-slate-800 disabled:opacity-50 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Admin Login
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {messages.length} {messages.length === 1 ? 'message' : 'messages'}
            </p>
            <button type="button" onClick={logout} disabled={isLoading} className={BTN_GHOST}>
              Log out
            </button>
          </div>
          {isLoading ? (
            <div role="status" className={`${CARD_CLASS} text-center text-sm`}>
              Loading inbox…
            </div>
          ) : messages.length === 0 ? (
            <div className={`${CARD_CLASS} text-center text-sm text-slate-600 dark:text-slate-300`}>
              No messages yet.
            </div>
          ) : (
            <ul className="space-y-3">
              {messages.map(item => (
                <li key={item.id} className={`${CARD_CLASS} space-y-3`}>
                  <p className="whitespace-pre-wrap break-words text-sm">{item.message}</p>
                  <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-2 dark:border-slate-700">
                    <time
                      dateTime={item.created_at}
                      className="text-xs text-slate-500 dark:text-slate-400"
                    >
                      {new Date(item.created_at).toLocaleString()}
                    </time>
                    <button
                      type="button"
                      onClick={() => void deleteMessage(item.id)}
                      disabled={isLoading}
                      className="text-xs font-semibold text-red-700 hover:underline disabled:opacity-50 dark:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {showLogin && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setShowLogin(false);
          }}
        >
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-login-heading"
            onSubmit={login}
            className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-800"
          >
            <h2 id="admin-login-heading" className="text-lg font-bold text-slate-900 dark:text-white">
              Admin Login
            </h2>
            <label htmlFor="admin-email" className="block text-sm font-medium">
              Admin email
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              required
              value={loginEmail}
              onChange={event => setLoginEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            />
            <label htmlFor="admin-password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={event => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowLogin(false)}
                className={BTN_GHOST}
              >
                Cancel
              </button>
              <BouncyButton type="submit" className={BTN_PRIMARY} disabled={isLoading}>
                {isLoading ? 'Signing in…' : 'Log in'}
              </BouncyButton>
            </div>
          </form>
        </div>
      )}

      {toast && (
        <p
          role="status"
          className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-lg"
        >
          {toast}
        </p>
      )}
    </section>
  );
}
