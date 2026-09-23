export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  events: {
    all: ['events'] as const,
    list: (filters?: Record<string, unknown>) => ['events', 'list', filters] as const,
    detail: (id: number) => ['events', 'detail', id] as const,
  },
  organizer: {
    club: ['organizer', 'club'] as const,
    events: ['organizer', 'events'] as const,
    attendees: (eventId: number) => ['organizer', 'events', eventId, 'attendees'] as const,
  },
  admin: {
    stats: ['admin', 'stats'] as const,
  },
};
