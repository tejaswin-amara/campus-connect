import type React from 'react';
import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

export interface AuroraProps {
  className?: string;
  colorStops?: [string, string, string];
  amplitude?: number;
}

/**
 * Aurora adapted from https://reactbits.dev
 * GPU-accelerated canvas rendering deep organic wave blends of indigo (#4f46e5)
 * and cyan (#06b6d4) against true black (#050508).
 * Uses IntersectionObserver to freeze frame rendering when off-screen.
 */
export const Aurora: React.FC<AuroraProps> = ({
  className = '',
  colorStops = ['#4f46e5', '#06b6d4', '#050508'],
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isReducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number | null = null;
    let isIntersecting = true;
    let time = 0;

    const drawStaticGradient = (width: number, height: number) => {
      ctx.clearRect(0, 0, width, height);

      // Deep base
      ctx.fillStyle = colorStops[2];
      ctx.fillRect(0, 0, width, height);

      const grad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.4,
        50,
        width * 0.5,
        height * 0.5,
        width * 0.7,
      );
      grad.addColorStop(0, 'rgba(79, 70, 229, 0.25)');
      grad.addColorStop(0.5, 'rgba(6, 182, 212, 0.15)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    };

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      if (isReducedMotion) {
        drawStaticGradient(rect.width, rect.height);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      if (!isIntersecting) {
        animationFrameId = null;
        return;
      }

      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      // Deep base
      ctx.fillStyle = colorStops[2];
      ctx.fillRect(0, 0, width, height);

      if (isReducedMotion) {
        drawStaticGradient(width, height);
        animationFrameId = null;
        return;
      }

      time += 0.008;

      // Primary wave 1 - Indigo
      const x1 = width * 0.4 + Math.sin(time * 0.7) * (width * 0.2);
      const y1 = height * 0.3 + Math.cos(time * 0.5) * (height * 0.2);
      const r1 = Math.max(width, height) * 0.6;
      const grad1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, r1);
      grad1.addColorStop(0, 'rgba(79, 70, 229, 0.35)');
      grad1.addColorStop(0.5, 'rgba(79, 70, 229, 0.12)');
      grad1.addColorStop(1, 'transparent');

      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      // Primary wave 2 - Cyan
      const x2 = width * 0.65 + Math.cos(time * 0.6) * (width * 0.25);
      const y2 = height * 0.45 + Math.sin(time * 0.8) * (height * 0.25);
      const r2 = Math.max(width, height) * 0.55;
      const grad2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, r2);
      grad2.addColorStop(0, 'rgba(6, 182, 212, 0.28)');
      grad2.addColorStop(0.5, 'rgba(0, 240, 255, 0.1)');
      grad2.addColorStop(1, 'transparent');

      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(render);
    };

    const stopAnimation = () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    const startAnimation = () => {
      if (isReducedMotion) return;
      if (animationFrameId === null && isIntersecting) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
        if (isIntersecting) {
          startAnimation();
        } else {
          stopAnimation();
        }
      },
      { threshold: 0.05 },
    );
    observer.observe(container);

    if (isReducedMotion) {
      const rect = container.getBoundingClientRect();
      drawStaticGradient(rect.width, rect.height);
    } else {
      startAnimation();
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
      stopAnimation();
    };
  }, [colorStops, isReducedMotion]);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="h-full w-full opacity-80" />
      {/* Subtle organic noise overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
    </div>
  );
};
