/**
 * CC0 1.0 Universal - Public Domain
 * Pedagogy inspired by Mihalis Eleftheriou & Language Transfer. Built in Alexandria. CC0.
 *
 * 100% Offline Canvas PNG Share Card Generator (1080x1080). Zero tracking or personal data.
 */

import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { ExamSessionResult } from '../types';
import { CAN_DO } from '../data/cefrCanDo';

interface ShareCardProps {
  result: ExamSessionResult;
  supporterMode?: boolean;
}

export const ShareCard: React.FC<ShareCardProps> = ({
  result,
  supporterMode = false,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAndDownloadPNG = async () => {
    setIsGenerating(true);
    try {
      // Font guard: await font loading to ensure Arabic typography renders cleanly
      if (document && document.fonts) {
        await document.fonts.ready;
      }

      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      // 1. Background Gradient (Alexandrian deep teal to warm sand)
      const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
      grad.addColorStop(0, '#0F172A'); // Slate dark
      grad.addColorStop(0.5, '#0D9488'); // Deep Teal
      grad.addColorStop(1, '#F4E9D0'); // Warm Sand
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1080);

      // 2. Supporter Mode Gold Border & Ribbon
      if (supporterMode) {
        ctx.strokeStyle = '#D4A94A';
        ctx.lineWidth = 24;
        ctx.strokeRect(30, 30, 1020, 1020);

        // Gold Ribbon text
        ctx.fillStyle = '#D4A94A';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('💚 Supporter Mode', 1020, 80);
      }

      // Set text direction to RTL for Arabic/Hebrew compatibility
      ctx.direction = 'rtl';
      ctx.textAlign = 'center';

      // 3. App Title
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 44px sans-serif';
      ctx.fillText('Thinking English™ — فكّر بالإنجليزي', 540, 160);

      ctx.fillStyle = '#CBD5E1';
      ctx.font = '32px sans-serif';
      ctx.fillText('اختبار يا باشا | CEFR Assessment', 540, 220);

      // 4. Main Grade Card Circle
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.roundRect(140, 280, 800, 480, 40);
      ctx.fill();

      if (supporterMode) {
        ctx.strokeStyle = '#D4A94A';
        ctx.lineWidth = 4;
        ctx.stroke();
      }

      // Language & Grade
      const langLabel =
        result.lang === 'en'
          ? 'English'
          : result.lang === 'de'
          ? 'Deutsch'
          : 'עברית (عبري)';

      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 40px sans-serif';
      ctx.fillText(`اللغة: ${langLabel}`, 540, 360);

      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 110px sans-serif';
      ctx.fillText(result.estimatedCefr, 540, 480);

      // Can-Do Statement
      const canDoText = CAN_DO[result.estimatedCefr] || '';
      ctx.fillStyle = '#E2E8F0';
      ctx.font = '28px sans-serif';

      // Word wrapping for Can-Do text
      const words = canDoText.split(' ');
      let line = '';
      let y = 570;
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > 700 && i > 0) {
          ctx.fillText(line, 540, y);
          line = words[i] + ' ';
          y += 40;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 540, y);

      // Score Stats
      ctx.fillStyle = '#94A3B8';
      ctx.font = '24px sans-serif';
      ctx.fillText(
        `الدقة: ${result.scorePercentage}% | أطول سلسلة: ${result.bestStreak} 🔥 | النقاط: +${result.xpEarned} XP`,
        540,
        710
      );

      // 5. Footer Attribution & URL
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText('tb-eg.vercel.app/exam', 540, 860);

      ctx.font = '22px sans-serif';
      ctx.fillText(
        'Pedagogy inspired by Mihalis Eleftheriou & Language Transfer. Built in Alexandria. CC0.',
        540,
        920
      );

      // Trigger Local Download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `YaBashaCheck-${result.lang}-${result.estimatedCefr}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (err) {
      console.error('Failed to generate PNG share card:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generateAndDownloadPNG}
      disabled={isGenerating}
      className={`w-full py-3.5 px-6 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg font-arabic ${
        supporterMode
          ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 border border-amber-300 shadow-[0_0_15px_rgba(212,169,74,0.4)]'
          : 'bg-teal-500 hover:bg-teal-400 text-stone-950'
      }`}
      data-supporter={supporterMode ? 'true' : undefined}
    >
      <Download className="w-5 h-5" />
      <span>{isGenerating ? 'جاري تجهيز الكارت...' : 'نزّل الكارت (PNG)'}</span>
    </button>
  );
};
