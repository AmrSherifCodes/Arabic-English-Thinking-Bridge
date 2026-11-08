import path from 'node:path';
import {Config} from '@remotion/cli/config';

Config.setBrowserExecutable(path.join(
  process.env.LOCALAPPDATA ?? '',
  'ms-playwright',
  'chromium_headless_shell-1254',
  'chrome-headless-shell-win64',
  'chrome-headless-shell.exe',
));
