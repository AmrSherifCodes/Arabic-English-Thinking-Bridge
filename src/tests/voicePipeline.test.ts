// jsdom ships no bundled type declarations and @types/jsdom is not a dependency.
// @ts-expect-error - untyped dev-only testing dependency
import { JSDOM } from 'jsdom';
import { describe, test } from 'node:test';
import { strictEqual, ok } from 'node:assert';

// The hook under test is a real React hook, so it needs a DOM before the
// renderer is used. Set it up before importing the renderer-dependent modules.
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { url: 'http://localhost' });
(globalThis as any).window = dom.window;
(globalThis as any).document = dom.window.document;
try {
  Object.defineProperty(globalThis, 'navigator', {
    value: dom.window.navigator,
    writable: true,
    configurable: true,
  });
} catch {}
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const { renderHook, act, waitFor } = await import('@testing-library/react');
const { useOfflineSpeech } = await import('../features/voice/useOfflineSpeech');

describe('Offline Voice Pipeline', () => {
  test('initializes, starts listening, and receives a final transcript', async () => {
    const listeners: Record<string, (res: any) => void> = {};
    let startCalls = 0;

    const mockPlugin: any = {
      init: async () => {},
      startListening: async () => {
        startCalls += 1;
        // Simulate the native engine emitting a final result.
        setTimeout(() => listeners.onFinalResult?.({ text: 'مرحبا' }), 20);
      },
      stopListening: async () => {},
      addListener: (event: string, cb: (res: any) => void) => {
        listeners[event] = cb;
        return { remove: () => {} };
      },
    };

    const { result } = renderHook(() => useOfflineSpeech(mockPlugin, true));

    await waitFor(() => {
      strictEqual(result.current.isReady, true);
    });

    await act(async () => {
      await result.current.startListening();
    });
    strictEqual(result.current.isListening, true);
    strictEqual(startCalls, 1);

    await waitFor(() => {
      strictEqual(result.current.transcript, 'مرحبا');
      strictEqual(result.current.isListening, false);
    });
  });

  test('stays idle when the native engine is unavailable', async () => {
    const mockPlugin: any = {
      init: async () => {},
      startListening: async () => {},
      stopListening: async () => {},
      addListener: () => ({ remove: () => {} }),
    };

    const { result } = renderHook(() => useOfflineSpeech(mockPlugin, false));

    await act(async () => {
      await result.current.startListening();
    });

    ok(!result.current.isReady, 'web fallback must not claim the native engine is ready');
    ok(!result.current.isListening, 'web fallback must not enter a listening state');
  });
});
