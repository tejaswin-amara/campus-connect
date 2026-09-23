import type React from 'react';
import { Skeleton } from '../../../components/ui/Skeleton';
import type { CampusEvent } from '../../../types';
import { EventCard } from './EventCard';
import { EventEmptyState } from './EventEmptyState';
import { EventErrorState } from './EventErrorState';

export interface EventGridProps {
  events: CampusEvent[] | undefined;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  onResetFilters: () => void;
  onSelectEvent: (event: CampusEvent) => void;
}

const SKELETON_KEYS = ['sk-1', 'sk-2', 'sk-3', 'sk-4', 'sk-5', 'sk-6'];

export const EventGrid: React.FC<EventGridProps> = ({
  events,
  isLoading,
  error,
  onRetry,
  onResetFilters,
  onSelectEvent,
}) => {
  // 1 & 2: Loading State with Skeleton Slices enforcing fixed aspect ratios
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        aria-busy="true"
        aria-label="Loading campus events"
      >
        {SKELETON_KEYS.map((key) => (
          <div
            key={key}
            className="flex flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface-raised/60 p-0"
          >
            <Skeleton aspectRatio="video" />
            <div className="space-y-3 p-5">
              <Skeleton className="h-5 w-3/4" />
              <div className="space-y-2 pt-1">
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-1.5 w-full mt-3 rounded-full" />
              <div className="flex items-center justify-between pt-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 3: Error State
  if (error) {
    return <EventErrorState error={error} onRetry={onRetry} />;
  }

  // 4: Empty State
  if (!events || events.length === 0) {
    return <EventEmptyState onReset={onResetFilters} />;
  }

  // 5: Success / Data State
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard key={event.id} event={event} onSelect={onSelectEvent} />
      ))}
    </div>
  );
};
