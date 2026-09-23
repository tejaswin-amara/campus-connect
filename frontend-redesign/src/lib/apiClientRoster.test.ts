import { describe, expect, it } from 'vitest';
import type { Attendee } from '../features/organizer/types';
import { apiClient, sanitizeCsvCell } from './apiClient';

describe('apiClient Roster CSV Export & CWE-1236 Sanitization', () => {
  it('sanitizes formula injection triggers in attendee rosters (=, +, -, @, \\t, \\r)', () => {
    const maliciousAttendees: Attendee[] = [
      {
        registrationId: 1,
        userId: 101,
        username: "=cmd|' /C calc'!A0",
        email: 'malicious@campus.edu',
        rollNumber: '+210003001',
        department: '@SYSTEM',
        checkedIn: true,
        checkInTime: '2026-09-23T10:00:00Z',
        ticketCode: '\tTKT-MALICIOUS',
        registrationDate: '2026-09-22T08:00:00Z',
        status: 'CONFIRMED',
      },
      {
        registrationId: 2,
        userId: 102,
        username: '-SUM(1,1)',
        email: 'attacker@campus.edu',
        rollNumber: '\rEVIL_ROLL',
        department: 'Computer Science',
        checkedIn: false,
        checkInTime: null,
        ticketCode: '@EXPLOIT',
        registrationDate: '2026-09-22T09:00:00Z',
        status: 'CONFIRMED',
      },
    ];

    const csv = apiClient.exportRosterCsv(maliciousAttendees);
    const lines = csv.split('\n');

    expect(lines[0]).toBe(
      'Registration ID,Attendee Name,Roll Number,Department,Email,Ticket Code,Status,Checked In,Check-In Time,Registration Date',
    );

    // Verify row 1 prefix escaping
    expect(lines[1]).toContain("\"'=cmd|' /C calc'!A0\"");
    expect(lines[1]).toContain('"\'+210003001"');
    expect(lines[1]).toContain('"\'@SYSTEM"');
    expect(lines[1]).toContain('"\'\tTKT-MALICIOUS"');
    expect(lines[1]).toContain('"YES"');

    // Verify row 2 prefix escaping
    expect(lines[2]).toContain('"\'-SUM(1,1)"');
    expect(lines[2]).toContain('"\'\rEVIL_ROLL"');
    expect(lines[2]).toContain('"\'@EXPLOIT"');
    expect(lines[2]).toContain('"NO"');
  });

  it('handles null or undefined fields safely', () => {
    expect(sanitizeCsvCell(null)).toBe('""');
    expect(sanitizeCsvCell(undefined)).toBe('""');
  });

  it('escapes internal quotes correctly in CSV cells', () => {
    const sanitized = sanitizeCsvCell('Name with "Double Quotes" inside');
    expect(sanitized).toBe('"Name with ""Double Quotes"" inside"');
  });
});
