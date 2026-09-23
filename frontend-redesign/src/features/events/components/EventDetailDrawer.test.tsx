import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CampusEvent } from '../../../types';
import { EventDetailDrawer } from './EventDetailDrawer';

const mockEvent: CampusEvent = {
  id: 42,
  title: 'Autonomous Robotics Symposium',
  description: 'Deep dive into robotics kinematics and path planning algorithms.',
  category: 'Technical',
  venue: 'Robotics Wing 4B',
  dateTime: '2026-11-20T10:00:00Z',
  maxCapacity: 100,
  registeredCount: 40,
  registrationLink: 'https://forms.gle/robotics-2026',
};

describe('EventDetailDrawer', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  });

  const renderWithClient = (ui: React.ReactElement) => {
    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
  };

  it('renders nothing when event is null', () => {
    const { container } = renderWithClient(<EventDetailDrawer event={null} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders drawer details correctly for an active event', () => {
    renderWithClient(<EventDetailDrawer event={mockEvent} onClose={vi.fn()} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Autonomous Robotics Symposium')).toBeInTheDocument();
    expect(screen.getByText('Robotics Wing 4B')).toBeInTheDocument();
    expect(screen.getByText(/40 \/ 100/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /One-Click Register/i })).toBeInTheDocument();
  });

  it('renders External Portal button only when registrationLink is a safe http/https URL', () => {
    // Safe HTTPS URL
    const { rerender } = renderWithClient(
      <EventDetailDrawer event={mockEvent} onClose={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: /External Portal/i })).toBeInTheDocument();

    // Dangerous javascript: link
    const maliciousEvent: CampusEvent = {
      ...mockEvent,
      registrationLink: 'javascript:alert(document.cookie)',
    };
    rerender(
      <QueryClientProvider client={queryClient}>
        <EventDetailDrawer event={maliciousEvent} onClose={vi.fn()} />
      </QueryClientProvider>,
    );
    expect(screen.queryByRole('button', { name: /External Portal/i })).not.toBeInTheDocument();

    // Empty registration link
    const noLinkEvent: CampusEvent = {
      ...mockEvent,
      registrationLink: '',
    };
    rerender(
      <QueryClientProvider client={queryClient}>
        <EventDetailDrawer event={noLinkEvent} onClose={vi.fn()} />
      </QueryClientProvider>,
    );
    expect(screen.queryByRole('button', { name: /External Portal/i })).not.toBeInTheDocument();
  });

  it('preserves focus on register button when event data updates', async () => {
    const { rerender } = renderWithClient(
      <EventDetailDrawer event={mockEvent} onClose={vi.fn()} />,
    );

    // Allow initial mount autofocus (50ms) to settle
    await new Promise((r) => setTimeout(r, 70));

    const registerBtn = screen.getByRole('button', { name: /One-Click Register/i });
    registerBtn.focus();
    expect(document.activeElement).toBe(registerBtn);

    // Simulate optimistic query cache update with updated registeredCount
    const updatedEvent: CampusEvent = {
      ...mockEvent,
      registeredCount: 41,
    };

    rerender(
      <QueryClientProvider client={queryClient}>
        <EventDetailDrawer event={updatedEvent} onClose={vi.fn()} />
      </QueryClientProvider>,
    );

    // Wait past 50ms timeout to confirm focus was NOT stolen by close button
    await new Promise((r) => setTimeout(r, 70));

    expect(document.activeElement).toBe(registerBtn);
  });

  it('restores focus to previous element upon closing', () => {
    // Create a mock trigger button in the DOM
    const triggerBtn = document.createElement('button');
    triggerBtn.textContent = 'Open Drawer';
    document.body.appendChild(triggerBtn);
    triggerBtn.focus();
    expect(document.activeElement).toBe(triggerBtn);

    const { rerender } = renderWithClient(
      <EventDetailDrawer event={mockEvent} onClose={vi.fn()} />,
    );

    // Now close drawer by setting event to null
    rerender(
      <QueryClientProvider client={queryClient}>
        <EventDetailDrawer event={null} onClose={vi.fn()} />
      </QueryClientProvider>,
    );

    expect(document.activeElement).toBe(triggerBtn);
    document.body.removeChild(triggerBtn);
  });
});
