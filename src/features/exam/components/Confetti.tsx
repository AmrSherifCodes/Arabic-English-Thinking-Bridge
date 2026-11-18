/**
 * CC0 1.0 Universal - Public Domain
 * Pedagogy inspired by Mihalis Eleftheriou & Language Transfer. Built in Alexandria. CC0.
 *
 * Lightweight, zero-dependency HTML5 canvas confetti burst (~40 lines).
 */

import React, { useEffect, useRef } from 'react';

interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
}

export const Confetti: React.FC<ConfettiProps> = ({ trigger, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!trigger || typeof window === 'undefined') return;

    // Accessibility check for reduced motion
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) {
      if (onComplete) onComplete();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#D4A94A', '#14B8A6', '#F4E9D0', '#F59E0B', '#0D9488'];
    const particleCount = 45;

    const particles = Array.from({ length: particleCount }).map(() => ({
      x: canvas.width / 2,
      y: canvas.height / 3,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.8) * 10,
      size: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      opacity: 1,
    }));

    let animationId: number;
    let startTime = Date.now();

    const render = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > 700) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (onComplete) onComplete();
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3; // Gravity
        p.rotation += p.rotationSpeed;
        p.opacity = Math.max(0, 1 - elapsed / 700);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [trigger, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[99999]"
    />
  );
};
