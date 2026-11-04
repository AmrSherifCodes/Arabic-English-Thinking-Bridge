import { spawnSync, execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

console.log('🚀 Thinking Bridge — Vercel Environment & Deployment Automation');

const secrets = [
  { name: 'DISCORD_WEBHOOK_URL', val: process.env.DISCORD_WEBHOOK_URL },
  { name: 'DISCORD_FEEDBACK_WEBHOOK', val: process.env.DISCORD_FEEDBACK_WEBHOOK },
  { name: 'DISCORD_REVIEWS_WEBHOOK', val: process.env.DISCORD_REVIEWS_WEBHOOK }
];

const envs = ['production', 'preview'];
const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const tokenFlag = process.env.VERCEL_TOKEN ? `--token ${process.env.VERCEL_TOKEN}` : '';

for (const secret of secrets) {
  if (!secret.val) {
    console.warn(`⚠️ Environment variable ${secret.name} is not set locally in process.env / .env`);
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
      throw new Error(`❌ Failed to set Vercel environment variable ${secret.name} for ${envTarget} (exit status ${res.status})`);
    }
  }
}

console.log('📋 Listing active Vercel environment variables:');
try {
  execSync(`${npxCmd} --yes vercel env ls ${tokenFlag}`, { stdio: 'inherit', encoding: 'utf8', shell: true });
} catch (err) {
  console.warn(`⚠️ Listing env vars warning: ${err.message}`);
}

console.log('🔄 Triggering Vercel production deployment...');
execSync(`${npxCmd} --yes vercel --prod ${tokenFlag}`, { stdio: 'inherit', encoding: 'utf8', shell: true });
console.log('✅ Vercel production deployment completed successfully!');
