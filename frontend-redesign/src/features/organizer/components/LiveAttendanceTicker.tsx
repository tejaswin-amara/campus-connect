import { Activity, CheckCircle2, Radio } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { DecryptedText } from '../../../components/reactbits/text/DecryptedText';
import { Card } from '../../../components/ui/Card';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { API_BASE_URL } from '../../../lib/apiClient';

export interface LiveCheckInPing {
  registrationId: number;
  eventId: number;
  userId: number;
  studentName: string;
  rollNumber: string;
  ticketCode: string;
  timestamp: string;
}

export interface LiveAttendanceTickerProps {
  eventId?: number;
  eventTitle?: string;
  className?: string;
}

export const LiveAttendanceTicker: React.FC<LiveAttendanceTickerProps> = ({
  eventId,
  eventTitle,
  className = '',
}) => {
  const [pings, setPings] = useState<LiveCheckInPing[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected' | 'reconnecting'
  >('disconnected');
  const [totalLiveScans, setTotalLiveScans] = useState<number>(0);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    isMountedRef.current = true;

    if (!eventId || typeof window === 'undefined' || typeof EventSource === 'undefined') {
      setConnectionStatus('disconnected');
      return;
    }

    let isDisposed = false;

    const connect = () => {
      if (isDisposed) return;

      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      setConnectionStatus(retryCountRef.current > 0 ? 'reconnecting' : 'connecting');

      const sseUrl = API_BASE_URL
        ? `${API_BASE_URL}/api/organizer/events/${eventId}/live-checkin-stream`
        : `/api/organizer/events/${eventId}/live-checkin-stream`;

      try {
        const es = new EventSource(sseUrl, { withCredentials: true });
        eventSourceRef.current = es;

        es.onopen = () => {
          if (isDisposed) {
            es.close();
            return;
          }
          setConnectionStatus('connected');
          retryCountRef.current = 0;
        };

        es.addEventListener('checkin_ping', (event: MessageEvent) => {
          if (isDisposed) return;
          try {
            const data: LiveCheckInPing = JSON.parse(event.data);
            setPings((prev) => [data, ...prev.slice(0, 49)]); // Keep last 50
            setTotalLiveScans((prev) => prev + 1);
          } catch {
            // Ignore malformed payloads
          }
        });

        es.onerror = () => {
          if (isDisposed) return;
          es.close();
          eventSourceRef.current = null;

          const nextRetry = retryCountRef.current + 1;
          retryCountRef.current = nextRetry;
          setConnectionStatus('reconnecting');

          const delay = Math.min(1000 * 2 ** (nextRetry - 1), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            if (!isDisposed && isMountedRef.current) {
              connect();
            }
          }, delay);
        };
      } catch {
        setConnectionStatus('disconnected');
      }
    };

    connect();

    return () => {
      isDisposed = true;
      isMountedRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setConnectionStatus('disconnected');
    };
  }, [eventId]);

  const isLive = connectionStatus === 'connected';

  return (
    <Card className={`border-zinc-800 bg-[#0c0c12] p-5 ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Radio
              className={`h-4 w-4 ${isLive ? 'animate-pulse text-emerald-400' : 'text-zinc-500'}`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Live Attendance Broadcast
              </h3>
              {isLive ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ONLINE
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800 text-zinc-400">
                  {connectionStatus === 'reconnecting' ? 'RECONNECTING...' : 'OFFLINE'}
                </span>
              )}
            </div>
            {eventTitle && (
              <p className="text-[11px] text-zinc-400 truncate max-w-xs">{eventTitle}</p>
            )}
          </div>
        </div>

        {/* Counter */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Live Stream Scans
            </span>
            <div className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
              <DecryptedText text={totalLiveScans} maxIterations={5} />
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Ticker Feed */}
      <div className="mt-4">
        {pings.length === 0 ? (
          <div className="py-6 text-center text-xs text-zinc-400">
            <Activity className="h-6 w-6 mx-auto mb-2 text-zinc-500 animate-pulse" />
            <p>Awaiting live gate check-in pings...</p>
            <p className="text-[11px] text-zinc-400 mt-1">
              Scans from any gate or mobile terminal will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {pings.map((ping) => (
                <motion.div
                  key={`${ping.registrationId}-${ping.timestamp}`}
                  initial={
                    prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.97 }
                  }
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="flex items-center justify-between rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-2.5 text-xs hover:border-indigo-500/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <p className="font-semibold text-white truncate">{ping.studentName}</p>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                        <span className="font-mono text-indigo-300">{ping.ticketCode}</span>
                        {ping.rollNumber && (
                          <>
                            <span>&bull;</span>
                            <span className="font-mono">{ping.rollNumber}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="shrink-0 text-[10px] font-mono text-zinc-400 bg-zinc-900/80 px-2 py-1 rounded-md border border-zinc-800">
                    {ping.timestamp ? new Date(ping.timestamp).toLocaleTimeString() : 'Just now'}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </Card>
  );
};
