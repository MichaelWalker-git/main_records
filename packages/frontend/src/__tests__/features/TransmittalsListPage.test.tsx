import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TransmittalsListPage } from '../../features/transmittals/TransmittalsListPage';

vi.mock('../../hooks/useApi', () => ({
  usePaginatedQuery: vi.fn(() => ({
    data: {
      data: [
        {
          id: 't-1',
          title: 'Q4 2023 DHHS Transfer',
          agencyName: 'Dept of Health',
          status: 'submitted',
          submitted_by_name: 'Jane Smith',
          item_count: 3,
          submitted_at: '2024-01-05T10:00:00Z',
        },
        {
          id: 't-2',
          title: 'DOE Annual Records',
          agencyName: 'Dept of Education',
          status: 'approved',
          submitted_by_name: 'Bob Jones',
          item_count: 5,
          submitted_at: '2024-02-01T08:00:00Z',
        },
      ],
      total: 2,
      page: 1,
      pageSize: 25,
      totalPages: 1,
    },
    isLoading: false,
  })),
  useApiQuery: vi.fn(() => ({ data: null, isLoading: false })),
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    isAdmin: true,
    isStaff: true,
    isOfficer: false,
    user: { email: 'admin@maine.gov', agencyName: 'Maine State Archives' },
  })),
}));

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <TransmittalsListPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('TransmittalsListPage', () => {
  it('renders page title', () => {
    renderPage();
    expect(screen.getByText('Transmittals')).toBeInTheDocument();
  });

  it('renders transmittal links', () => {
    renderPage();
    expect(screen.getByTestId('transmittal-link-t-1')).toBeInTheDocument();
    expect(screen.getByTestId('transmittal-link-t-2')).toBeInTheDocument();
  });

  it('shows sender name', () => {
    renderPage();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
  });

  it('shows ownership badge for submitted items when user is staff', () => {
    renderPage();
    expect(screen.getByText('Awaiting your action')).toBeInTheDocument();
  });

  it('does not show ownership badge for approved items', () => {
    renderPage();
    const approvedRow = screen.getByText('DOE Annual Records').closest('tr');
    expect(approvedRow?.textContent).not.toContain('Awaiting');
  });

  it('renders status filter', () => {
    renderPage();
    expect(screen.getByTestId('transmittal-status-filter')).toBeInTheDocument();
  });

  it('renders New Transmittal button', () => {
    renderPage();
    expect(screen.getByTestId('submit-transmittal-button')).toBeInTheDocument();
  });
});
