import { z } from 'zod';

export interface ClubDetail {
  id: number;
  name: string;
  slug: string;
  category: string;
  description?: string;
  logoUrl?: string;
  leadUserId?: number;
  totalEvents: number;
  totalRsvps: number;
  totalCheckedIn: number;
}

export interface OrganizerEvent {
  id: number;
  title: string;
  description: string;
  dateTime: string;
  endDateTime?: string | null;
  venue: string;
  category: string;
  status: string;
  maxCapacity?: number;
  registeredCount: number;
  checkedInCount: number;
  clubId?: number;
  clubName?: string;
  registrationLink?: string;
  imageUrl?: string;
}

export const createClubEventSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(255),
  description: z.string().trim().min(1, 'Description is required').max(2000),
  dateTime: z.string().min(1, 'Start date and time is required'),
  endDateTime: z.string().optional(),
  venue: z.string().trim().min(1, 'Venue is required').max(255),
  category: z.string().trim().min(1, 'Category is required'),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('PUBLISHED'),
  maxCapacity: z.number().int().min(1, 'Capacity must be at least 1').default(50),
  registrationLink: z.string().url('Must be valid URL').optional().or(z.literal('')),
  imageUrl: z.string().optional().or(z.literal('')),
});

export type CreateClubEventInput = z.infer<typeof createClubEventSchema>;

export interface Attendee {
  registrationId: number;
  userId: number;
  username: string;
  email: string;
  rollNumber?: string;
  department?: string;
  checkedIn: boolean;
  checkInTime?: string | null;
  ticketCode?: string;
  registrationDate: string;
  status: string;
}

export interface CheckInResult {
  success: boolean;
  message: string;
  attendeeName?: string;
  rollNumber?: string;
  ticketCode?: string;
  checkInTime?: string;
}
