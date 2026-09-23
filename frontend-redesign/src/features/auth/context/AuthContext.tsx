import type React from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useCurrentUser } from '../api/useCurrentUser';
import { useLogin } from '../api/useLogin';
import { useLogout } from '../api/useLogout';
import { useRegister } from '../api/useRegister';
import type { AuthUser, LoginFormData, RegisterFormData, UserRole } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginFormData) => Promise<AuthUser>;
  register: (data: RegisterFormData) => Promise<AuthUser>;
  logout: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  isClubLead: (clubId?: number) => boolean;
  isAuthModalOpen: boolean;
  openAuthModal: (defaultTab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  authModalDefaultTab: 'login' | 'register';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user = null, isLoading } = useCurrentUser();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalDefaultTab, setAuthModalDefaultTab] = useState<'login' | 'register'>('login');

  const openAuthModal = useCallback((defaultTab: 'login' | 'register' = 'login') => {
    setAuthModalDefaultTab(defaultTab);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const login = useCallback(
    async (data: LoginFormData): Promise<AuthUser> => {
      const res = await loginMutation.mutateAsync(data);
      closeAuthModal();
      return res;
    },
    [loginMutation, closeAuthModal],
  );

  const register = useCallback(
    async (data: RegisterFormData): Promise<AuthUser> => {
      const res = await registerMutation.mutateAsync(data);
      closeAuthModal();
      return res;
    },
    [registerMutation, closeAuthModal],
  );

  const logout = useCallback(async (): Promise<void> => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const hasRole = useCallback(
    (role: UserRole): boolean => {
      if (!user) return false;
      if (user.role === 'ROLE_ADMIN') return true;
      if (role === 'ROLE_ORGANIZER') {
        return user.role === 'ROLE_ORGANIZER';
      }
      if (role === 'ROLE_STUDENT') {
        return true;
      }
      return false;
    },
    [user],
  );

  const isClubLead = useCallback(
    (clubId?: number): boolean => {
      if (!user) return false;
      if (user.role === 'ROLE_ADMIN') return true;
      if (user.role === 'ROLE_ORGANIZER') {
        if (clubId === undefined) return true;
        return user.clubId === clubId;
      }
      return false;
    },
    [user],
  );

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      hasRole,
      isClubLead,
      isAuthModalOpen,
      openAuthModal,
      closeAuthModal,
      authModalDefaultTab,
    }),
    [
      user,
      isLoading,
      login,
      register,
      logout,
      hasRole,
      isClubLead,
      isAuthModalOpen,
      openAuthModal,
      closeAuthModal,
      authModalDefaultTab,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
