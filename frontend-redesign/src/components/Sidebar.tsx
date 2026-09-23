import {
  Building2,
  Calendar,
  LayoutDashboard,
  LogIn,
  LogOut,
  Shield,
  Sparkles,
  User,
} from 'lucide-react';
import type React from 'react';
import { useAuth } from '../features/auth/context/AuthContext';
import { cn } from '../lib/utils';

export type WorkspaceView = 'student' | 'organizer' | 'admin';

export interface SidebarProps {
  currentView: WorkspaceView;
  onViewChange: (view: WorkspaceView) => void;
  isOpen: boolean;
  onClose: () => void;
  isAdminAuthenticated?: boolean;
  onRequestAdminLogin?: () => void;
  onAdminLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  isOpen,
  onClose,
  isAdminAuthenticated: propAdminAuth,
  onRequestAdminLogin,
  onAdminLogout,
}) => {
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();

  const isUserAdmin = user?.role === 'ROLE_ADMIN' || Boolean(propAdminAuth);
  const isUserOrganizer = user?.role === 'ROLE_ORGANIZER' || isUserAdmin;

  const handleNav = (targetView: WorkspaceView) => {
    if (targetView === 'student') {
      onViewChange('student');
      onClose();
      return;
    }

    if (targetView === 'organizer') {
      if (!isAuthenticated) {
        openAuthModal('login');
      } else {
        onViewChange('organizer');
      }
      onClose();
      return;
    }

    if (targetView === 'admin') {
      if (isUserAdmin) {
        onViewChange('admin');
      } else if (onRequestAdminLogin) {
        onRequestAdminLogin();
      } else {
        openAuthModal('login');
      }
      onClose();
      return;
    }
  };

  const handleSignOut = async () => {
    if (onAdminLogout) onAdminLogout();
    await logout();
    onViewChange('student');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onClose();
          }}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-border-subtle bg-[#0c0c12]/95 backdrop-blur-heavy p-6 transition-transform duration-300 lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 pb-6 border-b border-border-subtle">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-accent text-black font-extrabold text-lg shadow-glow-cyan">
            CC
          </div>
          <div>
            <h1 className="font-extrabold text-white tracking-tight leading-tight">
              CampusConnect
            </h1>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-status-success tracking-tight tabular-nums">
              <span className="h-1.5 w-1.5 rounded-full bg-status-success animate-pulse" />
              <span>RBAC v5 Active</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav aria-label="Main Navigation" className="mt-6 flex-1 space-y-2">
          {/* Student Discovery */}
          <button
            type="button"
            onClick={() => handleNav('student')}
            className={cn(
              'flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200',
              currentView === 'student'
                ? 'bg-surface-raised text-white border border-border-strong shadow-glow-cyan/20'
                : 'text-slate-400 hover:bg-surface-overlay hover:text-white',
            )}
          >
            <Calendar
              className={cn(
                'h-4 w-4',
                currentView === 'student' ? 'text-brand-primary' : 'text-slate-400',
              )}
            />
            <span>Discover Events</span>
          </button>

          {/* Club Organizer Studio */}
          <button
            type="button"
            onClick={() => handleNav('organizer')}
            className={cn(
              'flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200',
              currentView === 'organizer'
                ? 'bg-surface-raised text-white border border-border-strong shadow-glow-indigo'
                : 'text-slate-400 hover:bg-surface-overlay hover:text-white',
            )}
          >
            <div className="flex items-center gap-3">
              <Building2
                className={cn(
                  'h-4 w-4',
                  currentView === 'organizer' ? 'text-indigo-400' : 'text-slate-400',
                )}
              />
              <span>Club Studio</span>
            </div>
            {!isUserOrganizer && (
              <span className="rounded-md border border-border-subtle bg-surface-base px-1.5 py-0.5 text-[10px] text-zinc-300 font-mono">
                Lead
              </span>
            )}
          </button>

          {/* Admin Console */}
          <button
            type="button"
            onClick={() => handleNav('admin')}
            className={cn(
              'flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200',
              currentView === 'admin'
                ? 'bg-surface-raised text-white border border-border-strong shadow-glow-indigo'
                : 'text-slate-400 hover:bg-surface-overlay hover:text-white',
            )}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard
                className={cn(
                  'h-4 w-4',
                  currentView === 'admin' ? 'text-brand-accent' : 'text-slate-400',
                )}
              />
              <span>Admin Console</span>
            </div>
            {!isUserAdmin && (
              <span className="rounded-md border border-border-subtle bg-surface-base px-1.5 py-0.5 text-[10px] text-zinc-300 font-mono">
                Lock
              </span>
            )}
          </button>
        </nav>

        {/* User / Session Profile Strip */}
        <div className="rounded-2xl border border-border-subtle bg-surface-raised/70 p-4 space-y-3">
          {isAuthenticated && user ? (
            <>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-brand-primary/15 border border-brand-primary/30 flex items-center justify-center text-brand-primary font-bold text-sm uppercase">
                  {user.username.charAt(0)}
                </div>
                <div className="overflow-hidden flex-1">
                  <p className="text-xs font-bold text-white truncate">{user.username}</p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 font-mono tracking-tight tabular-nums truncate">
                    {user.role === 'ROLE_ADMIN' ? (
                      <>
                        <Shield className="h-3 w-3 text-brand-accent shrink-0" />
                        <span>ROLE_ADMIN</span>
                      </>
                    ) : user.role === 'ROLE_ORGANIZER' ? (
                      <>
                        <Building2 className="h-3 w-3 text-indigo-400 shrink-0" />
                        <span>{user.clubName || 'ORGANIZER'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3 text-brand-primary shrink-0" />
                        <span>ROLE_STUDENT</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-border-subtle bg-surface-base py-1.5 text-xs text-slate-300 hover:text-status-danger hover:border-status-danger/40 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Guest Session</p>
                  <p className="text-[10px] text-zinc-400 font-mono">Unauthenticated</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-brand-primary/40 bg-brand-primary/10 py-1.5 text-xs text-brand-primary hover:bg-brand-primary/20 transition-colors font-medium"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Campus Sign In</span>
              </button>
            </>
          )}
        </div>
      </aside>
    </>
  );
};
