import type React from 'react';
import { useState } from 'react';
import { cn } from '../../lib/utils';

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, className }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={cn(
            'pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 rounded-lg border border-border-strong bg-surface-overlay px-2.5 py-1 text-xs font-medium text-white shadow-xl backdrop-blur-md transition-opacity duration-150 whitespace-nowrap',
            className,
          )}
        >
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-surface-overlay" />
        </div>
      )}
    </div>
  );
};
