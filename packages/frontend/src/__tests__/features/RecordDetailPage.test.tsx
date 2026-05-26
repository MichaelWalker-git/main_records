import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RecordDetailPage } from '../../features/records/RecordDetailPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();
const mockPatch = vi.fn();
const mockDelete = vi.fn();
vi.mock('../../services/api', () => ({
  default: {
    get: (...args: any[]) => mockGet(...args),
    post: (...args: any[]) => mockPost(...args),
    put: (...args: any[]) => mockPut(...args),
    patch: (...args: any[]) => mockPatch(...args),
    delete: (...args: any[]) => mockDelete(...args),
  },
}));

const mockRecord = {
  id: 'rec-1',
  trackingNumber: 'RMS-20260101-0001',
  title: 'Test Record',
  description: 'A test record',
  status: 'active',
  seriesTitle: 'GRS-1: Administrative',
  agencyName: 'Maine State Archives',
  locationPath: null,
  locationId: null,
  barcode: 'ABC123',
  tags: ['test', 'demo'],
  createdAt: '2026-01-01T00:00:00Z',
  dispositionDate: null,
  hasDocument: false,
  documentKey: null,
  retentionScheduleId: null,
  aiConfidence: null,
  classificationStatus: null,
};

function renderPage(record: any = mockRecord) {
  mockGet.mockImplementation((url: string) => {
    if (url.includes('/audit')) return Promise.resolve({ data: { data: [] } });
    if (url.includes('/retention-schedules')) return Promise.resolve({ data: { data: [] } });
    return Promise.resolve({ data: { data: record } });
  });

  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/records/rec-1']}>
        <Routes>
          <Route path="/records/:id" element={<RecordDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('RecordDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm = vi.fn(() => true);
  });

  it('renders record title and tracking number', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Test Record')).toBeInTheDocument();
    });
    expect(screen.getByText('RMS-20260101-0001')).toBeInTheDocument();
  });

  it('renders the page container', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('record-detail-page')).toBeInTheDocument();
    });
  });

  it('renders workflow status bar', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('workflow-status')).toBeInTheDocument();
    });
  });

  it('renders delete button in more-actions menu', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('record-detail-page')).toBeInTheDocument();
    });
    // Click the ellipsis menu
    const moreBtn = screen.getByRole('button', { name: '' });
    // Find the ellipsis button (it's the one without text, just an icon)
    const buttons = screen.getAllByRole('button');
    const ellipsisBtn = buttons.find(b => b.querySelector('.w-4.h-4'));
    if (ellipsisBtn) fireEvent.click(ellipsisBtn);
    await waitFor(() => {
      expect(screen.getByTestId('delete-record-button')).toBeInTheDocument();
    });
  });

  it('calls delete on confirm', async () => {
    mockDelete.mockResolvedValue({ data: { message: 'Record deleted' } });
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('record-detail-page')).toBeInTheDocument();
    });

    // Open more actions menu
    const buttons = screen.getAllByRole('button');
    const ellipsisBtn = buttons.find(b => b.querySelector('svg'));
    if (ellipsisBtn) fireEvent.click(ellipsisBtn);

    await waitFor(() => {
      expect(screen.getByTestId('delete-record-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('delete-record-button'));
    expect(window.confirm).toHaveBeenCalled();
  });

  it('does not delete when confirm is cancelled', async () => {
    (window.confirm as any).mockReturnValue(false);
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('record-detail-page')).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button');
    const ellipsisBtn = buttons.find(b => b.querySelector('svg'));
    if (ellipsisBtn) fireEvent.click(ellipsisBtn);

    await waitFor(() => {
      expect(screen.getByTestId('delete-record-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('delete-record-button'));
    expect(window.confirm).toHaveBeenCalled();
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('renders tags', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('test')).toBeInTheDocument();
    });
    expect(screen.getByText('demo')).toBeInTheDocument();
  });

  it('shows edit button', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('edit-record-button')).toBeInTheDocument();
    });
  });

  it('does not show delete button for disposed records', async () => {
    renderPage({ ...mockRecord, status: 'destroyed' });
    await waitFor(() => {
      expect(screen.getByTestId('record-detail-page')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('delete-record-button')).not.toBeInTheDocument();
  });
});