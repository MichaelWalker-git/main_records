import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from '../../layouts/Sidebar';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({ roles: ['admin', 'staff', 'records_officer'] })),
}));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Sidebar />
    </MemoryRouter>
  );
}

describe('Sidebar active highlighting', () => {
  it('highlights only Retention on /admin/retention-schedules (not Administration)', () => {
    renderAt('/admin/retention-schedules');

    const retention = screen.getByTestId('nav-retention');
    const administration = screen.getByTestId('nav-administration');

    expect(retention).toHaveAttribute('aria-current', 'page');
    expect(administration).not.toHaveAttribute('aria-current');
  });

  it('highlights Administration on /admin/users', () => {
    renderAt('/admin/users');

    const administration = screen.getByTestId('nav-administration');
    expect(administration).toHaveAttribute('aria-current', 'page');
  });

  it('highlights Administration on exact /admin', () => {
    renderAt('/admin');

    const administration = screen.getByTestId('nav-administration');
    expect(administration).toHaveAttribute('aria-current', 'page');
  });

  it('highlights Dashboard only on / (not on every page)', () => {
    renderAt('/records');

    const dashboard = screen.getByTestId('nav-dashboard');
    expect(dashboard).not.toHaveAttribute('aria-current');
  });

  it('highlights Records on /records', () => {
    renderAt('/records');

    const records = screen.getByTestId('nav-records');
    expect(records).toHaveAttribute('aria-current', 'page');
  });

  it('highlights Records on /records/:id detail page', () => {
    renderAt('/records/abc-123');

    const records = screen.getByTestId('nav-records');
    expect(records).toHaveAttribute('aria-current', 'page');
  });

  it('highlights only Circulation on /inventory/circulation (not Inventory)', () => {
    renderAt('/inventory/circulation');

    expect(screen.getByTestId('nav-circulation')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByTestId('nav-inventory')).not.toHaveAttribute('aria-current');
  });

  it('highlights Inventory on /inventory exact', () => {
    renderAt('/inventory');

    expect(screen.getByTestId('nav-inventory')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByTestId('nav-circulation')).not.toHaveAttribute('aria-current');
  });

  it('highlights only Inventory on /inventory/scan (a non-circulation child path)', () => {
    renderAt('/inventory/scan');

    expect(screen.getByTestId('nav-inventory')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByTestId('nav-circulation')).not.toHaveAttribute('aria-current');
  });

  it('highlights only Reports on /analytics/reports (not Analytics)', () => {
    renderAt('/analytics/reports');

    expect(screen.getByTestId('nav-reports')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByTestId('nav-analytics')).not.toHaveAttribute('aria-current');
  });
});
