import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../../components/Toast';
import { IntegrationsPage } from '../../features/admin/IntegrationsPage';

const mockPost = vi.fn();
vi.mock('../../services/api', () => ({
  default: {
    post: (...args: unknown[]) => mockPost(...args),
  },
}));

vi.mock('../../hooks/useApi', () => ({
  useApiQuery: vi.fn(() => ({
    data: [
      {
        id: 'cognito',
        name: 'Cognito',
        description: 'Auth provider',
        status: 'connected',
        lastSync: null,
        health: { responseTimeMs: 45, uptimePercent: 99.9 },
      },
    ],
  })),
}));

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <MemoryRouter>
          <IntegrationsPage />
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}

describe('IntegrationsPage Test Connection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders integration card with Test Connection button', () => {
    renderPage();
    expect(screen.getByTestId('test-cognito')).toBeInTheDocument();
  });

  it('shows success result after Test Connection click', async () => {
    const user = userEvent.setup();
    mockPost.mockResolvedValue({
      data: {
        data: {
          testResult: 'success',
          message: 'Connection OK — User Pool reachable',
          testedAt: '2026-05-27T12:00:00Z',
        },
      },
    });

    renderPage();
    await user.click(screen.getByTestId('test-cognito'));

    await waitFor(() => {
      expect(screen.getByTestId('test-result-cognito')).toBeInTheDocument();
    });
    const resultBox = screen.getByTestId('test-result-cognito');
    expect(resultBox.textContent).toContain('Connection OK');
    expect(mockPost).toHaveBeenCalledWith('/integrations/cognito/test');
  });

  it('shows failure message when test fails', async () => {
    const user = userEvent.setup();
    mockPost.mockResolvedValue({
      data: {
        data: {
          testResult: 'failure',
          message: 'User Pool not configured',
          testedAt: '2026-05-27T12:00:00Z',
        },
      },
    });

    renderPage();
    await user.click(screen.getByTestId('test-cognito'));

    await waitFor(() => {
      const box = screen.getByTestId('test-result-cognito');
      expect(box.textContent).toContain('User Pool not configured');
    });
  });

  it('handles network errors gracefully', async () => {
    const user = userEvent.setup();
    mockPost.mockRejectedValue(new Error('Network error'));

    renderPage();
    await user.click(screen.getByTestId('test-cognito'));

    await waitFor(() => {
      expect(screen.getByTestId('test-result-cognito')).toBeInTheDocument();
    });
    const box = screen.getByTestId('test-result-cognito');
    expect(box.textContent).toContain('Network error');
  });

  it('disables button while test is in flight', async () => {
    const user = userEvent.setup();
    let resolve: (v: unknown) => void = () => {};
    mockPost.mockImplementation(() => new Promise((r) => { resolve = r; }));

    renderPage();
    const button = screen.getByTestId('test-cognito');
    await user.click(button);

    expect(button).toBeDisabled();
    expect(screen.getByText('Testing...')).toBeInTheDocument();

    resolve({ data: { data: { testResult: 'success', message: 'OK', testedAt: '2026-05-27T12:00:00Z' } } });
    await waitFor(() => expect(button).not.toBeDisabled());
  });
});
