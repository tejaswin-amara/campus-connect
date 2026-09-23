import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Calendar, Upload } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/Button';
import { Dialog } from '../../../components/ui/Dialog';
import { Input } from '../../../components/ui/Input';
import type { EventCategory } from '../../../types';
import { useCreateEvent } from '../api/useCreateEvent';
import { type CreateEventFormData, createEventSchema } from '../types';

export interface CreateEventModalProps {
  open: boolean;
  onClose: () => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ open, onClose }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const createMutation = useCreateEvent();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      category: 'Technical',
      title: '',
      venue: '',
      dateTime: '',
      endDateTime: '',
      description: '',
      registrationLink: '',
      maxCapacity: undefined,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setValue('imageUrl', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: CreateEventFormData) => {
    try {
      await createMutation.mutateAsync({
        title: data.title,
        description: data.description,
        category: data.category as EventCategory,
        venue: data.venue,
        dateTime: data.dateTime,
        endDateTime: data.endDateTime || undefined,
        maxCapacity: data.maxCapacity ? Number(data.maxCapacity) : undefined,
        registrationLink: data.registrationLink || undefined,
        imageUrl: imagePreview || undefined,
      });
      reset();
      setImagePreview(null);
      onClose();
    } catch {
      // Error handled in UI
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Create New Campus Event" className="max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
        {/* Title */}
        <div>
          <label
            htmlFor="event-title"
            className="text-xs font-bold uppercase tracking-wider text-slate-300"
          >
            Event Title *
          </label>
          <Input
            id="event-title"
            {...register('title')}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? 'event-title-error' : undefined}
            placeholder="e.g. Autonomous Agents Hackathon 2026"
            className="mt-1"
          />
          {errors.title && (
            <p
              id="event-title-error"
              role="alert"
              className="mt-1 flex items-center gap-1 text-xs text-status-danger"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{errors.title.message}</span>
            </p>
          )}
        </div>

        {/* Category and Venue */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="event-category"
              className="text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              Category *
            </label>
            <select
              id="event-category"
              {...register('category')}
              aria-invalid={Boolean(errors.category)}
              aria-describedby={errors.category ? 'event-category-error' : undefined}
              className="mt-1 flex h-10 w-full rounded-xl border border-border-subtle bg-surface-base px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <option value="Technical">Technical</option>
              <option value="Cultural">Cultural</option>
              <option value="Sports">Sports</option>
              <option value="Workshop">Workshop</option>
              <option value="Seminar">Seminar</option>
            </select>
            {errors.category && (
              <p id="event-category-error" role="alert" className="mt-1 text-xs text-status-danger">
                {errors.category.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="event-venue"
              className="text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              Venue / Location *
            </label>
            <Input
              id="event-venue"
              {...register('venue')}
              aria-invalid={Boolean(errors.venue)}
              aria-describedby={errors.venue ? 'event-venue-error' : undefined}
              placeholder="e.g. Turing Innovation Hall 301"
              className="mt-1"
            />
            {errors.venue && (
              <p
                id="event-venue-error"
                role="alert"
                className="mt-1 flex items-center gap-1 text-xs text-status-danger"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.venue.message}</span>
              </p>
            )}
          </div>
        </div>

        {/* Start and End Date Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="event-datetime"
              className="text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              Start Date & Time *
            </label>
            <Input
              id="event-datetime"
              type="datetime-local"
              {...register('dateTime')}
              aria-invalid={Boolean(errors.dateTime)}
              aria-describedby={errors.dateTime ? 'event-datetime-error' : undefined}
              className="mt-1 text-slate-200"
            />
            {errors.dateTime && (
              <p
                id="event-datetime-error"
                role="alert"
                className="mt-1 flex items-center gap-1 text-xs text-status-danger"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.dateTime.message}</span>
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="event-enddatetime"
              className="text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              End Date & Time
            </label>
            <Input
              id="event-enddatetime"
              type="datetime-local"
              {...register('endDateTime')}
              aria-invalid={Boolean(errors.endDateTime)}
              aria-describedby={errors.endDateTime ? 'event-enddatetime-error' : undefined}
              className="mt-1 text-slate-200"
            />
            {errors.endDateTime && (
              <p
                id="event-enddatetime-error"
                role="alert"
                className="mt-1 flex items-center gap-1 text-xs text-status-danger"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.endDateTime.message}</span>
              </p>
            )}
          </div>
        </div>

        {/* Max Capacity and Registration Link */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="event-capacity"
              className="text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              Maximum Capacity (Seats)
            </label>
            <Input
              id="event-capacity"
              type="number"
              min="1"
              {...register('maxCapacity', { valueAsNumber: true })}
              aria-invalid={Boolean(errors.maxCapacity)}
              aria-describedby={errors.maxCapacity ? 'event-capacity-error' : undefined}
              placeholder="e.g. 150 (Leave blank for unlimited)"
              className="mt-1"
            />
            {errors.maxCapacity && (
              <p
                id="event-capacity-error"
                role="alert"
                className="mt-1 flex items-center gap-1 text-xs text-status-danger"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.maxCapacity.message}</span>
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="event-registration"
              className="text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              Registration URL
            </label>
            <Input
              id="event-registration"
              type="url"
              {...register('registrationLink')}
              aria-invalid={Boolean(errors.registrationLink)}
              aria-describedby={errors.registrationLink ? 'event-registration-error' : undefined}
              placeholder="https://forms.gle/..."
              className="mt-1"
            />
            {errors.registrationLink && (
              <p
                id="event-registration-error"
                role="alert"
                className="mt-1 flex items-center gap-1 text-xs text-status-danger"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.registrationLink.message}</span>
              </p>
            )}
          </div>
        </div>

        {/* Cover Image Upload with Preview */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
            Cover Banner Media (Aspect Ratio 16:9)
          </span>
          <div className="mt-2 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative aspect-video h-28 w-48 overflow-hidden rounded-xl border border-border-subtle bg-surface-base">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Cover preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center text-slate-500">
                  <Calendar className="h-6 w-6" />
                  <span className="text-[10px] mt-1">Aspect 16:9</span>
                </div>
              )}
            </div>

            <label className="flex flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border-strong bg-surface-base/60 p-4 text-center hover:border-brand-primary transition-colors">
              <Upload className="h-5 w-5 text-brand-primary mb-1" />
              <span className="text-xs font-medium text-white">Choose cover image</span>
              <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WebP up to 5MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                aria-label="Upload event cover image"
              />
            </label>
          </div>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="event-description"
            className="text-xs font-bold uppercase tracking-wider text-slate-300"
          >
            Event Description *
          </label>
          <textarea
            id="event-description"
            rows={3}
            {...register('description')}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? 'event-description-error' : undefined}
            placeholder="Detailed overview of syllabus, criteria, speaker lineup, and rules..."
            className="mt-1 w-full rounded-xl border border-border-subtle bg-surface-base p-3 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:border-brand-primary focus-visible:ring-1 focus-visible:ring-brand-primary"
          />
          {errors.description && (
            <p
              id="event-description-error"
              role="alert"
              className="mt-1 flex items-center gap-1 text-xs text-status-danger"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{errors.description.message}</span>
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || createMutation.isPending}
            isLoading={isSubmitting || createMutation.isPending}
          >
            Publish Event Listing
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
