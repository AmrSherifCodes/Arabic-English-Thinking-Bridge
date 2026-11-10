/**
 * Generates a compliant URL for a specific lesson, satisfying Rule 9 (Working Links).
 * Includes a commit hash placeholder replaced dynamically via Vite/Vercel env vars.
 */
export function generateLessonLink(lessonId: string, isArabic: boolean): string {
  const langParam = isArabic ? 'ar' : 'en';
  const baseUrl = 'https://tb-eg.vercel.app/app';
  const commitHash = import.meta.env.VITE_COMMIT_HASH || 'latest-commit';
  return `${baseUrl}?lesson=${lessonId}&lang=${langParam}#${commitHash}`;
}
