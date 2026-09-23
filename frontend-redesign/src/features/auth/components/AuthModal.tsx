import { Shield, Sparkles, UserCheck, X } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Aurora } from '../../../components/reactbits/backgrounds/Aurora';
import { SpotlightCard } from '../../../components/reactbits/cards/SpotlightCard';
import { useFocusTrap } from '../../../hooks/useFocusTrap';
import { cn } from '../../../lib/utils';
import { useAuth } from '../context/AuthContext';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export interface AuthModalProps {
  open?: boolean;
  onClose?: () => void;
  defaultTab?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  open: controlledOpen,
  onClose: controlledOnClose,
  defaultTab: controlledDefaultTab,
}) => {
  const { isAuthModalOpen, closeAuthModal, authModalDefaultTab } = useAuth();

  const isOpen = controlledOpen !== undefined ? controlledOpen : isAuthModalOpen;
  const handleClose = controlledOnClose || closeAuthModal;
  const initialTab = controlledDefaultTab || authModalDefaultTab || 'login';

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useFocusTrap(dialogRef, isOpen, handleClose);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';

      const timer = setTimeout(() => {
        if (dialogRef.current) {
          const focusable = dialogRef.current.querySelector<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          );
          if (focusable) {
            focusable.focus();
          }
        }
      }, 50);
      return () => clearTimeout(timer);
    }
    document.body.style.overflow = '';
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
      {/* Backdrop with OLED-dim glass */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-300"
        onClick={handleClose}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleClose();
        }}
        aria-hidden="true"
      />

      {/* Dialog Modal Container */}
      <dialog
        open
        ref={dialogRef}
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        tabIndex={-1}
        className={cn(
          'm-0 border-0 p-0 bg-transparent text-inherit block',
          'relative z-50 w-full max-w-lg overflow-hidden rounded-3xl',
          'border border-white/10 bg-surface-base p-0 shadow-2xl backdrop-blur-2xl focus:outline-none',
        )}
      >
        {/* Subtle Aurora effect in header */}
        <div className="relative h-28 w-full overflow-hidden border-b border-white/10 bg-surface-base">
          <Aurora className="opacity-70" colorStops={['#6366f1', '#06b6d4', '#050508']} />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-base" />

          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 z-20 rounded-full p-2 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Close authentication modal"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="absolute bottom-4 left-6 z-10 flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
              {activeTab === 'login' ? (
                <Shield className="h-5 w-5" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2 id="auth-modal-title" className="text-lg font-bold text-white tracking-tight">
                {activeTab === 'login' ? 'Campus Portal Sign In' : 'Student Onboarding'}
              </h2>
              <p className="text-xs text-zinc-400">
                {activeTab === 'login'
                  ? 'Access student tickets, club studios, and governance'
                  : 'Register with institutional ID for verified RSVP'}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4">
          <div
            className="flex rounded-xl bg-zinc-900/80 p-1 border border-zinc-800"
            role="tablist"
            aria-label="Authentication modes"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'login'}
              aria-controls="auth-tab-login"
              id="tab-login"
              onClick={() => setActiveTab('login')}
              className={cn(
                'flex-1 py-2 text-xs font-semibold rounded-lg transition-all',
                activeTab === 'login'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200',
              )}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'register'}
              aria-controls="auth-tab-register"
              id="tab-register"
              onClick={() => setActiveTab('register')}
              className={cn(
                'flex-1 py-2 text-xs font-semibold rounded-lg transition-all',
                activeTab === 'register'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200',
              )}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          <SpotlightCard
            className="border-zinc-800/80 bg-zinc-950/60 p-5 rounded-2xl"
            spotlightColor="rgba(99, 102, 241, 0.12)"
          >
            {activeTab === 'login' ? (
              <div role="tabpanel" id="auth-tab-login" aria-labelledby="tab-login">
                <LoginForm
                  onSuccess={handleClose}
                  onSwitchToRegister={() => setActiveTab('register')}
                />
              </div>
            ) : (
              <div role="tabpanel" id="auth-tab-register" aria-labelledby="tab-register">
                <RegisterForm
                  onSuccess={handleClose}
                  onSwitchToLogin={() => setActiveTab('login')}
                />
              </div>
            )}
          </SpotlightCard>
        </div>

        {/* Footer info banner */}
        <div className="border-t border-zinc-800/80 bg-zinc-950/40 px-6 py-3 flex items-center justify-between text-[11px] text-zinc-500">
          <span className="flex items-center gap-1.5">
            <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
            Institutional RBAC Security
          </span>
          <span>Role-aware workspace access</span>
        </div>
      </dialog>
    </div>
  );
};
