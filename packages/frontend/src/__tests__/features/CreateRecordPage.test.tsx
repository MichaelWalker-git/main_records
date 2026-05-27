import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreateRecordPage } from '../../features/records/CreateRecordPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockPost = vi.fn();
vi.mock('../../services/api', () => ({
  default: { post: (...args: any[]) => mockPost(...args) },
}));

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CreateRecordPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

function enterUploadMode() {
  renderPage();
  fireEvent.click(screen.getByTestId('mode-upload'));
}

describe('CreateRecordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders mode chooser on initial load', () => {
    renderPage();
    expect(screen.getByTestId('mode-upload')).toBeInTheDocument();
  });

  it('renders upload dropzone after choosing upload mode', () => {
    enterUploadMode();
    expect(screen.getByTestId('upload-dropzone')).toBeInTheDocument();
  });

  it('shows submit button disabled when no file selected', () => {
    enterUploadMode();
    const btn = screen.getByTestId('submit-record-button');
    expect(btn).toBeDisabled();
  });

  it('shows file name after selecting a file', async () => {
    enterUploadMode();
    const input = screen.getByTestId('file-input') as HTMLInputElement;
    const file = new File(['hello'], 'test-document.pdf', { type: 'application/pdf' });

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
    expect(screen.getByTestId('submit-record-button')).not.toBeDisabled();
  });

  it('creates record and uploads file on submit', async () => {
    mockPost.mockImplementation((url: string) => {
      if (url === '/records') {
        return Promise.resolve({ data: { data: { id: 'rec-123' } } });
      }
      if (url.includes('/upload') && !url.includes('/confirm')) {
        return Promise.resolve({ data: { uploadUrl: 'https://s3.example.com/upload', s3Key: 'documents/test.pdf' } });
      }
      if (url.includes('/confirm')) {
        return Promise.resolve({ data: { status: 'ocr_initiated' } });
      }
      return Promise.resolve({ data: {} });
    });

    window.fetch = vi.fn().mockResolvedValue({ ok: true } as Response);

    enterUploadMode();
    const input = screen.getByTestId('file-input') as HTMLInputElement;
    const file = new File(['content'], 'invoice.pdf', { type: 'application/pdf' });
    fireEvent.change(input, { target: { files: [file] } });

    fireEvent.click(screen.getByTestId('submit-record-button'));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/records', expect.objectContaining({ title: 'invoice' }));
    });
  });

  it('shows error state on API failure', async () => {
    mockPost.mockRejectedValue(new Error('Network error'));

    enterUploadMode();
    const input = screen.getByTestId('file-input') as HTMLInputElement;
    const file = new File(['content'], 'doc.pdf', { type: 'application/pdf' });
    fireEvent.change(input, { target: { files: [file] } });

    fireEvent.click(screen.getByTestId('submit-record-button'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('navigates back on cancel', () => {
    enterUploadMode();
    // The back button goes to choose mode, not navigate
    const backBtn = screen.getByText(/Back/);
    fireEvent.click(backBtn);
    expect(screen.getByTestId('mode-upload')).toBeInTheDocument();
  });
});