import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

let pkgVersion = 'v3.2.1';
try {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));
  if (pkg.version) {
    pkgVersion = `v${pkg.version.replace(/^v/, '')}`;
  }
} catch {
  pkgVersion = process.env.npm_package_version ? `v${process.env.npm_package_version.replace(/^v/, '')}` : 'v3.2.1';
}

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  res.statusCode = 200;
  res.end(JSON.stringify({
    status: 'healthy',
    service: 'Thinking Bridge',
    version: pkgVersion,
    uptime: Math.round(process.uptime()),
    timestamp: Date.now(),
    storage: 'local-only',
  }));
}
