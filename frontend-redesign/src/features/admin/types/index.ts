import { z } from 'zod';

export const createEventSchema = z
  .object({
    title: z
      .string()
      .min(5, 'Title must be between 5 and 100 characters')
      .max(100, 'Title must be between 5 and 100 characters'),
    category: z.enum(['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar']),
    venue: z.string().min(2, 'Venue must be at least 2 characters').max(255, 'Venue too long'),
    dateTime: z.string().min(1, 'Start date and time is required'),
    endDateTime: z.string().optional(),
    maxCapacity: z.preprocess(
      (val) =>
        val === '' || Number.isNaN(val) || val === null || val === undefined
          ? undefined
          : Number(val),
      z
        .number({ invalid_type_error: 'Must be a valid number' })
        .positive('Capacity must be greater than 0')
        .optional(),
    ),
    registrationLink: z
      .string()
      .regex(/^https?:\/\/.+/i, 'Registration URL must begin with http:// or https://')
      .optional()
      .or(z.literal('')),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters')
      .max(2000, 'Description cannot exceed 2000 characters'),
    imageUrl: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.endDateTime || !data.dateTime) return true;
      const start = new Date(data.dateTime).getTime();
      const end = new Date(data.endDateTime).getTime();
      return end > start;
    },
    {
      message: 'End date must be scheduled after start date',
      path: ['endDateTime'],
    },
  );

export type CreateEventFormData = z.infer<typeof createEventSchema>;
