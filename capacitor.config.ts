import type { CapacitorConfig } from '@capacitor/cli';

const isLiveReload = process.env.CAPACITOR_LIVE_RELOAD === 'true';
const liveUrl = process.env.CAPACITOR_LIVE_URL || 'http://localhost:3000';

const config: CapacitorConfig = {
  appId: 'com.amrsherif.thinkingenglish',
  appName: 'Thinking English',
  webDir: 'dist',
  server: isLiveReload
    ? {
        url: liveUrl,
        cleartext: true,
      }
    : {
        androidScheme: 'https',
      },
  android: {
    allowMixedContent: isLiveReload,
  },
};

export default config;
