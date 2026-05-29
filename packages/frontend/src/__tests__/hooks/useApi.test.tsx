import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Hoisted mock for the api module so the hook under test sees our spy.
const mockPut = vi.fn();
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: (...args: any[]) => mockPut(...args),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { useApiMutation } from '../../hooks/useApi';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useApiMutation - error surfacing', () => {
  beforeEach(() => {
    mockPut.mockReset();
  });

  it('surfaces validation details from a backend 400 instead of the generic axios message', async () => {
    // Mirror what axios throws for a structured 400 response from the backend.
    const axiosErr: any = new Error('Request failed with status code 400');
    axiosErr.response = {
      status: 400,
      data: {
        error: 'Validation failed',
        details: [
          { path: 'document_type_dm', message: 'Invalid enum value' },
          { path: 'keywords', message: 'Array must contain at most 50 element(s)' },
        ],
      },
    };
    mockPut.mockRejectedValueOnce(axiosErr);

    const onError = vi.fn();
    const { result } = renderHook(
      () => useApiMutation<unknown, unknown>('/records/1', 'put', { onError }),
      { wrapper }
    );

    await act(async () => {
      result.current.mutate({});
    });

    await waitFor(() => expect(onError).toHaveBeenCalled());
    const passed = onError.mock.calls[0][0] as Error & { details?: any[]; status?: number };
    expect(passed.message).toContain('Validation failed');
    expect(passed.message).toContain('document_type_dm: Invalid enum value');
    expect(passed.message).toContain('keywords: Array must contain at most 50');
    expect(passed.status).toBe(400);
    expect(passed.details).toHaveLength(2);
  });

  it('falls back to backend "error" string when no details array is present', async () => {
    const axiosErr: any = new Error('Request failed with status code 409');
    axiosErr.response = {
      status: 409,
      data: { error: 'Record has an active legal hold and cannot be modified' },
    };
    mockPut.mockRejectedValueOnce(axiosErr);

    const onError = vi.fn();
    const { result } = renderHook(
      () => useApiMutation<unknown, unknown>('/records/1', 'put', { onError }),
      { wrapper }
    );

    await act(async () => {
      result.current.mutate({});
    });

    await waitFor(() => expect(onError).toHaveBeenCalled());
    const passed = onError.mock.calls[0][0] as Error;
    expect(passed.message).toBe('Record has an active legal hold and cannot be modified');
  });

  it('passes through the original axios error when there is no response body to extract', async () => {
    const networkErr: any = new Error('Network Error');
    mockPut.mockRejectedValueOnce(networkErr);

    const onError = vi.fn();
    const { result } = renderHook(
      () => useApiMutation<unknown, unknown>('/records/1', 'put', { onError }),
      { wrapper }
    );

    await act(async () => {
      result.current.mutate({});
    });

    await waitFor(() => expect(onError).toHaveBeenCalled());
    expect(onError.mock.calls[0][0].message).toBe('Network Error');
  });
});
