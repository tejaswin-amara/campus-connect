import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../../../lib/apiClient';
import { AuthProvider } from '../context/AuthContext';
import { AuthModal } from './AuthModal';

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

describe('AuthModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.authMe).mockResolvedValue(null);
  });

  it('renders modal with Sign In and Register tabs when open', () => {
    renderWithProviders(<AuthModal open={true} onClose={vi.fn()} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Campus Portal Sign In')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('switches between Sign In and Student Onboarding tabs', async () => {
    renderWithProviders(<AuthModal open={true} onClose={vi.fn()} />);

    // Click register tab
    const registerTab = screen.getByRole('tab', { name: /create account/i });
    fireEvent.click(registerTab);

    await waitFor(() => {
      expect(screen.getByText('Student Onboarding')).toBeInTheDocument();
      expect(screen.getByLabelText(/institutional email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/roll number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/department/i)).toBeInTheDocument();
    });

    // Switch back to Sign In
    const loginTab = screen.getByRole('tab', { name: /sign in/i });
    fireEvent.click(loginTab);

    await waitFor(() => {
      expect(screen.getByText('Campus Portal Sign In')).toBeInTheDocument();
    });
  });

  it('does not render when open is false', () => {
    renderWithProviders(<AuthModal open={false} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
