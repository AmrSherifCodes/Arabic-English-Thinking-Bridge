/**
 * Supporter Gate Configuration (@sciamrsherif)
 */

export const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@sciamrsherif?sub_confirmation=1';
export const YOUTUBE_CHANNEL_HANDLE = '@sciamrsherif';

/**
 * Precalculated SHA-256 hashes of channel community passcodes (uppercase, trimmed).
 * Plaintext passcodes for Amr's YouTube descriptions:
 * SCIAMR, BRIDGE, RAHMAH, AMANAH, THINKING, GERMAN
 */
export const COMMUNITY_PASSCODE_HASHES: string[] = [
  // SHA-256 of "SCIAMR"
  'fd17c64a4b7561b0d57657a47e9dbc22796592e439cdfb6b3f8703b4776e6f4e',
  // SHA-256 of "BRIDGE"
  'ef304fbeab13fe6be160d785fcecaa5620c846e7ad697e2915bfe0612fa9cb67',
  // SHA-256 of "RAHMAH"
  'cf5798ea328d54d76fd0181230901198a6a68aa6d991ed6a4addd338af8ec482',
  // SHA-256 of "AMANAH"
  '24a317edaee8eb1fbac2739b43be9ac4b7db7517b70b97a118a05482a70901b6',
  // SHA-256 of "THINKING"
  '93d7f3aa5f80240bfff3cafa69167dc0d5f4fe814820e409b5349661fd4dbd34',
  // SHA-256 of "GERMAN"
  '552cb75e8b82760680bcdda8abf56169c114466929ba5cf64555673577bda742',
];

export const isYouTubeOAuthEnabled = (): boolean => {
  return typeof import.meta !== 'undefined' && import.meta.env?.VITE_ENABLE_YOUTUBE_OAUTH_GATE === 'true';
};
