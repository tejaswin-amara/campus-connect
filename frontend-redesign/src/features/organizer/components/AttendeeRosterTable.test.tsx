import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../../../lib/apiClient';
import type { Attendee, OrganizerEvent } from '../types';
import { AttendeeRosterTable } from './AttendeeRosterTable';

vi.mock('../../../lib/apiClient', () => ({
  apiClient: {
    getEventAttendees: vi.fn(),
    checkInAttendee: vi.fn(),
    exportRosterCsv: vi.fn().mockReturnValue('mock-csv-data'),
  },
}));

const mockEvents: OrganizerEvent[] = [
  {
    id: 101,
    title: 'ACM CodeSprint 2026',
    description: 'Hackathon event',
    dateTime: '2026-10-15T10:00:00',
    venue: 'Lab 3',
    category: 'Technical',
    status: 'PUBLISHED',
    maxCapacity: 100,
    registeredCount: 2,
    checkedInCount: 1,
    clubId: 1,
    clubName: 'ACM Student Chapter',
  },
];

const mockAttendees: Attendee[] = [
  {
    registrationId: 1,
    userId: 10,
    username: 'Alice Smith',
    email: 'alice@campus.edu',
    rollNumber: '2100030101',
    department: 'CSE',
    checkedIn: true,
    checkInTime: '2026-09-23T10:00:00Z',
    ticketCode: 'TKT-101-001',
    registrationDate: '2026-09-22T10:00:00Z',
    status: 'CONFIRMED',
  },
  {
    registrationId: 2,
    userId: 11,
    username: 'Bob Jones',
    email: 'bob@campus.edu',
    rollNumber: '2100030102',
    department: 'ECE',
    checkedIn: false,
    checkInTime: null,
    ticketCode: 'TKT-101-002',
    registrationDate: '2026-09-22T11:00:00Z',
    status: 'CONFIRMED',
  },
];

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe('AttendeeRosterTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.getEventAttendees).mockResolvedValue(mockAttendees);
  });

  it('renders attendee roster with attendee details', async () => {
    renderWithProviders(<AttendeeRosterTable events={mockEvents} selectedEventId={101} />);

    expect(await screen.findByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    expect(screen.getByText('2100030101')).toBeInTheDocument();
    expect(screen.getByText('TKT-101-001')).toBeInTheDocument();
  });

  it('filters attendees based on search term', async () => {
    renderWithProviders(<AttendeeRosterTable events={mockEvents} selectedEventId={101} />);

    expect(await screen.findByText('Alice Smith')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/search by student name/i);
    fireEvent.change(searchInput, { target: { value: 'Bob' } });

    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
  });

  it('triggers safe CSV export when Export CSV is clicked', async () => {
    renderWithProviders(<AttendeeRosterTable events={mockEvents} selectedEventId={101} />);

    expect(await screen.findByText('Alice Smith')).toBeInTheDocument();

    const exportBtn = screen.getByRole('button', { name: /export csv/i });
    fireEvent.click(exportBtn);

    expect(apiClient.exportRosterCsv).toHaveBeenCalledWith(mockAttendees);
  });
});
