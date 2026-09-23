import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { createEventSchema } from '../types';
import { CreateEventModal } from './CreateEventModal';

describe('CreateEventSchema Validation', () => {
  it('validates a correct event schema payload', () => {
    const validData = {
      title: 'Distributed Systems Workshop',
      category: 'Workshop' as const,
      venue: 'Engineering Hall 2',
      dateTime: '2026-11-01T10:00:00',
      endDateTime: '2026-11-01T14:00:00',
      maxCapacity: 50,
      description: 'Hands-on exploration of consensus algorithms and raft protocols.',
      registrationLink: 'https://campus.edu/register',
    };

    const result = createEventSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('enforces title length between 5 and 100 characters strictly', () => {
    const base = {
      category: 'Technical' as const,
      venue: 'Turing Hall',
      dateTime: '2026-11-01T10:00:00',
      description: 'Hands-on coding session for agents.',
    };

    // Below 5 chars
    expect(createEventSchema.safeParse({ ...base, title: 'Hack' }).success).toBe(false);

    // Exactly 5 chars
    expect(createEventSchema.safeParse({ ...base, title: '12345' }).success).toBe(true);

    // Exactly 100 chars
    expect(createEventSchema.safeParse({ ...base, title: 'a'.repeat(100) }).success).toBe(true);

    // Over 100 chars
    expect(createEventSchema.safeParse({ ...base, title: 'a'.repeat(101) }).success).toBe(false);
  });

  it('rejects capacity of zero or negative numbers', () => {
    const base = {
      title: 'Valid Title Here',
      category: 'Technical' as const,
      venue: 'Turing Hall',
      dateTime: '2026-11-01T10:00:00',
      description: 'Hands-on coding session for agents.',
    };

    expect(createEventSchema.safeParse({ ...base, maxCapacity: 0 }).success).toBe(false);
    expect(createEventSchema.safeParse({ ...base, maxCapacity: -10 }).success).toBe(false);
    expect(createEventSchema.safeParse({ ...base, maxCapacity: 1 }).success).toBe(true);
  });

  it('rejects an event where end date is before start date', () => {
    const invalidDates = {
      title: 'Time Paradox Hackathon',
      category: 'Technical' as const,
      venue: 'Turing Hall',
      dateTime: '2026-11-05T18:00:00',
      endDateTime: '2026-11-05T12:00:00', // End before start
      description: 'Building event that travels backward in time.',
    };

    const result = createEventSchema.safeParse(invalidDates);
    expect(result.success).toBe(false);
    if (!result.success) {
      const endIssue = result.error.issues.find((issue) => issue.path.includes('endDateTime'));
      expect(endIssue).toBeDefined();
      expect(endIssue?.message).toContain('End date must be scheduled after start date');
    }
  });

  it('allows blank or undefined maxCapacity for unlimited capacity', () => {
    const base = {
      title: 'Open Campus Hackathon',
      category: 'Technical' as const,
      venue: 'Turing Hall',
      dateTime: '2026-11-01T10:00:00',
      description: 'Hands-on coding session for agents.',
    };

    const resUndefined = createEventSchema.safeParse({ ...base, maxCapacity: undefined });
    expect(resUndefined.success).toBe(true);
    if (resUndefined.success) {
      expect(resUndefined.data.maxCapacity).toBeUndefined();
    }

    const resEmpty = createEventSchema.safeParse({ ...base, maxCapacity: '' });
    expect(resEmpty.success).toBe(true);
    if (resEmpty.success) {
      expect(resEmpty.data.maxCapacity).toBeUndefined();
    }

    const resNaN = createEventSchema.safeParse({ ...base, maxCapacity: Number.NaN });
    expect(resNaN.success).toBe(true);
    if (resNaN.success) {
      expect(resNaN.data.maxCapacity).toBeUndefined();
    }
  });

  it('validates registrationLink protocols strictly (http/https allowed, javascript rejected)', () => {
    const base = {
      title: 'Security Hardening Workshop',
      category: 'Workshop' as const,
      venue: 'Cyber Lab 101',
      dateTime: '2026-11-01T10:00:00',
      description: 'Defensive web security patterns and CSP.',
    };

    // Valid HTTPS
    expect(
      createEventSchema.safeParse({ ...base, registrationLink: 'https://secure.campus.edu' })
        .success,
    ).toBe(true);

    // Valid HTTP
    expect(
      createEventSchema.safeParse({ ...base, registrationLink: 'http://insecure.campus.edu' })
        .success,
    ).toBe(true);

    // Empty string allowed
    expect(createEventSchema.safeParse({ ...base, registrationLink: '' }).success).toBe(true);

    // Undefined allowed
    expect(createEventSchema.safeParse({ ...base, registrationLink: undefined }).success).toBe(
      true,
    );

    // Dangerous protocols rejected
    expect(
      createEventSchema.safeParse({ ...base, registrationLink: 'javascript:alert(1)' }).success,
    ).toBe(false);
    expect(
      createEventSchema.safeParse({
        ...base,
        registrationLink: 'data:text/html,<script>alert(1)</script>',
      }).success,
    ).toBe(false);
    expect(
      createEventSchema.safeParse({ ...base, registrationLink: 'ftp://files.campus.edu' }).success,
    ).toBe(false);
  });
});

describe('CreateEventModal UI Component', () => {
  it('renders form inputs and interacts with user events', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CreateEventModal open={true} onClose={handleClose} />
      </QueryClientProvider>,
    );

    const titleInput = screen.getByLabelText(/event title \*/i);
    await user.type(titleInput, 'Advanced AI Robotics Showcase');
    expect(titleInput).toHaveValue('Advanced AI Robotics Showcase');

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
