/**
 * @vitest-environment jsdom
 */
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { url: 'http://localhost' });
(globalThis as any).window = dom.window;
(globalThis as any).document = dom.window.document;
try { Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, writable: true, configurable: true }); } catch {}

import { describe, test } from 'node:test';
import { strictEqual, ok } from 'node:assert';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useOfflineSpeech } from '../features/voice/useOfflineSpeech';

describe('Offline Voice Pipeline', () => {
  test('should initialize, start listening, and receive transcript', async () => {
    const listeners: Record<string, (res: any) => void> = {};
    const mockPlugin: any = {
      init: async () => {},
      startListening: async () => {},
      stopListening: async () => {},
      addListener: (event: string, cb: (res: any) => void) => {
        listeners[event] = cb;
        if (event === 'onFinalResult') {
          setTimeout(() => cb({ text: 'مرحبا' }), 50);
        }
        return { remove: () => {} };
      },
    };

    const { result } = renderHook(() => useOfflineSpeech(mockPlugin, true));

    await waitFor(() => {
      strictEqual(result.current.isReady, true);
    });

    act(() => {
      result.current.startListening();
    });
    strictEqual(result.current.isListening, true);

    await waitFor(() => {
      strictEqual(result.current.transcript, 'مرحبا');
      strictEqual(result.current.isListening, false);
    });
  });
});
