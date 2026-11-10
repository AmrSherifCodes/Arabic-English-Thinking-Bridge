import React from 'react';

const YOUTUBE_URL = 'https://www.youtube.com/@SciAmrSherif?sub_confirmation=1';

interface Props {
  isBlocked: boolean;
  onUnlock: () => void | Promise<void>;
  busy?: boolean;
  error?: string | null;
  hint?: string;
  youtubeUrl?: string;
}

export function BlockScreen({
  isBlocked: _isBlocked,
  onUnlock: _onUnlock,
  busy: _busy = false,
  error: _error = null,
  hint: _hint,
  youtubeUrl: _youtubeUrl = YOUTUBE_URL,
}: Props) {
  // All time limits and blocking screens have been removed permanently.
  return null;
}
