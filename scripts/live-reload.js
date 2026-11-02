import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn, execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const ANDROID_CONFIG_JSON = path.join(
  ROOT_DIR,
  'android',
  'app',
  'src',
  'main',
  'assets',
  'capacitor.config.json'
);

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const command = process.argv[2] || 'on';
const customIp = process.argv[3];

if (command === 'off') {
  console.log('\n🔄 Switching Android config back to STANDALONE OFFLINE mode...');
  const offlineConfig = {
    appId: 'com.amrsherif.thinkingenglish',
    appName: 'Thinking English',
    webDir: 'dist',
    server: {
      androidScheme: 'https',
    },
    android: {
      allowMixedContent: false,
    },
  };

  fs.writeFileSync(ANDROID_CONFIG_JSON, JSON.stringify(offlineConfig, null, 2), 'utf8');
  console.log('✓ Android app is now in OFFLINE mode (loads local packaged assets).');
  console.log('  To build a production release, run: npm run release\n');
  process.exit(0);
}

if (command === 'status') {
  if (fs.existsSync(ANDROID_CONFIG_JSON)) {
    const current = JSON.parse(fs.readFileSync(ANDROID_CONFIG_JSON, 'utf8'));
    if (current.server && current.server.url) {
      console.log(`\n⚡ Live Reload is currently ACTIVE pointing to: ${current.server.url}`);
    } else {
      console.log('\n📦 Android app is in STANDALONE OFFLINE mode.');
    }
  }
  process.exit(0);
}

// Default: ENABLE LIVE RELOAD
const ip = customIp || getLocalIp();
const port = 3000;
const liveUrl = `http://${ip}:${port}`;

console.log('========================================================');
console.log('⚡ ENABLING ANDROID LIVE RELOAD MODE');
console.log('========================================================');
console.log(`📡 Local Computer IP:   ${ip}`);
console.log(`🌐 Live Reload URL:     ${liveUrl}`);

const liveConfig = {
  appId: 'com.amrsherif.thinkingenglish',
  appName: 'Thinking English',
  webDir: 'dist',
  server: {
    url: liveUrl,
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
};

fs.writeFileSync(ANDROID_CONFIG_JSON, JSON.stringify(liveConfig, null, 2), 'utf8');
console.log('✓ Injected live server config into android/app/src/main/assets/capacitor.config.json');

// Try adb reverse if phone is plugged in via USB
try {
  execSync(`adb reverse tcp:${port} tcp:${port}`, { stdio: 'ignore' });
  console.log(`✓ USB port forwarding active: adb reverse tcp:${port} tcp:${port}`);
} catch {
  // Not connected via USB or adb not in PATH; Wi-Fi will still work seamlessly!
}

console.log('\n📱 HOW TO USE:');
console.log('  1. Open the "Thinking English" app on your phone.');
console.log(`  2. Ensure your phone is connected to the same Wi-Fi (or plugged in via USB).`);
console.log('  3. Any code you change in src/ will hot-reload on your phone in ~50ms!');
console.log('  4. To return to offline APK mode later, run: npm run live:off\n');
console.log('🚀 Starting Vite dev server now...\n');

const isWindows = process.platform === 'win32';
const npxCmd = isWindows ? 'npx.cmd' : 'npx';

const devServer = spawn(npxCmd, ['vite', '--port=3000', '--host=0.0.0.0'], {
  cwd: ROOT_DIR,
  stdio: 'inherit',
  shell: true,
});

process.on('SIGINT', () => {
  console.log('\nStopping dev server...');
  devServer.kill('SIGINT');
  process.exit(0);
});
