import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Calendar, Loader2, MapPin, Users } from 'lucide-react';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/Button';
import { Dialog } from '../../../components/ui/Dialog';
import { Input } from '../../../components/ui/Input';
import { useCreateClubEvent } from '../api/useCreateClubEvent';
import { type CreateClubEventInput, createClubEventSchema } from '../types';

interface CreateEventModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORIES = [
  'TECHNICAL',
  'WORKSHOP',
  'CULTURAL',
  'SPORTS',
  'HACKATHON',
  'SEMINAR',
  'GAMING',
  'GENERAL',
];

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ open, onClose, onSuccess }) => {
  const createEventMutation = useCreateClubEvent();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateClubEventInput>({
    resolver: zodResolver(createClubEventSchema),
    defaultValues: {
      title: '',
      description: '',
      dateTime: '',
      endDateTime: '',
      venue: '',
      category: 'TECHNICAL',
      status: 'PUBLISHED',
      maxCapacity: 100,
      registrationLink: '',
      imageUrl: '',
    },
  });

  const onSubmit = async (data: CreateClubEventInput) => {
    try {
      await createEventMutation.mutateAsync(data);
      reset();
      onSuccess?.();
      onClose();
    } catch {
      // Error handled by mutation state or alert
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Author New Club Event"
      className="max-w-2xl bg-[#0c0c12] border-zinc-800 text-white"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2" noValidate>
        {createEventMutation.isError && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-xl border border-rose-900/60 bg-rose-950/40 p-3 text-xs text-rose-400"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{createEventMutation.error?.message || 'Failed to create club event.'}</span>
          </div>
        )}

        {/* Title */}
        <div>
          <label
            htmlFor="event-title"
            className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5"
          >
            Event Title *
          </label>
          <Input
            id="event-title"
            placeholder="e.g. ACM Tech Hackathon 2026"
            {...register('title')}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? 'event-title-error' : undefined}
          />
          {errors.title && (
            <p id="event-title-error" className="mt-1 text-xs text-rose-400">
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Category & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="event-category"
              className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5"
            >
              Category *
            </label>
            <select
              id="event-category"
              {...register('category')}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="event-status"
              className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5"
            >
              Publishing State *
            </label>
            <select
              id="event-status"
              {...register('status')}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="PUBLISHED">PUBLISHED (Live to Students)</option>
              <option value="DRAFT">DRAFT (Club Internal Review)</option>
            </select>
          </div>
        </div>

        {/* Venue & Capacity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="event-venue"
              className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5"
            >
              Venue / Location *
            </label>
            <div className="relative">
              <Input
                id="event-venue"
                placeholder="Auditorium / Lab 301"
                {...register('venue')}
                aria-invalid={Boolean(errors.venue)}
                aria-describedby={errors.venue ? 'event-venue-error' : undefined}
              />
              <MapPin className="absolute right-3 top-2.5 h-4 w-4 text-zinc-500 pointer-events-none" />
            </div>
            {errors.venue && (
              <p id="event-venue-error" className="mt-1 text-xs text-rose-400">
                {errors.venue.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="event-capacity"
              className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5"
            >
              Max Capacity *
            </label>
            <div className="relative">
              <Input
                id="event-capacity"
                type="number"
                min="1"
                placeholder="100"
                {...register('maxCapacity', { valueAsNumber: true })}
                aria-invalid={Boolean(errors.maxCapacity)}
                aria-describedby={errors.maxCapacity ? 'event-capacity-error' : undefined}
              />
              <Users className="absolute right-3 top-2.5 h-4 w-4 text-zinc-500 pointer-events-none" />
            </div>
            {errors.maxCapacity && (
              <p id="event-capacity-error" className="mt-1 text-xs text-rose-400">
                {errors.maxCapacity.message}
              </p>
            )}
          </div>
        </div>

        {/* Start & End DateTime */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="event-dateTime"
              className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5"
            >
              Start Date & Time *
            </label>
            <div className="relative">
              <Input
                id="event-dateTime"
                type="datetime-local"
                {...register('dateTime')}
                aria-invalid={Boolean(errors.dateTime)}
                aria-describedby={errors.dateTime ? 'event-dateTime-error' : undefined}
              />
              <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-zinc-500 pointer-events-none" />
            </div>
            {errors.dateTime && (
              <p id="event-dateTime-error" className="mt-1 text-xs text-rose-400">
                {errors.dateTime.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="event-endDateTime"
              className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5"
            >
              End Date & Time (Optional)
            </label>
            <div className="relative">
              <Input id="event-endDateTime" type="datetime-local" {...register('endDateTime')} />
              <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-zinc-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="event-description"
            className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5"
          >
            Event Description *
          </label>
          <textarea
            id="event-description"
            rows={3}
            placeholder="Comprehensive event details, agenda, and instructions..."
            {...register('description')}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? 'event-description-error' : undefined}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {errors.description && (
            <p id="event-description-error" className="mt-1 text-xs text-rose-400">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* External Registration Link */}
        <div>
          <label
            htmlFor="event-registrationLink"
            className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5"
          >
            External Form URL (Optional)
          </label>
          <Input
            id="event-registrationLink"
            type="url"
            placeholder="https://forms.gle/... (leave blank for native 1-click RSVP)"
            {...register('registrationLink')}
            aria-invalid={Boolean(errors.registrationLink)}
          />
          {errors.registrationLink && (
            <p className="mt-1 text-xs text-rose-400">{errors.registrationLink.message}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Publishing Event...
              </>
            ) : (
              'Publish to Campus'
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
