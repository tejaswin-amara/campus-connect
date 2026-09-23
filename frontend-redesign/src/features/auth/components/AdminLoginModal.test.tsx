import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../../../lib/apiClient';
import { AdminLoginModal } from './AdminLoginModal';

vi.mock('../../../lib/apiClient', () => ({
  apiClient: {
    login: vi.fn(),
  },
}));

describe('AdminLoginModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal with accessible controls when open', () => {
    render(<AdminLoginModal open={true} onClose={vi.fn()} onSuccess={vi.fn()} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Administrator Authorization')).toBeInTheDocument();
    expect(screen.getByLabelText(/admin identity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/security passkey/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /authenticate & proceed/i })).toBeInTheDocument();
  });

  it('validates required fields using Zod and sets accessible aria attributes', async () => {
    render(<AdminLoginModal open={true} onClose={vi.fn()} onSuccess={vi.fn()} />);

    const usernameInput = screen.getByLabelText(/admin identity/i);
    const passwordInput = screen.getByLabelText(/security passkey/i);
    const submitBtn = screen.getByRole('button', { name: /authenticate & proceed/i });

    // Clear username
    fireEvent.change(usernameInput, { target: { value: '' } });
    fireEvent.change(passwordInput, { target: { value: '' } });
    fireEvent.click(submitBtn);

    // Errors should appear with accessible descriptions
    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    expect(usernameInput).toHaveAttribute('aria-invalid', 'true');
    expect(usernameInput).toHaveAttribute('aria-describedby', 'admin-username-error');
    expect(passwordInput).toHaveAttribute('aria-invalid', 'true');
    expect(passwordInput).toHaveAttribute('aria-describedby', 'admin-password-error');
  });

  it('authenticates successfully and triggers callbacks', async () => {
    const handleSuccess = vi.fn();
    const handleClose = vi.fn();

    vi.mocked(apiClient.login).mockResolvedValueOnce({
      success: true,
      token: 'valid-test-token',
    });

    render(<AdminLoginModal open={true} onClose={handleClose} onSuccess={handleSuccess} />);

    const usernameInput = screen.getByLabelText(/admin identity/i);
    const passwordInput = screen.getByLabelText(/security passkey/i);
    fireEvent.change(usernameInput, { target: { value: 'admin' } });
    fireEvent.change(passwordInput, { target: { value: 'admin' } });

    const submitBtn = screen.getByRole('button', { name: /authenticate & proceed/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(apiClient.login).toHaveBeenCalledWith({ username: 'admin', password: 'admin' });
      expect(handleSuccess).toHaveBeenCalledTimes(1);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  it('displays authentication error message on failure', async () => {
    vi.mocked(apiClient.login).mockRejectedValueOnce(new Error('Invalid admin credentials.'));

    render(<AdminLoginModal open={true} onClose={vi.fn()} onSuccess={vi.fn()} />);

    const usernameInput = screen.getByLabelText(/admin identity/i);
    const passwordInput = screen.getByLabelText(/security passkey/i);
    fireEvent.change(usernameInput, { target: { value: 'admin' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });

    const submitBtn = screen.getByRole('button', { name: /authenticate & proceed/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/invalid admin credentials/i)).toBeInTheDocument();
    });
  });
});
