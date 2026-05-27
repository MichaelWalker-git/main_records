import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardPage } from '../../features/analytics/DashboardPage';

const mockUseApiQuery = vi.fn();
vi.mock('../../hooks/useApi', () => ({
  useApiQuery: (...args: unknown[]) => mockUseApiQuery(...args),
}));

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('DashboardPage Recent Activity', () => {
  it('shows "by system" when an event has no user_email', () => {
    mockUseApiQuery.mockReturnValue({
      data: {
        totalRecords: 1,
        activeRecords: 1,
        pendingTransmittals: 0,
        pendingDispositions: 0,
        overdueCheckouts: 0,
        recentActivity: [
          {
            id: '1',
            action: 'AI_CLASSIFICATION',
            resource_type: 'record',
            user_email: null,
            created_at: '2026-05-27T14:30:00Z',
          },
        ],
        recordsByType: [],
      },
    });

    renderPage();
    expect(screen.getByText('by system')).toBeInTheDocument();
  });

  it('shows "by <email>" when user_email is present', () => {
    mockUseApiQuery.mockReturnValue({
      data: {
        totalRecords: 1,
        activeRecords: 1,
        pendingTransmittals: 0,
        pendingDispositions: 0,
        overdueCheckouts: 0,
        recentActivity: [
          {
            id: '1',
            action: 'OCR_EXTRACTION',
            resource_type: 'record',
            user_email: 'sarah.chen@maine.gov',
            created_at: '2026-05-27T14:30:00Z',
          },
        ],
        recordsByType: [],
      },
    });

    renderPage();
    expect(screen.getByText('by sarah.chen@maine.gov')).toBeInTheDocument();
  });

  it('renders timestamp with both date and time', () => {
    mockUseApiQuery.mockReturnValue({
      data: {
        totalRecords: 1,
        activeRecords: 1,
        pendingTransmittals: 0,
        pendingDispositions: 0,
        overdueCheckouts: 0,
        recentActivity: [
          {
            id: '1',
            action: 'OCR_EXTRACTION',
            resource_type: 'record',
            user_email: 'a@b.gov',
            created_at: '2026-05-27T14:30:00Z',
          },
        ],
        recordsByType: [],
      },
    });

    renderPage();
    // The locale-formatted timestamp must contain a colon separating hours and minutes
    const cells = document.querySelectorAll('.font-mono');
    const text = Array.from(cells).map((c) => c.textContent ?? '').join(' ');
    expect(text).toMatch(/\d{1,2}:\d{2}/);
  });

  it('renders em dash when timestamp is missing', () => {
    mockUseApiQuery.mockReturnValue({
      data: {
        totalRecords: 1,
        activeRecords: 1,
        pendingTransmittals: 0,
        pendingDispositions: 0,
        overdueCheckouts: 0,
        recentActivity: [
          {
            id: '1',
            action: 'OCR_EXTRACTION',
            resource_type: 'record',
            user_email: 'a@b.gov',
            created_at: null,
          },
        ],
        recordsByType: [],
      },
    });

    renderPage();
    const monoCells = document.querySelectorAll('.font-mono');
    const dashCell = Array.from(monoCells).find((c) => (c.textContent ?? '').trim() === '—');
    expect(dashCell).toBeDefined();
  });
});
