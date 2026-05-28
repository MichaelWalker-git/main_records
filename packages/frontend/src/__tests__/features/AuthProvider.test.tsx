import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider } from '../../features/auth/AuthProvider';
import { useAuth } from '../../hooks/useAuth';

const mockLogin = vi.fn();
vi.mock('../../services/auth', () => ({
  isAuthenticated: () => false,
  login: (...args: unknown[]) => mockLogin(...args),
  getCurrentUser: vi.fn(),
  logout: vi.fn(),
}));

function LoginHarness() {
  const { login } = useAuth();
  const [caught, setCaught] = useState<{ message: string; hasCause: boolean } | null>(null);
  return (
    <div>
      <button
        onClick={async () => {
          try {
            await login('user@example.com', 'wrong');
          } catch (err) {
            const e = err as Error & { cause?: unknown };
            setCaught({ message: e.message, hasCause: e.cause !== undefined });
          }
        }}
      >
        Login
      </button>
      {caught && (
        <>
          <div data-testid="caught">{caught.message}</div>
          <div data-testid="cause-present">{caught.hasCause ? 'yes' : 'no'}</div>
        </>
      )}
    </div>
  );
}

function renderHarness() {
  return render(
    <AuthProvider>
      <LoginHarness />
    </AuthProvider>
  );
}

describe('AuthProvider.login error handling', () => {
  beforeEach(() => {
    mockLogin.mockReset();
  });

  it('surfaces backend `error` field from axios error response', async () => {
    const axiosLikeError = {
      isAxiosError: true,
      response: { data: { error: 'Invalid credentials' }, status: 401 },
      message: 'Request failed with status code 401',
    };
    mockLogin.mockRejectedValue(axiosLikeError);

    const user = userEvent.setup();
    renderHarness();
    await user.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('caught').textContent).toBe('Invalid credentials');
    });
  });

  it('falls back to `message` field when `error` field is absent', async () => {
    mockLogin.mockRejectedValue({
      isAxiosError: true,
      response: { data: { message: 'Account locked' }, status: 403 },
      message: 'Request failed',
    });

    const user = userEvent.setup();
    renderHarness();
    await user.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('caught').textContent).toBe('Account locked');
    });
  });

  it('falls back to axios message when no response body', async () => {
    mockLogin.mockRejectedValue({
      isAxiosError: true,
      message: 'Network Error',
    });

    const user = userEvent.setup();
    renderHarness();
    await user.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('caught').textContent).toBe('Network Error');
    });
  });

  it('preserves the original error on cause', async () => {
    const original = {
      isAxiosError: true,
      response: { data: { error: 'Invalid credentials' }, status: 401 },
      message: 'Request failed',
    };
    mockLogin.mockRejectedValue(original);

    const user = userEvent.setup();
    renderHarness();
    await user.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('cause-present').textContent).toBe('yes');
    });
  });

  it('handles non-axios error gracefully', async () => {
    mockLogin.mockRejectedValue(new Error('boom'));

    const user = userEvent.setup();
    renderHarness();
    await user.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('caught').textContent).toBe('boom');
    });
  });
});
