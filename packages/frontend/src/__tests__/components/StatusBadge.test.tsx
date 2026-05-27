import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusBadge } from '../../components/StatusBadge';

describe('StatusBadge', () => {
  it('renders status text with proper capitalization', () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('converts underscores to spaces', () => {
    render(<StatusBadge status="pending_disposition" />);
    expect(screen.getByText('Pending Disposition')).toBeInTheDocument();
  });

  it('applies green colors for active status', () => {
    render(<StatusBadge status="active" />);
    const badge = screen.getByTestId('status-badge-active');
    expect(badge.className).toContain('bg-green-100');
    expect(badge.className).toContain('text-green-800');
  });

  it('applies red colors for rejected status', () => {
    render(<StatusBadge status="rejected" />);
    const badge = screen.getByTestId('status-badge-rejected');
    expect(badge.className).toContain('bg-red-100');
  });

  it('falls back to slate for unknown status', () => {
    render(<StatusBadge status="unknown_status" />);
    const badge = screen.getByTestId('status-badge-unknown_status');
    expect(badge.className).toContain('bg-slate-100');
  });

  it('renders small variant', () => {
    render(<StatusBadge status="draft" variant="small" />);
    const badge = screen.getByTestId('status-badge-draft');
    expect(badge.className).toContain('text-xs');
  });
});