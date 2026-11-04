import { expect, test } from '@playwright/test';

test('landing page launches the app with only the first lesson unlocked', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  await page.goto('/?landing=true');
  await expect(page.getByRole('heading', { name: /توقف عن الترجمة/ })).toBeVisible();
  await page.getByRole('button', { name: 'ابدأ التفكير الآن 🚀' }).first().click();
  await expect(page.getByText('ما اللغة التي تريد أن تفكّر بها؟')).toBeVisible();
  await page.getByRole('button', { name: 'التالي' }).click();
  await page.getByRole('button', { name: 'التالي' }).click();
  await page.getByRole('button', { name: 'بدء التفكير الآن 🚀' }).click();

  await expect(page.getByRole('button', { name: 'فعل الربط المخفي (am / is / are)' })).toBeEnabled();
  await expect(page.getByRole('button', { name: /أدوات التنكير والتعريف/ })).toBeDisabled();
});
