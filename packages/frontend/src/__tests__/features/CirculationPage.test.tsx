import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CirculationPage } from '../../features/inventory/CirculationPage';

vi.mock('../../hooks/useApi', () => ({
  useApiQuery: vi.fn(() => ({
    data: [
      {
        id: 'ev-1',
        recordId: 'rec-1',
        record_title: 'Medicaid Files Q4',
        userId: 'user-1',
        user_name: 'John Doe',
        purpose: 'Annual audit review',
        checked_out_at: '2024-01-01T10:00:00Z',
        due_date: '2024-01-15T00:00:00Z',
        eventType: 'checkout',
      },
    ],
    isLoading: false,
    refetch: vi.fn(),
  })),
  useApiMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    isAdmin: true,
    isStaff: true,
    user: { email: 'admin@maine.gov' },
  })),
}));

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CirculationPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('CirculationPage', () => {
  it('renders page title and description', () => {
    renderPage();
    expect(screen.getByText('Circulation')).toBeInTheDocument();
    expect(screen.getByText('Temporary check-out and return of physical records')).toBeInTheDocument();
  });

  it('renders explanation cards', () => {
    renderPage();
    expect(screen.getByText('Check Out')).toBeInTheDocument();
    expect(screen.getByText('Return (Check In)')).toBeInTheDocument();
    expect(screen.getByText('Barcode Scan')).toBeInTheDocument();
  });

  it('renders overdue items table with record info', () => {
    renderPage();
    expect(screen.getByText('Medicaid Files Q4')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Annual audit review')).toBeInTheDocument();
  });

  it('renders checkout button', () => {
    renderPage();
    expect(screen.getByTestId('checkout-button')).toBeInTheDocument();
  });

  it('renders checkin button', () => {
    renderPage();
    expect(screen.getByTestId('checkin-button')).toBeInTheDocument();
  });

  it('opens checkout modal on button click', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByTestId('checkout-button'));
    expect(screen.getByTestId('checkout-record-input')).toBeInTheDocument();
    expect(screen.getByTestId('checkout-purpose-input')).toBeInTheDocument();
  });

  it('opens checkin modal on button click', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByTestId('checkin-button'));
    expect(screen.getByTestId('checkin-record-input')).toBeInTheDocument();
  });

  it('shows Scan Barcode link', () => {
    renderPage();
    expect(screen.getByText('Scan Barcode')).toBeInTheDocument();
  });
});
