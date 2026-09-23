import { Check, CheckCircle2, Clock, Download, Filter, Search, Users } from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Skeleton } from '../../../components/ui/Skeleton';
import { apiClient } from '../../../lib/apiClient';
import { useCheckInAttendee } from '../api/useCheckInAttendee';
import { useClubRoster } from '../api/useClubRoster';
import type { Attendee, OrganizerEvent } from '../types';

interface AttendeeRosterTableProps {
  events: OrganizerEvent[];
  selectedEventId?: number;
  onSelectEventId?: (id: number) => void;
}

export const AttendeeRosterTable: React.FC<AttendeeRosterTableProps> = ({
  events,
  selectedEventId: propEventId,
  onSelectEventId,
}) => {
  const [internalEventId, setInternalEventId] = useState<number | undefined>(
    propEventId || events[0]?.id,
  );

  const activeEventId = propEventId ?? internalEventId;
  const currentEvent = events.find((e) => e.id === activeEventId);

  const { data: attendees = [], isLoading, isError } = useClubRoster(activeEventId);
  const checkInMutation = useCheckInAttendee();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'checked-in' | 'pending'>('all');

  const filteredAttendees = useMemo(() => {
    return attendees.filter((a) => {
      const matchSearch =
        !searchTerm ||
        a.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        Boolean(a.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        Boolean(a.ticketCode?.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'checked-in' && a.checkedIn) ||
        (statusFilter === 'pending' && !a.checkedIn);

      return matchSearch && matchStatus;
    });
  }, [attendees, searchTerm, statusFilter]);

  const handleExportCsv = () => {
    if (attendees.length === 0) return;
    const csvContent = apiClient.exportRosterCsv(attendees);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    if (
      typeof window !== 'undefined' &&
      window.URL &&
      typeof window.URL.createObjectURL === 'function'
    ) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeTitle = (currentEvent?.title || 'event').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.download = `roster-${safeTitle}-${Date.now()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleQuickCheckIn = async (attendee: Attendee) => {
    if (!activeEventId || attendee.checkedIn) return;
    try {
      await checkInMutation.mutateAsync({
        eventId: activeEventId,
        data: {
          ticketCode: attendee.ticketCode,
          rollNumber: attendee.rollNumber,
        },
      });
    } catch {
      // Ignored, mutation error captures
    }
  };

  const checkedInCount = attendees.filter((a) => a.checkedIn).length;
  const totalCount = attendees.length;
  const checkInPercentage = totalCount > 0 ? Math.round((checkedInCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Event Header & Action Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-[#0c0c12]/80 p-5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Attendee Roster Governance</h3>
            <p className="text-xs text-zinc-400">
              {totalCount} registered students •{' '}
              <span className="text-emerald-400 font-semibold">{checkedInCount} checked in</span> (
              {checkInPercentage}%)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <label htmlFor="roster-event-select" className="sr-only">
            Select Event for Roster
          </label>
          <select
            id="roster-event-select"
            value={activeEventId || ''}
            onChange={(e) => {
              const id = Number(e.target.value);
              setInternalEventId(id);
              onSelectEventId?.(id);
            }}
            className="rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none flex-1 md:flex-none"
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={attendees.length === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name, roll number, or ticket code..."
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-zinc-500" />
          <div className="flex rounded-lg bg-zinc-900/80 p-0.5 border border-zinc-800 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-md transition-all ${
                statusFilter === 'all'
                  ? 'bg-zinc-800 text-white font-medium shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All ({attendees.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('checked-in')}
              className={`px-3 py-1 rounded-md transition-all ${
                statusFilter === 'checked-in'
                  ? 'bg-zinc-800 text-emerald-400 font-medium shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Checked In ({checkedInCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1 rounded-md transition-all ${
                statusFilter === 'pending'
                  ? 'bg-zinc-800 text-amber-400 font-medium shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Pending ({totalCount - checkedInCount})
            </button>
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <Card className="border-zinc-800 bg-[#0c0c12] overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-rose-400 text-xs">
            Failed to load attendee roster. Verify backend network connectivity.
          </div>
        ) : filteredAttendees.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-10 w-10 text-zinc-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">No Attendees Match Criteria</p>
            <p className="text-xs text-zinc-400 mt-1">
              {attendees.length === 0
                ? 'No students have registered for this event yet.'
                : 'Try adjusting your search terms or filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Ticket Identifier</th>
                  <th className="py-3 px-4">Check-In Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredAttendees.map((attendee) => (
                  <tr
                    key={attendee.registrationId}
                    className="hover:bg-zinc-900/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{attendee.username}</div>
                      <div className="text-[11px] text-zinc-400">{attendee.email}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-300">
                      {attendee.rollNumber || '—'}
                    </td>
                    <td className="py-3 px-4 text-zinc-300">{attendee.department || '—'}</td>
                    <td className="py-3 px-4 font-mono text-indigo-400">
                      {attendee.ticketCode || '—'}
                    </td>
                    <td className="py-3 px-4">
                      {attendee.checkedIn ? (
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span className="font-mono text-[11px]">
                            {attendee.checkInTime
                              ? new Date(attendee.checkInTime).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'VERIFIED'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-zinc-400">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="text-[11px]">Pending</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {!attendee.checkedIn ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickCheckIn(attendee)}
                          disabled={checkInMutation.isPending}
                          className="h-7 text-[11px] px-2.5 hover:border-emerald-500/50 hover:text-emerald-400"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Check In
                        </Button>
                      ) : (
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">
                          Completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
