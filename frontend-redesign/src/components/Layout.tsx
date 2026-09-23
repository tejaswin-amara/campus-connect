import { useQueryClient } from '@tanstack/react-query';
import { Building2, Calendar, LogIn, Menu, Shield } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { AdminLoginModal } from '../features/auth/components/AdminLoginModal';
import { AuthModal } from '../features/auth/components/AuthModal';
import { useAuth } from '../features/auth/context/AuthContext';
import { queryKeys } from '../lib/queryKeys';
import { cn } from '../lib/utils';
import { Sidebar, type WorkspaceView } from './Sidebar';

export interface LayoutProps {
  currentView: WorkspaceView;
  onViewChange: (view: WorkspaceView) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentView, onViewChange, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const isOrganizer = user?.role === 'ROLE_ORGANIZER' || user?.role === 'ROLE_ADMIN';
  const isAdmin = user?.role === 'ROLE_ADMIN';

  const handleWorkspaceSwitch = (view: WorkspaceView) => {
    if (view === 'student') {
      onViewChange('student');
      return;
    }

    if (view === 'organizer') {
      if (!isAuthenticated) {
        openAuthModal('login');
      } else {
        onViewChange('organizer');
      }
      return;
    }

    if (view === 'admin') {
      if (isAdmin) {
        onViewChange('admin');
      } else {
        setAdminModalOpen(true);
      }
      return;
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-brand-primary/30">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onViewChange={onViewChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isAdminAuthenticated={isAdmin}
        onRequestAdminLogin={() => setAdminModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header with Workspace Switcher Capsule */}
        <header className="h-16 flex items-center justify-between border-b border-border-subtle bg-surface-base/80 px-4 sm:px-6 md:px-8 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl p-2 text-slate-300 hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className="font-extrabold text-white tracking-tight lg:hidden">
              CampusConnect
            </span>
          </div>

          {/* Center Workspace Switcher Capsule */}
          <div className="hidden sm:flex items-center rounded-2xl bg-[#0c0c12] p-1 border border-zinc-800 shadow-inner">
            <button
              type="button"
              onClick={() => handleWorkspaceSwitch('student')}
              className={cn(
                'flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all',
                currentView === 'student'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-200',
              )}
            >
              <Calendar className="h-3.5 w-3.5 text-brand-primary" />
              <span>Discover</span>
            </button>

            <button
              type="button"
              onClick={() => handleWorkspaceSwitch('organizer')}
              className={cn(
                'flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all',
                currentView === 'organizer'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-200',
              )}
            >
              <Building2 className="h-3.5 w-3.5 text-indigo-400" />
              <span>Club Studio</span>
              {!isOrganizer && (
                <span className="text-[10px] text-zinc-300 font-mono bg-zinc-900 border border-zinc-700/60 px-1.5 py-0.5 rounded">
                  Auth
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleWorkspaceSwitch('admin')}
              className={cn(
                'flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all',
                currentView === 'admin'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-200',
              )}
            >
              <Shield className="h-3.5 w-3.5 text-brand-accent" />
              <span>Admin</span>
              {!isAdmin && (
                <span className="text-[10px] text-zinc-300 font-mono bg-zinc-900 border border-zinc-700/60 px-1.5 py-0.5 rounded">
                  Lock
                </span>
              )}
            </button>
          </div>

          {/* Right Header Status / Auth Button */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-xl text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-white">{user.username}</span>
                <span className="font-mono text-[10px] text-zinc-400 uppercase">
                  {user.role === 'ROLE_ADMIN'
                    ? 'ADMIN'
                    : user.role === 'ROLE_ORGANIZER'
                      ? 'ORGANIZER'
                      : 'STUDENT'}
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-1.5 rounded-xl bg-brand-primary/10 border border-brand-primary/30 px-3 py-1.5 text-xs font-semibold text-brand-primary hover:bg-brand-primary/20 transition-colors"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-7xl w-full mx-auto">{children}</main>
      </div>

      {/* Global Auth Modal for all personas */}
      <AuthModal />

      {/* Admin Quick Authorization Dialog */}
      <AdminLoginModal
        open={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
          onViewChange('admin');
        }}
      />
    </div>
  );
};
