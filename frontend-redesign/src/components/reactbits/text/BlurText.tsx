import { motion } from 'motion/react';
import type React from 'react';
import { useMemo } from 'react';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

export interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}

/**
 * BlurText adapted from https://reactbits.dev
 * Word-staggered filter: blur(8px) -> blur(0px) animation combined with
 * an upward translation transition while maintaining accessible contrast ratio (> 3:1).
 */
export const BlurText: React.FC<BlurTextProps> = ({
  text,
  className = '',
  delay = 0.05,
  stagger = 0.05,
  as: Component = 'h1',
}) => {
  const isReducedMotion = useReducedMotion();
  const wordItems = useMemo(
    () => text.split(' ').map((word, i) => ({ key: `w-${i}-${word}`, text: word })),
    [text],
  );

  if (isReducedMotion) {
    return <Component className={className}>{text}</Component>;
  }

  const containerVariants = {
    hidden: { opacity: 0.6 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const wordVariants = {
    hidden: {
      opacity: 0.6,
      y: 10,
      filter: 'blur(8px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring' as const,
        stiffness: 260,
        damping: 20,
      },
    },
  };

  return (
    <Component className={className}>
      <motion.span
        className="inline-flex flex-wrap gap-x-[0.3em]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        aria-label={text}
      >
        {wordItems.map((item) => (
          <motion.span key={item.key} variants={wordVariants} className="inline-block">
            {item.text}
          </motion.span>
        ))}
      </motion.span>
    </Component>
  );
};
