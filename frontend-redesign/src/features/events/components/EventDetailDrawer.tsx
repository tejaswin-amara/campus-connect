import {
  BookOpen,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  Ticket,
  Users,
  X,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Magnet } from '../../../components/reactbits/animations/Magnet';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { useFocusTrap } from '../../../hooks/useFocusTrap';
import { downloadICS, formatDate, getCapacityTier } from '../../../lib/utils';
import type { CampusEvent } from '../../../types';
import { useRegisterEvent } from '../api/useRegisterEvent';
import { useEventTelemetry } from '../hooks/useEventTelemetry';
import { type TicketPassData, TicketPassModal } from './TicketPassModal';

export interface EventDetailDrawerProps {
  event: CampusEvent | null;
  onClose: () => void;
}

export const EventDetailDrawer: React.FC<EventDetailDrawerProps> = ({ event, onClose }) => {
  const drawerRef = useRef<HTMLDialogElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const lastEventIdRef = useRef<number | null>(null);
  const registerMutation = useRegisterEvent();

  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketData, setTicketData] = useState<TicketPassData | null>(null);

  useFocusTrap(drawerRef, Boolean(event), onClose);

  const eventId = event?.id ?? null;
  const telemetry = useEventTelemetry(eventId);

  useEffect(() => {
    if (eventId !== null) {
      document.body.style.overflow = 'hidden';

      // Only perform initial focus capture and management when opening or switching to a new event
      if (lastEventIdRef.current !== eventId) {
        previousFocus.current = document.activeElement as HTMLElement;
        lastEventIdRef.current = eventId;

        setTimeout(() => {
          if (drawerRef.current) {
            const focusable = drawerRef.current.querySelector<HTMLElement>(
              'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
            );
            if (focusable) {
              focusable.focus();
            } else {
              drawerRef.current.focus();
            }
          }
        }, 50);
      }
    } else {
      document.body.style.overflow = '';
      if (lastEventIdRef.current !== null) {
        lastEventIdRef.current = null;
        if (previousFocus.current) {
          previousFocus.current.focus();
        }
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [eventId]);

  const isSafeExternalUrl = (url?: string) => Boolean(url && /^https?:\/\//i.test(url.trim()));

  if (!event) return null;

  const effectiveRegisteredCount = telemetry.registeredCount ?? event.registeredCount;
  const effectiveMaxCapacity = telemetry.maxCapacity ?? event.maxCapacity;
  const capacity = getCapacityTier(effectiveRegisteredCount, effectiveMaxCapacity);
  const isFull = Boolean(effectiveMaxCapacity && effectiveRegisteredCount >= effectiveMaxCapacity);

  const handleRegister = async () => {
    try {
      const res = await registerMutation.mutateAsync(event.id);
      const code =
        res?.ticketCode ||
        `TKT-${event.id}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const pass: TicketPassData = {
        eventId: event.id,
        eventTitle: event.title,
        category: event.category,
        venue: event.venue,
        date: formatDate(event.dateTime),
        time: new Date(event.dateTime).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        ticketCode: code,
        studentName: 'Registered Student',
        registrationDate: new Date().toISOString(),
      };

      setTicketData(pass);
      setShowTicketModal(true);
    } catch {
      // Error handled by mutation
    }
  };

  const getGoogleCalendarUrl = () => {
    const start = `${new Date(event.dateTime).toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
    const end = event.endDateTime
      ? `${new Date(event.endDateTime).toISOString().replace(/[-:]/g, '').split('.')[0]}Z`
      : start;
    const details = encodeURIComponent(event.description);
    const location = encodeURIComponent(event.venue);
    const text = encodeURIComponent(event.title);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onClose();
        }}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <dialog
        open
        ref={drawerRef}
        aria-modal="true"
        aria-labelledby="drawer-title"
        tabIndex={-1}
        className="m-0 border-0 p-0 bg-transparent text-inherit relative z-50 flex h-full w-full max-w-2xl flex-col border-l border-border-subtle bg-surface-base shadow-2xl backdrop-blur-heavy focus:outline-none"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-border-subtle p-5 sm:p-6 bg-surface-raised/80">
          <div className="flex items-center gap-2.5">
            <Badge variant={event.category}>{event.category}</Badge>
            {event.isRecommended && <Badge variant="warning">★ Recommended</Badge>}
            {telemetry.isLive && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Seats
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:text-white hover:bg-surface-overlay transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            aria-label="Close details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Body Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* Cover Media Header */}
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border-subtle bg-surface-raised shadow-lg">
            {event.imageUrl ? (
              <img src={event.imageUrl} alt={event.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-600">
                <Calendar className="h-16 w-16" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-surface-base via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-4 left-4 right-4">
              <span className="font-mono text-xs text-brand-primary tracking-tight tabular-nums">
                ID #{event.id}
              </span>
              <h2 id="drawer-title" className="text-2xl font-extrabold text-white tracking-tight">
                {event.title}
              </h2>
            </div>
          </div>

          {/* Key Schedule & Venue Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl border border-border-subtle bg-surface-raised/70 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-brand-primary/10 p-2.5 text-brand-primary border border-brand-primary/20">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Date
                </p>
                <p className="text-xs font-semibold text-white font-mono tracking-tight tabular-nums truncate">
                  {formatDate(event.dateTime)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-brand-accent/10 p-2.5 text-brand-accent border border-brand-accent/20">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Venue
                </p>
                <p className="text-xs font-semibold text-white truncate">{event.venue}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-status-success/10 p-2.5 text-status-success border border-status-success/20">
                <Users className="h-5 w-5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Capacity
                </p>
                <p className="text-xs font-semibold text-white font-mono tracking-tight tabular-nums">
                  {effectiveMaxCapacity
                    ? `${effectiveRegisteredCount} / ${effectiveMaxCapacity}`
                    : 'Unlimited'}
                </p>
              </div>
            </div>
          </div>

          {/* 3-Tier Capacity Bar */}
          {effectiveMaxCapacity ? (
            <div className="rounded-2xl border border-border-subtle bg-surface-raised/40 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Occupancy Limit</span>
                <span className="font-mono tracking-tight tabular-nums font-semibold text-white">
                  {capacity.percent}% filled &bull;{' '}
                  {Math.max(0, effectiveMaxCapacity - effectiveRegisteredCount)} seats left
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-base border border-border-subtle">
                <div
                  className={`h-full transition-all duration-500 ${capacity.barColor} ${capacity.glowClass}`}
                  style={{ width: `${capacity.percent}%` }}
                />
              </div>
            </div>
          ) : null}

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Event Overview
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          </div>

          {/* Event Syllabus */}
          {event.syllabus && event.syllabus.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                <BookOpen className="h-4 w-4 text-brand-primary" />
                <span>Session Syllabus & Schedule</span>
              </div>
              <div className="space-y-2">
                {event.syllabus.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-xl border border-border-subtle bg-surface-raised/60 p-3 text-xs text-slate-200"
                  >
                    <Clock className="h-4 w-4 text-brand-accent shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Eligibility Checklist */}
          {event.eligibility && event.eligibility.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                <CheckCircle2 className="h-4 w-4 text-status-success" />
                <span>Eligibility & Prerequisites</span>
              </div>
              <ul className="space-y-2">
                {event.eligibility.map((criterion) => (
                  <li
                    key={criterion}
                    className="flex items-center gap-2.5 rounded-xl border border-border-subtle bg-surface-raised/60 p-3 text-xs text-slate-200"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-status-success shrink-0" />
                    <span>{criterion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Coordinator Cards */}
          {event.coordinators && event.coordinators.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Event Coordinators
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {event.coordinators.map((coord) => (
                  <div
                    key={coord.email}
                    className="rounded-xl border border-border-subtle bg-surface-raised/60 p-3 text-xs space-y-1"
                  >
                    <p className="font-bold text-white">{coord.name}</p>
                    <p className="text-slate-400">{coord.role}</p>
                    <a
                      href={`mailto:${coord.email}`}
                      className="inline-flex items-center gap-1.5 text-brand-primary hover:underline pt-1"
                    >
                      <Mail className="h-3 w-3" />
                      <span>{coord.email}</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Action Footer */}
        <div className="border-t border-border-subtle p-5 sm:p-6 bg-surface-raised/90 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => downloadICS(event)}
              title="Download .ics Calendar file"
            >
              <CalendarPlus className="h-4 w-4" />
              <span>Export ICS</span>
            </Button>

            <a
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <Button variant="outline" size="sm">
                <span>Google Calendar</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </a>
          </div>

          <div className="flex items-center gap-3">
            {isSafeExternalUrl(event.registrationLink) ? (
              <a
                href={event.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex"
              >
                <Button variant="outline" size="md">
                  <span>External Portal</span>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            ) : null}

            {ticketData && (
              <Button
                variant="outline"
                size="md"
                className="border-brand-primary/40 text-brand-primary hover:bg-brand-primary/10 gap-2"
                onClick={() => setShowTicketModal(true)}
              >
                <Ticket className="h-4 w-4" />
                <span>View Ticket Pass</span>
              </Button>
            )}

            {/* One-Click Optimistic Registration bound to Magnet wrapper */}
            <Magnet disabled={isFull}>
              <Button
                variant="primary"
                size="md"
                disabled={isFull || registerMutation.isPending}
                isLoading={registerMutation.isPending}
                onClick={handleRegister}
              >
                <span>{isFull ? 'Waitlist Only' : 'One-Click Register'}</span>
              </Button>
            </Magnet>
          </div>
        </div>
      </dialog>

      {/* Verified Ticket Pass Modal */}
      {ticketData && (
        <TicketPassModal
          isOpen={showTicketModal}
          onClose={() => setShowTicketModal(false)}
          ticket={ticketData}
        />
      )}
    </div>
  );
};
