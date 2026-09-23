import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

export interface DecryptedTextProps {
  text: string | number;
  speed?: number;
  maxIterations?: number;
  characters?: string;
  className?: string;
  animateOnHover?: boolean;
}

const GLYPHS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%&*';

/**
 * DecryptedText adapted from https://reactbits.dev
 * Cycles pseudo-random alphanumeric characters (30-50ms interval) until
 * resolving to the final target string.
 */
export const DecryptedText: React.FC<DecryptedTextProps> = ({
  text,
  speed = 40,
  maxIterations = 10,
  characters = GLYPHS,
  className = '',
  animateOnHover = false,
}) => {
  const targetText = String(text);
  const [displayText, setDisplayText] = useState(targetText);
  const isReducedMotion = useReducedMotion();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startDecryption = useCallback(() => {
    if (isReducedMotion) {
      setDisplayText(targetText);
      return;
    }

    let iteration = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayText(() => {
        return targetText
          .split('')
          .map((char, index) => {
            if (char === ' ' || char === '.' || char === '%' || char === '+' || char === '-') {
              return char;
            }
            if (index < Math.floor((iteration / maxIterations) * targetText.length)) {
              return targetText[index];
            }
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join('');
      });

      iteration += 1;
      if (iteration > maxIterations) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplayText(targetText);
      }
    }, speed);
  }, [targetText, isReducedMotion, maxIterations, characters, speed]);

  useEffect(() => {
    startDecryption();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startDecryption]);

  return (
    <span
      className={`font-mono tracking-tight tabular-nums ${className}`}
      onMouseEnter={animateOnHover ? startDecryption : undefined}
      aria-label={targetText}
    >
      {displayText}
    </span>
  );
};
