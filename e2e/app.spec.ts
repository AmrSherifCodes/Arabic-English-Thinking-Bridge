import { expect, test } from '@playwright/test';

test('new learner completes onboarding, unlocks a lesson, changes theme, and starts voice practice', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();

    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: async () => ({
          getTracks: () => [{ stop: () => undefined }],
        }),
      },
    });

    class MockSpeechRecognition {
      lang = '';
      continuous = false;
      interimResults = false;
      maxAlternatives = 1;
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: ((event: { error: string }) => void) | null = null;

      start() {
        window.setTimeout(() => this.onstart?.(), 0);
      }

      stop() {
        this.onend?.();
      }

      abort() {
        this.onend?.();
      }
    }

    Object.defineProperty(window, 'webkitSpeechRecognition', {
      configurable: true,
      value: MockSpeechRecognition,
    });
    Object.defineProperty(window, 'MediaRecorder', {
      configurable: true,
      value: class MockMediaRecorder {
        state = 'inactive';
        start() {
          this.state = 'recording';
        }
        stop() {
          this.state = 'inactive';
        }
      },
    });
  });

  await page.goto('/');
  await page.getByRole('button', { name: /ابدأ التعلم مجاناً|Start Learning Free/ }).first().click();
  await expect(page.getByText('ما اللغة التي تريد أن تفكّر بها؟')).toBeVisible();
  await page.getByRole('button', { name: /العربية/ }).click();
  await page.getByRole('button', { name: 'English', exact: false }).last().click();
  await page.getByRole('button', { name: 'التالي' }).click();
  await page.getByRole('button', { name: 'التالي' }).click();
  await page.getByRole('button', { name: /^A0 / }).click();
  await page.getByRole('button', { name: 'بدء التفكير الآن 🚀' }).click();
  await expect(page.getByRole('heading', { name: 'تم إنشاء ملفك التعليمي!' })).toBeVisible();
  await expect(page.getByText(/🇪🇬 ➔ 🇬🇧/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'حدد مستواك الحالي (CEFR)' })).toBeHidden();

  const firstLesson = page.getByRole('button', { name: 'فعل الربط المخفي (am / is / are)' });
  const secondLesson = page.getByRole('button', { name: /أدوات التنكير والتعريف/ });
  const thirdLesson = page.getByRole('button', { name: /الملكية/ });
  await expect(firstLesson).toBeEnabled();
  await expect(secondLesson).toBeDisabled();
  await expect(thirdLesson).toBeDisabled();
  await firstLesson.click();

  const completeExercise = async (words: string[]) => {
    for (const word of words) {
      await page.locator('[data-testid="word-chip"]').and(page.locator(`[data-word="${word}"]`)).click();
    }
    await page.getByRole('button', { name: 'تحقق من البناء 🚀' }).click();
    await expect(page.getByText('إجابة ممتازة وبناء صحيح! 🎉')).toBeVisible();
    await page.getByRole('button', { name: 'السؤال التالي' }).click();
  };

  await completeExercise(['He', 'is', 'an', 'architect']);
  await completeExercise(['The', 'weather', 'is', 'very', 'cold', 'today']);
  await completeExercise(['We', 'are', 'ready', 'for', 'the', 'interview']);
  await expect(page.getByText('+50 XP')).toBeVisible();
  await page.getByRole('button', { name: 'استمرار والعودة للمسار 🚀' }).click();

  await expect(firstLesson).toBeEnabled();
  await expect(secondLesson).toBeEnabled();
  await expect(thirdLesson).toBeDisabled();

  await page.getByRole('button', { name: 'الملف' }).click();
  await page.getByRole('button', { name: 'إعدادات التطبيق واللغة' }).click();
  await page.getByRole('button', { name: '☀️ فاتح' }).click();
  await expect(page.locator('html')).toHaveClass(/light/);
  await page.locator('input[type="password"]').fill('test-gemini-key');
  await page.getByRole('button', { name: 'حفظ', exact: true }).click();
  const savedKeys = await page.evaluate(() => ({
    camel: localStorage.getItem('tb.userGeminiKey'),
    snake: localStorage.getItem('user_gemini_key'),
  }));
  expect(savedKeys).toEqual({ camel: 'test-gemini-key', snake: 'test-gemini-key' });

  await page.getByRole('button', { name: 'رجوع' }).click();
  await page.getByRole('button', { name: 'التدريب' }).click();
  await page.getByRole('button', { name: /تدريب المحادثة مع عمرو شريف/ }).click();
  await page.getByRole('button', { name: 'Tap to speak' }).click();
  await expect(page.locator('.voice__status')).toHaveText('جاري الاستماع... اتكلم براحتك');
  await expect(page.locator('.voice__orb--listening')).toBeVisible();
});
