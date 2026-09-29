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
    setValue,
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

  const handleQuickLogin = async (username: string, password: string) => {
    try {
      setErrorMessage(null);
      setValue('username', username);
      setValue('password', password);
      await login({ username, password });
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

      {/* 1-Click Demo Accounts Quick-Select */}
      <div className="pt-3 border-t border-zinc-800/80 mt-3">
        <p className="text-[11px] font-semibold text-zinc-400 mb-2 uppercase tracking-wider text-center">
          1-Click Demo Logins
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuickLogin('admin', 'admin')}
            disabled={isSubmitting}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 hover:bg-amber-500/10 text-zinc-300 hover:text-white transition-all focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <span className="text-sm mb-0.5" aria-hidden="true">
              👑
            </span>
            <span className="text-[11px] font-medium">Admin</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('organizer', 'organizer')}
            disabled={isSubmitting}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-zinc-300 hover:text-white transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <span className="text-sm mb-0.5" aria-hidden="true">
              🎯
            </span>
            <span className="text-[11px] font-medium">Club Lead</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('tejaswin', 'password')}
            disabled={isSubmitting}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-zinc-300 hover:text-white transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <span className="text-sm mb-0.5" aria-hidden="true">
              🎓
            </span>
            <span className="text-[11px] font-medium">Student</span>
          </button>
        </div>
      </div>

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
