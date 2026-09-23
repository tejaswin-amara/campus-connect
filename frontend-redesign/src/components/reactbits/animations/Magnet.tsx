import { motion } from 'motion/react';
import type React from 'react';
import { useRef, useState } from 'react';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

export interface MagnetProps {
  children: React.ReactNode;
  maxDelta?: number;
  className?: string;
  disabled?: boolean;
}

/**
 * Magnet adapted from https://reactbits.dev
 * Micro-interaction wrapper constraining translation to maximum 8px delta
 * with spring snapback on exit (stiffness: 220, damping: 14).
 */
export const Magnet: React.FC<MagnetProps> = ({
  children,
  maxDelta = 8,
  className = '',
  disabled = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isReducedMotion = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || isReducedMotion || !ref.current) return;

    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const deltaX = (clientX - centerX) / (width / 2);
    const deltaY = (clientY - centerY) / (height / 2);

    const clampedX = Math.max(-1, Math.min(1, deltaX)) * maxDelta;
    const clampedY = Math.max(-1, Math.min(1, deltaY)) * maxDelta;

    setPosition({ x: clampedX, y: clampedY });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  if (isReducedMotion || disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{
        type: 'spring',
        stiffness: 220,
        damping: 14,
        mass: 0.1,
      }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
};
