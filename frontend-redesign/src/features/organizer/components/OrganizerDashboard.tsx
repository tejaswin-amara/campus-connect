import {
  AlertCircle,
  Building2,
  Calendar,
  Clock,
  Layers,
  MapPin,
  Plus,
  QrCode,
  TrendingUp,
  Users,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { SpotlightCard } from '../../../components/reactbits/cards/SpotlightCard';
import { DecryptedText } from '../../../components/reactbits/text/DecryptedText';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useAuth } from '../../auth/context/AuthContext';
import { useClubDetails } from '../api/useClubDetails';
import { useClubEvents } from '../api/useClubEvents';
import { AttendeeRosterTable } from './AttendeeRosterTable';
import { CheckInScanner } from './CheckInScanner';
import { CreateEventModal } from './CreateEventModal';

export const OrganizerDashboard: React.FC = () => {
  const { user } = useAuth();
  const {
    data: club,
    isLoading: isClubLoading,
    isError: isClubError,
    refetch: refetchClub,
  } = useClubDetails();
  const {
    data: events = [],
    isLoading: isEventsLoading,
    isError: isEventsError,
    refetch: refetchEvents,
  } = useClubEvents();

  const [activeTab, setActiveTab] = useState<'events' | 'scanner' | 'roster'>('events');
  const [selectedEventId, setSelectedEventId] = useState<number | undefined>(undefined);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const isLoading = isClubLoading || isEventsLoading;
  const isError = isClubError || isEventsError;

  // Calculate aggregates
  const totalEvents = events.length;
  const totalRsvps = events.reduce((acc, e) => acc + (e.registeredCount || 0), 0);
  const totalCheckedIn = events.reduce((acc, e) => acc + (e.checkedInCount || 0), 0);
  const checkInVelocity = totalRsvps > 0 ? Math.round((totalCheckedIn / totalRsvps) * 100) : 0;

  const handleOpenScannerForEvent = (eventId: number) => {
    setSelectedEventId(eventId);
    setActiveTab('scanner');
  };

  const handleOpenRosterForEvent = (eventId: number) => {
    setSelectedEventId(eventId);
    setActiveTab('roster');
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-40 w-full rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 text-center rounded-3xl border border-rose-900/50 bg-surface-base shadow-2xl">
        <AlertCircle className="h-12 w-12 text-rose-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Club Workspace Sync Error</h2>
        <p className="text-xs text-zinc-400 mb-6">
          Unable to establish authorized session with the club studio gateway.
        </p>
        <Button
          variant="primary"
          onClick={() => {
            refetchClub();
            refetchEvents();
          }}
        >
          Retry Connection
        </Button>
      </div>
    );
  }

  const clubName = club?.name || user?.clubName || 'ACM Student Chapter';
  const clubCategory = club?.category || 'Technical';
  const clubDescription =
    club?.description ||
    'Official campus student chapter organizing technology hackathons, competitive programming, and engineering bootcamps.';

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Club Studio Banner Header */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-surface-base p-6 sm:p-8 backdrop-blur-xl">
        {/* Subtle glow layer */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="flex items-center gap-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 text-xs font-semibold text-indigo-400">
                <Building2 className="h-3.5 w-3.5" />
                {clubCategory}
              </span>
              <span className="rounded-lg bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-xs font-mono text-zinc-400">
                Lead: {user?.username} ({user?.rollNumber || 'ID Verified'})
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {clubName}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              {clubDescription}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('scanner')}
              className="gap-2 border-zinc-700 hover:border-indigo-400"
            >
              <QrCode className="h-4 w-4 text-indigo-400" />
              Live Scanner
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Author Event
            </Button>
          </div>
        </div>
      </div>

      {/* Telemetry Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <SpotlightCard
          className="p-5 border-zinc-800 bg-surface-base/90 rounded-2xl"
          spotlightColor="rgba(99, 102, 241, 0.15)"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Scheduled Events</span>
            <Calendar className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            <DecryptedText text={totalEvents} maxIterations={8} />
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            {events.filter((e) => e.status === 'PUBLISHED').length} published,{' '}
            {events.filter((e) => e.status === 'DRAFT').length} in draft
          </p>
        </SpotlightCard>

        <SpotlightCard
          className="p-5 border-zinc-800 bg-surface-base/90 rounded-2xl"
          spotlightColor="rgba(6, 182, 212, 0.15)"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total RSVPs</span>
            <Users className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            <DecryptedText text={totalRsvps} maxIterations={8} />
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            Aggregate student RSVPs across all club programs
          </p>
        </SpotlightCard>

        <SpotlightCard
          className="p-5 border-zinc-800 bg-surface-base/90 rounded-2xl"
          spotlightColor="rgba(16, 185, 129, 0.15)"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Turnout Velocity</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">
            <DecryptedText text={`${checkInVelocity}%`} maxIterations={8} />
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            {totalCheckedIn} of {totalRsvps} verified attendees checked in
          </p>
        </SpotlightCard>
      </div>

      {/* Primary Workspace Navigation Tabs */}
      <div className="border-b border-zinc-800 pb-2 flex items-center justify-between">
        <div className="flex space-x-2" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'events'}
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'events'
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="h-4 w-4" />
            Events Studio ({events.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'scanner'}
            onClick={() => setActiveTab('scanner')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'scanner'
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <QrCode className="h-4 w-4" />
            Live Check-in Engine
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'roster'}
            onClick={() => setActiveTab('roster')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'roster'
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="h-4 w-4" />
            Attendee Roster
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {events.length === 0 ? (
            <Card className="border-zinc-800 bg-surface-base p-12 text-center">
              <Calendar className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">No Club Events Published</h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto mb-6">
                Start by creating your chapter's first event. You will receive real-time RSVPs and
                live check-in capabilities.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreateModalOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Author First Event
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {events.map((event) => {
                const capacity = event.maxCapacity || 100;
                const ratio = Math.min(
                  100,
                  Math.round(((event.registeredCount || 0) / capacity) * 100),
                );

                return (
                  <SpotlightCard
                    key={event.id}
                    className="p-5 border-zinc-800 bg-surface-base rounded-2xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                          {event.category}
                        </span>
                        <Badge
                          variant={event.status === 'PUBLISHED' ? 'success' : 'warning'}
                          className="text-[10px]"
                        >
                          {event.status}
                        </Badge>
                      </div>

                      <h3 className="text-base font-bold text-white mb-1.5 line-clamp-1">
                        {event.title}
                      </h3>
                      <p className="text-xs text-zinc-400 line-clamp-2 mb-4">{event.description}</p>

                      <div className="space-y-1.5 text-xs text-zinc-400 border-t border-zinc-800/80 pt-3 mb-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                          <span>
                            {new Date(event.dateTime).toLocaleString([], {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                          <span className="truncate">{event.venue}</span>
                        </div>
                      </div>

                      {/* Capacity Meter */}
                      <div className="space-y-1 mb-5">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-zinc-500">RSVPs</span>
                          <span className="font-mono text-zinc-300">
                            {event.registeredCount} / {capacity} ({ratio}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full transition-all"
                            style={{ width: `${ratio}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-zinc-800/80">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenRosterForEvent(event.id)}
                        className="text-xs flex-1 gap-1"
                      >
                        <Users className="h-3.5 w-3.5" />
                        Roster
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenScannerForEvent(event.id)}
                        className="text-xs flex-1 gap-1"
                      >
                        <QrCode className="h-3.5 w-3.5" />
                        Scanner
                      </Button>
                    </div>
                  </SpotlightCard>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'scanner' && (
        <CheckInScanner
          events={events}
          selectedEventId={selectedEventId}
          onSelectEventId={(id) => setSelectedEventId(id)}
        />
      )}

      {activeTab === 'roster' && (
        <AttendeeRosterTable
          events={events}
          selectedEventId={selectedEventId}
          onSelectEventId={(id) => setSelectedEventId(id)}
        />
      )}

      {/* Author Event Modal */}
      <CreateEventModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => refetchEvents()}
      />
    </div>
  );
};
