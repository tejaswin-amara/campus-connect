import type React from 'react';
import { cn } from '../../lib/utils';
import type { EventCategory } from '../../types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'outline'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | EventCategory
    | (string & {});
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'Technical':
        return 'bg-brand-accent/15 text-indigo-300 border-brand-accent/30 shadow-[0_0_8px_rgba(99,102,241,0.2)]';
      case 'Cultural':
        return 'bg-[#ec4899]/15 text-pink-300 border-[#ec4899]/30 shadow-[0_0_8px_rgba(236,72,153,0.2)]';
      case 'Sports':
        return 'bg-status-success/15 text-emerald-300 border-status-success/30 shadow-[0_0_8px_rgba(16,185,129,0.2)]';
      case 'Workshop':
        return 'bg-status-warning/15 text-amber-300 border-status-warning/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]';
      case 'Seminar':
        return 'bg-brand-primary/15 text-cyan-300 border-brand-primary/30 shadow-[0_0_8px_rgba(0,240,255,0.2)]';
      case 'success':
        return 'bg-status-success/15 text-emerald-300 border-status-success/30';
      case 'warning':
        return 'bg-status-warning/15 text-amber-300 border-status-warning/30';
      case 'danger':
        return 'bg-status-danger/15 text-rose-300 border-status-danger/30';
      case 'info':
        return 'bg-status-info/15 text-sky-300 border-status-info/30';
      case 'secondary':
        return 'bg-surface-raised text-slate-300 border-border-subtle';
      case 'outline':
        return 'bg-transparent text-slate-200 border-border-subtle';
      default:
        return 'bg-brand-primary/15 text-brand-primary border-brand-primary/30';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all',
        getVariantStyles(),
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
};
