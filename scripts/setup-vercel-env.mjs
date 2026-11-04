import { spawnSync, execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

console.log('🚀 Thinking Bridge — Vercel Environment & Deployment Setup');

const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const tokenFlag = process.env.VERCEL_TOKEN ? `--token ${process.env.VERCEL_TOKEN}` : '';

// Check Vercel CLI Auth Status
let isLoggedIn = false;
try {
  const whoami = execSync(`${npxCmd} --yes vercel whoami ${tokenFlag}`, {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  });
  if (whoami && whoami.trim()) {
    isLoggedIn = true;
    console.log(`👤 Authenticated Vercel user: ${whoami.trim()}`);
  }
} catch {
  isLoggedIn = false;
}

if (!isLoggedIn) {
  console.log('\n⚠️ Vercel CLI is not currently authenticated in this environment.');
  console.log('💡 To authenticate automated sync:');
  console.log('   1. Run `npx vercel login` in your terminal.');
  console.log('   2. OR set `VERCEL_TOKEN` in your environment variables.');
  console.log('   3. OR add `DISCORD_WEBHOOK_URL` in Vercel Dashboard -> Settings -> Environment Variables.\n');
  process.exit(0);
}

const secrets = [
  { name: 'DISCORD_WEBHOOK_URL', val: process.env.DISCORD_WEBHOOK_URL },
  { name: 'DISCORD_FEEDBACK_WEBHOOK', val: process.env.DISCORD_FEEDBACK_WEBHOOK },
  { name: 'DISCORD_REVIEWS_WEBHOOK', val: process.env.DISCORD_REVIEWS_WEBHOOK }
];

const envs = ['production', 'preview'];

for (const secret of secrets) {
  if (!secret.val) {
    console.warn(`⚠️ Local variable ${secret.name} is not set in .env`);
    continue;
  }

  for (const envTarget of envs) {
    console.log(`Setting ${secret.name} for ${envTarget}...`);
    const args = ['--yes', 'vercel', 'env', 'add', secret.name, envTarget];
    if (process.env.VERCEL_TOKEN) {
      args.push('--token', process.env.VERCEL_TOKEN);
    }

    const res = spawnSync(npxCmd, args, {
      input: secret.val,
      encoding: 'utf8',
      shell: true,
      stdio: ['pipe', 'inherit', 'inherit']
    });

    if (res.status !== 0) {
      console.warn(`⚠️ Could not add ${secret.name} to ${envTarget} (exit code ${res.status}).`);
    }
  }
}

console.log('📋 Listing Vercel environment variables:');
try {
  execSync(`${npxCmd} --yes vercel env ls ${tokenFlag}`, { stdio: 'inherit', encoding: 'utf8', shell: true });
} catch (err) {
  console.warn(`⚠️ Env list warning: ${err.message}`);
}
