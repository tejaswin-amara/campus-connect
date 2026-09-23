import type React from 'react';
import { cn } from '../../lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  aspectRatio?: 'video' | 'square' | 'auto';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  aspectRatio = 'auto',
  ...props
}) => {
  const aspectClass =
    aspectRatio === 'video'
      ? 'aspect-video w-full'
      : aspectRatio === 'square'
        ? 'aspect-square w-full'
        : '';

  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-surface-raised/80 border border-border-subtle/50',
        aspectClass,
        className,
      )}
      aria-hidden="true"
      {...props}
    />
  );
};
