// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

/**
 * Sanitizes user-entered text (Name Forge, leaderboard display names, aliases)
 * against HTML/script injection and control characters.
 */
export function sanitizeDisplayText(raw: string, maxLength = 32): string {
  return (raw || '')
    .replace(/<[^>]*>/g, '')
    .replace(/[<>"'`\\]/g, '')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}
