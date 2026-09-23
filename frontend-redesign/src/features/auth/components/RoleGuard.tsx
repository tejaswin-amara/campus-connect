import { AlertTriangle, Lock, LogIn } from 'lucide-react';
import type React from 'react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

export interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requireClubLead?: boolean;
  clubId?: number;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  requiredRole,
  requireClubLead = false,
  clubId,
  fallback,
}) => {
  const { user, isLoading, isAuthenticated, hasRole, isClubLead, openAuthModal } = useAuth();

  if (isLoading) {
    return (
      <div className="p-8 space-y-4 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-1/3 rounded-xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  // Not signed in
  if (!isAuthenticated || !user) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <Card className="max-w-md w-full border-zinc-800 bg-surface-base/95 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-5">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2 tracking-tight">
            Authentication Required
          </h2>
          <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
            Please sign in with your institutional credentials to access this workspace.
          </p>
          <Button
            variant="primary"
            className="w-full justify-center gap-2 py-2.5"
            onClick={() => openAuthModal('login')}
          >
            <LogIn className="h-4 w-4" />
            Sign In with Campus ID
          </Button>
        </Card>
      </div>
    );
  }

  // Check role authorization
  let isAuthorized = true;
  if (requiredRole && !hasRole(requiredRole)) {
    isAuthorized = false;
  }

  if (requireClubLead && !isClubLead(clubId)) {
    isAuthorized = false;
  }

  if (!isAuthorized) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <Card className="max-w-md w-full border-rose-900/40 bg-surface-base/95 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-5">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Restricted Clearance</h2>
          <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
            Your authenticated role (
            <span className="text-zinc-200 font-mono text-xs">{user.role}</span>) does not hold
            clearance for this workspace.
          </p>
          <p className="text-xs text-zinc-500 mb-6">
            Signed in as <span className="text-zinc-300 font-medium">{user.username}</span>
            {user.clubName ? ` (${user.clubName})` : ''}
          </p>
          <Button
            variant="outline"
            className="w-full justify-center gap-2 py-2.5"
            onClick={() => openAuthModal('login')}
          >
            Switch Account
          </Button>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
