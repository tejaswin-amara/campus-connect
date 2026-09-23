import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpen, Hash, Loader2, Lock, Mail, User } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { type RegisterFormData, registerSchema } from '../types';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const { register: registerUser } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      rollNumber: '',
      department: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setErrorMessage(null);
      await registerUser(data);
      onSuccess?.();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Registration failed. Please check your information.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
      {errorMessage && (
        <div
          role="alert"
          className="p-3 text-xs font-medium text-rose-400 bg-rose-950/40 border border-rose-800/60 rounded-xl"
        >
          {errorMessage}
        </div>
      )}

      <div>
        <label
          htmlFor="reg-username"
          className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1"
        >
          Username
        </label>
        <div className="relative">
          <Input
            id="reg-username"
            type="text"
            placeholder="e.g. tejaswin"
            {...register('username')}
            aria-invalid={Boolean(errors.username)}
            aria-describedby={errors.username ? 'reg-username-error' : undefined}
          />
          <User className="absolute right-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
        </div>
        {errors.username && (
          <p id="reg-username-error" className="mt-1 text-xs text-rose-400">
            {errors.username.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="reg-email"
          className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1"
        >
          Institutional Email
        </label>
        <div className="relative">
          <Input
            id="reg-email"
            type="email"
            placeholder="student@klh.edu.in"
            {...register('email')}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'reg-email-error' : undefined}
          />
          <Mail className="absolute right-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
        </div>
        <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">
          Must end with @klh.edu.in or .edu
        </span>
        {errors.email && (
          <p id="reg-email-error" className="mt-1 text-xs text-rose-400">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label
            htmlFor="reg-roll"
            className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1"
          >
            Roll Number
          </label>
          <div className="relative">
            <Input
              id="reg-roll"
              type="text"
              placeholder="2100030101"
              {...register('rollNumber')}
              aria-invalid={Boolean(errors.rollNumber)}
              aria-describedby={errors.rollNumber ? 'reg-roll-error' : undefined}
            />
            <Hash className="absolute right-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
          </div>
          {errors.rollNumber && (
            <p id="reg-roll-error" className="mt-1 text-xs text-rose-400">
              {errors.rollNumber.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="reg-dept"
            className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1"
          >
            Department
          </label>
          <div className="relative">
            <Input
              id="reg-dept"
              type="text"
              placeholder="e.g. CSE"
              {...register('department')}
              aria-invalid={Boolean(errors.department)}
              aria-describedby={errors.department ? 'reg-dept-error' : undefined}
            />
            <BookOpen className="absolute right-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
          </div>
          {errors.department && (
            <p id="reg-dept-error" className="mt-1 text-xs text-rose-400">
              {errors.department.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="reg-password"
          className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1"
        >
          Password
        </label>
        <div className="relative">
          <Input
            id="reg-password"
            type="password"
            placeholder="Min 8 characters"
            {...register('password')}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'reg-password-error' : undefined}
          />
          <Lock className="absolute right-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
        </div>
        {errors.password && (
          <p id="reg-password-error" className="mt-1 text-xs text-rose-400">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full justify-center py-2.5 mt-3"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating Student Account...
          </>
        ) : (
          'Complete Onboarding'
        )}
      </Button>

      {onSwitchToLogin && (
        <p className="text-center text-xs text-zinc-400 pt-1">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-amber-400 hover:text-amber-300 font-medium underline underline-offset-4 transition-colors"
          >
            Sign in here
          </button>
        </p>
      )}
    </form>
  );
}
