import { Sparkles } from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import type { EventCategory } from '../../types';
import { useEvents } from './api/useEvents';
import { EventCard } from './components/EventCard';
import { EventDetailDrawer } from './components/EventDetailDrawer';
import { EventGrid } from './components/EventGrid';
import { FilterBar } from './components/FilterBar';
import { HeroBanner } from './components/HeroBanner';

export const EventList: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | EventCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeEventId, setActiveEventId] = useState<number | null>(null);

  // Debounce search query by 300ms
  const debouncedSearch = useDebounce(searchQuery, 300);

  // TanStack Query for all events
  const {
    data: allEvents = [],
    isLoading,
    error,
    refetch,
  } = useEvents({
    search: debouncedSearch,
    category: selectedCategory,
  });

  const activeEvent = useMemo(
    () => allEvents.find((e) => e.id === activeEventId) ?? null,
    [allEvents, activeEventId],
  );

  // Calculate dynamic category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: allEvents.length,
      Technical: 0,
      Cultural: 0,
      Sports: 0,
      Workshop: 0,
      Seminar: 0,
    };
    for (const e of allEvents) {
      if (counts[e.category] !== undefined) {
        counts[e.category] += 1;
      }
    }
    return counts;
  }, [allEvents]);

  // Recommended feed (when on 'All' and not searching)
  const recommendedEvents = useMemo(() => {
    return allEvents.filter((e) => e.isRecommended);
  }, [allEvents]);

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
  };

  return (
    <div className="space-y-10">
      {/* Hero Banner with Aurora & BlurText */}
      <HeroBanner
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalListingsCount={allEvents.length}
      />

      {/* Filter Capsule Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <FilterBar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          categoryCounts={categoryCounts}
        />
      </div>

      {/* Recommended Marquee Strip (when browsing 'All' without search query) */}
      {!debouncedSearch && selectedCategory === 'All' && recommendedEvents.length > 0 && (
        <section aria-labelledby="recommended-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-status-warning" />
              <h2
                id="recommended-heading"
                className="text-base font-bold text-white tracking-tight"
              >
                Recommended For Your Academic Profile
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono tracking-tight tabular-nums">
              {recommendedEvents.length} curated matches
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedEvents.map((event) => (
              <EventCard
                key={`rec-${event.id}`}
                event={event}
                onSelect={(e) => setActiveEventId(e.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Main Catalogue Grid (5-State Disciplined) */}
      <section aria-labelledby="catalogue-heading" className="space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <h2 id="catalogue-heading" className="text-lg font-bold text-white tracking-tight">
            {selectedCategory === 'All' ? 'All Campus Events' : `${selectedCategory} Listings`}
          </h2>
          <span className="text-xs text-slate-400 font-mono tracking-tight tabular-nums">
            {allEvents.length} listings available
          </span>
        </div>

        <EventGrid
          events={allEvents}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          onResetFilters={handleResetFilters}
          onSelectEvent={(e) => setActiveEventId(e.id)}
        />
      </section>

      {/* Accessible Detail Drawer Side-Sheet */}
      <EventDetailDrawer event={activeEvent} onClose={() => setActiveEventId(null)} />
    </div>
  );
};
