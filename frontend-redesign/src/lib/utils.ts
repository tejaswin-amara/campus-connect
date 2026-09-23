import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    };
    return date.toLocaleDateString('en-US', options);
  } catch {
    return dateString;
  }
}

export function formatDateShort(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatTimeOnly(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export interface CapacityTier {
  percent: number;
  barColor: string;
  glowClass: string;
  badgeVariant: 'success' | 'warning' | 'danger';
  tier: 'normal' | 'warning' | 'danger';
  label: string;
}

/**
 * 3-Tier Capacity Discipline:
 * < 70%: Electric Cyan (#00f0ff)
 * 70% - 90%: Warning Amber (#f59e0b)
 * > 90% or Full: Danger Coral (#f43f5e) with subtle border glow
 */
export function getCapacityTier(registered: number, maxCapacity?: number): CapacityTier {
  if (!maxCapacity || maxCapacity <= 0) {
    return {
      percent: 0,
      barColor: 'bg-brand-primary',
      glowClass: '',
      badgeVariant: 'success',
      tier: 'normal',
      label: 'Open',
    };
  }

  const percent = Math.min(100, Math.round((registered / maxCapacity) * 100));

  if (percent >= 90) {
    return {
      percent,
      barColor: 'bg-status-danger',
      glowClass: 'ring-1 ring-status-danger/40 shadow-[0_0_12px_rgba(244,63,94,0.35)]',
      badgeVariant: 'danger',
      tier: 'danger',
      label: percent >= 100 ? 'Full' : 'Almost Full',
    };
  }

  if (percent >= 70) {
    return {
      percent,
      barColor: 'bg-status-warning',
      glowClass: '',
      badgeVariant: 'warning',
      tier: 'warning',
      label: 'Filling Fast',
    };
  }

  return {
    percent,
    barColor: 'bg-brand-primary',
    glowClass: '',
    badgeVariant: 'success',
    tier: 'normal',
    label: 'Open',
  };
}

export function generateICSContent(event: {
  title: string;
  description: string;
  venue: string;
  dateTime: string;
  endDateTime?: string;
}): string {
  const startDate = new Date(event.dateTime);
  const validStart = !Number.isNaN(startDate.getTime()) ? startDate : new Date();
  const endDate = event.endDateTime
    ? new Date(event.endDateTime)
    : new Date(validStart.getTime() + 2 * 60 * 60 * 1000);
  const validEnd = !Number.isNaN(endDate.getTime())
    ? endDate
    : new Date(validStart.getTime() + 2 * 60 * 60 * 1000);

  const formatICSDate = (d: Date) => `${d.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;

  const escapeICS = (str?: string): string => {
    return (str || '')
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\r\n|\r|\n/g, '\\n');
  };

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CampusConnect//Event Management//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `SUMMARY:${escapeICS(event.title)}`,
    `DESCRIPTION:${escapeICS(event.description)}`,
    `LOCATION:${escapeICS(event.venue)}`,
    `DTSTART:${formatICSDate(validStart)}`,
    `DTEND:${formatICSDate(validEnd)}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadICS(event: {
  title: string;
  description: string;
  venue: string;
  dateTime: string;
  endDateTime?: string;
}): void {
  const icsData = generateICSContent(event);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileName = (event.title || 'event').toLowerCase().replace(/[^a-z0-9]/g, '_');
  link.setAttribute('download', `${fileName || 'event'}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
