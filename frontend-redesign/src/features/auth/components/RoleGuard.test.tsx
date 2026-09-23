import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../../../lib/apiClient';
import { AuthProvider } from '../context/AuthContext';
import { RoleGuard } from './RoleGuard';

vi.mock('../../../lib/apiClient', () => ({
  apiClient: {
    authMe: vi.fn(),
    authLogin: vi.fn(),
    authRegister: vi.fn(),
    authLogout: vi.fn(),
  },
}));

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{ui}</AuthProvider>
    </QueryClientProvider>,
  );
};

describe('RoleGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders authentication required gate when unauthenticated', async () => {
    vi.mocked(apiClient.authMe).mockResolvedValue(null);

    renderWithProviders(
      <RoleGuard requiredRole="ROLE_ORGANIZER">
        <div>Protected Content</div>
      </RoleGuard>,
    );

    expect(await screen.findByText('Authentication Required')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders restricted clearance gate when user has insufficient role', async () => {
    vi.mocked(apiClient.authMe).mockResolvedValue({
      id: 1,
      username: 'student_user',
      email: 'student@klh.edu.in',
      role: 'ROLE_STUDENT',
    });

    renderWithProviders(
      <RoleGuard requiredRole="ROLE_ORGANIZER">
        <div>Organizer Exclusive Area</div>
      </RoleGuard>,
    );

    expect(await screen.findByText('Restricted Clearance')).toBeInTheDocument();
    expect(screen.getByText(/ROLE_STUDENT/)).toBeInTheDocument();
    expect(screen.queryByText('Organizer Exclusive Area')).not.toBeInTheDocument();
  });

  it('renders protected content when user has required role', async () => {
    vi.mocked(apiClient.authMe).mockResolvedValue({
      id: 2,
      username: 'club_lead',
      email: 'lead@campus.edu',
      role: 'ROLE_ORGANIZER',
      clubId: 1,
      clubName: 'ACM Student Chapter',
    });

    renderWithProviders(
      <RoleGuard requiredRole="ROLE_ORGANIZER">
        <div>Organizer Exclusive Area</div>
      </RoleGuard>,
    );

    expect(await screen.findByText('Organizer Exclusive Area')).toBeInTheDocument();
    expect(screen.queryByText('Restricted Clearance')).not.toBeInTheDocument();
  });

  it('renders protected content for admin regardless of required role', async () => {
    vi.mocked(apiClient.authMe).mockResolvedValue({
      id: 99,
      username: 'system_admin',
      email: 'admin@campus.edu',
      role: 'ROLE_ADMIN',
    });

    renderWithProviders(
      <RoleGuard requiredRole="ROLE_ORGANIZER">
        <div>Organizer Content Accessible to Admin</div>
      </RoleGuard>,
    );

    expect(await screen.findByText('Organizer Content Accessible to Admin')).toBeInTheDocument();
  });
});
