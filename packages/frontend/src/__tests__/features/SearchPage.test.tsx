import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { SearchPage } from '../../features/search/SearchPage';

vi.mock('../../hooks/useApi', () => ({
  useApiQuery: vi.fn(() => ({ data: null, isLoading: false })),
  useApiMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    data: null,
  })),
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    isAuthenticated: true,
    user: { firstName: 'Test' },
    roles: ['admin'],
    isLoading: false,
  })),
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('SearchPage', () => {
  it('renders page title', () => {
    renderWithProviders(<SearchPage />);
    expect(screen.getByText('Search Records')).toBeInTheDocument();
  });

  it('renders all search tabs', () => {
    renderWithProviders(<SearchPage />);
    expect(screen.getByTestId('search-tab-metadata')).toBeInTheDocument();
    expect(screen.getByTestId('search-tab-fulltext')).toBeInTheDocument();
    expect(screen.getByTestId('search-tab-semantic')).toBeInTheDocument();
    expect(screen.getByTestId('search-tab-ocr')).toBeInTheDocument();
  });

  it('switches active tab on click', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SearchPage />);

    const semanticTab = screen.getByTestId('search-tab-semantic');
    await user.click(semanticTab);

    expect(semanticTab.className).toContain('border-navy-500');
  });

  it('renders filter sidebar', () => {
    renderWithProviders(<SearchPage />);
    expect(screen.getByTestId('search-agency-filter')).toBeInTheDocument();
    expect(screen.getByTestId('search-status-filter')).toBeInTheDocument();
  });

  it('has data-testid on page', () => {
    renderWithProviders(<SearchPage />);
    expect(screen.getByTestId('search-page')).toBeInTheDocument();
  });
});