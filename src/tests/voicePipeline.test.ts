/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { useOfflineSpeech } from '../features/voice/useOfflineSpeech';
import { renderHook, act, waitFor } from '@testing-library/react';

// Mock Capacitor Core
vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: () => true
  },
  registerPlugin: () => ({
    init: vi.fn().mockResolvedValue(undefined),
    startListening: vi.fn().mockResolvedValue(undefined),
    stopListening: vi.fn().mockResolvedValue(undefined),
    addListener: vi.fn().mockImplementation((event, cb) => {
      if (event === 'onFinalResult') {
        setTimeout(() => cb({ text: 'مرحبا' }), 50);
      }
      return { remove: vi.fn() };
    })
  })
}));

describe('Offline Voice Pipeline', () => {
  it('should initialize, start listening, and receive transcript', async () => {
    const { result } = renderHook(() => useOfflineSpeech());

    // Wait for init
    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    // Start listening
    act(() => {
      result.current.startListening();
    });
    expect(result.current.isListening).toBe(true);

    // Wait for final result mock
    await waitFor(() => {
      expect(result.current.transcript).toBe('مرحبا');
      expect(result.current.isListening).toBe(false);
    });
  });
});
