import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Clock,
  QrCode,
  RotateCcw,
  Sparkles,
  Ticket,
  User,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Magnet } from '../../../components/reactbits/animations/Magnet';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { useCheckInAttendee } from '../api/useCheckInAttendee';
import type { CheckInResult, OrganizerEvent } from '../types';
import { LiveAttendanceTicker } from './LiveAttendanceTicker';

interface CheckInScannerProps {
  events: OrganizerEvent[];
  selectedEventId?: number;
  onSelectEventId?: (id: number) => void;
}

export const CheckInScanner: React.FC<CheckInScannerProps> = ({
  events,
  selectedEventId: propEventId,
  onSelectEventId,
}) => {
  const activeEvents = events.filter((e) => e.status !== 'CANCELLED');
  const [internalEventId, setInternalEventId] = useState<number | undefined>(
    propEventId || activeEvents[0]?.id,
  );

  const activeEventId = propEventId ?? internalEventId;
  const currentEvent = events.find((e) => e.id === activeEventId);

  const [ticketCode, setTicketCode] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [inputMode, setInputMode] = useState<'ticket' | 'roll'>('ticket');

  const [lastCheckIn, setLastCheckIn] = useState<CheckInResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState<CheckInResult[]>([]);

  const checkInMutation = useCheckInAttendee();

  const handleEventChange = (id: number) => {
    setInternalEventId(id);
    onSelectEventId?.(id);
    setLastCheckIn(null);
    setErrorMessage(null);
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeEventId) {
      setErrorMessage('Please select an active event to verify tickets.');
      return;
    }

    const trimmedCode = ticketCode.trim();
    const trimmedRoll = rollNumber.trim();

    if (inputMode === 'ticket' && !trimmedCode) {
      setErrorMessage('Please enter a valid ticket identifier.');
      return;
    }
    if (inputMode === 'roll' && !trimmedRoll) {
      setErrorMessage('Please enter a student roll number.');
      return;
    }

    setErrorMessage(null);

    try {
      const result = await checkInMutation.mutateAsync({
        eventId: activeEventId,
        data: {
          ticketCode: inputMode === 'ticket' ? trimmedCode : undefined,
          rollNumber: inputMode === 'roll' ? trimmedRoll : undefined,
        },
      });

      setLastCheckIn(result);
      setRecentCheckIns((prev) => [result, ...prev.slice(0, 9)]);
      setTicketCode('');
      setRollNumber('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Verification failed. Invalid or already claimed ticket.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Event Selection Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-[#0c0c12]/80 p-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Live Check-in Engine</h3>
            <p className="text-xs text-zinc-400">
              Validating attendees for{' '}
              <span className="text-indigo-400 font-medium">
                {currentEvent ? currentEvent.title : 'No event selected'}
              </span>
            </p>
          </div>
        </div>

        <div className="w-full sm:w-auto">
          <label htmlFor="scanner-event-select" className="sr-only">
            Select Event for Check-in
          </label>
          <select
            id="scanner-event-select"
            value={activeEventId || ''}
            onChange={(e) => handleEventChange(Number(e.target.value))}
            className="w-full sm:w-64 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title} ({e.checkedInCount}/{e.registeredCount} checked in)
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scanner Viewport & Verification Form */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-zinc-800 bg-[#0c0c12] p-6 relative overflow-hidden">
            {/* Viewfinder Box */}
            <div className="relative aspect-video w-full rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/80 overflow-hidden flex flex-col items-center justify-center">
              {/* Corner Reticles */}
              <div className="absolute top-4 left-4 h-6 w-6 border-t-2 border-l-2 border-indigo-400" />
              <div className="absolute top-4 right-4 h-6 w-6 border-t-2 border-r-2 border-indigo-400" />
              <div className="absolute bottom-4 left-4 h-6 w-6 border-b-2 border-l-2 border-indigo-400" />
              <div className="absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2 border-indigo-400" />

              {/* Laser Scan Animation Line */}
              <div
                className="absolute inset-x-8 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_rgba(6,182,212,0.8)] animate-pulse"
                style={{
                  top: '48%',
                }}
              />

              <Camera className="h-10 w-10 text-zinc-600 mb-2" />
              <p className="text-xs text-zinc-400 font-mono">OPTICAL SCANNER READY</p>
              <p className="text-[11px] text-zinc-400 mt-1">
                Align ticket QR code in frame or enter code below
              </p>
            </div>

            {/* Input Mode Selector */}
            <div className="mt-6 flex rounded-xl bg-zinc-900/80 p-1 border border-zinc-800">
              <button
                type="button"
                onClick={() => setInputMode('ticket')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                  inputMode === 'ticket'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Ticket className="h-3.5 w-3.5" />
                Ticket Code
              </button>
              <button
                type="button"
                onClick={() => setInputMode('roll')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                  inputMode === 'roll'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <User className="h-3.5 w-3.5" />
                Roll Number
              </button>
            </div>

            {/* Verification Form */}
            <form onSubmit={handleVerify} className="mt-4 space-y-4" noValidate>
              {inputMode === 'ticket' ? (
                <div>
                  <label
                    htmlFor="scanner-ticket-code"
                    className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5"
                  >
                    Ticket Code
                  </label>
                  <Input
                    id="scanner-ticket-code"
                    value={ticketCode}
                    onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
                    placeholder="e.g. TKT-101-ABCD"
                    className="font-mono text-sm uppercase tracking-wider"
                    autoFocus
                  />
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="scanner-roll-number"
                    className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5"
                  >
                    Student Roll Number
                  </label>
                  <Input
                    id="scanner-roll-number"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="e.g. 2100030110"
                    className="font-mono text-sm"
                    autoFocus
                  />
                </div>
              )}

              {errorMessage && (
                <div
                  role="alert"
                  className="flex items-center gap-2 rounded-xl border border-rose-900/60 bg-rose-950/40 p-3 text-xs text-rose-400"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTicketCode('');
                    setRollNumber('');
                    setErrorMessage(null);
                  }}
                  disabled={checkInMutation.isPending}
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Clear
                </Button>

                <Magnet maxDelta={6}>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={checkInMutation.isPending}
                    className="px-6"
                  >
                    {checkInMutation.isPending ? 'Verifying...' : 'Verify & Check In'}
                  </Button>
                </Magnet>
              </div>
            </form>
          </Card>
        </div>

        {/* Verification Result Display & Recent Feed */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Result Card */}
          {lastCheckIn ? (
            <div className="rounded-2xl border border-emerald-500/50 bg-[#091e14]/90 p-6 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <span className="inline-block rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                    ACCESS GRANTED
                  </span>
                  <h4 className="text-lg font-bold text-white tracking-tight mt-0.5">
                    {lastCheckIn.attendeeName || 'Verified Attendee'}
                  </h4>
                </div>
              </div>

              <div className="space-y-2 text-xs border-t border-emerald-500/20 pt-3">
                <div className="flex justify-between text-zinc-300">
                  <span className="text-emerald-300/80">Ticket Identifier</span>
                  <span className="font-mono font-bold text-white">{lastCheckIn.ticketCode}</span>
                </div>
                {lastCheckIn.rollNumber && (
                  <div className="flex justify-between text-zinc-300">
                    <span className="text-emerald-300/80">Roll Number</span>
                    <span className="font-mono text-white">{lastCheckIn.rollNumber}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-300">
                  <span className="text-emerald-300/80">Validated At</span>
                  <span className="font-mono text-zinc-300">
                    {lastCheckIn.checkInTime
                      ? new Date(lastCheckIn.checkInTime).toLocaleTimeString()
                      : 'Just now'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <Card className="border-zinc-800 bg-[#0c0c12] p-6 text-center">
              <Sparkles className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-white">Scanner Standby</h4>
              <p className="text-xs text-zinc-400 mt-1">
                Verification outcome and student ticket credentials will appear here immediately
                upon scan.
              </p>
            </Card>
          )}

          {/* Live Attendance SSE Broadcast Stream */}
          <LiveAttendanceTicker eventId={activeEventId} eventTitle={currentEvent?.title} />

          {/* Recent Check-ins Roster */}
          <Card className="border-zinc-800 bg-[#0c0c12] p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-zinc-400" />
                Session History ({recentCheckIns.length})
              </h4>
            </div>

            {recentCheckIns.length === 0 ? (
              <p className="text-xs text-zinc-400 py-4 text-center">
                No check-ins recorded in this session yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {recentCheckIns.map((item, index) => (
                  <div
                    key={`${item.ticketCode}-${index}`}
                    className="flex items-center justify-between rounded-xl bg-zinc-900/60 border border-zinc-800/80 p-2.5 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-white">{item.attendeeName}</p>
                      <p className="text-[11px] font-mono text-zinc-400">
                        {item.ticketCode} • {item.rollNumber || 'N/A'}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      {item.checkInTime
                        ? new Date(item.checkInTime).toLocaleTimeString()
                        : 'CHECKED IN'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
