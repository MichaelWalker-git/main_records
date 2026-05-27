import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TransmittalDetailPage } from '../../features/transmittals/TransmittalDetailPage';

const mockTransmittal = {
  id: 't-1',
  trackingNumber: 'TRM-2024-001',
  title: 'Q4 2023 DHHS Transfer',
  description: 'Annual records shipment',
  agencyId: 'agency-1',
  agencyName: 'Dept of Health and Human Services',
  status: 'submitted',
  submittedBy: 'user-1',
  submittedByName: 'Jane Smith',
  submittedAt: '2024-01-05T10:00:00Z',
  receivedBy: null,
  receivedByName: null,
  receivedAt: null,
  approvedBy: null,
  approvedByName: null,
  approvedAt: null,
  rejectionReason: null,
  itemCount: 2,
  items: [
    { id: 'i-1', boxNumber: '0001', description: 'Medicaid Files', seriesTitle: 'Eligibility', dateRange: '2023-01 to 2023-12' },
    { id: 'i-2', boxNumber: '0002', description: 'Correspondence', seriesTitle: 'Admin', dateRange: '2023-01 to 2023-06' },
  ],
  createdAt: '2024-01-03T09:00:00Z',
};

vi.mock('../../hooks/useApi', () => ({
  useApiQuery: vi.fn(() => ({
    data: mockTransmittal,
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
      <MemoryRouter initialEntries={['/transmittals/t-1']}>
        <Routes>
          <Route path="/transmittals/:id" element={<TransmittalDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('TransmittalDetailPage', () => {
  it('renders page with transmittal title', () => {
    renderPage();
    expect(screen.getByText('Q4 2023 DHHS Transfer')).toBeInTheDocument();
  });

  it('renders tracking number', () => {
    renderPage();
    expect(screen.getByText('TRM-2024-001')).toBeInTheDocument();
  });

  it('renders transfer summary with sender and destination', () => {
    renderPage();
    expect(screen.getByTestId('transfer-summary')).toBeInTheDocument();
    expect(screen.getAllByText('Dept of Health and Human Services').length).toBeGreaterThan(0);
    expect(screen.getByText('Maine State Archives')).toBeInTheDocument();
  });

  it('renders sender name in multiple places', () => {
    renderPage();
    expect(screen.getAllByText('Jane Smith').length).toBeGreaterThan(0);
  });

  it('renders items table with box data', () => {
    renderPage();
    expect(screen.getByText('Medicaid Files')).toBeInTheDocument();
    expect(screen.getByText('Correspondence')).toBeInTheDocument();
    expect(screen.getByText('0001')).toBeInTheDocument();
  });

  it('renders timeline', () => {
    renderPage();
    expect(screen.getByTestId('transmittal-timeline')).toBeInTheDocument();
  });

  it('renders action buttons for staff on submitted transmittal', () => {
    renderPage();
    expect(screen.getByTestId('receive-transmittal-button')).toBeInTheDocument();
    expect(screen.getByTestId('approve-transmittal-button')).toBeInTheDocument();
    expect(screen.getByTestId('reject-transmittal-button')).toBeInTheDocument();
  });

  it('renders description/notes', () => {
    renderPage();
    expect(screen.getByText('Annual records shipment')).toBeInTheDocument();
  });
});
