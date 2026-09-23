import { motion } from 'motion/react';
import type React from 'react';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import type { EventCategory } from '../../../types';

export interface FilterBarProps {
  selectedCategory: 'All' | EventCategory;
  onSelectCategory: (category: 'All' | EventCategory) => void;
  categoryCounts: Record<string, number>;
}

const CATEGORIES: ('All' | EventCategory)[] = [
  'All',
  'Technical',
  'Cultural',
  'Sports',
  'Workshop',
  'Seminar',
];

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}) => {
  const isReducedMotion = useReducedMotion();

  return (
    <nav
      aria-label="Event categories"
      className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-border-subtle bg-surface-base/90 p-1.5 backdrop-blur-glass scrollbar-none"
    >
      {CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat;
        const count = categoryCounts[cat] ?? 0;

        return (
          <button
            type="button"
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
              isSelected ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {/* Sliding Active Capsule Indicator */}
            {isSelected && (
              <motion.div
                layoutId={isReducedMotion ? undefined : 'activeFilter'}
                className="absolute inset-0 rounded-xl bg-surface-raised border border-border-strong shadow-glow-indigo"
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                }}
                style={{ zIndex: 0 }}
              />
            )}

            <span className="relative z-10">{cat}</span>

            {/* Category count pill */}
            <span
              className={`relative z-10 rounded-full px-1.5 py-0.2 font-mono text-[10px] tracking-tight tabular-nums transition-colors ${
                isSelected
                  ? 'bg-brand-primary text-black font-bold'
                  : 'bg-surface-overlay text-slate-400'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
