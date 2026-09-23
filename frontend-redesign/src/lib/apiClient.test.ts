import { describe, expect, it } from 'vitest';
import type { CampusEvent } from '../types';
import { apiClient } from './apiClient';

describe('apiClient', () => {
  describe('exportCsv', () => {
    it('sanitizes formula injection triggers (=, +, -, @, \\t, \\r) per CWE-1236', () => {
      const maliciousEvents: CampusEvent[] = [
        {
          id: 1,
          title: "=cmd|' /C calc'!A0",
          description: 'Desc',
          category: 'Technical',
          venue: '+SUM(1,2)',
          dateTime: '@HYPERLINK("http://evil.com")',
          maxCapacity: 100,
          registeredCount: 10,
        },
        {
          id: 2,
          title: '\t-DANGEROUS',
          description: 'Desc',
          category: 'Cultural',
          venue: '\rMALICIOUS',
          dateTime: '-2+5',
          registeredCount: 5,
        },
      ];

      const csv = apiClient.exportCsv(maliciousEvents);
      const lines = csv.split('\n');

      expect(lines[0]).toBe('ID,Title,Category,Venue,DateTime,Capacity,Registered');

      // Line 1 checks
      expect(lines[1]).toContain("\"'=cmd|' /C calc'!A0\"");
      expect(lines[1]).toContain('"\'+SUM(1,2)"');
      expect(lines[1]).toContain('"\'@HYPERLINK(""http://evil.com"")"');

      // Line 2 checks
      expect(lines[2]).toContain('"\'\t-DANGEROUS"');
      expect(lines[2]).toContain('"\'\rMALICIOUS"');
      expect(lines[2]).toContain('"\'-2+5"');
      expect(lines[2]).toContain('"Unlimited"');
    });

    it('escapes internal quotes correctly', () => {
      const quoteEvents: CampusEvent[] = [
        {
          id: 3,
          title: 'Event with "Quotes" inside',
          description: 'Desc',
          category: 'Workshop',
          venue: 'Room "404"',
          dateTime: '2026-10-10',
          registeredCount: 0,
        },
      ];

      const csv = apiClient.exportCsv(quoteEvents);
      expect(csv).toContain('"Event with ""Quotes"" inside"');
      expect(csv).toContain('"Room ""404"""');
    });
  });

  describe('exportJson', () => {
    it('returns a valid JSON string of the roster', () => {
      const jsonStr = apiClient.exportJson();
      const parsed = JSON.parse(jsonStr);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBeGreaterThan(0);
    });
  });

  describe('login', () => {
    it('succeeds with valid admin credentials', async () => {
      const result = await apiClient.login({ username: 'admin', password: 'admin' });
      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
    });

    it('rejects missing or empty password', async () => {
      await expect(apiClient.login({ username: 'admin', password: '' })).rejects.toThrow(
        /Invalid admin credentials/i,
      );
      await expect(apiClient.login({ username: 'admin' })).rejects.toThrow(
        /Invalid admin credentials/i,
      );
    });

    it('rejects incorrect username or password', async () => {
      await expect(apiClient.login({ username: 'student', password: 'admin' })).rejects.toThrow(
        /Invalid admin credentials/i,
      );
      await expect(
        apiClient.login({ username: 'admin', password: 'wrongpassword' }),
      ).rejects.toThrow(/Invalid admin credentials/i);
    });
  });
});
