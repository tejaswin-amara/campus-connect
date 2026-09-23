import {
  Calendar,
  Check,
  Clock,
  Copy,
  Download,
  MapPin,
  Printer,
  ShieldCheck,
  Ticket,
  User,
  X,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Magnet } from '../../../components/reactbits/animations/Magnet';
import { SpotlightCard } from '../../../components/reactbits/cards/SpotlightCard';
import { DecryptedText } from '../../../components/reactbits/text/DecryptedText';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { QrCodeSvg } from '../../../components/ui/QrCodeSvg';

export interface TicketPassData {
  eventId: number;
  eventTitle: string;
  category?: string;
  venue?: string;
  date?: string;
  time?: string;
  ticketCode: string;
  studentName?: string;
  rollNumber?: string;
  registrationDate?: string;
}

export interface TicketPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: TicketPassData;
}

export const TicketPassModal: React.FC<TicketPassModalProps> = ({ isOpen, onClose, ticket }) => {
  const [copied, setCopied] = useState(false);
  const modalRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Sync ticket to offline storage
  useEffect(() => {
    if (isOpen && ticket?.ticketCode) {
      try {
        const stored = localStorage.getItem('campus_tickets');
        const tickets: TicketPassData[] = stored ? JSON.parse(stored) : [];
        const filtered = tickets.filter((t) => t.ticketCode !== ticket.ticketCode);
        localStorage.setItem('campus_tickets', JSON.stringify([ticket, ...filtered]));
      } catch {
        // Ignore localStorage quota or private browsing errors
      }
    }
  }, [isOpen, ticket]);

  // Focus management and escape listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(ticket.ticketCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(ticket, null, 2),
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${ticket.ticketCode}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <dialog
      open
      ref={modalRef}
      aria-modal="true"
      aria-labelledby="ticket-modal-title"
      className="fixed inset-0 m-0 p-4 border-0 bg-transparent text-inherit z-50 flex h-full w-full items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border-subtle bg-surface-base shadow-glow-cyan">
        <SpotlightCard spotlightColor="rgba(0, 240, 255, 0.2)" className="p-6 relative text-white">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border-subtle pb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/20 text-brand-primary">
                <Ticket className="h-5 w-5" />
              </span>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-primary">
                  Official Admission Pass
                </span>
                <div className="flex items-center gap-1.5 text-xs text-status-success font-medium">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified Seat Confirmed
                </div>
              </div>
            </div>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-surface-raised hover:text-white transition-colors"
              aria-label="Close ticket pass dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Event Information */}
          <div className="mt-5 space-y-4">
            <div>
              <Badge variant={ticket.category || 'Technical'}>
                {ticket.category || 'Campus Event'}
              </Badge>
              <h2
                id="ticket-modal-title"
                className="mt-2 text-xl font-bold tracking-tight text-white"
              >
                {ticket.eventTitle}
              </h2>
            </div>

            {/* Event Meta Details */}
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-2 rounded-lg bg-surface-raised/60 p-2 border border-border-subtle">
                <Calendar className="h-4 w-4 text-brand-primary shrink-0" />
                <span className="truncate">{ticket.date || 'TBD'}</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-surface-raised/60 p-2 border border-border-subtle">
                <Clock className="h-4 w-4 text-brand-primary shrink-0" />
                <span className="truncate">{ticket.time || 'TBD'}</span>
              </div>
              <div className="col-span-2 flex items-center gap-2 rounded-lg bg-surface-raised/60 p-2 border border-border-subtle">
                <MapPin className="h-4 w-4 text-brand-primary shrink-0" />
                <span className="truncate">{ticket.venue || 'Campus Auditorium'}</span>
              </div>
            </div>

            {/* Attendee Info */}
            {(ticket.studentName || ticket.rollNumber) && (
              <div className="flex items-center justify-between rounded-lg bg-surface-raised/40 p-3 border border-border-subtle text-xs">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="font-medium text-slate-200">
                    {ticket.studentName || 'Student Attendee'}
                  </span>
                </div>
                {ticket.rollNumber && (
                  <span className="font-mono text-slate-400">{ticket.rollNumber}</span>
                )}
              </div>
            )}

            {/* QR Code Section */}
            <div className="flex flex-col items-center justify-center rounded-xl bg-surface-raised/80 p-5 border border-border-strong text-center">
              <div className="relative rounded-lg bg-white p-3 shadow-md">
                <QrCodeSvg
                  value={ticket.ticketCode}
                  size={160}
                  fgColor="#000000"
                  bgColor="#ffffff"
                  label={`QR Code for ticket ${ticket.ticketCode}`}
                />
              </div>

              {/* Decrypted Ticket Code */}
              <div className="mt-4 flex flex-col items-center">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Ticket Passcode
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <DecryptedText
                    text={ticket.ticketCode}
                    className="font-mono text-lg font-bold tracking-widest text-brand-primary"
                  />
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="rounded-md p-1 text-slate-400 hover:text-white hover:bg-surface-base transition-colors"
                    aria-label="Copy ticket code"
                    title="Copy code"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-status-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-6 flex items-center gap-3 pt-4 border-t border-border-subtle">
            <Magnet maxDelta={6} className="flex-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full flex items-center justify-center gap-2 border-border-subtle text-xs"
                onClick={handlePrint}
              >
                <Printer className="h-3.5 w-3.5" />
                Print Pass
              </Button>
            </Magnet>

            <Magnet maxDelta={6} className="flex-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full flex items-center justify-center gap-2 border-border-subtle text-xs"
                onClick={handleDownload}
              >
                <Download className="h-3.5 w-3.5" />
                Save JSON
              </Button>
            </Magnet>

            <Magnet maxDelta={6} className="flex-1">
              <Button variant="primary" size="sm" className="w-full text-xs" onClick={onClose}>
                Done
              </Button>
            </Magnet>
          </div>
        </SpotlightCard>
      </div>
    </dialog>
  );
};
