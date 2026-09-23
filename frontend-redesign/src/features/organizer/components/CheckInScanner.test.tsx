import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../../../lib/apiClient';
import type { OrganizerEvent } from '../types';
import { CheckInScanner } from './CheckInScanner';

vi.mock('../../../lib/apiClient', () => ({
  apiClient: {
    checkInAttendee: vi.fn(),
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
    registeredCount: 45,
    checkedInCount: 15,
    clubId: 1,
    clubName: 'ACM Student Chapter',
  },
];

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe('CheckInScanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders scanner interface with event information', () => {
    renderWithProviders(<CheckInScanner events={mockEvents} selectedEventId={101} />);

    expect(screen.getByText('Live Check-in Engine')).toBeInTheDocument();
    expect(screen.getByText('OPTICAL SCANNER READY')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ticket code/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /roll number/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /verify & check in/i })).toBeInTheDocument();
  });

  it('switches between ticket code and roll number modes', () => {
    renderWithProviders(<CheckInScanner events={mockEvents} selectedEventId={101} />);

    expect(screen.getByLabelText('Ticket Code')).toBeInTheDocument();

    const rollModeBtn = screen.getByRole('button', { name: /roll number/i });
    fireEvent.click(rollModeBtn);

    expect(screen.getByLabelText('Student Roll Number')).toBeInTheDocument();
  });

  it('handles successful check-in and displays green confirmation banner', async () => {
    vi.mocked(apiClient.checkInAttendee).mockResolvedValueOnce({
      success: true,
      message: 'Attendee checked in successfully',
      attendeeName: 'Alex Student',
      rollNumber: '2100030110',
      ticketCode: 'TKT-101-ABCD',
      checkInTime: '2026-09-23T10:30:00Z',
    });

    renderWithProviders(<CheckInScanner events={mockEvents} selectedEventId={101} />);

    const ticketInput = screen.getByLabelText('Ticket Code');
    fireEvent.change(ticketInput, { target: { value: 'TKT-101-ABCD' } });

    const form = ticketInput.closest('form');
    expect(form).not.toBeNull();
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(apiClient.checkInAttendee).toHaveBeenCalledWith(101, {
        ticketCode: 'TKT-101-ABCD',
        rollNumber: undefined,
      });
    });

    await waitFor(() => {
      expect(screen.getByText('ACCESS GRANTED')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 4, name: 'Alex Student' })).toBeInTheDocument();
      expect(screen.getAllByText('TKT-101-ABCD').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('displays error message on check-in failure', async () => {
    vi.mocked(apiClient.checkInAttendee).mockRejectedValueOnce(
      new Error('Attendee already checked in'),
    );

    renderWithProviders(<CheckInScanner events={mockEvents} selectedEventId={101} />);

    const ticketInput = screen.getByLabelText('Ticket Code');
    fireEvent.change(ticketInput, { target: { value: 'TKT-DUP' } });

    const verifyBtn = screen.getByRole('button', { name: /verify & check in/i });
    fireEvent.click(verifyBtn);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Attendee already checked in');
    });
  });
});
