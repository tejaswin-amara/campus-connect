import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Lock, User } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { type LoginFormData, loginSchema } from '../types';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setErrorMessage(null);
      await login(data);
      onSuccess?.();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to sign in. Please verify your credentials.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
          htmlFor="login-username"
          className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5"
        >
          Username
        </label>
        <div className="relative">
          <Input
            id="login-username"
            type="text"
            autoComplete="username"
            placeholder="Enter username"
            {...register('username')}
            aria-invalid={Boolean(errors.username)}
            aria-describedby={errors.username ? 'login-username-error' : undefined}
          />
          <User className="absolute right-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
        </div>
        {errors.username && (
          <p id="login-username-error" className="mt-1 text-xs text-rose-400">
            {errors.username.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="login-password"
          className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5"
        >
          Password
        </label>
        <div className="relative">
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter password"
            {...register('password')}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'login-password-error' : undefined}
          />
          <Lock className="absolute right-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
        </div>
        {errors.password && (
          <p id="login-password-error" className="mt-1 text-xs text-rose-400">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full justify-center py-2.5 mt-2"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Signing In...
          </>
        ) : (
          'Sign In'
        )}
      </Button>

      {onSwitchToRegister && (
        <p className="text-center text-xs text-zinc-400 pt-2">
          New to CampusConnect?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-amber-400 hover:text-amber-300 font-medium underline underline-offset-4 transition-colors"
          >
            Create student account
          </button>
        </p>
      )}
    </form>
  );
}
