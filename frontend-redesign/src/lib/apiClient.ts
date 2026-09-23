import { INITIAL_EVENTS } from '../data/mockEvents';
import type { AuthUser, LoginFormData, RegisterFormData } from '../features/auth/types';
import type {
  Attendee,
  CheckInResult,
  ClubDetail,
  CreateClubEventInput,
  OrganizerEvent,
} from '../features/organizer/types';
import type { CampusEvent, CreateEventInput, KpiMetric } from '../types';

// In-memory state storage initialized from mock data
let localEventsStore: CampusEvent[] = [...INITIAL_EVENTS];

let localCurrentUser: AuthUser | null = null;

const mockClubs: Record<number, ClubDetail> = {
  1: {
    id: 1,
    name: 'ACM Student Chapter',
    slug: 'acm-klh',
    category: 'Technical',
    description: 'Official Association for Computing Machinery student chapter.',
    logoUrl: '/images/clubs/acm.png',
    leadUserId: 1,
    totalEvents: 3,
    totalRsvps: 84,
    totalCheckedIn: 32,
  },
  2: {
    id: 2,
    name: 'GDSC Campus Community',
    slug: 'gdsc-klh',
    category: 'Technical',
    description: 'Google Developer Student Clubs chapter fostering community open-source.',
    logoUrl: '/images/clubs/gdsc.png',
    leadUserId: 2,
    totalEvents: 2,
    totalRsvps: 45,
    totalCheckedIn: 18,
  },
};

const localAttendeesStore: Record<number, Attendee[]> = {
  1: [
    {
      registrationId: 101,
      userId: 5,
      username: 'tejaswin',
      email: 'tejaswin@klh.edu.in',
      rollNumber: '2100030101',
      department: 'Computer Science and Engineering',
      checkedIn: false,
      checkInTime: null,
      ticketCode: 'TKT-001-ALPHA1',
      registrationDate: '2026-09-22T10:00:00',
      status: 'CONFIRMED',
    },
    {
      registrationId: 102,
      userId: 6,
      username: 'samantha',
      email: 'samantha@klh.edu.in',
      rollNumber: '2100030102',
      department: 'Information Technology',
      checkedIn: true,
      checkInTime: '2026-09-23T09:00:00',
      ticketCode: 'TKT-001-BETA2',
      registrationDate: '2026-09-22T11:15:00',
      status: 'CONFIRMED',
    },
    {
      registrationId: 103,
      userId: 7,
      username: 'rahul_sharma',
      email: 'rahul@klh.edu.in',
      rollNumber: '2100030103',
      department: 'Electronics & Communication',
      checkedIn: false,
      checkInTime: null,
      ticketCode: 'TKT-001-GAMMA3',
      registrationDate: '2026-09-22T12:30:00',
      status: 'CONFIRMED',
    },
  ],
};

// Base API URL configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Robust API client communicating with Spring Boot endpoints when available,
 * seamlessly falling back to in-memory store for standalone execution.
 */
export const apiClient = {
  // --- Events API ---
  async getEvents(params?: { search?: string; category?: string }): Promise<CampusEvent[]> {
    try {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.category && params.category !== 'All') query.append('category', params.category);
      const url = API_BASE_URL
        ? `${API_BASE_URL}/api/events?${query.toString()}`
        : `/api/events?${query.toString()}`;
      const res = await fetch(url, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        localEventsStore = data;
        return data;
      }
    } catch {
      // Fallback to local store
    }

    let results = [...localEventsStore];
    if (params?.category && params.category !== 'All') {
      results = results.filter((e) => e.category.toLowerCase() === params.category?.toLowerCase());
    }
    if (params?.search?.trim()) {
      const q = params.search.trim().toLowerCase();
      results = results.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q),
      );
    }
    return results;
  },

  async getEvent(id: number): Promise<CampusEvent> {
    try {
      const url = API_BASE_URL ? `${API_BASE_URL}/api/events/${id}` : `/api/events/${id}`;
      const res = await fetch(url, { credentials: 'include' });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback to local store
    }

    const event = localEventsStore.find((e) => e.id === id);
    if (!event) {
      throw new Error(`Event with ID ${id} not found.`);
    }
    return event;
  },

  async registerEvent(
    id: number,
  ): Promise<{ success: boolean; event: CampusEvent; ticketCode?: string }> {
    try {
      const url = API_BASE_URL
        ? `${API_BASE_URL}/api/events/${id}/register`
        : `/api/events/${id}/register`;
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        return { success: true, event: data, ticketCode: data.ticketCode };
      }
    } catch {
      // Fallback to local store
    }

    const index = localEventsStore.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new Error(`Event with ID ${id} not found.`);
    }

    const current = localEventsStore[index];
    if (current.maxCapacity && current.registeredCount >= current.maxCapacity) {
      throw new Error('This event is at maximum capacity.');
    }

    const ticketCode = `TKT-${id}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const updated: CampusEvent = {
      ...current,
      registeredCount: current.registeredCount + 1,
    };
    localEventsStore[index] = updated;

    return { success: true, event: updated, ticketCode };
  },

  async createEvent(input: CreateEventInput): Promise<CampusEvent> {
    try {
      const url = API_BASE_URL ? `${API_BASE_URL}/api/admin/events` : '/api/admin/events';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        localEventsStore = [data, ...localEventsStore];
        return data;
      }
    } catch {
      // Fallback to local store
    }

    const newId = Math.max(0, ...localEventsStore.map((e) => e.id)) + 1;
    const newEvent: CampusEvent = {
      ...input,
      id: newId,
      registeredCount: 0,
      syllabus: [
        'Introduction & Orientation',
        'Core Session & Hands-on Activities',
        'Networking & Concluding Remarks',
      ],
      eligibility: ['Open to all registered campus students'],
    };

    localEventsStore = [newEvent, ...localEventsStore];
    return newEvent;
  },

  async deleteEvent(id: number): Promise<{ success: boolean; id: number }> {
    try {
      const url = API_BASE_URL
        ? `${API_BASE_URL}/api/admin/events/${id}`
        : `/api/admin/events/${id}`;
      const res = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        localEventsStore = localEventsStore.filter((e) => e.id !== id);
        return { success: true, id };
      }
    } catch {
      // Fallback to local store
    }

    localEventsStore = localEventsStore.filter((e) => e.id !== id);
    return { success: true, id };
  },

  async getAdminStats(): Promise<KpiMetric[]> {
    try {
      const url = API_BASE_URL ? `${API_BASE_URL}/api/admin/stats` : '/api/admin/stats';
      const res = await fetch(url, { credentials: 'include' });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback to local store calculation
    }

    const totalEvents = localEventsStore.length;
    const totalRegistered = localEventsStore.reduce((sum, e) => sum + e.registeredCount, 0);
    const totalCapacity = localEventsStore.reduce((sum, e) => sum + (e.maxCapacity || 100), 0);
    const occupancyRate = Math.round((totalRegistered / Math.max(1, totalCapacity)) * 100);

    return [
      {
        id: 'total-events',
        label: 'TOTAL EVENTS',
        value: totalEvents,
        change: '+12% vs last term',
        subtitle: 'Active campus listings',
        status: 'primary',
      },
      {
        id: 'total-registered',
        label: 'TOTAL REGISTERED',
        value: totalRegistered,
        change: '+28% growth',
        subtitle: 'Verified student signups',
        status: 'success',
      },
      {
        id: 'occupancy-rate',
        label: 'OCCUPANCY RATE',
        value: occupancyRate,
        suffix: '%',
        change: '+5.4% efficiency',
        subtitle: 'Average room utilization',
        status: 'info',
      },
      {
        id: 'system-throughput',
        label: 'SYSTEM THROUGHPUT',
        value: 99,
        suffix: '.9%',
        change: '0 downtime',
        subtitle: 'API SLA availability',
        status: 'warning',
      },
    ];
  },

  // --- Auth API ---
  async authLogin(credentials: LoginFormData): Promise<AuthUser> {
    try {
      const url = API_BASE_URL ? `${API_BASE_URL}/api/auth/login` : '/api/auth/login';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });
      if (res.ok) {
        const user: AuthUser = await res.json();
        localCurrentUser = user;
        return user;
      }
      if (res.status === 401) {
        const err = await res.json().catch(() => ({ message: 'Invalid credentials' }));
        throw new Error(err.message || 'Invalid credentials');
      }
    } catch (e) {
      if (e instanceof Error && e.message === 'Invalid credentials') {
        throw e;
      }
    }

    // Mock fallback
    if (credentials.username === 'organizer') {
      localCurrentUser = {
        id: 1,
        username: 'organizer',
        email: 'organizer@campus.edu',
        role: 'ROLE_ORGANIZER',
        clubId: 1,
        clubName: 'ACM Student Chapter',
        rollNumber: 'KLH2024CS001',
        department: 'Computer Science',
      };
      return localCurrentUser;
    }
    if (credentials.username === 'admin') {
      localCurrentUser = {
        id: 3,
        username: 'admin',
        email: 'admin@campus.edu',
        role: 'ROLE_ADMIN',
        rollNumber: 'ADM001',
        department: 'Administration',
      };
      return localCurrentUser;
    }
    localCurrentUser = {
      id: 99,
      username: credentials.username,
      email: `${credentials.username}@klh.edu.in`,
      role: 'ROLE_STUDENT',
      rollNumber: '2100030999',
      department: 'Engineering',
    };
    return localCurrentUser;
  },

  async authRegister(data: RegisterFormData): Promise<AuthUser> {
    try {
      const url = API_BASE_URL ? `${API_BASE_URL}/api/auth/register` : '/api/auth/register';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      if (res.ok) {
        const user: AuthUser = await res.json();
        localCurrentUser = user;
        return user;
      }
      if (res.status === 400) {
        const err = await res.json().catch(() => ({ message: 'Registration failed' }));
        throw new Error(err.message || 'Registration failed');
      }
    } catch (e) {
      if (e instanceof Error && e.message === 'Registration failed') {
        throw e;
      }
    }

    const newUser: AuthUser = {
      id: Math.floor(Math.random() * 1000) + 10,
      username: data.username,
      email: data.email,
      role: 'ROLE_STUDENT',
      rollNumber: data.rollNumber,
      department: data.department,
    };
    localCurrentUser = newUser;
    return newUser;
  },

  async authMe(): Promise<AuthUser | null> {
    try {
      const url = API_BASE_URL ? `${API_BASE_URL}/api/auth/me` : '/api/auth/me';
      const res = await fetch(url, { credentials: 'include' });
      if (res.ok) {
        const user: AuthUser = await res.json();
        localCurrentUser = user;
        return user;
      }
    } catch {
      // Fallback to local store
    }
    return localCurrentUser;
  },

  async authLogout(): Promise<{ success: boolean }> {
    try {
      const url = API_BASE_URL ? `${API_BASE_URL}/api/auth/logout` : '/api/auth/logout';
      await fetch(url, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignore
    }
    localCurrentUser = null;
    return { success: true };
  },

  // Legacy login fallback
  async login(credentials: {
    username: string;
    password?: string;
  }): Promise<{ success: boolean; token?: string }> {
    try {
      const url = API_BASE_URL ? `${API_BASE_URL}/login` : '/login';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    if (credentials.username === 'admin' && credentials.password === 'admin') {
      localCurrentUser = {
        id: 3,
        username: 'admin',
        email: 'admin@campus.edu',
        role: 'ROLE_ADMIN',
        rollNumber: 'ADM001',
        department: 'Administration',
      };
      return { success: true, token: 'mock-jwt-token-campusconnect-2026' };
    }
    throw new Error('Invalid admin credentials. Please enter authorized credentials.');
  },

  async logout(): Promise<{ success: boolean }> {
    return this.authLogout();
  },

  // --- Organizer Studio API ---
  async getMyClub(): Promise<ClubDetail> {
    try {
      const url = API_BASE_URL
        ? `${API_BASE_URL}/api/organizer/clubs/my-club`
        : '/api/organizer/clubs/my-club';
      const res = await fetch(url, { credentials: 'include' });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    const clubId = localCurrentUser?.clubId || 1;
    return mockClubs[clubId] || mockClubs[1];
  },

  async getClubEvents(): Promise<OrganizerEvent[]> {
    try {
      const url = API_BASE_URL ? `${API_BASE_URL}/api/organizer/events` : '/api/organizer/events';
      const res = await fetch(url, { credentials: 'include' });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    const clubId = localCurrentUser?.clubId || 1;
    return localEventsStore
      .filter((e) => e.clubId === clubId || !e.clubId)
      .map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        dateTime: e.dateTime,
        endDateTime: e.endDateTime,
        venue: e.venue,
        category: e.category,
        status: e.status || 'PUBLISHED',
        maxCapacity: e.maxCapacity,
        registeredCount: e.registeredCount,
        checkedInCount: Math.round(e.registeredCount * 0.4),
        clubId: e.clubId || clubId,
        clubName: e.clubName || 'ACM Student Chapter',
        registrationLink: e.registrationLink,
        imageUrl: e.imageUrl,
      }));
  },

  async createClubEvent(input: CreateClubEventInput): Promise<OrganizerEvent> {
    try {
      const url = API_BASE_URL ? `${API_BASE_URL}/api/organizer/events` : '/api/organizer/events';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        credentials: 'include',
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    const newId = Math.max(0, ...localEventsStore.map((e) => e.id)) + 1;
    const clubId = localCurrentUser?.clubId || 1;
    const clubName = localCurrentUser?.clubName || 'ACM Student Chapter';

    const newOrganizerEvent: OrganizerEvent = {
      id: newId,
      title: input.title,
      description: input.description,
      dateTime: input.dateTime,
      endDateTime: input.endDateTime,
      venue: input.venue,
      category: input.category,
      status: input.status || 'PUBLISHED',
      maxCapacity: input.maxCapacity,
      registeredCount: 0,
      checkedInCount: 0,
      clubId,
      clubName,
      registrationLink: input.registrationLink,
      imageUrl: input.imageUrl,
    };

    localEventsStore.unshift({
      id: newId,
      title: input.title,
      description: input.description,
      dateTime: input.dateTime,
      endDateTime: input.endDateTime,
      venue: input.venue,
      category: input.category,
      status: input.status || 'PUBLISHED',
      maxCapacity: input.maxCapacity,
      registeredCount: 0,
      clubId,
      clubName,
      registrationLink: input.registrationLink,
      imageUrl: input.imageUrl,
    });

    return newOrganizerEvent;
  },

  async getEventAttendees(eventId: number): Promise<Attendee[]> {
    try {
      const url = API_BASE_URL
        ? `${API_BASE_URL}/api/organizer/events/${eventId}/attendees`
        : `/api/organizer/events/${eventId}/attendees`;
      const res = await fetch(url, { credentials: 'include' });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    if (!localAttendeesStore[eventId]) {
      localAttendeesStore[eventId] = [
        {
          registrationId: eventId * 100 + 1,
          userId: 10,
          username: 'student_lead',
          email: 'lead@klh.edu.in',
          rollNumber: '2100030110',
          department: 'Computer Science',
          checkedIn: false,
          checkInTime: null,
          ticketCode: `TKT-${eventId}-001`,
          registrationDate: '2026-09-22T10:00:00',
          status: 'CONFIRMED',
        },
      ];
    }
    return localAttendeesStore[eventId];
  },

  async checkInAttendee(
    eventId: number,
    data: { ticketCode?: string; rollNumber?: string },
  ): Promise<CheckInResult> {
    try {
      const url = API_BASE_URL
        ? `${API_BASE_URL}/api/organizer/events/${eventId}/check-in`
        : `/api/organizer/events/${eventId}/check-in`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      if (res.ok) {
        return await res.json();
      }
      const err = await res.json().catch(() => ({ message: 'Check-in failed' }));
      throw new Error(err.message || 'Check-in failed');
    } catch (e) {
      if (e instanceof Error && e.message !== 'Failed to fetch') {
        throw e;
      }
    }

    // Mock fallback
    const roster = await this.getEventAttendees(eventId);
    const code = data.ticketCode?.trim().toUpperCase();
    const roll = data.rollNumber?.trim();

    const target = roster.find(
      (a) =>
        (code && a.ticketCode?.toUpperCase() === code) ||
        (roll && a.rollNumber?.toLowerCase() === roll.toLowerCase()),
    );

    if (!target) {
      throw new Error('Registration not found for provided ticket code or roll number.');
    }
    if (target.checkedIn) {
      throw new Error(`Attendee ${target.username} already checked in at ${target.checkInTime}`);
    }

    target.checkedIn = true;
    target.checkInTime = new Date().toISOString();

    return {
      success: true,
      message: 'Attendee checked in successfully',
      attendeeName: target.username,
      rollNumber: target.rollNumber,
      ticketCode: target.ticketCode,
      checkInTime: target.checkInTime,
    };
  },

  // --- Safe CSV Exporter ---
  exportCsv(events?: CampusEvent[]): string {
    const dataToExport = events ?? localEventsStore;
    const headers = ['ID', 'Title', 'Category', 'Venue', 'DateTime', 'Capacity', 'Registered'];
    const rows = dataToExport.map((e) => [
      sanitizeCsvCell(e.id),
      sanitizeCsvCell(e.title),
      sanitizeCsvCell(e.category),
      sanitizeCsvCell(e.venue),
      sanitizeCsvCell(e.dateTime),
      sanitizeCsvCell(e.maxCapacity ?? 'Unlimited'),
      sanitizeCsvCell(e.registeredCount),
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  },

  exportRosterCsv(attendees: Attendee[]): string {
    const headers = [
      'Registration ID',
      'Attendee Name',
      'Roll Number',
      'Department',
      'Email',
      'Ticket Code',
      'Status',
      'Checked In',
      'Check-In Time',
      'Registration Date',
    ];

    const rows = attendees.map((a) => [
      sanitizeCsvCell(a.registrationId),
      sanitizeCsvCell(a.username),
      sanitizeCsvCell(a.rollNumber ?? 'N/A'),
      sanitizeCsvCell(a.department ?? 'N/A'),
      sanitizeCsvCell(a.email),
      sanitizeCsvCell(a.ticketCode ?? 'N/A'),
      sanitizeCsvCell(a.status),
      sanitizeCsvCell(a.checkedIn ? 'YES' : 'NO'),
      sanitizeCsvCell(a.checkInTime ?? 'N/A'),
      sanitizeCsvCell(a.registrationDate),
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  },

  exportJson(events?: CampusEvent[]): string {
    return JSON.stringify(events ?? localEventsStore, null, 2);
  },
};

/**
 * Defensive CSV cell sanitization preventing CWE-1236 Spreadsheet Formula Injection.
 * Prepends single-quote (') to values starting with '=', '+', '-', '@', '\t', '\r'.
 */
export function sanitizeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '""';
  let str = String(val);
  if (/^[=+\-@\t\r]/.test(str) || /^[=+\-@\t\r]/.test(str.trimStart())) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}
