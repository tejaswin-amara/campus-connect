import { RotateCcw } from 'lucide-react';
import type React from 'react';
import { Button } from '../../../components/ui/Button';

export interface EventEmptyStateProps {
  onReset: () => void;
  title?: string;
  message?: string;
}

export const EventEmptyState: React.FC<EventEmptyStateProps> = ({
  onReset,
  title = 'No Matching Campus Events Found',
  message = 'We could not find any events matching your selected category and keyword query. Try broadening your criteria or reset filters.',
}) => {
  return (
    <output
      aria-live="polite"
      className="flex flex-col items-center justify-center rounded-3xl border border-border-subtle bg-surface-base/80 p-12 text-center shadow-xl backdrop-blur-glass"
    >
      {/* Bespoke Semantic SVG Slate */}
      <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-2xl border border-border-subtle bg-surface-raised shadow-glow-cyan/20">
        <svg
          className="h-12 w-12 text-brand-primary/80"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
          <line x1="16" x2="16" y1="2" y2="6" />
          <line x1="8" x2="8" y1="2" y2="6" />
          <line x1="3" x2="21" y1="10" y2="10" />
          <path d="m9 16 2 2 4-4" strokeOpacity="0.4" />
          <line x1="9" x2="15" y1="17" y2="17" strokeDasharray="2 2" />
        </svg>
      </div>

      <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-400 leading-relaxed">{message}</p>

      <div className="mt-6">
        <Button variant="secondary" onClick={onReset}>
          <RotateCcw className="h-4 w-4" />
          <span>Reset All Filters</span>
        </Button>
      </div>
    </output>
  );
};
