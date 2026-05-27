import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Breadcrumbs } from '../../components/Breadcrumbs';

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('Breadcrumbs', () => {
  it('renders all items', () => {
    renderWithRouter(
      <Breadcrumbs
        showHome={false}
        items={[
          { label: 'Records', to: '/records' },
          { label: 'REC-001' },
        ]}
      />
    );
    expect(screen.getByText('Records')).toBeInTheDocument();
    expect(screen.getByText('REC-001')).toBeInTheDocument();
  });

  it('marks last item as current page', () => {
    renderWithRouter(
      <Breadcrumbs
        showHome={false}
        items={[
          { label: 'Records', to: '/records' },
          { label: 'REC-001' },
        ]}
      />
    );
    const lastItem = screen.getByText('REC-001');
    expect(lastItem).toHaveAttribute('aria-current', 'page');
  });

  it('renders home icon when showHome is true', () => {
    const { container } = renderWithRouter(
      <Breadcrumbs items={[{ label: 'Records', to: '/records' }]} />
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders link for non-last items with `to`', () => {
    renderWithRouter(
      <Breadcrumbs
        showHome={false}
        items={[
          { label: 'Records', to: '/records' },
          { label: 'REC-001' },
        ]}
      />
    );
    const link = screen.getByText('Records').closest('a');
    expect(link).toHaveAttribute('href', '/records');
  });

  it('has data-testid', () => {
    renderWithRouter(
      <Breadcrumbs showHome={false} items={[{ label: 'Test' }]} />
    );
    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
  });

  it('home crumb links to "/" by default', () => {
    const { container } = renderWithRouter(
      <Breadcrumbs items={[{ label: 'Records', to: '/records' }]} />
    );
    const homeLink = container.querySelector('a[href="/"]');
    expect(homeLink).not.toBeNull();
  });
});
