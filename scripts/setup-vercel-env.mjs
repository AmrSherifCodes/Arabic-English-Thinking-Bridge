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

for (const secret of secrets) {
  if (!secret.val) {
    console.warn(`⚠️ Environment variable ${secret.name} is not set locally in process.env / .env`);
    continue;
  }

  for (const envTarget of envs) {
    console.log(`Setting ${secret.name} for ${envTarget}...`);
    const res = spawnSync('npx', ['vercel', 'env', 'add', secret.name, envTarget, '--yes'], {
      input: secret.val,
      encoding: 'utf8',
      stdio: ['pipe', 'inherit', 'inherit']
    });
    if (res.status !== 0) {
      console.warn(`⚠️ Warning: vercel env add for ${secret.name} (${envTarget}) returned status ${res.status}`);
    }
  }
}

console.log('🔄 Triggering Vercel production deployment...');
try {
  execSync('npx vercel --prod --yes', { stdio: 'inherit', encoding: 'utf8' });
  console.log('✅ Vercel production deployment completed successfully!');
} catch (err) {
  console.warn(`⚠️ Vercel deployment warning: ${err.message}`);
}
