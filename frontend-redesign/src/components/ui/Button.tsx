import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      type = 'button',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const variantStyles = {
      primary:
        'bg-brand-primary hover:bg-brand-primary/90 text-black font-semibold shadow-glow-cyan border border-brand-primary/40',
      accent:
        'bg-brand-accent hover:bg-brand-accent/90 text-white font-semibold shadow-glow-indigo border border-brand-accent/40',
      secondary:
        'bg-surface-raised hover:bg-surface-overlay text-white border border-border-subtle hover:border-border-strong',
      outline:
        'bg-transparent hover:bg-surface-raised text-white border border-border-subtle hover:border-brand-primary/40',
      ghost:
        'bg-transparent hover:bg-surface-raised text-slate-300 hover:text-white border-transparent',
      danger:
        'bg-status-danger hover:bg-status-danger/90 text-white font-semibold shadow-[0_0_16px_rgba(244,63,94,0.3)] border border-status-danger/40',
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
      md: 'px-4 py-2 text-sm rounded-xl gap-2',
      lg: 'px-6 py-2.5 text-base rounded-xl gap-2.5 font-semibold',
      icon: 'p-2 rounded-xl text-sm',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <svg
              role="img"
              className="h-4 w-4 animate-spin text-current"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Loading spinner"
            >
              <title>Loading spinner</title>
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>Processing...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
