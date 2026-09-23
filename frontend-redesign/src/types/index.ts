export type EventCategory = 'Technical' | 'Cultural' | 'Sports' | 'Workshop' | 'Seminar';

export type EventStatus = 'Upcoming' | 'Ongoing' | 'Past';

export interface Coordinator {
  name: string;
  role: string;
  email: string;
}

export interface CampusEvent {
  id: number;
  title: string;
  description: string;
  category: EventCategory | string;
  venue: string;
  dateTime: string;
  endDateTime?: string;
  maxCapacity?: number;
  registeredCount: number;
  clubId?: number;
  clubName?: string;
  status?: string;
  registrationLink?: string;
  responsesLink?: string;
  imageUrl?: string;
  isRecommended?: boolean;
  recommendationReasons?: string[];
  syllabus?: string[];
  eligibility?: string[];
  coordinators?: Coordinator[];
}

export interface KpiMetric {
  id: string;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  change?: string;
  subtitle: string;
  status: 'primary' | 'success' | 'warning' | 'info';
}

export interface CreateEventInput {
  title: string;
  description: string;
  category: EventCategory;
  venue: string;
  dateTime: string;
  endDateTime?: string;
  maxCapacity?: number;
  registrationLink?: string;
  responsesLink?: string;
  imageUrl?: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}
