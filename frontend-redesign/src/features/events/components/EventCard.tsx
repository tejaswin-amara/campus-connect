import { ArrowRight, Calendar, MapPin, Users } from 'lucide-react';
import type React from 'react';
import { Magnet } from '../../../components/reactbits/animations/Magnet';
import { SpotlightCard } from '../../../components/reactbits/cards/SpotlightCard';
import { Badge } from '../../../components/ui/Badge';
import { formatDate, getCapacityTier } from '../../../lib/utils';
import type { CampusEvent } from '../../../types';

export interface EventCardProps {
  event: CampusEvent;
  onSelect: (event: CampusEvent) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onSelect }) => {
  const capacity = getCapacityTier(event.registeredCount, event.maxCapacity);
  const isFull = Boolean(event.maxCapacity && event.registeredCount >= event.maxCapacity);

  return (
    <SpotlightCard
      as="article"
      aria-labelledby={`event-title-${event.id}`}
      className={`transition-all duration-300 hover:-translate-y-1 ${
        isFull ? 'ring-1 ring-status-danger/40' : ''
      }`}
    >
      {/* Banner Media enforcing fixed aspect ratio */}
      <div className="relative aspect-video w-full overflow-hidden bg-surface-base">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-surface-base text-slate-400">
            <Calendar className="h-12 w-12 text-slate-400" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-surface-raised via-transparent to-transparent opacity-60" />

        {/* Floating Category Badge */}
        <div className="absolute left-3 top-3">
          <Badge variant={event.category}>{event.category}</Badge>
        </div>

        {/* Floating Recommendation / Status Pill */}
        {event.isRecommended && (
          <div className="absolute right-3 top-3">
            <Badge variant="warning" className="shadow-lg backdrop-blur-md">
              ★ Recommended
            </Badge>
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="flex flex-1 flex-col p-5">
        <h3
          id={`event-title-${event.id}`}
          className="line-clamp-2 text-base font-bold text-white transition-colors group-hover:text-brand-primary"
        >
          {event.title}
        </h3>

        <div className="mt-3 space-y-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-brand-primary shrink-0" />
            <span className="text-slate-200 font-mono tracking-tight tabular-nums font-medium">
              {formatDate(event.dateTime)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-brand-accent shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>

          {event.maxCapacity ? (
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="font-mono tracking-tight tabular-nums">
                {event.registeredCount} / {event.maxCapacity} seats ({capacity.percent}%)
              </span>
            </div>
          ) : null}
        </div>

        {/* 3-Tier Capacity Progress Bar */}
        {event.maxCapacity ? (
          <div className="mt-3.5">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-base border border-border-subtle">
              <div
                className={`h-full transition-all duration-500 ${capacity.barColor} ${capacity.glowClass}`}
                style={{ width: `${capacity.percent}%` }}
              />
            </div>
          </div>
        ) : null}

        {/* Coordinators */}
        {event.coordinators && event.coordinators.length > 0 && (
          <div className="mt-3 flex items-center gap-2 pt-2 border-t border-border-subtle/30">
            <div className="flex -space-x-1.5 overflow-hidden">
              {event.coordinators.slice(0, 3).map((c) => {
                const initials = c.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();
                return (
                  <div
                    key={c.name}
                    title={`${c.name} (${c.role})`}
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-border-strong bg-surface-overlay text-[9px] font-bold text-brand-primary"
                  >
                    {initials}
                  </div>
                );
              })}
            </div>
            <span className="truncate text-[11px] text-slate-400">
              {event.coordinators.map((c) => c.name).join(', ')}
            </span>
          </div>
        )}

        {/* Action Button Strip */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-border-subtle/50">
          <Magnet maxDelta={6}>
            <button
              type="button"
              onClick={() => onSelect(event)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(event);
                }
              }}
              aria-label={`View details for ${event.title}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary group-hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-lg px-2 py-1 -ml-2"
            >
              <span>View Details</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </Magnet>

          <span
            className={`font-mono text-[11px] font-semibold tracking-tight tabular-nums ${
              isFull
                ? 'text-status-danger'
                : capacity.tier === 'warning'
                  ? 'text-status-warning'
                  : 'text-status-success'
            }`}
          >
            {capacity.label}
          </span>
        </div>
      </div>
    </SpotlightCard>
  );
};
