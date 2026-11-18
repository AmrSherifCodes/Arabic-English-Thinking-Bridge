import { expect, test } from '@playwright/test';

test('landing page launches the app', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  await page.goto('/?landing=true');
  await expect(page.getByRole('heading', { name: /اتعلم إنجليزي|Learn English/ }).first()).toBeVisible();
  const startBtn = page.getByRole('button', { name: /ابدأ رحلتك مجاناً|ابدأ دلوقتي|Start your journey for free/ }).first();
  await expect(startBtn).toBeVisible();
  await startBtn.click();
});
