import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../../components/Toast';
import { ConfirmProvider } from '../../components/ConfirmDialog';
import { RecordsListPage } from '../../features/records/RecordsListPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockPost = vi.fn();
const mockDelete = vi.fn();
vi.mock('../../services/api', () => ({
  default: {
    post: (...args: unknown[]) => mockPost(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}));

const mockData = {
  data: [
    {
      id: 'rec-1',
      trackingNumber: 'RMS-1',
      title: 'Test Record A',
      seriesTitle: 'Series A',
      status: 'active',
      aiConfidence: 0.92,
      tags: [],
      createdAt: '2026-01-01',
    },
    {
      id: 'rec-2',
      trackingNumber: 'RMS-2',
      title: 'Test Record B',
      seriesTitle: null,
      status: 'active',
      aiConfidence: null,
      tags: [],
      createdAt: '2026-01-02',
    },
  ],
  total: 2,
  page: 1,
  pageSize: 25,
  totalPages: 1,
};

vi.mock('../../hooks/useApi', () => ({
  usePaginatedQuery: vi.fn(() => ({ data: mockData, isLoading: false })),
  useApiQuery: vi.fn(() => ({ data: { totalRecords: 2 } })),
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    isAdmin: true,
    isStaff: true,
    isOfficer: false,
    user: { email: 'admin@maine.gov' },
  })),
}));

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ConfirmProvider>
          <MemoryRouter>
            <RecordsListPage />
          </MemoryRouter>
        </ConfirmProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

describe('RecordsListPage classify flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders confidence meter for records with AI score', () => {
    renderPage();
    expect(screen.getByText('92%')).toBeInTheDocument();
  });

  it('renders dash for records without AI score', () => {
    renderPage();
    const cells = screen.getAllByText('—');
    expect(cells.length).toBeGreaterThan(0);
  });

  it('shows Classifying indicator and disables button after AI Classify clicked', async () => {
    const user = userEvent.setup();
    mockPost.mockResolvedValue({ data: {} });
    renderPage();

    const classifyButton = screen.getAllByTitle('AI Classify')[0];
    await user.click(classifyButton);

    await waitFor(() => {
      expect(screen.getByText('Classifying...')).toBeInTheDocument();
    });

    const updatedButton = screen.getAllByTitle('Classifying...')[0];
    expect(updatedButton).toBeDisabled();
  });

  it('resets classifying state on API error', async () => {
    const user = userEvent.setup();
    mockPost.mockRejectedValueOnce(new Error('boom'));
    renderPage();

    const classifyButton = screen.getAllByTitle('AI Classify')[0];
    await user.click(classifyButton);

    await waitFor(() => {
      expect(screen.queryByText('Classifying...')).not.toBeInTheDocument();
    });
  });
});
