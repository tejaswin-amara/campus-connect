import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { CampusEvent } from '../../../types';
import { EventCard } from './EventCard';

const mockEvent: CampusEvent = {
  id: 101,
  title: 'Cloud Architecture Summit',
  description: 'Enterprise container management and service mesh patterns.',
  category: 'Technical',
  venue: 'Main Auditorium',
  dateTime: '2026-10-15T10:00:00',
  maxCapacity: 100,
  registeredCount: 45, // 45% -> < 70% Cyan
};

describe('EventCard', () => {
  it('renders event details with category badge and date', () => {
    const handleSelect = vi.fn();
    render(<EventCard event={mockEvent} onSelect={handleSelect} />);

    expect(screen.getByText('Cloud Architecture Summit')).toBeInTheDocument();
    expect(screen.getByText('Technical')).toBeInTheDocument();
    expect(screen.getByText('Main Auditorium')).toBeInTheDocument();
  });

  it('correctly applies < 70% Electric Cyan capacity tier', () => {
    const handleSelect = vi.fn();
    const { container } = render(<EventCard event={mockEvent} onSelect={handleSelect} />);

    const progressBar = container.querySelector('.bg-brand-primary');
    expect(progressBar).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('correctly applies 70% - 90% Amber warning tier', () => {
    const amberEvent: CampusEvent = {
      ...mockEvent,
      registeredCount: 80, // 80% -> Amber
    };
    const { container } = render(<EventCard event={amberEvent} onSelect={vi.fn()} />);

    const progressBar = container.querySelector('.bg-status-warning');
    expect(progressBar).toBeInTheDocument();
    expect(screen.getByText('Filling Fast')).toBeInTheDocument();
  });

  it('correctly applies > 90% Coral danger tier and waitlist label when full', () => {
    const dangerEvent: CampusEvent = {
      ...mockEvent,
      registeredCount: 100, // 100% -> Coral Full
    };
    const { container } = render(<EventCard event={dangerEvent} onSelect={vi.fn()} />);

    const progressBar = container.querySelector('.bg-status-danger');
    expect(progressBar).toBeInTheDocument();
    expect(screen.getByText('Full')).toBeInTheDocument();
  });

  it('calls onSelect on click and keyboard press', () => {
    const handleSelect = vi.fn();
    render(<EventCard event={mockEvent} onSelect={handleSelect} />);

    const card = screen.getByRole('button', {
      name: /View details for Cloud Architecture Summit/i,
    });
    fireEvent.click(card);
    expect(handleSelect).toHaveBeenCalledWith(mockEvent);

    fireEvent.keyDown(card, { key: 'Enter' });
    expect(handleSelect).toHaveBeenCalledTimes(2);
  });
});
