import { describe, expect, it } from 'vitest';
import { formatDate, generateICSContent, getCapacityTier } from './utils';

describe('utils', () => {
  describe('generateICSContent', () => {
    it('implements strict RFC 5545 escaping for backslashes, semicolons, commas, and newlines', () => {
      const event = {
        title: 'Tech Talk: Microservices, APIs; & Systems\\Scale',
        description: 'First line\nSecond line\r\nThird line; with, symbols and \\ backslash',
        venue: 'Auditorium 1, Floor 2; Building \\A',
        dateTime: '2026-10-01T10:00:00Z',
        endDateTime: '2026-10-01T12:00:00Z',
      };

      const ics = generateICSContent(event);

      // Verify escaping
      expect(ics).toContain('SUMMARY:Tech Talk: Microservices\\, APIs\\; & Systems\\\\Scale');
      expect(ics).toContain(
        'DESCRIPTION:First line\\nSecond line\\nThird line\\; with\\, symbols and \\\\ backslash',
      );
      expect(ics).toContain('LOCATION:Auditorium 1\\, Floor 2\\; Building \\\\A');
      expect(ics).toContain('DTSTART:20261001T100000Z');
      expect(ics).toContain('DTEND:20261001T120000Z');
      expect(ics).toContain('BEGIN:VCALENDAR');
      expect(ics).toContain('END:VCALENDAR');
    });

    it('defaults endDateTime to 2 hours after start when omitted', () => {
      const event = {
        title: 'Keynote',
        description: 'Keynote speech',
        venue: 'Main Hall',
        dateTime: '2026-10-01T14:00:00Z',
      };

      const ics = generateICSContent(event);
      expect(ics).toContain('DTSTART:20261001T140000Z');
      expect(ics).toContain('DTEND:20261001T160000Z');
    });
  });

  describe('getCapacityTier', () => {
    it('returns Open tier for under 70% occupancy', () => {
      const tier = getCapacityTier(30, 100);
      expect(tier.percent).toBe(30);
      expect(tier.tier).toBe('normal');
      expect(tier.badgeVariant).toBe('success');
      expect(tier.label).toBe('Open');
    });

    it('returns Filling Fast warning tier for 70% to 89% occupancy', () => {
      const tier = getCapacityTier(75, 100);
      expect(tier.percent).toBe(75);
      expect(tier.tier).toBe('warning');
      expect(tier.badgeVariant).toBe('warning');
      expect(tier.label).toBe('Filling Fast');
    });

    it('returns Almost Full / Full danger tier for >= 90% occupancy', () => {
      const tier90 = getCapacityTier(95, 100);
      expect(tier90.percent).toBe(95);
      expect(tier90.tier).toBe('danger');
      expect(tier90.label).toBe('Almost Full');

      const tierFull = getCapacityTier(100, 100);
      expect(tierFull.percent).toBe(100);
      expect(tierFull.tier).toBe('danger');
      expect(tierFull.label).toBe('Full');
    });

    it('handles unlimited capacity', () => {
      const tier = getCapacityTier(50, undefined);
      expect(tier.percent).toBe(0);
      expect(tier.label).toBe('Open');
      expect(tier.badgeVariant).toBe('success');
    });
  });

  describe('formatDate', () => {
    it('formats a valid date string cleanly', () => {
      const formatted = formatDate('2026-10-15T14:30:00Z');
      expect(formatted).toBeDefined();
      expect(formatted.length).toBeGreaterThan(0);
    });
  });
});
