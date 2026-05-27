import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { TemplatesPage } from '../../features/admin/TemplatesPage';

vi.mock('../../hooks/useApi', () => ({
  useApiQuery: vi.fn(() => ({
    data: [
      {
        id: '1',
        name: 'Physical Box Template',
        description: 'Standard box label',
        fieldDefinitions: [
          { label: 'Container Number', type: 'text', required: true },
          { label: 'Location Code (8-digit)', type: 'text', required: true },
        ],
        isActive: true,
        createdAt: '2026-05-01',
      },
    ],
    isLoading: false,
    refetch: vi.fn(),
  })),
  useApiMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    data: null,
  })),
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    isAuthenticated: true,
    user: { firstName: 'Admin', lastName: 'User' },
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

describe('TemplatesPage', () => {
  it('renders page title', () => {
    renderWithProviders(<TemplatesPage />);
    expect(screen.getByText('Record Templates')).toBeInTheDocument();
  });

  it('displays templates in table', () => {
    renderWithProviders(<TemplatesPage />);
    expect(screen.getByText('Physical Box Template')).toBeInTheDocument();
    expect(screen.getByText('2 fields')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('has create template button', () => {
    renderWithProviders(<TemplatesPage />);
    expect(screen.getByTestId('create-template-button')).toBeInTheDocument();
  });

  it('opens form with Maine fields pre-populated when clicking create', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TemplatesPage />);

    await user.click(screen.getByTestId('create-template-button'));

    expect(screen.getByTestId('template-name-input')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Container Number')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Location Code (8-digit)')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Umbrella Agency')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Record Series')).toBeInTheDocument();
  });

  it('allows adding a new field', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TemplatesPage />);

    await user.click(screen.getByTestId('create-template-button'));
    await user.click(screen.getByTestId('add-field-button'));

    // Should have 8 default + 1 new = 9 fields
    const inputs = screen.getAllByPlaceholderText('Field label');
    expect(inputs.length).toBe(9);
  });

  it('has data-testid on page', () => {
    renderWithProviders(<TemplatesPage />);
    expect(screen.getByTestId('templates-page')).toBeInTheDocument();
  });
});