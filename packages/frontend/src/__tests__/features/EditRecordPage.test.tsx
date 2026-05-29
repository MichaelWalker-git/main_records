import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../../components/Toast';
import { ConfirmProvider } from '../../components/ConfirmDialog';
import { EditRecordPage } from '../../features/records/EditRecordPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockGet = vi.fn();
const mockPut = vi.fn();
const mockPost = vi.fn();
vi.mock('../../services/api', () => ({
  default: {
    get: (...args: any[]) => mockGet(...args),
    post: (...args: any[]) => mockPost(...args),
    put: (...args: any[]) => mockPut(...args),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const baseRecord = {
  id: 'rec-1',
  trackingNumber: 'RMS-20260101-0001',
  title: 'I-95 Corridor Improvement Project Records',
  description: 'Transportation project documentation for I-95 corridor improvements',
  status: 'active',
  seriesTitle: 'Transportation Project Records',
  agencyName: 'DOT',
  mediaType: 'PHYSICAL',
  containerNumber: 'BOX-DOT-2023-0001',
  boxNumber: '0002',
  tags: [],
  createdAt: '2026-01-01T00:00:00Z',
};

function renderPage() {
  mockGet.mockImplementation((url: string) => {
    if (url.includes('/inventory/locations')) return Promise.resolve({ data: { data: [] } });
    return Promise.resolve({ data: { data: baseRecord } });
  });

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ConfirmProvider>
          <MemoryRouter initialEntries={['/records/rec-1/edit']}>
            <Routes>
              <Route path="/records/:id/edit" element={<EditRecordPage />} />
            </Routes>
          </MemoryRouter>
        </ConfirmProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

describe('EditRecordPage - save flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Classification Metadata fieldset with all 8 inputs', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('classification-metadata-fieldset')).toBeInTheDocument();
    });
    expect(screen.getByTestId('edit-contributing-institution')).toBeInTheDocument();
    expect(screen.getByTestId('edit-document-type-dm')).toBeInTheDocument();
    expect(screen.getByTestId('edit-dm-identifier')).toBeInTheDocument();
    expect(screen.getByTestId('edit-exact-creation-date')).toBeInTheDocument();
    expect(screen.getByTestId('edit-doc-language')).toBeInTheDocument();
    expect(screen.getByTestId('edit-doc-location')).toBeInTheDocument();
    expect(screen.getByTestId('edit-keywords')).toBeInTheDocument();
    expect(screen.getByTestId('edit-recommended-citation')).toBeInTheDocument();
  });

  it('submits camelCase keys (axios interceptor handles snake conversion downstream)', async () => {
    mockPut.mockResolvedValueOnce({ data: { data: { ...baseRecord } } });
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('classification-metadata-fieldset')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('edit-doc-location'), { target: { value: 'Augusta, ME' } });
    fireEvent.change(screen.getByTestId('edit-keywords'), { target: { value: 'Maine, WWI, Guard' } });
    fireEvent.change(screen.getByTestId('edit-document-type-dm'), { target: { value: 'Text' } });

    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(mockPut).toHaveBeenCalled());
    const [, payload] = mockPut.mock.calls[0];
    expect(payload.docLocation).toBe('Augusta, ME');
    expect(payload.documentTypeDm).toBe('Text');
    expect(payload.keywords).toEqual(['Maine', 'WWI', 'Guard']);
  });

  it('renders backend validation details inline when save fails with 400', async () => {
    const axiosErr: any = new Error('Request failed with status code 400');
    axiosErr.response = {
      status: 400,
      data: {
        error: 'Validation failed',
        details: [
          { path: 'document_type_dm', message: "Invalid enum value. Expected 'Text'|'Image'|'Audio'|'Video'|'Map'" },
        ],
      },
    };
    mockPut.mockRejectedValueOnce(axiosErr);

    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('classification-metadata-fieldset')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    const banner = screen.getByRole('alert');
    // Critical: the field-level message must reach the user, not just "status code 400"
    expect(banner.textContent).toContain('document_type_dm');
    expect(banner.textContent).not.toContain('status code');
  });

  it('clears the error banner after a successful save retry', async () => {
    // First submit fails with 400, second succeeds. The banner from the
    // first attempt must disappear once the retry lands.
    const axiosErr: any = new Error('Request failed with status code 400');
    axiosErr.response = {
      status: 400,
      data: {
        error: 'Validation failed',
        details: [{ path: 'agency_3', message: 'String must contain at most 50 character(s)' }],
      },
    };
    mockPut.mockRejectedValueOnce(axiosErr);
    mockPut.mockResolvedValueOnce({ data: { data: { ...baseRecord } } });

    renderPage();
    await waitFor(() => expect(screen.getByTestId('classification-metadata-fieldset')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());

    // User fixes the input and resubmits
    fireEvent.change(screen.getByTestId('edit-doc-location'), { target: { value: 'Augusta, ME' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(mockPut).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  });

  it('renders a human-readable error (no "Validation failed —" tech prefix)', async () => {
    const axiosErr: any = new Error('Request failed with status code 400');
    axiosErr.response = {
      status: 400,
      data: {
        error: 'Validation failed',
        details: [
          { path: '', message: "Unrecognized key(s) in object: 'agency3', 'keywords'" },
        ],
      },
    };
    mockPut.mockRejectedValueOnce(axiosErr);

    renderPage();
    await waitFor(() => expect(screen.getByTestId('classification-metadata-fieldset')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    const text = screen.getByRole('alert').textContent || '';
    // User-facing copy: must NOT start with the tech prefix or expose Zod jargon
    expect(text).not.toMatch(/^Validation failed\s*—/);
    expect(text).not.toMatch(/^Validation failed\s*:/);
    expect(text).toContain('Could not save');
    expect(text).not.toContain('Unrecognized key(s) in object');
  });

  it('strips empty keywords and sends an empty array (not [""])', async () => {
    mockPut.mockResolvedValueOnce({ data: { data: { ...baseRecord } } });
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('classification-metadata-fieldset')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('edit-keywords'), { target: { value: ', , ,' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(mockPut).toHaveBeenCalled());
    const [, payload] = mockPut.mock.calls[0];
    expect(payload.keywords).toEqual([]);
  });
});
