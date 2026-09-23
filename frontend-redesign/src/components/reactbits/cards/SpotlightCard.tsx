import type React from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { cn } from '../../../lib/utils';

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  as?: 'div' | 'article';
}

/**
 * SpotlightCard adapted from https://reactbits.dev
 * Employs requestAnimationFrame to update CSS variables --mouse-x and --mouse-y
 * without causing React re-renders.
 */
export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className,
  spotlightColor = 'rgba(0, 240, 255, 0.15)',
  as: Component = 'div',
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
    }

    const clientX = e.clientX;
    const clientY = e.clientY;

    rafId.current = requestAnimationFrame(() => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      cardRef.current.style.setProperty('--mouse-x', `${x}px`);
      cardRef.current.style.setProperty('--mouse-y', `${y}px`);
    });
  }, []);

  return (
    <Component
      ref={cardRef as unknown as React.Ref<HTMLDivElement>}
      onMouseMove={handleMouseMove}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border-subtle bg-surface-raised/80 backdrop-blur-glass transition-colors duration-300 hover:border-brand-primary/40',
        className,
      )}
      {...props}
    >
      {/* Dynamic Cursor-Tracked Radial Spotlight Layer */}
      <div
        className="pointer-events-none absolute inset-0 -z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${spotlightColor}, transparent 80%)`,
        }}
        aria-hidden="true"
      />
      <div className="relative z-10 flex h-full flex-col">{children}</div>
    </Component>
  );
};
