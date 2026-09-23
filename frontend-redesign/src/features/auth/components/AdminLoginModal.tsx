import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, KeyRound, Shield, User } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/Button';
import { Dialog } from '../../../components/ui/Dialog';
import { Input } from '../../../components/ui/Input';
import { apiClient } from '../../../lib/apiClient';
import { type AdminLoginFormData, adminLoginSchema } from '../types';

export interface AdminLoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ open, onClose, onSuccess }) => {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: 'admin',
      password: '',
    },
  });

  useEffect(() => {
    if (open) {
      setError(null);
      reset({ username: 'admin', password: '' });
    }
  }, [open, reset]);

  const onSubmit = async (data: AdminLoginFormData) => {
    setError(null);

    try {
      const res = await apiClient.login({ username: data.username, password: data.password });
      if (res.success) {
        reset();
        onSuccess();
        onClose();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Authentication server error. Try again.');
      }
    }
  };

  const handleClose = () => {
    setError(null);
    reset({ username: 'admin', password: '' });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Administrator Authorization"
      className="max-w-md"
    >
      <div className="flex items-center gap-3 pb-3 border-b border-border-subtle text-slate-300 text-xs">
        <Shield className="h-5 w-5 text-brand-accent shrink-0" />
        <span>Elevated access required to mutate campus events and control room capacity.</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
        {error && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-xl border border-status-danger/30 bg-status-danger/10 p-3 text-xs text-status-danger"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label
            htmlFor="admin-username"
            className="text-xs font-bold uppercase tracking-wider text-slate-300"
          >
            Admin Identity
          </label>
          <div className="relative mt-1">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              id="admin-username"
              {...register('username')}
              aria-invalid={Boolean(errors.username)}
              aria-describedby={errors.username ? 'admin-username-error' : undefined}
              placeholder="Username"
              className="pl-9"
            />
          </div>
          {errors.username && (
            <p
              id="admin-username-error"
              className="mt-1 flex items-center gap-1 text-xs text-status-danger"
              role="alert"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{errors.username.message}</span>
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="admin-password"
            className="text-xs font-bold uppercase tracking-wider text-slate-300"
          >
            Security Passkey
          </label>
          <div className="relative mt-1">
            <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              id="admin-password"
              type="password"
              {...register('password')}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'admin-password-error' : undefined}
              placeholder="Admin secret"
              className="pl-9"
            />
          </div>
          {errors.password && (
            <p
              id="admin-password-error"
              className="mt-1 flex items-center gap-1 text-xs text-status-danger"
              role="alert"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{errors.password.message}</span>
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="accent"
            size="sm"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Authenticate & Proceed
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
